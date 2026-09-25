'use client';

import { useMemo, useState } from 'react';
import SearchFilterBar from '@/components/career/SearchFilterBar';
import CareerDetailModal from '@/components/career/CareerDetailModal';
import { CAREER_BY_SLUG, CAREER_CATALOG } from '@/data/careerCatalog';
import { CATEGORY_BY_ID } from '@/data/careerCategories';
import {
  activeFilterCount,
  applyCareerFilters,
  categoryOf,
  EMPTY_FILTER_STATE,
  toggleFilterValue,
  type CareerFilterState,
} from '@/lib/careerFilters';
import type { Career } from '@/types/career';

const ONET_CARD_METADATA: Record<string, { socCode: string; elementId: string; importance: number }> = {
  'Software Engineer': { socCode: '15-1252.00', elementId: '2.B.3.f', importance: 92 },
  'Frontend Developer': { socCode: '15-1254.00', elementId: '2.B.3.f', importance: 90 },
  'Data Engineer': { socCode: '15-2051.00', elementId: '2.B.3.g', importance: 90 },
  'Cybersecurity Analyst': { socCode: '15-1212.00', elementId: '2.C.3.a', importance: 95 },
  'UI/UX Designer': { socCode: '15-1255.00', elementId: '2.C.3.b', importance: 95 },
};

/**
 * Career Paths panel.
 *
 * The career list and the Cambodia market data moved out of this file into
 * src/data/. This component now only owns UI state: the search query, the
 * filter selections, and which career (if any) is open in the detail modal.
 */
interface CareerFitPanelProps {
  readonly userId: string;
}

export default function CareerFitPanel({ userId: _userId }: CareerFitPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CareerFilterState>(EMPTY_FILTER_STATE);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const visibleCareers = useMemo(
    () => applyCareerFilters(CAREER_CATALOG, searchQuery, filters),
    [searchQuery, filters]
  );

  const filterCount = activeFilterCount(filters);

  const openCareer: Career | null = openSlug
    ? CAREER_BY_SLUG.get(openSlug) ?? null
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-slate-500 mb-3">Workspace / Career paths</p>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Career paths that match your profile
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Ranked from your coursework, quiz results, interests, and
          transferable skills.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          Strongest fit: Software &amp; Data
        </h2>

        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          Your top matches share programming, analytical reasoning, and systems
          thinking.
        </p>
      </div>

      <SearchFilterBar
        query={searchQuery}
        filters={filters}
        activeFilterCount={filterCount}
        resultCount={visibleCareers.length}
        totalCount={CAREER_CATALOG.length}
        onQueryChange={setSearchQuery}
        onClearQuery={() => setSearchQuery('')}
        onToggleCategory={(id) =>
          setFilters((current) => toggleFilterValue(current, 'categories', id))
        }
        onToggleFitLevel={(level) =>
          setFilters((current) => toggleFilterValue(current, 'fitLevels', level))
        }
        onToggleDemandLevel={(level) =>
          setFilters((current) => toggleFilterValue(current, 'demandLevels', level))
        }
        onClearFilters={() => setFilters(EMPTY_FILTER_STATE)}
      />

      {visibleCareers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {searchQuery
              ? `No career paths match "${searchQuery}".`
              : 'No career paths match the selected filters.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setFilters(EMPTY_FILTER_STATE);
            }}
            className="mt-3 text-xs font-medium text-[#00d2ff] hover:underline"
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visibleCareers.map((career, index) => (
            <li
              key={career.id}
              /* Keyed animation: re-mounting on a filter change replays the
                 entrance, so the list reads as "these are the new results"
                 rather than silently swapping content. */
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors animate-fade-in-up motion-reduce:animate-none"
              style={{ animationDelay: `${Math.min(index, 8) * 35}ms` }}
            >
              {(() => {
                const onet = career.onetSocCode
                  ? { socCode: career.onetSocCode, elementId: career.onetElementId ?? 'n/a', importance: career.onetImportance ?? 0 }
                  : ONET_CARD_METADATA[career.title];
                return (
              <div className="grid grid-cols-1 lg:grid-cols-[50px_1fr_240px_80px_120px] gap-4 lg:items-center">
                <div className="text-[#00d2ff] text-xs font-bold">#{index + 1}</div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {career.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {career.fitLabel} · {CATEGORY_BY_ID[categoryOf(career)].label}
                  </p>
                  {onet && (
                    <p className="text-[11px] text-cyan-700 dark:text-cyan-300 mt-1">
                      O*NET-SOC {onet.socCode}
                    </p>
                  )}
                </div>

                <div className="text-xs">
                  <span className="text-amber-600 dark:text-amber-400">Missing:</span>{' '}
                  <span className="text-slate-600 dark:text-slate-400">
                    {career.missingSkill}{onet && ` · Element ${onet.elementId} · Importance ${onet.importance}/100`}
                  </span>
                </div>

                <div className="text-xl font-bold text-[#34d399]">
                  {career.matchScore}%
                </div>

                <button
                  type="button"
                  onClick={() => setOpenSlug(career.slug)}
                  aria-haspopup="dialog"
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d2ff]"
                >
                  View details
                </button>
              </div>
                );
              })()}
            </li>
          ))}
        </ul>
      )}

      {openCareer && (
        <CareerDetailModal
          career={openCareer}
          onClose={() => setOpenSlug(null)}
          onSelectCareer={(slug) => setOpenSlug(slug)}
        />
      )}
    </div>
  );
}