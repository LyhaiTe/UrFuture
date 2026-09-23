# O*NET Integration Checklist

- [x] O*NET Web Services account verified for user Nut Sannara (`sn6024010087@camtech.edu.kh`).
- [x] Organization `CamTech` and project `urfuture` (ID: 12375) status checked.
- [x] Credentials configured in `.env` (`ONET_USERNAME`, `ONET_PASSWORD`).
- [x] Service module implemented in `src/lib/onet.ts` with authentication methods and typed models.
- [x] Standard O*NET Content Model skills defined with Element IDs (`2.B.3.f`, `2.B.3.g`, etc.).
- [x] High-priority career paths mapped to official O*NET-SOC codes (`15-1252.00`, etc.).
- [x] RAG knowledge document created in `data/knowledge/onet-occupations-skills-taxonomy.md`.
- [x] Database seeder implemented in `scripts/seed-onet-data.ts`.
- [x] PostgreSQL database seeded with 7 Career Paths, 30 Skills, and 37 Skill Requirements.
- [x] Citation contracts verified with `verify:guardrails` test suite.
- [x] Full TypeScript type-checking validated (`npx tsc --noEmit`).
- [ ] Generate production v2 API key once O*NET staff approval is completed.
