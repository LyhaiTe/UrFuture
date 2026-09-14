'use client';

import { useEffect, useState, useRef } from 'react';
import UrFutureLogo from '@/components/UrFutureLogo';
import DashboardWorkspace from '@/components/DashboardWorkspace';
import KnowledgeMapPanel from '@/components/KnowledgeMapPanel';
import CareerFitPanel from '@/components/CareerFitPanel';
import JobFitPanel from '@/components/JobFitPanel';
import ChatPanel from '@/components/ChatPanel';
import LandingPage from '@/components/authentication/LandingPage';
import StudentAuthModal from '@/components/authentication/StudentAuthModal';
import { StudentUser } from '@/types';

const TABS = [
  'Workspace',
  'Knowledge map',
  'Career paths',
  'Job fit',
] as const;

type Tab = (typeof TABS)[number];

const STORAGE_KEY = 'urfuture_active_student_session';

// Human-readable copy for the ?authError=<code> values the Google OAuth
// routes redirect back with (see src/app/api/auth/google/callback/route.ts).
const GOOGLE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  google_cancelled: 'Google sign-in was cancelled.',
  google_denied: 'Google denied the sign-in request.',
  google_email_unverified: 'That Google account\u2019s email isn\u2019t verified, so we can\u2019t sign you in with it.',
  google_state_mismatch: 'Your sign-in session expired before Google redirected back. Please try again.',
  google_missing_params: 'Something interrupted the Google sign-in redirect. Please try again.',
  google_exchange_failed: 'We couldn\u2019t complete sign-in with Google. Please try again.',
  google_not_configured: 'Google sign-in isn\u2019t available right now.',
};

export default function Home() {
  const [tab, setTab] = useState<Tab>('Workspace');
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isCopilotHovered, setIsCopilotHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [authBannerError, setAuthBannerError] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Restore saved student session
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not restore student session:', e);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('authError');

    if (!authError) {
      return;
    }

    const message = GOOGLE_AUTH_ERROR_MESSAGES[authError];

    if (message) {
      setAuthBannerError(message);

      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete('authError');
      window.history.replaceState({}, '', nextUrl.toString());
    }
  }, []);

  const handleAuthSuccess = (user: StudentUser) => {
    setCurrentUser(user);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save session locally', e);
    }

    setTab('Workspace');
  };

  const handleQuickDemo = async () => {
    try {
      const res = await fetch('/api/auth/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'demo',
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        handleAuthSuccess(data.user);
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      handleAuthSuccess({
        id: 'demo-student-id',
        name: 'Sokha Chea (Alex)',
        email: 'sokha.demo@camtech.edu.kh',
        role: 'STUDENT',
        educationLevel: 'UNIVERSITY_YEAR_3',
        institution: 'CamTech / ITC',
      });
    }
  };

  const handleLogOut = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }

    setCurrentUser(null);
    setIsUserMenuOpen(false);
    setTab('Workspace');
  };

  // Get initials for user avatar
  const getInitials = (name?: string) => {
    if (!name) {
      return 'ST';
    }

    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  // Initial loading screen
  if (isInitializing) {
    return (
      <main className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center text-slate-400">
        <div className="animate-pulse mb-4">
          <UrFutureLogo variant="icon-only" size="lg" />
        </div>

        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Loading UrFuture…
        </p>
      </main>
    );
  }

  // Landing page when user is not logged in
  if (!currentUser) {
    return (
      <>
        {authBannerError && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-md">
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-950/90 border border-red-800/60 text-red-200 text-xs shadow-2xl backdrop-blur-md">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1">{authBannerError}</span>
              <button onClick={() => setAuthBannerError(null)} className="text-red-300 hover:text-white shrink-0" aria-label="Dismiss">
                ✕
              </button>
            </div>
          </div>
        )}
        <LandingPage
          onOpenAuth={(mode) => {
            setAuthMode(mode);
            setIsAuthModalOpen(true);
          }}
          onQuickDemo={handleQuickDemo}
        />

        <StudentAuthModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Logged-in dashboard
  return (
    <div className="min-h-screen bg-[#080d1a] text-[#f1f5f9] flex flex-col">
      {/* ================================================================ */}
      {/* TOP NAVIGATION */}
      {/* ================================================================ */}

      <header className="sticky top-0 z-40 bg-[#080d1a]/90 backdrop-blur-md border-b border-[#142038] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Logo */}

        <div
          className="cursor-pointer"
          onClick={() => setTab('Workspace')}
        >
          <UrFutureLogo variant="navbar" />
        </div>

        {/* Desktop navigation */}

        <nav className="hidden md:flex items-center gap-1 bg-[#0c1424] border border-[#172640] p-1 rounded-xl">
          {TABS.map((t) => {
            const isActive = tab === t;

            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#14233e] text-[#00d2ff] shadow-sm border border-[#21385f]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b30]'
                }`}
              >
                {t}
              </button>
            );
          })}
        </nav>

        {/* Right controls */}

        <div className="flex items-center gap-3">
          {/* Notifications */}

          <button
            title="Notifications"
            className="w-9 h-9 rounded-full bg-[#0c1628] hover:bg-[#13223d] border border-[#1b2b4c] text-slate-300 hover:text-white flex items-center justify-center transition-colors relative"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            <span className="w-2 h-2 rounded-full bg-[#00d2ff] absolute top-2 right-2 ring-2 ring-[#080d1a]" />
          </button>

          {/* User profile */}

          <div
            className="relative"
            ref={userMenuRef}
          >
            <button
              onClick={() =>
                setIsUserMenuOpen(!isUserMenuOpen)
              }
              title={`${currentUser.name} (${currentUser.email})`}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#121e35] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10b981] to-[#00d2ff] text-[#080d1a] font-extrabold text-xs flex items-center justify-center shadow-md shadow-[#10b981]/25 select-none hover:scale-105 transition-transform">
                {getInitials(currentUser.name)}
              </div>

              <span className="hidden sm:inline-block text-xs font-semibold text-slate-300 max-w-[120px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>

              <svg
                className="w-3.5 h-3.5 text-slate-400 hidden sm:block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* User dropdown */}

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0c1424] border border-[#1d2d4c] shadow-2xl shadow-black/50 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-[#172540]">
                  <p className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </p>

                  <p className="text-[11px] text-slate-400 truncate">
                    {currentUser.email}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />

                    <span className="text-[10px] font-semibold text-[#00d2ff] truncate">
                      {currentUser.institution ||
                        'Cambodia Student'}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setTab('Workspace');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#14233e] flex items-center gap-2"
                  >
                    <span>🏠</span>
                    Workspace Dashboard
                  </button>

                  <button
                    onClick={() => {
                      handleQuickDemo();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#00d2ff] hover:bg-[#14233e] flex items-center gap-2"
                  >
                    <span>⚡</span>
                    Switch to Seeded Demo
                  </button>
                </div>

                <div className="border-t border-[#172540] pt-1">
                  <button
                    onClick={handleLogOut}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>

                    Sign Out &amp; Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================================================================ */}
      {/* MOBILE NAVIGATION */}
      {/* ================================================================ */}

      <div className="md:hidden flex overflow-x-auto px-4 py-2 gap-1.5 border-b border-[#142038] bg-[#0c1424]">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              tab === t
                ? 'bg-[#14233e] text-[#00d2ff] border border-[#21385f]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Workspace */}

        {tab === 'Workspace' && (
          <DashboardWorkspace
            userId={currentUser.id}
            studentName={currentUser.name}
            institution={currentUser.institution}
            onNavigateTab={setTab}
          />
        )}

        {/* Knowledge Map */}

        {tab === 'Knowledge map' && (
          <div className="flex flex-col gap-6">
            <KnowledgeMapPanel
              userId={currentUser.id}
            />
          </div>
        )}

        {/* Career Paths */}

        {tab === 'Career paths' && (
          <CareerFitPanel
            userId={currentUser.id}
          />
        )}

        {/* Job Fit */}

        {tab === 'Job fit' && (
          <JobFitPanel
            userId={currentUser.id}
          />
        )}
      </main>

      {/* Shared Copilot launcher remains visible while dashboard tabs change. */}
      <div className="fixed bottom-8 right-8 z-50">
        <div
          className={`absolute bottom-full right-0 mb-6 transition-all duration-300 ${
            isCopilotHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="relative">
            <div className="bg-white text-dark-bg px-8 py-4 rounded-[2rem] shadow-xl shadow-black/20 min-w-[220px]">
              <div className="text-center leading-tight">
                <div className="text-sm font-bold">Hello! ជំរាបសួរ!</div>
                <div className="text-sm font-bold mt-1">Need help?</div>
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none" aria-hidden="true">
                <path d="M2 0C2 0 8 14 12 14C16 14 22 0 22 0" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCopilotOpen(true)}
          onMouseEnter={() => setIsCopilotHovered(true)}
          onMouseLeave={() => setIsCopilotHovered(false)}
          aria-label="Open UrFuture Copilot"
          className="relative group animate-scale-in"
        >
          <div className="relative w-20 h-20 animate-float">
            <div className="absolute inset-0 bg-brand-cyan/30 rounded-3xl blur-xl animate-pulse" />
            <svg viewBox="0 0 80 80" className="w-full h-full drop-shadow-2xl animate-pulse-glow transition-transform group-hover:scale-110" aria-hidden="true">
              <defs>
                <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
              </defs>
              <rect x="10" y="15" width="60" height="50" rx="12" fill="url(#robotGradient)" />
              <line x1="40" y1="15" x2="40" y2="5" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />
              <circle cx="40" cy="5" r="3" fill="#10b981" className="animate-pulse" />
              <g className="animate-blink">
                <ellipse cx="28" cy="35" rx="8" ry="10" fill="#1e293b" />
                <circle cx="28" cy="35" r="5" fill="#10b981" />
                <circle cx="28" cy="35" r="2" fill="#ffffff" />
                <ellipse cx="52" cy="35" rx="8" ry="10" fill="#1e293b" />
                <circle cx="52" cy="35" r="5" fill="#10b981" />
                <circle cx="52" cy="35" r="2" fill="#ffffff" />
              </g>
              <rect x="30" y="52" width="20" height="4" rx="2" fill="#1e293b" />
              <rect x="5" y="25" width="5" height="30" rx="2" fill="#0891b2" />
              <rect x="70" y="25" width="5" height="30" rx="2" fill="#0891b2" />
            </svg>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-emerald rounded-full animate-ping" style={{ animationDuration: '3s' }} />
          </div>
        </button>
      </div>

      {/* ================================================================ */}
      {/* CHATBOT MODAL */}
      {/* ================================================================ */}

      {isCopilotOpen && (
        <ChatPanel
          userId={currentUser.id}
          isModal={true}
          onClose={() =>
            setIsCopilotOpen(false)
          }
        />
      )}

    </div>
  );
}