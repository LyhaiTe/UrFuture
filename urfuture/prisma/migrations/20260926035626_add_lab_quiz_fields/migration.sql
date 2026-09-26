/*
  Warnings:

  - The values [NEEDS_REVIEW] on the enum `ReviewStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `priorityWeight` on the `CareerSkillRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `requiredProficiency` on the `CareerSkillRequirement` table. All the data in the column will be lost.
  - You are about to drop the column `embedding` on the `KnowledgeChunk` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReviewStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');
ALTER TABLE "CareerRecommendation" ALTER COLUMN "reviewStatus" DROP DEFAULT;
ALTER TABLE "CounselorReview" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CareerRecommendation" ALTER COLUMN "reviewStatus" TYPE "ReviewStatus_new" USING ("reviewStatus"::text::"ReviewStatus_new");
ALTER TABLE "CounselorReview" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TYPE "ReviewStatus" RENAME TO "ReviewStatus_old";
ALTER TYPE "ReviewStatus_new" RENAME TO "ReviewStatus";
DROP TYPE "ReviewStatus_old";
ALTER TABLE "CareerRecommendation" ALTER COLUMN "reviewStatus" SET DEFAULT 'PENDING';
ALTER TABLE "CounselorReview" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropIndex
DROP INDEX "knowledge_chunk_embedding_idx";

-- AlterTable
ALTER TABLE "CareerSkillRequirement" DROP COLUMN "priorityWeight",
DROP COLUMN "requiredProficiency";

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KnowledgeChunk" DROP COLUMN "embedding";

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "codeSnippet" TEXT,
ADD COLUMN     "isLab" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionType" TEXT;
