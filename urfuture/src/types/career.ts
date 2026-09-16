export type CareerCategoryId =
  | 'engineering'
  | 'data'
  | 'design'
  | 'infrastructure'
  | 'management'
  | 'other';

export interface CareerCategory {
  id: CareerCategoryId;
  /** Full name, used in the detail modal and in screen-reader labels. */
  label: string;
  /** Short name for the filter pill, where horizontal space is tight. */
  pillLabel: string;
  /** Canonical role titles that belong to this category. */
  roles: string[];
}

/* --------------------------- market: overview --------------------------- */

export type DemandLevel = 'High' | 'Medium' | 'Low';
export type GrowthTrend = 'Growing' | 'Stable' | 'Declining';
export type CompetitionLevel = 'Low' | 'Moderate' | 'High';
export type SeniorityLevel = 'Entry' | 'Mid' | 'Senior';
export type CompanySize = 'Small' | 'Medium' | 'Large';

export interface SalaryBand {
  level: SeniorityLevel;
  minUsd: number;
  maxUsd: number;
}

export interface MarketOverview {
  demandLevel: DemandLevel;
  growthTrend: GrowthTrend;
  /** Entry / Mid / Senior monthly gross ranges, in USD. */
  salaryBands: SalaryBand[];
  /** Approximate count of live postings across tracked Cambodian job boards. */
  openPositions: number;
  /** Mean applicants per posting — drives the competition read-out. */
  applicantsPerPosition: number;
  competitionLevel: CompetitionLevel;
  /** One plain-language sentence a student can act on. */
  note: string;
}

/* --------------------------- market: employers -------------------------- */

export interface HiringIndustry {
  sector: string;
  /** Share of tracked postings for this role, 0-100. Used for the bar width. */
  shareOfPostings: number;
  exampleEmployers: string[];
}

export interface HiringCompany {
  name: string;
  size: CompanySize;
  sector: string;
  salaryMinUsd: number;
  salaryMaxUsd: number;
  benefits: string[];
  /** Omitted when we have no verified careers page. Never guess a URL. */
  careersUrl?: string;
}

/* ------------------- qualifications, progression, related ---------------- */

export interface Qualifications {
  technicalSkills: string[];
  softSkills: string[];
  education: string;
  certifications: string[];
  experienceExpected: string;
}

export interface ProgressionStage {
  level: string;
  timeline: string;
  salaryRangeUsd: string;
  skillsToAdvance: string[];
}

export type RelationshipKind =
  | 'Similar role'
  | 'Lateral move'
  | 'Specialisation';

export interface RelatedCareer {
  title: string;
  relationship: RelationshipKind;
  reason: string;
  /** Slug of a career in the catalogue, when one exists — enables in-modal jumps. */
  slug?: string;
}

/* ------------------------------ provenance ------------------------------ */

export interface MarketSource {
  label: string;
  reference: string;
}

/**
 * Everything the detail modal renders for one role. Keyed by career slug so
 * the lookup stays independent of the list ordering or of database ids.
 */
export interface CareerMarketProfile {
  slug: string;
  overview: MarketOverview;
  industries: HiringIndustry[];
  companies: HiringCompany[];
  qualifications: Qualifications;
  progression: ProgressionStage[];
  related: RelatedCareer[];
  sources: MarketSource[];
  /** ISO date. The UI shows this so stale data is visible, not silent. */
  lastReviewed: string;
}

/* -------------------------------- career -------------------------------- */

export interface CareerNextStep {
  title: string;
  priority: 'High priority' | 'Medium priority';
  description: string;
}

export interface Career {
  id: number;
  slug: string;
  title: string;
  categoryId: CareerCategoryId;
  matchScore: number;
  fitLabel: string;
  missingSkill: string;
  rationale: string;
  matchedSkills: string[];
  skillsToStrengthen: string[];
  nextSteps: CareerNextStep[];
}