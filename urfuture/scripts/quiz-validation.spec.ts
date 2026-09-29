import assert from 'node:assert/strict';
import { validateQuizSubmissionAnswers } from '../src/lib/quizSubmission';

const assigned = ['q1', 'q2'];

const valid = validateQuizSubmissionAnswers({
  assignedQuestionIds: assigned,
  answers: [
    { questionId: 'q1', selectedIndex: 0 },
    { questionId: 'q2', studentAnswer: '  JavaScript  ' },
  ],
});

assert.equal(valid.ok, true, 'valid answers should pass');

const duplicate = validateQuizSubmissionAnswers({
  assignedQuestionIds: assigned,
  answers: [
    { questionId: 'q1', selectedIndex: 0 },
    { questionId: 'q1', selectedIndex: 1 },
  ],
});
assert.equal(duplicate.ok, false, 'duplicate question IDs should fail');

const missingAnswer = validateQuizSubmissionAnswers({
  assignedQuestionIds: assigned,
  answers: [
    { questionId: 'q1' },
    { questionId: 'q2', selectedIndex: 0 },
  ],
});
assert.equal(missingAnswer.ok, false, 'answer without selectedIndex or studentAnswer should fail');

console.log('quiz validation checks passed');
