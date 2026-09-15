# Feature Specification: UrFuture Knowledge Map

**Status**: Draft
**Source**: `src/components/TranscriptUpload.tsx`, `src/components/KnowledgeMapPanel.tsx`, `src/components/QuizPanel.tsx`, transcript and quiz API routes

## Goal

Turn a student's multi-year coursework into a transparent, evidence-backed skill profile by parsing transcripts, testing knowledge, and displaying current strengths and gaps.

## User Stories

### US1 - Upload coursework (P1)
A student uploads transcripts for Year 1-4 and sees parse status and extracted courses.

### US2 - Take a diagnostic quiz (P1)
A student generates a quiz only from parsed coursework, answers it, and receives an overall and per-skill score.

### US3 - Understand the map (P2)
A student sees skill proficiency, source evidence, gaps, and a recommended next learning priority.

**Acceptance for all stories**:
1. Student data is session-scoped and cannot be accessed by another user.
2. Invalid, empty, oversized, duplicate, and unreadable files produce clear retryable states.
3. Quiz answer keys remain server-only; a completed attempt cannot be replayed.
4. Every displayed proficiency identifies its source: transcript inference, quiz, or another verified source.
5. Empty states explain the next valid action without fabricating progress.

## Requirements

- Accept configured PDF, CSV, and text files with validated size/type limits.
- Preserve year label, original filename, parser status, normalized courses, and parse errors.
- Use all parsed transcripts for quiz generation while restricting questions to observed courses.
- Validate AI output before persistence and bound difficulty, choices, and correct indexes.
- Grade and persist attempts transactionally; update UserSkill rows by evidence source.
- Display loading, parsing, failure, retry, no-data, score, and skill-gap states.

## Success Criteria

- A fixture containing multiple academic years produces the expected normalized courses.
- No generated question references a course absent from the student's parsed data.
- A valid quiz completion produces one score and one evidence update per tested skill.
- Cross-user transcript, quiz, and skill requests are rejected.
