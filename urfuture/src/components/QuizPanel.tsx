'use client';

import { useState, useMemo } from 'react';
import { ClipboardCheck, Code2, FlaskConical, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  difficulty: string;
  sourceCourse?: string;
  questionType?: 'MULTIPLE_CHOICE' | 'WRITTEN' | 'CODING' | 'LAB';
  codeSnippet?: string;
  isLab?: boolean;
}

interface QuizPanelProps {
  userId: string;
  onQuizCompleted?: (scorePercent: number) => void;
  onNavigateToCareers?: () => void;
}

type QuizLength = 15 | 30 | 60;

const QUIZ_LENGTH_OPTIONS: { value: QuizLength; label: string; desc: string }[] = [
  { value: 15, label: '15 Questions', desc: 'Quick Diagnostic ~10 mins' },
  { value: 30, label: '30 Questions', desc: 'Standard Readiness ~25 mins' },
  { value: 60, label: '60 Questions', desc: 'Comprehensive Assessment ~50 mins' },
];

const QUESTIONS_PER_PAGE = 5;

export default function QuizPanel({ userId, onQuizCompleted, onNavigateToCareers }: QuizPanelProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [result, setResult] = useState<{ scorePercent: number; correctCount: number; totalQuestions: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLength, setSelectedLength] = useState<QuizLength>(15);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const pagedQuestions = useMemo(() => {
    const start = currentPage * QUESTIONS_PER_PAGE;
    return questions.slice(start, start + QUESTIONS_PER_PAGE);
  }, [questions, currentPage]);

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  async function generateQuiz() {
    setBusy(true);
    setError(null);
    setResult(null);
    setAnswers({});
    setCurrentPage(0);
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionCount: selectedLength }),
      });
      const responseText = await res.text();
      let data: { error?: string; detail?: string; questions?: QuizQuestion[]; quizAttemptId?: string };
      try { data = JSON.parse(responseText); } catch { throw new Error(`Quiz service returned an unexpected response (${res.status}).`); }
      if (!res.ok) throw new Error(data.detail ? `${data.error || 'Could not generate quiz'}: ${data.detail}` : data.error || 'Could not generate quiz');
      if (!data.questions?.length || !data.quizAttemptId) throw new Error('Quiz service returned no questions.');
      setQuestions(data.questions);
      setQuizAttemptId(data.quizAttemptId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not generate quiz');
    } finally {
      setBusy(false);
    }
  }

  async function submitQuiz() {
    if (!quizAttemptId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizAttemptId,
          answers: Object.entries(answers).map(([questionId, answer]) => typeof answer === 'number'
            ? { questionId, selectedIndex: answer }
            : { questionId, studentAnswer: answer }),
        }),
      });
      const responseText = await res.text();
      let data: { error?: string; detail?: string; scorePercent?: number; correctCount?: number; totalQuestions?: number };
      try { data = JSON.parse(responseText); } catch { throw new Error(`Quiz evaluation returned an unexpected response (${res.status}).`); }
      if (!res.ok) throw new Error(data.detail ? `${data.error || 'Could not evaluate quiz'}: ${data.detail}` : data.error || 'Could not evaluate quiz');
      if (typeof data.scorePercent !== 'number' || typeof data.correctCount !== 'number' || typeof data.totalQuestions !== 'number') throw new Error('Quiz evaluation returned an incomplete score.');
      setResult({ scorePercent: data.scorePercent, correctCount: data.correctCount, totalQuestions: data.totalQuestions });
      if (onQuizCompleted) onQuizCompleted(data.scorePercent);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not evaluate quiz');
    } finally {
      setBusy(false);
    }
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined && answers[q.id] !== '');

  // Count answered on current page
  const pageAnsweredCount = pagedQuestions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const pageComplete = pageAnsweredCount === pagedQuestions.length;

  return (
    <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            Diagnostic Knowledge Quiz
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test your grasp across all uploaded course subjects to benchmark your career readiness.
          </p>
        </div>

        <button
          onClick={generateQuiz}
          disabled={busy}
          className="self-start sm:self-auto rounded-xl bg-[#00d2ff] hover:bg-[#00bfe6] disabled:opacity-40 text-[#080d1a] px-4 py-2 text-xs font-bold shadow-md shadow-[#00d2ff]/20 transition-all flex items-center gap-2 shrink-0"
        >
          {busy && !questions.length ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
              Building questions…
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              {questions.length ? 'Regenerate Quiz' : 'Generate Quiz From Transcripts'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Quiz Length Selector — shown before quiz is generated */}
      {!questions.length && !error && !result && (
        <div className="rounded-xl border border-[#1b2b4c] bg-[#091120] p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#0d1d36] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff] mx-auto mb-3">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Choose Your Quiz Format</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Upload your course transcripts above, then select a quiz length and click &ldquo;Generate Quiz&rdquo; to test your actual competency levels.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {QUIZ_LENGTH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedLength(opt.value)}
                className={`flex-1 max-w-[220px] rounded-xl border p-4 text-left transition-all ${
                  selectedLength === opt.value
                    ? 'bg-[#00d2ff]/10 border-[#00d2ff] shadow-sm shadow-[#00d2ff]/20'
                    : 'bg-[#0d1629] border-[#1b2b4d] hover:border-[#2b4475] hover:bg-[#111f38]'
                }`}
              >
                <span className={`block text-sm font-bold ${selectedLength === opt.value ? 'text-[#00d2ff]' : 'text-white'}`}>
                  {opt.label}
                </span>
                <span className="block text-[10px] text-slate-400 mt-1">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress bar */}
      {questions.length > 0 && !result && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
            <span>{answeredCount} of {questions.length} answered</span>
            <span>{Math.round(progressPercent)}% complete</span>
          </div>
          <div className="w-full h-1.5 bg-[#1b2b4d] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00d2ff] to-[#10b981] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Questions list — paginated */}
      {questions.length > 0 && !result && (
        <div className="flex flex-col gap-5">
          {pagedQuestions.map((q, i) => {
            const globalIndex = currentPage * QUESTIONS_PER_PAGE + i;
            const isLab = q.isLab || q.questionType === 'LAB';

            return (
              <div key={q.id} className={`rounded-xl border p-4 ${
                isLab
                  ? 'border-[#2a4b3b] bg-[#081a14]'
                  : q.questionType === 'CODING'
                    ? 'border-[#234b63] bg-[#081522]'
                    : 'border-[#17253d] bg-[#091120]'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs font-bold text-white leading-relaxed">
                    {globalIndex + 1}. {q.questionType === 'CODING' ? 'Coding challenge' : q.prompt}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    {isLab && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#133b2a] px-2 py-0.5 text-[10px] font-bold text-[#34d399]">
                        <FlaskConical className="h-3 w-3" /> LAB
                      </span>
                    )}
                    {q.questionType === 'CODING' && !isLab && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#123b4b] px-2 py-0.5 text-[10px] font-bold text-[#67e8f9]">
                        <Code2 className="h-3 w-3" /> CODE
                      </span>
                    )}
                    {q.sourceCourse && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101e36] text-[#00d2ff] border border-[#193259]">
                        {q.sourceCourse}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === 'EASY'
                          ? 'bg-[#064e3b] text-[#34d399]'
                          : q.difficulty === 'MEDIUM'
                          ? 'bg-[#0c4a6e] text-[#38bdf8]'
                          : 'bg-[#78350f] text-[#fcd34d]'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                  </div>
                </div>

                {/* Lab question: code snippet + multiple choice */}
                {isLab && q.codeSnippet ? (
                  <div className="mt-3 space-y-3">
                    {/* Code snippet block */}
                    <div className="overflow-hidden rounded-lg border border-[#1c3b2a] bg-[#071210] shadow-inner shadow-black/20">
                      <div className="flex items-center justify-between border-b border-[#1b3425] bg-[#0c1d15] px-3 py-2">
                        <span className="font-mono text-[10px] text-slate-400">scenario.code</span>
                        <span className="text-[10px] text-[#34d399] font-bold">Lab Scenario</span>
                      </div>
                      <pre className="p-4 overflow-x-auto">
                        <code className="font-mono text-xs leading-5 text-[#d7f9e0] whitespace-pre">
                          {q.codeSnippet}
                        </code>
                      </pre>
                    </div>

                    {/* MC choices for lab questions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.choices.map((choice, idx) => {
                        const isSelected = answers[q.id] === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                            className={`text-left p-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-2.5 ${
                              isSelected
                                ? 'bg-[#10b981]/15 border-[#10b981] text-white shadow-sm shadow-[#10b981]/20'
                                : 'bg-[#0d1629] border-[#1b2b4d] text-slate-300 hover:border-[#2b4475] hover:bg-[#111f38]'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                isSelected ? 'bg-[#10b981] text-[#080d1a]' : 'border border-slate-600 text-slate-400'
                              }`}
                            >
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="truncate">{choice}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : q.questionType === 'CODING' ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                    <div className="rounded-lg border border-[#1c3b50] bg-[#0c2030] p-4">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#67e8f9]">Task</p>
                      <p className="text-sm leading-6 text-slate-200">{q.prompt}</p>
                      <p className="mt-4 text-[10px] leading-4 text-slate-400">Write a clear solution. Include brief comments when they make your approach easier to follow.</p>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-[#254b62] bg-[#071019] shadow-inner shadow-black/20">
                      <div className="flex items-center justify-between border-b border-[#1b3445] bg-[#0c1d2a] px-3 py-2">
                        <span className="font-mono text-[10px] text-slate-400">solution.code</span>
                        <span className="text-[10px] text-[#67e8f9]">Your answer</span>
                      </div>
                      <textarea
                        value={typeof answers[q.id] === 'string' ? answers[q.id] as string : ''}
                        onChange={(event) => setAnswers((prev) => ({ ...prev, [q.id]: event.target.value }))}
                        placeholder="Write your solution or code here..."
                        spellCheck={false}
                        className="min-h-44 w-full resize-y bg-[#071019] p-4 font-mono text-xs leading-5 text-[#d7f9ff] outline-none placeholder:text-slate-600 focus:bg-[#091724]"
                      />
                    </div>
                  </div>
                ) : q.questionType === 'WRITTEN' ? (
                  <textarea
                    value={typeof answers[q.id] === 'string' ? answers[q.id] as string : ''}
                    onChange={(event) => setAnswers((prev) => ({ ...prev, [q.id]: event.target.value }))}
                    placeholder="Write your answer here..."
                    className="mt-3 min-h-28 w-full resize-y rounded-lg border border-[#1b2b4d] bg-[#0d1629] p-3 text-xs leading-5 text-slate-200 outline-none focus:border-[#00d2ff]"
                  />
                ) : <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                  {q.choices.map((choice, idx) => {
                    const isSelected = answers[q.id] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                        className={`text-left p-3 rounded-lg text-xs font-medium border transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#00d2ff]/15 border-[#00d2ff] text-white shadow-sm shadow-[#00d2ff]/20'
                            : 'bg-[#0d1629] border-[#1b2b4d] text-slate-300 hover:border-[#2b4475] hover:bg-[#111f38]'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected ? 'bg-[#00d2ff] text-[#080d1a]' : 'border border-slate-600 text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="truncate">{choice}</span>
                      </button>
                    );
                  })}
                </div>}
              </div>
            );
          })}

          {/* Pagination / Navigation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Page navigation */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="rounded-lg border border-[#1b2b4d] bg-[#0d1629] px-3 py-1.5 text-xs text-slate-300 hover:border-[#2b4475] disabled:opacity-30 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="w-3 h-3" /> Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`w-7 h-7 rounded-md text-[10px] font-bold transition-all ${
                        currentPage === i
                          ? 'bg-[#00d2ff] text-[#080d1a]'
                          : 'bg-[#0d1629] text-slate-400 border border-[#1b2b4d] hover:border-[#2b4475]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="rounded-lg border border-[#1b2b4d] bg-[#0d1629] px-3 py-1.5 text-xs text-slate-300 hover:border-[#2b4475] disabled:opacity-30 transition-all flex items-center gap-1"
                >
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Submit button */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                {pageAnsweredCount} of {pagedQuestions.length} on this page {pageComplete && '✓'}
              </span>
              <button
                onClick={submitQuiz}
                disabled={!allAnswered || busy}
                className="rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-40 text-[#080d1a] font-bold text-xs px-6 py-2.5 shadow-md shadow-[#10b981]/20 transition-all flex items-center gap-2"
              >
                {busy ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
                    Grading quiz…
                  </>
                ) : (
                  'Submit Answers & Calculate %'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="rounded-xl border border-[#0d6d53] bg-gradient-to-br from-[#064e3b]/30 via-[#07241d]/40 to-[#0c1a2e] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#34d399] uppercase tracking-wider block mb-1">
                Quiz Evaluation Complete
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#34d399]">{result.scorePercent}%</span>
                <span className="text-sm text-slate-300 font-medium">Verified Knowledge Score</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                You answered <span className="text-white font-semibold">{result.correctCount}</span> out of{' '}
                <span className="text-white font-semibold">{result.totalQuestions}</span> questions correctly.
                Your skill proficiencies have been calibrated!
              </p>
            </div>

            {onNavigateToCareers && (
              <button
                onClick={onNavigateToCareers}
                className="rounded-xl bg-[#00d2ff] hover:bg-[#00bfe6] text-[#080d1a] px-5 py-2.5 text-xs font-bold shadow-lg shadow-[#00d2ff]/20 transition-all shrink-0"
              >
                View Matched Careers →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

