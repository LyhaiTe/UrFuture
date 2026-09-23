import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { runToolCall, GENERATE_STUDY_PLAN_TOOL } from '@/lib/llm';
import { BASE_SYSTEM_PROMPT, STUDY_PLAN_FUNCTION_INSTRUCTIONS } from '@/lib/prompts';
import { getStudentSkillContext, formatStudentSkillsForPrompt } from '@/lib/knowledgeBase';
import { retrieveRelevantContextForMany } from '@/lib/rag';
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

  // Pull real course-module/syllabus chunks for each target skill (RUPP,
  // ITC, CADT, Norton, etc.) so the plan's weekly resources cite actual
  // curricula instead of the model inventing plausible-sounding courses.
  const { contextText: syllabusContext, citations: syllabusCitations } = await retrieveRelevantContextForMany(
    targetSkillNames,
    { category: 'ACADEMIC_SYLLABUS' }
  );
  const syllabusBlock = syllabusContext
    ? `\n\nRELEVANT CURRICULUM / COURSE MATERIAL (cite by SOURCE shown; note any resource you can't ground this way as a general study strategy instead):\n${syllabusContext}`
    : '';

  const userMessage = `STUDENT SKILL PROFILE:\n${skillContext}\n\nTarget skills to close gaps on: ${targetSkillNames.join(', ')}.\nPreferred plan length: ${weeksRequested ?? 6} weeks.${syllabusBlock}\nCall generate_study_plan with your result.`;

  const result = await runToolCall<StudyPlanResult>({
    system: `${BASE_SYSTEM_PROMPT}\n\n${STUDY_PLAN_FUNCTION_INSTRUCTIONS}`,
    userMessage,
    tool: GENERATE_STUDY_PLAN_TOOL,
  });

  // Merge the model's self-reported citations with the retrieval-layer
  // citations for the chunks it was actually shown, so StudyPlan.citations
  // stays chunk-verifiable rather than only self-reported.
  const mergedCitations = [...result.citations, ...syllabusCitations];

  const saved = await prisma.studyPlan.create({
    data: {
      userId,
      title: result.title,
      targetSkillIds: result.targetSkills,
      weeks: result.weeks as unknown as Prisma.InputJsonValue,
      citations: mergedCitations as unknown as Prisma.InputJsonValue,
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ studyPlan: { ...result, citations: mergedCitations, id: saved.id } });
}