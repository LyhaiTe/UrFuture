-- CreateEnum
CREATE TYPE "KnowledgeCategory" AS ENUM ('CAREER_OUTLOOK', 'ACADEMIC_SYLLABUS', 'SCHOLARSHIP', 'LABOR_STAT');

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "url" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeDocument_category_idx" ON "KnowledgeDocument"("category");

-- CreateIndex
CREATE INDEX "KnowledgeDocument_source_idx" ON "KnowledgeDocument"("source");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");

-- AddForeignKey
ALTER TABLE "KnowledgeChunk"
  ADD CONSTRAINT "KnowledgeChunk_documentId_fkey"
  FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- pgvector: enable the extension and add the embedding column + index.
-- Prisma's schema language has no native vector type, so this part is hand
-- written rather than generated from schema.prisma (KnowledgeChunk.embedding
-- exists at the DB level only — see src/lib/rag.ts, which queries it via
-- raw SQL).
-- ---------------------------------------------------------------------------

-- Safe to re-run; both local Docker Compose (pgvector/pgvector:pg16, see
-- docker-compose.yml) and AWS RDS PostgreSQL >= 15 support this extension
-- when the connecting role has CREATE rights.
CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "KnowledgeChunk"
  ADD COLUMN IF NOT EXISTS "embedding" vector(1536);

-- IVFFlat approximate-nearest-neighbor index tuned for the expected corpus
-- size (a few thousand chunks from NEA/ILOSTAT/university curricula, not
-- millions of rows). `lists = 100` is a reasonable default at that scale;
-- revisit per the pgvector docs if the knowledge base grows an order of
-- magnitude. ivfflat indexes are built from a data sample, so they're more
-- accurate once real rows exist — the ingestion script REINDEXes after a
-- run to account for this.
CREATE INDEX IF NOT EXISTS "knowledge_chunk_embedding_idx"
  ON "KnowledgeChunk"
  USING ivfflat ("embedding" vector_cosine_ops)
  WITH (lists = 100);