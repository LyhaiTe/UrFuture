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

export default function JobFitPanel({ userId }: { userId: string }) {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobFitResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planStatus, setPlanStatus] = useState<string | null>(null);

  async function checkFit() {
    setBusy(true);
    setError(null);
    setResult(null);
    setPlanStatus(null);
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
    setPlanStatus('Generating prep plan…');
    try {
      const res = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, targetSkillNames: result.missingSkills, weeksRequested: 6 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate plan');
      setPlanStatus(`Prep plan "${data.studyPlan.title}" created — see it in your Study Plans list.`);
    } catch (e) {
      setPlanStatus(e instanceof Error ? e.message : 'Could not generate plan');
    }
  }

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-medium text-angkor-maroon">Job description fit-check</h3>
      <div className="flex flex-col gap-2">
        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Job title (e.g. Junior Software Engineer)"
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm"
        />
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here…"
          rows={5}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm"
        />
        <button
          onClick={checkFit}
          disabled={!jobTitle || jobDescription.length < 20 || busy}
          className="self-start rounded-md bg-angkor-maroon px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? 'Assessing…' : 'Check my fit'}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {result && (
        <div className="mt-4 rounded-md bg-brand-50 p-4">
          <p className="text-xl font-semibold text-brand-700">
            {result.matchedSkills.length}/{result.extractedSkills.length} skills — {result.fitScorePercent}% fit
          </p>
          <p className="mt-1 text-sm text-black/70">{result.summary}</p>
          {result.missingSkills.length > 0 && (
            <p className="mt-2 text-xs text-black/60">
              Missing: {result.missingSkills.join(', ')}
            </p>
          )}
          {result.needsPrep && (
            <button
              onClick={requestPrepPlan}
              className="mt-3 rounded-md bg-angkor-gold px-3 py-1.5 text-xs font-medium text-angkor-maroon"
            >
              Help me prepare for this job
            </button>
          )}
          {planStatus && <p className="mt-2 text-xs text-black/60">{planStatus}</p>}
        </div>
      )}
    </div>
  );
}
