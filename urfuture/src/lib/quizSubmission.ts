export type QuizSubmissionAnswer = {
  questionId: string;
  selectedIndex?: number;
  studentAnswer?: string;
};

export function validateQuizSubmissionAnswers({
  assignedQuestionIds,
  answers,
}: {
  assignedQuestionIds: string[];
  answers: QuizSubmissionAnswer[];
}):
  | {
      ok: true;
      normalizedAnswers: QuizSubmissionAnswer[];
    }
  | {
      ok: false;
      error: string;
    } {
  const submittedQuestionIds = answers.map((answer) => answer.questionId);

  if (submittedQuestionIds.length !== new Set(submittedQuestionIds).size) {
    return {
      ok: false,
      error: 'Duplicate question submissions are not allowed.',
    };
  }

  const assignedSet = new Set(assignedQuestionIds);
  const invalidQuestionIds = submittedQuestionIds.filter(
    (id) => !assignedSet.has(id),
  );

  if (invalidQuestionIds.length > 0) {
    return {
      ok: false,
      error:
        'One or more submitted questions do not belong to this quiz attempt.',
    };
  }

  if (submittedQuestionIds.length !== assignedQuestionIds.length) {
    return {
      ok: false,
      error: 'All assigned quiz questions must be submitted.',
    };
  }

  const normalizedAnswers: QuizSubmissionAnswer[] = answers.map((answer) => {
    const hasNumericSelection =
      typeof answer.selectedIndex === 'number' &&
      Number.isInteger(answer.selectedIndex) &&
      answer.selectedIndex >= 0;

    const hasWrittenAnswer =
      typeof answer.studentAnswer === 'string' &&
      answer.studentAnswer.trim().length > 0;

    if (!hasNumericSelection && !hasWrittenAnswer) {
      return {
        ...answer,
        selectedIndex: undefined,
        studentAnswer: undefined,
      };
    }

    const trimmedWrittenAnswer =
      typeof answer.studentAnswer === 'string'
        ? answer.studentAnswer.trim()
        : '';

    return {
      questionId: answer.questionId,
      selectedIndex: hasNumericSelection ? answer.selectedIndex : undefined,
      studentAnswer: hasWrittenAnswer ? trimmedWrittenAnswer : undefined,
    };
  });

  if (
    normalizedAnswers.some(
      (answer) =>
        (answer.selectedIndex === undefined && answer.studentAnswer === undefined) ||
        (typeof answer.studentAnswer === 'string' && answer.studentAnswer.trim().length === 0),
    )
  ) {
    return {
      ok: false,
      error: 'Each submitted answer must include a valid selection or written response.',
    };
  }

  return {
    ok: true,
    normalizedAnswers,
  };
}
