# Chat Backend Specification

## Implemented Endpoints

- `POST /api/chat`: Streams response tokens via SSE. Enriches context with student profile, transcripts, GPA, and verified skills. Logs `CounselorReview` rows for high-stakes messages. Persists user/assistant messages and grounding citations.
- `GET /api/chat/conversations`: Returns user conversation summaries ordered by `updatedAt DESC` along with active conversation messages for client hydration.
- `POST /api/chat/conversations`: Initializes a new conversation thread for a student.
- `GET /api/chat/conversations/[id]`: Returns the messages for a specific conversation thread.
- `DELETE /api/chat/conversations/[id]`: Deletes a conversation thread and cascades message deletion.

## Implemented Oversight & Guardrails

- `containsHighStakesSignal`: Keyword pattern matching over `HIGH_STAKES_KEYWORDS` ('drop out', 'academic probation', 'faculty transfer', 'change major', etc.).
- `CounselorReview`: Automatically created with `status: PENDING` and `reason` when high-stakes topics are raised in chat.
- `event: high_stakes_alert`: SSE event dispatched to client for immediate user advisory.
- RAG retrieval: Grounding context pulled via Voyage AI embeddings + pgvector similarity search over ingested NEA, ILOSTAT, and syllabus data.

## Data Persistence

- `Conversation`: Stored per user with `title`, `createdAt`, `updatedAt`.
- `Message`: Stored with `role` (`USER` | `ASSISTANT`), `content`, `toolCalls`, and `citations`.
