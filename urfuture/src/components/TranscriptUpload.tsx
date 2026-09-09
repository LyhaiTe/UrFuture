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

  async function handleUpload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('userId', userId);
      form.append('yearLabel', yearLabel);
      form.append('file', file);
      const res = await fetch('/api/transcript/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onUploaded(data.transcript);
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-medium text-angkor-maroon">Upload a transcript (Year 1–4)</h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={yearLabel}
          onChange={(e) => setYearLabel(e.target.value)}
          className="rounded-md border border-black/15 px-2 py-1.5 text-sm"
        >
          {YEAR_OPTIONS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <input
          type="file"
          accept=".pdf,.csv,.txt"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          onClick={handleUpload}
          disabled={!file || busy}
          className="rounded-md bg-angkor-maroon px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {busy ? 'Uploading…' : 'Upload & parse'}
        </button>
      </div>
      <p className="mt-2 text-xs text-black/50">
        Upload every year's transcript you have — the diagnostic quiz and skill radar improve as coverage grows.
      </p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
