import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { runToolCall, GENERATE_QUIZ_TOOL } from '@/lib/llm';
import {
  quizGenerationSchema,
  InvalidAIResponseError,
} from '@/lib/aiValidation';
import {
  BASE_SYSTEM_PROMPT,
  QUIZ_GENERATION_INSTRUCTIONS,
} from '@/lib/prompts';
import { getParsedTranscripts } from '@/lib/knowledgeBase';
import type { QuizGeneratedQuestion } from '@/types';

export const runtime = 'nodejs';

const bodySchema = z.object({
  userId: z.string(),
  careerPathId: z.string().optional(),
  major: z.string().trim().min(1).optional(),
  questionCount: z.number().int().min(3).max(60).optional(),
});

/**
 * POST /api/quiz/generate
 *
 * Generates a diagnostic quiz from the student's parsed coursework.
 *
 * If a major is selected, the quiz is also aligned with that major
 * and its mapped O*NET skills.
 *
 * AI responses are runtime-validated before any generated question
 * can be persisted.
 */
async function handlePost(req: NextRequest) {
  const parsed = bodySchema.safeParse(
    await req.json(),
  );

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  const {
    userId,
    careerPathId,
    major,
    questionCount,
  } = parsed.data;

  /*
   * ------------------------------------------------------------
   * Resolve selected major
   * ------------------------------------------------------------
   */

  const selectedMajor = careerPathId
    ? await prisma.careerPath.findUnique({
        where: {
          id: careerPathId,
        },
      })
    : major
      ? await prisma.careerPath.findUnique({
          where: {
            title: major,
          },
        })
      : await prisma.user
          .findUnique({
            where: {
              id: userId,
            },
            select: {
              selectedMajor: true,
            },
          })
          .then(
            (user) =>
              user?.selectedMajor ?? null,
          );

  /*
   * If the client explicitly supplied a major, make sure
   * it exists and persist the selection for the student.
   */
  if (careerPathId || major) {
    if (!selectedMajor) {
      return NextResponse.json(
        {
          error:
            'Selected major was not found.',
        },
        {
          status: 404,
        },
      );
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        selectedMajorId:
          selectedMajor.id,
      },
    });
  }

  /*
   * ------------------------------------------------------------
   * Load parsed transcripts
   * ------------------------------------------------------------
   */

  const transcripts =
    await getParsedTranscripts(userId);

  if (transcripts.length === 0) {
    return NextResponse.json(
      {
        error:
          'No parsed transcripts on file. Upload transcripts first via /api/transcript/upload.',
      },
      {
        status: 400,
      },
    );
  }

  const courseSummary = transcripts
    .map(
      (transcript) =>
        `Year label: ${
          transcript.yearLabel ??
          'unspecified'
        }\nCourses: ${JSON.stringify(
          transcript.parsedCourses,
        )}`,
    )
    .join('\n\n');

  /*
   * ------------------------------------------------------------
   * Build major / O*NET context
   * ------------------------------------------------------------
   */

  const majorContext = selectedMajor
    ? `The student's selected major is "${selectedMajor.title}". Focus questions on knowledge relevant to this major and its required skills.`
    : 'No major has been selected; keep questions grounded in the uploaded coursework.';

  const onetSkills = selectedMajor
    ? await prisma.careerSkillRequirement.findMany({
        where: {
          careerPathId:
            selectedMajor.id,
        },
        include: {
          skill: true,
        },
      })
    : [];

  const skillLabels = onetSkills
    .map(
      (requirement) =>
        `${requirement.skill.name} (${
          requirement.skill
            .onetElementId ?? 'n/a'
        })`,
    )
    .join(', ');

  const skillContext =
    onetSkills.length > 0
      ? `Use these O*NET skills when relevant and preserve their exact skillName and onetElementId: ${skillLabels}`
      : 'No O*NET skill mapping is available; use the most specific skill name supported by the coursework.';

  const requestedCount =
    questionCount ?? 15;

  /*
   * ------------------------------------------------------------
   * AI prompt
   * ------------------------------------------------------------
   */

  const userMessage =
    `${majorContext}\n` +
    `${skillContext}\n\n` +
    `Here are all of this student's transcripts on file:\n\n` +
    `${courseSummary}\n\n` +
    `Generate ${requestedCount} diagnostic questions. ` +
    `Mix MULTIPLE_CHOICE, LAB, WRITTEN, and CODING types. ` +
    `About 20-30% should be LAB questions with codeSnippet fields. ` +
    `Return JSON only in this exact shape: ` +
    `{"questions":[{"questionType":"MULTIPLE_CHOICE|LAB|WRITTEN|CODING","skillName":"string","onetElementId":"string or empty","prompt":"string","choices":["string"],"correctIndex":0,"expectedAnswer":"string","difficulty":"EASY|MEDIUM|HARD","sourceCourse":"string","codeSnippet":"string|null","isLab":false}]}. ` +
    `For LAB questions, always set isLab:true and include a realistic codeSnippet. ` +
    `For written/coding questions, choices must contain the expected answer as its first item. ` +
    `Ground every question in a listed course.`;

  let result: {
    questions: QuizGeneratedQuestion[];
  };

  /*
   * ------------------------------------------------------------
   * Generate + validate AI output
   * ------------------------------------------------------------
   */

  try {
    if (requestedCount > 20) {
      /*
       * Generate large quizzes in batches so we do not exceed
       * provider token limits.
       */
      const batchSize = 20;

      const batches = Math.ceil(
        requestedCount / batchSize,
      );

      const allQuestions:
        QuizGeneratedQuestion[] = [];

      for (
        let i = 0;
        i < batches;
        i++
      ) {
        const count = Math.min(
          batchSize,
          requestedCount -
            allQuestions.length,
        );

        const batchMessage =
          userMessage.replace(
            `Generate ${requestedCount}`,
            `Generate ${count}`,
          );

        const batchResult =
          await runToolCall<{
            questions: QuizGeneratedQuestion[];
          }>({
            system:
              `${BASE_SYSTEM_PROMPT}\n\n` +
              QUIZ_GENERATION_INSTRUCTIONS,
            userMessage: batchMessage,
            tool: GENERATE_QUIZ_TOOL,

            /*
             * Validate the provider response before
             * anything is persisted.
             */
            schema:
              quizGenerationSchema,
            validationLabel:
              `quiz generation batch ${
                i + 1
              }`,

            /*
             * Provider/network failures should be handled
             * by this route rather than silently inside
             * runToolCall.
             */
            throwOnError: true,
          });

        allQuestions.push(
          ...batchResult.questions,
        );
      }

      result = {
        questions:
          allQuestions.slice(
            0,
            requestedCount,
          ),
      };
    } else {
      result =
        await runToolCall<{
          questions: QuizGeneratedQuestion[];
        }>({
          system:
            `${BASE_SYSTEM_PROMPT}\n\n` +
            QUIZ_GENERATION_INSTRUCTIONS,
          userMessage,
          tool: GENERATE_QUIZ_TOOL,

          /*
           * Runtime validation for normal-size quizzes.
           */
          schema:
            quizGenerationSchema,
          validationLabel:
            'quiz generation',

          throwOnError: true,
        });
    }

    /*
     * The provider may return fewer questions than requested
     * while still returning structurally valid questions.
     *
     * Fill the missing quota using our local,
     * coursework-grounded generator.
     */
    if (
      result.questions.length <
      requestedCount
    ) {
      console.warn(
        `LLM generated ${result.questions.length} questions out of ${requestedCount} requested. Supplementing with grounded fallback questions.`,
      );

      const fallbacks =
        buildFallbackQuestions(
          transcripts,
          requestedCount,
        );

      const needed =
        requestedCount -
        result.questions.length;

      result = {
        questions: [
          ...result.questions,
          ...fallbacks.slice(
            0,
            needed,
          ),
        ],
      };
    }

    /*
     * Validate the FINAL combined result too.
     *
     * This protects us even if a bug is introduced into
     * buildFallbackQuestions later.
     */
    result =
      quizGenerationSchema.parse(
        result,
      );
  } catch (error) {
    /*
     * Invalid AI output is NOT allowed to fall through
     * to persistence.
     *
     * This is required by Issue #34 Task 8.
     */
    if (
      error instanceof
        InvalidAIResponseError ||
      error instanceof z.ZodError
    ) {
      console.error(
        'Quiz AI validation failed:',
        error,
      );

      return NextResponse.json(
        {
          error:
            'The AI returned an invalid quiz. No quiz was saved. Please try again.',
        },
        {
          status: 502,
        },
      );
    }

    /*
     * Provider/network failure is different from malformed
     * provider output.
     *
     * In this case it is safe to use our deterministic
     * coursework-grounded local fallback.
     */
    console.warn(
      'AI quiz generation failed; using grounded fallback questions:',
      error,
    );

    const fallbackResult = {
      questions:
        buildFallbackQuestions(
          transcripts,
          requestedCount,
        ),
    };

    const validatedFallback =
      quizGenerationSchema.safeParse(
        fallbackResult,
      );

    if (
      !validatedFallback.success
    ) {
      console.error(
        'Quiz fallback validation failed:',
        validatedFallback.error
          .issues,
      );

      return NextResponse.json(
        {
          error:
            'Quiz generation failed validation. No quiz was saved.',
        },
        {
          status: 500,
        },
      );
    }

    result =
      validatedFallback.data;
  }

  /*
   * ------------------------------------------------------------
   * Persist validated questions
   * ------------------------------------------------------------
   *
   * Nothing reaches this section unless the final quiz payload
   * has passed quizGenerationSchema.
   */

  const questionIds: string[] = [];

  const questionMetadata =
    new Map<
      string,
      QuizGeneratedQuestion
    >();

  for (const q of result.questions) {
    const mappedSkill =
      onetSkills.find(
        (requirement) =>
          requirement.skill.name.toLowerCase() ===
            q.skillName.toLowerCase() ||
          requirement.skill
            .onetElementId ===
            q.onetElementId,
      );

    const skill =
      await prisma.skill.upsert({
        where: {
          name: q.skillName,
        },
        update: mappedSkill
          ? {
              onetElementId:
                mappedSkill.skill
                  .onetElementId,
              category:
                mappedSkill.skill
                  .category,
            }
          : {},
        create: {
          name: q.skillName,
          onetElementId:
            mappedSkill?.skill
              .onetElementId ??
            q.onetElementId,
        },
      });

    const created =
      await prisma.quizQuestion.create({
        data: {
          careerPathId:
            selectedMajor?.id,

          skillId: skill.id,

          prompt: q.prompt,

          choices:
            q.choices ??
            (q.expectedAnswer
              ? [q.expectedAnswer]
              : []),

          correctIndex:
            q.correctIndex ?? -1,

          difficulty:
            q.difficulty,

          sourceCourse:
            q.sourceCourse,

          questionType:
            q.questionType ??
            'MULTIPLE_CHOICE',

          codeSnippet:
            q.codeSnippet ?? null,

          isLab:
            q.isLab ?? false,
        },
      });

    questionIds.push(created.id);

    questionMetadata.set(
      created.id,
      q,
    );
  }

  /*
   * ------------------------------------------------------------
   * Create quiz attempt
   * ------------------------------------------------------------
   */

  const attempt =
    await prisma.quizAttempt.create({
      data: {
        userId,

        careerPathId:
          selectedMajor?.id,

        basedOnTranscriptIds:
          transcripts.map(
            (transcript) =>
              transcript.id,
          ),

        /*
         * Required by the current Prisma schema and used
         * later to verify that submitted answers belong
         * to this exact quiz attempt.
         */
        assignedQuestionIds:
          questionIds,
      },
    });

  /*
   * ------------------------------------------------------------
   * Return questions to client
   * ------------------------------------------------------------
   */

  const questions =
    await prisma.quizQuestion.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      include: {
        skill: true,
      },
    });

  return NextResponse.json({
    quizAttemptId: attempt.id,

    questions: questions.map(
      (question) => ({
        id: question.id,

        skillId:
          question.skillId,

        prompt:
          question.prompt,

        choices:
          question.choices,

        difficulty:
          question.difficulty,

        sourceCourse:
          question.sourceCourse,

        questionType:
          questionMetadata.get(
            question.id,
          )?.questionType ??
          (
            question as Record<
              string,
              unknown
            >
          ).questionType ??
          'MULTIPLE_CHOICE',

        expectedAnswer:
          questionMetadata.get(
            question.id,
          )?.expectedAnswer,

        codeSnippet:
          questionMetadata.get(
            question.id,
          )?.codeSnippet ??
          (
            question as Record<
              string,
              unknown
            >
          ).codeSnippet ??
          null,

        isLab:
          questionMetadata.get(
            question.id,
          )?.isLab ??
          (
            question as Record<
              string,
              unknown
            >
          ).isLab ??
          false,

        /*
         * correctIndex is intentionally NOT returned
         * to the client.
         */
      }),
    ),
  });
}

/*
 * ============================================================
 * Local grounded quiz fallback
 * ============================================================
 */

function buildFallbackQuestions(
  transcripts: Awaited<
    ReturnType<
      typeof getParsedTranscripts
    >
  >,
  questionCount: number,
): QuizGeneratedQuestion[] {
  const courses =
    transcripts.flatMap(
      (transcript) =>
        Array.isArray(
          transcript.parsedCourses,
        )
          ? transcript.parsedCourses
          : [],
    );

  const uniqueCourses = courses
    .map((course) => {
      const value =
        course as {
          courseCode?: unknown;
          courseName?: unknown;
          knowledgeArea?: unknown;
        };

      return String(
        value.courseName ||
          value.knowledgeArea ||
          value.courseCode ||
          '',
      ).trim();
    })
    .filter(
      (
        course,
        index,
        all,
      ) =>
        course &&
        all.indexOf(course) ===
          index,
    );

  const selectedCourses =
    uniqueCourses.slice(
      0,
      Math.max(
        questionCount,
        3,
      ),
    );

  const labSnippets: Array<{
    course: string;
    prompt: string;
    snippet: string;
    choices: string[];
    correctIndex: number;
  }> = [
    {
      course: 'Programming',
      prompt:
        'What will the following Python code print?',
      snippet:
        'x = [1, 2, 3, 4, 5]\nresult = x[1:4]\nprint(result)',
      choices: [
        '[1, 2, 3, 4]',
        '[2, 3, 4]',
        '[1, 2, 3]',
        '[2, 3, 4, 5]',
      ],
      correctIndex: 1,
    },
    {
      course: 'Database Systems',
      prompt:
        'Which line contains the SQL syntax error?',
      snippet:
        'SELECT name, COUNT(*)\nFROM students\nWHERE grade > 3.0\nGROUP ON department\nHAVING COUNT(*) > 5;',
      choices: [
        'Line 1: SELECT clause',
        'Line 3: WHERE clause',
        'Line 4: should be GROUP BY, not GROUP ON',
        'Line 5: HAVING clause',
      ],
      correctIndex: 2,
    },
    {
      course: 'Web Development',
      prompt:
        'What does this JavaScript function return when called with [3, 1, 4, 1, 5]?',
      snippet:
        'function mystery(arr) {\n  return arr.filter((v, i) =>\n    arr.indexOf(v) === i\n  ).length;\n}',
      choices: [
        '5',
        '4',
        '3',
        'undefined',
      ],
      correctIndex: 1,
    },
    {
      course: 'Data Structures',
      prompt:
        'What is the output of this stack operation sequence?',
      snippet:
        'stack = []\nstack.append(10)\nstack.append(20)\nstack.append(30)\nstack.pop()\nstack.append(40)\nprint(stack[-1])',
      choices: [
        '10',
        '20',
        '30',
        '40',
      ],
      correctIndex: 3,
    },
    {
      course: 'Networking',
      prompt:
        'What subnet mask does this CIDR notation represent?',
      snippet:
        '# Network Configuration\nIP Address: 192.168.1.0/26\n# Question: What is the subnet mask?',
      choices: [
        '255.255.255.0',
        '255.255.255.128',
        '255.255.255.192',
        '255.255.255.224',
      ],
      correctIndex: 2,
    },
    {
      course: 'Operating Systems',
      prompt:
        'What does this shell command pipeline produce?',
      snippet:
        'echo "hello world hello" | tr " " "\\n" | sort | uniq -c | sort -rn | head -1',
      choices: [
        '2 hello',
        '1 world',
        'hello',
        '3',
      ],
      correctIndex: 0,
    },
  ];

  return Array.from(
    {
      length: questionCount,
    },
    (_, index) => {
      const course =
        selectedCourses[
          index %
            selectedCourses.length
        ] ||
        'your uploaded coursework';

      /*
       * Roughly 40% LAB questions in local fallback
       * to keep practical question variety.
       */
      const isLabQuestion =
        index % 5 === 2 ||
        index % 5 === 4;

      if (isLabQuestion) {
        const lab =
          labSnippets[
            index %
              labSnippets.length
          ];

        return {
          questionType:
            'LAB' as const,

          skillName: course,

          prompt:
            lab.prompt,

          choices:
            lab.choices,

          correctIndex:
            lab.correctIndex,

          difficulty:
            index % 3 === 0
              ? ('EASY' as const)
              : index % 3 === 1
                ? ('MEDIUM' as const)
                : ('HARD' as const),

          sourceCourse:
            course,

          codeSnippet:
            lab.snippet,

          isLab: true,
        };
      }

      return {
        questionType:
          'MULTIPLE_CHOICE' as const,

        skillName: course,

        prompt:
          `Which statement best describes a core concept you should understand from ${course}?`,

        choices: [
          `The foundational concepts and practical methods taught in ${course}`,
          'Only memorizing the course title',
          'Avoiding practice and examples',
          'The subject has no practical applications',
        ],

        correctIndex: 0,

        difficulty:
          index % 3 === 0
            ? ('EASY' as const)
            : index % 3 === 1
              ? ('MEDIUM' as const)
              : ('HARD' as const),

        sourceCourse:
          course,
      };
    },
  );
}

/*
 * ============================================================
 * Route wrapper
 * ============================================================
 */

export async function POST(
  req: NextRequest,
) {
  try {
    return await handlePost(req);
  } catch (error) {
    /*
     * Do not expose provider errors, stack traces,
     * validation internals, or database details to clients.
     */
    console.error(
      'Quiz generation failed:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Quiz generation failed. Please try again.',
      },
      {
        status: 500,
      },
    );
  }
}