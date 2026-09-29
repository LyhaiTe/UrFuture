import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getAuthenticatedStudent } from '@/lib/studentSession';

export const runtime = 'nodejs';

const bodySchema = z.object({
  quizAttemptId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedIndex: z.number().optional(),
      studentAnswer: z.string().optional(),
    })
  ),
});

async function handlePost(req: NextRequest) {
  // --------------------------------------------------
  // 1. Authenticate student
  // --------------------------------------------------

  const student = await getAuthenticatedStudent(req);

  if (!student) {
    return NextResponse.json(
      { error: 'Unauthenticated' },
      { status: 401 }
    );
  }

  // --------------------------------------------------
  // 2. Validate request
  // --------------------------------------------------

  const parsed = bodySchema.safeParse(
    await req.json()
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { quizAttemptId, answers } =
    parsed.data;

  // --------------------------------------------------
  // 3. Verify quiz attempt ownership
  // --------------------------------------------------

  const attempt =
    await prisma.quizAttempt.findUnique({
      where: {
        id: quizAttemptId,
      },
    });

  if (
    !attempt ||
    attempt.userId !== student.id
  ) {
    return NextResponse.json(
      { error: 'Quiz attempt not found' },
      { status: 404 }
    );
  }

  // --------------------------------------------------
  // 4. Prevent replay / repeated grading
  // --------------------------------------------------

  if (attempt.completedAt) {
    return NextResponse.json(
      {
        error:
          'This quiz attempt has already been completed.',
      },
      { status: 409 }
    );
  }

  // --------------------------------------------------
  // 5. Validate assigned question IDs
  // --------------------------------------------------

  const assignedQuestionIds =
    Array.isArray(attempt.assignedQuestionIds)
      ? attempt.assignedQuestionIds.filter(
          (id): id is string =>
            typeof id === 'string'
        )
      : [];

  const submittedQuestionIds = answers.map(
    (answer) => answer.questionId
  );

  // Reject duplicate question IDs
  const uniqueSubmittedIds = new Set(
    submittedQuestionIds
  );

  if (
    uniqueSubmittedIds.size !==
    submittedQuestionIds.length
  ) {
    return NextResponse.json(
      {
        error:
          'Duplicate question submissions are not allowed.',
      },
      { status: 400 }
    );
  }

  const assignedSet = new Set(
    assignedQuestionIds
  );

  // Reject questions that were not assigned
  const invalidQuestionIds =
    submittedQuestionIds.filter(
      (id) => !assignedSet.has(id)
    );

  if (invalidQuestionIds.length > 0) {
    return NextResponse.json(
      {
        error:
          'One or more submitted questions do not belong to this quiz attempt.',
      },
      { status: 400 }
    );
  }

  // Require answers for all assigned questions
  if (
    submittedQuestionIds.length !==
    assignedQuestionIds.length
  ) {
    return NextResponse.json(
      {
        error:
          'All assigned quiz questions must be submitted.',
      },
      { status: 400 }
    );
  }

  // --------------------------------------------------
  // 6. Load assigned questions
  // --------------------------------------------------

  const questions =
    await prisma.quizQuestion.findMany({
      where: {
        id: {
          in: assignedQuestionIds,
        },
      },
    });

  if (
    questions.length !==
    assignedQuestionIds.length
  ) {
    return NextResponse.json(
      {
        error:
          'Quiz questions could not be validated.',
      },
      { status: 400 }
    );
  }

  const questionById = new Map(
    questions.map((question) => [
      question.id,
      question,
    ])
  );

  // --------------------------------------------------
  // 7. Grade answers in memory
  // --------------------------------------------------

  let correctCount = 0;

  const perSkillTotals = new Map<
    string,
    {
      correct: number;
      total: number;
    }
  >();

  const gradedAnswers = answers.map(
    (answer) => {
      const question = questionById.get(
        answer.questionId
      );

      if (!question) {
        throw new Error(
          'Assigned quiz question is missing'
        );
      }

      const isWritten =
        answer.studentAnswer !== undefined;

      const expectedAnswer = Array.isArray(
        question.choices
      )
        ? question.choices[0]
        : null;

      const isCorrect = isWritten
        ? typeof expectedAnswer === 'string' &&
          answer.studentAnswer!
            .trim()
            .toLowerCase() ===
            expectedAnswer
              .trim()
              .toLowerCase()
        : answer.selectedIndex ===
          question.correctIndex;

      if (isCorrect) {
        correctCount += 1;
      }

      const bucket =
        perSkillTotals.get(
          question.skillId
        ) ?? {
          correct: 0,
          total: 0,
        };

      bucket.total += 1;

      if (isCorrect) {
        bucket.correct += 1;
      }

      perSkillTotals.set(
        question.skillId,
        bucket
      );

      return {
        questionId: question.id,
        selectedIndex:
          answer.selectedIndex ?? -1,
        studentAnswer:
          answer.studentAnswer,
        isCorrect,
      };
    }
  );

  const scorePercent =
    answers.length > 0
      ? (correctCount / answers.length) *
        100
      : 0;

  // --------------------------------------------------
  // 8. Transactional grading
  // --------------------------------------------------

  try {
    await prisma.$transaction(
      async (tx) => {
        /*
         * Claim the attempt for grading.
         *
         * updateMany ensures that only an
         * unfinished attempt can transition to
         * completed. If another request completed
         * it first, count will be 0.
         */
        const claimed =
          await tx.quizAttempt.updateMany({
            where: {
              id: quizAttemptId,
              userId: student.id,
              completedAt: null,
            },
            data: {
              scorePercent,
              completedAt: new Date(),
            },
          });

        if (claimed.count !== 1) {
          throw new Error(
            'QUIZ_ALREADY_COMPLETED'
          );
        }

        // Store all answers
        for (const answer of gradedAnswers) {
          await tx.quizAnswer.create({
            data: {
              quizAttemptId,
              questionId:
                answer.questionId,
              selectedIndex:
                answer.selectedIndex,
              studentAnswer:
                answer.studentAnswer,
              isCorrect:
                answer.isCorrect,
            },
          });
        }

        // Update quiz-derived skills
        for (const [
          skillId,
          { correct, total },
        ] of perSkillTotals.entries()) {
          const proficiency =
            (correct / total) * 100;

          await tx.userSkill.upsert({
            where: {
              userId_skillId_source: {
                userId: student.id,
                skillId,
                source: 'QUIZ',
              },
            },
            update: {
              proficiency,
            },
            create: {
              userId: student.id,
              skillId,
              proficiency,
              source: 'QUIZ',
            },
          });
        }
      }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'QUIZ_ALREADY_COMPLETED'
    ) {
      return NextResponse.json(
        {
          error:
            'This quiz attempt has already been completed.',
        },
        { status: 409 }
      );
    }

    throw error;
  }

  // --------------------------------------------------
  // 9. Response
  // --------------------------------------------------

  return NextResponse.json({
    scorePercent:
      Math.round(scorePercent * 10) / 10,
    correctCount,
    totalQuestions: answers.length,
    nextStep:
      'Call POST /api/career/recommend to get job/major recommendations based on this score.',
  });
}

export async function POST(
  req: NextRequest
) {
  try {
    return await handlePost(req);
  } catch (error) {
    console.error(
      'Quiz evaluation failed:',
      error
    );

    return NextResponse.json(
      {
        error: 'Quiz evaluation failed',
      },
      {
        status: 500,
      }
    );
  }
}