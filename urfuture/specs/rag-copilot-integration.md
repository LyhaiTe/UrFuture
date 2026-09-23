# Spec: RAG & Copilot Integration (Groq + pgvector)

## 1. Problem Statement & Context
UrFuture (cambodia-ai-career-advisor) currently relies on a temporary prototype lookup in `src/lib/knowledgeBase.ts`. This prototype directly queries fixed rows from relational tables (`CareerPath`, `Skill`, `CareerSkillRequirement`) using basic SQL filters (`contains: careerTitle, mode: 'insensitive'`).

Key Deficiencies:
- **No Semantic Search**: Queries in `/api/chat` have zero document retrieval; the model generates replies based solely on past messages and the static `BASE_SYSTEM_PROMPT`.
- **Context Window Bottleneck**: Dumps entire database records into system prompts without relevance ranking or dynamic chunk retrieval.
- **Inability to Ingest Real Unstructured Data**: Cannot ingest or query real Cambodian labor market reports, higher education curricula, or O*NET taxonomy descriptions.
- **Latency with LLM Providers**: Large models like Anthropic Claude or Groq Llama 3 70B suffer from high Time-to-First-Token (TTFT) when overloaded with static contexts.
- **UI Rendering Issues**: The UI lacked rich markdown rendering for tables and complex lists, making detailed plans hard to read.

## 2. Technical Objectives
Implement a unified, production-ready RAG system that:
- Stores vector embeddings using `pgvector` directly inside the PostgreSQL database.
- Uses Voyage AI or OpenAI to embed multi-format documents (PDFs, Markdown, JSON).
- Replaces Anthropic SDK with Groq SDK for lower latency inference in production.
- Integrates `react-markdown` and `remark-gfm` on the frontend for rich UI formatting.
- Exposes a reusable retrieval API (`retrieveRelevantContext()`) that performs cosine similarity search.
- Upholds the ≥90% groundedness guardrail in `src/lib/guardrails.ts`, flagging low-confidence or ungrounded claims.

## 3. Architecture & Data Flow
- **Client (Frontend)**: User interacts with the floating Chat Panel or specific route pages (Career Fit, Study Plan). Messages are sent via SSE streaming. The UI uses `ReactMarkdown` to parse and render rich responses (tables, lists).
- **API Routes (Backend)**: Next.js edge/node functions handle requests using `src/lib/llm.ts` (Groq SDK).
- **RAG Module (Backend)**: `src/lib/rag.ts` uses Voyage AI/OpenAI to generate query embeddings, then searches `KnowledgeChunk` via `pgvector` raw SQL similarity search.
- **Database (PostgreSQL)**: Prisma ORM combined with `pgvector` extension holding `KnowledgeDocument` and `KnowledgeChunk`.

## 4. Implementation Details

### 4.1 Backend Implementation

#### 4.1.1 Database Schema & Vector Extension (`prisma/schema.prisma`)
- Enable `pgvector` in PostgreSQL.
- Add knowledge document and chunk models: `KnowledgeDocument`, `KnowledgeChunk`.
- Attach the `vector(1536)` or `vector(1024)` column using raw SQL migration (`ALTER TABLE "KnowledgeChunk" ADD COLUMN "embedding" vector...`).

#### 4.1.2 Ingestion & Embedding Pipeline (`scripts/ingest-knowledge.ts`)
- CLI script to ingest documents from `data/` or `assets/knowledge/`.
- Splits documents using recursive character chunking.
- Generates vector embeddings via an embedding provider (Voyage AI or OpenAI).
- Upserts chunks and vectors into `KnowledgeChunk`.

#### 4.1.3 Retrieval Module & LLM Swap (`src/lib/rag.ts`, `src/lib/llm.ts`)
- Built `src/lib/rag.ts` providing `retrieveRelevantContext(query)` executing raw SQL vector distance: `SELECT id, content, metadata, 1 - (embedding <=> $1::vector) AS similarity`.
- Built `src/lib/llm.ts` to replace `@anthropic-ai/sdk` with `groq-sdk` for faster Time-to-First-Token (TTFT) via `streamChat()`.

#### 4.1.4 Route Integration
- `src/app/api/chat/route.ts`: Extracts user query intent, runs `retrieveRelevantContext()`, and uses Groq's `streamChat()`.
- `src/app/api/career/recommend/route.ts`: Matches career pathways dynamically using embeddings.
- `src/app/api/study-plan/generate/route.ts`: Queries syllabus chunks for missing skills to pull concrete course topics.
- `src/lib/guardrails.ts`: Validates automated `CounselorReview` escalation on low groundedness.

### 4.2 Frontend Implementation

#### 4.2.1 Chat Panel & Markdown Rendering (`src/components/ChatPanel.tsx`)
- Install `react-markdown` and `remark-gfm`.
- Replace basic string-splitting renderer with `ReactMarkdown` to support tables, nested lists, and rich typography.
- Implement UI blocks to display RAG citations underneath assistant messages (retrieved via SSE `done` event data).
- Handle SSE `error` events to display visible error blocks rather than leaving empty chat bubbles.
- Update `BASE_SYSTEM_PROMPT` (`src/lib/prompts.ts`) to strictly enforce Markdown guidelines and disallow raw HTML like `<br>`.

## 5. Environment Variables
```env
# LLM Provider
GROQ_API_KEY="gsk_..."
LLM_MODEL="openai/gpt-oss-20b"

# Vector Database & RAG
EMBEDDING_PROVIDER="voyage" # or "openai", "local"
VOYAGE_API_KEY="pa-..."
VOYAGE_MODEL="voyage-large-2"
EMBEDDING_MODEL="text-embedding-3-small"

# Vector Search Tuning
RAG_SIMILARITY_THRESHOLD="0.72"
RAG_TOP_K="5"
```

## 6. Detailed Task Checklist

### Backend Tasks
- [x] Enable `pgvector` in Docker compose.
- [x] Update `prisma/schema.prisma` with `KnowledgeDocument` and `KnowledgeChunk`.
- [x] Run raw SQL migration to add vector columns and HNSW/IVFFlat index.
- [x] Create `scripts/ingest-knowledge.ts` supporting markdown/PDF ingestion.
- [x] Swap LLM provider from Anthropic to Groq (`src/lib/llm.ts`).
- [x] Update API endpoints (`/api/chat`, `/api/career/recommend`, etc.) to use `groq-sdk` and real-time vector retrieval.
- [x] Update `scripts/measure-chat-ttft.ts` to measure Groq latency.

### Frontend Tasks
- [x] Clean up Dashboard UI (removed unnecessary Ask Copilot quick-input per user feedback).
- [x] Install `react-markdown` and `remark-gfm` dependencies.
- [x] Refactor `ChatPanel.tsx` to utilize `ReactMarkdown` for message rendering.
- [x] Implement a collapsible "Sources" UI block in `ChatPanel.tsx` for RAG citations.
- [x] Handle SSE stream `error` events gracefully in the Chat UI.
- [x] Update system prompts to enforce strict Markdown output (no raw HTML).

## 7. Definition of Done
- `pgvector` correctly stores and retrieves document chunks.
- Groq models successfully handle multi-turn streaming via SSE without silent failures.
- TTFT latency sits below acceptable thresholds (tested via `npm run measure:ttft`).
- Chat interface gracefully displays markdown tables and citations natively.
- Groundedness guardrails correctly flag hallucinated or low-confidence claims.

