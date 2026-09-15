# Implementation Plan: UrFuture Job Fit

**Spec**: [spec.md](spec.md)

## Existing Surface

- UI: `src/components/JobFitPanel.tsx`, `src/components/CareerFitPanel.tsx`, `src/components/PathwayGraph.tsx`
- APIs: `src/app/api/job/match/route.ts`, `src/app/api/career/recommend/route.ts`, `src/app/api/study-plan/generate/route.ts`
- Retrieval: `src/lib/knowledgeBase.ts`
- AI contracts: `src/lib/claude.ts`, `src/types/index.ts`
- Safety: `src/lib/guardrails.ts`, `src/lib/prompts.ts`

## Delivery Steps

### IDC-1: Secure Fit Analysis

Add server session authorization, input limits, ownership checks, request IDs, and a consistent error contract across job, career, and plan routes.

**Exit**: no client can submit another user's identity or read another user's fit history.

### IDC-2: Validated Matching

Create shared runtime schemas for job-fit and skill-gap responses. Bound scores, normalize skill names, calculate persistence counts from validated data, and retain source/citation metadata.

**Exit**: mocked malformed provider responses are rejected without database writes.

### IDC-3: Actionable Preparation

Validate study-plan weeks/resources, connect missing skills to the plan action, persist plan status, and refresh the UI after generation. Add consistent citation and review-status components.

**Exit**: job fit -> missing skills -> saved draft plan works end to end.

### IDC-4: Human Review and Data Readiness

Build counselor review queue/actions, version career data, add rate limits/cost controls, and replace seeded-only knowledge with a versioned ingestion boundary while preserving the citation contract.

**Exit**: every high-stakes or weakly grounded result can be resolved by a counselor outside Prisma Studio.

## Design Decisions

- Keep job descriptions as user-provided evidence and do not claim that an extracted skill is objectively required beyond the text.
- Keep `Citation` as the shared response contract across career and study-plan results.
- Keep fit scores advisory and separate from hiring, admission, or major-change decisions.
