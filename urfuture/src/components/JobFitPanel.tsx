'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SkillGapItem {
  skillName: string;
  userProficiency: number;
  requiredImportance: number;
  gap: number;
}

interface JobMatchResult {
  jobTitle: string;
  fitScore: number;
  matchedSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  explanation: string;
  citations: {
    source: string;
    reference: string;
    claim: string;
  }[];
  requiresCounselorReview: boolean;
  reviewReason?: string;
}

interface StudyPlanItem {
  id: string;
  title: string;
  description: string;
  priority: string;
  estimatedDuration: string;
}

// Predefined job titles for Cambodian tech market
const JOB_TITLES = [
  'Select a job title...',
  'Junior Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'Mobile App Developer (iOS/Android)',
  'Data Engineer',
  'Data Analyst',
  'Business Analyst',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'QA / Test Engineer',
  'UI/UX Designer',
  'Product Manager',
  'Database Administrator',
  'Network Engineer',
  'IT Support Specialist',
  'Systems Administrator',
  'Technical Project Manager',
  'Scrum Master',
  'Solutions Architect',
  'Game Developer',
  'Embedded Systems Engineer',
  'Blockchain Developer',
  'Other / Custom Role',
];

export default function JobFitPanel({ userId }: { userId: string }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [planBusy, setPlanBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  /*
   * -------------------------------------------------------
   * API CODE — KEEP FOR BACKEND INTEGRATION
   * -------------------------------------------------------
   * This still calls the existing /api/job/match endpoint.
   */
  async function checkFit() {
    const effectiveTitle = showCustomInput ? customTitle : jobTitle;

    if (!effectiveTitle.trim() || effectiveTitle === 'Select a job title...') {
      setError('Please select or enter a job title.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    if (jobDescription.trim().length < 20) {
      setError('Please enter a more detailed job description.');
      return;
    }

    setBusy(true);
    setError(null);
    setResult(null);
    setStudyPlan([]);

    try {
      const res = await fetch('/api/job/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          jobTitle: effectiveTitle,
          jobDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not analyze job fit');
      }

      setResult(data.result);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not analyze job fit'
      );
    } finally {
      setBusy(false);
    }
  }

  /*
   * -------------------------------------------------------
   * API CODE — KEEP FOR BACKEND INTEGRATION
   * -------------------------------------------------------
   * This still calls the existing
   * /api/study-plan/generate endpoint.
   */
  async function requestPrepPlan() {
    if (!result) return;

    setPlanBusy(true);
    setError(null);

    try {
      const res = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          jobTitle: result.jobTitle,
          targetSkillNames: result.missingSkills.map((skill) => skill.skillName),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Could not generate study plan');
      }

      setStudyPlan(data.plan || data.studyPlan || []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not generate study plan'
      );
    } finally {
      setPlanBusy(false);
    }
  }

  function applySample(
    title: string,
    description: string
  ) {
    setJobTitle(title);
    setJobDescription(description);
    setShowCustomInput(false);
    setCustomTitle('');
    setResult(null);
    setStudyPlan([]);
    setError(null);
  }

  function getFitLabel(score: number) {
    if (score >= 90) return 'Excellent match';
    if (score >= 80) return 'Strong match';
    if (score >= 70) return 'Good match';
    if (score >= 60) return 'Moderate match';
    return 'Developing match';
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ================================================= */}
      {/* JOB DESCRIPTION INPUT */}
      {/* ================================================= */}

      <section className="bg-[#071827] border border-[#1b2d45] rounded-xl p-6 shadow-[0_0_0_1px_rgba(27,45,69,0.4)]">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />

              <h2 className="text-lg font-semibold text-slate-50">
                Job Description Fit-Check & Gap Assessment
              </h2>
            </div>

            <p className="text-xs text-slate-300 mt-2">
              Compare a job posting against your verified knowledge map
              and identify your strongest and missing skills.
            </p>
          </div>

          <span className="self-start px-3 py-1.5 rounded-full bg-[#0d2238] border border-[#1f3d5c] text-[10px] font-bold text-[#00d2ff]">
            Semantic Matcher
          </span>

        </div>

        {/* Sample jobs */}

        <div className="flex flex-wrap items-center gap-2 mt-5">

          <span className="text-[11px] text-slate-300">
            Try a sample:
          </span>

          <button
            type="button"
            onClick={() =>
              applySample(
                'Junior Software Engineer',
                'We are looking for a Junior Software Engineer named NUT SANNARA with knowledge of programming fundamentals, data structures, algorithms, SQL, database design, Git, automated testing, cloud deployment, and software development best practices.'
              )
            }
            className="px-3 py-1.5 rounded-lg border border-slate-600 bg-[#0f2137] text-xs text-slate-100 hover:border-cyan-500 hover:text-cyan-300 transition"
          >
            Junior Software Engineer
          </button>

          <button
            type="button"
            onClick={() =>
              applySample(
                'Data & Business Analyst',
                'Seeking a Data and Business Analyst with skills in SQL, database systems, data analysis, dashboards, business intelligence, communication, reporting, Excel, and analytical problem solving.'
              )
            }
            className="px-3 py-1.5 rounded-lg border border-slate-600 bg-[#0f2137] text-xs text-slate-100 hover:border-cyan-500 hover:text-cyan-300 transition"
          >
            Data & Business Analyst
          </button>

        </div>

        {/* Job title dropdown */}

        <div className="mt-4">

          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
            Job Title
          </label>

          <div className="relative mt-2">
            <select
              value={showCustomInput ? 'Other / Custom Role' : jobTitle}
              onChange={(e) => {
                if (e.target.value === 'Other / Custom Role') {
                  setShowCustomInput(true);
                  setJobTitle('');
                } else {
                  setShowCustomInput(false);
                  setJobTitle(e.target.value);
                  setCustomTitle('');
                }
                setResult(null);
                setStudyPlan([]);
                setError(null);
              }}
              className="w-full appearance-none bg-[#081a2d] border border-[#314d69] rounded-xl px-4 py-3 pr-10 text-sm text-slate-100 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-900/40 transition cursor-pointer"
            >
              {JOB_TITLES.map((title) => (
                <option
                  key={title}
                  value={title}
                  className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  disabled={title === 'Select a job title...'}
                >
                  {title}
                </option>
              ))}
            </select>

            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Custom job title input (shown when "Other" is selected) */}
          {showCustomInput && (
            <div className="mt-3">
              <label className="text-[10px] uppercase tracking-wider font-bold text-[#00d2ff]">
                Enter Your Custom Job Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => {
                  setCustomTitle(e.target.value);
                  setResult(null);
                  setStudyPlan([]);
                  setError(null);
                }}
                placeholder="e.g. Junior Robotics Engineer, Fintech Analyst"
                className="mt-2 w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:focus:ring-cyan-900/40 transition"
              />
            </div>
          )}

        </div>

        {/* Job description */}

        <div className="mt-4">

          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-300">
            Job Description / Requirements
          </label>

          <textarea
            value={jobDescription}
            onChange={(e) => {
              setJobDescription(e.target.value);
              setResult(null);
              setStudyPlan([]);
              setError(null);
            }}
            placeholder="Paste the job description or role requirements here..."
            rows={6}
            className="mt-2 w-full resize-none bg-[#081a2d] border border-[#314d69] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-900/40 transition"
          />

        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">

          <span className="text-[10px] text-slate-400">
            {jobDescription.length} characters (min 20)
          </span>

          <button
            type="button"
            onClick={checkFit}
            disabled={
              busy ||
              (!showCustomInput && (!jobTitle || jobTitle === 'Select a job title...')) ||
              (showCustomInput && !customTitle.trim()) ||
              jobDescription.trim().length < 20
            }
            className="rounded-xl bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 text-xs font-semibold shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-2"
          >

            {busy && (
              <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
            )}

            {busy ? 'Analyzing Job Fit...' : 'Analyze Fit Score'}

          </button>

        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs">
            ⚠ {error}
          </div>
        )}

      </section>

      {/* ================================================= */}
      {/* RESULT */}
      {/* ================================================= */}

      {result && (
        <>

          {/* Score */}

          <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Job Fit Analysis
                </p>

                <h2 className="text-xl font-bold text-white mt-2">
                  {result.jobTitle}
                </h2>

                <p className="text-sm text-[#34d399] font-semibold mt-1">
                  {getFitLabel(result.fitScore)}
                </p>

              </div>

              <div className="md:text-right">

                <div className="text-4xl font-extrabold text-[#34d399]">
                  {Math.round(result.fitScore)}%
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  Job Fit Score
                </div>

              </div>

            </div>

            {/* Progress */}

            <div className="mt-5">

              <div className="flex justify-between text-xs mb-2">

                <span className="text-slate-500">
                  Profile compatibility
                </span>

                <span className="text-slate-300 font-bold">
                  {Math.round(result.fitScore)}%
                </span>

              </div>

              <div className="h-2 bg-[#17253d] rounded-full overflow-hidden">

                <div
                  className="h-full bg-gradient-to-r from-[#00d2ff] to-[#34d399] rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(result.fitScore, 0),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* MATCHED / MISSING */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Matching skills */}

            <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-6">

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-bold text-white">
                  Matching Skills
                </h3>

                <span className="text-[10px] px-2 py-1 rounded-full bg-[#10b981]/10 text-[#34d399]">
                  {result.matchedSkills.length} matched
                </span>

              </div>

              <div className="space-y-3 mt-5">

                {result.matchedSkills.map((skill) => (

                  <div
                    key={skill.skillName}
                    className="bg-[#09111f] border border-[#1b2947] rounded-lg p-3"
                  >

                    <div className="flex justify-between gap-3">

                      <div className="flex gap-2">

                        <span className="text-[#34d399]">
                          ✓
                        </span>

                        <span className="text-xs text-slate-200">
                          {skill.skillName}
                        </span>

                      </div>

                      <span className="text-xs font-bold text-[#34d399]">
                        {Math.round(skill.userProficiency)}%
                      </span>

                    </div>

                    <div className="h-1.5 bg-[#17253d] rounded-full overflow-hidden mt-3">

                      <div
                        className="h-full bg-[#34d399] rounded-full"
                        style={{
                          width: `${Math.min(
                            skill.userProficiency,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* Missing skills */}

            <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-6">

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-bold text-white">
                  Skills to Strengthen
                </h3>

                <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-400">
                  {result.missingSkills.length} gaps
                </span>

              </div>

              <div className="space-y-3 mt-5">

                {result.missingSkills.map((skill, index) => (

                  <div
                    key={skill.skillName}
                    className="bg-[#09111f] border border-[#1b2947] rounded-lg p-3"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex gap-2">

                        <span className="text-amber-400 text-xs">
                          {index + 1}.
                        </span>

                        <div>

                          <p className="text-xs text-slate-200">
                            {skill.skillName}
                          </p>

                          <p className="text-[10px] text-slate-500 mt-1">
                            Current {Math.round(skill.userProficiency)}%
                            {' • '}
                            Required {Math.round(skill.requiredImportance)}%
                          </p>

                        </div>

                      </div>

                      <span className="text-[10px] font-bold text-amber-400">
                        Gap {Math.round(skill.gap)}%
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            </section>

          </div>

          {/* ================================================= */}
          {/* EXPLANATION */}
          {/* ================================================= */}

          <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-6">

            <h3 className="text-sm font-bold text-white">
              Why this job fits you
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed mt-3">
              {result.explanation}
            </p>

            {result.requiresCounselorReview && (
              <div className="mt-4 bg-amber-950/30 border border-amber-800/60 rounded-lg p-3">

                <p className="text-xs font-bold text-amber-300">
                  Counselor Review Recommended
                </p>

                {result.reviewReason && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {result.reviewReason}
                  </p>
                )}

              </div>
            )}

          </section>

          {/* ================================================= */}
          {/* CITATIONS */}
          {/* ================================================= */}

          {result.citations?.length > 0 && (

            <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-6">

              <h3 className="text-sm font-bold text-white">
                Grounded Data Sources
              </h3>

              <div className="space-y-3 mt-4">

                {result.citations.map((citation, index) => (

                  <div
                    key={index}
                    className="flex items-start gap-3 text-xs"
                  >

                    <span className="text-[#00d2ff] font-mono">
                      [{index + 1}]
                    </span>

                    <div>

                      <p className="text-slate-300">
                        <strong>{citation.source}</strong>
                      </p>

                      <p className="text-slate-500 mt-1">
                        {citation.claim}
                      </p>

                      {citation.reference && (
                        <p className="text-[10px] text-slate-600 mt-1">
                          {citation.reference}
                        </p>
                      )}

                    </div>

                  </div>

                ))}

              </div>

            </section>

          )}

          {/* ================================================= */}
          {/* STUDY PLAN */}
          {/* ================================================= */}

          <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <h3 className="text-sm font-bold text-white">
                  Job Preparation Plan
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Generate a focused learning plan based on the
                  skills you're currently missing.
                </p>

              </div>

              <button
                type="button"
                onClick={requestPrepPlan}
                disabled={planBusy || result.missingSkills.length === 0}
                className="rounded-xl border border-[#00d2ff] text-[#00d2ff] hover:bg-[#00d2ff]/10 disabled:opacity-40 px-5 py-2.5 text-xs font-bold transition flex items-center justify-center gap-2"
              >

                {planBusy && (
                  <span className="w-3.5 h-3.5 border-2 border-[#00d2ff] border-t-transparent rounded-full animate-spin" />
                )}

                {planBusy
                  ? 'Generating Plan...'
                  : 'Generate Prep Study Plan'}

              </button>

            </div>

            {/* Generated study plan */}

            {studyPlan.length > 0 && (

              <div className="space-y-3 mt-5">

                {studyPlan.map((item, index) => (

                  <div
                    key={item.id || index}
                    className="bg-[#09111f] border border-[#1b2947] rounded-xl p-4"
                  >

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                      <div className="flex gap-3">

                        <div className="w-7 h-7 rounded-lg bg-[#00d2ff]/10 text-[#00d2ff] flex items-center justify-center text-xs font-bold shrink-0">
                          {index + 1}
                        </div>

                        <div>

                          <h4 className="text-sm font-semibold text-white">
                            {item.title}
                          </h4>

                          <p className="text-xs text-slate-400 mt-1">
                            {item.description}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-2">

                        {item.priority && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-[#00d2ff]/10 text-[#00d2ff]">
                            {item.priority}
                          </span>
                        )}

                        {item.estimatedDuration && (
                          <span className="text-[10px] text-slate-500">
                            {item.estimatedDuration}
                          </span>
                        )}

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

        </>
      )}

    </div>
  );
}