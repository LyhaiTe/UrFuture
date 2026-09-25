# Implementation Plan: UrFuture Copilot Chat

**Spec**: [spec.md](spec.md)

## Surface Architecture

- **UI Component**: `src/components/ChatPanel.tsx`
- **Chat Streaming Route**: `src/app/api/chat/route.ts`
- **Conversation List & Hydration**: `src/app/api/chat/conversations/route.ts`
- **Individual Conversation Route**: `src/app/api/chat/conversations/[id]/route.ts`
- **Prompt & Guardrails**: `src/lib/prompts.ts`, `src/lib/guardrails.ts`, `src/lib/knowledgeBase.ts`
- **Database Models**: `Conversation`, `Message`, `CounselorReview`, `UserSkill`, `Transcript`, `User` in `prisma/schema.prisma`

---

## Phase Breakdown

### Phase 1: Conversation Lifecycle & History Hydration
1. **API Endpoints**:
   - `GET /api/chat/conversations?userId=...`: Returns user profile, conversation summaries (ordered by `updatedAt DESC`), and pre-hydrated messages for the active conversation.
   - `POST /api/chat/conversations`: Allows explicit thread initialization.
   - `GET /api/chat/conversations/[id]`: Returns message history for a specific thread.
   - `DELETE /api/chat/conversations/[id]`: Deletes conversation with cascade deletion of related messages.
2. **UI Hydration**:
   - Integrate `useEffect` on `ChatPanel.tsx` mount to load the active conversation.
   - Add "New Chat" button to reset state and load a personalized greeting.
   - Add "History" dropdown to list, switch, and delete conversation threads.

### Phase 2: Student Context Enrichment & Prompt Personalization
1. **Context Extraction**:
   - Query user details (`name`, `educationLevel`, `university`, `institution`, `selectedMajor`).
   - Query `UserSkill` via `getStudentSkillContext(userId)` to extract top verified proficiencies.
   - Query `Transcript` via `getParsedTranscripts(userId)` to calculate cumulative GPA and extract completed courses (course codes, titles, grades, credits).
2. **Prompt Injection**:
   - Assemble a compact `STUDENT PROFILE & ACADEMIC CONTEXT` block inside `src/app/api/chat/route.ts`.
   - Update `BASE_SYSTEM_PROMPT` in `src/lib/prompts.ts` with explicit rules instructing Claude to synthesize the student's courses and GPA when answering prerequisite, timeline, or career questions.

### Phase 3: High-Stakes Guardrails & Counselor Escalation
1. **Keyword Triggers**:
   - Expand `HIGH_STAKES_KEYWORDS` in `src/types/index.ts` to include `academic probation`, `faculty transfer`, `switch faculty`, and `dropout` variations.
2. **Database Logging**:
   - When `containsHighStakesSignal(message)` evaluates to `true`, insert a row into `prisma.counselorReview` with `status: 'PENDING'`.
3. **Real-Time Notification**:
   - Transmit an `event: high_stakes_alert` SSE event down the stream.
   - Display an advisory banner in `ChatPanel.tsx` notifying the student that an advisor review ticket has been created.

### Phase 4: Markdown Fidelity, Code Copying & Citations
1. **Full GFM Markdown**:
   - Configure `ReactMarkdown` with `remark-gfm` in `ChatPanel.tsx`.
   - Add styling for headings (`h1`-`h4`), blockquotes, horizontal rules, and tables.
   - Ensure markdown links (`a`) render as clickable external links (`target="_blank"`).
2. **Interactive CodeBlock Component**:
   - Add syntax container with language badge and a clipboard copy button with transient "Copied!" feedback.
3. **Citations Pill & Tray**:
   - Persist RAG grounding citations into `Message.citations`.
   - Render a collapsible citation badge (`📚 X verified sources`) displaying source metadata and quoted claim excerpts.

### Phase 5: Stream Robustness & UX Controls
1. **Stop Generating**:
   - Attach `AbortController` to the fetch request; provide a pulsating "Stop" button in place of the send button during generation.
2. **Smart Auto-Scroll**:
   - Check scroll position against a 70px threshold; only auto-scroll if the student is already near the bottom, with a floating scroll-to-bottom button when scrolled up.
3. **Resilient SSE Parser**:
   - Parse SSE blocks split across network boundaries safely, wrapping JSON decode in `try...catch` blocks to prevent unhandled stream errors.
