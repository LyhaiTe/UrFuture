# Career Paths Specification

## Implemented data

`CareerPath` stores title, industry, O*NET code, short/full descriptions, salary
range, median salary, growth outlook, source note, and required education.
`CareerSkillRequirement` maps skills to careers with proficiency/importance data.
`PathwayStep` stores ordered steps, type, description, courses, certifications,
and internship requirements.

## Implemented behavior

`POST /api/career/recommend` creates career recommendations from the student's
skill context. `PathwayGraph` renders ordered pathway steps. Seed data provides
prototype career and skill benchmarks.

## Current limitation

Market data remains source-labeled prototype data and is not a hiring guarantee.
