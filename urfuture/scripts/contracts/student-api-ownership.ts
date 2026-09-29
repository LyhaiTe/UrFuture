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
  console.log('Starting student API ownership contract tests...');

  const studentA = await prisma.user.create({
    data: {
      email: `contract-a-${suffix}@example.com`,
      name: 'Contract Student A',
      role: 'STUDENT',
    },
  });

  const studentB = await prisma.user.create({
    data: {
      email: `contract-b-${suffix}@example.com`,
      name: 'Contract Student B',
      role: 'STUDENT',
    },
  });

  try {
    const conversationB =
      await prisma.conversation.create({
        data: {
          userId: studentB.id,
          title: 'Student B private conversation',
        },
      });

      const quizAttemptB =
      await prisma.quizAttempt.create({
        data: {
          userId: studentB.id,
          basedOnTranscriptIds: [],
          assignedQuestionIds: [],
        },
      });

    const cookieA =
      `${STUDENT_SESSION_COOKIE}=` +
      createStudentSessionToken(studentA.id);

    // ------------------------------------------------
    // 1. Unauthenticated conversation list
    // ------------------------------------------------

    const unauthenticatedList = await fetch(
      `${BASE_URL}/api/chat/conversations`
    );

    assert.equal(
      unauthenticatedList.status,
      401,
      'Unauthenticated conversation access must return 401'
    );

    console.log(
      '✓ Unauthenticated conversation access rejected'
    );

    // ------------------------------------------------
    // 2. Cross-user conversation GET
    // ------------------------------------------------

    const crossUserConversation = await fetch(
      `${BASE_URL}/api/chat/conversations/${conversationB.id}`,
      {
        headers: {
          Cookie: cookieA,
        },
      }
    );

    assert.equal(
      crossUserConversation.status,
      404,
      'Student A must not read Student B conversation'
    );

    console.log(
      '✓ Cross-user conversation read rejected'
    );

    // ------------------------------------------------
    // 3. Cross-user conversation DELETE
    // ------------------------------------------------

    const crossUserDelete = await fetch(
      `${BASE_URL}/api/chat/conversations/${conversationB.id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: cookieA,
        },
      }
    );

    assert.equal(
      crossUserDelete.status,
      404,
      'Student A must not delete Student B conversation'
    );

    const conversationStillExists =
      await prisma.conversation.findUnique({
        where: {
          id: conversationB.id,
        },
      });

    assert.ok(
      conversationStillExists,
      'Student B conversation must still exist'
    );

    console.log(
      '✓ Cross-user conversation delete rejected'
    );

    // ------------------------------------------------
    // 4. Unauthenticated quiz evaluation
    // ------------------------------------------------

    const unauthenticatedQuiz = await fetch(
      `${BASE_URL}/api/quiz/evaluate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizAttemptId: quizAttemptB.id,
          answers: [],
        }),
      }
    );

    assert.equal(
      unauthenticatedQuiz.status,
      401,
      'Unauthenticated quiz evaluation must return 401'
    );

    console.log(
      '✓ Unauthenticated quiz evaluation rejected'
    );

    // ------------------------------------------------
    // 5. Cross-user quiz attempt
    // ------------------------------------------------

    const crossUserQuiz = await fetch(
      `${BASE_URL}/api/quiz/evaluate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieA,
        },
        body: JSON.stringify({
          quizAttemptId: quizAttemptB.id,
          answers: [],
        }),
      }
    );

    assert.equal(
      crossUserQuiz.status,
      404,
      'Student A must not grade Student B quiz attempt'
    );

    const unchangedAttempt =
      await prisma.quizAttempt.findUnique({
        where: {
          id: quizAttemptB.id,
        },
      });

    assert.equal(
      unchangedAttempt?.completedAt,
      null,
      'Student B quiz attempt must remain unmodified'
    );

    console.log(
      '✓ Cross-user quiz evaluation rejected'
    );

    console.log('');
    console.log(
      'All Task 1 ownership contract tests passed.'
    );
  } finally {
    // User cascade deletion cleans up the temporary
    // conversations and quiz attempts.
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [studentA.id, studentB.id],
        },
      },
    });

    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error('');
  console.error('Contract test failed:');
  console.error(error);

  await prisma.$disconnect();
  process.exit(1);
});