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

When quiz generation begins:

- The Knowledge Map remains available on the left.
- A loading state appears on the right.
- The generated quiz replaces the loading state when ready.
- The student can expand the quiz using the `<>` control.
- The student can return from full-screen quiz mode to the split-screen view.

### US3 - Understand the map (P2)

A student sees skill proficiency, source evidence, gaps, and a recommended next learning priority.

## Acceptance for All Stories

1. Student data is session-scoped and cannot be accessed by another user.
2. Invalid, empty, oversized, duplicate, and unreadable files produce clear retryable states.
3. Quiz answer keys remain server-only; a completed attempt cannot be replayed.
4. Every displayed proficiency identifies its source: transcript inference, quiz, or another verified source.
5. Empty states explain the next valid action without fabricating progress.
6. Loading and processing states clearly communicate what the system is doing.
7. Existing Knowledge Map content remains accessible while the quiz is displayed in split-screen mode.

## Requirements

### Transcript Upload

- Accept configured PDF, CSV, and text files with validated size/type limits.
- Preserve year label, original filename, parser status, normalized courses, and parse errors.
- Support coursework from Year 1 through Year 4.
- Display clear upload, parsing, success, failure, and retry states.

### Quiz Generation

- Use all parsed transcripts for quiz generation while restricting questions to observed courses.
- Provide a Generate Quiz action after valid transcript data is available.
- Display a loading state while the quiz is being generated.
- Validate AI output before persistence and bound difficulty, choices, and correct indexes.
- Keep quiz answer keys server-side.

### Quiz Interface

- Display the generated quiz on the right side of the Knowledge Map.
- Keep the Knowledge Map visible on the left during split-screen mode.
- Allow the Knowledge Map and quiz areas to scroll independently where necessary.
- Provide question and answer controls required to complete the diagnostic quiz.
- Provide an overall and per-skill result after completion.

### Quiz View Toggle

- Provide a `<>` control in the quiz interface.
- Clicking `<>` in split-screen mode expands the quiz to use the available page area.
- Full-screen quiz mode hides the Knowledge Map panel temporarily.
- Clicking `<>` again restores the split-screen layout.
- Switching views must not reset quiz answers or progress.
- View transitions should remain responsive and visually consistent with the existing dashboard.

### Knowledge & Skill Updates

- Grade and persist attempts transactionally.
- Update UserSkill rows by evidence source.
- Display proficiency based only on available evidence.
- Clearly distinguish transcript-inferred proficiency from quiz-verified proficiency.

### Interface States

Display appropriate states for:

- No transcript data
- File selected
- Uploading
- Parsing
- Parse failure
- Retry
- Quiz generation
- Quiz loading
- Active quiz
- Quiz completion
- Score results
- Skill gaps
- No skill data

## Responsive Behavior

- On desktop, the active quiz uses a split-screen layout with the Knowledge Map on the left and quiz on the right.
- The quiz can be expanded using the `<>` control.
- On smaller screens, the layout may stack vertically rather than forcing two narrow panels.
- Controls must remain accessible in both normal and expanded quiz modes.

## Success Criteria

- A fixture containing multiple academic years produces the expected normalized courses.
- No generated question references a course absent from the student's parsed data.
- A valid quiz completion produces one score and one evidence update per tested skill.
- Cross-user transcript, quiz, and skill requests are rejected.
- Generating a quiz displays the quiz area on the right without removing the student's Knowledge Map.
- The `<>` control switches between split-screen and expanded quiz views without losing quiz state.
- Failed transcript or quiz operations provide a clear retryable state.