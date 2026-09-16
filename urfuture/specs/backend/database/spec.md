# UrFuture PostgreSQL and Prisma Specification

## Database configuration

The application uses Prisma with the PostgreSQL provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The local connection targets:

- Database: `urfuture`
- Host: `localhost`
- Host port: `5433`
- Container port: `5432`
- Schema: `public`
- Database user: configured by Docker Compose
- Password: stored only in the local `.env` file

The effective local URL format is:

```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5433/urfuture?schema=public"
```

The actual credentials must remain in `.env` and must not be committed or
included in documentation.

## Docker Compose

The PostgreSQL service is defined in `docker-compose.yml` and creates the
`urfuture` database. Its host port remains `5433`, so it does not conflict with
the Next.js application.

## Prisma schema

The Prisma schema defines the application data model, including:

- Users, roles, education levels, and authentication providers
- Transcripts and transcript parsing metadata
- Skills and user skill proficiency
- Career paths, recommendations, and pathway steps
- Study plans
- Quiz questions, attempts, and answers
- Job-fit checks
- Counselor reviews
- Conversations and messages
- Student-selected majors and major-specific quiz questions/attempts

## Migrations

The following migrations are applied to the local `urfuture` database:

- `20260910134940_init`
- `20260914160000_add_transcript_storage_metadata`
- `20260915090000_phase_2_data_model`

The initial migration had a missing semicolon after the
`User_googleId_key` index statement. That syntax error was corrected so Prisma
could validate and apply the migration.

Quiz questions and quiz attempts can reference a `CareerPath`, which represents
the student's selected major/career direction. The student selection is stored
on `User.selectedMajorId`, and quiz generation accepts either a career path ID,
major title, or the user's saved major. Questions are instructed and persisted
for that major.

## Application port

The package scripts explicitly use port `3000`:

```json
{
  "dev": "next dev --port 3000",
  "start": "next start --port 3000"
}
```

The database port and application port are intentionally different:

- PostgreSQL: `5433`
- Next.js: `3000`

## Validation requirements

The completed setup was validated with:

```powershell
npx prisma validate
npx prisma format
npm run prisma:generate
npx prisma migrate status
```

Expected migration status:

```text
Database schema is up to date!
```

The application also responded successfully at `http://localhost:3000`.
