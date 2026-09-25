# Chat Backend Tasks

- [x] CB-01: Implement `GET /api/chat/conversations` with `userId` query parameter, returning conversation summaries and pre-hydrated messages.
- [x] CB-02: Implement `POST /api/chat/conversations` to allow creating new conversations.
- [x] CB-03: Implement `GET /api/chat/conversations/[id]` and `DELETE /api/chat/conversations/[id]`.
- [x] CB-04: Integrate student profile, cumulative GPA calculation, and parsed transcript coursework into the `/api/chat` system prompt.
- [x] CB-05: Update `HIGH_STAKES_KEYWORDS` to capture academic probation, faculty transfers, and dropout intentions.
- [x] CB-06: Automatically insert `CounselorReview` row with status `PENDING` when high stakes detected in `/api/chat`.
- [x] CB-07: Stream `event: high_stakes_alert` to client upon detecting high-stakes transition requests.
- [x] CB-08: Persist RAG chunk citations into `Message.citations` on assistant response completion.
- [x] CB-09: Verify backend compilation with `npm run build`.
