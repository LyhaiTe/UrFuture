# Quizzes Tasks

## Completed Core Features

- [x] Q001: Implement `POST /api/quiz/generate` endpoint extracting parsed courses from uploaded transcripts.
- [x] Q002: Implement `POST /api/quiz/evaluate` endpoint to calculate scores and record attempt completion.
- [x] Q003: Store questions, attempts, answers, and timestamps via Prisma in PostgreSQL.
- [x] Q004: Map diagnostic questions to specific competencies in `Skill`.
- [x] Q005: Update `UserSkill` proficiency evidence upon successful quiz completion.
- [x] Q006: Withhold correct answer keys (`QuizQuestion.correctIndex`) server-side to prevent client-side answer leaking.

## Completed Major-Based Quiz Integration

- [x] QM01: Add `User.selectedMajorId` relation to `CareerPath` in Prisma schema.
- [x] QM02: Add optional `careerPathId` foreign key to `QuizQuestion`.
- [x] QM03: Add optional `careerPathId` foreign key to `QuizAttempt`.
- [x] QM04: Create and apply PostgreSQL migration `20260916173000_major_based_quizzes`.
- [x] QM05: Support `careerPathId` and `major` title query resolution in `POST /api/quiz/generate`.
- [x] QM06: Fall back to student's saved `User.selectedMajorId` when no major is supplied.
- [x] QM07: Return 404 error when an explicitly supplied major cannot be found.
- [x] QM08: Update student's selected major on `User` when resolved in quiz generation.
- [x] QM09: Inject major-specific focus instructions into AI quiz generation prompt.
- [x] QM10: Persist `careerPathId` on all generated `QuizQuestion` and `QuizAttempt` records.
- [x] QM11: Seed major-specific diagnostic question mappings for Software Engineer, Electrical Engineer, and Business Analyst.

## Follow-up

- [ ] QM12: Add student-facing major selector dropdown before quiz generation.
- [ ] QM13: Add read endpoint to query existing question banks filtered by `careerPathId`.
- [ ] QM14: Add end-to-end integration tests for major-based question generation and grading.
