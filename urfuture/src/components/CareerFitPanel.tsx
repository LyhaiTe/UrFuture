'use client';

import { useState } from 'react';
import SkillRadarChart, { SkillRadarDatum } from './SkillRadarChart';
import PathwayGraph, { PathwayStepInput } from './PathwayGraph';

interface SkillGapItem {
  skillName: string;
  userProficiency: number;
  requiredImportance: number;
  gap: number;
}

interface Recommendation {
  careerTitle: string;
  fitScore: number;
  matchedSkills: SkillGapItem[];
  missingSkills: SkillGapItem[];
  rationale: string;
  citations: { source: string; reference: string; claim: string }[];
  requiresCounselorReview: boolean;
  reviewReason?: string;
}

export default function CareerFitPanel({ userId }: { userId: string }) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selected, setSelected] = useState<Recommendation | null>(null);
  const [pathwaySteps, setPathwaySteps] = useState<PathwayStepInput[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getRecommendations() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/career/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not get recommendations');
      setRecommendations(data.recommendations);
      if (data.recommendations[0]) selectCareer(data.recommendations[0]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not get recommendations');
    } finally {
      setBusy(false);
    }
  }

  function selectCareer(rec: Recommendation) {
    setSelected(rec);
    // Demo-level static pathway steps for the top match; in a full build
    // these come from PathwayStep rows keyed to the matched CareerPath.id.
    setPathwaySteps([
      { id: 's0', type: 'CURRENT_STATE', label: 'You are here', order: 0 },
      { id: 's1', type: 'MAJOR', label: `Pursue ${rec.careerTitle}-aligned major`, order: 1 },
      { id: 's2', type: 'COURSE_MILESTONE', label: 'Close top skill gap', order: 2 },
      { id: 's3', type: 'INTERNSHIP', label: 'Internship / practicum', order: 3 },
      { id: 's4', type: 'CAREER_ENTRY', label: rec.careerTitle, order: 4 },
    ]);
  }

  const radarData: SkillRadarDatum[] = selected
    ? [...selected.matchedSkills, ...selected.missingSkills].map((s) => ({
        skill: s.skillName,
        proficiency: s.userProficiency,
        required: s.requiredImportance,
      }))
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-angkor-maroon">Career fit recommendations</h3>
          <button
            onClick={getRecommendations}
            disabled={busy}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {busy ? 'Analyzing…' : 'Get recommendations'}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        {recommendations.length > 0 && (
          <ul className="mt-3 divide-y divide-black/10">
            {recommendations.map((r) => (
              <li key={r.careerTitle} className="flex items-center justify-between py-2">
                <button
                  onClick={() => selectCareer(r)}
                  className={
                    'text-left text-sm ' + (selected?.careerTitle === r.careerTitle ? 'font-semibold text-angkor-maroon' : '')
                  }
                >
                  {r.careerTitle}
                  {r.requiresCounselorReview && (
                    <span className="ml-2 rounded bg-angkor-gold/30 px-1.5 py-0.5 text-[10px] text-angkor-maroon">
                      needs counselor sign-off
                    </span>
                  )}
                </button>
                <span className="text-sm text-black/60">{Math.round(r.fitScore)}% fit</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && (
        <div className="card p-4">
          <p className="text-sm">{selected.rationale}</p>
          {selected.reviewReason && (
            <p className="mt-2 text-xs text-angkor-maroon">⚠ {selected.reviewReason}</p>
          )}
          {selected.citations.length > 0 && (
            <ul className="mt-2 list-disc pl-4 text-[11px] text-black/50">
              {selected.citations.map((c, i) => (
                <li key={i}>
                  {c.source} — {c.claim}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <SkillRadarChart data={radarData} careerLabel={selected?.careerTitle} />
        <PathwayGraph steps={pathwaySteps} title={selected ? `Path to ${selected.careerTitle}` : undefined} />
      </div>
    </div>
  );
}
