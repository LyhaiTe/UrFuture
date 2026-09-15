# Quizzes Plan

## Implemented flow
- `POST /api/quiz/generate` reads parsed transcript courses and asks Claude for quiz data.
- `QuizPanel` displays generated questions and collects answers.
- `POST /api/quiz/evaluate` grades answers and updates quiz evidence in `UserSkill`.
- Prisma stores questions, attempts, answers, scores, and completion timestamps.

## Data boundary
Question answer keys remain server-side in `QuizQuestion.correctIndex` and are
used by the evaluation route.
