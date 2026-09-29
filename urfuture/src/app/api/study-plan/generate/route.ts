import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import {
  runToolCall,
  GENERATE_STUDY_PLAN_TOOL,
} from '@/lib/llm';
import {
  studyPlanSchema,
  InvalidAIResponseError,
} from '@/lib/aiValidation';
import {
  BASE_SYSTEM_PROMPT,
  STUDY_PLAN_FUNCTION_INSTRUCTIONS,
} from '@/lib/prompts';
import {
  getStudentSkillContext,
  formatStudentSkillsForPrompt,
} from '@/lib/knowledgeBase';
import { retrieveRelevantContextForMany } from '@/lib/rag';
import type { StudyPlanResult } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  targetSkillNames: z
    .array(z.string().trim().min(1))
    .min(1),
  weeksRequested: z
    .number()
    .int()
    .min(2)
    .max(12)
    .optional(),
});

/**
 * POST /api/study-plan/generate
 *
 * Produces a personalized multi-week plan targeting
 * the student's identified skill gaps.
 *
 * AI output is runtime-validated before citations are
 * merged, data is persisted, or the plan is displayed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const {
      userId,
      targetSkillNames,
      weeksRequested,
    } = parsed.data;

    const skills =
      await getStudentSkillContext(userId);

    const skillContext =
      formatStudentSkillsForPrompt(skills);

    const {
      contextText: syllabusContext,
      citations: syllabusCitations,
    } = await retrieveRelevantContextForMany(
      targetSkillNames,
      {
        category: 'ACADEMIC_SYLLABUS',
      },
    );

    const syllabusBlock = syllabusContext
      ? `\n\nRELEVANT CURRICULUM / COURSE MATERIAL ` +
        `(cite by SOURCE shown; note any resource you can't ` +
        `ground this way as a general study strategy instead):\n` +
        syllabusContext
      : '';

    const requestedWeeks =
      weeksRequested ?? 6;

    const userMessage =
      `STUDENT SKILL PROFILE:\n${skillContext}` +
      `\n\nTarget skills to close gaps on: ` +
      `${targetSkillNames.join(', ')}.` +
      `\nPreferred plan length: ${requestedWeeks} weeks.` +
      `${syllabusBlock}` +
      `\nCall generate_study_plan with your result.`;

    const result =
      await runToolCall<StudyPlanResult>({
        system:
          `${BASE_SYSTEM_PROMPT}\n\n` +
          STUDY_PLAN_FUNCTION_INSTRUCTIONS,
        userMessage,
        tool: GENERATE_STUDY_PLAN_TOOL,

        // Reject malformed plans before
        // persistence or display.
        schema: studyPlanSchema,
        validationLabel: 'study plan',
      });

    /*
     * The API supports 2-12 weeks.
     * In addition to the schema's overall 2-12 limit,
     * require the provider to honor the exact requested
     * plan length.
     */
    if (
      result.weeks.length !== requestedWeeks
    ) {
      console.error(
        '[ai-validation] Study plan returned incorrect number of weeks',
        {
          requestedWeeks,
          receivedWeeks:
            result.weeks.length,
        },
      );

      return NextResponse.json(
        {
          error:
            'The AI returned a study plan with an invalid number of weeks. Please try again.',
        },
        {
          status: 502,
        },
      );
    }

    /*
     * Make sure the generated plan still targets
     * the requested skill gaps.
     */
    const normalizedRequestedSkills =
      new Set(
        targetSkillNames.map((skill) =>
          skill.trim().toLowerCase(),
        ),
      );

    const normalizedReturnedSkills =
      new Set(
        result.targetSkills.map((skill) =>
          skill.trim().toLowerCase(),
        ),
      );

    const missingTargetSkills =
      [...normalizedRequestedSkills].filter(
        (skill) =>
          !normalizedReturnedSkills.has(skill),
      );

    if (missingTargetSkills.length > 0) {
      console.error(
        '[ai-validation] Study plan omitted requested target skills',
        {
          missingTargetSkills,
        },
      );

      return NextResponse.json(
        {
          error:
            'The AI returned a study plan that did not cover all requested skill gaps. Please try again.',
        },
        {
          status: 502,
        },
      );
    }

    /*
     * The provider citations have already passed
     * citationSchema. Retrieval citations come from
     * the trusted RAG layer.
     */
    const mergedCitations = [
      ...result.citations,
      ...syllabusCitations,
    ];

    // Nothing reaches persistence until all validation
    // above has succeeded.
    const saved =
      await prisma.studyPlan.create({
        data: {
          userId,
          title: result.title,
          targetSkillIds:
            result.targetSkills,
          weeks:
            result.weeks as unknown as Prisma.InputJsonValue,
          citations:
            mergedCitations as unknown as Prisma.InputJsonValue,
          status: 'DRAFT',
        },
      });

    return NextResponse.json({
      studyPlan: {
        ...result,
        citations: mergedCitations,
        id: saved.id,
      },
    });
  } catch (error) {
    if (
      error instanceof
      InvalidAIResponseError
    ) {
      console.error(
        'Study plan AI validation failed:',
        error.issues,
      );

      return NextResponse.json(
        {
          error:
            'The AI returned an invalid study plan. Please try again.',
        },
        {
          status: 502,
        },
      );
    }

    console.error(
      'Study plan generation failed:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Study plan generation is temporarily unavailable. Please try again.',
      },
      {
        status: 500,
      },
    );
  }
}