# UrFuture PostgreSQL and Prisma Tasks

## Completed

- [x] Inspect the existing Prisma schema and environment configuration.
- [x] Confirm that Prisma uses the PostgreSQL provider and `DATABASE_URL`.
- [x] Change the local Docker PostgreSQL database name to `urfuture`.
- [x] Configure the local `DATABASE_URL` to target `urfuture`.
- [x] Keep PostgreSQL mapped to host port `5433`.
- [x] Keep the Next.js development server on port `3000`.
- [x] Keep the Next.js production start script on port `3000`.
- [x] Start the local PostgreSQL container.
- [x] Create the `urfuture` database in PostgreSQL.
- [x] Fix the missing semicolon in the initial Prisma migration.
- [x] Apply all existing Prisma migrations.
- [x] Format `prisma/schema.prisma`.
- [x] Regenerate Prisma Client.
- [x] Verify that the Prisma database schema is up to date.
- [x] Verify that the application responds on port `3000`.
- [x] Resolve the port conflict by stopping the stale UrFuture dev-server
  process that occupied port `3000`.

## Developer runbook

From the `urfuture` directory:

```powershell
docker compose up -d
npm run prisma:generate
npx prisma migrate status
npm run dev
```

Open:

```text
http://localhost:3000
```

## Follow-up tasks

- [ ] Replace local placeholder API credentials with development secrets stored
  outside version control.
- [ ] Add a production-managed PostgreSQL connection through a secret manager.
- [ ] Use a restricted production database user and TLS.
- [ ] Run the seed command when a fresh local database needs sample data:
  `npm run prisma:seed`.
- [ ] Avoid `prisma migrate reset` unless intentionally resetting a development
  database and confirming that its data can be deleted.
