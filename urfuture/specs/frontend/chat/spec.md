# Feature Specification: UrFuture Copilot Chat

**Status**: Implemented  
**Source**: `src/components/ChatPanel.tsx`, `src/app/api/chat/route.ts`, `src/app/api/chat/conversations/route.ts`, `src/app/api/chat/conversations/[id]/route.ts`

## Goal

Provide Cambodian high school and university students with a personalized, streaming AI advisor that preserves past conversations, grounds recommendations in verified academic transcripts, coursework, GPA, and skills data, and automatically routes high-stakes academic decisions (such as dropping out or major transfers) for counselor oversight.

---

## User Stories

### US1 - Stream Grounded Advice with Full Markdown & Code Support (P1)
As a student, I can send questions regarding coursework, career fit, or graduation timelines, and receive real-time streamed responses formatted with full GitHub Flavored Markdown (headers, lists, tables, links, and copyable code blocks).

**Acceptance**:
1. Sending a prompt streams tokens smoothly via Server-Sent Events (SSE).
2. The SSE parser safely handles multi-line JSON events without dropped tokens.
3. Assistant responses format with custom headings (`h1`-`h4`), styled bullet/numbered lists, tables with alternate row shading, external links (`target="_blank"`), and code blocks with syntax headers and a "Copy" button.
4. The user can halt long-running generation at any time via a dedicated **"Stop Generating"** button without crashing the UI.
5. Auto-scroll stays pinned to the bottom during streaming only if the user is already near the bottom (within 70px), allowing uninterrupted reading when scrolled up.

### US2 - Hydrate Chat History & Manage Multiple Conversations (P1)
As a student, when I return to the dashboard or refresh the page, my past conversation history is restored, and I can switch between or start fresh conversation threads.

**Acceptance**:
1. On component mount, the chat panel calls `GET /api/chat/conversations?userId=...` and automatically hydrates the most recent conversation and its messages.
2. Clicking **"New Chat"** resets the active session and renders a personalized welcome greeting.
3. A **"History"** menu displays past conversation titles, timestamps, and message counts, allowing the student to switch threads or delete unwanted conversations (`DELETE /api/chat/conversations/[id]`).

### US3 - Personalized Student Context & Academic Guidance (P1)
As an authenticated student, the copilot addresses me by name and tailors its responses to my uploaded transcript courses, GPA, verified skills, and declared major.

**Acceptance**:
1. The welcome greeting addresses the student directly (`"Hi {name}!"`).
2. The system prompt incorporates the student's current education level, university, cumulative GPA, top verified skills (`UserSkill`), and parsed transcript courses.
3. The model accurately answers queries like *"Can I graduate on time?"* or *"Based on my transcript, what courses should I take next?"* based on actual database records.

### US4 - High-Stakes Academic Transition Guardrail (P1)
As a student inquiring about consequential transitions (e.g., dropping out, academic probation, faculty/major transfers), I receive supportive grounded guidance accompanied by an advisory notice, and an official counselor review is queued.

**Acceptance**:
1. Inputs matching `HIGH_STAKES_KEYWORDS` automatically create a `CounselorReview` record in the database with status `PENDING`.
2. The server dispatches an `event: high_stakes_alert` SSE event.
3. The UI renders a distinct, dismissible **High-Stakes Academic Transition Advisory** banner clarifying that official counselor verification is required.

### US5 - Grounding Citations (P2)
As a student reading labor-market or syllabus insights, I can inspect the factual citations grounding the copilot's answers.

**Acceptance**:
1. Assistant messages containing citations display a collapsible **"X verified sources"** pill badge.
2. Expanding the badge reveals source titles, reference chunk identifiers, and claim excerpts.

---

## Technical Architecture

```
[ChatPanel.tsx]
   │
   ├── (Mount) ───────► GET /api/chat/conversations?userId=...
   │                     └─► Hydrates active thread & message history
   │
   ├── (Send) ────────► POST /api/chat { userId, conversationId, message }
   │                     ├─► Loads user profile, GPA, transcripts, & skills
   │                     ├─► Evaluates containsHighStakesSignal(message)
   │                     │     └─► Creates CounselorReview (status: PENDING)
   │                     ├─► Vector similarity RAG search (Voyage + pgvector)
   │                     └─► Streams SSE (token, high_stakes_alert, tool_call, done)
   │
   └── (Stop) ────────► AbortController.abort() cancels stream consumption
```

---

## Verification & Acceptance Checklist

- [x] Chat history persists in Postgres and reloads on browser refresh.
- [x] "New Chat" button resets `conversationId` and clears previous messages.
- [x] Past conversation threads can be viewed, loaded, or deleted via the History dropdown.
- [x] Personalized greeting uses the student's authentic profile name.
- [x] System prompt injects GPA, parsed transcript coursework, and verified skills.
- [x] Markdown renders headers, bullet points, numbered lists, tables, links, and code blocks.
- [x] Code blocks include language badge and copy-to-clipboard functionality.
- [x] High-stakes keywords trigger a `CounselorReview` database record and an SSE alert banner.
- [x] "Stop Generating" button halts streaming immediately.
- [x] Smart scroll respects user scroll position when reading earlier messages.
- [x] TypeScript type-check and ESLint pass with 0 errors.
