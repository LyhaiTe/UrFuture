ALTER TABLE "Transcript"
ADD COLUMN "fileHash" TEXT;

CREATE INDEX IF NOT EXISTS "Transcript_userId_fileHash_idx"
ON "Transcript"("userId", "fileHash");
