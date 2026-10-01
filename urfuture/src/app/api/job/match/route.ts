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
import { buildJobFitAssessment } from '@/lib/jobFitSkills';
import type { JobFitResult } from '@/types';
import { getAuthenticatedStudent } from '@/lib/studentSession';

export const runtime = 'nodejs';

const bodySchema = z.object({
  jobTitle: z.string().trim().min(1),
  jobDescription: z.string().trim().min(20),
});

/**
 * POST /api/job/match
 *
 * Compares the authenticated student's known skills against
 * a pasted job description.
 *
 * The AI response is runtime-validated before normalization,
 * persistence, or display.
 */
export async function POST(req: NextRequest) {
  try {
    const student = await getAuthenticatedStudent(req);

    if (!student) {
      return NextResponse.json(
        { error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    const userId = student.id;

    const body = await req.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      jobTitle,
      jobDescription,
    } = parsed.data;

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

        // Reject malformed or out-of-range AI output
        // before normalization or persistence.
        schema: jobFitSchema,
        validationLabel: 'job fit analysis',
      });

    const skillEvidence = skills.map((skill) => ({
      name: skill.skill.name,
      proficiency: skill.proficiency,
      source: skill.source,
    }));
    const assessment = buildJobFitAssessment(
      result.skillRequirements,
      skillEvidence
    );

    const normalizedResult = {
      jobTitle:
        result.jobTitle || jobTitle,

      fitScore: assessment.fitScore,

      matchedSkills: assessment.matchedSkills,

      missingSkills: assessment.missingSkills,

      explanation: result.summary,

      citations: [],

      requiresCounselorReview: false,

      reviewReason: undefined,
    };

    // Only validated AI output can reach persistence.
    const saved =
      await prisma.jobFitCheck.create({
        data: {
          userId,
          jobTitle:
            normalizedResult.jobTitle,
          jobDescriptionRaw:
            jobDescription,
          extractedSkills:
            result.skillRequirements.map((requirement) => requirement.skillName),
          matchedCount: assessment.matchedSkills.length,
          totalRequired: assessment.totalRequired,
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