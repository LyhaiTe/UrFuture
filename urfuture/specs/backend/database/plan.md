# UrFuture PostgreSQL and Prisma Plan

## 1. Objective

Configure the UrFuture application to use the local PostgreSQL database
`urfuture`, keep the Next.js application available on port `3000`, and apply
the existing Prisma data model reliably.

## 2. Completed approach

- Use PostgreSQL through the existing Docker Compose service.
- Keep the database service mapped to host port `5433` to avoid changing the
  existing local setup.
- Use Prisma's `DATABASE_URL` environment variable as the single database
  connection source.
- Apply the existing migrations instead of creating a duplicate schema.
- Generate Prisma Client after the migrations are applied.
- Keep the Next.js development and production start scripts on port `3000`.
- Avoid documenting or committing database passwords and API keys.

## 3. Reliability and safety

- Validate the Prisma schema before applying migrations.
- Check migration status after applying migrations.
- Preserve the existing migration history.
- Fix only the migration syntax error that prevented the initial migration from
  being validated.
- Stop only the project process holding port `3000` when it blocks startup.

## 4. Current boundary

This setup is intended for local development. Production PostgreSQL should use
an externally managed secret, a restricted database user, TLS, and a managed
deployment environment rather than the local Docker credentials.
