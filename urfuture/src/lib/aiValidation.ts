import { z } from 'zod';

export const citationSchema = z.object({
  source: z.string().trim().min(1),
  reference: z.string().trim().min(1),
  claim: z.string().trim().min(1),
});

export const skillGapItemSchema = z.object({
  skillName: z.string().trim().min(1),
  userProficiency: z.number().min(0).max(100),
  requiredImportance: z.number().min(0).max(100),
  gap: z.number().min(0).max(100),
});

export const skillGapAnalysisSchema = z.object({
  careerTitle: z.string().trim().min(1),
  fitScore: z.number().min(0).max(100),
  matchedSkills: z.array(skillGapItemSchema),
  missingSkills: z.array(skillGapItemSchema),
  rationale: z.string().trim().min(1),
  citations: z.array(citationSchema),
  groundednessScore: z.number().min(0).max(1),
  requiresCounselorReview: z.boolean(),
  reviewReason: z.string().trim().min(1).optional(),
});

export const jobFitSchema = z.object({
  jobTitle: z.string().trim().min(1),
  extractedSkills: z.array(z.string().trim().min(1)),
  matchedSkills: z.array(z.string().trim().min(1)),
  missingSkills: z.array(z.string().trim().min(1)),
  fitScorePercent: z.number().min(0).max(100),
  summary: z.string().trim().min(1),
  needsPrep: z.boolean(),
});

export const studyPlanResourceSchema = z.object({
  title: z.string().trim().min(1),
  type: z.enum(['video', 'reading', 'practice', 'course']),
  citation: citationSchema.optional(),
});

export const studyPlanWeekSchema = z.object({
  weekNumber: z.number().int().min(1).max(12),
  focusSkill: z.string().trim().min(1),
  tasks: z.array(z.string().trim().min(1)).min(1),
  resources: z.array(studyPlanResourceSchema),
});

export const studyPlanSchema = z
  .object({
    title: z.string().trim().min(1),
    targetSkills: z.array(z.string().trim().min(1)).min(1),
    weeks: z.array(studyPlanWeekSchema).min(2).max(12),
    citations: z.array(citationSchema),
  })
  .superRefine((plan, ctx) => {
    const weekNumbers = plan.weeks.map((week) => week.weekNumber);

    if (new Set(weekNumbers).size !== weekNumbers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weeks'],
        message: 'Study plan week numbers must be unique.',
      });
    }
  });

export const quizQuestionSchema = z
  .object({
    questionType: z.enum([
      'MULTIPLE_CHOICE',
      'WRITTEN',
      'CODING',
      'LAB',
    ]),
    skillName: z.string().trim().min(1),
    onetElementId: z.string().optional(),
    prompt: z.string().trim().min(1),
    choices: z.array(z.string().trim().min(1)).min(1),
    correctIndex: z.number().int().min(0).optional(),
    expectedAnswer: z.string().trim().min(1).optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    sourceCourse: z.string().trim().min(1),
    codeSnippet: z.string().optional(),
    isLab: z.boolean().optional(),
  })
  .superRefine((question, ctx) => {
    if (
      question.correctIndex !== undefined &&
      question.correctIndex >= question.choices.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctIndex'],
        message: 'correctIndex must reference an existing choice.',
      });
    }

    if (
      question.questionType === 'LAB' &&
      (!question.codeSnippet || question.codeSnippet.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['codeSnippet'],
        message: 'LAB questions require a code snippet.',
      });
    }
  });

export const quizGenerationSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1).max(60),
});

export class InvalidAIResponseError extends Error {
  readonly issues: z.ZodIssue[];

  constructor(message: string, issues: z.ZodIssue[]) {
    super(message);
    this.name = 'InvalidAIResponseError';
    this.issues = issues;
  }
}

export function validateAIResponse<T>(
  schema: z.ZodType<T>,
  value: unknown,
  label: string,
): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    console.error(`[ai-validation] Invalid ${label} response`, {
      issues: parsed.error.issues,
    });

    throw new InvalidAIResponseError(
      `Invalid ${label} response`,
      parsed.error.issues,
    );
  }

  return parsed.data;
}