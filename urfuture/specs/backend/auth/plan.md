# Authentication Plan

## Implemented
- Next.js auth route handlers under `src/app/api/auth/**`.
- Google OAuth start/callback flow in `src/lib/googleAuth.ts`.
- One-time session handoff consumption.
- Prototype demo and email-style student sign-in flow.
- Prisma `User` identity fields, roles, OAuth provider, Google ID, password hash field, education, university, and graduation year.

## Current boundary
The current application is a prototype. Session and identity hardening, password
hash verification, and production middleware authorization are not documented as
complete because they are not fully implemented.
