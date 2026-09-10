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
    setPathwaySteps([
      { id: 's0', type: 'CURRENT_STATE', label: 'You are here', order: 0 },
      { id: 's1', type: 'MAJOR', label: `Declare ${rec.careerTitle}-aligned major`, order: 1 },
      { id: 's2', type: 'COURSE_MILESTONE', label: 'Complete Core Skill Milestones', order: 2 },
      { id: 's3', type: 'INTERNSHIP', label: 'Industry Internship / Practicum', order: 3 },
      { id: 's4', type: 'CAREER_ENTRY', label: `Junior ${rec.careerTitle}`, order: 4 },
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
    <div className="flex flex-col gap-6">
      {/* Top Action Card */}
      <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
              Grounded Career Pathway Recommendations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyzes your verified skill profile against O*NET / NEA Cambodia labor demand data.
            </p>
          </div>

          <button
            onClick={getRecommendations}
            disabled={busy}
            className="self-start sm:self-auto rounded-xl bg-[#00d2ff] hover:bg-[#00bfe6] disabled:opacity-40 text-[#080d1a] px-5 py-2.5 text-xs font-bold shadow-md shadow-[#00d2ff]/20 transition-all flex items-center gap-2 shrink-0"
          >
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
                Analyzing labor data…
              </>
            ) : (
              'Run Career Gap Analysis'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        {/* Career match cards grid */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
            {recommendations.map((r) => {
              const isSelected = selected?.careerTitle === r.careerTitle;
              return (
                <div
                  key={r.careerTitle}
                  onClick={() => selectCareer(r)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0f213d] border-[#00d2ff] shadow-md shadow-[#00d2ff]/15'
                      : 'bg-[#091120] border-[#172640] hover:border-[#263b63] hover:bg-[#0d182d]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-[#00d2ff]">
                      {Math.round(r.fitScore)}%
                    </span>
                    {r.requiresCounselorReview && (
                      <span className="text-[10px] font-semibold text-[#f59e0b] px-2 py-0.5 rounded bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                        Counselor Review
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{r.careerTitle}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{r.rationale}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Career Analysis Detail */}
      {selected && (
        <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426]">
          <div className="flex items-center justify-between border-b border-[#1b2947] pb-3 mb-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="text-[#00d2ff]">Deep-Dive Analysis:</span> {selected.careerTitle}
            </h4>
            <span className="text-xs font-bold text-[#34d399] px-2.5 py-0.5 rounded-full bg-[#064e3b] border border-[#0d6d53]/50">
              {Math.round(selected.fitScore)}% Skill Fit
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed">{selected.rationale}</p>

          {selected.reviewReason && (
            <div className="mt-4 p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs flex items-start gap-2.5">
              <span className="text-base leading-none mt-0.5">⚠️</span>
              <div>
                <span className="font-bold block">Counselor Advisory Notice:</span>
                <span className="text-slate-300 text-[11px]">{selected.reviewReason}</span>
              </div>
            </div>
          )}

          {/* Citations list */}
          {selected.citations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#17253d]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                GROUNDED DATA SOURCES &amp; CITATIONS
              </span>
              <ul className="space-y-1.5">
                {selected.citations.map((c, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-[#00d2ff] font-mono text-[11px]">[{i + 1}]</span>
                    <span>
                      <strong className="text-slate-300">{c.source}</strong>: {c.claim}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Visualizations Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <SkillRadarChart data={radarData} careerLabel={selected?.careerTitle} />
        <PathwayGraph steps={pathwaySteps} title={selected ? `Pathway to ${selected.careerTitle}` : undefined} />
      </div>
    </div>
  );
}
