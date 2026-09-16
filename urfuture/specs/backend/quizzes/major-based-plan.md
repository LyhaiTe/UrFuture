# Major-Based Quiz Plan

## Objective

Make diagnostic quizzes depend on the student's selected major and persist that
relationship in PostgreSQL through Prisma.

## Completed approach

- Treat the existing `CareerPath` model as the major/career direction catalog.
- Store the student's selected major on `User.selectedMajorId`.
- Link each `QuizQuestion` to an optional `CareerPath`.
- Link each `QuizAttempt` to the selected major used to generate it.
- Allow quiz generation to receive a career path ID or major title.
- Fall back to the student's saved major when no major is supplied.
- Include major context in the AI quiz-generation request.
- Seed representative questions for Software Engineer, Electrical Engineer, and
  Business / Data Analyst.

## Behavior

When a major is selected, generated questions are associated with that major
and the attempt records the same major. This preserves which major the student
was assessed against and allows future endpoints to filter question banks by
major.
