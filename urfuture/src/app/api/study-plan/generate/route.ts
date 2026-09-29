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
import { getAuthenticatedStudent } from '@/lib/studentSession';

export const runtime = 'nodejs';

const bodySchema = z.object({
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
 * the authenticated student's identified skill gaps.
 *
 * AI output is runtime-validated before citations are
 * merged, data is persisted, or the plan is displayed.
 */
export async function POST(req: NextRequest) {
  try {
    /*
     * ------------------------------------------------------------
     * Authenticate student
     * ------------------------------------------------------------
     */

    const student =
      await getAuthenticatedStudent(req);

    if (!student) {
      return NextResponse.json(
        {
          error: 'Unauthenticated',
        },
        {
          status: 401,
        },
      );
    }

    const userId = student.id;

    /*
     * ------------------------------------------------------------
     * Validate request
     * ------------------------------------------------------------
     */

    const body = await req.json();

    const parsed =
      bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const {
      targetSkillNames,
      weeksRequested,
    } = parsed.data;

    /*
     * ------------------------------------------------------------
     * Load authenticated student's skills
     * ------------------------------------------------------------
     */

    const skills =
      await getStudentSkillContext(
        userId,
      );

    const skillContext =
      formatStudentSkillsForPrompt(
        skills,
      );

    /*
     * ------------------------------------------------------------
     * Retrieve grounded curriculum context
     * ------------------------------------------------------------
     */

    const {
      contextText:
        syllabusContext,

      citations:
        syllabusCitations,
    } =
      await retrieveRelevantContextForMany(
        targetSkillNames,
        {
          category:
            'ACADEMIC_SYLLABUS',
        },
      );

    const syllabusBlock =
      syllabusContext
        ? `\n\nRELEVANT CURRICULUM / COURSE MATERIAL ` +
          `(cite by SOURCE shown; note any resource you can't ` +
          `ground this way as a general study strategy instead):\n` +
          syllabusContext
        : '';

    const requestedWeeks =
      weeksRequested ?? 6;

    /*
     * ------------------------------------------------------------
     * Build AI prompt
     * ------------------------------------------------------------
     */

    const userMessage =
      `STUDENT SKILL PROFILE:\n${skillContext}` +
      `\n\nTarget skills to close gaps on: ` +
      `${targetSkillNames.join(', ')}.` +
      `\nPreferred plan length: ${requestedWeeks} weeks.` +
      `${syllabusBlock}` +
      `\nCall generate_study_plan with your result.`;

    /*
     * ------------------------------------------------------------
     * Generate + runtime validate AI response
     * ------------------------------------------------------------
     */

    const result =
      await runToolCall<StudyPlanResult>({
        system:
          `${BASE_SYSTEM_PROMPT}\n\n` +
          STUDY_PLAN_FUNCTION_INSTRUCTIONS,

        userMessage,

        tool:
          GENERATE_STUDY_PLAN_TOOL,

        /*
         * Reject malformed plans before
         * persistence or display.
         */
        schema:
          studyPlanSchema,

        validationLabel:
          'study plan',
      });

    /*
     * ------------------------------------------------------------
     * Validate requested plan length
     * ------------------------------------------------------------
     *
     * The API supports 2-12 weeks.
     * Require the provider to honor the exact requested
     * plan length.
     */

    if (
      result.weeks.length !==
      requestedWeeks
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
     * ------------------------------------------------------------
     * Validate requested target skills
     * ------------------------------------------------------------
     */

    const normalizedRequestedSkills =
      new Set(
        targetSkillNames.map(
          (skill) =>
            skill
              .trim()
              .toLowerCase(),
        ),
      );

    const normalizedReturnedSkills =
      new Set(
        result.targetSkills.map(
          (skill) =>
            skill
              .trim()
              .toLowerCase(),
        ),
      );

    const missingTargetSkills =
      [
        ...normalizedRequestedSkills,
      ].filter(
        (skill) =>
          !normalizedReturnedSkills.has(
            skill,
          ),
      );

    if (
      missingTargetSkills.length >
      0
    ) {
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
     * ------------------------------------------------------------
     * Merge validated citations
     * ------------------------------------------------------------
     *
     * Provider citations have passed citationSchema.
     * Retrieval citations come from the trusted RAG layer.
     */

    const mergedCitations = [
      ...result.citations,
      ...syllabusCitations,
    ];

    /*
     * ------------------------------------------------------------
     * Persist validated study plan
     * ------------------------------------------------------------
     *
     * Nothing reaches persistence until all validation
     * above has succeeded.
     */

    const saved =
      await prisma.studyPlan.create({
        data: {
          userId,

          title:
            result.title,

          targetSkillIds:
            result.targetSkills,

          weeks:
            result.weeks as unknown as Prisma.InputJsonValue,

          citations:
            mergedCitations as unknown as Prisma.InputJsonValue,

          status:
            'DRAFT',
        },
      });

    /*
     * ------------------------------------------------------------
     * Return validated study plan
     * ------------------------------------------------------------
     */

    return NextResponse.json({
      studyPlan: {
        ...result,

        citations:
          mergedCitations,

        id:
          saved.id,
      },
    });
  } catch (error) {
    /*
     * Invalid provider output receives a safe
     * validation error and is never persisted.
     */
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