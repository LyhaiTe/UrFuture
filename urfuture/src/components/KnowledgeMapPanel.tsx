'use client';

import { useState } from 'react';
import { FileUp, Sparkles } from 'lucide-react';
import QuizPanel from '@/components/QuizPanel';

interface Course {
  courseCode?: string | null;
  courseName?: string | null;
  grade?: string | number | null;
  knowledgeArea?: string | null;
}

interface Skill {
  name: string;
  proficiency: number;
  source: string;
}

export default function KnowledgeMapPanel({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [yearLabel, setYearLabel] = useState('Year 1');
  const [courses, setCourses] = useState<Course[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [major, setMajor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadTranscript() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('userId', userId);
      form.append('yearLabel', yearLabel);
      form.append('file', file);
      const response = await fetch('/api/transcript/upload', { method: 'POST', body: form });
      const responseText = await response.text();
      let data: { error?: string; detail?: string; courses?: Course[]; detectedMajor?: string | null; transcript?: { parsedCourses?: Course[] } };
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Transcript service returned an unexpected response (${response.status}). Check the server logs.`);
      }
      if (!response.ok) throw new Error(data.detail ? `${data.error || 'Transcript parsing failed'}: ${data.detail}` : data.error || 'Transcript parsing failed');
      const parsedCourses = data.courses ?? data.transcript?.parsedCourses ?? [];
      setCourses(parsedCourses);
      setMajor(data.detectedMajor ?? null);
      setSkills(parsedCourses.map((course: Course) => ({
        name: course.knowledgeArea || course.courseName || course.courseCode || 'Course knowledge',
        proficiency: gradeToScore(course.grade),
        source: 'TRANSCRIPT',
      })));
      setMessage(`Parsed ${parsedCourses.length} course${parsedCourses.length === 1 ? '' : 's'} from ${file.name}.`);
      setFile(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Transcript parsing failed');
    } finally {
      setBusy(false);
    }
  }

  const average = skills.length ? Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length) : 0;

  return (
    <div className="space-y-6">
      <section className="card-dark border-[#1b2947] bg-[#0c1426] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold text-white"><FileUp className="h-5 w-5 text-[#00d2ff]" /> Knowledge Map</h1>
            <p className="mt-1 text-xs text-slate-400">Upload real transcripts to map completed courses, grades, and knowledge gaps.</p>
          </div>
          {major && <span className="rounded-full border border-[#00d2ff]/30 bg-[#00d2ff]/10 px-3 py-1 text-xs font-semibold text-[#00d2ff]">Detected major: {major}</span>}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[140px_1fr_auto] sm:items-end">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic term
            <select value={yearLabel} onChange={(event) => setYearLabel(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#1b2b4c] bg-[#0e172a] px-3 text-xs text-slate-200 outline-none focus:border-[#00d2ff]">
              {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map((year) => <option key={year}>{year}</option>)}
            </select>
          </label>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Transcript PDF or image
            <span className="mt-1 flex h-10 cursor-pointer items-center rounded-lg border border-dashed border-[#1b2b4c] bg-[#0e172a] px-3 text-xs text-slate-300 hover:border-[#00d2ff]">{file?.name || 'Choose transcript'}
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            </span>
          </label>
          <button onClick={uploadTranscript} disabled={!file || busy} className="h-10 rounded-lg bg-[#00d2ff] px-4 text-xs font-bold text-[#080d1a] disabled:opacity-40">{busy ? 'Parsing...' : 'Upload & Parse'}</button>
        </div>
        {message && <p className="mt-3 text-xs text-[#34d399]">{message}</p>}
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
      </section>

      <section className="card-dark border-[#1b2947] bg-[#0c1426] p-6">
        <div className="flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-base font-bold text-white"><Sparkles className="h-4 w-4 text-[#34d399]" /> Your knowledge areas</h2><p className="mt-1 text-xs text-slate-400">Scores start from transcript grades and are refined after each quiz.</p></div><span className="text-2xl font-extrabold text-[#34d399]">{average}%</span></div>
        {skills.length === 0 ? <p className="mt-6 rounded-lg border border-dashed border-[#1b2947] p-6 text-center text-xs text-slate-500">Upload a transcript to generate your first map.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{skills.map((skill) => <div key={skill.name} className="rounded-lg border border-[#1b2947] bg-[#091120] p-4"><div className="flex justify-between gap-3 text-xs"><span className="font-semibold text-white">{skill.name}</span><span className="text-[#34d399]">{skill.proficiency}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#17253d]"><div className="h-full rounded-full bg-gradient-to-r from-[#00d2ff] to-[#34d399]" style={{ width: `${skill.proficiency}%` }} /></div><span className="mt-2 block text-[10px] text-slate-500">{skill.source === 'TRANSCRIPT' ? 'Transcript evidence' : 'Quiz evidence'}</span></div>)}</div>}
      </section>

      {courses.length > 0 && <section className="card-dark border-[#1b2947] bg-[#0c1426] p-6"><h2 className="text-base font-bold text-white">Mapped courses</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{courses.map((course, index) => <div key={`${course.courseCode || course.courseName}-${index}`} className="flex justify-between rounded-lg border border-[#1b2947] bg-[#091120] p-3 text-xs"><span className="text-slate-300">{course.courseCode ? `${course.courseCode} · ` : ''}{course.courseName || 'Unnamed course'}</span><span className="font-semibold text-[#00d2ff]">{course.grade ?? 'No grade'}</span></div>)}</div></section>}
      <QuizPanel userId={userId} />
    </div>
  );
}

function gradeToScore(grade: Course['grade']) {
  const normalized = String(grade ?? '').toUpperCase();
  if (normalized.startsWith('A')) return 90;
  if (normalized.startsWith('B')) return 75;
  if (normalized.startsWith('C')) return 60;
  if (normalized.startsWith('D')) return 45;
  const numeric = Number(grade);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : 50;
}
