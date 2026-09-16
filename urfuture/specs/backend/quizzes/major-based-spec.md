# Major-Based Quiz Specification

## Data model

`CareerPath` is the major/career direction entity.

Relationships:

- `User.selectedMajorId -> CareerPath.id`
- `QuizQuestion.careerPathId -> CareerPath.id`
- `QuizAttempt.careerPathId -> CareerPath.id`

The relationships are nullable to preserve existing users, questions, and
attempts that were created before major-based quizzes were introduced.

## Generate endpoint

`POST /api/quiz/generate` accepts:

```json
{
  "userId": "student-id",
  "careerPathId": "career-path-id",
  "questionCount": 10
}
```

It also accepts `major` with the exact `CareerPath.title`. If neither is
provided, the endpoint uses the student's saved `User.selectedMajorId`.

If an explicitly supplied major cannot be found, the endpoint returns `404`.
When a major is resolved, it is saved to the user, included in the AI prompt,
stored on every generated `QuizQuestion`, and stored on the `QuizAttempt`.

## Seeded major mappings

- Software Engineer: algebra, programming fundamentals, and data structures
- Electrical Engineer: physics
- Business / Data Analyst: statistics

## Compatibility

Questions without a major remain valid for legacy data. New major-aware quiz
generation should always provide or resolve a major before persistence.
