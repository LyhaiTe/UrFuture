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
| Database | PostgreSQL + Prisma ORM |
| AI | Claude API (`@anthropic-ai/sdk`) with tool use / function calling |
| Auth | Landing page + sign-in modal; demo login, email/password (prototype-only, unverified), and real **Google OAuth** — see §8 |
| RAG (prototype) | Seeded Postgres tables carrying O*NET / NEA / ILOSTAT citation metadata (see §7 to wire up a real vector store) |

---

## 2. Prerequisites

- Node.js 20+
- Docker (for local Postgres) — or your own Postgres instance
- An Anthropic API key: https://console.anthropic.com
- (Optional, for real Google sign-in) A Google Cloud project with an OAuth
  client — see §8.1. The app runs fine without this; the "Continue with
  Google" button just shows a sign-in error until it's configured.

---

## 3. Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your keys
cp .env.example .env
# edit .env: set ANTHROPIC_API_KEY, and DATABASE_URL if not using the default
# docker-compose values. Google OAuth vars are optional — see §8.1.

# 3. Start Postgres locally
docker compose up -d

# 4. Generate the Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# 5. Seed the knowledge base (skills, career paths, quiz questions, demo student)
npx prisma db seed
# (or: npm run prisma:seed)

# 6. Run the app
npm run dev
```

Open http://localhost:3000. First-time visitors land on the **landing page**;
clicking "Student Sign In" opens a modal with three ways in — a 1-click demo
account, email/password, or "Continue with Google" (see §8). The signed-in
session is kept client-side and persists across reloads until the person
signs out.

---

## 4. Project layout

```
src/
  app/
    api/
      auth/
        student/route.ts              # POST — demo login + email/password upsert (prototype auth, see §8.2)
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
      dev/demo-user/route.ts           # GET  — legacy, no longer called by the client (see §9)
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
    googleAuth.ts       # Google OAuth: PKCE, token exchange, signed handoff token (see §8.1)
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

## 5. How the sticky-note quiz flow maps to the API

1. **Upload classes from Year 1–4** → `POST /api/transcript/upload` (once per
   file/year). Claude extracts `{courseCode, courseName, grade, credits, term}`
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

## 6. Groundedness & safety guardrails

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

## 7. Swapping in real RAG (O*NET / ILOSTAT / NEA)

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

## 8. Auth

The landing page's sign-in modal (`StudentAuthModal.tsx`) offers three ways
in. Whichever is used, the resulting `StudentUser` is stored client-side
(`localStorage`, see `STORAGE_KEY` in `page.tsx`) and restored automatically
on the next visit until the person signs out.

| Flow | Route | Verifies identity? |
|---|---|---|
| 1-Click Demo | `POST /api/auth/student` (`action: 'demo'`) | No — upserts a fixed seeded demo account |
| Email / password | `POST /api/auth/student` | **No** — upserts by email only, the password field is not checked |
| Continue with Google | `GET /api/auth/google` → `.../callback` → `POST /api/auth/session/consume` | **Yes** — real Google OAuth |

### 8.1 Google OAuth — setup

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

### 8.2 Before any real deployment

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

## 9. Known prototype limitations

- The email/password and demo logins don't verify a password — see §8.2.
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

## 10. Useful commands

```bash
npm run prisma:studio     # Visual DB browser — inspect CounselorReview queue, quiz results, etc.
npm run prisma:migrate    # Create/apply a new migration after schema changes
npm run build && npm start   # Production build
```