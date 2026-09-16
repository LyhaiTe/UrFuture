# Authentication Plan

## Implemented
- Next.js auth route handlers under `src/app/api/auth/**`.
- Google OAuth start/callback flow in `src/lib/googleAuth.ts`.
- One-time session handoff consumption.
- Registration-first email/password student authentication.
- Existing-account-only email/password sign-in.
- Secure password hashing with Node.js `scrypt`.
- Prisma `User` identity fields, roles, OAuth provider, Google ID, password hash field, education, university, and graduation year.
- Removed the seeded demo-login path from the student UI and API.
- Removed the unused Academic Track registration field.
- Documented the exact Google OAuth redirect URI required for local development.

## Current boundary
The current application is a prototype. Production session hardening, refresh
tokens, rate limiting, password reset, central middleware authorization, and
complete route-level ownership enforcement are not documented as complete.
