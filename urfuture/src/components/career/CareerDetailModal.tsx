'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORY_BY_ID } from '@/data/careerCategories';
import { getMarketProfile } from '@/data/cambodiaJobMarket';
import { categoryOf } from '@/lib/careerFilters';
import type { Career } from '@/types/career';
import {
  EmployersSection,
  FitSection,
  MarketSection,
  MissingProfileNotice,
  ProgressionSection,
  ProvenanceFooter,
  QualificationsSection,
} from './CareerDetailSections';

type TabId = 'fit' | 'market' | 'employers' | 'requirements' | 'growth';

const TABS: { id: TabId; label: string; needsProfile: boolean }[] = [
  { id: 'fit', label: 'Your fit', needsProfile: false },
  { id: 'market', label: 'Job market', needsProfile: true },
  { id: 'employers', label: 'Employers', needsProfile: true },
  { id: 'requirements', label: 'Requirements', needsProfile: true },
  { id: 'growth', label: 'Growth', needsProfile: true },
];

interface Props {
  career: Career;
  onClose: () => void;
  /** Jump to another career from the "Related career paths" section. */
  onSelectCareer: (slug: string) => void;
}

export default function CareerDetailModal({
  career,
  onClose,
  onSelectCareer,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('fit');
  const dialogRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const profile = useMemo(() => getMarketProfile(career.slug), [career.slug]);
  const category = CATEGORY_BY_ID[categoryOf(career)];

  /* Reset to the first tab and scroll to top whenever the career changes —
     otherwise jumping via "Related career paths" leaves you on the Employers
     tab of a role you have not looked at yet, halfway down the page. */
  useEffect(() => {
    setActiveTab('fit');
    bodyRef.current?.scrollTo({ top: 0 });
  }, [career.slug]);

  /* Escape to close, and keep Tab inside the dialog. */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* Lock background scroll while open, and hand focus to the close button so
     keyboard users start inside the dialog rather than behind it. */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  const visibleTabs = TABS.filter((tab) => !tab.needsProfile || profile);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-6 animate-fade-in"
      onMouseDown={(event) => {
        // mousedown, not click: a click that starts inside the dialog and
        // ends on the backdrop (a text drag-select) should not close it.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="career-detail-title"
        className="w-full sm:max-w-5xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up motion-reduce:animate-none"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 sm:px-6 pt-5 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{category.label}</p>
              <h2
                id="career-detail-title"
                className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50 truncate"
              >
                {career.title}
              </h2>
              <p className="mt-1 text-sm">
                <span className="text-[#34d399] font-bold">
                  {career.matchScore}% profile match
                </span>
                <span className="text-slate-500"> · {career.fitLabel}</span>
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close career details"
              className="shrink-0 h-9 w-9 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d2ff]"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Career detail sections"
            className="mt-5 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`career-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`career-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d2ff] rounded-t ${
                    isActive
                      ? 'border-[#00d2ff] text-[#0891b2] dark:text-[#67e8f9]'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto px-5 sm:px-6 py-6 flex flex-col gap-5"
        >
          <div
            role="tabpanel"
            id={`career-panel-${activeTab}`}
            aria-labelledby={`career-tab-${activeTab}`}
            tabIndex={0}
            className="focus-visible:outline-none"
          >
            {activeTab === 'fit' && <FitSection career={career} />}

            {!profile && activeTab !== 'fit' && (
              <MissingProfileNotice title={career.title} />
            )}

            {profile && activeTab === 'market' && <MarketSection profile={profile} />}
            {profile && activeTab === 'employers' && <EmployersSection profile={profile} />}
            {profile && activeTab === 'requirements' && (
              <QualificationsSection profile={profile} />
            )}
            {profile && activeTab === 'growth' && (
              <ProgressionSection profile={profile} onSelectCareer={onSelectCareer} />
            )}
          </div>

          {profile && activeTab !== 'fit' && <ProvenanceFooter profile={profile} />}
        </div>
      </div>
    </div>
  );
}