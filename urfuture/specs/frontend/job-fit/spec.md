# Feature Specification: UrFuture Job Fit

**Status**: Draft
**Source**: `src/components/JobFitPanel.tsx`, `src/components/CareerFitPanel.tsx`, job/career/study-plan API routes

## Goal

Help a student compare verified skills against a pasted job description or known career path, understand the gaps, and start a realistic preparation plan without presenting AI output as a hiring decision.

## User Stories

### US1 - Match a job description (P1)
A student pastes a job description and receives a bounded fit score, extracted required skills, matched skills, missing skills, and an explanation.

The client consumes the API response through its `result` property. The result
uses the UI contract expected by `JobFitPanel`: `fitScore`, detailed matched and
missing skill items, `explanation`, citations, and review state.

### US2 - Explore career pathways (P1)
A student receives ranked career options based on current evidence and sees pathway steps, citations, and review status.

### US3 - Prepare for a gap (P2)
A student turns missing skills into a saved multi-week study plan.

**Acceptance**:
1. Job descriptions shorter than 20 characters or missing required fields are rejected.
2. Required skills are extracted conservatively from the supplied text.
3. Scores are bounded and never presented as an employment guarantee.
4. Recommendations include citations or an explicit estimate/general-strategy label.
5. Weakly grounded or high-stakes recommendations are clearly non-final and create a pending counselor review.
6. Missing skills can create a persisted draft study plan with ordered weeks and resources.

## Requirements

- Authorize all requests from the authenticated session.
- Validate Claude tool output at runtime, including scores, arrays, and citation shape.
- Persist job-fit checks, recommendations, study plans, and review records.
- Keep career knowledge source metadata and retrieval date available for display.
- Prevent duplicate review rows for the same recommendation.
- Provide loading, no-skill, no-career, provider-failure, and retry states.
- Label market salary/growth data as estimated unless backed by a verified source.
- Send preparation requests using `targetSkillNames`, matching the study-plan
  API contract.
- Return a clear JSON error when the student account is missing or the AI
  provider is unavailable.

## Success Criteria

- A seeded student can complete job description -> fit result -> preparation plan.
- A malformed AI result cannot be persisted as a valid recommendation or plan.
- All below-threshold/high-stakes recommendations are non-final with a review record.
- A user can see the evidence and missing skills behind every displayed score.
