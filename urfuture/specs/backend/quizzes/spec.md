# Quizzes Specification

## Implemented Endpoints

- `POST /api/quiz/generate`: Generates diagnostic questions from the student's parsed transcript coursework and selected major.
- `POST /api/quiz/evaluate`: Grades submitted answers, persists the attempt, and updates skill proficiency evidence.

## Data Model & Relationships

- `CareerPath` acts as the major and career direction entity.
- Relationships:
  - `User.selectedMajorId -> CareerPath.id`
  - `QuizQuestion.careerPathId -> CareerPath.id`
  - `QuizAttempt.careerPathId -> CareerPath.id`
- Relationships are nullable to maintain compatibility with legacy users, questions, and attempts created before major-based quizzes were introduced.
- `QuizQuestion`: Stores course code, prompt, choices, correct index, difficulty, mapped skill, and optional `careerPathId`.
- `QuizAttempt`: Stores student ownership, selected major (`careerPathId`), source transcript IDs, score, and timestamps.
- `QuizAnswer`: Stores selected index, optional student answer text, correctness, and optional skill update.

## Major-Based Generation Behavior

`POST /api/quiz/generate` accepts:

```json
{
  "userId": "student-id",
  "careerPathId": "career-path-id",
  "major": "Exact CareerPath Title",
  "questionCount": 10
}
```

- If `careerPathId` or `major` is provided:
  - Resolves the major from the database.
  - Returns `404` if the explicitly requested major is not found.
  - Updates the student's `User.selectedMajorId` to persist their selection.
- If neither is provided:
  - Falls back to the student's saved `User.selectedMajorId`.
  - If no major is saved, questions are generated broadly from the uploaded transcript coursework.
- The resolved major is injected into the AI system/user prompt, directing questions to emphasize knowledge areas relevant to that major.
- Every generated `QuizQuestion` and the `QuizAttempt` shell are stamped with the `careerPathId`.

## Seeded Major Mappings

- **Software Engineer**: Algebra, programming fundamentals, and data structures.
- **Electrical Engineer**: Physics and circuit fundamentals.
- **Business / Data Analyst**: Statistics and quantitative methods.

## Compatibility & Oversight Limitations

- Questions without an associated major remain valid for legacy data.
- New major-aware quiz generations resolve and associate a major whenever available.
- Correct answer keys remain strictly server-side in `QuizQuestion.correctIndex`.
- AI and diagnostic evaluation outputs serve as advisory decision-support benchmarks and do not represent binding university admissions or course grading.
