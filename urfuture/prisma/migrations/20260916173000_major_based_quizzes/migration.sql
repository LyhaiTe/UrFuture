ALTER TABLE "User"
  ADD COLUMN "selectedMajorId" TEXT;

ALTER TABLE "QuizQuestion"
  ADD COLUMN "careerPathId" TEXT;

ALTER TABLE "QuizAttempt"
  ADD COLUMN "careerPathId" TEXT;

CREATE INDEX "QuizQuestion_careerPathId_idx" ON "QuizQuestion"("careerPathId");
CREATE INDEX "QuizAttempt_careerPathId_idx" ON "QuizAttempt"("careerPathId");

ALTER TABLE "User"
  ADD CONSTRAINT "User_selectedMajorId_fkey"
  FOREIGN KEY ("selectedMajorId") REFERENCES "CareerPath"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "QuizQuestion"
  ADD CONSTRAINT "QuizQuestion_careerPathId_fkey"
  FOREIGN KEY ("careerPathId") REFERENCES "CareerPath"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "QuizAttempt"
  ADD CONSTRAINT "QuizAttempt_careerPathId_fkey"
  FOREIGN KEY ("careerPathId") REFERENCES "CareerPath"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
