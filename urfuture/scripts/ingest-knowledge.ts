import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { prisma } from '../src/lib/db';
import { embedTexts, toVectorLiteral } from '../src/lib/embeddings';
import type { KnowledgeCategory } from '@prisma/client';

const VALID_CATEGORIES = ['CAREER_OUTLOOK', 'ACADEMIC_SYLLABUS', 'SCHOLARSHIP', 'LABOR_STAT'];

interface ParsedDoc {
  title: string;
  source: string;
  category: string;
  url?: string;
  publishedAt?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

const CHARS_PER_TOKEN = 4;
const TARGET_CHUNK_CHARS = 650 * CHARS_PER_TOKEN; 
const OVERLAP_CHARS = 100 * CHARS_PER_TOKEN;

function chunkText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer.trim()) chunks.push(buffer.trim());
    buffer = '';
  };

  for (const para of paragraphs) {
    if (para.length > TARGET_CHUNK_CHARS) {
      flush();
      // Hard-wrap an oversized paragraph with overlap.
      let start = 0;
      while (start < para.length) {
        const end = Math.min(start + TARGET_CHUNK_CHARS, para.length);
        chunks.push(para.slice(start, end).trim());
        if (end >= para.length) break;
        start = end - OVERLAP_CHARS;
      }
      continue;
    }
    if (buffer.length + para.length + 2 > TARGET_CHUNK_CHARS) {
      flush();
      // Carry a small tail of the previous chunk forward for continuity.
      const prevTail = chunks[chunks.length - 1]?.slice(-OVERLAP_CHARS) ?? '';
      buffer = prevTail ? `${prevTail}\n\n${para}` : para;
    } else {
      buffer = buffer ? `${buffer}\n\n${para}` : para;
    }
  }
  flush();
  return chunks;
}

// ---------------------------------------------------------------------------
// File parsers
// ---------------------------------------------------------------------------
function parseFrontMatter(raw: string): { attrs: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { attrs: {}, body: raw };
  const attrs: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (kv) attrs[kv[1]] = kv[2].trim();
  }
  return { attrs, body: match[2] };
}

function deriveFromFilename(filePath: string): { source: string; category: string; title: string } {
  const base = path.basename(filePath).replace(path.extname(filePath), '');
  const parts = base.split('__');
  const source = (parts[0] || base).toUpperCase();
  const category = VALID_CATEGORIES.includes((parts[1] || '').toUpperCase())
    ? parts[1].toUpperCase()
    : 'CAREER_OUTLOOK';
  const title = (parts[2] || base).replace(/[_-]/g, ' ');
  return { source, category, title };
}

async function parseMarkdown(filePath: string): Promise<ParsedDoc> {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { attrs, body } = parseFrontMatter(raw);
  const fallback = deriveFromFilename(filePath);
  const category = (attrs.category || fallback.category).toUpperCase();
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`${filePath}: invalid category "${category}". Must be one of ${VALID_CATEGORIES.join(', ')}`);
  }
  return {
    title: attrs.title || fallback.title,
    source: attrs.source || fallback.source,
    category,
    url: attrs.url,
    publishedAt: attrs.publishedAt,
    content: body.trim(),
  };
}

async function parseJson(filePath: string): Promise<ParsedDoc[]> {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const entries = Array.isArray(raw) ? raw : [raw];
  return entries.map((e, i) => {
    const category = String(e.category || 'CAREER_OUTLOOK').toUpperCase();
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error(`${filePath}[${i}]: invalid category "${category}"`);
    }
    const content = typeof e.content === 'string' ? e.content : JSON.stringify(e.content ?? e, null, 2);
    return {
      title: e.title || `${path.basename(filePath)} #${i}`,
      source: e.source || `${path.basename(filePath, '.json').toUpperCase()}_${i}`,
      category,
      url: e.url,
      publishedAt: e.publishedAt,
      content,
      metadata: e.metadata,
    };
  });
}

async function parsePdf(filePath: string): Promise<ParsedDoc> {
  let pdfParse: (buf: Buffer) => Promise<{ text: string }>;
  try {
    // Dynamic import: pdf-parse is an optional dependency for ingestion
    // only, not needed by the running Next.js app.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    pdfParse = (await import('pdf-parse')).default as unknown as (buf: Buffer) => Promise<{ text: string }>;
  } catch {
    throw new Error(
      `pdf-parse is not installed. Run "npm install pdf-parse" to ingest PDF sources, or convert ${filePath} to Markdown/JSON.`
    );
  }
  const buf = fs.readFileSync(filePath);
  const { text } = await pdfParse(buf);

  const metaPath = filePath + '.meta.json';
  const meta = fs.existsSync(metaPath) ? JSON.parse(fs.readFileSync(metaPath, 'utf-8')) : {};
  const fallback = deriveFromFilename(filePath);
  const category = String(meta.category || fallback.category).toUpperCase();
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error(`${filePath}: invalid category "${category}"`);
  }
  return {
    title: meta.title || fallback.title,
    source: meta.source || fallback.source,
    category,
    url: meta.url,
    publishedAt: meta.publishedAt,
    content: text,
  };
}

async function loadDocuments(dir: string): Promise<ParsedDoc[]> {
  const files: string[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(md|markdown|json|pdf)$/i.test(entry.name) && !entry.name.endsWith('.meta.json')) {
        files.push(full);
      }
    }
  };
  walk(dir);

  const docs: ParsedDoc[] = [];
  for (const file of files) {
    try {
      if (/\.(md|markdown)$/i.test(file)) docs.push(await parseMarkdown(file));
      else if (/\.json$/i.test(file)) docs.push(...(await parseJson(file)));
      else if (/\.pdf$/i.test(file)) docs.push(await parsePdf(file));
    } catch (err) {
      console.error(`✗ Failed to parse ${file}:`, err instanceof Error ? err.message : err);
    }
  }
  return docs;
}

// ---------------------------------------------------------------------------
// Upsert
// ---------------------------------------------------------------------------
async function upsertDocument(doc: ParsedDoc, dryRun: boolean) {
  const chunks = chunkText(doc.content);
  if (chunks.length === 0) {
    console.warn(`  (skipping "${doc.title}" — no content after parsing)`);
    return;
  }

  if (dryRun) {
    console.log(`  [dry-run] would upsert "${doc.title}" (${doc.source}, ${doc.category}) — ${chunks.length} chunks`);
    return;
  }

  const existing = await prisma.knowledgeDocument.findFirst({ where: { source: doc.source } });

  const document = existing
    ? await prisma.knowledgeDocument.update({
        where: { id: existing.id },
        data: {
          title: doc.title,
          category: doc.category as KnowledgeCategory,
          url: doc.url,
          publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
        },
      })
    : await prisma.knowledgeDocument.create({
        data: {
          title: doc.title,
          source: doc.source,
          category: doc.category as KnowledgeCategory,
          url: doc.url,
          publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
        },
      });

  if (existing) {
    // Idempotent re-index: drop old chunks/embeddings for this document and
    // regenerate, rather than trying to diff chunk-by-chunk.
    await prisma.knowledgeChunk.deleteMany({ where: { documentId: document.id } });
  }

  const embeddings = await embedTexts(chunks);

  // Prisma's generated client has no `embedding` field (vector isn't a
  // native Prisma type), so chunk rows are inserted with raw SQL to set it
  // directly. Batched to avoid an enormous single statement.
  const BATCH = 20;
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batchChunks = chunks.slice(i, i + BATCH);
    const batchEmbeddings = embeddings.slice(i, i + BATCH);
    await prisma.$transaction(
      batchChunks.map((content, j) =>
        prisma.$executeRawUnsafe(
          `INSERT INTO "KnowledgeChunk" (id, "documentId", content, "chunkIndex", metadata, embedding, "createdAt")
           VALUES ($1, $2, $3, $4, $5::jsonb, $6::vector, now())`,
          crypto.randomUUID(),
          document.id,
          content,
          i + j,
          JSON.stringify(doc.metadata ?? {}),
          toVectorLiteral(batchEmbeddings[j])
        )
      )
    );
  }

  console.log(`  ✓ "${doc.title}" (${doc.source}, ${doc.category}) — ${chunks.length} chunks embedded`);
}

async function main() {
  const args = process.argv.slice(2);
  const dirArg = args.find((a) => a.startsWith('--dir'));
  const dir = dirArg?.includes('=') ? dirArg.split('=')[1] : args[args.indexOf('--dir') + 1] || 'data/knowledge';
  const dryRun = args.includes('--dry-run');

  const resolvedDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(resolvedDir)) {
    console.error(`Directory not found: ${resolvedDir}`);
    console.error('Create it (e.g. data/knowledge/) and add .md / .json / .pdf source documents, then re-run.');
    process.exit(1);
  }

  console.log(`Scanning ${resolvedDir} ...`);
  const docs = await loadDocuments(resolvedDir);
  console.log(`Found ${docs.length} document(s).\n`);

  for (const doc of docs) {
    await upsertDocument(doc, dryRun);
  }

  if (!dryRun) {
    // ivfflat indexes are built from a data sample at CREATE INDEX time;
    // after the first large ingest, rebuilding gives a more representative
    // sample. Cheap no-op on an already-good index.
    await prisma.$executeRawUnsafe(`REINDEX INDEX CONCURRENTLY "knowledge_chunk_embedding_idx"`).catch((err) => {
      console.warn('Reindex skipped (non-fatal):', err instanceof Error ? err.message : err);
    });
  }

  console.log(`\nDone. ${dryRun ? '(dry run — nothing written)' : ''}`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});