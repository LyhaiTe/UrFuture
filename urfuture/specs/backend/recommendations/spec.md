# Recommendations Specification

## Implemented endpoints

- `POST /api/career/recommend`: creates career recommendations from skill context.
- `POST /api/job/match`: extracts job skills and calculates a fit result.
- `POST /api/study-plan/generate`: creates a multi-week study plan.

## Implemented oversight

Recommendations store citations, matched/missing skills, rationale, fit score, and
review state. `CounselorReview` stores student, optional counselor, reason, status,
notes, and timestamps. Review statuses include `PENDING`, `APPROVED`, `REJECTED`,
`NEEDS_REVISION`.

## Current limitation

AI and market outputs remain advisory prototype results and do not represent hiring,
admissions, or binding career decisions.
