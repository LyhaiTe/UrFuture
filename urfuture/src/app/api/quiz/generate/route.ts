import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { runToolCall, GENERATE_QUIZ_TOOL } from '@/lib/claude';
import { BASE_SYSTEM_PROMPT, QUIZ_GENERATION_INSTRUCTIONS } from '@/lib/prompts';
import { getParsedTranscripts } from '@/lib/knowledgeBase';
import type { QuizGeneratedQuestion } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  questionCount: z.number().min(3).max(30).optional(),
});

/**
 * POST /api/quiz/generate
 * Implements the sticky-note feature: "AI Quiz that allow us to upload all
 * the class we took from year1-4 and give us a quiz to test our knowledge."
 * Pulls every PARSED transcript on file for the student (across all
 * years/grades) and asks Claude to build a diagnostic quiz strictly from
 * courses that actually appear in those transcripts.
 */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { userId, questionCount } = parsed.data;

  const transcripts = await getParsedTranscripts(userId);
  if (transcripts.length === 0) {
    return NextResponse.json(
      { error: 'No parsed transcripts on file. Upload transcripts first via /api/transcript/upload.' },
      { status: 400 }
    );
  }

  const courseSummary = transcripts
    .map((t) => `Year label: ${t.yearLabel ?? 'unspecified'}\nCourses: ${JSON.stringify(t.parsedCourses)}`)
    .join('\n\n');

  const userMessage = `Here are all of this student's transcripts on file (year 1 through the most recent upload):\n\n${courseSummary}\n\nGenerate ${questionCount ?? 10} diagnostic multiple-choice questions spread across the distinct subjects present above. Call generate_quiz with your result.`;

  const result = await runToolCall<{ questions: QuizGeneratedQuestion[] }>({
    system: `${BASE_SYSTEM_PROMPT}\n\n${QUIZ_GENERATION_INSTRUCTIONS}`,
    userMessage,
    tool: GENERATE_QUIZ_TOOL,
  });

  // Persist questions against the Skill table (creating skills on the fly if new),
  // then create the QuizAttempt shell the client will answer against.
  const questionIds: string[] = [];
  for (const q of result.questions) {
    const skill = await prisma.skill.upsert({
      where: { name: q.skillName },
      update: {},
      create: { name: q.skillName },
    });
    const created = await prisma.quizQuestion.create({
      data: {
        skillId: skill.id,
        prompt: q.prompt,
        choices: q.choices,
        correctIndex: q.correctIndex,
        difficulty: q.difficulty,
        sourceCourse: q.sourceCourse,
      },
    });
    questionIds.push(created.id);
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      basedOnTranscriptIds: transcripts.map((t) => t.id),
    },
  });

  const questions = await prisma.quizQuestion.findMany({ where: { id: { in: questionIds } } });

  return NextResponse.json({
    quizAttemptId: attempt.id,
    questions: questions.map((q) => ({
      id: q.id,
      skillId: q.skillId,
      prompt: q.prompt,
      choices: q.choices,
      difficulty: q.difficulty,
      sourceCourse: q.sourceCourse,
      // correctIndex intentionally withheld from the client payload
    })),
  });
}
