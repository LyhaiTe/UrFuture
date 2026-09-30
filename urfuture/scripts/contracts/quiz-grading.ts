import assert from 'node:assert/strict';
import { prisma } from '../../src/lib/db';
import {
  createStudentSessionToken,
  STUDENT_SESSION_COOKIE,
} from '../../src/lib/studentSession';

const BASE_URL =
  process.env.CONTRACT_TEST_BASE_URL ??
  'http://localhost:3000';

const suffix = Date.now().toString();

async function main() {
  console.log(
    'Starting quiz grading contract tests...'
  );

  const student = await prisma.user.create({
    data: {
      email: `quiz-contract-${suffix}@example.com`,
      name: 'Quiz Contract Student',
      role: 'STUDENT',
    },
  });

  const skill = await prisma.skill.create({
    data: {
      name: `Contract Skill ${suffix}`,
    },
  });

  const question1 =
    await prisma.quizQuestion.create({
      data: {
        skillId: skill.id,
        prompt: 'Contract question 1',
        choices: ['Correct', 'Wrong'],
        correctIndex: 0,
        difficulty: 'BEGINNER',
      },
    });

  const question2 =
    await prisma.quizQuestion.create({
      data: {
        skillId: skill.id,
        prompt: 'Contract question 2',
        choices: ['Correct', 'Wrong'],
        correctIndex: 0,
        difficulty: 'BEGINNER',
      },
    });

  const writtenQuestion =
    await prisma.quizQuestion.create({
      data: {
        skillId: skill.id,
        prompt: 'Contract written question',
        choices: ['Correct'],
        correctIndex: 0,
        difficulty: 'BEGINNER',
        questionType: 'WRITTEN',
      },
    });

  const outsideQuestion =
    await prisma.quizQuestion.create({
      data: {
        skillId: skill.id,
        prompt: 'Outside question',
        choices: ['Correct', 'Wrong'],
        correctIndex: 0,
        difficulty: 'BEGINNER',
      },
    });

  const cookie =
    `${STUDENT_SESSION_COOKIE}=` +
    createStudentSessionToken(student.id);

  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookie,
  };

  try {
    // ----------------------------------------
    // 1. Reject question outside the attempt
    // ----------------------------------------

    const invalidAttempt =
      await prisma.quizAttempt.create({
        data: {
          userId: student.id,
          basedOnTranscriptIds: [],
          assignedQuestionIds: [
            question1.id,
            question2.id,
            writtenQuestion.id,
          ],
        },
      });

    const invalidResponse = await fetch(
      `${BASE_URL}/api/quiz/evaluate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quizAttemptId: invalidAttempt.id,
          answers: [
            {
              questionId: question1.id,
              selectedIndex: 0,
            },
            {
              questionId: outsideQuestion.id,
              selectedIndex: 0,
            },
          ],
        }),
      }
    );

    assert.equal(
      invalidResponse.status,
      400,
      'Question outside attempt must be rejected'
    );

    const invalidAttemptAfter =
      await prisma.quizAttempt.findUnique({
        where: {
          id: invalidAttempt.id,
        },
      });

    assert.equal(
      invalidAttemptAfter?.completedAt,
      null,
      'Invalid submission must not complete attempt'
    );

    console.log(
      '✓ Question outside attempt rejected'
    );

    // ----------------------------------------
    // 2. Reject duplicate question IDs
    // ----------------------------------------

    const duplicateAttempt =
      await prisma.quizAttempt.create({
        data: {
          userId: student.id,
          basedOnTranscriptIds: [],
          assignedQuestionIds: [
            question1.id,
            question2.id,
            writtenQuestion.id,
          ],
        },
      });

    const duplicateResponse = await fetch(
      `${BASE_URL}/api/quiz/evaluate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quizAttemptId: duplicateAttempt.id,
          answers: [
            {
              questionId: question1.id,
              selectedIndex: 0,
            },
            {
              questionId: question1.id,
              selectedIndex: 0,
            },
          ],
        }),
      }
    );

    assert.equal(
      duplicateResponse.status,
      400,
      'Duplicate question IDs must be rejected'
    );

    const duplicateAttemptAfter =
      await prisma.quizAttempt.findUnique({
        where: {
          id: duplicateAttempt.id,
        },
      });

    assert.equal(
      duplicateAttemptAfter?.completedAt,
      null,
      'Duplicate submission must not complete attempt'
    );

    console.log(
      '✓ Duplicate question submission rejected'
    );

    // ----------------------------------------
    // 3. Valid grading succeeds
    // ----------------------------------------

    const validAttempt =
      await prisma.quizAttempt.create({
        data: {
          userId: student.id,
          basedOnTranscriptIds: [],
          assignedQuestionIds: [
            question1.id,
            question2.id,
            writtenQuestion.id,
          ],
        },
      });

    const validAnswers = [
      {
        questionId: question1.id,
        selectedIndex: 0,
      },
      {
        questionId: question2.id,
        selectedIndex: 1,
      },
      {
        questionId: writtenQuestion.id,
        studentAnswer: 'Correct',
      },
    ];

    const validResponse = await fetch(
      `${BASE_URL}/api/quiz/evaluate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quizAttemptId: validAttempt.id,
          answers: validAnswers,
        }),
      }
    );

    assert.equal(
      validResponse.status,
      200,
      'Valid quiz submission must succeed'
    );

    const completedAttempt =
      await prisma.quizAttempt.findUnique({
        where: {
          id: validAttempt.id,
        },
        include: {
          answers: true,
        },
      });

    assert.ok(
      completedAttempt?.completedAt,
      'Valid attempt must be completed'
    );

    assert.equal(
      completedAttempt?.answers.length,
      3,
      'All quiz answers must be stored'
    );

    const storedWrittenAnswer =
      completedAttempt?.answers.find(
        (answer) =>
          answer.questionId ===
          writtenQuestion.id
      );

    assert.equal(
      storedWrittenAnswer?.selectedIndex,
      null,
      'Written answers must not store a choice index'
    );
    assert.equal(
      storedWrittenAnswer?.studentAnswer,
      'Correct',
      'Written answers must be persisted'
    );

    console.log(
      '✓ Valid quiz graded transactionally'
    );

    // ----------------------------------------
    // 4. Reject replay
    // ----------------------------------------

    const replayResponse = await fetch(
      `${BASE_URL}/api/quiz/evaluate`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quizAttemptId: validAttempt.id,
          answers: validAnswers,
        }),
      }
    );

    assert.equal(
      replayResponse.status,
      409,
      'Completed attempt must not be graded again'
    );

    const afterReplay =
      await prisma.quizAttempt.findUnique({
        where: {
          id: validAttempt.id,
        },
        include: {
          answers: true,
        },
      });

    assert.equal(
      afterReplay?.answers.length,
      3,
      'Replay must not create additional answers'
    );

    console.log(
      '✓ Replay attempt rejected'
    );

    console.log('');
    console.log(
      'All Task 3 quiz grading contract tests passed.'
    );
  } finally {
    await prisma.user.delete({
      where: {
        id: student.id,
      },
    });

    await prisma.quizQuestion.deleteMany({
      where: {
        id: {
          in: [
            question1.id,
            question2.id,
            writtenQuestion.id,
            outsideQuestion.id,
          ],
        },
      },
    });

    await prisma.skill.delete({
      where: {
        id: skill.id,
      },
    });

    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error('');
  console.error(
    'Quiz grading contract test failed:'
  );
  console.error(error);

  await prisma.$disconnect();
  process.exit(1);
});