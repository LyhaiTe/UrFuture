'use client';

import { Search, X } from 'lucide-react';
import { useRef } from 'react';
import FiltersPanel from '@/components/career/FiltersPanel';
import type { CareerFilterState, FitLevel } from '@/lib/careerFilters';
import type { CareerCategoryId, DemandLevel } from '@/types/career';

interface Props {
  query: string;
  filters: CareerFilterState;
  activeFilterCount: number;
  resultCount: number;
  totalCount: number;
  onQueryChange: (query: string) => void;
  onClearQuery: () => void;
  onToggleCategory: (id: CareerCategoryId) => void;
  onToggleFitLevel: (level: FitLevel) => void;
  onToggleDemandLevel: (level: DemandLevel) => void;
  onClearFilters: () => void;
}

/**
 * Search bar plus the Filters dropdown, on one row. Search narrows by free
 * text; Filters narrows by field, fit level, and Cambodia demand level. Both
 * apply together — see applyCareerFilters() in careerFilters.ts.
 */
export default function SearchFilterBar({
  query,
  filters,
  activeFilterCount,
  resultCount,
  totalCount,
  onQueryChange,
  onClearQuery,
  onToggleCategory,
  onToggleFitLevel,
  onToggleDemandLevel,
  onClearFilters,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onClearQuery();
    inputRef.current?.focus();
  };

  const hasAnyFilter = Boolean(query) || activeFilterCount > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <label htmlFor="career-search" className="sr-only">
            Search careers by title, field, or fit level
          </label>

          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            id="career-search"
            type="text"
            placeholder="Search by title, field, or skill…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00d2ff] focus:border-transparent transition-colors"
            aria-describedby="search-results"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d2ff]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <FiltersPanel
          filters={filters}
          activeCount={activeFilterCount}
          onToggleCategory={onToggleCategory}
          onToggleFitLevel={onToggleFitLevel}
          onToggleDemandLevel={onToggleDemandLevel}
          onClear={onClearFilters}
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p
          id="search-results"
          className="text-xs text-slate-600 dark:text-slate-400"
          role="status"
          aria-live="polite"
        >
          {hasAnyFilter
            ? `${resultCount} of ${totalCount} career path${totalCount !== 1 ? 's' : ''}`
            : `${totalCount} career path${totalCount !== 1 ? 's' : ''}`}
        </p>

        {hasAnyFilter && (
          <button
            type="button"
            onClick={() => {
              onClearQuery();
              onClearFilters();
            }}
            className="text-xs text-slate-500 hover:text-[#00d2ff] transition-colors"
          >
            Clear all
          </button>
        )}

        {!hasAnyFilter && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onQueryChange('engineer')}
              className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#00d2ff] hover:text-[#00d2ff] transition-colors"
            >
              Engineer
            </button>
            <button
              type="button"
              onClick={() => onQueryChange('data')}
              className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#00d2ff] hover:text-[#00d2ff] transition-colors"
            >
              Data
            </button>
            <button
              type="button"
              onClick={() => onQueryChange('strong fit')}
              className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#00d2ff] hover:text-[#00d2ff] transition-colors"
            >
              Strong fit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}