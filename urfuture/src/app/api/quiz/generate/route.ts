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
  questionCount: z.number().min(3).max(60).optional(),
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
  const userMessage = `${majorContext}\n\nHere are all of this student's transcripts on file:\n\n${courseSummary}\n\nGenerate ${questionCount ?? 15} diagnostic questions. Mix MULTIPLE_CHOICE, LAB, WRITTEN, and CODING types. About 20-30% should be LAB questions with codeSnippet fields. Return JSON only in this exact shape: {"questions":[{"questionType":"MULTIPLE_CHOICE|LAB|WRITTEN|CODING","skillName":"string","prompt":"string","choices":["string"],"correctIndex":0,"expectedAnswer":"string","difficulty":"EASY|MEDIUM|HARD","sourceCourse":"string","codeSnippet":"string|null","isLab":false}]}. For LAB questions, always set isLab:true and include a realistic codeSnippet. For written/coding questions, choices must contain the expected answer as its first item. Ground every question in a listed course.`;
  
  const requestedCount = questionCount ?? 15;
  let result: { questions: QuizGeneratedQuestion[] };
  try {
    if (requestedCount > 20) {
      // Batch generation: split into chunks of 20 to avoid token limits/timeouts
      const batchSize = 20;
      const batches = Math.ceil(requestedCount / batchSize);
      const allQuestions: QuizGeneratedQuestion[] = [];
      for (let i = 0; i < batches; i++) {
        const count = Math.min(batchSize, requestedCount - allQuestions.length);
        const batchMessage = userMessage.replace(
          `Generate ${requestedCount}`,
          `Generate ${count}`
        );
        const batchResult = await runToolCall<{ questions: QuizGeneratedQuestion[] }>({
          system: `${BASE_SYSTEM_PROMPT}\n\n${QUIZ_GENERATION_INSTRUCTIONS}`,
          userMessage: batchMessage,
          tool: GENERATE_QUIZ_TOOL,
        });
        allQuestions.push(...(batchResult.questions || []));
      }
      result = { questions: allQuestions.slice(0, requestedCount) };
    } else {
      result = await runToolCall<{ questions: QuizGeneratedQuestion[] }>({
        system: `${BASE_SYSTEM_PROMPT}\n\n${QUIZ_GENERATION_INSTRUCTIONS}`,
        userMessage,
        tool: GENERATE_QUIZ_TOOL,
      });
    }
  } catch (error) {
    console.warn('AI quiz generation failed; using grounded fallback questions:', error);
    result = { questions: buildFallbackQuestions(transcripts, requestedCount) };
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
        questionType: q.questionType ?? 'MULTIPLE_CHOICE',
        codeSnippet: q.codeSnippet ?? null,
        isLab: q.isLab ?? false,
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
      questionType: questionMetadata.get(q.id)?.questionType ?? (q as Record<string, unknown>).questionType ?? 'MULTIPLE_CHOICE',
      expectedAnswer: questionMetadata.get(q.id)?.expectedAnswer,
      codeSnippet: questionMetadata.get(q.id)?.codeSnippet ?? (q as Record<string, unknown>).codeSnippet ?? null,
      isLab: questionMetadata.get(q.id)?.isLab ?? (q as Record<string, unknown>).isLab ?? false,
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

  const labSnippets: Array<{ course: string; prompt: string; snippet: string; choices: string[]; correctIndex: number }> = [
    {
      course: 'Programming',
      prompt: 'What will the following Python code print?',
      snippet: 'x = [1, 2, 3, 4, 5]\nresult = x[1:4]\nprint(result)',
      choices: ['[1, 2, 3, 4]', '[2, 3, 4]', '[1, 2, 3]', '[2, 3, 4, 5]'],
      correctIndex: 1,
    },
    {
      course: 'Database Systems',
      prompt: 'Which line contains the SQL syntax error?',
      snippet: 'SELECT name, COUNT(*)\nFROM students\nWHERE grade > 3.0\nGROUP ON department\nHAVING COUNT(*) > 5;',
      choices: ['Line 1: SELECT clause', 'Line 3: WHERE clause', 'Line 4: should be GROUP BY, not GROUP ON', 'Line 5: HAVING clause'],
      correctIndex: 2,
    },
    {
      course: 'Web Development',
      prompt: 'What does this JavaScript function return when called with [3, 1, 4, 1, 5]?',
      snippet: 'function mystery(arr) {\n  return arr.filter((v, i) =>\n    arr.indexOf(v) === i\n  ).length;\n}',
      choices: ['5', '4', '3', 'undefined'],
      correctIndex: 1,
    },
    {
      course: 'Data Structures',
      prompt: 'What is the output of this stack operation sequence?',
      snippet: 'stack = []\nstack.append(10)\nstack.append(20)\nstack.append(30)\nstack.pop()\nstack.append(40)\nprint(stack[-1])',
      choices: ['10', '20', '30', '40'],
      correctIndex: 3,
    },
    {
      course: 'Networking',
      prompt: 'What subnet mask does this CIDR notation represent?',
      snippet: '# Network Configuration\nIP Address: 192.168.1.0/26\n# Question: What is the subnet mask?',
      choices: ['255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.255.224'],
      correctIndex: 2,
    },
    {
      course: 'Operating Systems',
      prompt: 'What does this shell command pipeline produce?',
      snippet: 'echo "hello world hello" | tr " " "\\n" | sort | uniq -c | sort -rn | head -1',
      choices: ['2 hello', '1 world', 'hello', '3'],
      correctIndex: 0,
    },
  ];

  return Array.from({ length: questionCount }, (_, index) => {
    const course = selectedCourses[index % selectedCourses.length] || 'your uploaded coursework';
    const isLabQuestion = index % 5 === 2 || index % 5 === 4; // ~40% lab in fallback for variety

    if (isLabQuestion) {
      const lab = labSnippets[index % labSnippets.length];
      return {
        questionType: 'LAB' as const,
        skillName: course,
        prompt: lab.prompt,
        choices: lab.choices,
        correctIndex: lab.correctIndex,
        difficulty: index % 3 === 0 ? 'EASY' as const : index % 3 === 1 ? 'MEDIUM' as const : 'HARD' as const,
        sourceCourse: course,
        codeSnippet: lab.snippet,
        isLab: true,
      };
    }

    return {
      questionType: 'MULTIPLE_CHOICE' as const,
      skillName: course,
      prompt: `Which statement best describes a core concept you should understand from ${course}?`,
      choices: [
        `The foundational concepts and practical methods taught in ${course}`,
        'Only memorizing the course title',
        'Avoiding practice and examples',
        'The subject has no practical applications',
      ],
      correctIndex: 0,
      difficulty: index % 3 === 0 ? 'EASY' as const : index % 3 === 1 ? 'MEDIUM' as const : 'HARD' as const,
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
