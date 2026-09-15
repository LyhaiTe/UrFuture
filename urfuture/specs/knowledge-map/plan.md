# Implementation Plan: UrFuture Knowledge Map

**Spec**: [spec.md](spec.md)

## Existing Surface

- Upload UI: `src/components/TranscriptUpload.tsx`
- Map UI: `src/components/KnowledgeMapPanel.tsx`, `src/components/SkillRadarChart.tsx`
- Quiz UI: `src/components/QuizPanel.tsx`
- APIs: `src/app/api/transcript/upload/route.ts`, `src/app/api/quiz/generate/route.ts`, `src/app/api/quiz/evaluate/route.ts`
- Data: `Transcript`, `Skill`, `UserSkill`, `QuizQuestion`, `QuizAttempt`, `QuizAnswer`

## Delivery Steps

### IDC-1: Evidence Boundary

Add authenticated ownership checks, file limits, checksum/duplicate detection, safe local development storage, environment validation, and deterministic parser fixtures.

**Exit**: only an authenticated owner can upload/read transcript-derived data, and invalid input stops before an AI call.

### IDC-2: Transcript Normalization

Extract PDF/text/CSV parsing into `src/lib/transcriptParser.ts`. Normalize course code, name, grade, credits, term, and uncertainty. Persist status transitions and safe failure codes.

**Exit**: multi-year fixtures parse consistently and failed parsing is retryable.

### IDC-3: Quiz and Skill Evidence

Make question membership immutable per attempt, validate generated tool payloads, withhold answer keys, reject replay, grade in a transaction, and update per-skill proficiency. Refresh map data after completion.

**Exit**: upload -> quiz -> score -> map works with mocked AI and seeded PostgreSQL.

### IDC-4: Production Data Quality

Move files to object storage, add retention/deletion, parser versioning, manual correction for ambiguous courses, accessibility/mobile checks, and end-to-end tests.

**Exit**: student can inspect why each map value exists and safely correct a failed upload.

## Design Decisions

- Keep normalized parsed courses in the existing `Transcript.parsedCourses` JSON for the first increment; introduce a separate Course table only if querying/reporting requires it.
- Keep quiz questions server-owned and never send `correctIndex` to React.
- Treat transcript grades as context, not verified competency, until quiz evidence exists.
