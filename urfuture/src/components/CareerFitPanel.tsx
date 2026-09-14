'use client';

import { useState } from 'react';

interface Career {
  id: number;
  title: string;
  matchScore: number;
  fitLabel: string;
  missingSkill: string;
  rationale: string;
  matchedSkills: string[];
  skillsToStrengthen: string[];
  nextSteps: {
    title: string;
    priority: 'High priority' | 'Medium priority';
    description: string;
  }[];
}

const careers: Career[] = [
  {
    id: 1,
    title: 'Software Engineer',
    matchScore: 91,
    fitLabel: 'Strong fit',
    missingSkill: 'cloud deployment',
    rationale:
      'Your programming, data structures, databases, and software security coursework align strongly with the role. Your quiz also showed strong algorithmic reasoning.',
    matchedSkills: [
      'Programming fundamentals',
      'Data structures & algorithms',
      'SQL & database design',
      'Software security basics',
      'Version control',
    ],
    skillsToStrengthen: [
      'Cloud deployment',
      'Automated testing',
      'System design at scale',
      'Production observability',
    ],
    nextSteps: [
      {
        title: 'Cloud Fundamentals',
        priority: 'High priority',
        description: 'Build deployment confidence',
      },
      {
        title: 'Software Testing',
        priority: 'High priority',
        description: 'Close automation gap',
      },
      {
        title: 'System Design Practice',
        priority: 'Medium priority',
        description: 'Prepare for technical interviews',
      },
    ],
  },

  {
    id: 2,
    title: 'Data Analyst',
    matchScore: 86,
    fitLabel: 'Strong fit',
    missingSkill: 'dashboard portfolio',
    rationale:
      'Your database, analytical reasoning, and data-focused coursework provide a strong foundation for data analysis roles.',
    matchedSkills: [
      'SQL',
      'Database systems',
      'Data modeling',
      'Analytical reasoning',
      'Programming fundamentals',
    ],
    skillsToStrengthen: [
      'Dashboard portfolio',
      'Data visualization',
      'Advanced spreadsheet analysis',
      'Business reporting',
    ],
    nextSteps: [
      {
        title: 'Dashboard Portfolio',
        priority: 'High priority',
        description: 'Create practical visualization projects',
      },
      {
        title: 'Data Visualization',
        priority: 'High priority',
        description: 'Improve communication of data insights',
      },
      {
        title: 'Business Analytics',
        priority: 'Medium priority',
        description: 'Strengthen business-focused analysis',
      },
    ],
  },

  {
    id: 3,
    title: 'Cybersecurity Analyst',
    matchScore: 82,
    fitLabel: 'Good fit',
    missingSkill: 'network forensics',
    rationale:
      'Your software security and systems coursework provides a useful foundation for cybersecurity analysis.',
    matchedSkills: [
      'Software security basics',
      'Programming fundamentals',
      'Database systems',
      'System fundamentals',
      'Problem solving',
    ],
    skillsToStrengthen: [
      'Network forensics',
      'Incident response',
      'Security monitoring',
      'Threat analysis',
    ],
    nextSteps: [
      {
        title: 'Network Security',
        priority: 'High priority',
        description: 'Build practical networking security skills',
      },
      {
        title: 'Security Labs',
        priority: 'High priority',
        description: 'Practice identifying security threats',
      },
      {
        title: 'Incident Response',
        priority: 'Medium priority',
        description: 'Learn structured response procedures',
      },
    ],
  },

  {
    id: 4,
    title: 'QA Automation Engineer',
    matchScore: 78,
    fitLabel: 'Good fit',
    missingSkill: 'test automation framework',
    rationale:
      'Your programming and software engineering background gives you a solid starting point for software quality and automation work.',
    matchedSkills: [
      'Programming fundamentals',
      'Software engineering',
      'Version control',
      'Problem solving',
      'Software security basics',
    ],
    skillsToStrengthen: [
      'Test automation framework',
      'Integration testing',
      'End-to-end testing',
      'CI/CD testing',
    ],
    nextSteps: [
      {
        title: 'Automated Testing',
        priority: 'High priority',
        description: 'Learn a modern testing framework',
      },
      {
        title: 'Testing Project',
        priority: 'High priority',
        description: 'Build an automated testing project',
      },
      {
        title: 'CI/CD Basics',
        priority: 'Medium priority',
        description: 'Connect automated tests to deployment',
      },
    ],
  },

  {
    id: 5,
    title: 'Business Systems Analyst',
    matchScore: 73,
    fitLabel: 'Possible fit',
    missingSkill: 'requirements facilitation',
    rationale:
      'Your technical background and understanding of software systems could transfer well into systems analysis roles.',
    matchedSkills: [
      'System analysis',
      'Database systems',
      'Software engineering',
      'Problem solving',
      'Technical documentation',
    ],
    skillsToStrengthen: [
      'Requirements facilitation',
      'Stakeholder communication',
      'Business process modeling',
      'Requirements documentation',
    ],
    nextSteps: [
      {
        title: 'Requirements Analysis',
        priority: 'High priority',
        description: 'Practice gathering system requirements',
      },
      {
        title: 'Business Process Modeling',
        priority: 'High priority',
        description: 'Model real organizational workflows',
      },
      {
        title: 'Communication Practice',
        priority: 'Medium priority',
        description: 'Improve stakeholder communication',
      },
    ],
  },
];

export default function CareerFitPanel({
  userId,
}: {
  userId: string;
}) {
  const [selectedCareer, setSelectedCareer] =
    useState<Career | null>(null);

  // Keeps the prop ready for backend integration later.
  void userId;

  /* ================================
     CAREER DETAIL PAGE
  ================================= */

  if (selectedCareer) {
    return (
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <button
          onClick={() => setSelectedCareer(null)}
          className="self-start text-xs text-slate-500 hover:text-[#00d2ff] transition-colors"
        >
          Career paths / {selectedCareer.title}
        </button>

        {/* Career Heading */}
        <div>
          <h1 className="text-3xl font-bold text-white">
            {selectedCareer.title}
          </h1>

          <p className="mt-2 text-sm">
            <span className="text-[#34d399] font-bold">
              {selectedCareer.matchScore}% profile match
            </span>

            <span className="text-slate-500">
              {' '}
              · {selectedCareer.fitLabel}
            </span>
          </p>
        </div>

        {/* Why This Fits */}
        <div className="bg-[#0d1729] border border-[#1b2947] rounded-xl p-6">
          <h2 className="text-sm font-bold text-white mb-3">
            Why this fits you
          </h2>

          <p className="text-sm text-slate-300 leading-6">
            {selectedCareer.rationale}
          </p>

          <p className="text-xs text-slate-500 mt-4">
            This is guidance, not a final academic or career decision.
          </p>
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Matched Skills */}
          <div className="bg-[#0d1729] border border-[#1b2947] rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-5">
              Matched skills
            </h2>

            <div className="space-y-3">
              {selectedCareer.matchedSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 text-sm text-[#34d399]"
                >
                  <span>✓</span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills To Strengthen */}
          <div className="bg-[#0d1729] border border-[#1b2947] rounded-xl p-6">
            <h2 className="text-sm font-bold text-white mb-5">
              Skills to strengthen
            </h2>

            <div className="space-y-3">
              {selectedCareer.skillsToStrengthen.map(
                (skill, index) => (
                  <div
                    key={skill}
                    className="flex gap-3 text-sm text-amber-400"
                  >
                    <span>{index + 1}.</span>
                    <span>{skill}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-[#0d1729] border border-[#1b2947] rounded-xl p-6">
          <h2 className="text-sm font-bold text-white mb-6">
            Recommended next steps
          </h2>

          <div className="space-y-3">
            {selectedCareer.nextSteps.map((step) => (
              <div
                key={step.title}
                className="grid grid-cols-1 md:grid-cols-[220px_150px_1fr] gap-3 md:items-center py-3 border-b border-[#1b2947] last:border-b-0"
              >
                <span className="text-sm text-white font-medium">
                  {step.title}
                </span>

                <span
                  className={`text-xs font-medium ${
                    step.priority === 'High priority'
                      ? 'text-[#00d2ff]'
                      : 'text-[#34d399]'
                  }`}
                >
                  {step.priority}
                </span>

                <span className="text-xs text-slate-400">
                  {step.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => setSelectedCareer(null)}
          className="self-start px-4 py-2 rounded-lg border border-[#1b2947] text-xs text-slate-300 hover:border-[#00d2ff] hover:text-[#00d2ff] transition-all"
        >
          ← Back to career paths
        </button>
      </div>
    );
  }

  /* ================================
     CAREER PATHS PAGE
  ================================= */

  return (
    <div className="flex flex-col gap-6">
      {/* Heading */}
      <div>
        <p className="text-xs text-slate-500 mb-3">
          Workspace / Career paths
        </p>

        <h1 className="text-2xl font-bold text-white">
          Career paths that match your profile
        </h1>

        <p className="text-sm text-slate-400 mt-2">
          Ranked from your coursework, quiz results, interests,
          and transferable skills.
        </p>
      </div>

      {/* Strongest Fit */}
      <div className="bg-[#0d1729] border border-[#1b2947] rounded-xl p-5">
        <h2 className="text-sm font-bold text-white">
          Strongest fit: Software &amp; Data
        </h2>

        <p className="text-xs text-slate-400 mt-2">
          Your top matches share programming, analytical reasoning,
          and systems thinking.
        </p>
      </div>

      {/* Career List */}
      <div className="flex flex-col gap-3">
        {careers.map((career, index) => (
          <div
            key={career.id}
            className="bg-[#0d1729] border border-[#1b2947] rounded-xl p-5 hover:border-[#00d2ff]/40 transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[50px_1fr_260px_80px_120px] gap-4 lg:items-center">
              {/* Ranking */}
              <div className="text-[#00d2ff] text-xs font-bold">
                #{index + 1}
              </div>

              {/* Career */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {career.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  {career.fitLabel}
                </p>
              </div>

              {/* Missing */}
              <div className="text-xs">
                <span className="text-amber-400">
                  Missing:
                </span>{' '}
                <span className="text-slate-400">
                  {career.missingSkill}
                </span>
              </div>

              {/* Score */}
              <div className="text-xl font-bold text-[#34d399]">
                {career.matchScore}%
              </div>

              {/* Details */}
              <button
                onClick={() => setSelectedCareer(career)}
                className="border border-[#00d2ff] text-[#00d2ff] rounded-lg px-4 py-2 text-xs font-semibold hover:bg-[#00d2ff] hover:text-[#08101e] transition-all"
              >
                View details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}