import { HIGH_STAKES_KEYWORDS } from '@/types';
import { prisma } from '@/lib/db';

/** Cheap keyword pre-filter, run before/alongside the model's own
 * requiresCounselorReview flag. Belt-and-suspenders: we don't rely on the
 * model alone to catch every high-stakes transition. */
export function containsHighStakesSignal(text: string): boolean {
  const lower = text.toLowerCase();
  return HIGH_STAKES_KEYWORDS.some((k) => lower.includes(k));
}

export async function flagForCounselorReview(opts: {
  studentId: string;
  careerRecommendationId?: string;
  reason: string;
}) {
  return prisma.counselorReview.create({
    data: {
      studentId: opts.studentId,
      careerRecommendationId: opts.careerRecommendationId,
      reason: opts.reason,
      status: 'PENDING',
    },
  });
}

/** Very small groundedness auditor: checks the citations array is non-empty
 * whenever the rationale text is long enough to plausibly contain factual
 * claims. This is a prototype-level heuristic, not the full evaluation
 * pipeline described in Activity 5 of the workbook (which calls for human
 * spot-checks against verifiable sources). */
export function estimateGroundedness(rationale: string, citationCount: number): number {
  const wordCount = rationale.trim().split(/\s+/).length;
  if (wordCount < 15) return citationCount > 0 ? 1 : 1; // too short to likely contain unsupported claims
  if (citationCount === 0) return 0;
  // Rough heuristic: expect ~1 citation per 40 words of substantive claims.
  const expected = Math.max(1, Math.ceil(wordCount / 40));
  return Math.min(1, citationCount / expected);
}
