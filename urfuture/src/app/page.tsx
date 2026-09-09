'use client';

import { useEffect, useState } from 'react';
import ChatPanel from '@/components/ChatPanel';
import TranscriptUpload from '@/components/TranscriptUpload';
import QuizPanel from '@/components/QuizPanel';
import CareerFitPanel from '@/components/CareerFitPanel';
import JobFitPanel from '@/components/JobFitPanel';

const TABS = ['Chat', 'Transcripts & Quiz', 'Career Fit', 'Job Description Check'] as const;
type Tab = (typeof TABS)[number];

export default function Home() {
  const [tab, setTab] = useState<Tab>('Chat');
  const [transcriptCount, setTranscriptCount] = useState(0);
  // Prototype-level auth stand-in: fetches the seeded demo student's real
  // database id. Swap for real session auth (NextAuth, Clerk, etc.) before
  // shipping — see README "Auth".
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dev/demo-user')
      .then((r) => r.json())
      .then((d) => setUserId(d.userId));
  }, []);

  if (!userId) {
    return <main className="p-8 text-sm text-black/50">Loading demo session…</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <header className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-angkor-maroon">Phlouv</h1>
          <p className="text-sm text-black/60">AI career &amp; academic planning advisor for Cambodian students</p>
        </div>
        <span className="rounded-full bg-angkor-gold/20 px-3 py-1 text-xs text-angkor-maroon">Prototype</span>
      </header>

      <nav className="mb-6 flex gap-1 rounded-lg bg-black/5 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={
              'flex-1 rounded-md px-3 py-2 text-sm font-medium transition ' +
              (tab === t ? 'bg-white text-angkor-maroon shadow-sm' : 'text-black/60 hover:text-black')
            }
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Chat' && <ChatPanel userId={userId} />}

      {tab === 'Transcripts & Quiz' && (
        <div className="flex flex-col gap-4">
          <TranscriptUpload userId={userId} onUploaded={() => setTranscriptCount((c) => c + 1)} />
          <p className="text-xs text-black/50">{transcriptCount} transcript(s) uploaded this session.</p>
          <QuizPanel userId={userId} />
        </div>
      )}

      {tab === 'Career Fit' && <CareerFitPanel userId={userId} />}

      {tab === 'Job Description Check' && <JobFitPanel userId={userId} />}

      <footer className="mt-10 text-center text-[11px] text-black/40">
        Recommendations are decision support, not final decisions. High-stakes major or career transitions are
        flagged for a human counselor's sign-off before you should act on them.
      </footer>
    </main>
  );
}
