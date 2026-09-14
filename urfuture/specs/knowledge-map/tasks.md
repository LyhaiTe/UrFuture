# Tasks: UrFuture Knowledge Map

- [ ] K001 [IDC-1] Add session ownership guards to transcript, quiz, and skill-related routes in `src/app/api/`.
- [ ] K002 [IDC-1] Add file type, size, empty-file, checksum, and duplicate validation in `src/lib/transcriptParser.ts`.
- [ ] K003 [IDC-1] Add parser fixtures for text, CSV, valid PDF, scanned/unreadable, and malformed inputs in `tests/fixtures/transcripts/`.
- [ ] K004 [IDC-1] Add ownership and input contract tests in `tests/contract/knowledge-map-ownership.test.ts`.
- [ ] K005 [IDC-2] Implement normalized transcript extraction in `src/lib/transcriptParser.ts`.
- [ ] K006 [IDC-2] Refactor `src/app/api/transcript/upload/route.ts` to persist safe status/error metadata and parser version.
- [ ] K007 [IDC-2] Update `src/components/TranscriptUpload.tsx` with progress, duplicate, failure, retry, and parsed-course states.
- [ ] K008 [IDC-2] Add parser normalization tests in `tests/unit/transcriptParser.test.ts`.
- [ ] K009 [IDC-3] Add runtime schemas for generated quiz payloads in `src/lib/claude.ts` or `src/lib/aiContracts.ts`.
- [ ] K010 [IDC-3] Add immutable attempt/question linkage to `prisma/schema.prisma` and create a migration.
- [ ] K011 [IDC-3] Refactor `src/app/api/quiz/generate/route.ts` to scope courses and withhold answer keys.
- [ ] K012 [IDC-3] Refactor `src/app/api/quiz/evaluate/route.ts` for answer validation, transactional grading, and replay rejection.
- [ ] K013 [IDC-3] Update `src/components/QuizPanel.tsx` and `src/components/KnowledgeMapPanel.tsx` for score, source, empty, and error states.
- [ ] K014 [IDC-3] Add quiz contract tests in `tests/contract/knowledge-map-quiz.test.ts`.
- [ ] K015 [IDC-4] Add object storage, retention, deletion, and signed access for transcript files.
- [ ] K016 [IDC-4] Add browser journey tests in `tests/e2e/knowledge-map.spec.ts`.
- [ ] K017 [IDC-4] Run Prisma validation, focused tests, typecheck, and `npm run build`.
