ALTER TYPE "ReviewStatus" ADD VALUE IF NOT EXISTS 'NEEDS_REVIEW';

ALTER TABLE "User"
  ADD COLUMN "passwordHash" TEXT,
  ADD COLUMN "university" TEXT,
  ADD COLUMN "graduationYear" INTEGER;

UPDATE "UserSkill"
SET "source" = CASE UPPER("source")
  WHEN 'TRANSCRIPT' THEN 'TRANSCRIPT'
  WHEN 'QUIZ' THEN 'QUIZ'
  WHEN 'SELF_REPORTED' THEN 'SELF_REPORTED'
  ELSE 'SELF_REPORTED'
END;

CREATE TYPE "SkillVerificationSource" AS ENUM ('TRANSCRIPT', 'QUIZ', 'SELF_REPORTED');
ALTER TABLE "UserSkill"
  ALTER COLUMN "source" TYPE "SkillVerificationSource"
  USING "source"::"SkillVerificationSource";

ALTER TABLE "CareerPath"
  ADD COLUMN "industry" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "salaryMinUsd" DOUBLE PRECISION,
  ADD COLUMN "salaryMaxUsd" DOUBLE PRECISION;

ALTER TABLE "CareerSkillRequirement"
  ADD COLUMN "requiredProficiency" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "priorityWeight" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "PathwayStep"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "requiredCourses" JSONB,
  ADD COLUMN "certifications" JSONB,
  ADD COLUMN "internshipRequirements" TEXT;

ALTER TABLE "CareerRecommendation"
  ADD COLUMN "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "counselorNotes" TEXT;

ALTER TABLE "StudyPlan"
  ADD COLUMN "generatedSchedule" JSONB,
  ADD COLUMN "weeklyModules" JSONB;

ALTER TABLE "QuizQuestion"
  ADD COLUMN "courseCode" TEXT;

ALTER TABLE "QuizAnswer"
  ADD COLUMN "studentAnswer" TEXT,
  ADD COLUMN "skillUpdate" DOUBLE PRECISION;

ALTER TABLE "Conversation"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "UserSkill_skillId_idx" ON "UserSkill"("skillId");
CREATE INDEX "CareerSkillRequirement_skillId_idx" ON "CareerSkillRequirement"("skillId");
CREATE UNIQUE INDEX "PathwayStep_careerPathId_order_key" ON "PathwayStep"("careerPathId", "order");
CREATE INDEX "CounselorReview_counselorId_idx" ON "CounselorReview"("counselorId");

ALTER TABLE "UserSkill"
  ADD CONSTRAINT "UserSkill_proficiency_range_check"
  CHECK ("proficiency" >= 0 AND "proficiency" <= 100);

ALTER TABLE "CareerSkillRequirement"
  ADD CONSTRAINT "CareerSkillRequirement_requiredProficiency_range_check"
  CHECK ("requiredProficiency" >= 0 AND "requiredProficiency" <= 100),
  ADD CONSTRAINT "CareerSkillRequirement_priorityWeight_range_check"
  CHECK ("priorityWeight" >= 0);

ALTER TABLE "CareerRecommendation"
  ADD CONSTRAINT "CareerRecommendation_fitScore_range_check"
  CHECK ("fitScore" >= 0 AND "fitScore" <= 100);

ALTER TABLE "QuizAnswer"
  ADD CONSTRAINT "QuizAnswer_selectedIndex_nonnegative_check"
  CHECK ("selectedIndex" >= 0);

ALTER TABLE "QuizQuestion"
  ADD CONSTRAINT "QuizQuestion_correctIndex_nonnegative_check"
  CHECK ("correctIndex" >= 0);

ALTER TABLE "QuizAttempt"
  ADD CONSTRAINT "QuizAttempt_scorePercent_range_check"
  CHECK ("scorePercent" IS NULL OR ("scorePercent" >= 0 AND "scorePercent" <= 100));

ALTER TABLE "JobFitCheck"
  ADD CONSTRAINT "JobFitCheck_fitScorePercent_range_check"
  CHECK ("fitScorePercent" >= 0 AND "fitScorePercent" <= 100);

ALTER TABLE "CareerPath"
  ADD CONSTRAINT "CareerPath_salary_range_check"
  CHECK ("salaryMinUsd" IS NULL OR "salaryMaxUsd" IS NULL OR "salaryMinUsd" <= "salaryMaxUsd");