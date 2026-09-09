import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { runToolCall, ANALYZE_SKILL_GAP_TOOL } from '@/lib/claude';
import { BASE_SYSTEM_PROMPT, SKILL_GAP_FUNCTION_INSTRUCTIONS } from '@/lib/prompts';
import { getCareerContext, getStudentSkillContext, formatCareerContextForPrompt, formatStudentSkillsForPrompt } from '@/lib/knowledgeBase';
import { flagForCounselorReview, estimateGroundedness } from '@/lib/guardrails';
import type { SkillGapAnalysisResult } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  careerTitle: z.string().optional(), // if omitted, ranks across all seeded careers
});

/**
 * POST /api/career/recommend
 * Runs skill-gap analysis for one career (or all seeded careers if none
 * specified), persists a CareerRecommendation row per career, and opens a
 * CounselorReview when the model (or our keyword pre-filter) flags a
 * high-stakes transition.
 */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { userId, careerTitle } = parsed.data;

  const [careers, studentSkills] = await Promise.all([
    getCareerContext(careerTitle),
    getStudentSkillContext(userId),
  ]);

  if (careers.length === 0) {
    return NextResponse.json({ error: 'No matching career paths found in the knowledge base.' }, { status: 404 });
  }

  const careerContext = formatCareerContextForPrompt(careers);
  const skillContext = formatStudentSkillsForPrompt(studentSkills);

  const results: SkillGapAnalysisResult[] = [];

  for (const career of careers) {
    const userMessage = `STUDENT SKILL PROFILE:\n${skillContext}\n\nCANDIDATE CAREER(S) FROM KNOWLEDGE BASE:\n${careerContext}\n\nAnalyze the student's fit specifically for: "${career.title}". Call analyze_skill_gap with your result.`;

    const result = await runToolCall<SkillGapAnalysisResult>({
      system: `${BASE_SYSTEM_PROMPT}\n\n${SKILL_GAP_FUNCTION_INSTRUCTIONS}`,
      userMessage,
      tool: ANALYZE_SKILL_GAP_TOOL,
    });

    // Server-side groundedness cross-check, independent of the model's own
    // self-reported groundednessScore.
    const measuredGroundedness = estimateGroundedness(result.rationale, result.citations.length);
    if (measuredGroundedness < 0.9) {
      result.requiresCounselorReview = true;
      result.reviewReason = (result.reviewReason ? result.reviewReason + '; ' : '') +
        `Automated groundedness check scored ${(measuredGroundedness * 100).toFixed(0)}% (< 90% threshold) — needs human verification before being shown as final.`;
    }

    const saved = await prisma.careerRecommendation.create({
      data: {
        userId,
        careerPathId: career.id,
        fitScore: result.fitScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        rationale: result.rationale,
        citations: result.citations,
        requiresReview: result.requiresCounselorReview,
      },
    });

    if (result.requiresCounselorReview) {
      await flagForCounselorReview({
        studentId: userId,
        careerRecommendationId: saved.id,
        reason: result.reviewReason ?? 'Flagged by model as high-stakes recommendation.',
      });
    }

    results.push(result);
  }

  results.sort((a, b) => b.fitScore - a.fitScore);
  return NextResponse.json({ recommendations: results });
}
