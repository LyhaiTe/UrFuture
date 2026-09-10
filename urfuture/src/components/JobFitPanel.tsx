'use client';

import { useState } from 'react';

interface JobFitResult {
  jobTitle: string;
  extractedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  fitScorePercent: number;
  summary: string;
  needsPrep: boolean;
}

interface GeneratedStudyPlan {
  id?: string;
  title: string;
  targetSkills: string[];
  weeks: {
    weekNumber: number;
    focusSkill: string;
    tasks: string[];
    resources: { title: string; type: string }[];
  }[];
}

const SAMPLE_JOBS = [
  {
    title: 'Junior Software Engineer',
    desc: 'Requirements: Bachelor in CS or related field. Solid knowledge in Data Structures & Algorithms, Programming Fundamentals in TypeScript/Python, and basic understanding of Statistics. Experience with relational databases and written communication.',
  },
  {
    title: 'Data & Business Analyst',
    desc: 'Requirements: Strong knowledge of Statistics & Probability, Business & Financial Literacy, and English Proficiency. Experience with dashboarding, SQL, and project management fundamentals.',
  },
];

export default function JobFitPanel({ userId }: { userId: string }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobFitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planBusy, setPlanBusy] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedStudyPlan | null>(null);

  async function checkFit() {
    setBusy(true);
    setError(null);
    setResult(null);
    setGeneratedPlan(null);
    try {
      const res = await fetch('/api/job/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, jobTitle, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not analyze job fit');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not analyze job fit');
    } finally {
      setBusy(false);
    }
  }

  async function requestPrepPlan() {
    if (!result) return;
    setPlanBusy(true);
    try {
      const res = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetSkillNames: result.missingSkills, weeksRequested: 6 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate plan');
      setGeneratedPlan(data.studyPlan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate plan');
    } finally {
      setPlanBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Job input card */}
      <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
              Job Description Fit-Check &amp; Gap Assessment
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Paste any job posting to compare required qualifications against your verified knowledge map.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-[#00d2ff] px-2.5 py-0.5 rounded-full bg-[#0c4a6e]/40 border border-[#0284c7]/40">
            Semantic Matcher
          </span>
        </div>

        {/* Sample JD loader chips */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Try a sample:</span>
          {SAMPLE_JOBS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setJobTitle(s.title);
                setJobDescription(s.desc);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#0e172a] hover:bg-[#162544] text-slate-300 hover:text-white border border-[#1b2b4c] transition"
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job Title (e.g. Junior Data Engineer, Full-Stack Developer)"
            className="rounded-xl bg-[#0e172a] border border-[#1b2b4c] focus:border-[#00d2ff] px-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 outline-none"
          />
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description or role requirements here…"
            rows={5}
            className="rounded-xl bg-[#0e172a] border border-[#1b2b4c] focus:border-[#00d2ff] px-4 py-3 text-xs text-slate-200 placeholder-slate-500 outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] text-slate-500">
              {jobDescription.length} characters (min 20)
            </span>
            <button
              onClick={checkFit}
              disabled={!jobTitle.trim() || jobDescription.length < 20 || busy}
              className="rounded-xl bg-[#00d2ff] hover:bg-[#00bfe6] disabled:opacity-40 text-[#080d1a] px-6 py-2.5 text-xs font-bold shadow-md shadow-[#00d2ff]/20 transition-all flex items-center gap-2"
            >
              {busy ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
                  Extracting skills &amp; matching…
                </>
              ) : (
                'Analyze Fit Score'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}
      </div>

      {/* Fit Result View */}
      {result && (
        <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1b2947] pb-4">
            <div>
              <span className="text-[11px] font-bold text-[#00d2ff] uppercase tracking-wider block">
                Target Role Fit
              </span>
              <h4 className="text-lg font-bold text-white mt-0.5">{result.jobTitle}</h4>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-extrabold text-[#00d2ff]">
                  {result.fitScorePercent}%
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {result.matchedSkills.length} of {result.extractedSkills.length} skills matched
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-200 mt-4 leading-relaxed">{result.summary}</p>

          {/* Skill Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
            {/* Matched skills */}
            <div className="p-4 rounded-xl bg-[#081d18] border border-[#0d6d53]/60">
              <span className="text-xs font-bold text-[#34d399] flex items-center gap-1.5 mb-2.5">
                <span>✓</span> Verified Matching Skills ({result.matchedSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills.length ? (
                  result.matchedSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#064e3b] text-[#34d399] border border-[#0d6d53]"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">No direct matches identified</span>
                )}
              </div>
            </div>

            {/* Missing skill gaps */}
            <div className="p-4 rounded-xl bg-[#1f131a] border border-[#6d1b32]/60">
              <span className="text-xs font-bold text-[#fb7185] flex items-center gap-1.5 mb-2.5">
                <span>✕</span> Skill Gaps to Close ({result.missingSkills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.length ? (
                  result.missingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#4c0519] text-[#fb7185] border border-[#881337]"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">All required skills fulfilled!</span>
                )}
              </div>
            </div>
          </div>

          {/* Prep button */}
          {result.needsPrep && !generatedPlan && (
            <div className="mt-6 pt-4 border-t border-[#17253d] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="text-xs font-bold text-white">Under-qualified for this role?</h5>
                <p className="text-[11px] text-slate-400">
                  UrFuture AI can generate a tailored multi-week study sprint targeting your exact missing skills.
                </p>
              </div>

              <button
                onClick={requestPrepPlan}
                disabled={planBusy}
                className="rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-[#080d1a] px-5 py-2.5 text-xs font-bold shadow-md shadow-[#10b981]/20 transition-all flex items-center gap-2 shrink-0"
              >
                {planBusy ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
                    Synthesizing prep plan…
                  </>
                ) : (
                  'Generate Prep Study Plan'
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Generated Study Plan Display */}
      {generatedPlan && (
        <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426] animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#1b2947] pb-3 mb-4">
            <div>
              <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider block">
                Personalized Preparation Roadmap
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">{generatedPlan.title}</h4>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#0c4a6e] text-[#38bdf8] border border-[#0284c7]">
              {generatedPlan.weeks.length} Weeks
            </span>
          </div>

          <div className="space-y-4">
            {generatedPlan.weeks.map((w) => (
              <div key={w.weekNumber} className="p-4 rounded-xl bg-[#091120] border border-[#17253d]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#00d2ff]">
                    Week {w.weekNumber}: {w.focusSkill}
                  </span>
                </div>
                <div className="space-y-1 mt-2">
                  {w.tasks.map((t, tidx) => (
                    <div key={tidx} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-[#34d399] mt-0.5">•</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
                {w.resources && w.resources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#142034] flex flex-wrap gap-2">
                    {w.resources.map((r, ridx) => (
                      <span
                        key={ridx}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#0e192f] border border-[#1a2d52] text-slate-400"
                      >
                        📖 {r.title} ({r.type})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
