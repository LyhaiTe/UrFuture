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

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: 'Student account not found. Please sign in again.' }, { status: 404 });
  }

  const skills = await getStudentSkillContext(userId);
  const skillContext = formatStudentSkillsForPrompt(skills);

  const userMessage = `STUDENT SKILL PROFILE:\n${skillContext}\n\nJOB TITLE: ${jobTitle}\n\nJOB DESCRIPTION (pasted by student):\n${jobDescription}\n\nCall analyze_job_fit with your result. Extract required skills conservatively from the text above.`;

  let result: JobFitResult;
  try {
    result = await runToolCall<JobFitResult>({
      system: `${BASE_SYSTEM_PROMPT}\n\n${JOB_FIT_FUNCTION_INSTRUCTIONS}`,
      userMessage,
      tool: ANALYZE_JOB_FIT_TOOL,
    });
  } catch (error) {
    console.error('Job fit analysis failed:', error);
    return NextResponse.json(
      { error: 'Job fit analysis is temporarily unavailable. Please try again.' },
      { status: 502 }
    );
  }

  const proficiencyBySkill = new Map(
    skills.map((skill) => [skill.skill.name.toLowerCase(), skill.proficiency])
  );
  const toSkillGapItem = (skillName: string, matched: boolean) => {
    const userProficiency = proficiencyBySkill.get(skillName.toLowerCase()) ?? 0;
    const requiredImportance = 100;
    return {
      skillName,
      userProficiency,
      requiredImportance,
      gap: matched ? 0 : Math.max(requiredImportance - userProficiency, 0),
    };
  };
  const normalizedResult = {
    jobTitle: result.jobTitle || jobTitle,
    fitScore: Math.max(0, Math.min(100, result.fitScorePercent)),
    matchedSkills: result.matchedSkills.map((skillName) => toSkillGapItem(skillName, true)),
    missingSkills: result.missingSkills.map((skillName) => toSkillGapItem(skillName, false)),
    explanation: result.summary,
    citations: [],
    requiresCounselorReview: false,
    reviewReason: undefined,
  };

  const saved = await prisma.jobFitCheck.create({
    data: {
      userId,
      jobTitle: normalizedResult.jobTitle,
      jobDescriptionRaw: jobDescription,
      extractedSkills: result.extractedSkills,
      matchedCount: result.matchedSkills.length,
      totalRequired: result.extractedSkills.length,
      fitScorePercent: normalizedResult.fitScore,
    },
  });

  return NextResponse.json({ result: normalizedResult, jobFitCheckId: saved.id });
}
