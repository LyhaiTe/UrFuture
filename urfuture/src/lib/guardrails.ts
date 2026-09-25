import { HIGH_STAKES_KEYWORDS, type Citation } from '@/types';
import { prisma } from '@/lib/db';
import type { RetrievedChunk } from '@/lib/rag';


export function containsHighStakesSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return HIGH_STAKES_KEYWORDS.some((k) => lower.includes(k));
}

export async function flagForCounselorReview(opts: {
  studentId: string;
  careerRecommendationId?: string;
  reason: string;
  counselorNotes?: string;
}) {
  return prisma.counselorReview.create({
    data: {
      studentId: opts.studentId,
      careerRecommendationId: opts.careerRecommendationId,
      reason: opts.reason,
      status: 'PENDING',
      counselorNotes: opts.counselorNotes,
    },
  });
}

export function estimateGroundedness(rationale: string, citationCount: number): number {
  const wordCount = rationale.trim().split(/\s+/).length;
  if (wordCount < 15) return citationCount > 0 ? 1 : 1;
  if (citationCount === 0) return 0;
  const expected = Math.max(1, Math.ceil(wordCount / 40));
  return Math.min(1, citationCount / expected);
}

/**
 * RAG-aware groundedness auditor: cross-examines each of the model's
 * self-reported citations against the KnowledgeChunks actually retrieved
 * for this request, rather than just counting citations. A citation only
 * "counts" if it plausibly traces back to a retrieved chunk (matched by
 * source id, or the chunk's document title appearing in the citation's
 * reference/source text) — this catches the model citing a source that
 * sounds right but wasn't actually in its context window.
 *
 * Falls back to the plain word-count heuristic (estimateGroundedness) when
 * no chunks were retrieved for the request (e.g. the query fell back to
 * seeded CareerPath rows only, or retrieval returned nothing above
 * threshold), so routes that haven't been wired to RAG yet — or that hit a
 * knowledge-base gap — keep working exactly as before.
 */
export function estimateGroundednessAgainstChunks(
  rationale: string,
  citations: Citation[],
  retrievedChunks: RetrievedChunk[]
): number {
  if (retrievedChunks.length === 0) {
    return estimateGroundedness(rationale, citations.length);
  }

  const wordCount = rationale.trim().split(/\s+/).length;
  if (wordCount < 15) return 1; // too short to plausibly contain unsupported claims

  if (citations.length === 0) return 0;

  const knownSources = new Set(retrievedChunks.map((c) => c.source.toLowerCase()));
  const knownTitles = retrievedChunks.map((c) => c.title.toLowerCase());

  const verifiedCount = citations.filter((c) => {
    const sourceLower = c.source.toLowerCase();
    const referenceLower = c.reference.toLowerCase();
    if (knownSources.has(sourceLower)) return true;
    return knownTitles.some((title) => referenceLower.includes(title) || sourceLower.includes(title));
  }).length;

  const expected = Math.max(1, Math.ceil(wordCount / 40));
  // Verified citations count fully; unverified ones (cited something not in
  // the retrieved context) count for nothing — they don't get partial
  // credit just for existing.
  return Math.min(1, verifiedCount / expected);
}