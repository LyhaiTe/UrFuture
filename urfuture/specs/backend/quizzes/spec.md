# Quizzes Specification

## Implemented endpoints

- `POST /api/quiz/generate`: generates questions from the student's parsed transcripts.
- `POST /api/quiz/evaluate`: grades submitted answers and persists the attempt.

## Implemented data

`QuizQuestion` stores course code, prompt, choices, correct index, difficulty, and
mapped skill. `QuizAttempt` stores student ownership, source transcript IDs, score,
and timestamps. `QuizAnswer` stores selected index, optional answer text,
correctness, and optional skill update.

## Implemented behavior

Questions are generated from parsed transcript context. Evaluation calculates an
overall score and upserts quiz-based skill proficiency evidence.

## Current limitation

Production-grade replay prevention and complete server-session ownership checks
are not represented as fully complete in the current prototype.
