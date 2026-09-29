import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import {
  runToolCall,
  ANALYZE_SKILL_GAP_TOOL,
} from '@/lib/llm';
import {
  skillGapAnalysisSchema,
  InvalidAIResponseError,
} from '@/lib/aiValidation';
import {
  BASE_SYSTEM_PROMPT,
  SKILL_GAP_FUNCTION_INSTRUCTIONS,
} from '@/lib/prompts';
import {
  getCareerContext,
  getStudentSkillContext,
  formatCareerContextForPrompt,
  formatStudentSkillsForPrompt,
} from '@/lib/knowledgeBase';
import {
  flagForCounselorReview,
  estimateGroundednessAgainstChunks,
} from '@/lib/guardrails';
import { retrieveRelevantContext } from '@/lib/rag';
import type { SkillGapAnalysisResult } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  careerTitle: z.string().optional(),
});

/**
 * POST /api/career/recommend
 *
 * Runs skill-gap analysis for one career, or all seeded careers if no
 * career is specified.
 *
 * AI output is runtime-validated before groundedness checking,
 * persistence, counselor-review creation, or display.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { userId, careerTitle } = parsed.data;

    const [careers, studentSkills] = await Promise.all([
      getCareerContext(careerTitle),
      getStudentSkillContext(userId),
    ]);

    if (careers.length === 0) {
      return NextResponse.json(
        {
          error:
            'No matching career paths found in the knowledge base.',
        },
        { status: 404 },
      );
    }

    const careerContext =
      formatCareerContextForPrompt(careers);

    const skillContext =
      formatStudentSkillsForPrompt(studentSkills);

    const results: SkillGapAnalysisResult[] = [];

    for (const career of careers) {
      const {
        contextText: ragContext,
        chunks: ragChunks,
      } = await retrieveRelevantContext(
        `${career.title} salary outlook demand Cambodia`,
        {
          category: 'LABOR_STAT',
        },
      );

      const laborStatBlock = ragContext
        ? `\n\nREAL LABOR-MARKET DATA (NEA/ILOSTAT, cite by SOURCE shown):\n${ragContext}`
        : '';

      const userMessage =
        `STUDENT SKILL PROFILE:\n${skillContext}` +
        `\n\nCANDIDATE CAREER(S) FROM KNOWLEDGE BASE:\n${careerContext}` +
        `${laborStatBlock}` +
        `\n\nAnalyze the student's fit specifically for: "${career.title}". ` +
        'Call analyze_skill_gap with your result.';

      const result =
        await runToolCall<SkillGapAnalysisResult>({
          system:
            `${BASE_SYSTEM_PROMPT}\n\n` +
            SKILL_GAP_FUNCTION_INSTRUCTIONS,
          userMessage,
          tool: ANALYZE_SKILL_GAP_TOOL,

          // Runtime validation happens before anything below
          // can use or persist the provider response.
          schema: skillGapAnalysisSchema,
          validationLabel: 'career recommendation',
        });

      // Independent server-side citation/groundedness check.
      const measuredGroundedness =
        estimateGroundednessAgainstChunks(
          result.rationale,
          result.citations,
          ragChunks,
        );

      if (measuredGroundedness < 0.9) {
        result.requiresCounselorReview = true;

        result.reviewReason =
          (result.reviewReason
            ? `${result.reviewReason}; `
            : '') +
          `Automated groundedness check scored ${(
            measuredGroundedness * 100
          ).toFixed(
            0,
          )}% (< 90% threshold) — needs human verification before being shown as final.`;
      }

      // result has already passed skillGapAnalysisSchema here.
      const saved =
        await prisma.careerRecommendation.create({
          data: {
            userId,
            careerPathId: career.id,
            fitScore: result.fitScore,
            matchedSkills:
              result.matchedSkills as unknown as Prisma.InputJsonValue,
            missingSkills:
              result.missingSkills as unknown as Prisma.InputJsonValue,
            rationale: result.rationale,
            citations:
              result.citations as unknown as Prisma.InputJsonValue,
            requiresReview:
              result.requiresCounselorReview,
          },
        });

      if (result.requiresCounselorReview) {
        await flagForCounselorReview({
          studentId: userId,
          careerRecommendationId: saved.id,
          reason:
            result.reviewReason ??
            'Flagged by model as high-stakes recommendation.',
        });
      }

      results.push(result);
    }

    results.sort(
      (a, b) => b.fitScore - a.fitScore,
    );

    return NextResponse.json({
      recommendations: results,
    });
  } catch (error) {
    if (error instanceof InvalidAIResponseError) {
      console.error(
        'Career recommendation AI validation failed:',
        error.issues,
      );

      return NextResponse.json(
        {
          error:
            'The AI returned an invalid career recommendation. Please try again.',
        },
        { status: 502 },
      );
    }

    console.error(
      'Career recommendation failed:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Career recommendation is temporarily unavailable. Please try again.',
      },
      { status: 500 },
    );
  }
}