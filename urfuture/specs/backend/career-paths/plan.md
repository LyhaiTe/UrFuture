# Career Paths Plan

## Implemented
- Prisma models for `CareerPath`, `CareerSkillRequirement`, and `PathwayStep`.
- Seeded career paths and pathway steps in `prisma/seed.ts`.
- Career recommendation route at `src/app/api/career/recommend/route.ts`.
- React Flow pathway display in `src/components/PathwayGraph.tsx`.
- Phase 2 fields for industry, descriptions, salary range, required proficiency,
  priority weight, courses, certifications, and internship requirements.

## Current boundary
Career-path records and recommendations are implemented for the prototype; a
separate career-path read API is not currently present.
