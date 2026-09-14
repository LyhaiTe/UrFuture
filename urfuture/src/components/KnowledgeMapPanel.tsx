'use client';

import React, { useState } from 'react';

interface KnowledgeMapPanelProps {
  userId: string;
}

type SkillStatus = 'Completed' | 'In Progress' | 'Incomplete';

interface Skill {
  id: string;
  name: string;
  category: string;
  progress: number;
  status: SkillStatus;
  description: string;
}

const skills: Skill[] = [
  {
    id: 'programming',
    name: 'Programming Fundamentals',
    category: 'Software Engineering',
    progress: 100,
    status: 'Completed',
    description: 'Core programming concepts, logic, variables, functions, and control flow.',
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming',
    category: 'Software Engineering',
    progress: 90,
    status: 'Completed',
    description: 'Classes, objects, inheritance, encapsulation, and polymorphism.',
  },
  {
    id: 'database',
    name: 'Database Systems',
    category: 'Data',
    progress: 82,
    status: 'Completed',
    description: 'Relational databases, SQL, schema design, and data management.',
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Software Engineering',
    progress: 68,
    status: 'In Progress',
    description: 'Arrays, linked structures, trees, graphs, searching, and sorting.',
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    category: 'Infrastructure',
    progress: 55,
    status: 'In Progress',
    description: 'Cloud infrastructure, deployment, networking, and scalable services.',
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    category: 'AI & Data',
    progress: 30,
    status: 'Incomplete',
    description: 'Data preparation, model training, evaluation, and predictive systems.',
  },
];

const relationships = [
  {
    from: 'Programming Fundamentals',
    to: 'Object-Oriented Programming',
    label: 'Foundation',
  },
  {
    from: 'Object-Oriented Programming',
    to: 'Data Structures & Algorithms',
    label: 'Builds into',
  },
  {
    from: 'Database Systems',
    to: 'Machine Learning',
    label: 'Data foundation',
  },
  {
    from: 'Data Structures & Algorithms',
    to: 'Machine Learning',
    label: 'Supports',
  },
  {
    from: 'Programming Fundamentals',
    to: 'Cloud Computing',
    label: 'Supports',
  },
];

export default function KnowledgeMapPanel({
  userId,
}: KnowledgeMapPanelProps) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedTerm, setSelectedTerm] = useState('Year1');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const completedSkills = skills.filter(
    (skill) => skill.status === 'Completed'
  ).length;

  const inProgressSkills = skills.filter(
    (skill) => skill.status === 'In Progress'
  ).length;

  const averageProgress = Math.round(
    skills.reduce((total, skill) => total + skill.progress, 0) /
      skills.length
  );

  const getStatusClasses = (status: SkillStatus) => {
    if (status === 'Completed') {
      return 'bg-[#10b981]/10 text-[#34d399] border-[#10b981]/20';
    }

    if (status === 'In Progress') {
      return 'bg-[#00d2ff]/10 text-[#00d2ff] border-[#00d2ff]/20';
    }

    return 'bg-slate-700/30 text-slate-400 border-slate-600/20';
  };

  const getCardBorderColor = (status: SkillStatus) => {
    if (status === 'Completed') return 'border-[#10b981]/30 hover:border-[#10b981]/60';
    if (status === 'In Progress') return 'border-[#00d2ff]/30 hover:border-[#00d2ff]/60';
    return 'border-slate-600/30 hover:border-slate-500/60';
  };

  const getCardGlow = (status: SkillStatus) => {
    if (status === 'Completed') return 'hover:shadow-[#10b981]/10';
    if (status === 'In Progress') return 'hover:shadow-[#00d2ff]/10';
    return 'hover:shadow-slate-500/10';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  return (
    <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />

            <h2 className="text-lg font-bold text-white">
              Knowledge Map
            </h2>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Track your verified skills, knowledge areas, relationships,
            and learning progress.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30">
          <span className="text-xs font-bold text-[#00d2ff]">
            {averageProgress}% overall coverage
          </span>
        </div>
      </div>
      <div className="mt-6 bg-[#0a1628] border border-[#1b2947] rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
              <h3 className="text-base font-bold text-white">
                Upload Coursework Transcripts
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Upload transcripts from Year 1–4 to generate tailored diagnostic quizzes and verify your skills.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[10px] font-bold text-[#34d399] shrink-0">
            AI Auto-Extraction
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Academic Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-[#09111f] border border-[#1b2947] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00d2ff]/50 transition-colors"
            >
              <option value="Year1">Year 1</option>
              <option value="Year2">Year 2</option>
              <option value="Year3">Year 3</option>
              <option value="Year4">Year 4</option>
            </select>
          </div>

          <div className="flex-1 flex items-center gap-2">
            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold shrink-0">
              Transcript File (.PDF, .CSV, .TXT)
            </label>
            <div className="flex-1 flex items-center bg-[#09111f] border border-dashed border-[#1b2947] rounded-lg px-3 py-2">
              <span className="text-xs text-slate-500 flex-1 truncate">
                {selectedFile || 'Select or drop transcript file...'}
              </span>
              <label className="cursor-pointer text-xs font-semibold text-[#00d2ff] hover:text-[#00bfe6] transition-colors shrink-0 ml-2">
                Browse
                <input
                  type="file"
                  accept=".pdf,.csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button className="shrink-0 bg-[#00d2ff] hover:bg-[#00bfe6] text-[#070d1a] font-bold text-xs px-5 py-2.5 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]">
            Upload &amp; Parse
          </button>
        </div>
      </div>

      <div className="mt-4 bg-[#0a1628] border border-[#1b2947] rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <h3 className="text-base font-bold text-white">
                Diagnostic Knowledge Quiz
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Test your grasp across all uploaded course subjects to benchmark your career readiness.
            </p>
          </div>
          <button className="shrink-0 bg-[#00d2ff] hover:bg-[#00bfe6] text-[#070d1a] font-bold text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-[#00d2ff]/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate Quiz From Transcripts
          </button>
        </div>

        {/* Empty state */}
        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[#00d2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h4 className="text-sm font-bold text-white mb-2">No active quiz attempt</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Upload your course transcripts above, then click "Generate Quiz" to test your actual competency levels.
          </p>
        </div>
      </div>
      <div className="mt-6 bg-gradient-to-r from-[#00d2ff]/5 to-[#34d399]/5 border border-[#00d2ff]/20 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#00d2ff]">
              Recommended Next Step
            </p>

            <h3 className="text-sm font-bold text-white mt-1">
              Strengthen Data Structures & Algorithms
            </h3>

            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Improving this competency will strengthen your foundation
              for Machine Learning and advanced software engineering.
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-xs font-bold text-[#00d2ff]">
              68% complete
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Skills Mapped Card */}
        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-5 hover:border-[#00d2ff]/30 transition-all hover:shadow-lg hover:shadow-[#00d2ff]/5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-[#00d2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
          </div>
          <p className="text-3xl font-extrabold text-white">{skills.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Verified competencies</p>
        </div>

        {/* Completed Card */}
        <div className="bg-[#09111f] border border-[#10b981]/20 rounded-xl p-5 hover:border-[#10b981]/40 transition-all hover:shadow-lg hover:shadow-[#10b981]/5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-[#34d399]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-[#34d399] uppercase tracking-wider">Strong</span>
          </div>
          <p className="text-3xl font-extrabold text-[#34d399]">{completedSkills}</p>
          <p className="text-[11px] text-slate-400 mt-1">Strong competencies</p>
        </div>

        {/* In Progress Card */}
        <div className="bg-[#09111f] border border-[#00d2ff]/20 rounded-xl p-5 hover:border-[#00d2ff]/40 transition-all hover:shadow-lg hover:shadow-[#00d2ff]/5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-[#00d2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-[#00d2ff] uppercase tracking-wider">Active</span>
          </div>
          <p className="text-3xl font-extrabold text-[#00d2ff]">{inProgressSkills}</p>
          <p className="text-[11px] text-slate-400 mt-1">Currently developing</p>
        </div>

        {/* Overall Progress Card */}
        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-5 hover:border-[#00d2ff]/30 transition-all hover:shadow-lg hover:shadow-[#00d2ff]/5 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5 text-[#00d2ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Progress</span>
          </div>
          <p className="text-3xl font-extrabold text-[#00d2ff]">{averageProgress}%</p>
          <div className="mt-2 h-1.5 bg-[#17253d] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00d2ff] to-[#34d399] rounded-full"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Skills & Knowledge Areas
            </h3>

            <p className="text-[11px] text-slate-500 mt-1">
              Select a skill to view more information.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill) => {
            const isSelected = selectedSkill?.id === skill.id;

            return (
              <button
                type="button"
                key={skill.id}
                onClick={() =>
                  setSelectedSkill(isSelected ? null : skill)
                }
                className={`text-left bg-[#09111f] border rounded-xl p-4 transition-all ${
                  isSelected
                    ? 'border-[#00d2ff] shadow-[0_0_20px_rgba(0,210,255,0.08)]'
                    : `border-[#1b2947] hover:border-[#00d2ff]/40 ${getCardBorderColor(skill.status)} ${getCardGlow(skill.status)}`
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {skill.name}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1">
                      {skill.category}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getStatusClasses(
                      skill.status
                    )}`}
                  >
                    {skill.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500">
                      Competency
                    </span>

                    <span className="text-xs font-bold text-slate-300">
                      {skill.progress}%
                    </span>
                  </div>

                  <div className="h-1.5 bg-[#17253d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00d2ff] to-[#34d399] rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-[#1b2947]">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* SKILL RELATIONSHIPS */}
      {/* ============================================================= */}

      <div className="mt-8">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white">
            Skill Relationships
          </h3>

          <p className="text-[11px] text-slate-500 mt-1">
            See how your knowledge areas build on and support one another.
          </p>
        </div>

        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-5">
          {/* Legend */}

          <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-[#1b2947]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
              <span className="text-[10px] text-slate-400">
                Completed
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff]" />
              <span className="text-[10px] text-slate-400">
                In Progress
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-[10px] text-slate-400">
                Incomplete
              </span>
            </div>
          </div>

          {/* Relationship rows */}

          <div className="space-y-3">
            {relationships.map((relationship, index) => {
              const fromSkill = skills.find(
                (skill) => skill.name === relationship.from
              );

              const toSkill = skills.find(
                (skill) => skill.name === relationship.to
              );

              return (
                <div
                  key={`${relationship.from}-${relationship.to}-${index}`}
                  className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
                >
                  {/* FROM */}

                  <div className="bg-[#0d1526] border border-[#1b2947] rounded-lg p-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          fromSkill?.status === 'Completed'
                            ? 'bg-[#34d399]'
                            : fromSkill?.status === 'In Progress'
                            ? 'bg-[#00d2ff]'
                            : 'bg-slate-600'
                        }`}
                      />

                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {relationship.from}
                      </span>
                    </div>
                  </div>

                  {/* CONNECTION */}

                  <div className="flex flex-col items-center min-w-[75px]">
                    <span className="text-[9px] text-slate-500 mb-1 text-center">
                      {relationship.label}
                    </span>

                    <div className="flex items-center w-full">
                      <div className="h-px flex-1 bg-gradient-to-r from-[#00d2ff]/40 to-[#34d399]/60" />

                      <svg
                        className="w-3.5 h-3.5 text-[#34d399] shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 15.707a1 1 0 010-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* TO */}

                  <div className="bg-[#0d1526] border border-[#1b2947] rounded-lg p-3 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          toSkill?.status === 'Completed'
                            ? 'bg-[#34d399]'
                            : toSkill?.status === 'In Progress'
                            ? 'bg-[#00d2ff]'
                            : 'bg-slate-600'
                        }`}
                      />

                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {relationship.to}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}