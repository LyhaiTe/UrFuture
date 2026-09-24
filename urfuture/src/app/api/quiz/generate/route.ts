import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { runToolCall, GENERATE_QUIZ_TOOL } from '@/lib/llm';
import { BASE_SYSTEM_PROMPT, QUIZ_GENERATION_INSTRUCTIONS } from '@/lib/prompts';
import { getParsedTranscripts } from '@/lib/knowledgeBase';
import type { QuizGeneratedQuestion } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  careerPathId: z.string().optional(),
  major: z.string().trim().min(1).optional(),
  questionCount: z.number().min(3).max(30).optional(),
});

/**
 * POST /api/quiz/generate
 * Implements the feature: "AI Quiz that allow us to upload all
 * the class we took from year1-4 and give us a quiz to test our knowledge."
 * Pulls every PARSED transcript on file for the student (across all
 * years/grades) and builds a diagnostic quiz strictly from
 * courses that actually appear in those transcripts.
 */
async function handlePost(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { userId, careerPathId, major, questionCount } = parsed.data;
  const selectedMajor = careerPathId
    ? await prisma.careerPath.findUnique({ where: { id: careerPathId } })
    : major
      ? await prisma.careerPath.findUnique({ where: { title: major } })
      : await prisma.user.findUnique({
          where: { id: userId },
          select: { selectedMajor: true },
        }).then((user) => user?.selectedMajor ?? null);

  if (careerPathId || major) {
    if (!selectedMajor) {
      return NextResponse.json({ error: 'Selected major was not found.' }, { status: 404 });
    }
    await prisma.user.update({
      where: { id: userId },
      data: { selectedMajorId: selectedMajor.id },
    });
  }

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

  const majorContext = selectedMajor
    ? `The student's selected major is "${selectedMajor.title}". Focus questions on knowledge relevant to this major and its required skills.`
    : 'No major has been selected; keep questions grounded in the uploaded coursework.';
  const userMessage = `${majorContext}\n\nHere are all of this student's transcripts on file:\n\n${courseSummary}\n\nGenerate ${questionCount ?? 10} diagnostic questions. Mix MULTIPLE_CHOICE, WRITTEN, and CODING. Return JSON only in this exact shape: {"questions":[{"questionType":"MULTIPLE_CHOICE|WRITTEN|CODING","skillName":"string","prompt":"string","choices":["string"],"correctIndex":0,"expectedAnswer":"string","difficulty":"EASY|MEDIUM|HARD","sourceCourse":"string"}]}. For written/coding questions, choices must contain the expected answer as its first item. Ground every question in a listed course.`;
  
  let result: { questions: QuizGeneratedQuestion[] };
  try {
    result = await runToolCall<{ questions: QuizGeneratedQuestion[] }>({
      system: `${BASE_SYSTEM_PROMPT}\n\n${QUIZ_GENERATION_INSTRUCTIONS}`,
      userMessage,
      tool: GENERATE_QUIZ_TOOL,
    });
  } catch (error) {
    console.warn('AI quiz generation failed; using grounded fallback questions:', error);
    result = { questions: buildFallbackQuestions(transcripts, questionCount ?? 8) };
  }

  // Persist questions against the Skill table (creating skills on the fly if new),
  // then create the QuizAttempt shell the client will answer against.
  const questionIds: string[] = [];
  const questionMetadata = new Map<string, QuizGeneratedQuestion>();
  for (const q of result.questions) {
    const skill = await prisma.skill.upsert({
      where: { name: q.skillName },
      update: {},
      create: { name: q.skillName },
    });
    const created = await prisma.quizQuestion.create({
      data: {
        careerPathId: selectedMajor?.id,
        skillId: skill.id,
        prompt: q.prompt,
        choices: q.choices ?? (q.expectedAnswer ? [q.expectedAnswer] : []),
        correctIndex: q.correctIndex ?? -1,
        difficulty: q.difficulty,
        sourceCourse: q.sourceCourse,
      },
    });
    questionIds.push(created.id);
    questionMetadata.set(created.id, q);
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      careerPathId: selectedMajor?.id,
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
      questionType: questionMetadata.get(q.id)?.questionType ?? 'MULTIPLE_CHOICE',
      expectedAnswer: questionMetadata.get(q.id)?.expectedAnswer,
      // correctIndex intentionally withheld from the client payload
    })),
  });
}

function buildFallbackQuestions(
  transcripts: Awaited<ReturnType<typeof getParsedTranscripts>>,
  questionCount: number,
): QuizGeneratedQuestion[] {
  const courses = transcripts.flatMap((transcript) => Array.isArray(transcript.parsedCourses) ? transcript.parsedCourses : []);
  const uniqueCourses = courses
    .map((course) => {
      const value = course as { courseCode?: unknown; courseName?: unknown; knowledgeArea?: unknown };
      return String(value.courseName || value.knowledgeArea || value.courseCode || '').trim();
    })
    .filter((course, index, all) => course && all.indexOf(course) === index);
  const selectedCourses = uniqueCourses.slice(0, Math.max(questionCount, 3));
  return Array.from({ length: questionCount }, (_, index) => {
    const course = selectedCourses[index % selectedCourses.length] || 'your uploaded coursework';
    return {
      questionType: 'MULTIPLE_CHOICE',
      skillName: course,
      prompt: `Which statement best describes a core concept you should understand from ${course}?`,
      choices: [`The foundational concepts and practical methods taught in ${course}`, 'Only memorizing the course title', 'Avoiding practice and examples', 'The subject has no practical applications'],
      correctIndex: 0,
      difficulty: index % 3 === 0 ? 'EASY' : index % 3 === 1 ? 'MEDIUM' : 'HARD',
      sourceCourse: course,
    };
  });
}

export async function POST(req: NextRequest) {
  try {
    return await handlePost(req);
  } catch (error) {
    console.error('Quiz generation failed:', error);
    return NextResponse.json(
      { error: 'Quiz generation failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
