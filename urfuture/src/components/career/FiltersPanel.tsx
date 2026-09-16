'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CAREER_CATEGORIES } from '@/data/careerCategories';
import {
  DEMAND_LEVELS,
  FIT_LEVELS,
  type CareerFilterState,
  type FitLevel,
} from '@/lib/careerFilters';
import type { CareerCategoryId, DemandLevel } from '@/types/career';

interface Props {
  filters: CareerFilterState;
  activeCount: number;
  onToggleCategory: (id: CareerCategoryId) => void;
  onToggleFitLevel: (level: FitLevel) => void;
  onToggleDemandLevel: (level: DemandLevel) => void;
  onClear: () => void;
}

const CHIP_BASE =
  'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d2ff]';
const CHIP_ACTIVE =
  'border-[#00d2ff] bg-[#00d2ff]/15 text-[#0891b2] dark:text-[#67e8f9]';
const CHIP_INACTIVE =
  'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600';

interface PopoverPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

/**
 * Dropdown filter panel that sits next to the search bar. Filters combine
 * with the search text and with each other by AND — narrowing by category
 * and by fit level returns only careers matching both.
 *
 * Popover state (open/closed) lives here; the filter *values* live in the
 * parent so search text and filters can be applied together in one place.
 */
export default function FiltersPanel({
  filters,
  activeCount,
  onToggleCategory,
  onToggleFitLevel,
  onToggleDemandLevel,
  onClear,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition | null>(null);

  useEffect(() => {
    if (!open) {
      setPopoverPosition(null);
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const margin = 8;
      const width = Math.min(320, window.innerWidth - margin * 2);
      const triggerRect = trigger.getBoundingClientRect();
      const left = Math.min(
        Math.max(margin, triggerRect.left),
        window.innerWidth - width - margin
      );
      const availableBelow = window.innerHeight - triggerRect.bottom - margin;
      const availableAbove = triggerRect.top - margin;
      const shouldOpenAbove = availableBelow < 360 && availableAbove > availableBelow;
      const maxHeight = Math.max(
        180,
        Math.min(520, shouldOpenAbove ? availableAbove : availableBelow)
      );
      const top = shouldOpenAbove
        ? Math.max(margin, triggerRect.top - maxHeight - margin)
        : triggerRect.bottom + margin;

      setPopoverPosition({ left, top, width, maxHeight });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  // Close on outside click and on Escape, same conventions as the detail modal.
  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00d2ff] ${
          activeCount > 0
            ? 'border-[#00d2ff] bg-[#00d2ff]/10 text-[#0891b2] dark:text-[#67e8f9]'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        <span>Filters</span>
        {activeCount > 0 && (
          <span
            className="inline-flex items-center justify-center min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#00d2ff] text-[10px] font-bold text-slate-950"
            aria-label={`${activeCount} filters active`}
          >
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Filter career paths"
          className="fixed z-50 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-4 animate-fade-in"
          style={
            popoverPosition
              ? {
                  left: popoverPosition.left,
                  top: popoverPosition.top,
                  width: popoverPosition.width,
                  maxHeight: popoverPosition.maxHeight,
                }
              : { visibility: 'hidden' }
          }
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Filters
            </h3>
            <button
              type="button"
              onClick={onClear}
              disabled={activeCount === 0}
              className="text-xs text-slate-500 hover:text-[#00d2ff] disabled:opacity-40 disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-colors"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <FilterGroup label="Field">
              {CAREER_CATEGORIES.map((category) => {
                const isActive = filters.categories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => onToggleCategory(category.id)}
                    aria-pressed={isActive}
                    className={`${CHIP_BASE} ${isActive ? CHIP_ACTIVE : CHIP_INACTIVE}`}
                  >
                    {category.pillLabel}
                  </button>
                );
              })}
            </FilterGroup>

            <FilterGroup label="Fit level">
              {FIT_LEVELS.map((level) => {
                const isActive = filters.fitLevels.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onToggleFitLevel(level)}
                    aria-pressed={isActive}
                    className={`${CHIP_BASE} ${isActive ? CHIP_ACTIVE : CHIP_INACTIVE}`}
                  >
                    {level}
                  </button>
                );
              })}
            </FilterGroup>

            <FilterGroup label="Demand in Cambodia">
              {DEMAND_LEVELS.map((level) => {
                const isActive = filters.demandLevels.includes(level);
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onToggleDemandLevel(level)}
                    aria-pressed={isActive}
                    className={`${CHIP_BASE} ${isActive ? CHIP_ACTIVE : CHIP_INACTIVE}`}
                  >
                    {level}
                  </button>
                );
              })}
            </FilterGroup>
          </div>
        </div>
      )}
    </div>
  );
}