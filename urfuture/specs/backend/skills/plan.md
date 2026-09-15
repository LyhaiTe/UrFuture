# Skills Plan

## Implemented
- `Skill` and `UserSkill` Prisma models.
- Skill names, categories, and optional O*NET element IDs.
- Proficiency values and source tracking.
- Skill evidence updates from quiz evaluation.
- Skill radar visualization in `src/components/SkillRadarChart.tsx`.
- Knowledge context retrieval in `src/lib/knowledgeBase.ts`.

## Data rule
Phase 2 defines verification sources as `TRANSCRIPT`, `QUIZ`, and
`SELF_REPORTED`, with proficiency constrained to 0-100.
