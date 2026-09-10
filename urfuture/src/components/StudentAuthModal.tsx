'use client';

import React, { useState } from 'react';
import UrFutureLogo from './UrFutureLogo';
import { StudentUser } from '@/types';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: StudentUser) => void;
  initialMode?: 'login' | 'register';
}

const INSTITUTIONS = [
  'Institute of Technology of Cambodia (ITC)',
  'Royal University of Phnom Penh (RUPP)',
  'Cambodia Academy of Digital Technology (CADT)',
  'CamTech University',
  'Paragon International University',
  'American University of Phnom Penh (AUPP)',
  'National University of Management (NUM)',
  'Phnom Penh High School (Senior)',
  'Provincial High School (Grade 11/12)',
  'Other Institution / International',
];

const EDUCATION_LEVELS = [
  { value: 'HS_SENIOR', label: 'High School Senior (Grade 12)' },
  { value: 'HS_JUNIOR', label: 'High School Junior (Grade 11)' },
  { value: 'UNIVERSITY_YEAR_1', label: 'University — Year 1 (Freshman)' },
  { value: 'UNIVERSITY_YEAR_2', label: 'University — Year 2 (Sophomore)' },
  { value: 'UNIVERSITY_YEAR_3', label: 'University — Year 3 (Junior)' },
  { value: 'UNIVERSITY_YEAR_4', label: 'University — Year 4 (Senior)' },
  { value: 'GRADUATE', label: 'Graduate / Early Professional' },
];

// NEW: Academic Track Options
const ACADEMIC_TRACKS = [
  { value: 'EXACT_SCIENCE', label: 'Exact Sciences (STEM: IT, Engineering, Math, Science)' },
  { value: 'SOCIAL_SCIENCE', label: 'Social Sciences (Business, Humanities, Arts, Law, Education)' },
];

export default function StudentAuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}: StudentAuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [institution, setInstitution] = useState(INSTITUTIONS[0]);
  const [educationLevel, setEducationLevel] = useState(EDUCATION_LEVELS[2].value);
  const [academicTrack, setAcademicTrack] = useState(ACADEMIC_TRACKS[0].value); // NEW STATE
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'demo' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Demo login failed');
      }
    } catch (e: any) {
      // Fallback
      onSuccess({
        id: 'demo-student-id',
        name: 'Sokha Chea (Alex)',
        email: 'sokha.demo@camtech.edu.kh',
        role: 'STUDENT',
        educationLevel: 'UNIVERSITY_YEAR_3',
        institution: 'CamTech / ITC',
        academicTrack: 'EXACT_SCIENCE', // Added for demo
      } as StudentUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (mode === 'register' && !name) {
      setError('Please provide your full name');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode,
          email,
          name: mode === 'register' ? name : undefined,
          institution: mode === 'register' ? institution : undefined,
          educationLevel: mode === 'register' ? educationLevel : undefined,
          academicTrack: mode === 'register' ? academicTrack : undefined, // Added
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      // Offline fallback
      const studentUser: StudentUser = {
        id: `student-${Date.now().toString(36)}`,
        name: name || email.split('@')[0] || 'Student',
        email: email,
        role: 'STUDENT',
        institution: institution,
        educationLevel: educationLevel,
        academicTrack: academicTrack, // Added
      } as StudentUser;
      onSuccess(studentUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute w-96 h-96 bg-[#00d2ff]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-[#0c1424] border border-[#1e2f4f] rounded-2xl shadow-2xl shadow-[#00d2ff]/10 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#172540] bg-[#090f1c]/80">
          <UrFutureLogo variant="navbar" />
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#142038] hover:bg-[#1f3154] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin flex-1">
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#00d2ff]/15 via-[#10b981]/15 to-[#00d2ff]/10 border border-[#00d2ff]/30 shadow-lg">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider">
                  Fast 1-Click Access
                </span>
              </div>
              <span className="text-[11px] bg-[#14233e] text-slate-300 font-medium px-2 py-0.5 rounded-md border border-[#233a63]">
                Preloaded Data
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Explore the full system immediately with demo student Sokha (Alex) — includes transcripts, diagnostic quiz results, and verified career pathways.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00d2ff] to-[#00a8e8] hover:from-[#38dfff] hover:to-[#00b9ff] text-[#070d1a] font-extrabold text-xs sm:text-sm shadow-md shadow-[#00d2ff]/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 text-[#070d1a]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              )}
              Launch Demo Student Session
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-[#1b2b48]" />
            <span className="flex-shrink mx-4 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              Or Sign In With Account
            </span>
            <div className="flex-grow border-t border-[#1b2b48]" />
          </div>

          <div className="flex bg-[#080d1a] p-1 rounded-xl border border-[#192742] mb-5">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[#15233d] text-[#00d2ff] border border-[#233a63] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[#15233d] text-[#00d2ff] border border-[#233a63] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Free Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-[#00d2ff]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sokha Chea or Alex Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#090f1c] border border-[#1b2b48] text-white text-xs focus:outline-none focus:border-[#00d2ff] transition-colors placeholder:text-slate-600"
                  required={mode === 'register'}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student Email <span className="text-[#00d2ff]">*</span>
              </label>
              <input
                type="email"
                placeholder="student@itc.edu.kh or your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090f1c] border border-[#1b2b48] text-white text-xs focus:outline-none focus:border-[#00d2ff] transition-colors placeholder:text-slate-600"
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    University / High School
                  </label>
                  <select
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090f1c] border border-[#1b2b48] text-white text-xs focus:outline-none focus:border-[#00d2ff] transition-colors"
                  >
                    {INSTITUTIONS.map((inst) => (
                      <option key={inst} value={inst} className="bg-[#0c1424]">
                        {inst}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Current Academic Level
                  </label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090f1c] border border-[#1b2b48] text-white text-xs focus:outline-none focus:border-[#00d2ff] transition-colors"
                  >
                    {EDUCATION_LEVELS.map((lvl) => (
                      <option key={lvl.value} value={lvl.value} className="bg-[#0c1424]">
                        {lvl.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* NEW: Academic Track Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Track <span className="text-[#00d2ff]">*</span>
                  </label>
                  <select
                    value={academicTrack}
                    onChange={(e) => setAcademicTrack(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#090f1c] border border-[#1b2b48] text-white text-xs focus:outline-none focus:border-[#00d2ff] transition-colors"
                  >
                    {ACADEMIC_TRACKS.map((track) => (
                      <option key={track.value} value={track.value} className="bg-[#0c1424]">
                        {track.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-[#00d2ff]/80 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#090f1c] border border-[#1b2b48] text-white text-xs focus:outline-none focus:border-[#00d2ff] transition-colors placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#14233e] hover:bg-[#1c3259] text-[#00d2ff] hover:text-white font-bold text-xs sm:text-sm border border-[#21385f] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{mode === 'login' ? 'Sign In to UrFuture' : 'Register & Enter Dashboard'}</span>
              )}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500 mt-4 leading-relaxed">
            By continuing, you agree to UrFuture's Academic Privacy Protocol. All student transcript data is securely processed with cited Cambodian O*NET/ILOSTAT grounding.
          </p>
        </div>
      </div>
    </div>
  );
}