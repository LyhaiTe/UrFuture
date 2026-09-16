'use client';

import React, { useState } from 'react';
import { AlertCircle, Globe, X } from 'lucide-react';
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

    if (
      mode === 'register' &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
    ) {
      setError(
        'Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and symbol'
      );
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
          password,
          name: mode === 'register' ? name : undefined,
          institution: mode === 'register' ? institution : undefined,
          educationLevel: mode === 'register' ? educationLevel : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onSuccess(data.user);
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch {
      setError('Unable to reach the authentication service. Please try again.');
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

      <div className="relative w-full max-w-md bg-dark-card border border-dark-border rounded-2xl shadow-2xl shadow-brand-cyan/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Centered Logo Header */}
        <div className="flex items-center justify-center relative px-6 py-5 border-b border-dark-border bg-dark-surface/80">
          <UrFutureLogo variant="navbar" />
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-lg bg-dark-surface text-slate-400 hover:text-brand-cyan hover:bg-brand-cyan/10 hover:border-brand-cyan/30 border border-transparent hover:shadow-sm transition-all duration-200"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin flex-1">
          {/* Mode Toggle */}
          <div className="flex bg-dark-bg p-1 rounded-xl border border-dark-border mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-dark-cardHover text-brand-cyan border border-dark-borderLight shadow-sm'
                  : 'text-slate-400 hover:text-brand-cyan hover:bg-brand-cyan/5'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-dark-cardHover text-brand-cyan border border-dark-borderLight shadow-sm'
                  : 'text-slate-400 hover:text-brand-cyan hover:bg-brand-cyan/5'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
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
                  className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-600"
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
                className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-600"
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
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                    >
                      {INSTITUTIONS.map((inst) => (
                        <option key={inst} value={inst} className="bg-dark-surface">
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
                      className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                    >
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl.value} value={lvl.value} className="bg-dark-surface">
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                className="w-full px-4 py-2.5 rounded-xl bg-dark-surface border border-dark-border text-white text-sm focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan/20 transition-all placeholder:text-slate-600"
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
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-70 disabled:cursor-wait hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm shadow-sm border border-slate-200 hover:border-slate-300"
              >
                {isGoogleRedirecting ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Globe className="w-5 h-5 shrink-0" />
                )}
                <span>{isGoogleRedirecting ? 'Redirecting…' : 'Continue with Google'}</span>
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-bg font-extrabold text-sm shadow-lg shadow-brand-cyan/25 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-cyan/30 active:translate-y-0 active:shadow-lg disabled:opacity-70 disabled:cursor-wait"
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