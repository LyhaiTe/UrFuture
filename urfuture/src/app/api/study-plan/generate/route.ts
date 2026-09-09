import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { runToolCall, GENERATE_STUDY_PLAN_TOOL } from '@/lib/claude';
import { BASE_SYSTEM_PROMPT, STUDY_PLAN_FUNCTION_INSTRUCTIONS } from '@/lib/prompts';
import { getStudentSkillContext, formatStudentSkillsForPrompt } from '@/lib/knowledgeBase';
import type { StudyPlanResult } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  targetSkillNames: z.array(z.string()).min(1),
  weeksRequested: z.number().min(2).max(12).optional(),
});

/**
 * POST /api/study-plan/generate
 * Produces a personalized multi-week plan closing the gaps identified by
 * /api/career/recommend or /api/job/match.
 */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { userId, targetSkillNames, weeksRequested } = parsed.data;

  const skills = await getStudentSkillContext(userId);
  const skillContext = formatStudentSkillsForPrompt(skills);

  const userMessage = `STUDENT SKILL PROFILE:\n${skillContext}\n\nTarget skills to close gaps on: ${targetSkillNames.join(', ')}.\nPreferred plan length: ${weeksRequested ?? 6} weeks.\nCall generate_study_plan with your result.`;

  const result = await runToolCall<StudyPlanResult>({
    system: `${BASE_SYSTEM_PROMPT}\n\n${STUDY_PLAN_FUNCTION_INSTRUCTIONS}`,
    userMessage,
    tool: GENERATE_STUDY_PLAN_TOOL,
  });

  const saved = await prisma.studyPlan.create({
    data: {
      userId,
      title: result.title,
      targetSkillIds: result.targetSkills,
      weeks: result.weeks,
      citations: result.citations,
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ studyPlan: { ...result, id: saved.id } });
}
