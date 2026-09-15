# Tasks: UrFuture Job Fit

- [ ] J001 [IDC-1] Add session authorization and ownership checks to `src/app/api/job/match/route.ts`, `src/app/api/career/recommend/route.ts`, and `src/app/api/study-plan/generate/route.ts`.
- [ ] J002 [IDC-1] Add shared request validation, text length limits, request IDs, and redacted error responses in `src/lib/observability.ts`.
- [ ] J003 [IDC-1] Add cross-user and invalid-input contract tests in `tests/contract/job-fit-ownership.test.ts`.
- [ ] J004 [IDC-2] Add Zod/runtime schemas for `JobFitResult`, `SkillGapAnalysisResult`, and `StudyPlanResult` in `src/lib/aiContracts.ts`.
- [ ] J005 [IDC-2] Refactor `src/app/api/job/match/route.ts` to validate extracted skills and calculate persisted counts from validated data.
- [ ] J006 [IDC-2] Refactor `src/app/api/career/recommend/route.ts` to enforce score bounds, citation checks, deterministic sorting, and idempotent review creation.
- [ ] J007 [IDC-2] Add malformed provider, citation, and score-bound tests in `tests/unit/jobFitContracts.test.ts`.
- [ ] J008 [IDC-2] Update `src/components/JobFitPanel.tsx` and `src/components/CareerFitPanel.tsx` to show evidence, estimates, review state, empty, loading, and retry states.
- [ ] J009 [IDC-3] Refactor `src/app/api/study-plan/generate/route.ts` to validate 4-10 weeks, resources, target skills, citations, and plan ownership.
- [ ] J010 [IDC-3] Connect missing-skill actions to plan generation in `src/components/JobFitPanel.tsx` and refresh saved plan state.
- [ ] J011 [IDC-3] Add draft/active/completed study-plan controls and UI in `src/components/CareerFitPanel.tsx` or a dedicated plan component.
- [ ] J012 [IDC-3] Add end-to-end job-fit-to-plan tests in `tests/contract/job-fit-plan.test.ts`.
- [ ] J013 [IDC-4] Add counselor review list/detail/decision APIs and pages under `src/app/counselor/`.
- [ ] J014 [IDC-4] Add career source version/retrieval metadata and ingestion documentation in `prisma/schema.prisma`, `src/lib/knowledgeBase.ts`, and `README.md`.
- [ ] J015 [IDC-4] Add rate limiting and AI cost budgets around the three guidance routes.
- [ ] J016 [IDC-4] Add browser coverage in `tests/e2e/job-fit.spec.ts` and run build/typecheck/tests.
