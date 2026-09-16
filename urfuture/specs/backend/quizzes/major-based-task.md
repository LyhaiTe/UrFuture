# Major-Based Quiz Tasks

## Completed

- [x] Add `User.selectedMajorId` to the Prisma schema.
- [x] Add the optional major relation to `QuizQuestion`.
- [x] Add the optional major relation to `QuizAttempt`.
- [x] Add PostgreSQL migration for the new columns, indexes, and foreign keys.
- [x] Accept `careerPathId` during quiz generation.
- [x] Accept an exact major title during quiz generation.
- [x] Fall back to the user's saved major.
- [x] Reject explicitly unknown majors.
- [x] Persist the selected major on the user.
- [x] Include major context in quiz-generation instructions.
- [x] Persist the major on generated questions and attempts.
- [x] Seed major-specific quiz question mappings.

## Follow-up

- [ ] Add a student-facing major selector before quiz generation.
- [ ] Add a read endpoint for major-specific question banks.
- [ ] Add targeted integration tests for major selection and persistence.
