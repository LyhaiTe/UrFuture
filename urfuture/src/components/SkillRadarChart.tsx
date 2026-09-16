'use client';

import { Target } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export interface SkillRadarDatum {
  skill: string;
  proficiency: number; // 0-100, the student
  required?: number; // 0-100, target career's requirement — optional overlay
}

export default function SkillRadarChart({
  data,
  careerLabel,
}: {
  data: SkillRadarDatum[];
  careerLabel?: string;
}) {
  if (!data.length) {
    return (
      <div className="card-dark p-6 flex flex-col items-center justify-center h-72 text-center border-[#1b2947] bg-[#0c1426]">
        <div className="w-10 h-10 rounded-xl bg-[#0d1e38] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff] mb-2">
          <Target className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-white">Skill Radar Calibration</h4>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
          Take the diagnostic quiz or upload coursework to visualize your competency profile.
        </p>
      </div>
    );
  }

  return (
    <div className="card-dark p-5 border-[#1b2947] bg-[#0c1426]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
          Competency Radar {careerLabel ? <span className="text-[#00d2ff]">vs. {careerLabel}</span> : ''}
        </h3>
        <span className="text-[10px] font-mono text-slate-400">0 - 100 Scale</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} outerRadius="70%">
          <PolarGrid stroke="#1b2e52" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} stroke="#1b2e52" />
          <Radar
            name="Your proficiency"
            dataKey="proficiency"
            stroke="#00d2ff"
            fill="#00d2ff"
            fillOpacity={0.35}
          />
          {data.some((d) => d.required !== undefined) && (
            <Radar
              name="Career benchmark"
              dataKey="required"
              stroke="#34d399"
              fill="#34d399"
              fillOpacity={0.2}
              strokeDasharray="4 3"
            />
          )}
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a1120',
              borderColor: '#1b2b4d',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#f1f5f9',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
