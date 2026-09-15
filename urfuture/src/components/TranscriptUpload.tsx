'use client';

import { useState } from 'react';

const YEAR_OPTIONS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Grade 10', 'Grade 11', 'Grade 12'];

export default function TranscriptUpload({
  userId,
  onUploaded,
}: {
  userId: string;
  onUploaded: (transcript: { id: string; fileName: string; status: string }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [yearLabel, setYearLabel] = useState(YEAR_OPTIONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const form = new FormData();
      form.append('userId', userId);
      form.append('yearLabel', yearLabel);
      form.append('file', file);
      const res = await fetch('/api/transcript/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUploaded(data.transcript);
      setSuccess(`Successfully parsed ${file.name} for ${yearLabel}!`);
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-dark p-6 border-[#1b2947] bg-[#0c1426]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00d2ff]" />
            Upload Coursework Transcripts
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload transcripts from Year 1–4 to generate tailored diagnostic quizzes and verify your skills.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#34d399] px-2.5 py-0.5 rounded-full bg-[#064e3b] border border-[#0d6d53]/50">
          AI Auto-Extraction
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-2">
        {/* Year Selector */}
        <div className="shrink-0">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Academic Term
          </label>
          <select
            value={yearLabel}
            onChange={(e) => setYearLabel(e.target.value)}
            className="w-full rounded-xl bg-[#0e172a] border border-[#1b2b4c] text-slate-200 px-3 py-2 text-xs font-semibold focus:border-[#00d2ff] outline-none"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* File Input Box */}
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Transcript File (.pdf, .png, .jpg, .jpeg)
          </label>
          <label className="flex items-center justify-between rounded-xl bg-[#0e172a] border border-dashed border-[#1b2b4c] hover:border-[#00d2ff] px-4 py-2 cursor-pointer transition-colors group">
            <span className="text-xs text-slate-300 truncate max-w-[220px]">
              {file ? file.name : 'Select or drop transcript file…'}
            </span>
            <span className="text-[11px] font-semibold text-[#00d2ff] group-hover:underline">
              Browse
            </span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>

        {/* Upload Button */}
        <div className="shrink-0 flex items-end">
          <button
            onClick={handleUpload}
            disabled={!file || busy}
            className="w-full sm:w-auto h-[38px] rounded-xl bg-[#00d2ff] hover:bg-[#00bfe6] disabled:opacity-40 text-[#080d1a] font-bold text-xs px-5 shadow-md shadow-[#00d2ff]/20 transition-all flex items-center justify-center gap-1.5"
          >
            {busy ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-[#080d1a] border-t-transparent rounded-full animate-spin" />
                Parsing courses…
              </>
            ) : (
              'Upload & Parse'
            )}
          </button>
        </div>
      </div>

      {success && (
        <div className="mt-3 p-2.5 rounded-lg bg-[#064e3b]/40 border border-[#0d6d53] text-[#34d399] text-xs flex items-center gap-2">
          <span>✓</span> {success}
        </div>
      )}

      {error && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}
