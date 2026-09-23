import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const bodySchema = z.object({
  quizAttemptId: z.string(),
  answers: z.array(z.object({ questionId: z.string(), selectedIndex: z.number().optional(), studentAnswer: z.string().optional() })),
});

/**
 * POST /api/quiz/evaluate
 * Implements the sticky-note steps:
 *  "After completing the quiz and evaluating how much our knowledge is we
 *   can see the percentage" and "the AI will also give us some job
 *   recommendations based on our results."
 *
 * Grades the attempt, converts per-skill accuracy into UserSkill
 * proficiency rows (source=QUIZ), and returns the overall percentage. The
 * client should follow up with POST /api/career/recommend using the same
 * userId to get the job/major recommendations the note describes — kept as
 * a separate call so the heavier Claude reasoning step stays optional and
 * explicit rather than bundled into grading.
 */
async function handlePost(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { quizAttemptId, answers } = parsed.data;

  const attempt = await prisma.quizAttempt.findUnique({ where: { id: quizAttemptId } });
  if (!attempt) return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.quizQuestion.findMany({ where: { id: { in: questionIds } } });
  const questionById = new Map(questions.map((q) => [q.id, q]));

  let correctCount = 0;
  const perSkillTotals = new Map<string, { correct: number; total: number }>();

  for (const a of answers) {
    const q = questionById.get(a.questionId);
    if (!q) continue;
    const isWritten = a.studentAnswer !== undefined;
    const expectedAnswer = Array.isArray(q.choices) ? q.choices[0] : null;
    const isCorrect = isWritten
      ? typeof expectedAnswer === 'string' && a.studentAnswer!.trim().toLowerCase() === expectedAnswer.trim().toLowerCase()
      : a.selectedIndex === q.correctIndex;
    if (isCorrect) correctCount += 1;

    await prisma.quizAnswer.create({
      data: {
        quizAttemptId,
        questionId: q.id,
        selectedIndex: a.selectedIndex ?? -1,
        studentAnswer: a.studentAnswer,
        isCorrect,
      },
    });

    const bucket = perSkillTotals.get(q.skillId) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (isCorrect) bucket.correct += 1;
    perSkillTotals.set(q.skillId, bucket);
  }

  const scorePercent = answers.length ? (correctCount / answers.length) * 100 : 0;

  await prisma.quizAttempt.update({
    where: { id: quizAttemptId },
    data: { scorePercent, completedAt: new Date() },
  });

  // Convert per-skill accuracy into proficiency scores the career-fit
  // engine can consume directly.
  for (const [skillId, { correct, total }] of perSkillTotals.entries()) {
    const proficiency = (correct / total) * 100;
    await prisma.userSkill.upsert({
      where: { userId_skillId_source: { userId: attempt.userId, skillId, source: 'QUIZ' } },
      update: { proficiency },
      create: { userId: attempt.userId, skillId, proficiency, source: 'QUIZ' },
    });
  }

  return NextResponse.json({
    scorePercent: Math.round(scorePercent * 10) / 10,
    correctCount,
    totalQuestions: answers.length,
    nextStep: 'Call POST /api/career/recommend with this userId to get job/major recommendations based on this score.',
  });
}

export async function POST(req: NextRequest) {
  try {
    return await handlePost(req);
  } catch (error) {
    console.error('Quiz evaluation failed:', error);
    return NextResponse.json(
      { error: 'Quiz evaluation failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
