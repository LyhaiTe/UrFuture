# Chat Backend Implementation Plan

## Architectural Objectives

1. **Student Context Enrichment**: Supply the LLM with the student's profile (`name`, `educationLevel`, `university`, `institution`), cumulative GPA across parsed transcripts, verified skills from `UserSkill`, and completed coursework.
2. **Conversation Persistence & Hydration**: Provide REST endpoints to list conversation threads, pre-hydrate active messages on mount, and manage thread lifecycle (create, fetch, delete).
3. **High-Stakes Escalation**: Monitor incoming messages for academic transitions and automatically insert `CounselorReview` records into Postgres while transmitting real-time SSE alerts.
4. **Citations Preservation**: Persist RAG chunk citations into `Message.citations` (JSON) to audit grounding sources.

## Core Files

- `src/app/api/chat/route.ts`: SSE chat streaming endpoint with context enrichment and guardrail evaluation.
- `src/app/api/chat/conversations/route.ts`: Conversation listing and active thread retrieval.
- `src/app/api/chat/conversations/[id]/route.ts`: Single-conversation message retrieval and deletion.
- `src/lib/knowledgeBase.ts`: `getStudentSkillContext`, `getParsedTranscripts`.
- `src/lib/guardrails.ts`: `containsHighStakesSignal`, `flagForCounselorReview`.
- `src/lib/prompts.ts`: `BASE_SYSTEM_PROMPT`.
