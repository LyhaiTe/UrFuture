# Feature Specification: UrFuture Copilot Chat

**Status**: Draft
**Source**: `src/components/ChatPanel.tsx`, `src/app/api/chat/route.ts`

## Goal

Give a student a persistent, streaming AI copilot that answers questions using the student's verified context and routes high-stakes academic or career decisions for counselor review.

## User Stories

### US1 - Ask a grounded question (P1)
As a student, I can send a question and receive a readable streamed response.

**Acceptance**:
1. A non-empty message creates or reuses a student-owned conversation.
2. The response streams `token`, `tool_call`, `done`, and `error` events.
3. The final assistant response is persisted.

### US2 - Resume conversation safely (P1)
As a student, I can continue a previous conversation without seeing another student's messages.

**Acceptance**:
1. Conversation history is ordered and limited to a defined context window.
2. A foreign or missing conversation ID is rejected.
3. Refreshing the UI preserves the conversation ID and messages.

### US3 - Handle sensitive decisions (P2)
As a student, I receive cautious guidance for high-stakes topics.

**Acceptance**:
1. Major changes, dropping out, and transfers trigger the safety prompt.
2. The response is labeled advisory and a counselor review is created when required.
3. Provider failures leave a retryable error and do not claim completion.

## Requirements

- Validate message, user identity, and conversation ownership server-side.
- Never expose API keys or raw provider errors to the browser.
- Persist user/assistant messages and sanitized tool traces.
- Support cancellation, reconnect, malformed SSE, and provider timeout states.
- Keep answers grounded in retrieved student and career context; do not invent scores.
- Rate-limit requests and enforce an AI token/cost budget before public release.

## Success Criteria

- 100% of chat contract tests reject cross-user conversation access.
- A message becomes visible while streaming and is persisted after completion.
- High-stakes test prompts produce a non-final response and a review record.
- The chat panel remains usable on desktop and mobile widths.
