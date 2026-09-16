'use client';

import React from 'react';
import { ArrowRight, BarChart3, BriefcaseBusiness, FileUp, Gauge, Map } from 'lucide-react';

interface DashboardWorkspaceProps {
  userId: string;
  studentName?: string;
  institution?: string;
  onNavigateTab: (
    tab: 'Workspace' | 'Knowledge map' | 'Career paths' | 'Job fit'
  ) => void;
  onOpenCopilot: () => void;
}

export default function DashboardWorkspace({
  userId,
  studentName,
  institution,
  onNavigateTab,
}: DashboardWorkspaceProps) {
  const displayName = studentName || 'Alex';

  return (
    <div className="dashboard-workspace min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* Welcome / Readiness Banner */}
      <div className="dashboard-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a2540] via-[#0d3a5c] to-[#0a2540] p-8 sm:p-10 mb-8 border border-[#1b3c66]/50">
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
              <span className="block text-[#00d2ff]">
                Let's build your future.
              </span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed">
              You're{' '}
              <span className="text-[#00d2ff] font-bold">
                82% ready
              </span>{' '}
              for your next internship. Keep going.
            </p>

            <div className="mt-6">
              <button
                onClick={() => onNavigateTab('Knowledge map')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00d2ff] hover:bg-[#00bfe6] text-[#070d1a] font-bold text-sm shadow-lg shadow-[#00d2ff]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Mapping
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Readiness indicator */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative flex items-center justify-center w-28 h-28 rounded-full border border-[#1b3c66] bg-[#0d1f36]/80 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
              <div className="absolute inset-3 rounded-full border border-[#1b3c66]/80" />
              <Gauge className="w-12 h-12 text-[#00d2ff]" strokeWidth={2} />
            </div>

            <div className="mt-2 text-center">
              <div className="text-2xl font-extrabold text-white leading-none">82</div>
              <div className="text-[10px] text-slate-400 font-medium">/ 100</div>
            </div>

            <span className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Readiness
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN CONTENT — 2 column layout */}
      {/* ========================================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Stats + Action Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Knowledge Coverage */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-sm hover:border-dark-borderLight transition-colors">
              <span className="text-xs text-slate-800 dark:text-slate-300 font-semibold tracking-wider uppercase">
                Knowledge Coverage
              </span>

              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  82%
                </span>
              </div>

              <span className="text-xs text-slate-700 dark:text-slate-200">
                42 courses mapped
              </span>
            </div>

            {/* Career Match */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-sm hover:border-dark-borderLight transition-colors">
              <span className="text-xs text-slate-800 dark:text-slate-300 font-semibold tracking-wider uppercase">
                Top Career Match
              </span>

              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  91%
                </span>
              </div>

              <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                Data Engineer
              </span>
            </div>

            {/* Active Pathways */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-sm hover:border-dark-borderLight transition-colors">
              <span className="text-xs text-slate-800 dark:text-slate-300 font-semibold tracking-wider uppercase">
                Active Pathways
              </span>

              <div className="mt-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">
                  3
                </span>
              </div>

              <span className="text-xs text-slate-700 dark:text-slate-200">
                strong matches
              </span>
            </div>
          </div>

          {/* 2x2 Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Knowledge Mapping */}
            <div
              onClick={() => onNavigateTab('Knowledge map')}
              className="bg-dark-card border border-dark-border rounded-xl p-6 cursor-pointer shadow-sm hover:border-brand-cyan/40 hover:bg-dark-cardHover transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <BarChart3 className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-4 group-hover:text-cyan-700 transition-colors">
                Knowledge Mapping
              </h3>

              <p className="text-xs text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed">
                Turn coursework into verified competencies
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 bg-[#17253d] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00d2ff] to-[#34d399] h-full rounded-full w-[82%]" />
                </div>

                <span className="text-xs font-bold text-slate-300">
                  82%
                </span>
              </div>

              <div className="mt-3 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Continue <span>→</span>
              </div>
            </div>

            {/* Career Paths */}
            <div
              onClick={() => onNavigateTab('Career paths')}
              className="bg-dark-card border border-dark-border rounded-xl p-6 cursor-pointer shadow-sm hover:border-brand-cyan/40 hover:bg-dark-cardHover transition-all group relative"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <Map className="w-5 h-5" strokeWidth={2} />
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#064e3b] text-[#34d399] border border-[#0d6d53]/50">
                  3 matches
                </span>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-4 group-hover:text-cyan-700 transition-colors">
                Career Paths
              </h3>

              <p className="text-xs text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed">
                Explore roles aligned with your strengths
              </p>

              <div className="mt-4 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <span>→</span>
              </div>
            </div>

            {/* Job Fit Analysis */}
            <div
              onClick={() => onNavigateTab('Job fit')}
              className="bg-dark-card border border-dark-border rounded-xl p-6 cursor-pointer shadow-sm hover:border-brand-cyan/40 hover:bg-dark-cardHover transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <BriefcaseBusiness className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-4 group-hover:text-cyan-700 transition-colors">
                Job Fit Analysis
              </h3>

              <p className="text-xs text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed">
                Compare job descriptions with your skills
              </p>

              <div className="mt-4 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Analyze a job <span>→</span>
              </div>
            </div>

            {/* Transcript Upload */}
            <div
              onClick={() => onNavigateTab('Knowledge map')}
              className="bg-dark-card border border-dark-border rounded-xl p-6 cursor-pointer shadow-sm hover:border-brand-cyan/40 hover:bg-dark-cardHover transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-[#0e2542] border border-[#1b3c66] flex items-center justify-center text-[#00d2ff]">
                  <FileUp className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>

              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 mt-4 group-hover:text-cyan-700 transition-colors">
                Transcript Upload
              </h3>

              <p className="text-xs text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed">
                Add new transcripts to update your profile
              </p>

              <div className="mt-4 text-xs font-semibold text-[#00d2ff] flex items-center gap-1 group-hover:gap-2 transition-all">
                Upload <span>→</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-xs text-slate-800 dark:text-slate-300 font-semibold uppercase tracking-wider mb-4">
              Next Milestone
            </h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 bg-dark-cardHover h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-brand-cyan to-brand-emerald h-full rounded-full w-[75%] animate-pulse" />
                </div>
                <span className="text-sm font-bold text-brand-emerald">75%</span>
              </div>

            <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
              Complete your career profile
            </h3>

            <p className="mt-2 text-xs text-slate-700 dark:text-slate-200">
              Add two interests to sharpen your recommendations.
            </p>

              <button
                onClick={() => onNavigateTab('Knowledge map')}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 border border-teal-600 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Continue profile
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}