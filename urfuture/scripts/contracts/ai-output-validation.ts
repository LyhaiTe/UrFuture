import {
    skillGapAnalysisSchema,
    jobFitSchema,
    studyPlanSchema,
    quizGenerationSchema,
  } from '../../src/lib/aiValidation';
  
  let passed = 0;
  let failed = 0;
  
  function expectValid(
    name: string,
    schema: { safeParse: (value: unknown) => { success: boolean } },
    value: unknown,
  ) {
    const result = schema.safeParse(value);
  
    if (result.success) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.error(`✗ ${name} — expected valid response`);
      failed++;
    }
  }
  
  function expectInvalid(
    name: string,
    schema: { safeParse: (value: unknown) => { success: boolean } },
    value: unknown,
  ) {
    const result = schema.safeParse(value);
  
    if (!result.success) {
      console.log(`✓ ${name}`);
      passed++;
    } else {
      console.error(`✗ ${name} — expected validation failure`);
      failed++;
    }
  }
  
  /*
   * ============================================================
   * Career recommendation validation
   * ============================================================
   */
  
  const validCareer = {
    careerTitle: 'Software Engineer',
    fitScore: 82,
    matchedSkills: [
      {
        skillName: 'Programming',
        userProficiency: 80,
        requiredImportance: 90,
        gap: 10,
      },
    ],
    missingSkills: [
      {
        skillName: 'Cloud Computing',
        userProficiency: 30,
        requiredImportance: 80,
        gap: 50,
      },
    ],
    rationale:
      'The student has strong programming fundamentals.',
    citations: [
      {
        source: 'O*NET',
        reference: '15-1252.00',
        claim: 'Programming is relevant to software development.',
      },
    ],
    groundednessScore: 0.95,
    requiresCounselorReview: false,
  };
  
  expectValid(
    'career: accepts valid recommendation',
    skillGapAnalysisSchema,
    validCareer,
  );
  
  expectInvalid(
    'career: rejects fit score above 100',
    skillGapAnalysisSchema,
    {
      ...validCareer,
      fitScore: 145,
    },
  );
  
  expectInvalid(
    'career: rejects negative fit score',
    skillGapAnalysisSchema,
    {
      ...validCareer,
      fitScore: -5,
    },
  );
  
  expectInvalid(
    'career: rejects groundedness above 1',
    skillGapAnalysisSchema,
    {
      ...validCareer,
      groundednessScore: 1.5,
    },
  );
  
  expectInvalid(
    'career: rejects malformed citation',
    skillGapAnalysisSchema,
    {
      ...validCareer,
      citations: [
        {
          source: '',
          reference: '',
          claim: '',
        },
      ],
    },
  );
  
  /*
   * ============================================================
   * Job-fit validation
   * ============================================================
   */
  
  const validJobFit = {
    jobTitle: 'Frontend Developer',
    extractedSkills: [
      'JavaScript',
      'React',
    ],
    matchedSkills: [
      'JavaScript',
    ],
    missingSkills: [
      'React',
    ],
    fitScorePercent: 70,
    summary:
      'The student matches some of the required skills.',
    needsPrep: true,
  };
  
  expectValid(
    'job fit: accepts valid result',
    jobFitSchema,
    validJobFit,
  );
  
  expectInvalid(
    'job fit: rejects score above 100',
    jobFitSchema,
    {
      ...validJobFit,
      fitScorePercent: 150,
    },
  );
  
  expectInvalid(
    'job fit: rejects score below 0',
    jobFitSchema,
    {
      ...validJobFit,
      fitScorePercent: -20,
    },
  );
  
  expectInvalid(
    'job fit: rejects missing summary',
    jobFitSchema,
    {
      ...validJobFit,
      summary: '',
    },
  );
  
  /*
   * ============================================================
   * Study-plan validation
   * ============================================================
   */
  
  const validWeek = {
    weekNumber: 1,
    focusSkill: 'React',
    tasks: [
      'Review React components',
    ],
    resources: [
      {
        title: 'React coursework',
        type: 'reading' as const,
        citation: {
          source: 'Course syllabus',
          reference: 'Week 4',
          claim:
            'React components are included in the course.',
        },
      },
    ],
  };
  
  const validStudyPlan = {
    title: 'Frontend Development Plan',
    targetSkills: [
      'React',
      'TypeScript',
    ],
    weeks: [
      validWeek,
      {
        ...validWeek,
        weekNumber: 2,
        focusSkill: 'TypeScript',
      },
    ],
    citations: [
      {
        source: 'Course syllabus',
        reference: 'Week 4',
        claim:
          'React is included in the course.',
      },
    ],
  };
  
  expectValid(
    'study plan: accepts valid plan',
    studyPlanSchema,
    validStudyPlan,
  );
  
  expectInvalid(
    'study plan: rejects fewer than 2 weeks',
    studyPlanSchema,
    {
      ...validStudyPlan,
      weeks: [validWeek],
    },
  );
  
  expectInvalid(
    'study plan: rejects more than 12 weeks',
    studyPlanSchema,
    {
      ...validStudyPlan,
      weeks: Array.from(
        { length: 13 },
        (_, index) => ({
          ...validWeek,
          weekNumber: index + 1,
        }),
      ),
    },
  );
  
  expectInvalid(
    'study plan: rejects duplicate week numbers',
    studyPlanSchema,
    {
      ...validStudyPlan,
      weeks: [
        validWeek,
        {
          ...validWeek,
          weekNumber: 1,
        },
      ],
    },
  );
  
  expectInvalid(
    'study plan: rejects malformed resource citation',
    studyPlanSchema,
    {
      ...validStudyPlan,
      weeks: [
        {
          ...validWeek,
          resources: [
            {
              title: 'Unknown resource',
              type: 'reading',
              citation: {
                source: '',
                reference: '',
                claim: '',
              },
            },
          ],
        },
        {
          ...validWeek,
          weekNumber: 2,
        },
      ],
    },
  );
  
  /*
   * ============================================================
   * Quiz validation
   * ============================================================
   */
  
  const validQuiz = {
    questions: [
      {
        questionType: 'MULTIPLE_CHOICE',
        skillName: 'Programming',
        prompt:
          'Which statement correctly describes an array?',
        choices: [
          'A collection of values',
          'A database server',
          'A network cable',
          'An operating system',
        ],
        correctIndex: 0,
        difficulty: 'EASY',
        sourceCourse:
          'Introduction to Programming',
        isLab: false,
      },
    ],
  };
  
  expectValid(
    'quiz: accepts valid quiz',
    quizGenerationSchema,
    validQuiz,
  );
  
  expectInvalid(
    'quiz: rejects invalid difficulty',
    quizGenerationSchema,
    {
      questions: [
        {
          ...validQuiz.questions[0],
          difficulty: 'IMPOSSIBLE',
        },
      ],
    },
  );
  
  expectInvalid(
    'quiz: rejects correctIndex outside choices',
    quizGenerationSchema,
    {
      questions: [
        {
          ...validQuiz.questions[0],
          correctIndex: 10,
        },
      ],
    },
  );
  
  expectInvalid(
    'quiz: rejects LAB without code snippet',
    quizGenerationSchema,
    {
      questions: [
        {
          ...validQuiz.questions[0],
          questionType: 'LAB',
          isLab: true,
        },
      ],
    },
  );
  
  expectInvalid(
    'quiz: rejects missing source course',
    quizGenerationSchema,
    {
      questions: [
        {
          questionType:
            'MULTIPLE_CHOICE',
          skillName: 'Programming',
          prompt: 'Test question',
          choices: [
            'A',
            'B',
          ],
          correctIndex: 0,
          difficulty: 'EASY',
        },
      ],
    },
  );
  
  expectInvalid(
    'quiz: rejects more than 60 questions',
    quizGenerationSchema,
    {
      questions: Array.from(
        { length: 61 },
        () => ({
          ...validQuiz.questions[0],
        }),
      ),
    },
  );
  
  /*
   * ============================================================
   * Results
   * ============================================================
   */
  
  console.log('\n------------------------------');
  console.log(
    `AI validation tests: ${passed} passed, ${failed} failed`,
  );
  console.log('------------------------------');
  
  if (failed > 0) {
    process.exit(1);
  }
  
  console.log(
    '✓ All AI output validation tests passed.',
  );