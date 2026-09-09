'use client';

import { useState } from 'react';

interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  difficulty: string;
  sourceCourse?: string;
}

export default function QuizPanel({ userId }: { userId: string }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttemptId, setQuizAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{ scorePercent: number; correctCount: number; totalQuestions: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateQuiz() {
    setBusy(true);
    setError(null);
    setResult(null);
    setAnswers({});
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, questionCount: 8 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not generate quiz');
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
          answers: Object.entries(answers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not evaluate quiz');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not evaluate quiz');
    } finally {
      setBusy(false);
    }
  }

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-angkor-maroon">Knowledge diagnostic quiz</h3>
        <button
          onClick={generateQuiz}
          disabled={busy}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          {busy && !questions.length ? 'Building quiz…' : 'Generate quiz from my transcripts'}
        </button>
      </div>

      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {!questions.length && !error && (
        <p className="text-xs text-black/50">
          Upload at least one transcript first, then generate a quiz covering everything you've taken so far.
        </p>
      )}

      {questions.length > 0 && !result && (
        <div className="flex max-h-96 flex-col gap-4 overflow-y-auto scrollbar-thin pr-1">
          {questions.map((q, i) => (
            <div key={q.id} className="border-b border-black/10 pb-3 last:border-0">
              <p className="text-sm font-medium">
                {i + 1}. {q.prompt}
              </p>
              {q.sourceCourse && <p className="text-[11px] text-black/40">from {q.sourceCourse}</p>}
              <div className="mt-2 flex flex-col gap-1.5">
                {q.choices.map((choice, idx) => (
                  <label key={idx} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === idx}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                    />
                    {choice}
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button
            onClick={submitQuiz}
            disabled={!allAnswered || busy}
            className="mt-1 self-start rounded-md bg-angkor-maroon px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            {busy ? 'Grading…' : 'Submit answers'}
          </button>
        </div>
      )}

      {result && (
        <div className="rounded-md bg-angkor-gold/10 p-4">
          <p className="text-2xl font-semibold text-angkor-maroon">{result.scorePercent}%</p>
          <p className="text-sm text-black/70">
            {result.correctCount} of {result.totalQuestions} correct. Your skill radar has been updated — check the
            Career Fit tab for job recommendations based on this result.
          </p>
        </div>
      )}
    </div>
  );
}
