import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import {
  runToolCall,
  ANALYZE_JOB_FIT_TOOL,
} from '@/lib/llm';
import {
  jobFitSchema,
  InvalidAIResponseError,
} from '@/lib/aiValidation';
import {
  BASE_SYSTEM_PROMPT,
  JOB_FIT_FUNCTION_INSTRUCTIONS,
} from '@/lib/prompts';
import {
  getStudentSkillContext,
  formatStudentSkillsForPrompt,
} from '@/lib/knowledgeBase';
import type { JobFitResult } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  jobTitle: z.string().trim().min(1),
  jobDescription: z.string().trim().min(20),
});

/**
 * POST /api/job/match
 *
 * Compares a student's known skills against a pasted job description.
 *
 * The AI response is runtime-validated before normalization,
 * persistence, or display.
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

    const {
      userId,
      jobTitle,
      jobDescription,
    } = parsed.data;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Student account not found. Please sign in again.',
        },
        { status: 404 },
      );
    }

    const skills =
      await getStudentSkillContext(userId);

    const skillContext =
      formatStudentSkillsForPrompt(skills);

    const userMessage =
      `STUDENT SKILL PROFILE:\n${skillContext}` +
      `\n\nJOB TITLE: ${jobTitle}` +
      `\n\nJOB DESCRIPTION (pasted by student):\n${jobDescription}` +
      '\n\nCall analyze_job_fit with your result. ' +
      'Extract required skills conservatively from the text above.';

    const result =
      await runToolCall<JobFitResult>({
        system:
          `${BASE_SYSTEM_PROMPT}\n\n` +
          JOB_FIT_FUNCTION_INSTRUCTIONS,
        userMessage,
        tool: ANALYZE_JOB_FIT_TOOL,

        // Reject malformed/out-of-range AI output
        // before it reaches normalization or persistence.
        schema: jobFitSchema,
        validationLabel: 'job fit analysis',
      });

    const proficiencyBySkill = new Map(
      skills.map((skill) => [
        skill.skill.name.toLowerCase(),
        skill.proficiency,
      ]),
    );

    const toSkillGapItem = (
      skillName: string,
      matched: boolean,
    ) => {
      const userProficiency =
        proficiencyBySkill.get(
          skillName.toLowerCase(),
        ) ?? 0;

      const requiredImportance = 100;

      return {
        skillName,
        userProficiency,
        requiredImportance,
        gap: matched
          ? 0
          : Math.max(
              requiredImportance -
                userProficiency,
              0,
            ),
      };
    };

    const normalizedResult = {
      jobTitle:
        result.jobTitle || jobTitle,

      // This is already guaranteed to be 0-100
      // by jobFitSchema.
      fitScore: result.fitScorePercent,

      matchedSkills:
        result.matchedSkills.map(
          (skillName) =>
            toSkillGapItem(
              skillName,
              true,
            ),
        ),

      missingSkills:
        result.missingSkills.map(
          (skillName) =>
            toSkillGapItem(
              skillName,
              false,
            ),
        ),

      explanation: result.summary,

      citations: [],

      requiresCounselorReview: false,

      reviewReason: undefined,
    };

    // Only validated output can reach persistence.
    const saved =
      await prisma.jobFitCheck.create({
        data: {
          userId,
          jobTitle:
            normalizedResult.jobTitle,
          jobDescriptionRaw:
            jobDescription,
          extractedSkills:
            result.extractedSkills,
          matchedCount:
            result.matchedSkills.length,
          totalRequired:
            result.extractedSkills.length,
          fitScorePercent:
            normalizedResult.fitScore,
        },
      });

    return NextResponse.json({
      result: normalizedResult,
      jobFitCheckId: saved.id,
    });
  } catch (error) {
    if (
      error instanceof
      InvalidAIResponseError
    ) {
      console.error(
        'Job fit AI validation failed:',
        error.issues,
      );

      return NextResponse.json(
        {
          error:
            'The AI returned an invalid job-fit analysis. Please try again.',
        },
        { status: 502 },
      );
    }

    console.error(
      'Job fit analysis failed:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Job fit analysis is temporarily unavailable. Please try again.',
      },
      { status: 502 },
    );
  }
}