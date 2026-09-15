# Tasks: UrFuture Copilot Chat

- [ ] C001 [IDC-1] Add authenticated session lookup and conversation ownership guard in `src/lib/authSession.ts` and `src/lib/authorization.ts`.
- [ ] C002 [IDC-1] Update `src/app/api/chat/route.ts` to derive identity from the session and validate message/conversation inputs with Zod.
- [ ] C003 [IDC-1] Add message length, history-window, and error-redaction rules in `src/app/api/chat/route.ts` and `src/lib/observability.ts`.
- [ ] C004 [IDC-1] Update `src/components/ChatPanel.tsx` to use session state instead of trusting a client-only `userId`.
- [ ] C005 [IDC-1] Add ownership tests in `tests/contract/chat-ownership.test.ts`.
- [ ] C006 [IDC-2] Define a typed SSE event union and parser in `src/types/index.ts` or `src/lib/chatStream.ts`.
- [ ] C007 [IDC-2] Add provider timeout, abort, malformed-event, and partial-response handling in `src/app/api/chat/route.ts`.
- [ ] C008 [IDC-2] Add retry/cancel/loading/error UI states in `src/components/ChatPanel.tsx`.
- [ ] C009 [IDC-2] Add mocked stream contract tests in `tests/contract/chat-stream.test.ts`.
- [ ] C010 [IDC-3] Integrate authorized student/knowledge context and validated tool traces through `src/lib/claude.ts` and `src/lib/prompts.ts`.
- [ ] C011 [IDC-3] Persist high-stakes chat review records through `src/lib/guardrails.ts` and the chat route.
- [ ] C012 [IDC-3] Render advisory and counselor-review status in `src/components/ChatPanel.tsx`.
- [ ] C013 [IDC-3] Add guardrail tests in `tests/unit/chat-guardrails.test.ts`.
- [ ] C014 [IDC-4] Add rate limiting, token budgets, metrics, and production logging around `src/app/api/chat/route.ts`.
- [ ] C015 [IDC-4] Add desktop/mobile Playwright coverage in `tests/e2e/chat.spec.ts`.
- [ ] C016 [IDC-4] Run typecheck, focused tests, and `npm run build`.
