# Implementation Plan: UrFuture Copilot Chat

**Spec**: [spec.md](spec.md)

## Existing Surface

- UI: `src/components/ChatPanel.tsx`
- API: `src/app/api/chat/route.ts`
- Provider: `src/lib/claude.ts`
- Prompt and safety rules: `src/lib/prompts.ts`, `src/lib/guardrails.ts`
- Persistence: `Conversation` and `Message` in `prisma/schema.prisma`

## Delivery Steps

### IDC-1: Secure Conversation Boundary

Add server session lookup, conversation ownership checks, request validation, message length limits, and redacted error logging. Migrate `ChatPanel` away from trusting a localStorage-supplied user ID.

**Exit**: unauthenticated requests return 401 and foreign conversation IDs return 403/404.

### IDC-2: Reliable Streaming

Define and validate the SSE event contract. Handle provider timeouts, stream cancellation, malformed events, partial responses, retry, and persistence only after a successful assistant completion.

**Exit**: mocked provider tests cover token streaming, tool traces, completion, and failure.

### IDC-3: Grounded Copilot Behavior

Pass authorized student context into the prompt, sanitize tool traces, enforce guardrails, and create a counselor review for high-stakes requests. Add visible advisory/review state to the UI.

**Exit**: sensitive test prompts are never presented as final advice.

### IDC-4: Pilot Readiness

Add rate limits, cost budgets, observability, retention controls, accessibility checks, and a Playwright chat journey test.

**Exit**: the chat works in a production build on desktop and mobile with no secret or cross-user leakage.

## Design Decisions

- Keep SSE and the current Claude SDK integration unless operational testing proves WebSockets necessary.
- Keep the existing Conversation/Message model and add only fields needed for retries, status, and auditability.
- Business authorization belongs in a service/guard, not in React components.
