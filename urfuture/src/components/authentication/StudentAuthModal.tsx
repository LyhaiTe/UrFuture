'use client';

import React, { useState } from 'react';
import UrFutureLogo from 'src/components/UrFutureLogo';
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
  const [academicTrack, setAcademicTrack] = useState(ACADEMIC_TRACKS[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleRedirecting, setIsGoogleRedirecting] = useState(false);

  if (!isOpen) return null;

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
          academicTrack: mode === 'register' ? academicTrack : undefined,
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
        academicTrack: academicTrack,
      } as StudentUser;
      onSuccess(studentUser);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute w-96 h-96 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />

      {(loading || isGoogleRedirecting) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-14 h-14 border-4 border-slate-700 border-t-brand-cyan rounded-full animate-spin" />
        </div>
      )}

      <div className="relative w-full max-w-md bg-dark-panel border border-dark-borderPanelHover rounded-2xl shadow-2xl shadow-brand-cyan/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Centered Logo Header */}
        <div className="flex items-center justify-center relative px-6 py-5 border-b border-dark-divider bg-dark-panelAlt/80">
          <UrFutureLogo variant="navbar" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-dark-borderSubtle hover:bg-dark-cardHover text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin flex-1">
          {/* Mode Toggle */}
          <div className="flex bg-dark-bg p-1 rounded-xl border border-dark-divider mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-dark-cardHover text-brand-cyan border border-dark-borderPanelHover shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-dark-cardHover text-brand-cyan border border-dark-borderPanelHover shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-3">
              <svg className="w-4 h-4 shrink-0 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sokha Chea"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-panelAlt border border-dark-borderPanel text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-600"
                  required={mode === 'register'}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="student@university.edu.kh"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-panelAlt border border-dark-borderPanel text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-600"
                required
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Institution
                    </label>
                    <select
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-panelAlt border border-dark-borderPanel text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                    >
                      {INSTITUTIONS.map((inst) => (
                        <option key={inst} value={inst} className="bg-dark-panel">
                          {inst}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Academic Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-panelAlt border border-dark-borderPanel text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                    >
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value} className="bg-dark-panel">
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Academic Track
                  </label>
                  <select
                    value={academicTrack}
                    onChange={(e) => setAcademicTrack(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-dark-panelAlt border border-dark-borderPanel text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                  >
                    {ACADEMIC_TRACKS.map((track) => (
                      <option key={track.value} value={track.value} className="bg-dark-panel">
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
                  <span className="text-[11px] text-brand-cyan hover:text-brand-cyanBright cursor-pointer transition-colors">
                    Forgot password?
                  </span>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-panelAlt border border-dark-borderPanel text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Google Button - Positioned below password, above submit */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsGoogleRedirecting(true);
                  window.location.href = '/api/auth/student/google';
                }}
                disabled={isGoogleRedirecting || loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-70 disabled:cursor-wait hover:scale-[1.01] active:scale-[0.99] shadow-sm border border-slate-200"
              >
                {isGoogleRedirecting ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                )}
                <span>{isGoogleRedirecting ? 'Redirecting…' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-bg font-extrabold text-sm shadow-lg shadow-brand-cyan/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-wait"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{mode === 'login' ? 'Sign In' : 'Create Account & Continue'}</span>
              )}
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-500 mt-6 leading-relaxed px-2">
            By continuing, you agree to UrFuture's Academic Privacy Protocol. All student data is securely processed with cited Cambodian O*NET/ILOSTAT grounding.
          </p>
        </div>
      </div>
    </div>
  );
}