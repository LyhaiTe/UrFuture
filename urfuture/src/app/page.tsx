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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authBannerError, setAuthBannerError] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // ================================================================
  // RESTORE SAVED STUDENT SESSION
  // ================================================================

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
      console.warn(
        'Could not restore student session:',
        e
      );
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // ================================================================
  // CLOSE USER MENU WHEN CLICKING OUTSIDE
  // ================================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(
          event.target as Node
        )
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, []);

  // ================================================================
  // AUTH SUCCESS
  // ================================================================

  const handleAuthSuccess = (
    user: StudentUser
  ) => {
    setCurrentUser(user);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(user)
      );
    } catch (e) {
      console.warn(
        'Failed to save session locally',
        e
      );
    }

    setTab('Workspace');
  };

  // ================================================================
  // QUICK DEMO
  // ================================================================

  const handleQuickDemo = async () => {
    try {
      const res = await fetch(
        '/api/auth/student',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            action: 'demo',
          }),
        }
      );

      const data = await res.json();

      if (data.success && data.user) {
        handleAuthSuccess(data.user);
      } else {
        throw new Error(
          'Fallback needed'
        );
      }
    } catch {
      handleAuthSuccess({
        id: 'demo-student-id',
        name: 'Sokha Chea (Alex)',
        email:
          'sokha.demo@camtech.edu.kh',
        role: 'STUDENT',
        educationLevel:
          'UNIVERSITY_YEAR_3',
        institution: 'CamTech / ITC',
      });
    }
  };

  // ================================================================
  // LOG OUT
  // ================================================================

  const handleLogOut = () => {
    try {
      localStorage.removeItem(
        STORAGE_KEY
      );
    } catch (e) {
      console.warn(e);
    }

    setCurrentUser(null);
    setIsUserMenuOpen(false);
    setIsCopilotOpen(false);
    setTab('Workspace');
  };

  // ================================================================
  // GET USER INITIALS
  // ================================================================

  const getInitials = (
    name?: string
  ) => {
    if (!name) {
      return 'ST';
    }

    const parts = name
      .trim()
      .split(' ');

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();
  };

  // ================================================================
  // INITIAL LOADING SCREEN
  // ================================================================

  if (isInitializing) {
    return (
      <main className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center text-slate-400">
        <div className="animate-pulse mb-4">
          <UrFutureLogo
            variant="icon-only"
            size="lg"
          />
        </div>

        <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Loading UrFuture…
        </p>
      </main>
    );
  }

  // ================================================================
  // LANDING PAGE
  // ================================================================

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
        />

        <StudentAuthModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() =>
            setIsAuthModalOpen(false)
          }
          onSuccess={
            handleAuthSuccess
          }
        />
      </>
    );
  }

  // ================================================================
  // LOGGED-IN DASHBOARD
  // ================================================================

  return (
    <div className="min-h-screen bg-[#080d1a] text-[#f1f5f9] flex flex-col">

      {/* ============================================================ */}
      {/* TOP NAVIGATION */}
      {/* ============================================================ */}

      <header className="sticky top-0 z-40 bg-[#080d1a]/90 backdrop-blur-md border-b border-[#142038] px-4 sm:px-8 py-3.5 flex items-center justify-between">

        {/* Logo */}

        <div
          className="cursor-pointer"
          onClick={() =>
            setTab('Workspace')
          }
        >
          <UrFutureLogo variant="navbar" />
        </div>

        {/* Desktop Navigation */}

        <nav className="hidden md:flex items-center gap-1 bg-[#0c1424] border border-[#172640] p-1 rounded-xl">
          {TABS.map((t) => {
            const isActive =
              tab === t;

            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setTab(t)
                }
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

        {/* Right Controls */}

        <div className="flex items-center gap-3">

          {/* Notifications */}

          <button
            type="button"
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

          {/* ======================================================== */}
          {/* USER PROFILE */}
          {/* ======================================================== */}

          <div
            className="relative"
            ref={userMenuRef}
          >
            <button
              type="button"
              onClick={() =>
                setIsUserMenuOpen(
                  !isUserMenuOpen
                )
              }
              title={`${currentUser.name} (${currentUser.email})`}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#121e35] transition-colors"
            >
              {/* Avatar */}

              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10b981] to-[#00d2ff] text-[#080d1a] font-extrabold text-xs flex items-center justify-center shadow-md shadow-[#10b981]/25 select-none hover:scale-105 transition-transform">
                {getInitials(
                  currentUser.name
                )}
              </div>

              {/* Name */}

              <span className="hidden sm:inline-block text-xs font-semibold text-slate-300 max-w-[120px] truncate">
                {
                  currentUser.name.split(
                    ' '
                  )[0]
                }
              </span>

              {/* Dropdown Arrow */}

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

            {/* ====================================================== */}
            {/* USER DROPDOWN */}
            {/* ====================================================== */}

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-3 w-[340px] overflow-hidden rounded-2xl border border-[#203454] bg-[#0d1627] shadow-2xl shadow-black/50 z-50 animate-fadeIn">

                {/* User Information */}

                <div className="px-6 py-5 border-b border-[#203454]">
                  <p className="text-lg font-bold text-white truncate">
                    {currentUser.name}
                  </p>

                  <p className="mt-1 text-sm text-slate-400 truncate">
                    {currentUser.email}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0" />

                    <span className="text-sm font-medium text-slate-200 truncate">
                      {currentUser.institution ||
                        'Cambodia Student'}
                    </span>
                  </div>
                </div>

                {/* Navigation Options */}

                <div className="p-3">

                  {/* Workspace Dashboard */}

                  <button
                    type="button"
                    onClick={() => {
                      setTab(
                        'Workspace'
                      );

                      setIsUserMenuOpen(
                        false
                      );
                    }}
                    className="group w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium text-slate-200 hover:text-white hover:bg-[#14233e] transition-all"
                  >
                    <span>
                      Workspace Dashboard
                    </span>

                    <svg
                      className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* Switch Demo */}

                  <button
                    type="button"
                    onClick={() => {
                      handleQuickDemo();

                      setIsUserMenuOpen(
                        false
                      );
                    }}
                    className="group mt-1 w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium text-slate-200 hover:text-white hover:bg-[#14233e] transition-all"
                  >
                    <span>
                      Switch to Seeded Demo
                    </span>

                    <svg
                      className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Sign Out */}

                <div className="border-t border-[#203454] p-3">
                  <button
                    type="button"
                    onClick={
                      handleLogOut
                    }
                    className="w-full flex items-center rounded-xl px-4 py-3.5 text-left text-sm font-medium text-[#ff6b72] hover:bg-red-500/10 hover:text-[#ff7d83] transition-all"
                  >
                    Sign Out &amp;
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE NAVIGATION */}
      {/* ============================================================ */}

      <div className="md:hidden flex overflow-x-auto px-4 py-2 gap-1.5 border-b border-[#142038] bg-[#0c1424]">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() =>
              setTab(t)
            }
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

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">

        {/* Workspace */}

        {tab === 'Workspace' && (
          <DashboardWorkspace
            userId={
              currentUser.id
            }
            studentName={
              currentUser.name
            }
            institution={
              currentUser.institution
            }
            onNavigateTab={
              setTab
            }
            onOpenCopilot={() =>
              setIsCopilotOpen(
                true
              )
            }
          />
        )}

        {/* ======================================================== */}
        {/* KNOWLEDGE MAP */}
        {/* ======================================================== */}

        {tab ===
          'Knowledge map' && (
          <KnowledgeMapPanel
            userId={
              currentUser.id
            }
          />
        )}

        {/* ======================================================== */}
        {/* CAREER PATHS */}
        {/* ======================================================== */}

        {tab ===
          'Career paths' && (
          <CareerFitPanel
            userId={
              currentUser.id
            }
          />
        )}

        {/* ======================================================== */}
        {/* JOB FIT */}
        {/* ======================================================== */}

        {tab === 'Job fit' && (
          <JobFitPanel
            userId={
              currentUser.id
            }
          />
        )}
      </main>

      {/* ============================================================ */}
      {/* GLOBAL AI ASSISTANT BUTTON */}
      {/* ============================================================ */}

      <button
        type="button"
        onClick={() =>
          setIsCopilotOpen(true)
        }
        title="Open UrFuture Assistant"
        aria-label="Open UrFuture Assistant"
        className="
          fixed
          bottom-6
          right-6
          z-40
          w-16
          h-16
          rounded-full
          flex
          items-center
          justify-center
          bg-[#00c9f5]
          border-[10px]
          border-[#0d3045]
          shadow-[0_0_30px_rgba(0,210,255,0.35)]
          hover:scale-105
          hover:bg-[#12d4ff]
          transition-all
          duration-200
        "
      >
        <svg
          className="w-7 h-7 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="5"
            y="8"
            width="14"
            height="10"
            rx="3"
          />

          <path d="M12 4v4" />
          <path d="M9 4h6" />

          <circle
            cx="9"
            cy="13"
            r="1"
            fill="currentColor"
          />

          <circle
            cx="15"
            cy="13"
            r="1"
            fill="currentColor"
          />

          <path d="M9 16h6" />
        </svg>
      </button>

      {/* ============================================================ */}
      {/* CHATBOT MODAL */}
      {/* ============================================================ */}

      {isCopilotOpen && (
        <ChatPanel
          userId={
            currentUser.id
          }
          isModal={true}
          onClose={() =>
            setIsCopilotOpen(
              false
            )
          }
        />
      )}

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}

      <footer className="mt-auto border-t border-[#142038] py-6 px-4 text-center text-xs text-slate-500">
        <p>
          UrFuture — Learn • Plan •
          Achieve. Decision support
          &amp; grounded career
          pathways for students.
        </p>
      </footer>
    </div>
  );
}