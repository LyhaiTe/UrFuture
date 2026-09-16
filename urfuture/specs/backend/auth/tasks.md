# Authentication Completed Checklist

- [x] Google OAuth start and callback routes exist.
- [x] Student OAuth callback routes exist.
- [x] One-time session handoff consumption exists.
- [x] Student registration route creates new accounts.
- [x] Student sign-in requires an existing registered account.
- [x] Registration requires a strong password with uppercase, lowercase,
  number, and symbol characters.
- [x] Student passwords are hashed with Node.js `scrypt`.
- [x] Duplicate registration emails are rejected.
- [x] Invalid login credentials are rejected.
- [x] Student authentication no longer has an offline auto-login fallback.
- [x] Seeded demo login was removed from the student interface and endpoint.
- [x] Academic Track was removed from the registration form and request.
- [x] Local Google OAuth callback URI is documented as
  `http://localhost:3000/api/auth/student/google/callback`.
- [x] `UserRole` and `AuthProvider` Prisma enums exist.
- [x] User OAuth and education fields exist in the Prisma schema.
- [x] Phase 2 migration adds password hash, university, and graduation year fields.
