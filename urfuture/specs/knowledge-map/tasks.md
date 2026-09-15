# Tasks: UrFuture Knowledge Map

**Spec**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md)  
**Status**: In Progress

## KM-1: Knowledge Map Interface

- [ ] K001 [KM-1] Organize the Knowledge Map workspace in `src/components/KnowledgeMapPanel.tsx`.

- [ ] K002 [KM-1] Place the Upload Coursework Transcripts section near the top of the Knowledge Map.

- [ ] K003 [KM-1] Display skill proficiency, knowledge gaps, recommended next steps, and skill relationships.

- [ ] K004 [KM-1] Add clear empty states when transcript, quiz, or skill data is unavailable.

- [ ] K005 [KM-1] Ensure the Knowledge Map layout matches the existing UrFuture dashboard design.

---

## KM-2: Transcript Upload

- [ ] K006 [KM-2] Support academic year selection for Year 1 through Year 4 in `src/components/TranscriptUpload.tsx`.

- [ ] K007 [KM-2] Support configured PDF, CSV, and text transcript files.

- [ ] K008 [KM-2] Display the selected transcript filename before upload.

- [ ] K009 [KM-2] Add upload, parsing, success, failure, and retry states.

- [ ] K010 [KM-2] Add file type, size, empty-file, checksum, and duplicate validation in `src/lib/transcriptParser.ts`.

- [ ] K011 [KM-2] Preserve academic year, filename, parser status, parsed courses, and safe error information.

---

## KM-3: Inline Quiz Generation

- [ ] K012 [KM-3] Move the **Generate Quiz From Transcripts** button into the transcript upload workflow.

- [ ] K013 [KM-3] Position the Generate Quiz action alongside or near the **Upload & Parse** button.

- [ ] K014 [KM-3] Keep Generate Quiz disabled until transcript data is available.

- [ ] K015 [KM-3] Add a loading state while quiz generation is processing.

- [ ] K016 [KM-3] Display the generated quiz on the right side of the Knowledge Map after processing.

- [ ] K017 [KM-3] Provide mock quiz data for frontend development when the quiz API is unavailable.

---

## KM-4: Split-Screen Quiz

- [ ] K018 [KM-4] Implement split-screen mode in `src/components/KnowledgeMapPanel.tsx`.

- [ ] K019 [KM-4] Keep Knowledge Map and transcript content in the left panel.

- [ ] K020 [KM-4] Render `QuizPanel.tsx` in the right panel after quiz generation.

- [ ] K021 [KM-4] Allow the left and right panels to scroll appropriately.

- [ ] K022 [KM-4] Add smooth layout transitions when the quiz opens or closes.

- [ ] K023 [KM-4] Ensure the split-screen layout remains usable on common desktop screen sizes.

---

## KM-5: Quiz Full-Screen Toggle

- [ ] K024 [KM-5] Add the `< >` expand/collapse control to the quiz panel header.

- [ ] K025 [KM-5] Expand the quiz to the available content width when `< >` is selected.

- [ ] K026 [KM-5] Hide the Knowledge Map panel while the quiz is expanded.

- [ ] K027 [KM-5] Restore split-screen mode when `< >` is selected again.

- [ ] K028 [KM-5] Preserve the current question, answers, and quiz progress when switching layouts.

- [ ] K029 [KM-5] Add a close action that returns to the normal Knowledge Map view.

---

## KM-6: Transcript Normalization

- [ ] K030 [KM-6] Implement normalized transcript extraction in `src/lib/transcriptParser.ts`.

- [ ] K031 [KM-6] Normalize course code, course name, grade, credits, academic term, and academic year.

- [ ] K032 [KM-6] Refactor `src/app/api/transcript/upload/route.ts` to persist parser status and safe errors.

- [ ] K033 [KM-6] Add parser fixtures for text, CSV, valid PDF, unreadable, and malformed inputs in `tests/fixtures/transcripts/`.

- [ ] K034 [KM-6] Add parser normalization tests in `tests/unit/transcriptParser.test.ts`.

---

## KM-7: Quiz and Skill Evidence

- [ ] K035 [KM-7] Add runtime validation schemas for generated quiz payloads in `src/lib/aiContracts.ts`.

- [ ] K036 [KM-7] Restrict generated quiz questions to courses found in the student's parsed transcripts.

- [ ] K037 [KM-7] Refactor `src/app/api/quiz/generate/route.ts` to withhold answer keys from the client.

- [ ] K038 [KM-7] Add immutable quiz attempt/question linkage to `prisma/schema.prisma`.

- [ ] K039 [KM-7] Refactor `src/app/api/quiz/evaluate/route.ts` for answer validation and transactional grading.

- [ ] K040 [KM-7] Reject replay of completed quiz attempts.

- [ ] K041 [KM-7] Calculate overall quiz score and relevant per-skill scores.

- [ ] K042 [KM-7] Update `UserSkill` evidence after successful quiz completion.

- [ ] K043 [KM-7] Refresh Knowledge Map data after quiz completion.

- [ ] K044 [KM-7] Display the evidence source for each proficiency value.

---

## KM-8: Data Protection

- [ ] K045 [KM-8] Add session ownership guards to transcript, quiz, and skill-related routes in `src/app/api/`.

- [ ] K046 [KM-8] Reject cross-user transcript requests.

- [ ] K047 [KM-8] Reject cross-user quiz requests.

- [ ] K048 [KM-8] Reject cross-user skill-profile requests.

- [ ] K049 [KM-8] Ensure quiz answer keys remain server-only.

- [ ] K050 [KM-8] Add ownership and input contract tests in `tests/contract/knowledge-map-ownership.test.ts`.

- [ ] K051 [KM-8] Add quiz contract tests in `tests/contract/knowledge-map-quiz.test.ts`.

---

## KM-9: Production and Quality

- [ ] K052 [KM-9] Add object storage for uploaded transcript files.

- [ ] K053 [KM-9] Add transcript retention and deletion behavior.

- [ ] K054 [KM-9] Add parser version tracking.

- [ ] K055 [KM-9] Add manual correction support for ambiguous parsed courses.

- [ ] K056 [KM-9] Check Knowledge Map accessibility and responsive behavior.

- [ ] K057 [KM-9] Add browser journey tests in `tests/e2e/knowledge-map.spec.ts`.

- [ ] K058 [KM-9] Run Prisma validation and required migrations.

- [ ] K059 [KM-9] Run focused unit and contract tests.

- [ ] K060 [KM-9] Run TypeScript type checking.

- [ ] K061 [KM-9] Run `npm run build` and resolve remaining build errors.

---

## Final User Flow Validation

- [ ] K062 Verify student can select and upload a transcript.

- [ ] K063 Verify transcript processing/loading feedback is displayed.

- [ ] K064 Verify **Generate Quiz From Transcripts** becomes available after transcript data exists.

- [ ] K065 Verify quiz opens on the right side in split-screen mode.

- [ ] K066 Verify `< >` expands the quiz to full-screen.

- [ ] K067 Verify `< >` restores the split-screen layout.

- [ ] K068 Verify quiz state is preserved when switching between layouts.

- [ ] K069 Verify completing the quiz displays a score.

- [ ] K070 Verify quiz results update Knowledge Map skill evidence.

- [ ] K071 Verify Knowledge Map displays strengths, gaps, evidence sources, and recommended next steps.