'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  AlertCircle, 
  Bell, 
  Bot, 
  ChevronDown, 
  X, 
  LayoutDashboard, 
  Map, 
  Compass, 
  Briefcase,
  Loader2
} from 'lucide-react';
import UrFutureLogo from '@/components/UrFutureLogo';
import DashboardWorkspace from '@/components/DashboardWorkspace';
import KnowledgeMapPanel from '@/components/KnowledgeMapPanel';
import CareerFitPanel from '@/components/CareerFitPanel';
import JobFitPanel from '@/components/JobFitPanel';
import ChatPanel from '@/components/ChatPanel';
import LandingPage from '@/components/authentication/LandingPage';
import StudentAuthModal from '@/components/authentication/StudentAuthModal';
import ThemeToggle from '@/components/ThemeToggle';
import { StudentUser } from '@/types';

const TABS = [
  { label: 'Workspace', icon: LayoutDashboard },
  { label: 'Knowledge map', icon: Map },
  { label: 'Career paths', icon: Compass },
  { label: 'Job fit', icon: Briefcase },
] as const;

type Tab = (typeof TABS)[number]['label'];

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
  const [showAssistantBubble, setShowAssistantBubble] = useState(true);

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

  useEffect(() => {
    if (!showAssistantBubble) return;

    const timer = window.setTimeout(() => {
      setShowAssistantBubble(false);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [showAssistantBubble]);

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
  // LOG OUT
  // ================================================================

  const handleLogOut = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
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

  const getInitials = (name?: string) => {
    if (!name) {
      return 'ST';
    }

    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // ================================================================
  // INITIAL LOADING SCREEN
  // ================================================================

  if (isInitializing) {
    return (
      <main className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center text-slate-400">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4">
            <UrFutureLogo variant="icon-only" size="lg" />
          </div>
          <Loader2 className="w-6 h-6 text-[#00d2ff] animate-spin mb-3" />
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Loading UrFuture…
          </p>
        </div>
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
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span className="flex-1">{authBannerError}</span>
              <button onClick={() => setAuthBannerError(null)} className="text-red-300 hover:text-white shrink-0" aria-label="Dismiss">
                <X className="w-4 h-4" />
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
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // ================================================================
  // LOGGED-IN DASHBOARD
  // ================================================================

  return (
    <div className="dashboard-shell min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex md:ml-64">
      
      {/* ============================================================ */}
      {/* LEFT SIDEBAR NAVIGATION (Fixed Desktop) */}
      {/* ============================================================ */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0c1424] border-r border-[#142038] h-screen fixed left-0 top-0 z-30 overflow-y-auto">
        {/* Logo */}
        <div className="p-6 cursor-pointer shrink-0" onClick={() => setTab('Workspace')}>
          <UrFutureLogo variant="navbar" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {TABS.map((t) => {
            const isActive = tab === t.label;
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setTab(t.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#14233e] text-[#00d2ff] border border-[#21385f] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#101b30]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info Summary */}
        <div className="p-4 border-t border-[#142038] shrink-0">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10b981] to-[#00d2ff] text-[#080d1a] font-extrabold text-xs flex items-center justify-center shadow-md shadow-[#10b981]/25 select-none">
              {getInitials(currentUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {currentUser.name.split(' ')[0]}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentUser.institution || 'Student'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* TOP HEADER (Right Controls Only) */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-end gap-3">
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Notifications */}
            <button
              type="button"
              title="Notifications"
              className="w-9 h-9 rounded-full bg-[#0c1628] hover:bg-[#13223d] border border-[#1b2b4c] text-slate-300 hover:text-white flex items-center justify-center transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#00d2ff] absolute top-2 right-2 ring-2 ring-[#080d1a]" />
            </button>

            {/* USER PROFILE DROPDOWN */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                title={`${currentUser.name} (${currentUser.email})`}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#121e35] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#10b981] to-[#00d2ff] text-[#080d1a] font-extrabold text-xs flex items-center justify-center shadow-md shadow-[#10b981]/25 select-none hover:scale-105 transition-transform">
                  {getInitials(currentUser.name)}
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-300 max-w-[120px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-[340px] overflow-hidden rounded-2xl border border-[#203454] bg-[#0d1627] shadow-2xl shadow-black/50 z-50 animate-fadeIn">
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
                        {currentUser.institution || 'Cambodia Student'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('Workspace');
                        setIsUserMenuOpen(false);
                      }}
                      className="group w-full flex items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium text-slate-200 hover:text-white hover:bg-[#14233e] transition-all"
                    >
                      <span>Workspace Dashboard</span>
                      <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors rotate-[-90deg]" />
                    </button>

                  </div>

                  <div className="border-t border-[#203454] p-3">
                    <button
                      type="button"
                      onClick={handleLogOut}
                      className="w-full flex items-center rounded-xl px-4 py-3.5 text-left text-sm font-medium text-[#ff6b72] hover:bg-red-500/10 hover:text-[#ff7d83] transition-all"
                    >
                      Sign Out &amp; Return to Home
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MOBILE NAVIGATION (Horizontal Scroll) */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 gap-1.5 border-b border-[#142038] bg-[#0c1424]">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => setTab(t.label)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  tab === t.label
                    ? 'bg-[#14233e] text-[#00d2ff] border border-[#21385f]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
          {tab === 'Workspace' && (
            <DashboardWorkspace
              userId={currentUser.id}
              studentName={currentUser.name}
              institution={currentUser.institution}
              onNavigateTab={setTab}
              onOpenCopilot={() => setIsCopilotOpen(true)}
            />
          )}

          {tab === 'Knowledge map' && (
            <KnowledgeMapPanel userId={currentUser.id} />
          )}

          {tab === 'Career paths' && (
            <CareerFitPanel userId={currentUser.id} />
          )}

          {tab === 'Job fit' && (
            <JobFitPanel userId={currentUser.id} />
          )}
        </main>

        {/* GLOBAL AI ASSISTANT BUTTON */}
        {!isCopilotOpen && showAssistantBubble && (
          <div className="fixed bottom-24 right-20 z-40 animate-[fadeIn_0.2s_ease-out]">
            <div className="relative rounded-full bg-slate-950/90 px-4 py-2 text-xs font-medium text-cyan-100 shadow-lg shadow-cyan-500/15 ring-1 ring-cyan-400/20">
              Hello, do you need my help?
              <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 bg-slate-950/90 ring-1 ring-cyan-400/20" />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setShowAssistantBubble(false);
            setIsCopilotOpen(true);
          }}
          title="Open UrFuture Assistant"
          aria-label="Open UrFuture Assistant"
          className="
            fixed
            bottom-6
            right-6
            z-40
            h-14
            w-14
            rounded-full
            flex
            items-center
            justify-center
            bg-[#00c9f5]
            border-4
            border-[#0b1f2d]
            shadow-[0_0_20px_rgba(0,201,245,0.28)]
            hover:scale-105
            hover:bg-[#12d4ff]
            transition-all
            duration-200
            active:scale-95
          "
        >
          <Bot className="h-6 w-6 text-white" strokeWidth={2} />
        </button>

        {/* CHATBOT MODAL */}
        {isCopilotOpen && (
          <ChatPanel
            userId={currentUser.id}
            studentName={currentUser.name}
            userName={currentUser.name}
            isModal={true}
            onClose={() => setIsCopilotOpen(false)}
          />
        )}
      </div>
    </div>
  );
}