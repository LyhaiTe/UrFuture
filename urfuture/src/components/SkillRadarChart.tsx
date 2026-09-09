'use client';

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
      <div className="flex h-64 items-center justify-center text-sm text-black/50 card">
        No skill data yet — upload a transcript or complete the diagnostic quiz.
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="mb-2 text-sm font-medium text-angkor-maroon">
        Skill radar{careerLabel ? ` vs. ${careerLabel}` : ''}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="#00000022" />
          <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#241c14' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
          <Radar
            name="Your proficiency"
            dataKey="proficiency"
            stroke="#7a1f2b"
            fill="#7a1f2b"
            fillOpacity={0.35}
          />
          {data.some((d) => d.required !== undefined) && (
            <Radar
              name="Career requirement"
              dataKey="required"
              stroke="#c9a24b"
              fill="#c9a24b"
              fillOpacity={0.15}
              strokeDasharray="4 3"
            />
          )}
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
