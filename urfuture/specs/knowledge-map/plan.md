# Implementation Plan: UrFuture Knowledge Map

**Spec**: [spec.md](spec.md)

**Status**: In Progress

## Overview

The Knowledge Map feature transforms a student's uploaded coursework into a structured view of skills, knowledge areas, and learning gaps.

The implementation combines transcript upload, diagnostic quiz generation, quiz results, and skill visualization into one workflow. The frontend should remain usable during development even when the full transcript parsing and AI backend are not yet available.

## Existing Surface

- Upload UI: `src/components/TranscriptUpload.tsx`
- Knowledge Map UI: `src/components/KnowledgeMapPanel.tsx`
- Skill visualization: `src/components/SkillRadarChart.tsx`
- Quiz UI: `src/components/QuizPanel.tsx`
- Main dashboard: `src/components/DashboardWorkspace.tsx`
- Main application: `src/app/page.tsx`

### API Routes

- Transcript upload: `src/app/api/transcript/upload/route.ts`
- Quiz generation: `src/app/api/quiz/generate/route.ts`
- Quiz evaluation: `src/app/api/quiz/evaluate/route.ts`

### Data Models

- `Transcript`
- `Skill`
- `UserSkill`
- `QuizQuestion`
- `QuizAttempt`
- `QuizAnswer`

---

## Delivery Steps

### KM-1: Knowledge Map Interface

Build the main Knowledge Map workspace and organize the student learning information into clear sections.

The page should contain:

- Upload Coursework Transcripts
- Knowledge Map overview
- Skill proficiency indicators
- Knowledge gaps
- Recommended next steps
- Skill relationships
- Diagnostic quiz functionality

The upload section should appear near the top of the Knowledge Map so the student can immediately provide coursework before interacting with dependent features.

**Exit Criteria**:

- Knowledge Map page loads correctly.
- Main sections are visually organized.
- Empty states clearly explain what the student should do next.
- Layout works with the existing UrFuture dashboard design.

---

### KM-2: Transcript Upload Interface

Implement the transcript upload workflow for coursework from Year 1 to Year 4.

The interface should support:

- Academic year selection
- PDF, CSV, and text files
- File selection
- Upload status
- Parsing/loading state
- Success state
- Failure state
- Retry behavior

The frontend should preserve:

- Academic year
- Original filename
- Upload status
- Parser status
- Extracted course information
- Parse errors

During frontend development, mock data may be used when the backend parser is unavailable.

**Exit Criteria**:

- Student can select a transcript.
- Selected filename is displayed.
- Upload and parsing states are visible.
- Invalid or failed uploads show understandable feedback.
- Successful uploads enable the quiz-generation workflow.

---

### KM-3: Inline Quiz Generation

Move the **Generate Quiz From Transcripts** action into the transcript workflow.

The Generate Quiz button should appear alongside or near the **Upload & Parse** action.

Button behavior:

1. Initially disabled when no transcript data exists.
2. Enabled after transcript data becomes available.
3. Shows a loading state after being clicked.
4. Opens the quiz interface on the right side of the Knowledge Map.
5. Uses transcript-derived coursework as the intended quiz source.

For frontend-only development, mock quiz questions can be displayed after the loading state.

**Exit Criteria**:

- Generate Quiz button is clearly visible.
- Button state reflects transcript availability.
- Loading feedback appears during generation.
- Quiz appears on the right side after generation.

---

### KM-4: Split-Screen Quiz View

Implement a split-screen layout after quiz generation.

Default layout:

- **Left panel:** Knowledge Map and transcript-related content
- **Right panel:** Diagnostic Quiz

The two areas should remain visually separated and usable without navigating away from the Knowledge Map page.

The right panel should contain:

- Quiz title
- Current question
- Multiple-choice answers
- Question progress
- Previous/Next controls
- Submit action
- Quiz completion state

Both panels should support scrolling when their content exceeds the available viewport.

**Exit Criteria**:

- Quiz opens on the right side.
- Knowledge Map remains visible on the left.
- Quiz can be completed without leaving the page.
- Layout remains usable on common screen sizes.

---

### KM-5: Quiz Full-Screen Toggle

Add a `< >` expand/collapse control to the quiz panel.

When the student selects the expand control:

- Hide the left Knowledge Map panel.
- Expand the quiz to the available content width.
- Keep the quiz state and current question unchanged.

When selected again:

- Restore the split-screen layout.
- Restore the Knowledge Map panel.
- Preserve all quiz progress.

A close control may also return the user to the normal Knowledge Map view without displaying the quiz.

**Exit Criteria**:

- `< >` control expands the quiz.
- `< >` control restores split-screen mode.
- Quiz progress is preserved between layouts.
- Transition does not reload or restart the quiz.

---

### KM-6: Transcript Normalization

Extract transcript parsing logic into:

`src/lib/transcriptParser.ts`

Normalize:

- Course code
- Course name
- Grade
- Credits
- Academic term
- Academic year
- Parsing confidence or uncertainty

Persist parser states so the frontend can distinguish between:

- Uploading
- Parsing
- Parsed
- Failed
- Retry required

**Exit Criteria**:

- Multi-year transcript fixtures produce consistent normalized courses.
- Failed parsing produces a retryable state.
- Parsed course data can be used by quiz generation.

---

### KM-7: Quiz and Skill Evidence

Connect quiz performance with the student's Knowledge Map.

Quiz questions should be generated only from coursework observed in successfully parsed transcripts.

The system should:

- Validate generated quiz data.
- Keep answer keys server-side.
- Prevent completed attempts from being replayed.
- Calculate overall quiz score.
- Calculate relevant per-skill results.
- Update skill proficiency after completion.
- Refresh Knowledge Map information after quiz completion.

**Exit Criteria**:

The complete workflow functions as:

`Upload Transcript -> Parse -> Generate Quiz -> Complete Quiz -> Score -> Update Knowledge Map`

A completed quiz produces a score and updates evidence for tested skills.

---

### KM-8: Evidence and Data Protection

Ensure transcript, quiz, and skill information belongs to the authenticated student.

Implement:

- User ownership checks
- File type validation
- File size limits
- Duplicate detection
- Safe error handling
- Session-scoped student data
- Server-owned quiz answers

Invalid input should be rejected before unnecessary AI processing occurs.

**Exit Criteria**:

- Users cannot access another student's transcript data.
- Users cannot access another student's quiz attempts.
- Users cannot access another student's skill profile.
- Invalid files fail safely.
- Correct quiz answers are never exposed to the client before evaluation.

---

### KM-9: Production Data Quality

Prepare the Knowledge Map workflow for production use.

Future improvements include:

- Object storage for uploaded transcripts
- File retention and deletion
- Parser version tracking
- Manual correction for ambiguous courses
- Accessibility checks
- Responsive/mobile improvements
- End-to-end tests
- Better AI output validation

**Exit Criteria**:

- Student can understand where skill values came from.
- Failed uploads can be corrected or retried.
- Knowledge Map remains traceable to transcript or quiz evidence.

---

## Frontend Interaction Flow

The intended student workflow is:

1. Open **Knowledge Map**.
2. Select an academic year.
3. Select a coursework transcript.
4. Click **Upload & Parse**.
5. Wait for transcript processing.
6. Click **Generate Quiz From Transcripts**.
7. Quiz loads on the right side of the page.
8. Student completes the diagnostic quiz.
9. Student may use `< >` to expand the quiz to full-screen.
10. Quiz results update the student's skill evidence.
11. Knowledge Map displays updated strengths, gaps, and recommendations.

---

## Design Decisions

- Keep normalized parsed courses in the existing `Transcript.parsedCourses` JSON for the first increment.
- Introduce a separate `Course` table only if future querying or reporting requires it.
- Keep quiz questions and answer keys server-owned.
- Never send `correctIndex` to React before evaluation.
- Treat transcript grades as contextual evidence rather than verified competency.
- Use diagnostic quiz performance as stronger competency evidence.
- Every displayed proficiency should identify its evidence source.
- Keep the Knowledge Map visible while taking a quiz through the split-screen layout.
- Allow the quiz to expand without losing its current state.
- Support mock frontend data while backend/AI functionality is still under development.

---

## Completion Criteria

The Knowledge Map feature is considered complete when a student can:

- Upload coursework transcripts.
- See transcript processing feedback.
- Generate a diagnostic quiz.
- Take the quiz in split-screen mode.
- Expand and collapse the quiz using the `< >` control.
- Complete the quiz and receive a score.
- See skill proficiency and gaps.
- Understand the evidence behind displayed skill levels.
- Receive a recommended next learning priority.