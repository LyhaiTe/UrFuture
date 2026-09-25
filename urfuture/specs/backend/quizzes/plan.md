# Quizzes Implementation Plan

## Objective

Provide personalized diagnostic quizzes grounded in the student's uploaded transcript coursework and aligned with their declared or target academic major (`CareerPath`), persisting the results to update verified skill evidence.

## Implemented Flow

1. **Generation (`POST /api/quiz/generate`)**:
   - Reads the student's `PARSED` transcripts from PostgreSQL via `getParsedTranscripts(userId)`.
   - Resolves target major from `careerPathId`, `major` string, or the student's saved `User.selectedMajorId`.
   - Injects both transcript course summaries and major context into the Claude prompt via `GENERATE_QUIZ_TOOL`.
   - Persists generated `QuizQuestion` rows (with `careerPathId`) and initializes a `QuizAttempt` shell.
   - Falls back gracefully to transcript-grounded rule-based questions if the AI provider is unavailable.
2. **Taking Quiz (`QuizPanel.tsx`)**:
   - Presents questions, timers, and choices to the student.
   - Prevents exposure of `correctIndex` to the browser.
3. **Evaluation (`POST /api/quiz/evaluate`)**:
   - Matches submitted choices against server-side `QuizQuestion.correctIndex`.
   - Computes overall attempt percentage and per-question correctness.
   - Persists `QuizAnswer` records.
   - Upserts skill evidence into `UserSkill` with `source: QUIZ`.

## Major-Based Architecture

- **Major Entity**: Uses `CareerPath` as the unified major catalog and career pathway definition.
- **Student Profile**: Persists the student's active major on `User.selectedMajorId`.
- **Question Bank Linking**: Links `QuizQuestion.careerPathId` to allow future filtering of question banks by academic department/major.
- **Attempt History**: Records `QuizAttempt.careerPathId` to track a student's diagnostic performance progression within a specific discipline.

## Data Boundaries

- Correct answers are withheld server-side and only evaluated in `/api/quiz/evaluate`.
- All operations enforce student ownership boundaries.
