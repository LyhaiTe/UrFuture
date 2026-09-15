'use client';

import React, { useState } from 'react';
import UrFutureLogo from 'src/components/UrFutureLogo';
import ThemeToggle from '@/components/ThemeToggle';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'grounding', label: 'Grounded Data' },
  { id: 'testimonials', label: 'Student Stories' },
];

const UNIVERSITY_LOGOS = [
  { name: 'ITC', url: 'https://upload.wikimedia.org/wikipedia/en/f/f7/Institute_of_Technology_of_Cambodia_logo.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original' },
  { name: 'RUPP', url: 'https://thumb.wikimedia.org/wikipedia/km/thumb/e/ee/Rupp_logo.png/250px-Rupp_logo.png?utm_source=km.wikipedia.org&utm_campaign=index&utm_content=thumbnail' },
  { name: 'CamTech', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzK0IehsGoXXZ-Xmz-IefIFBiCHCCEbZr0mgk-TzUd6SCJD8Z0qXDzsto&s=10' },
  { name: 'CADT', url: 'https://www.cadt.edu.kh/wp-content/uploads/2023/02/cadt_square_logo_boundary.jpg' },
  { name: 'Paragon', url: 'https://cdn.brandfetch.io/domain/paragoniu.edu.kh/fallback/lettermark/theme/dark/h/400/w/400/icon?c=1bfwsmEH20zzEfSNTed' },
  { name: 'AUPP', url: 'https://www.aupp.edu.kh/wp-content/uploads/AUPP-Block-Logo.png' },
  { name: 'SETECH', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1PKaqhQAVcIQN_T_pCcuwYEoa5TxUyMkNajFZ7NuolB6EbN_Cprnt0js&s=10' },
  { name: 'IT Academy STEP', url: 'https://bongsrey.sgp1.digitaloceanspaces.com/library/820/images/6167cbee8833d.png' },
];

export default function LandingPage({ onOpenAuth }: LandingPageProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col selection:bg-brand-cyan/30 selection:text-white">
      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll-left 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .logo-item:hover {
          filter: brightness(1.3) drop-shadow(0 0 20px rgba(6, 182, 212, 0.6));
          transform: scale(1.1);
        }
      `}</style>

      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-brand-emerald/8 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-brand-blueAmbient/10 rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-dark-borderSubtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <UrFutureLogo variant="navbar" />
            </div>

            <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-slate-400">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="landing-nav-link select-none relative py-1.5 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-brand-cyan transition-all duration-200 group-hover:w-full" />
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => onOpenAuth('login')}
                className="px-5 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-bg text-sm font-extrabold shadow-lg shadow-brand-cyan/25 transition-all hover:scale-105 active:scale-95"
              >
                Student Sign In
              </button>

              <button
                onClick={() => setIsMobileNavOpen((open) => !open)}
                aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileNavOpen}
                className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dark-navSurface hover:bg-dark-cardHover border border-dark-borderPanelHover text-slate-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMobileNavOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav panel */}
        {isMobileNavOpen && (
          <div className="lg:hidden border-t border-dark-borderSubtle bg-dark-bg/95 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="landing-nav-link select-none text-left px-4 py-3 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-dark-navSurface transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left Content */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
                Turn Your Academic Transcripts Into{' '}
                <span className="bg-gradient-to-r from-brand-cyan via-brand-cyanLight to-brand-mint bg-clip-text text-transparent">
                  Grounded Career Pathways
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl">
                Upload past coursework from Year 1–4, benchmark your knowledge with adaptive AI diagnostic quizzes, match against real Cambodian & regional industry demand, and build a personalized prep roadmap.
              </p>

              <button
                onClick={() => onOpenAuth('register')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-textOnBrand font-extrabold text-sm shadow-xl shadow-brand-cyan/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                <span>Get Started</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Right Content: Robot Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-brand-cyan/20 blur-[120px] rounded-full scale-75 pointer-events-none" />
                <img 
                  src="https://static.vecteezy.com/system/resources/previews/067/220/975/non_2x/cute-ai-robot-chatbot-reading-a-book-on-transparent-background-free-png.png" 
                  alt="AI Career Advisor Robot" 
                  className="relative z-10 w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[450px] drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-12 border-t border-b border-dark-borderSubtle/80 bg-dark-bg/50 backdrop-blur-sm">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-8 text-center">
          Trusted by Students Across Cambodia's Top Institutions
        </p>
        
        <div className="relative w-full overflow-hidden">
          <div className="flex animate-scroll">
            <div className="flex items-center gap-12 sm:gap-16 px-4 flex-shrink-0">
              {UNIVERSITY_LOGOS.map((uni) => (
                <div 
                  key={uni.name}
                  className="logo-item flex-shrink-0 p-5 rounded-xl bg-dark-panel/60 border border-dark-borderPanel/60 hover:border-brand-cyan/50 transition-all duration-300"
                >
                  <img 
                    src={uni.url}
                    alt={`${uni.name} logo`}
                    className="h-20 sm:h-24 w-auto object-contain filter brightness-100 contrast-110 transition-all duration-300"
                    style={{ background: 'transparent' }}
                  />
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-12 sm:gap-16 px-4 flex-shrink-0">
              {UNIVERSITY_LOGOS.map((uni) => (
                <div 
                  key={`${uni.name}-duplicate`}
                  className="logo-item flex-shrink-0 p-5 rounded-xl bg-dark-panel/60 border border-dark-borderPanel/60 hover:border-brand-cyan/50 transition-all duration-300"
                >
                  <img 
                    src={uni.url}
                    alt={`${uni.name} logo`}
                    className="h-20 sm:h-24 w-auto object-contain filter brightness-100 contrast-110 transition-all duration-300"
                    style={{ background: 'transparent' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-dark-card/80 backdrop-blur-xl border border-dark-border rounded-2xl p-8 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-xl bg-dark-surface border border-dark-border hover:border-brand-cyan/50 transition-all group">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-white mb-2">1. Upload Transcripts</h4>
                <p className="text-sm text-slate-400">Securely parse your academic history into structured data.</p>
              </div>

              <div className="p-6 rounded-xl bg-dark-surface border border-dark-border hover:border-brand-emerald/50 transition-all group">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-white mb-2">2. AI Knowledge Mapping</h4>
                <p className="text-sm text-slate-400">Adaptive quizzes verify your true competency, not just grades.</p>
              </div>

              <div className="p-6 rounded-xl bg-dark-surface border border-dark-border hover:border-brand-violet/50 transition-all group">
                <div className="w-16 h-16 mx-auto rounded-full bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-brand-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-white mb-2">3. Grounded Career Match</h4>
                <p className="text-sm text-slate-400">Get personalized roadmaps backed by real Cambodian market data.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Why UrFuture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">Everything You Need to Plan What's Next</h2>
            <p className="text-slate-400 text-base">
              One workspace that turns your academic history into a grounded, evidence-backed plan for the years ahead.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-cyan/50 shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Transcript-Grounded Profile</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Upload Year 1–4 transcripts and let AI build a structured academic profile from your actual coursework.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-emerald/50 shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v18m6-18v18M4 8h4m8 0h4M4 16h4m8 0h4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Adaptive Knowledge Diagnostics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">A quiz generated from your own courses measures real mastery percentages for accurate recommendations.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-amber/50 shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Cited Career & Job-Fit Matching</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Every match is grounded against O*NET and NEA Cambodia data with explicit skill gap analysis.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-violet/50 shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/30 text-brand-violet flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Personalized Study Roadmaps</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Get a week-by-week plan with curated resources targeting exactly the skill gaps you need to close.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-blueAmbient/50 shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-blueAmbient/10 border border-brand-blueAmbient/30 text-brand-blueAmbient flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">Counselor Safety Gate</h3>
              <p className="text-sm text-slate-400 leading-relaxed">High-stakes decisions automatically route to a human counselor for review before finalization.</p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-brand-mint/50 shadow-sm transition-all group">
              <div className="w-12 h-12 rounded-xl bg-brand-mint/10 border border-brand-mint/30 text-brand-mint flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-2">AI Copilot Chat</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Ask follow-up questions anytime — the copilot draws on your transcripts and saved plans.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-dark-borderSubtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Step-by-Step Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">How UrFuture Guides Your Career Journey</h2>
            <p className="text-slate-400 text-base">
              A continuous loop from raw transcript ingestion to verified competencies, real market matching, and gap-closing study plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-brand-cyan/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 transition-transform">01</div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-cyan transition-colors">Upload Transcripts</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">Upload classes from Year 1–4. Our AI parses course codes, credits, and syllabi into an organized repository.</p>
              <div className="text-xs text-brand-cyan font-semibold">Supports PDF, text & multi-year inputs</div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-brand-emerald/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 transition-transform">02</div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-emerald transition-colors">AI Diagnostic Quiz</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">Take an adaptive diagnostic test generated from your past courses to calculate genuine mastery.</p>
              <div className="text-xs text-brand-emerald font-semibold">Converts grades into verified competencies</div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-brand-amber/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 transition-transform">03</div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-amber transition-colors">Grounded Career & Job Fit</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">Discover careers matched to your profile or paste any job description to evaluate fit scores.</p>
              <div className="text-xs text-brand-amber font-semibold">Grounded against O*NET & NEA Cambodia</div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-brand-violet/50 transition-all group">
              <div className="w-14 h-14 rounded-xl bg-brand-violet/10 border border-brand-violet/30 text-brand-violet flex items-center justify-center font-extrabold text-xl mb-5 group-hover:scale-110 transition-transform">04</div>
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-brand-violet transition-colors">Roadmaps & Safety Gate</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">Generate week-by-week study plans. High-stakes pivots trigger counselor safety review.</p>
              <div className="text-xs text-brand-violet font-semibold">Human-in-the-loop counselor protection</div>
            </div>
          </div>
        </div>
      </section>

      <section id="grounding" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-dark-borderSubtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-emerald uppercase tracking-wider">Trust & Grounded Data</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">Zero Hallucination. 100% Audited Evidence.</h2>
            <p className="text-slate-400 text-base">Academic and career decisions define your life. UrFuture is built on an enterprise RAG architecture with human counselor oversight.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
              <div className="w-12 h-12 rounded-lg bg-brand-cyan/10 text-brand-cyan font-bold flex items-center justify-center mb-5 text-2xl">📚</div>
              <h3 className="text-base font-bold text-white mb-3">O*NET-SOC Knowledge Taxonomy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Every skill requirement and career pathway is mapped to standardized occupational classifications with explicit importance weights.</p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
              <div className="w-12 h-12 rounded-lg bg-brand-emerald/10 text-brand-emerald font-bold flex items-center justify-center mb-5 text-2xl">🇰🇭</div>
              <h3 className="text-base font-bold text-white mb-3">NEA Cambodia & ILOSTAT</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Market salaries and industry growth projections are contextualized with Cambodian National Employment Agency labor surveys.</p>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
              <div className="w-12 h-12 rounded-lg bg-brand-violet/10 text-brand-violet font-bold flex items-center justify-center mb-5 text-2xl">🛡️</div>
              <h3 className="text-base font-bold text-white mb-3">Human Counselor Safety Gate</h3>
              <p className="text-sm text-slate-400 leading-relaxed">High-stakes triggers like major changes or university dropouts are automatically gated and flagged for certified counselor review.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-dark-borderSubtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Student Experiences</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">Built for Cambodian High School & University Students</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed italic mb-6">"Uploading my Year 1–3 transcripts immediately revealed that my highest competency was in Data Pipelines. The quiz verified my SQL skills, and I got an internship recommendation within minutes."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-cyan text-dark-bg font-bold text-sm flex items-center justify-center">SC</div>
                <div>
                  <div className="text-sm font-bold text-white">Sokha Chea</div>
                  <div className="text-xs text-slate-400">CamTech University · Year 3</div>
                </div>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed italic mb-6">"As an ITC engineering student, I wasn't sure whether to pursue embedded systems or software engineering. UrFuture's job description fit check gave me the clarity I needed."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-emerald text-dark-bg font-bold text-sm flex items-center justify-center">VP</div>
                <div>
                  <div className="text-sm font-bold text-white">Vanna Pich</div>
                  <div className="text-xs text-slate-400">ITC (Techno) · Year 4</div>
                </div>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-2xl p-8 flex flex-col justify-between">
              <p className="text-sm text-slate-300 leading-relaxed italic mb-6">"I am in Grade 12 choosing my university major. UrFuture helped me understand what skills actually lead to high-growth tech jobs in Phnom Penh."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-violet text-dark-bg font-bold text-sm flex items-center justify-center">BK</div>
                <div>
                  <div className="text-sm font-bold text-white">Bopha Kong</div>
                  <div className="text-xs text-slate-400">High School Senior · Phnom Penh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="border-t border-dark-borderSubtle py-8 px-4 sm:px-6 lg:px-8 bg-dark-bg mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="text-brand-cyan font-bold text-lg">UrFuture</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-sm">Learn • Plan • Achieve</span>
          </div>
          <div className="text-slate-500 text-xs">
            © {new Date().getFullYear()} UrFuture (Phlouv). Decision support & grounded career pathways for students.
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}