# Career Paths Panel Specification

## Scope

Category filtering on the Career Paths list, and a detail modal carrying
Cambodia-specific job-market information for each role.

## Implemented data

`src/types/career.ts` holds the contracts: `CareerCategory`, `MarketOverview`,
`HiringIndustry`, `HiringCompany`, `Qualifications`, `ProgressionStage`,
`RelatedCareer`, and `CareerMarketProfile`.

`src/data/careerCategories.ts` holds the six-category taxonomy
(Engineering & Development, Data & Analytics, Design & UX, Infrastructure &
Security, Management & Product, Other). `categoriseRole()` resolves a free-text
title to a category by exact match, then keyword hint, then `other`. No title is
ever dropped from the filter.

`src/data/careerCatalog.ts` holds the fifteen careers shown in the list. This
was extracted from `CareerFitPanel.tsx`, where it lived as a module literal, and
widened from five roles so every category pill returns results.

`src/data/cambodiaJobMarket.ts` holds one `CareerMarketProfile` per career.
Company identity lives once in an `EMPLOYERS` registry; per-role salary ranges
are applied at the call site, because the same employer pays a QA engineer and a
data engineer differently.

## Implemented behavior

`CategoryFilterBar` renders multi-select pills that scroll horizontally below
`md` and wrap above it. Selecting nothing shows everything. Per-category counts
are computed against the unfiltered list so they do not shift while the student
is choosing. The active-filter count renders as a badge, and the result
read-out is `aria-live="polite"` so filtering is announced, not only seen.

`CareerDetailModal` opens from "View details" as a real dialog:
`role="dialog"`, `aria-modal`, Escape to close, Tab cycling confined to the
dialog, background scroll locked, focus moved to the close button on open and
restored to the trigger on close. Backdrop dismissal fires on `mousedown`, so a
text selection that ends outside the panel does not close it.

Content is tabbed: Your fit, Job market, Employers, Requirements, Growth. The
last four are hidden when a career has no market profile. Selecting a role from
"Related career paths" swaps the modal's subject and resets to the first tab.

`src/lib/careerFilters.ts` holds the selection rules as pure functions so they
can be unit-tested without mounting React.

## Data provenance

Every figure in `cambodiaJobMarket.ts` is a prototype estimate. None of it comes
from a primary dataset yet. This is the same limitation already recorded in
`specs/backend/career-paths/spec.md` for the `CareerPath` table.

Each profile carries a `sources` array and a `lastReviewed` date, and the modal
renders both in a visible notice on every market tab. The caveat is shown to the
student rather than buried in a code comment.

`companies[].careersUrl` is unset everywhere by design. Populate it only with a
URL someone has opened and verified. The UI degrades to a non-link company name
when it is absent, so an empty field is safe and a wrong one is not.

## Current limitation

The panel still reads from `CAREER_CATALOG` rather than
`POST /api/career/recommend`. Match scores are fixtures for a demo profile. When
the route is wired in, the catalog becomes the loading and error fallback, not
the source of truth; `categoriseRole()` already exists so AI-generated titles
can be filtered without a schema change.

Market data is not persisted. Moving it to Postgres means adding a
`CareerMarketProfile` table keyed on `CareerPath.id` and swapping
`getMarketProfile()` for a query — the lookup is deliberately keyed on slug, not
list position, so nothing else has to change.