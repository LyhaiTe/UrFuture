'use client';

import type {
  Career,
  CareerMarketProfile,
  CompetitionLevel,
  DemandLevel,
  GrowthTrend,
  HiringCompany,
} from '@/types/career';

/* ------------------------------- helpers -------------------------------- */

const CARD =
  'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5';

const usd = (value: number) => `$${value.toLocaleString('en-US')}`;

function demandTone(level: DemandLevel) {
  if (level === 'High') return 'text-[#34d399]';
  if (level === 'Medium') return 'text-amber-500 dark:text-amber-400';
  return 'text-slate-500';
}

function growthTone(trend: GrowthTrend) {
  if (trend === 'Growing') return 'text-[#34d399]';
  if (trend === 'Stable') return 'text-[#00d2ff]';
  return 'text-rose-500 dark:text-rose-400';
}

function growthGlyph(trend: GrowthTrend) {
  if (trend === 'Growing') return '↑';
  if (trend === 'Stable') return '→';
  return '↓';
}

/**
 * Competition is inverted: low competition is good news for the student, so it
 * gets the positive colour. Getting this backwards is an easy mistake and the
 * kind that quietly misleads someone making a real decision.
 */
function competitionTone(level: CompetitionLevel) {
  if (level === 'Low') return 'text-[#34d399]';
  if (level === 'Moderate') return 'text-amber-500 dark:text-amber-400';
  return 'text-rose-500 dark:text-rose-400';
}

function Stat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: string;
  hint?: string;
}) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1.5 text-lg font-bold ${tone ?? 'text-slate-900 dark:text-slate-50'}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">
      {children}
    </h3>
  );
}

/* ----------------------------- A. your fit ------------------------------ */

export function FitSection({ career }: { career: Career }) {
  return (
    <div className="flex flex-col gap-5">
      <div className={CARD}>
        <SectionHeading>Why this fits you</SectionHeading>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
          {career.rationale}
        </p>
        <p className="text-xs text-slate-500 mt-4">
          This is guidance, not a final academic or career decision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className={CARD}>
          <SectionHeading>Matched skills</SectionHeading>
          <ul className="space-y-3">
            {career.matchedSkills.map((skill) => (
              <li key={skill} className="flex items-center gap-2 text-sm text-[#34d399]">
                <span aria-hidden="true">✓</span>
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={CARD}>
          <SectionHeading>Skills to strengthen</SectionHeading>
          <ol className="space-y-3">
            {career.skillsToStrengthen.map((skill, index) => (
              <li
                key={skill}
                className="flex gap-3 text-sm text-amber-600 dark:text-amber-400"
              >
                <span className="text-slate-400 dark:text-slate-500">{index + 1}.</span>
                <span>{skill}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className={CARD}>
        <SectionHeading>Recommended next steps</SectionHeading>
        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {career.nextSteps.map((step) => (
            <div
              key={step.title}
              className="grid grid-cols-1 md:grid-cols-[220px_150px_1fr] gap-3 md:items-center py-3 first:pt-0 last:pb-0"
            >
              <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                {step.title}
              </span>
              <span
                className={`text-xs font-medium ${
                  step.priority === 'High priority' ? 'text-[#00d2ff]' : 'text-[#34d399]'
                }`}
              >
                {step.priority}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {step.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------- B. market overview + industries ------------------- */

export function MarketSection({ profile }: { profile: CareerMarketProfile }) {
  const { overview, industries } = profile;

  return (
    <div className="flex flex-col gap-5">
      <div className={CARD}>
        <SectionHeading>Job market in Cambodia</SectionHeading>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat
            label="Demand"
            value={overview.demandLevel}
            tone={demandTone(overview.demandLevel)}
          />
          <Stat
            label="Growth trend"
            value={`${growthGlyph(overview.growthTrend)} ${overview.growthTrend}`}
            tone={growthTone(overview.growthTrend)}
          />
          <Stat
            label="Open positions"
            value={`~${overview.openPositions}`}
            hint="Across tracked job boards"
          />
          <Stat
            label="Competition"
            value={overview.competitionLevel}
            tone={competitionTone(overview.competitionLevel)}
            hint={`~${overview.applicantsPerPosition} applicants per role`}
          />
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-6 mt-4">
          {overview.note}
        </p>
      </div>

      <div className={CARD}>
        <SectionHeading>Monthly salary by level</SectionHeading>
        <div className="space-y-3">
          {overview.salaryBands.map((salaryBand) => (
            <div
              key={salaryBand.level}
              className="flex items-baseline justify-between gap-4 text-sm"
            >
              <span className="text-slate-600 dark:text-slate-400">
                {salaryBand.level}
              </span>
              <span className="font-semibold text-slate-900 dark:text-slate-50 tabular-nums">
                {usd(salaryBand.minUsd)} – {usd(salaryBand.maxUsd)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4">
          Gross monthly, in USD. Salaries in Cambodia are usually quoted and
          often paid in USD; riel equivalents vary with the daily rate.
        </p>
      </div>

      <div className={CARD}>
        <SectionHeading>Industries hiring for this role</SectionHeading>
        <div className="space-y-4">
          {industries.map((industry) => (
            <div key={industry.sector}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-slate-900 dark:text-slate-100 font-medium">
                  {industry.sector}
                </span>
                <span className="text-xs text-slate-500 tabular-nums">
                  {industry.shareOfPostings}% of postings
                </span>
              </div>

              <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00d2ff] transition-[width] duration-500 ease-out"
                  style={{ width: `${industry.shareOfPostings}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {industry.exampleEmployers.join(' · ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- C. hiring companies ------------------------ */

function CompanyCard({ company }: { company: HiringCompany }) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {company.name}
        </h4>
        <span className="text-sm font-semibold text-[#34d399] tabular-nums">
          {usd(company.salaryMinUsd)} – {usd(company.salaryMaxUsd)}/mo
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-500">
        {company.sector} · {company.size} employer
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5">
        {company.benefits.map((benefit) => (
          <li
            key={benefit}
            className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300"
          >
            {benefit}
          </li>
        ))}
      </ul>

      {company.careersUrl ? (
        <a
          href={company.careersUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs font-medium text-[#00d2ff] hover:underline"
        >
          Open careers page
        </a>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          No verified careers link on file — search the company name on
          BongThom or CamHR.
        </p>
      )}
    </div>
  );
}

export function EmployersSection({ profile }: { profile: CareerMarketProfile }) {
  return (
    <div className={CARD}>
      <SectionHeading>Companies hiring for this role</SectionHeading>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {profile.companies.map((company) => (
          <CompanyCard key={company.name} company={company} />
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-4">
        Salary ranges are per employer for this role and reflect the full
        junior-to-senior span, not a starting offer.
      </p>
    </div>
  );
}

/* --------------------------- D. qualifications -------------------------- */

function SkillList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-2.5">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item}
            className="text-sm text-slate-600 dark:text-slate-400 flex gap-2"
          >
            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function QualificationsSection({ profile }: { profile: CareerMarketProfile }) {
  const q = profile.qualifications;

  return (
    <div className="flex flex-col gap-5">
      <div className={CARD}>
        <SectionHeading>What employers ask for</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkillList title="Technical skills" items={q.technicalSkills} />
          <SkillList title="Soft skills" items={q.softSkills} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className={CARD}>
          <SectionHeading>Education</SectionHeading>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
            {q.education}
          </p>
        </div>

        <div className={CARD}>
          <SectionHeading>Certifications</SectionHeading>
          <ul className="space-y-2">
            {q.certifications.map((certification) => (
              <li key={certification} className="text-sm text-slate-600 dark:text-slate-400">
                {certification}
              </li>
            ))}
          </ul>
        </div>

        <div className={CARD}>
          <SectionHeading>Experience expected</SectionHeading>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
            {q.experienceExpected}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------- E. progression + F. related careers ---------------- */

export function ProgressionSection({
  profile,
  onSelectCareer,
}: {
  profile: CareerMarketProfile;
  onSelectCareer: (slug: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className={CARD}>
        <SectionHeading>Career progression</SectionHeading>

        <ol className="relative border-l border-slate-200 dark:border-slate-800 ml-1.5 space-y-6">
          {profile.progression.map((stage) => (
            <li key={stage.level} className="pl-6">
              <span
                className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[#00d2ff]"
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {stage.level}
                </h4>
                <span className="text-xs text-slate-500 tabular-nums">
                  {stage.timeline} · {stage.salaryRangeUsd}/mo
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">To reach the next level</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {stage.skillsToAdvance.map((skill) => (
                  <li
                    key={skill}
                    className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>

      <div className={CARD}>
        <SectionHeading>Related career paths</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profile.related.map((related) => {
            const jumpable = Boolean(related.slug);

            return (
              <button
                key={related.title}
                type="button"
                disabled={!jumpable}
                onClick={() => related.slug && onSelectCareer(related.slug)}
                className={`text-left border border-slate-200 dark:border-slate-800 rounded-lg p-4 transition-colors ${
                  jumpable
                    ? 'hover:border-[#00d2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d2ff]'
                    : 'cursor-default'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {related.title}
                  </span>
                  <span className="text-xs text-slate-500">{related.relationship}</span>
                </div>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-5">
                  {related.reason}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ provenance ------------------------------ */

export function ProvenanceFooter({ profile }: { profile: CareerMarketProfile }) {
  return (
    <div className="border border-amber-300/60 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 rounded-xl p-4">
      <p className="text-xs text-amber-900 dark:text-amber-200 leading-5">
        Market figures are prototype estimates, last reviewed{' '}
        {profile.lastReviewed}. Check a current posting before you rely on any
        salary here.
      </p>
      <ul className="mt-2 space-y-1">
        {profile.sources.map((source) => (
          <li key={source.reference} className="text-xs text-amber-800 dark:text-amber-300/80">
            {source.label} — {source.reference}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Shown when a career has no researched market profile yet. */
export function MissingProfileNotice({ title }: { title: string }) {
  return (
    <div className={CARD}>
      <SectionHeading>Market detail not reviewed yet</SectionHeading>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-6">
        We don&apos;t have verified Cambodia job-market data for {title} yet, so
        nothing is shown here rather than an estimate you can&apos;t check. The
        fit analysis on the first tab still applies.
      </p>
    </div>
  );
}