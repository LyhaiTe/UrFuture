# Authentication Specification

## Implemented routes

- `GET /api/auth/google`: starts Google OAuth.
- `GET /api/auth/google/callback`: exchanges the Google authorization code.
- `GET /api/auth/student/google`: student OAuth entry point.
- `GET /api/auth/student/google/callback`: student OAuth callback.
- `POST /api/auth/session/consume`: consumes a one-time handoff session.
- `POST /api/auth/student`: demo/prototype student sign-in or registration.
- `GET /api/auth/student/session`: returns the current student session.

## Implemented data

`User` stores email, name, role, education level, institution/university,
graduation year, OAuth provider, Google ID, avatar URL, and optional password hash.
Roles are `STUDENT`, `COUNSELOR`, and `ADMIN`.

## Current limitations

This is prototype authentication. Production password hashing/verification,
central middleware authorization, refresh-token handling, and complete route-level
ownership enforcement are not represented as completed functionality.
