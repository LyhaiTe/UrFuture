# UrFuture (capstone codename: Phlouv) — Cambodian AI Career & Academic Planning Advisor

A production-grade prototype for the capstone spec: a conversational advisor that unifies personalized study planning, career pathway mapping, and adaptive diagnostic quizzes for Cambodian high school and university students — with grounded (cited) recommendations and a human-counselor safety gate for high-stakes decisions.

**Core Workflow**:
> **Upload past transcripts (Year 1–4)** ➔ **AI generates diagnostic quiz** ➔ **See knowledge & skill proficiency %** ➔ **Get grounded job/major recommendations** ➔ **Paste job description to check fit** ➔ **Get an adaptive study plan for skill gaps**.

---

## ⚡ Quickstart for New Clones (Under 5 Minutes)

If you just cloned this repository, follow these exact steps to get up and running:

### 1. Clone & Enter Project Directory
```bash
git clone https://github.com/LyhaiTe/UrFuture.git
cd UrFuture/urfuture
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure `.env`
Copy the template to create your local `.env`:
* **Windows (PowerShell)**: `Copy-Item .env.example .env`
* **macOS / Linux**: `cp .env.example .env`

Open `.env` and fill in the required keys:
```env
# 1. LLM API (Required for Chat & Quiz generation)
# Get a free key at: https://console.groq.com/keys
GROQ_API_KEY="gsk_..."
LLM_MODEL="llama-3.3-70b-versatile"

# 2. Database (Matches docker-compose.yml below)
DATABASE_URL="postgresql://advisor:advisor@localhost:5433/urfuture?schema=public"

# 3. Vector Embeddings for RAG
# If you have a Voyage AI key (https://dash.voyageai.com/):
EMBEDDING_PROVIDER="voyage"
VOYAGE_API_KEY="pa-..."
# OR for 100% free offline dev with zero API keys or rate limits:
# EMBEDDING_PROVIDER="local"
```
*(Google OAuth, Pinecone, and GCS buckets are **optional** for local development. The app provides a 1-click demo login).*

### 4. Start PostgreSQL with `pgvector`
Ensure Docker Desktop is running, then run:
```bash
docker compose up -d
```
*Runs PostgreSQL with the `pgvector` extension on port **5433** (configured to avoid conflicts with standard local Postgres on 5432).*

### 5. Initialize & Seed Database
Run this sequence to apply migrations, seed careers, and index the RAG knowledge documents:

```bash
# 1. Generate Prisma client & apply database migrations (including pgvector extension)
npm run prisma:generate
npx prisma migrate deploy

# 2. Seed basic skills, careers, pathways, and demo student
npm run prisma:seed

# 3. Seed standardized O*NET occupations (SOC codes, skill weights, Cambodian priorities)
npx tsx scripts/seed-onet-data.ts

# 4. Ingest knowledge base documents into pgvector for AI semantic search
npm run rag:ingest
```

### 6. Start the App
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser:
* On the landing page, click **"1-Click Demo Student"** to jump straight into the full dashboard without needing any OAuth credentials!

---

## 1. Tech Stack

| Layer | Choice | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS | Responsive student portal & dashboard |
| **Markdown / UI** | `react-markdown` + `remark-gfm` | Tables, lists, code rendering in chat |
| **Visualizations** | Recharts (Radar Chart) + React Flow | Skill mastery radar & interactive career pathway graphs |
| **Backend** | Next.js Route Handlers (SSE streaming) | Real-time chat streaming, quiz grading, career fit |
| **Database** | PostgreSQL 16 + `pgvector` + Prisma ORM | Relational data + cosine similarity vector embeddings |
| **AI Inference** | Groq SDK (`groq-sdk`) | Low-latency inference (`llama-3.3-70b-versatile`) |
| **Embeddings** | Voyage AI (`voyage-large-2`) / OpenAI / Local | Document vectorization for RAG |
| **Auth** | 1-Click Demo, Email/Password, or Google OAuth | Flexible authentication options |
| **Taxonomy & RAG**| O*NET Content Model, ILOSTAT, NEA Cambodia | Grounded recommendations citing official standards |

---

## 2. Common Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server on `localhost:3000` |
| `npm run build` | Validate TypeScript and build Next.js for production |
| `npm run type-check` | Run `tsc --noEmit` across entire codebase |
| `npm run prisma:studio` | Visual browser for viewing database tables & reviews |
| `npm run prisma:seed` | Re-seed default demo users, careers, and quiz questions |
| `npx tsx scripts/seed-onet-data.ts` | Sync official O*NET-SOC careers and skill requirements |
| `npm run rag:ingest` | Embed markdown/PDF documents from `data/knowledge` into `pgvector` |
| `npm run verify:guardrails` | Run test suite verifying citations, groundedness (≥90%), and counselor escalation |
| `docker compose down` | Stop the local PostgreSQL container |

---

## 3. Project Structure

```
urfuture/
├── data/
│   └── knowledge/                    # Source documents ingested into pgvector
│       ├── cadt-cs-curriculum.md     # Cambodian university curriculum
│       ├── ilostat-kh-wage-snapshot.md
│       ├── nea-skills-gap-survey-2023.md
│       └── onet-occupations-skills-taxonomy.md # O*NET SOC classifications
├── prisma/
│   ├── schema.prisma                 # Core database schema (User, CareerPath, Skill, etc.)
│   ├── migrations/                   # Applied PostgreSQL migrations
│   └── seed.ts                       # Base database seeder
├── scripts/
│   ├── seed-onet-data.ts             # Seeds 7 target O*NET careers and 37 skills
│   ├── ingest-knowledge.ts           # RAG ingestion pipeline into pgvector
│   ├── verify-guardrails.ts          # Citation contract & guardrails test suite
│   └── measure-chat-ttft.ts          # Latency benchmarking for Groq LLM
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/                 # Demo auth & Google OAuth handlers
│   │   │   ├── chat/                 # RAG-grounded copilot endpoint (SSE stream)
│   │   │   ├── career/recommend/     # Career pathway matching & skill-gap analysis
│   │   │   ├── quiz/                 # Adaptive transcript diagnostic quiz generation & grading
│   │   │   └── study-plan/generate/  # Dynamic remedial study plan generator
│   │   └── page.tsx                  # Landing page & tabbed dashboard orchestrator
│   ├── components/
│   │   ├── ChatPanel.tsx             # Floating AI advisor copilot with markdown & citations
│   │   ├── CareerFitPanel.tsx        # Career matching, requirements, and gap visualization
│   │   ├── QuizPanel.tsx             # Diagnostic quiz taking interface
│   │   ├── SkillRadarChart.tsx       # Recharts skill visualization
│   │   └── PathwayGraph.tsx          # React Flow career pathway progression
│   └── lib/
│       ├── llm.ts                    # Groq SDK streaming integration
│       ├── rag.ts                    # pgvector similarity search & chunk retrieval
│       ├── embeddings.ts             # Voyage AI / OpenAI / Local embedding client
│       ├── onet.ts                   # O*NET Web Services client & taxonomy references
│       ├── guardrails.ts             # Groundedness checks (≥90%) & counselor escalation
│       └── prompts.ts                # System prompts with citation rules
└── docker-compose.yml                # PostgreSQL 16 + pgvector container definition
```

---

## 4. Groundedness & Safety Guardrails

UrFuture enforces safety and anti-hallucination protocols on high-stakes academic decisions:
1. **Mandatory Citations**: Every career recommendation and salary claim must cite an official source (`[O*NET-SOC xx-xxxx.xx]`, `[ILOSTAT Cambodia]`, or `[NEA Cambodia]`).
2. **Double Groundedness Check**:
   - Model claims are evaluated with an independent server-side groundedness scorer (`estimateGroundednessAgainstChunks`).
   - If the groundedness score falls below **90%**, or if high-stakes actions are detected (e.g. dropping out, switching majors), the recommendation automatically creates a `CounselorReview` record with status `PENDING`.
3. **No Answers Leaked**: Diagnostic quiz answer keys (`QuizQuestion.correctIndex`) are strictly withheld server-side and graded via `POST /api/quiz/evaluate`.

---

## 5. Troubleshooting & FAQ

### `ERROR: extension "vector" is not available`
* Your Postgres container is running standard Postgres without `pgvector`.
* Fix: Run `docker compose up -d --force-recreate` to pull and switch to `pgvector/pgvector:pg16`. Then run `npx prisma migrate deploy`.

### `Voyage embeddings request failed (429): Rate limit exceeded`
* Voyage AI free accounts without a billing card have a rate limit of **3 Requests Per Minute (3 RPM)**.
* The ingestion script automatically waits 21 seconds between batches on rate limit.
* Alternatively, switch to local embeddings in `.env` by setting `EMBEDDING_PROVIDER="local"`.

### Database connection error on port 5432
* UrFuture's Docker Compose binds PostgreSQL to port **`5433`** on your machine to avoid colliding with any local Postgres instances you might already have installed. Ensure your `DATABASE_URL` in `.env` uses port `5433`.

### Optional: Setting up Google OAuth
If you want to test real Google Sign-In instead of 1-Click Demo:
1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Type: Web Application).
3. Set the Authorized Redirect URI to: `http://localhost:3000/api/auth/student/google/callback`
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `AUTH_SESSION_SECRET` in `.env`.