import crypto from 'crypto';

export const EMBEDDING_DIMENSIONS = 1536;

const rawProvider = process.env.EMBEDDING_PROVIDER;
const PROVIDER = (
  rawProvider ||
  (process.env.VOYAGE_API_KEY ? 'voyage' : process.env.OPENAI_API_KEY ? 'openai' : 'local')
).toLowerCase();
const MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

async function embedWithOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'EMBEDDING_PROVIDER=openai but OPENAI_API_KEY is not set. Set it in .env, or set EMBEDDING_PROVIDER=local for a dependency-free dev fallback.'
    );
  }
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model: MODEL, input: texts }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenAI embeddings request failed (${res.status}): ${body}`);
  }
  const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

async function embedWithVoyage(texts: string[], maxRetries = 4): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) {
    throw new Error('EMBEDDING_PROVIDER=voyage but VOYAGE_API_KEY is not set.');
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch('https://api.voyageai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: process.env.VOYAGE_MODEL || 'voyage-large-2', input: texts }),
    });

    if (res.status === 429 && attempt < maxRetries) {
      // Voyage free tier limits to 3 RPM without payment card. Wait 21s so rate limit window resets.
      const waitMs = 21000;
      console.warn(
        `[Voyage AI] Rate limit (429) encountered. Waiting ${waitMs / 1000}s before retry (attempt ${attempt + 1}/${maxRetries})...`
      );
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Voyage embeddings request failed (${res.status}): ${body}`);
    }

    const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
    return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  }

  throw new Error('Voyage embeddings request failed: exceeded max retries.');
}

/** Deterministic hash-based pseudo-embedding. Same input always yields the
 * same vector, and vectors are L2-normalized so cosine similarity is at
 * least well-defined — but the vectors carry no real semantic content. */
function embedLocal(texts: string[]): number[][] {
  return texts.map((text) => {
    const vec = new Array(EMBEDDING_DIMENSIONS).fill(0);
    const words = text.toLowerCase().split(/\W+/).filter(Boolean);
    for (const word of words) {
      const hash = crypto.createHash('sha256').update(word).digest();
      for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
        // Spread hash bytes across the vector deterministically.
        const byte = hash[i % hash.length];
        vec[i] += (byte / 255) * 2 - 1;
      }
    }
    const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vec.map((v) => v / norm);
  });
}

/** Batch-embed multiple texts in one call (preferred for ingestion). */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const provider = PROVIDER;
  switch (provider) {
    case 'openai':
      return embedWithOpenAI(texts);
    case 'voyage':
      return embedWithVoyage(texts);
    case 'local':
      return embedLocal(texts);
    default:
      throw new Error(`Unknown EMBEDDING_PROVIDER "${provider}". Use "openai", "voyage", or "local".`);
  }
}

/** Embed a single query string (retrieval hot path). */
export async function embedText(text: string): Promise<number[]> {
  const [vec] = await embedTexts([text]);
  return vec;
}

/** Formats a JS number array as the literal pgvector expects in raw SQL:
 * "[0.1,0.2,...]"::vector */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}