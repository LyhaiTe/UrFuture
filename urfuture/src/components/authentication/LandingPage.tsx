'use client';

import React, { useState } from 'react';
import UrFutureLogo from 'src/components/UrFutureLogo';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onQuickDemo: () => void;
}

const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'interactive-demo', label: 'Live Demo' },
  { id: 'grounding', label: 'Grounded Data' },
  { id: 'testimonials', label: 'Student Stories' },
];

export default function LandingPage({ onOpenAuth, onQuickDemo }: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'radar' | 'pathway' | 'jobfit' | 'copilot'>('radar');
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
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-brand-emerald/8 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] bg-brand-blueAmbient/10 rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-0 z-40 bg-dark-bg/85 backdrop-blur-md border-b border-dark-borderSubtle px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center h-16">
          <div className="cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <UrFutureLogo variant="navbar" />
          </div>

          <div className="flex-1 flex justify-center">
            <nav className="hidden lg:flex items-center justify-center gap-8 text-[13px] font-semibold text-slate-400">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="relative py-1.5 hover:text-white transition-colors group"
                >
                  {link.label}
                  <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-brand-cyan transition-all duration-200 group-hover:w-full" />
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <button
              onClick={onQuickDemo}
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              1-Click Demo
            </button>

            <span className="hidden sm:block w-px h-5 bg-dark-borderPanel" />

            <button
              onClick={() => onOpenAuth('login')}
              className="px-4 sm:px-5 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-bg text-xs sm:text-sm font-extrabold shadow-lg shadow-brand-cyan/25 transition-all hover:scale-105 active:scale-95"
            >
              Student Sign In
            </button>

            {/* Mobile nav toggle — only shown below lg breakpoint */}
            <button
              onClick={() => setIsMobileNavOpen((open) => !open)}
              aria-label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileNavOpen}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-dark-navSurface hover:bg-dark-cardHover border border-dark-borderPanelHover text-slate-300 hover:text-white transition-colors shrink-0"
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

        {/* Mobile nav panel */}
        {isMobileNavOpen && (
          <div className="lg:hidden max-w-7xl mx-auto pb-4 pt-1 border-t border-dark-borderSubtle flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-left px-2 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-dark-navSurface transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                onQuickDemo();
                setIsMobileNavOpen(false);
              }}
              className="sm:hidden mt-1 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-dark-navSurface border border-dark-borderPanelHover text-xs font-bold text-slate-300"
            >
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              1-Click Demo
            </button>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-dark-chip border border-brand-cyan/30 text-brand-cyan text-xs font-bold mb-6 shadow-sm shadow-brand-cyan/20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-brand-cyan" />
            Cambodian AI Career &amp; Academic Navigation Advisor
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
            Turn Your Academic Transcripts Into{' '}
            <span className="bg-gradient-to-r from-brand-cyan via-brand-cyanLight to-brand-mint bg-clip-text text-transparent">
              Grounded Career Pathways
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Upload past coursework from Year 1–4, benchmark your knowledge with adaptive AI diagnostic quizzes, match against real Cambodian &amp; regional industry demand, and build a personalized prep roadmap.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuth('register')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-textOnBrand font-extrabold text-sm shadow-xl shadow-brand-cyan/30 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Get Started — Free Student Access</span>
              <svg className="w-4 h-4 text-dark-textOnBrand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>

            <button
              onClick={onQuickDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-dark-navSurface hover:bg-dark-navSurface text-white border border-dark-borderPanelHover font-bold text-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-brand-emerald" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
              </svg>
              <span>Instant Demo (Sokha / Alex)</span>
            </button>

            <button
              onClick={() => scrollToSection('interactive-demo')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-slate-300 hover:text-white text-xs sm:text-sm font-semibold hover:bg-dark-panel transition-colors"
            >
              Explore Live Preview ↓
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-dark-borderSubtle/80 w-full max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-4">
              Designed For Students Across Cambodian Universities &amp; High Schools
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-slate-400">
              <span className="px-3 py-1.5 rounded-lg bg-dark-chip border border-dark-borderPanel">ITC (Techno)</span>
              <span className="px-3 py-1.5 rounded-lg bg-dark-chip border border-dark-borderPanel">RUPP Phnom Penh</span>
              <span className="px-3 py-1.5 rounded-lg bg-dark-chip border border-dark-borderPanel">CamTech University</span>
              <span className="px-3 py-1.5 rounded-lg bg-dark-chip border border-dark-borderPanel">CADT Academy</span>
              <span className="px-3 py-1.5 rounded-lg bg-dark-chip border border-dark-borderPanel">Paragon University</span>
              <span className="px-3 py-1.5 rounded-lg bg-dark-chip border border-dark-borderPanel">AUPP Cambodia</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* NEW: Platform Transformation Preview (Abstract & Marketing-focused) */}
        {/* ========================================================================= */}
        <div className="mt-16 relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-emerald/20 to-brand-violet/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
          
          <div className="relative bg-dark-panel/80 backdrop-blur-xl border border-dark-borderPanel rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center relative">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-dark-panelAlt border border-dark-divider group hover:border-brand-cyan/50 transition-all">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">1. Upload Transcripts</h4>
                <p className="text-xs text-slate-400">Securely parse your academic history into structured data.</p>
              </div>

              {/* Arrow (Desktop only) */}
              <div className="hidden md:flex absolute left-1/3 top-1/2 -translate-y-1/2 -translate-x-1/2 text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-dark-panelAlt border border-dark-divider group hover:border-brand-emerald/50 transition-all">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">2. AI Knowledge Mapping</h4>
                <p className="text-xs text-slate-400">Adaptive quizzes verify your true competency, not just grades.</p>
              </div>

              {/* Arrow (Desktop only) */}
              <div className="hidden md:flex absolute left-2/3 top-1/2 -translate-y-1/2 -translate-x-1/2 text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-dark-panelAlt border border-dark-divider group hover:border-brand-violet/50 transition-all">
                <div className="w-14 h-14 mx-auto rounded-full bg-brand-violet/10 border border-brand-violet/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-brand-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">3. Grounded Career Match</h4>
                <p className="text-xs text-slate-400">Get personalized roadmaps backed by real Cambodian market data.</p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-dark-divider text-center">
              <p className="text-xs text-slate-400 mb-3">Trusted by students across Cambodia's top institutions</p>
              <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold text-slate-500">
                <span className="px-2 py-1 rounded bg-dark-panel border border-dark-borderPanel">ITC</span>
                <span className="px-2 py-1 rounded bg-dark-panel border border-dark-borderPanel">RUPP</span>
                <span className="px-2 py-1 rounded bg-dark-panel border border-dark-borderPanel">CamTech</span>
                <span className="px-2 py-1 rounded bg-dark-panel border border-dark-borderPanel">CADT</span>
                <span className="px-2 py-1 rounded bg-dark-panel border border-dark-borderPanel">AUPP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURES SECTION */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-dark-borderSubtle">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Why UrFuture</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">Everything You Need to Plan What&apos;s Next</h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            One workspace that turns your academic history into a grounded, evidence-backed plan for the years ahead.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-dark-panel border border-dark-borderPanel hover:border-brand-cyan/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Transcript-Grounded Profile</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Upload Year 1–4 transcripts and let AI build a structured academic profile from your actual coursework, not a generic questionnaire.</p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-panel border border-dark-borderPanel hover:border-brand-emerald/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v18m6-18v18M4 8h4m8 0h4M4 16h4m8 0h4" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Adaptive Knowledge Diagnostics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">A quiz generated from your own courses measures real mastery percentages, so recommendations are based on what you actually know.</p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-panel border border-dark-borderPanel hover:border-brand-amber/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Cited Career &amp; Job-Fit Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Every match is grounded against O*NET and NEA Cambodia data, or paste a job description to see your fit score and skill gaps.</p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-panel border border-dark-borderPanel hover:border-brand-violet/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-brand-violet/10 border border-brand-violet/30 text-brand-violet flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Personalized Study Roadmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Get a week-by-week plan with curated resources that targets exactly the skill gaps standing between you and your goal.</p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-panel border border-dark-borderPanel hover:border-brand-blueAmbient/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-brand-blueAmbient/10 border border-brand-blueAmbient/30 text-brand-blueAmbient flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">Counselor Safety Gate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">High-stakes decisions like switching majors automatically route to a human counselor for review before they're treated as final.</p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-panel border border-dark-borderPanel hover:border-brand-mint/50 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-brand-mint/10 border border-brand-mint/30 text-brand-mint flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1.5">AI Copilot Chat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Ask follow-up questions any time — the copilot draws on your transcripts, quiz results, and saved plans to keep answers grounded.</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4-STEP HOW IT WORKS SECTION */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-dark-borderSubtle">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Step-by-Step Architecture</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">How UrFuture Guides Your Career Journey</h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            A continuous loop from raw transcript ingestion to verified competencies, real market matching, and gap-closing study plans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6 relative hover:border-brand-cyan/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center font-extrabold text-lg mb-5 group-hover:scale-110 transition-transform">01</div>
            <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">Upload Transcripts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Upload classes from Year 1–4. Our AI parses course codes, credits, and syllabi into an organized academic knowledge repository.</p>
            <div className="mt-4 text-[11px] text-brand-cyan font-semibold">Supports PDF, text &amp; multi-year inputs</div>
          </div>

          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6 relative hover:border-brand-emerald/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center font-extrabold text-lg mb-5 group-hover:scale-110 transition-transform">02</div>
            <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-emerald transition-colors">AI Diagnostic Quiz</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Take an adaptive diagnostic test generated strictly from your past courses to calculate your genuine mastery percentage.</p>
            <div className="mt-4 text-[11px] text-brand-emerald font-semibold">Converts grades into verified competencies</div>
          </div>

          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6 relative hover:border-brand-amber/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-amber/10 border border-brand-amber/30 text-brand-amber flex items-center justify-center font-extrabold text-lg mb-5 group-hover:scale-110 transition-transform">03</div>
            <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-amber transition-colors">Grounded Career &amp; Job Fit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Discover careers matched to your profile or paste any job description to evaluate fit scores and pinpoint missing skills.</p>
            <div className="mt-4 text-[11px] text-brand-amber font-semibold">Grounded against O*NET &amp; NEA Cambodia</div>
          </div>

          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6 relative hover:border-brand-violet/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/30 text-brand-violet flex items-center justify-center font-extrabold text-lg mb-5 group-hover:scale-110 transition-transform">04</div>
            <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-violet transition-colors">Roadmaps &amp; Safety Gate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Generate week-by-week study plans with curated materials. High-stakes pivots trigger counselor safety review.</p>
            <div className="mt-4 text-[11px] text-brand-violet font-semibold">Human-in-the-loop counselor protection</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE LIVE PREVIEW SECTION */}
      {/* ========================================================================= */}
      <section id="interactive-demo" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-dark-borderSubtle">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Live Interactive Explorer</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">Experience the Core Capabilities</h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">Click across the modules below to see how UrFuture empowers students with actionable intelligence.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'radar', label: '📊 Knowledge Radar' },
            { id: 'pathway', label: '🗺️ Career Pathways' },
            { id: 'jobfit', label: '🎯 Job Fit Scanner' },
            { id: 'copilot', label: '🤖 AI Career Mentor' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePreviewTab(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === tab.id
                  ? 'bg-dark-cardHover text-brand-cyan border border-dark-borderPanelHover shadow-md shadow-brand-cyan/15'
                  : 'bg-dark-panelAlt text-slate-400 hover:text-slate-200 border border-dark-panelAlt'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-dark-panel border border-dark-borderPanelHover rounded-2xl p-6 sm:p-8 shadow-2xl">
          {activePreviewTab === 'radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Coursework to Competencies</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">Automated Multi-Year Skill Radar</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">Rather than just listing grades, UrFuture synthesizes every course you took into quantified skill proficiencies.</p>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">Software Architecture</span><span className="text-brand-cyan">88%</span></div>
                  <div className="w-full bg-dark-cardHover h-2 rounded-full overflow-hidden"><div className="bg-brand-cyan h-full w-[88%]" /></div>
                  <div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">Data Engineering &amp; SQL</span><span className="text-brand-emerald">92%</span></div>
                  <div className="w-full bg-dark-cardHover h-2 rounded-full overflow-hidden"><div className="bg-brand-emerald h-full w-[92%]" /></div>
                  <div className="flex justify-between text-xs font-semibold"><span className="text-slate-300">Cloud Computing &amp; DevOps</span><span className="text-brand-amberLight">65%</span></div>
                  <div className="w-full bg-dark-cardHover h-2 rounded-full overflow-hidden"><div className="bg-brand-amberLight h-full w-[65%]" /></div>
                </div>
                <div className="mt-8"><button onClick={onQuickDemo} className="px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-textOnBrand font-bold text-xs">View Full Skill Radar in Demo →</button></div>
              </div>
              <div className="bg-dark-panelAlt border border-dark-borderPanel rounded-xl p-6 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 rounded-full border-8 border-dashed border-brand-cyan/40 flex items-center justify-center relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-brand-cyan/20 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">42</span>
                    <span className="text-[10px] text-slate-400">Courses</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-white">42 Academic Courses Synthesized</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Mapped across 18 industry competency clusters with 90%+ diagnostic verification accuracy.</p>
              </div>
            </div>
          )}

          {activePreviewTab === 'pathway' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-brand-emerald uppercase tracking-wider">Visual Roadmaps</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">Interactive Node-Based Career Graphs</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">Powered by React Flow, see the exact milestones between your current academic standing and high-demand roles.</p>
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-panelAlt border border-dark-borderPanel">
                    <span className="w-6 h-6 rounded-full bg-brand-cyan/20 text-brand-cyan font-bold text-xs flex items-center justify-center">1</span>
                    <span className="text-xs text-slate-200">Current Standing: Year 3 Computer Science</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-panelAlt border border-dark-borderPanel">
                    <span className="w-6 h-6 rounded-full bg-brand-emerald/20 text-brand-emerald font-bold text-xs flex items-center justify-center">2</span>
                    <span className="text-xs text-slate-200">Target Certification: AWS Certified Data Specialist</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-panelAlt border border-dark-borderPanel">
                    <span className="w-6 h-6 rounded-full bg-brand-violet/20 text-brand-violet font-bold text-xs flex items-center justify-center">3</span>
                    <span className="text-xs text-slate-200">Outcome: Junior Data Engineer ($800–$1,600/mo)</span>
                  </div>
                </div>
              </div>
              <div className="bg-dark-panelAlt border border-dark-borderPanel rounded-xl p-6 flex flex-col justify-center">
                <div className="text-xs font-mono text-brand-cyan mb-2">// Active Pathway Node Map</div>
                <div className="p-3 bg-dark-panel border border-dark-borderPanelHover rounded-lg text-xs space-y-2">
                  <div className="font-bold text-white">Path: Full Stack &amp; Cloud Engineer</div>
                  <div className="text-slate-400 text-[11px]">Grounded via ILOSTAT Cambodia Tech Survey 2024</div>
                  <div className="text-brand-emerald font-semibold text-[11px]">✓ 4 Milestones completed · 2 remaining</div>
                </div>
                <button onClick={onQuickDemo} className="mt-4 w-full py-2 rounded-lg bg-dark-cardHover text-brand-cyan text-xs font-bold hover:bg-dark-cardHover transition-colors">Explore Interactive Graph in Demo</button>
              </div>
            </div>
          )}

          {activePreviewTab === 'jobfit' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-brand-amber uppercase tracking-wider">Targeted Job Matching</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">Paste Any Job Description → Instant Fit Check</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">Found an internship or job posting? Paste the job description, and UrFuture extracts required skills, compares them with your profile, and writes a tailored prep plan.</p>
                <div className="mt-5 p-3.5 rounded-xl bg-dark-panelAlt border border-dark-borderPanel">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-white">Smart Axiata — Junior Backend Dev</span>
                    <span className="text-xs font-bold text-brand-emerald">87% Match</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-[10px] text-emerald-300">✓ Node.js &amp; Express</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-[10px] text-emerald-300">✓ PostgreSQL</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700/50 text-[10px] text-amber-300">⚡ Docker (Missing - 2 wk plan)</span>
                  </div>
                </div>
              </div>
              <div className="bg-dark-panelAlt border border-dark-borderPanel rounded-xl p-6">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Instant Gap-Closing Study Plan</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-dark-panel border border-dark-divider">
                    <span className="text-brand-cyan font-bold block">Week 1: Docker Basics &amp; Containerization</span>
                    <span className="text-slate-400 text-[11px]">Free practice lab + official documentation</span>
                  </div>
                  <div className="p-2.5 rounded bg-dark-panel border border-dark-divider">
                    <span className="text-brand-cyan font-bold block">Week 2: Deploying Full-Stack Node App</span>
                    <span className="text-slate-400 text-[11px]">Project milestone ready for portfolio inclusion</span>
                  </div>
                </div>
                <button onClick={onQuickDemo} className="mt-4 w-full py-2 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan/25 border border-brand-cyan/30 text-xs font-bold text-brand-cyan transition-colors">Try Job Matcher Live</button>
              </div>
            </div>
          )}

          {activePreviewTab === 'copilot' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-brand-violetLight uppercase tracking-wider">24/7 AI Mentor</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-2">Grounded Conversational Advisor</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">Chat in English or Khmer with an intelligent advisor that possesses full context of your transcripts, test results, and aspirations.</p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-300"><span className="text-brand-emerald">✓</span> Real-time streaming responses (SSE)</div>
                  <div className="flex items-center gap-2 text-xs text-slate-300"><span className="text-brand-emerald">✓</span> Groundedness verification on every response</div>
                  <div className="flex items-center gap-2 text-xs text-slate-300"><span className="text-brand-emerald">✓</span> Automatic Counselor safety triggers</div>
                </div>
              </div>
              <div className="bg-dark-panelAlt border border-dark-borderPanel rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-dark-divider">
                  <div className="w-7 h-7 rounded-full bg-brand-cyan text-dark-bg font-bold text-xs flex items-center justify-center">AI</div>
                  <span className="text-xs font-bold text-white">UrFuture Academic Mentor</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-dark-cardHover text-slate-200 self-end ml-6">"Should I take Cloud Computing or Computer Graphics next term?"</div>
                  <div className="p-2.5 rounded-lg bg-dark-panel border border-dark-borderPanel text-slate-300 mr-6 leading-relaxed">"Based on your target of <strong className="text-white">Data Engineering</strong> (91% match) and high regional salary growth in Phnom Penh, <strong className="text-brand-cyan">Cloud Computing</strong> directly addresses your remaining skill gap in distributed storage."</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* GROUNDED DATA & CITATION TRANSPARENCY SECTION */}
      {/* ========================================================================= */}
      <section id="grounding" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-dark-borderSubtle">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-emerald uppercase tracking-wider">Trust &amp; Grounded Data</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">Zero Hallucination. 100% Audited Evidence.</h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">Academic and career decisions define your life. UrFuture is built on an enterprise RAG architecture with human counselor oversight.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 text-brand-cyan font-bold flex items-center justify-center mb-4">📚</div>
            <h3 className="text-sm font-bold text-white mb-2">O*NET-SOC Knowledge Taxonomy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Every skill requirement and career pathway is mapped to standardized occupational classifications with explicit importance weights.</p>
          </div>
          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-brand-emerald/10 text-brand-emerald font-bold flex items-center justify-center mb-4">🇰🇭</div>
            <h3 className="text-sm font-bold text-white mb-2">NEA Cambodia &amp; ILOSTAT</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Market salaries and industry growth projections are contextualized with Cambodian National Employment Agency labor surveys.</p>
          </div>
          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6">
            <div className="w-10 h-10 rounded-lg bg-brand-violet/10 text-brand-violet font-bold flex items-center justify-center mb-4">🛡️</div>
            <h3 className="text-sm font-bold text-white mb-2">Human Counselor Safety Gate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">High-stakes triggers like major changes or university dropouts are automatically gated and flagged for certified counselor review.</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* STUDENT TESTIMONIALS */}
      {/* ========================================================================= */}
      <section id="testimonials" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full border-t border-dark-borderSubtle">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-cyan uppercase tracking-wider">Student Experiences</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">Built for Cambodian High School &amp; University Students</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-slate-300 leading-relaxed italic">"Uploading my Year 1–3 transcripts immediately revealed that my highest competency was in Data Pipelines. The quiz verified my SQL skills, and I got an internship recommendation within minutes."</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-cyan text-dark-bg font-bold text-xs flex items-center justify-center">SC</div>
              <div>
                <div className="text-xs font-bold text-white">Sokha Chea</div>
                <div className="text-[11px] text-slate-400">CamTech University · Year 3</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-slate-300 leading-relaxed italic">"As an ITC engineering student, I wasn't sure whether to pursue embedded systems or software engineering. UrFuture's job description fit check gave me the clarity I needed."</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-emerald text-dark-bg font-bold text-xs flex items-center justify-center">VP</div>
              <div>
                <div className="text-xs font-bold text-white">Vanna Pich</div>
                <div className="text-[11px] text-slate-400">ITC (Techno) · Year 4</div>
              </div>
            </div>
          </div>

          <div className="bg-dark-panel border border-dark-borderPanel rounded-2xl p-6 flex flex-col justify-between">
            <p className="text-xs text-slate-300 leading-relaxed italic">"I am in Grade 12 choosing my university major. UrFuture helped me understand what skills actually lead to high-growth tech jobs in Phnom Penh."</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-violet text-dark-bg font-bold text-xs flex items-center justify-center">BK</div>
              <div>
                <div className="text-xs font-bold text-white">Bopha Kong</div>
                <div className="text-[11px] text-slate-400">High School Senior · Phnom Penh</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-dark-ctaFrom via-dark-ctaVia to-dark-ctaFrom p-8 sm:p-12 border border-brand-cyan/40 shadow-2xl text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/15 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">Ready to Plan &amp; Accelerate Your Future?</h2>
          <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto mt-3">Sign in now to upload your transcripts and explore grounded academic and career pathways tailored for you.</p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onOpenAuth('register')} className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-textOnBrand font-extrabold text-sm shadow-xl shadow-brand-cyan/30 transition-all hover:scale-105">Launch UrFuture Free</button>
            <button onClick={onQuickDemo} className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-dark-panel hover:bg-dark-cardHover text-white border border-dark-borderPanelHover font-bold text-sm transition-all">1-Click Demo Access</button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-dark-borderSubtle py-8 px-4 sm:px-8 bg-dark-bg mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <UrFutureLogo variant="navbar" />
            <span>— Learn • Plan • Achieve</span>
          </div>
          <div>© {new Date().getFullYear()} UrFuture (Phlouv). Decision support &amp; grounded career pathways for students.</div>
        </div>
      </footer>
    </div>
  );
}