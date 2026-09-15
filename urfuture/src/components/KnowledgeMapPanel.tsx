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

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

const skills: Skill[] = [
  {
    id: 'programming',
    name: 'Programming Fundamentals',
    category: 'Software Engineering',
    progress: 100,
    status: 'Completed',
    description:
      'Core programming concepts, logic, variables, functions, and control flow.',
  },
  {
    id: 'oop',
    name: 'Object-Oriented Programming',
    category: 'Software Engineering',
    progress: 90,
    status: 'Completed',
    description:
      'Classes, objects, inheritance, encapsulation, and polymorphism.',
  },
  {
    id: 'database',
    name: 'Database Systems',
    category: 'Data',
    progress: 82,
    status: 'Completed',
    description:
      'Relational databases, SQL, schema design, and data management.',
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Software Engineering',
    progress: 68,
    status: 'In Progress',
    description:
      'Arrays, linked structures, trees, graphs, searching, and sorting.',
  },
  {
    id: 'cloud',
    name: 'Cloud Computing',
    category: 'Infrastructure',
    progress: 55,
    status: 'In Progress',
    description:
      'Cloud infrastructure, deployment, networking, and scalable services.',
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    category: 'AI & Data',
    progress: 30,
    status: 'Incomplete',
    description:
      'Data preparation, model training, evaluation, and predictive systems.',
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

const demoQuestions: QuizQuestion[] = [
  {
    id: 1,
    question:
      'Which of the following is a key principle of effective communication?',
    options: ['Clarity', 'Complexity', 'Ambiguity', 'Repetition'],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: 'What does active listening involve?',
    options: [
      'Ignoring feedback',
      'Preparing a response while someone speaks',
      'Fully focusing on and understanding the speaker',
      'Speaking more than the other person',
    ],
    correctAnswer: 2,
  },
  {
    id: 3,
    question: 'Which is an example of non-verbal communication?',
    options: [
      'Email',
      'Body language',
      'Report writing',
      'Phone call',
    ],
    correctAnswer: 1,
  },
  {
    id: 4,
    question:
      'What is the main purpose of feedback in communication?',
    options: [
      'To make communication longer',
      'To confirm understanding and improve communication',
      'To avoid discussion',
      'To replace listening',
    ],
    correctAnswer: 1,
  },
  {
    id: 5,
    question: 'Which skill helps reduce misunderstandings?',
    options: [
      'Clear communication',
      'Avoiding questions',
      'Using complicated language',
      'Ignoring feedback',
    ],
    correctAnswer: 0,
  },
];

export default function KnowledgeMapPanel({
  userId,
}: KnowledgeMapPanelProps) {
  const [selectedSkill, setSelectedSkill] =
    useState<Skill | null>(null);

  // Transcript
  const [academicTerm, setAcademicTerm] = useState('Year 1');
  const [transcriptFile, setTranscriptFile] =
    useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transcriptParsed, setTranscriptParsed] =
    useState(false);

  // Quiz
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizExpanded, setQuizExpanded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<
    Record<number, number>
  >({});
  const [quizSubmitted, setQuizSubmitted] =
    useState(false);

  const completedSkills = skills.filter(
    (skill) => skill.status === 'Completed'
  ).length;

  const inProgressSkills = skills.filter(
    (skill) => skill.status === 'In Progress'
  ).length;

  const averageProgress = Math.round(
    skills.reduce(
      (total, skill) => total + skill.progress,
      0
    ) / skills.length
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

  // ============================================================
  // FRONTEND-ONLY TRANSCRIPT PROCESSING
  // ============================================================

  async function handleUploadTranscript() {
    if (!transcriptFile) return;

    setUploading(true);
    setTranscriptParsed(false);

    // Frontend demo only.
    // No API is called here.
    await new Promise((resolve) =>
      setTimeout(resolve, 800)
    );

    setTranscriptParsed(true);
    setUploading(false);
  }

  // ============================================================
  // GENERATE QUIZ
  // Opens right panel immediately and loads there.
  // ============================================================

  async function handleGenerateQuiz() {
    if (!transcriptParsed) return;

    setQuizOpen(true);
    setQuizLoading(true);
    setQuizExpanded(false);

    setCurrentQuestion(0);
    setAnswers({});
    setQuizSubmitted(false);

    // Frontend demo generation.
    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    setQuizLoading(false);
  }

  function selectAnswer(optionIndex: number) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: optionIndex,
    }));
  }

  const score = demoQuestions.reduce(
    (total, question, index) => {
      if (
        answers[index] === question.correctAnswer
      ) {
        return total + 1;
      }

      return total;
    },
    0
  );

  // ============================================================
  // UPLOAD CARD
  // ============================================================

    // ============================================================
  // UPLOAD CARD
  // ============================================================

  const uploadCard = (
    <div className="bg-[#0a1628] border border-[#1b2947] rounded-xl p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />

            <h3 className="text-base font-bold text-white">
              Upload Coursework Transcripts
            </h3>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            Upload transcripts from Year 1–4 to generate tailored
            diagnostic quizzes and verify your skills.
          </p>
        </div>

        {transcriptParsed ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[10px] font-bold text-[#34d399] shrink-0">
            Transcript Ready
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[10px] font-bold text-[#34d399] shrink-0">
            AI Auto-Extraction
          </span>
        )}
      </div>

      {/* Upload fields */}
      <div className="grid grid-cols-1 xl:grid-cols-[120px_minmax(0,1fr)] gap-4">
        {/* Academic Term */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
            Academic Term
          </label>

          <select
            value={academicTerm}
            onChange={(event) =>
              setAcademicTerm(event.target.value)
            }
            className="w-full h-11 rounded-lg bg-[#0d1526] border border-[#1b2947] px-3 text-xs text-slate-200 outline-none focus:border-[#00d2ff]/60"
          >
            <option>Year 1</option>
            <option>Year 2</option>
            <option>Year 3</option>
            <option>Year 4</option>
          </select>
        </div>

        {/* Transcript File */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-2">
            Transcript File (.PDF)
          </label>

          <label className="h-11 flex items-center justify-between gap-3 rounded-lg bg-[#0d1526] border border-dashed border-[#263858] px-4 cursor-pointer hover:border-[#00d2ff]/60 transition-colors">
            <span className="text-xs text-slate-400 truncate">
              {transcriptFile
                ? transcriptFile.name
                : 'Select transcript PDF...'}
            </span>

            <span className="text-xs font-bold text-[#00d2ff]">
              Browse
            </span>

            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(event) => {
                const file =
                  event.target.files?.[0] ?? null;

                setTranscriptFile(file);
                setTranscriptParsed(false);
                setQuizOpen(false);
                setQuizExpanded(false);
              }}
            />
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleUploadTranscript}
          disabled={!transcriptFile || uploading}
          className="h-11 px-5 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe6] disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed text-[#070d1a] text-xs font-bold transition-all"
        >
          {uploading ? 'Processing...' : 'Upload & Parse'}
        </button>

        <button
          type="button"
          onClick={handleGenerateQuiz}
          disabled={!transcriptParsed}
          className="h-11 px-5 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe6] disabled:bg-slate-700/50 disabled:text-slate-500 disabled:cursor-not-allowed text-[#070d1a] text-xs font-bold transition-all shadow-lg shadow-[#00d2ff]/10"
        >
          Generate Quiz
        </button>
      </div>

      {/* Status */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            transcriptParsed
              ? 'bg-[#34d399]'
              : 'bg-slate-600'
          }`}
        />

        <p className="text-[10px] text-slate-500">
          {transcriptParsed
            ? 'Transcript processed. You can now generate your quiz.'
            : 'Upload and process a transcript to enable Generate Quiz.'}
        </p>
      </div>
    </div>
  );

  // ============================================================
  // KNOWLEDGE MAP
  // ============================================================

  const knowledgeMapContent = (
    <div className="space-y-6">
      {uploadCard}

      <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 sm:p-6">
        {/* Header */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />

              <h2 className="text-lg font-bold text-white">
                Knowledge Map
              </h2>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Track your verified skills, knowledge areas,
              relationships, and learning progress.
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30">
            <span className="text-xs font-bold text-[#00d2ff]">
              {averageProgress}% overall coverage
            </span>
          </div>
        </div>

        {/* Summary */}

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
                style={{
                  width: `${averageProgress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Skills */}

        <div className="mt-8">
          <h3 className="text-sm font-bold text-white">
            Skills & Knowledge Areas
          </h3>

          <p className="text-[11px] text-slate-500 mt-1 mb-4">
            Select a skill to view more information.
          </p>

          <div
            className={`grid grid-cols-1 ${
              quizOpen && !quizExpanded
                ? ''
                : 'md:grid-cols-2'
            } gap-4`}
          >
            {skills.map((skill) => {
              const isSelected =
                selectedSkill?.id === skill.id;

              return (
                <button
                  type="button"
                  key={skill.id}
                  onClick={() =>
                    setSelectedSkill(
                      isSelected ? null : skill
                    )
                  }
                  className={`text-left bg-[#09111f] border rounded-xl p-4 transition-all ${
                    isSelected
                      ? 'border-[#00d2ff]'
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
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] text-slate-500">
                        Competency
                      </span>

                      <span className="text-xs font-bold text-slate-300">
                        {skill.progress}%
                      </span>
                    </div>

                    <div className="h-1.5 bg-[#17253d] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00d2ff] to-[#34d399] rounded-full"
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

        {/* Skill Relationships */}

        <div className="mt-8">
          <h3 className="text-sm font-bold text-white">
            Skill Relationships
          </h3>

          <p className="text-[11px] text-slate-500 mt-1 mb-4">
            See how your knowledge areas build on and
            support one another.
          </p>

          <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-5">
            <div className="space-y-3">
              {relationships.map(
                (relationship, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"
                  >
                    <div className="bg-[#0d1526] border border-[#1b2947] rounded-lg p-3">
                      <span className="text-xs font-semibold text-slate-200">
                        {relationship.from}
                      </span>
                    </div>

                    <div className="flex flex-col items-center min-w-[70px]">
                      <span className="text-[9px] text-slate-500 mb-1">
                        {relationship.label}
                      </span>

                      <span className="text-[#34d399]">
                        →
                      </span>
                    </div>

                    <div className="bg-[#0d1526] border border-[#1b2947] rounded-lg p-3">
                      <span className="text-xs font-semibold text-slate-200">
                        {relationship.to}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Recommended Next Step */}

        <div className="mt-6 bg-gradient-to-r from-[#00d2ff]/5 to-[#34d399]/5 border border-[#00d2ff]/20 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#00d2ff]">
                Recommended Next Step
              </p>

              <h3 className="text-sm font-bold text-white mt-1">
                Strengthen Data Structures & Algorithms
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Improving this competency will strengthen
                your foundation for Machine Learning and
                advanced software engineering.
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-lg bg-[#00d2ff]/10 border border-[#00d2ff]/30 text-xs font-bold text-[#00d2ff] shrink-0">
              68% complete
            </span>
          </div>
        </div>
      </section>
    </div>
  );

  // ============================================================
  // QUIZ PANEL
  // ============================================================

  const currentQuizQuestion =
    demoQuestions[currentQuestion];

  const quizPanel = (
    <section className="bg-[#0d1526] border border-[#1b2947] rounded-xl overflow-hidden min-h-[600px]">
      {/* Quiz Header */}

      <div className="flex items-center justify-between gap-4 p-5 border-b border-[#1b2947]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />

            <h2 className="text-lg font-bold text-white">
              Diagnostic Knowledge Quiz
            </h2>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            Based on your uploaded coursework.
          </p>
        </div>

        {/* <> Toggle */}

        <button
          type="button"
          onClick={() =>
            setQuizExpanded((previous) => !previous)
          }
          title={
            quizExpanded
              ? 'Return to split screen'
              : 'Full screen quiz'
          }
          className="h-10 min-w-12 px-3 flex items-center justify-center rounded-lg border border-[#00d2ff]/40 text-[#00d2ff] hover:bg-[#00d2ff]/10 transition-colors font-bold text-sm"
        >
          &lt;&gt;
        </button>
      </div>

      {/* Loading appears HERE on the right */}

      {quizLoading ? (
        <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#1b2947] border-t-[#00d2ff] animate-spin" />

          <h3 className="text-base font-bold text-white mt-6">
            Generating your quiz...
          </h3>

          <p className="text-xs text-slate-400 mt-2 max-w-xs">
            Analyzing your uploaded coursework and
            preparing diagnostic questions.
          </p>

          <div className="mt-6 w-full max-w-xs h-1.5 rounded-full bg-[#17253d] overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-[#00d2ff] to-[#34d399] rounded-full animate-pulse" />
          </div>
        </div>
      ) : quizSubmitted ? (
        /* Results */

        <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/30 flex items-center justify-center">
            <span className="text-2xl font-extrabold text-[#00d2ff]">
              {Math.round(
                (score / demoQuestions.length) * 100
              )}
              %
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mt-5">
            Quiz Complete
          </h3>

          <p className="text-sm text-slate-400 mt-2">
            You answered {score} of{' '}
            {demoQuestions.length} questions correctly.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-6">
            <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-4">
              <p className="text-2xl font-bold text-[#34d399]">
                {score}
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                Correct
              </p>
            </div>

            <div className="bg-[#09111f] border border-[#1b2947] rounded-xl p-4">
              <p className="text-2xl font-bold text-slate-300">
                {demoQuestions.length - score}
              </p>

              <p className="text-[10px] text-slate-500 mt-1">
                To Review
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setCurrentQuestion(0);
              setAnswers({});
              setQuizSubmitted(false);
            }}
            className="mt-6 px-5 py-2.5 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe6] text-[#070d1a] text-xs font-bold transition-colors"
          >
            Retake Quiz
          </button>
        </div>
      ) : (
        /* Quiz */

        <div className="p-5 sm:p-7">
          {/* Progress */}

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Question {currentQuestion + 1} of{' '}
              {demoQuestions.length}
            </span>

            <span className="text-xs font-bold text-[#00d2ff]">
              {Math.round(
                ((currentQuestion + 1) /
                  demoQuestions.length) *
                  100
              )}
              %
            </span>
          </div>

          <div className="mt-3 h-1.5 bg-[#17253d] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00d2ff] to-[#34d399] rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestion + 1) /
                    demoQuestions.length) *
                  100
                }%`,
              }}
            />
          </div>

          {/* Question */}

          <h3 className="text-lg font-semibold text-white leading-relaxed mt-7">
            {currentQuizQuestion.question}
          </h3>

          {/* Answers */}

          <div className="space-y-3 mt-6">
            {currentQuizQuestion.options.map(
              (option, optionIndex) => {
                const selected =
                  answers[currentQuestion] ===
                  optionIndex;

                return (
                  <button
                    type="button"
                    key={optionIndex}
                    onClick={() =>
                      selectAnswer(optionIndex)
                    }
                    className={`w-full flex items-center gap-3 text-left p-4 rounded-xl border transition-all ${
                      selected
                        ? 'border-[#00d2ff] bg-[#00d2ff]/10'
                        : 'border-[#1b2947] bg-[#09111f] hover:border-[#00d2ff]/40'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        selected
                          ? 'bg-[#00d2ff] text-[#070d1a]'
                          : 'bg-[#17253d] text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(
                        65 + optionIndex
                      )}
                    </span>

                    <span
                      className={`text-sm ${
                        selected
                          ? 'text-white'
                          : 'text-slate-300'
                      }`}
                    >
                      {option}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* Question navigation numbers */}

          <div className="mt-7 pt-5 border-t border-[#1b2947]">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-3">
              Questions
            </p>

            <div className="flex flex-wrap gap-2">
              {demoQuestions.map((_, index) => {
                const active =
                  currentQuestion === index;

                const answered =
                  answers[index] !== undefined;

                return (
                  <button
                    type="button"
                    key={index}
                    onClick={() =>
                      setCurrentQuestion(index)
                    }
                    className={`w-8 h-8 rounded-lg text-[10px] font-bold border transition-all ${
                      active
                        ? 'bg-[#00d2ff] border-[#00d2ff] text-[#070d1a]'
                        : answered
                        ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#34d399]'
                        : 'bg-[#09111f] border-[#1b2947] text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Previous / Next */}

          <div className="flex items-center justify-between gap-3 mt-7">
            <button
              type="button"
              disabled={currentQuestion === 0}
              onClick={() =>
                setCurrentQuestion((previous) =>
                  Math.max(previous - 1, 0)
                )
              }
              className="px-4 py-2.5 rounded-lg border border-[#263858] text-xs font-bold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#00d2ff]/50 transition-colors"
            >
              Previous
            </button>

            {currentQuestion <
            demoQuestions.length - 1 ? (
              <button
                type="button"
                disabled={
                  answers[currentQuestion] ===
                  undefined
                }
                onClick={() =>
                  setCurrentQuestion(
                    (previous) => previous + 1
                  )
                }
                className="px-5 py-2.5 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe6] disabled:opacity-30 disabled:cursor-not-allowed text-[#070d1a] text-xs font-bold transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={
                  answers[currentQuestion] ===
                  undefined
                }
                onClick={() =>
                  setQuizSubmitted(true)
                }
                className="px-5 py-2.5 rounded-lg bg-[#34d399] hover:bg-[#2fc28c] disabled:opacity-30 disabled:cursor-not-allowed text-[#070d1a] text-xs font-bold transition-colors"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );

  // ============================================================
  // PAGE LAYOUT
  // ============================================================

  if (!quizOpen) {
    return knowledgeMapContent;
  }

  // Full-width quiz
  if (quizExpanded) {
    return (
      <div className="w-full transition-all duration-300">
        {quizPanel}
      </div>
    );
  }

  // Split screen
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start transition-all duration-300">
      {/* LEFT */}
      <div className="min-w-0">
        {knowledgeMapContent}
      </div>

      {/* RIGHT */}
      <div className="min-w-0 xl:sticky xl:top-6">
        {quizPanel}
      </div>
    </div>
  );
}