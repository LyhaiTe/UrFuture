'use client';

import React, { useState } from 'react';

interface DashboardWorkspaceProps {
  userId: string;
  studentName?: string;
  institution?: string;
  onNavigateTab: (tab: 'Workspace' | 'Knowledge map' | 'Career paths' | 'Job fit') => void;
  onOpenCopilot: () => void;
}

export default function DashboardWorkspace({
  userId,
  studentName,
  institution,
  onNavigateTab,
  onOpenCopilot,
}: DashboardWorkspaceProps) {
  const [isCopilotHovered, setIsCopilotHovered] = useState(false);
  const displayName = studentName || 'Alex';

  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a2540] via-[#0d3a5c] to-[#0a2540] p-8 sm:p-10 mb-8 border border-[#1b3c66]/50">
        {/* Subtle glow orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00d2ff]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-[#34d399]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span className="text-xs font-semibold text-slate-400">
                {institution || 'Cambodia Tech Student'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Welcome back, {displayName}.
              <span className="block text-[#00d2ff]">Let's build your future.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
              You're <span className="text-[#00d2ff] font-bold">82% ready</span> for your next internship. Keep going.
            </p>

            <div className="mt-6">
              <button
                onClick={() => onNavigateTab('Knowledge map')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe6] text-[#070d1a] font-bold text-sm shadow-lg shadow-[#00d2ff]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Mapping
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Readiness Ring */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1b2947" strokeWidth="7" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#00d2ff"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42 * 0.82} ${2 * Math.PI * 42}`}
                  className="drop-shadow-[0_0_8px_#00d2ff]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-white">82</span>
                <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
              </div>
            </div>
            <span className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Readiness</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT — 2 column layout */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Stats + Action Grid (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 hover:border-[#263b63] transition-colors">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Knowledge Coverage</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-white">82%</span>
              </div>
              <span className="text-xs text-slate-400">42 courses mapped</span>
            </div>

            <div className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 hover:border-[#263b63] transition-colors">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Top Career Match</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-white">91%</span>
              </div>
              <span className="text-xs text-slate-300 font-medium">Data Engineer</span>
            </div>

            <div className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 hover:border-[#263b63] transition-colors">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Active Pathways</span>
              <div className="mt-2">
                <span className="text-3xl font-extrabold text-white">3</span>
              </div>
              <span className="text-xs text-slate-400">strong matches</span>
            </div>
          </div>

          {/* 2x2 Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Knowledge Mapping */}
            <div
              onClick={() => onNavigateTab('Knowledge map')}
              className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 cursor-pointer hover:border-[#00d2ff]/40 hover:bg-[#111d33] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-[#00d2ff] transition-colors">
                Knowledge Mapping
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Turn coursework into verified competencies
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-[#17253d] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00d2ff] to-[#34d399] h-full rounded-full w-[82%]" />
                </div>
                <span className="text-xs font-bold text-slate-300">82%</span>
              </div>
              <div className="mt-3 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Continue <span>→</span>
              </div>
            </div>

            {/* Career Paths */}
            <div
              onClick={() => onNavigateTab('Career paths')}
              className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 cursor-pointer hover:border-[#00d2ff]/40 hover:bg-[#111d33] transition-all group relative"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064e3b] text-[#34d399] border border-[#0d6d53]/50">
                  3 matches
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-[#00d2ff] transition-colors">
                Career Paths
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Explore roles aligned with your strengths
              </p>
              <div className="mt-4 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <span>→</span>
              </div>
            </div>

            {/* Job Fit Analysis */}
            <div
              onClick={() => onNavigateTab('Job fit')}
              className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 cursor-pointer hover:border-[#00d2ff]/40 hover:bg-[#111d33] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-[#00d2ff] transition-colors">
                Job Fit Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Compare job descriptions with your skills
              </p>
              <div className="mt-4 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Analyze a job <span>→</span>
              </div>
            </div>

            {/* Transcript Upload */}
            <div
              onClick={() => onNavigateTab('Knowledge map')}
              className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 cursor-pointer hover:border-[#00d2ff]/40 hover:bg-[#111d33] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-[#00d2ff] transition-colors">
                Transcript Upload
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Add new transcripts to update your profile
              </p>
              <div className="mt-4 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Upload <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (4 cols) — Only Next Milestone */}
        <div className="lg:col-span-4">
          <div className="bg-[#0d1526] border border-[#1b2947] rounded-xl p-5 sticky top-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Next Milestone</h2>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-[#17253d] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#00d2ff] to-[#34d399] h-full rounded-full w-[75%]" />
              </div>
              <span className="text-xs font-bold text-[#34d399]">75%</span>
            </div>

            <h3 className="text-sm font-semibold text-white">Complete your career profile</h3>
            <p className="text-xs text-slate-400 mt-1">Add two interests to sharpen your recommendations.</p>

            <button
              onClick={() => onNavigateTab('Knowledge map')}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-[#00d2ff]/10 hover:bg-[#00d2ff]/20 border border-[#00d2ff]/30 text-xs font-semibold text-[#00d2ff] transition-all"
            >
              Continue profile
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <div className="mt-12 pt-6 border-t border-[#1b2947]/50 text-center">
        <p className="text-xs text-slate-500">UrFuture — Learn · Plan · Achieve</p>
      </div>

      {/* ========================================================================= */}
      {/* ANIMATED ROBOT CHATBOT BUTTON — Fixed bottom-right (ONLY chatbot entry) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Tooltip bubble — appears on hover */}
        <div
          className={`absolute bottom-full right-0 mb-3 transition-all duration-300 ${
            isCopilotHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="bg-white text-[#070d1a] text-sm font-bold px-4 py-2 rounded-xl shadow-xl shadow-black/20 relative">
            Hello! 👋
            {/* Tooltip arrow */}
            <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>

        {/* Robot button with animation */}
        <button
          onClick={onOpenCopilot}
          onMouseEnter={() => setIsCopilotHovered(true)}
          onMouseLeave={() => setIsCopilotHovered(false)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0099cc] shadow-lg shadow-[#00d2ff]/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group"
        >
          {/* Pulsing ring animation */}
          <span className="absolute inset-0 rounded-full bg-[#00d2ff]/30 animate-ping" />
          <span className="absolute inset-0 rounded-full bg-[#00d2ff]/20 animate-pulse" />

          {/* Robot icon */}
          <svg
            className="w-7 h-7 text-white relative z-10 transition-transform group-hover:scale-110"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {/* Robot head */}
            <rect x="5" y="8" width="14" height="10" rx="2" strokeWidth={2} />
            {/* Eyes */}
            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            {/* Smile */}
            <path strokeLinecap="round" strokeWidth={2} d="M9 15c1.5 1 4.5 1 6 0" />
            {/* Antenna */}
            <path strokeLinecap="round" strokeWidth={2} d="M12 8V5" />
            <circle cx="12" cy="4" r="1" fill="currentColor" />
            {/* Ears */}
            <path strokeLinecap="round" strokeWidth={2} d="M5 12H3M19 12h2" />
          </svg>
        </button>
      </div>
    </div>
  );
}