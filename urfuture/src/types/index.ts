// ---------------------------------------------------------------------------
// Strict JSON contracts the Claude API must fill via tool use / function
// calling. These are the "structured JSON response models" referenced in
// the spec. Keeping them centrally typed lets both the prompt layer and the
// API routes validate against the same shape.
// ---------------------------------------------------------------------------

export interface Citation {
  source: string; // e.g. "O*NET-SOC 15-1252.00", "NEA Cambodia Skills Gap Survey 2023"
  reference: string; // URL, document id, or table cited
  claim: string; // the specific claim this citation supports
}

export interface SkillGapItem {
  skillName: string;
  userProficiency: number; // 0-100
  requiredImportance: number; // 0-100
  gap: number; // requiredImportance - userProficiency, floor 0
}

export interface SkillGapAnalysisResult {
  careerTitle: string;
  fitScore: number; // 0-100
  matchedSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  rationale: string;
  citations: Citation[];
  groundednessScore: number; // 0-1, self-reported fraction of claims with citations
  requiresCounselorReview: boolean;
  reviewReason?: string;
}

export interface StudyPlanWeek {
  weekNumber: number;
  focusSkill: string;
  tasks: string[];
  resources: { title: string; type: 'video' | 'reading' | 'practice' | 'course'; citation?: Citation }[];
}

export interface StudyPlanResult {
  title: string;
  targetSkills: string[];
  weeks: StudyPlanWeek[];
  citations: Citation[];
}

export interface JobFitResult {
  jobTitle: string;
  extractedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  fitScorePercent: number;
  summary: string;
  needsPrep: boolean;
}

export interface QuizGeneratedQuestion {
  skillName: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  sourceCourse?: string;
}

export interface ChatToolTrace {
  tool: string;
  input: unknown;
  output: unknown;
}

// High-stakes triggers that force a CounselorReview row before a
// recommendation can be shown to the student as "final."
export const HIGH_STAKES_KEYWORDS = [
  'switch major',
  'change major',
  'drop out',
  'leave university',
  'declare major',
  'quit school',
  'transfer university',
];

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'COUNSELOR' | 'ADMIN';
  educationLevel?: string;
  institution?: string;
}

