import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { runToolCall, ANALYZE_JOB_FIT_TOOL } from '@/lib/claude';
import { BASE_SYSTEM_PROMPT, JOB_FIT_FUNCTION_INSTRUCTIONS } from '@/lib/prompts';
import { getStudentSkillContext, formatStudentSkillsForPrompt } from '@/lib/knowledgeBase';
import type { JobFitResult } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  jobTitle: z.string(),
  jobDescription: z.string().min(20),
});

/**
 * POST /api/job/match
 * Implements the sticky-note steps: "we can upload job description to see
 * if we fit the job and the ai will assess us based on the score of our
 * knowledge. If we don't have good qualifications they will help us
 * prepare ourselves for the job."
 *
 * Returns the fit score/gap breakdown. If needsPrep is true, the client
 * should follow up with POST /api/study-plan/generate using missingSkills
 * as targetSkillNames — kept as a separate explicit call rather than
 * auto-chained, so the student can see the fit result before committing to
 * a study plan.
 */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { userId, jobTitle, jobDescription } = parsed.data;

  const skills = await getStudentSkillContext(userId);
  const skillContext = formatStudentSkillsForPrompt(skills);

  const userMessage = `STUDENT SKILL PROFILE:\n${skillContext}\n\nJOB TITLE: ${jobTitle}\n\nJOB DESCRIPTION (pasted by student):\n${jobDescription}\n\nCall analyze_job_fit with your result. Extract required skills conservatively from the text above.`;

  const result = await runToolCall<JobFitResult>({
    system: `${BASE_SYSTEM_PROMPT}\n\n${JOB_FIT_FUNCTION_INSTRUCTIONS}`,
    userMessage,
    tool: ANALYZE_JOB_FIT_TOOL,
  });

  const saved = await prisma.jobFitCheck.create({
    data: {
      userId,
      jobTitle: result.jobTitle,
      jobDescriptionRaw: jobDescription,
      extractedSkills: result.extractedSkills,
      matchedCount: result.matchedSkills.length,
      totalRequired: result.extractedSkills.length,
      fitScorePercent: result.fitScorePercent,
    },
  });

  return NextResponse.json({ ...result, jobFitCheckId: saved.id });
}
