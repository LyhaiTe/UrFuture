import { prisma } from '@/lib/db';
import { embedText, embedTexts, toVectorLiteral } from '@/lib/embeddings';
import type { GroundingCitation } from '@/types';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  source: string;
  title: string;
  content: string;
  similarity: number;
  metadata: Record<string, unknown>;
}

export interface RetrievalOptions {
  /** Max chunks to return. Defaults to RAG_TOP_K env var, else 5. */
  limit?: number;
  /** Minimum cosine similarity to keep a chunk. Defaults to
   * RAG_SIMILARITY_THRESHOLD env var, else 0.72. */
  threshold?: number;
  /** Restrict to one KnowledgeDocument category, e.g. "CAREER_OUTLOOK". */
  category?: string;
}

const DEFAULT_TOP_K = Number(process.env.RAG_TOP_K ?? 5);
const DEFAULT_THRESHOLD = Number(process.env.RAG_SIMILARITY_THRESHOLD ?? 0.72);

interface RawChunkRow {
  id: string;
  documentId: string;
  content: string;
  metadata: unknown;
  similarity: number;
  title: string;
  source: string;
}

type RetrievalResult = {
  contextText: string;
  citations: GroundingCitation[];
  chunks: RetrievedChunk[];
};

function emptyRetrievalResult(): RetrievalResult {
  return { contextText: '', citations: [], chunks: [] };
}

async function retrieveWithEmbedding(
  queryEmbedding: number[],
  options?: RetrievalOptions
): Promise<RetrievalResult> {
  const limit = options?.limit ?? DEFAULT_TOP_K;
  const threshold = options?.threshold ?? DEFAULT_THRESHOLD;

  try {
    const vectorLiteral = toVectorLiteral(queryEmbedding);
    const categoryClause = options?.category ? `AND d.category = $3::"KnowledgeCategory"` : '';

    const rows = await prisma.$queryRawUnsafe<RawChunkRow[]>(
      `
      SELECT
        c.id,
        c."documentId",
        c.content,
        c.metadata,
        d.title,
        d.source,
        1 - (c.embedding <=> $1::vector) AS similarity
      FROM "KnowledgeChunk" c
      JOIN "KnowledgeDocument" d ON d.id = c."documentId"
      WHERE c.embedding IS NOT NULL
      ${categoryClause}
      ORDER BY c.embedding <=> $1::vector ASC
      LIMIT $2
      `,
      vectorLiteral,
      limit,
      ...(options?.category ? [options.category] : [])
    );

    const chunks: RetrievedChunk[] = rows
      .filter((r) => r.similarity >= threshold)
      .map((r) => ({
        id: r.id,
        documentId: r.documentId,
        source: r.source,
        title: r.title,
        content: r.content,
        similarity: r.similarity,
        metadata: (r.metadata as Record<string, unknown>) ?? {},
      }));

    return {
      contextText: formatChunksForPrompt(chunks),
      citations: chunks.map((c) => ({
        source: c.source,
        reference: `${c.title} (chunk ${c.id})`,
        claim: c.content.slice(0, 160).trim() + (c.content.length > 160 ? '…' : ''),
      })),
      chunks,
    };
  } catch (err) {
    console.warn('[rag] Context retrieval failed, continuing without RAG:', err instanceof Error ? err.message : err);
    return emptyRetrievalResult();
  }
}

/**
 * Core retrieval primitive for the RAG pipeline. Embeds `query`, runs a
 * pgvector cosine-distance search over KnowledgeChunk (optionally filtered
 * by KnowledgeDocument.category), and returns both the raw chunks and a
 * prompt-ready context block + citation array.
 *
 * Cosine distance in pgvector (`<=>`) ranges 0 (identical) to 2 (opposite);
 * `1 - distance` converts that to a similarity score in roughly [-1, 1],
 * matching the "1 - (embedding <=> $1) AS similarity" convention used
 * throughout the RAG spec.
 */
export async function retrieveRelevantContext(
  query: string,
  options?: RetrievalOptions
): Promise<{ contextText: string; citations: GroundingCitation[]; chunks: RetrievedChunk[] }> {
  if (!query.trim()) {
    return emptyRetrievalResult();
  }

  try {
    const queryEmbedding = await embedText(query);
    return retrieveWithEmbedding(queryEmbedding, options);
  } catch (err) {
    console.warn('[rag] Context retrieval failed, continuing without RAG:', err instanceof Error ? err.message : err);
    return emptyRetrievalResult();
  }
}

/** Formats retrieved chunks into a compact, citation-friendly block to
 * inject into a Claude system/user prompt — mirrors the shape
 * formatCareerContextForPrompt() already produces from seeded rows, so the
 * model sees one consistent grounding format regardless of source. */
export function formatChunksForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return '';
  return chunks
    .map(
      (c, i) =>
        `[${i + 1}] SOURCE: ${c.source} — "${c.title}" (similarity ${c.similarity.toFixed(2)})\n${c.content.trim()}`
    )
    .join('\n\n');
}

/** Convenience wrapper: retrieve context for each of several queries
 * (e.g. one per target skill in the study-plan route) and merge/dedupe by
 * chunk id, keeping the highest similarity score seen for each chunk. */
export async function retrieveRelevantContextForMany(
  queries: string[],
  options?: RetrievalOptions
): Promise<{ contextText: string; citations: GroundingCitation[]; chunks: RetrievedChunk[] }> {
  const uniqueQueries = [...new Set(queries.map((query) => query.trim()).filter(Boolean))];
  if (uniqueQueries.length === 0) return emptyRetrievalResult();

  let queryEmbeddings: number[][];
  try {
    queryEmbeddings = await embedTexts(uniqueQueries);
  } catch (err) {
    console.warn('[rag] Context retrieval failed, continuing without RAG:', err instanceof Error ? err.message : err);
    return emptyRetrievalResult();
  }

  const results = await Promise.all(
    queryEmbeddings.map((embedding) => retrieveWithEmbedding(embedding, options))
  );
  const byId = new Map<string, RetrievedChunk>();
  for (const r of results) {
    for (const chunk of r.chunks) {
      const existing = byId.get(chunk.id);
      if (!existing || chunk.similarity > existing.similarity) byId.set(chunk.id, chunk);
    }
  }
  const chunks = Array.from(byId.values()).sort((a, b) => b.similarity - a.similarity);
  const contextText = formatChunksForPrompt(chunks);
  const citations: GroundingCitation[] = chunks.map((c) => ({
    source: c.source,
    reference: `${c.title} (chunk ${c.id})`,
    claim: c.content.slice(0, 160).trim() + (c.content.length > 160 ? '…' : ''),
  }));
  return { contextText, citations, chunks };
}