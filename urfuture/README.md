# UrFuture (capstone codename: Phlouv) — Cambodian AI Career & Academic Planning Advisor

A working prototype for the capstone spec: a conversational advisor that unifies
personalized study planning, career pathway mapping, and adaptive tutoring for
Cambodian high school and university students — with grounded (cited)
recommendations and a human-counselor safety gate for high-stakes decisions.

This build also implements the flow from the team's sticky note:
**upload past transcripts (Year 1–4) → AI generates a diagnostic quiz → see your
knowledge % → get job/major recommendations from that score → paste a job
description to check your fit → get a prep plan if you're not qualified yet.**

---

## 1. Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Charts | Recharts (Skill Radar) |
| Pathway graph | React Flow |
| Backend | Next.js Route Handlers (REST, streamed via SSE for chat) |
| Database | PostgreSQL 15+ with pgvector on Amazon RDS + Prisma ORM |
| Object storage | Google Cloud Storage for transcript files (PDF, PNG, JPEG) |
| AI | Groq API (`groq-sdk`) with tool use / function calling |
| Embeddings | Voyage AI (`voyage-large-2`) / OpenAI (`text-embedding-3-small`) |
| Auth | Landing page + sign-in modal; demo login, email/password (prototype-only, unverified), and real **Google OAuth** — see §10 |
| RAG | Vector search via `pgvector`, citations via cosine similarity |

---

## 2. Prerequisites

Install these before cloning the project:

- Node.js 20 or newer: https://nodejs.org
- Docker Desktop with Docker Compose: https://www.docker.com/products/docker-desktop/
- AWS account with an Amazon RDS for PostgreSQL instance for production
- A Groq API key: https://console.groq.com/keys
- A Voyage AI API key (for embeddings): https://dash.voyageai.com/
- Git: https://git-scm.com/downloads

Google OAuth, Pinecone, O*NET, and ILOSTAT credentials are optional for local
development. The app includes seeded data and a demo login, so it can run
without those integrations.

## 3. First-time setup

The Git repository contains the Next.js project in the `urfuture` folder.

### 3.1 Clone the repository

```bash
git clone https://github.com/LyhaiTe/UrFuture.git
cd UrFuture/urfuture
```

To work with the Specify workflow instead of `main`, switch branches before
installing dependencies:

```bash
git switch feature/specify-setup
```

### 3.2 Install dependencies

```bash
npm install
```

The project includes Prisma as a development dependency and `@prisma/client` as
an application dependency. If installing them separately in an existing clone,
run:

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma validate
```

### 3.3 Create the environment file

macOS/Linux/Git Bash:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and set at least:

```env
GROQ_API_KEY=your_groq_api_key
VOYAGE_API_KEY=your_voyage_api_key
DATABASE_URL="postgresql://advisor:advisor@localhost:5433/urfuture?schema=public"
GCP_PROJECT_ID=your-google-cloud-project-id
GCS_TRANSCRIPT_BUCKET=your-transcript-bucket-name
```

Do not commit `.env` or expose API keys. Google OAuth variables are optional;
see [Google OAuth setup](#101-google-oauth--setup) when you need that login.
Transcript uploads use Google Cloud Application Default Credentials and are stored
in the configured bucket; only the object key, metadata, and `gs://` URL are saved
in PostgreSQL. For production Amazon RDS connections, use the RDS endpoint and
append `sslmode=require` to `DATABASE_URL`; provide the value through a managed
secret rather than committing credentials. See [Production AWS RDS setup](#37-production-aws-rds-setup).

### 3.4 Start the local database

Make sure Docker Desktop is running, then run:

```bash
docker compose up -d
```

The compose file starts PostgreSQL with the `pgvector` extension on `localhost:5433` with these defaults:

| Setting | Value |
|---|---|
| Database | `urfuture` |
| User | `advisor` |
| Password | `advisor` |
| Port | `5433` |

### 3.5 Create the Prisma client, database tables, and seed data

Run these commands in order after the database is running:

```bash
npm run prisma:generate
npx prisma validate
npx prisma migrate deploy
npm run prisma:seed
```

The seed step creates the sample skills, career paths, quiz questions, and
demo student used by the prototype.

### 3.6 Start the development server

```bash
npm run dev
```

Open http://localhost:3000. Use the demo login to explore the application
without configuring Google OAuth.

### 3.7 Production AWS RDS setup

Create an Amazon RDS for PostgreSQL instance using PostgreSQL 15 or newer. Enable
automated backups and point-in-time recovery, keep the instance private inside a
VPC when possible, and allow inbound TCP `5432` only from the application
security group. Do not expose the database to `0.0.0.0/0`.

Create a database and application user with a strong generated password. Store
the password in AWS Secrets Manager or the deployment platform's encrypted
environment configuration. The production connection must use the RDS endpoint:

```env
DATABASE_URL="postgresql://DB_USER:URL_ENCODED_DB_PASSWORD@RDS_ENDPOINT:5432/DB_NAME?schema=public&sslmode=require"
```

URL-encode reserved characters in the password, such as `@`, `:`, `/`, and `?`.
From the `urfuture` directory, apply the checked-in migrations before starting
the application:

```bash
npm run prisma:generate
npx prisma validate
npx prisma migrate deploy
```

The application runtime must be able to reach the RDS security group. If the
runtime is outside the VPC, use a private connection method such as VPN or a
secure tunnel rather than opening PostgreSQL to the public internet.

### 3.8 Corporate proxy configuration

If npm requires a corporate proxy, configure it with your organization's proxy
URL. Replace the placeholders and do not commit the resulting npm configuration
or share proxy credentials:

```powershell
npm config set proxy http://USERNAME:PASSWORD@PROXY_HOST:PROXY_PORT
npm config set https-proxy http://USERNAME:PASSWORD@PROXY_HOST:PROXY_PORT
```

Remove the settings when they are no longer needed:

```powershell
npm config delete proxy
npm config delete https-proxy
```

## 4. Common first-run commands

```bash
npm run dev             # Start the development server
npm run build           # Create a production build
npm start               # Run the production build
npm run prisma:studio  # Open the database browser
docker compose down    # Stop PostgreSQL
```

If you change `prisma/schema.prisma`, create a new local migration with:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Do not use `prisma migrate reset` unless you intentionally want to delete all
local database data.

## 5. Troubleshooting setup

### `@prisma/client did not initialize yet`

Run the following from the `urfuture` directory:

```bash
npm run prisma:generate
```

### Cannot connect to PostgreSQL

Check that Docker is running and inspect the database container:

```bash
docker compose ps
docker compose logs postgres
```

Confirm that `DATABASE_URL` uses port `5433`, not the usual PostgreSQL port
`5432`, because Docker maps the container to `5433` on the host.

### Google OAuth `redirect_uri_mismatch`

The redirect URI in `.env` must exactly match the URI registered in Google
Cloud Console, including the protocol, port, path, and trailing slash. See
[Google OAuth setup](#101-google-oauth--setup).

### Port 3000 is already in use

Start Next.js on another port:

```bash
npm run dev -- -p 3001
```

Then open http://localhost:3001.

---

## 6. Project layout

```
src/
  app/
    api/
      auth/
        student/route.ts              # POST — demo login + email/password upsert (prototype auth, see §10.2)
        google/route.ts                # GET  — starts Google OAuth (Authorization Code + PKCE)
        google/callback/route.ts       # GET  — Google redirects here; exchanges code, upserts User
        session/consume/route.ts       # POST — trades the post-OAuth handoff token for a StudentUser
      chat/route.ts                    # POST — SSE-streamed chat, tool-calling enabled
      transcript/upload/route.ts       # POST — multipart upload + Claude-based parsing
      career/recommend/route.ts        # POST — skill-gap analysis + counselor gating
      study-plan/generate/route.ts     # POST — multi-week personalized plan
      quiz/generate/route.ts           # POST — diagnostic quiz from parsed transcripts
      quiz/evaluate/route.ts           # POST — grades quiz, writes UserSkill proficiencies
      job/match/route.ts               # POST — job description fit-check
      dev/demo-user/route.ts           # GET  — legacy, no longer called by the client (see §11)
    page.tsx                           # Landing page / auth gate, then the tabbed dashboard
    layout.tsx, globals.css
  components/
    LandingPage.tsx        # Marketing landing page: hero, features, how-it-works, live-demo preview, footer
    StudentAuthModal.tsx   # Sign-in modal: demo login, email/password, Continue with Google
    UrFutureLogo.tsx        # Logo mark, navbar/icon/full variants
    DashboardWorkspace.tsx, ChatPanel.tsx, SkillRadarChart.tsx, PathwayGraph.tsx,
    TranscriptUpload.tsx, QuizPanel.tsx, JobFitPanel.tsx, CareerFitPanel.tsx
  lib/
    claude.ts          # Anthropic client, tool schemas, streaming + tool-call helpers
    googleAuth.ts       # Google OAuth: PKCE, token exchange, signed handoff token (see §10.1)
    prompts.ts          # System prompts: groundedness rules + safety guardrails
    knowledgeBase.ts     # Prototype RAG retrieval (reads seeded Postgres tables)
    guardrails.ts         # High-stakes keyword filter, counselor-review creation, groundedness heuristic
    db.ts                  # Prisma client singleton
  types/index.ts            # Shared TypeScript contracts for structured JSON model outputs
prisma/
  schema.prisma       # Full data model
  migrations/           # Includes add_google_oauth (authProvider, googleId, avatarUrl on User)
  seed.ts                # Seeds skills, career paths, quiz questions, citations, demo student
```

---

## 7. How the sticky-note quiz flow maps to the API

1. **Upload classes from Year 1–4** → `POST /api/transcript/upload` (once per
  PDF, PNG, or JPEG file/year). The original file is stored in Google Cloud
  Storage, while Claude extracts `{courseCode, courseName, grade, credits, term}`
   from the raw text and stores it on the `Transcript` row.
2. **Generate a quiz to test knowledge** → `POST /api/quiz/generate` — pulls
   *every* parsed transcript on file for the student and asks Claude
   (via the `generate_quiz` tool) to build questions strictly from courses
   that actually appear in that history.
3. **See the percentage** → `POST /api/quiz/evaluate` — grades the answers,
   returns `scorePercent`, and converts per-skill accuracy into `UserSkill`
   proficiency rows (`source: "QUIZ"`).
4. **Job/major recommendations based on results** → `POST /api/career/recommend`
   — reads the just-updated `UserSkill` rows and runs skill-gap analysis
   against every seeded career path.
5. **Upload a job description to check fit** → `POST /api/job/match` — Claude
   extracts required skills from the pasted text and compares them to the
   student's profile.
6. **If under-qualified, help prepare** → the Job Fit panel's "Help me prepare
   for this job" button calls `POST /api/study-plan/generate` with the
   `missingSkills` from the fit check as the target skills.

---

## 8. Groundedness & safety guardrails

- Every AI-generated recommendation is produced via a forced **tool call**
  (not free text), so the shape is always strict JSON — see
  `src/lib/claude.ts` for the four tool schemas.
- `src/lib/prompts.ts` embeds a **≥90% groundedness rule**: factual claims
  about salaries, job outlook, or skill requirements must cite a source from
  the provided context, or be explicitly labeled an estimate.
- `src/lib/guardrails.ts` runs a **second, independent groundedness check**
  server-side (`estimateGroundedness`) — it doesn't just trust the model's
  self-reported score. If the measured score is below 90%, the
  recommendation is force-flagged for counselor review regardless of what
  the model said.
- A **keyword pre-filter** (`containsHighStakesSignal`) plus the model's own
  `requiresCounselorReview` flag both feed into `CounselorReview` row
  creation whenever a conversation or recommendation touches a high-stakes
  transition (switching majors, dropping out, transferring schools, etc.).
  These reviews are queryable via Prisma Studio (`npm run prisma:studio`)
  today; a counselor-facing approval UI is a natural next screen to build.

---

## 9. Swapping in real RAG (O*NET / ILOSTAT / NEA)

The prototype's "RAG" (`src/lib/knowledgeBase.ts`) reads directly from
Postgres tables seeded with a small, hand-picked, citation-bearing snapshot.
This keeps the prototype runnable with zero external API keys while
preserving the same citation contract the rest of the app relies on. To
move to live data:

1. **O*NET Web Services** — register at https://services.onetcenter.org,
   pull the Skills/Knowledge/Abilities taxonomy for target SOC codes, and
   write an ingestion job that upserts into `Skill` / `CareerPath` /
   `CareerSkillRequirement`, keeping `onetElementId` / `onetSocCode`
   populated for citation.
2. **ILOSTAT Cambodia** — pull labor-force and wage tables via their bulk
   data API; store a versioned snapshot (with retrieval date) rather than
   overwriting `medianSalaryUsd` silently, so recommendations can cite
   *which* survey year backs a number.
3. **NEA Cambodia** — no stable public API was confirmed during the capstone
   discovery phase (Activity 4); treat any NEA figures as manually curated
   until that's verified, and keep them clearly labeled as estimates in
   `CareerPath.sourceNote`.
4. **Vector search** — once you have enough unstructured source documents
   (course catalogs, survey PDFs) that keyword/relational lookup isn't
   enough, add a Pinecone (or pgvector) index and have
   `getCareerContext()` / `getStudentSkillContext()` in
   `knowledgeBase.ts` query it instead of (or alongside) Postgres. Keep
   returning the same `{source, reference, claim}` citation shape so the
   groundedness contract in `prompts.ts` doesn't need to change.

---

## 10. Auth

The landing page's sign-in modal (`StudentAuthModal.tsx`) offers three ways
in. Whichever is used, the resulting `StudentUser` is stored client-side
(`localStorage`, see `STORAGE_KEY` in `page.tsx`) and restored automatically
on the next visit until the person signs out.

| Flow | Route | Verifies identity? |
|---|---|---|
| 1-Click Demo | `POST /api/auth/student` (`action: 'demo'`) | No — upserts a fixed seeded demo account |
| Email / password | `POST /api/auth/student` | **No** — upserts by email only, the password field is not checked |
| Continue with Google | `GET /api/auth/google` → `.../callback` → `POST /api/auth/session/consume` | **Yes** — real Google OAuth |

### 10.1 Google OAuth — setup

1. In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   under **Google Auth Platform**, configure the consent screen (External
   audience) and add your own account under **Test users** — unpublished
   apps only let listed test users sign in.
2. Create an **OAuth client ID** of type "Web application".
3. Add an authorized redirect URI matching `GOOGLE_REDIRECT_URI` exactly
   (scheme, host, port, path, no trailing slash), e.g.
   `http://localhost:3000/api/auth/google/callback` for local dev.
4. Fill in `.env`:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
   AUTH_SESSION_SECRET=<output of `openssl rand -hex 32`>
   ```

   Run this in your terminal to generate a secure secret value:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Apply the `add_google_oauth` migration (adds `authProvider`, `googleId`,
   `avatarUrl` to `User` — additive/non-breaking):
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
6. Restart `npm run dev` (env vars are only read at server start), then
   click "Continue with Google" in the sign-in modal.

**How it works** (no NextAuth/Clerk dependency — see `src/lib/googleAuth.ts`):
`GET /api/auth/google` starts an Authorization Code + PKCE flow and stores
`state`/`code_verifier` in short-lived httpOnly cookies → Google redirects to
`GET /api/auth/google/callback`, which validates `state` (CSRF), exchanges
the code, verifies the Google profile's `email_verified` flag, and
upserts/links the `User` row (by `googleId`, falling back to `email`) → the
callback redirects the browser to `/?googleAuth=<one-time token>` → the
client immediately trades that token for the `StudentUser` via
`POST /api/auth/session/consume` and stores it exactly like the demo/email
flows already do. The handoff token is an HMAC-signed, 2-minute-lived token
carrying only the user id — it exists because a server Route Handler can't
write to the browser's `localStorage` directly. Any failure along the way
(user cancels, unverified email, expired/mismatched state, misconfigured
credentials) redirects to `/?authError=<code>`, which the landing page
surfaces as a dismissible banner.

**Common setup error:** `Error 400: redirect_uri_mismatch` means the
`GOOGLE_REDIRECT_URI` in `.env` doesn't byte-for-byte match an Authorized
redirect URI registered on the OAuth client in Google Cloud Console —
recheck scheme (`http` vs `https`), port, and trailing slash on both sides.

### 10.2 Before any real deployment

- The seeded demo login and the "email/password" registration flow do
  **not** verify a password today — both are upsert-by-email prototype
  conveniences. Google OAuth is the only flow in this codebase with a real
  identity check. Gate or remove the other two (or add real password
  hashing/verification) before shipping past a demo.
- Replace every `userId` prop currently passed from `page.tsx` with an
  authenticated session's user id rather than trusting the client-held
  `StudentUser` object.
- Add a `COUNSELOR`-role-gated view over the `CounselorReview` table (the
  schema already supports this — `User.role` includes `COUNSELOR`).

---

## 11. Known prototype limitations

- The email/password and demo logins don't verify a password — see §10.2.
- `src/app/api/dev/demo-user/route.ts` predates the landing page's 1-Click
  Demo button and is no longer called by any client code — safe to delete,
  kept for now in case anything external still points at it.
- Transcript text extraction is best-effort plain-text decoding; production
  should add real PDF/DOCX parsing (e.g. `pdf-parse`, `mammoth`) before
  handing raw bytes to Claude.
- The evaluation framework from Activity 5 (teacher-scored tutoring
  accuracy, A/B personalization testing) is a human research process, not
  something a code prototype can automate — `estimateGroundedness()` is a
  cheap proxy only, not a substitute for the spot-check protocol described
  in the workbook.
- No rate limiting / cost controls on Claude calls yet — add these before
  a public deployment.

---

## 12. Useful commands

```bash
npm run prisma:studio     # Visual DB browser — inspect CounselorReview queue, quiz results, etc.
npm run prisma:migrate    # Create/apply a new migration after schema changes
npm run measure:ttft      # Benchmark the time-to-first-token latency for chat
npm run build && npm start   # Production build
```