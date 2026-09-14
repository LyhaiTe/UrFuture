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

  return (
    <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 sm:p-6">
      {/* ============================================================= */}
      {/* HEADER */}
      {/* ============================================================= */}

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

      {/* ============================================================= */}
      {/* SUMMARY */}
      {/* ============================================================= */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Skills Mapped
          </p>

          <p className="text-2xl font-extrabold text-white mt-2">
            {skills.length}
          </p>

          <p className="text-[10px] text-slate-500 mt-1">
            Verified competencies
          </p>
        </div>

        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Completed
          </p>

          <p className="text-2xl font-extrabold text-[#34d399] mt-2">
            {completedSkills}
          </p>

          <p className="text-[10px] text-slate-500 mt-1">
            Strong competencies
          </p>
        </div>

        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            In Progress
          </p>

          <p className="text-2xl font-extrabold text-[#00d2ff] mt-2">
            {inProgressSkills}
          </p>

          <p className="text-[10px] text-slate-500 mt-1">
            Currently developing
          </p>
        </div>

        <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Overall Progress
          </p>

          <p className="text-2xl font-extrabold text-[#00d2ff] mt-2">
            {averageProgress}%
          </p>

          <div className="mt-2 h-1.5 bg-[#17253d] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00d2ff] to-[#34d399] rounded-full"
              style={{ width: `${averageProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SKILLS */}
      {/* ============================================================= */}

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
                    : 'border-[#1b2947] hover:border-[#00d2ff]/40'
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

      {/* ============================================================= */}
      {/* NEXT LEARNING PRIORITY */}
      {/* ============================================================= */}

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
    </section>
  );
}