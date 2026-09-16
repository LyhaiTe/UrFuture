# Authentication Specification

## Implemented routes

- `GET /api/auth/google`: starts Google OAuth.
- `GET /api/auth/google/callback`: exchanges the Google authorization code.
- `GET /api/auth/student/google`: student OAuth entry point.
- `GET /api/auth/student/google/callback`: student OAuth callback.
- `POST /api/auth/session/consume`: consumes a one-time handoff session.
- `POST /api/auth/student`: registration-first student authentication.
- `GET /api/auth/student/session`: returns the current student session.

## Implemented data

`User` stores email, name, role, education level, institution/university,
graduation year, OAuth provider, Google ID, avatar URL, and optional password hash.
Roles are `STUDENT`, `COUNSELOR`, and `ADMIN`.

## Email/password behavior

Students must register before they can sign in with email and password.

### Registration

Registration creates a new `User` record with:

- Full name
- Unique normalized email address
- Password hash
- Institution
- Academic level
- Student role

Passwords must contain at least 8 characters and include an uppercase letter,
lowercase letter, number, and symbol. They are hashed with Node.js `scrypt`
before storage. The plain-text password is never persisted.

If the email already exists, registration returns an error and does not update
or overwrite the existing account.

### Sign in

Sign in looks up an existing account by normalized email and verifies the
password hash. It never creates an account. An unknown email or invalid password
returns an authentication error instructing the student to register first or
check their credentials.

## Removed behavior

- Seeded demo login is no longer available from the student interface or
  student email/password endpoint.
- Login no longer falls back to a temporary in-memory user when the database is
  unavailable.
- The Academic Track field was removed from registration because it is not part
  of the current persisted `User` model.

## Current limitations

This is prototype authentication. Production session hardening, refresh-token
handling, password reset, rate limiting, central middleware authorization, and
complete route-level ownership enforcement are not represented as completed
functionality.

## Local Google OAuth configuration

The local Google OAuth client ID is configured through `GOOGLE_CLIENT_ID` in
`.env`. The callback URL must be registered in Google Cloud Console exactly as:

```text
http://localhost:3000/api/auth/student/google/callback
```

The URI must be added under **Authorized redirect URIs** for the same OAuth
2.0 client. It must not include a trailing slash, use `127.0.0.1`, use a
different port, or use the non-student callback path.

The client secret must remain in `.env` and must not be committed or documented.
Google sign-in cannot complete until `GOOGLE_CLIENT_SECRET` is replaced with the
secret belonging to the same OAuth client.

After changing Google Cloud Console settings or `.env`, restart the Next.js
development server so it reloads the environment:

```powershell
npm run dev
```
