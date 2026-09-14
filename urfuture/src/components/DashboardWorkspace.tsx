'use client';

import React, { useState, useEffect } from 'react';

interface DashboardWorkspaceProps {
  userId: string;
  studentName?: string;
  institution?: string;
  onNavigateTab: (tab: 'Workspace' | 'Knowledge map' | 'Career paths' | 'Job fit') => void;
}

export default function DashboardWorkspace({
  userId,
  studentName,
  institution,
  onNavigateTab,
}: DashboardWorkspaceProps) {
  const [mounted, setMounted] = useState(false);
  const displayName = studentName || 'Alex';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-slate-100 flex flex-col">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: rotate(-90deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
          100% {
            transform: rotate(-90deg) scale(1);
            opacity: 1;
          }
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }
        @keyframes blink {
          0%, 90%, 100% {
            opacity: 1;
          }
          95% {
            opacity: 0.3;
          }
        }
        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(6, 182, 212, 0.9));
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-fade-in-left {
          animation: fadeInLeft 0.6s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 4s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* ========================================================================= */}
        {/* HERO BANNER WITH ANIMATIONS */}
        {/* ========================================================================= */}
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-panel via-dark-panelAlt to-dark-panel p-8 sm:p-10 mb-8 border border-dark-borderPanel shadow-2xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Ambient glow effects with animation */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-brand-emerald/5 rounded-full blur-3xl pointer-events-none animate-float" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              {/* Status badge with animation */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs font-bold mb-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                On Track
              </div>
              
              {/* Welcome text with staggered animation */}
              <h1 className={`text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2 ${mounted ? 'animate-fade-in-left delay-100' : 'opacity-0'}`}>
                Welcome back, {displayName}.
              </h1>
              
              <p className={`text-lg text-slate-300 max-w-xl mb-4 ${mounted ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
                You're <span className="text-brand-cyan font-bold">82% ready</span> for your next internship. Keep building your profile to unlock more opportunities.
              </p>

              {/* CTA Buttons with animation */}
              <div className={`flex flex-wrap gap-3 ${mounted ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
                <button
                  onClick={() => onNavigateTab('Knowledge map')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-cyan hover:bg-brand-cyanBright text-dark-bg font-extrabold text-sm shadow-lg shadow-brand-cyan/30 transition-all hover:scale-105 active:scale-95 group"
                >
                  Continue Mapping
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                
                <button
                  onClick={() => onNavigateTab('Career paths')}
                  className="px-6 py-3 rounded-xl bg-dark-cardHover hover:bg-dark-card text-white font-semibold text-sm border border-dark-borderPanel transition-all hover:scale-105 active:scale-95"
                >
                  View Careers
                </button>
              </div>
            </div>

            {/* Readiness Ring with animation */}
            <div className={`flex flex-col items-center shrink-0 ${mounted ? 'animate-scale-in delay-400' : 'opacity-0 scale-90'}`}>
              <div className="relative w-32 h-32">
                {/* Animated ring */}
                <svg className="w-32 h-32 -rotate-90 animate-pulse-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1b2947" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42 * 0.82} ${2 * Math.PI * 42}`}
                    className="drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center percentage with animation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white animate-fade-in-up">82%</span>
                </div>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-brand-cyan/20 blur-xl animate-pulse" />
              </div>
              <span className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Readiness</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CONTENT — 2 column layout with animations */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Stats + Action Grid (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 hover:border-brand-cyan/30 transition-all group hover:-translate-y-1 ${mounted ? 'animate-fade-in-up delay-500' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Knowledge</span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-white">82%</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">42 courses mapped</span>
              </div>

              <div className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 hover:border-brand-emerald/30 transition-all group hover:-translate-y-1 ${mounted ? 'animate-fade-in-up delay-[0.6s]' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-brand-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Top Match</span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-white">91%</span>
                </div>
                <span className="text-xs text-slate-300 font-medium mt-1 block">Data Engineer</span>
              </div>

              <div className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 hover:border-brand-violet/30 transition-all group hover:-translate-y-1 ${mounted ? 'animate-fade-in-up delay-[0.7s]' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4 text-brand-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Pathways</span>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-white">3</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">strong matches</span>
              </div>
            </div>

            {/* 2x2 Action Grid with animations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Knowledge Mapping */}
              <div
                onClick={() => onNavigateTab('Knowledge map')}
                className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 cursor-pointer hover:border-brand-cyan/50 hover:shadow-lg hover:shadow-brand-cyan/10 transition-all group hover:-translate-y-1 ${mounted ? 'animate-fade-in-up delay-[0.8s]' : 'opacity-0'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">
                  Knowledge Mapping
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Turn coursework into verified competencies
                </p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-dark-cardHover h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-brand-cyan to-brand-emerald h-full rounded-full w-[82%] animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-slate-300">82%</span>
                </div>
                <div className="text-xs font-semibold text-brand-cyan flex items-center gap-1 group-hover:gap-2 transition-all">
                  Continue <span>→</span>
                </div>
              </div>

              {/* Career Paths */}
              <div
                onClick={() => onNavigateTab('Career paths')}
                className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 cursor-pointer hover:border-brand-emerald/50 hover:shadow-lg hover:shadow-brand-emerald/10 transition-all group hover:-translate-y-1 relative ${mounted ? 'animate-fade-in-up delay-[0.9s]' : 'opacity-0'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 animate-pulse">
                    3 matches
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-emerald transition-colors">
                  Career Paths
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Explore roles aligned with your strengths
                </p>
                <div className="text-xs font-semibold text-brand-emerald flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explore <span>→</span>
                </div>
              </div>

              {/* Job Fit Analysis */}
              <div
                onClick={() => onNavigateTab('Job fit')}
                className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 cursor-pointer hover:border-brand-amber/50 hover:shadow-lg hover:shadow-brand-amber/10 transition-all group hover:-translate-y-1 ${mounted ? 'animate-fade-in-up delay-[1s]' : 'opacity-0'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-amber/10 border border-brand-amber/20 flex items-center justify-center text-brand-amber group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-amber transition-colors">
                  Job Fit Analysis
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Compare job descriptions with your skills
                </p>
                <div className="text-xs font-semibold text-brand-amber flex items-center gap-1 group-hover:gap-2 transition-all">
                  Analyze a job <span>→</span>
                </div>
              </div>

              {/* Transcript Upload */}
              <div
                onClick={() => onNavigateTab('Knowledge map')}
                className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 cursor-pointer hover:border-brand-violet/50 hover:shadow-lg hover:shadow-brand-violet/10 transition-all group hover:-translate-y-1 ${mounted ? 'animate-fade-in-up delay-[1.1s]' : 'opacity-0'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-brand-violet group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-violet transition-colors">
                  Transcript Upload
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Add new transcripts to update your profile
                </p>
                <div className="text-xs font-semibold text-brand-violet flex items-center gap-1 group-hover:gap-2 transition-all">
                  Upload <span>→</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR (4 cols) — Next Milestone with animation */}
          <div className="lg:col-span-4">
            <div className={`bg-dark-panel border border-dark-borderPanel rounded-xl p-6 sticky top-6 transition-all hover:-translate-y-1 hover:shadow-xl ${mounted ? 'animate-fade-in-left delay-[1.2s]' : 'opacity-0'}`}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Next Milestone</h2>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-dark-cardHover h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-cyan to-brand-emerald h-full rounded-full w-[75%] animate-pulse" />
                </div>
                <span className="text-sm font-bold text-brand-emerald">75%</span>
              </div>

              <h3 className="text-base font-semibold text-white mb-2">Complete your career profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">Add two interests to sharpen your recommendations and unlock better matches.</p>

              <button
                onClick={() => onNavigateTab('Knowledge map')}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/30 text-sm font-semibold text-brand-cyan transition-all hover:scale-105 active:scale-95"
              >
                Continue profile
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}