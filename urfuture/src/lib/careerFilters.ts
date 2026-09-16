import { categoriseRole, CAREER_CATEGORIES, CATEGORY_BY_ID } from '@/data/careerCategories';
import { getMarketProfile } from '@/data/cambodiaJobMarket';
import type { Career, CareerCategoryId, DemandLevel } from '@/types/career';

/**
 * Pure helpers for the Career Paths filter bar. Kept out of the component so
 * the selection rules can be unit-tested without mounting React.
 */

/** The three fit labels used across the catalog, in display order. */
export const FIT_LEVELS = ['Strong fit', 'Good fit', 'Possible fit'] as const;
export type FitLevel = (typeof FIT_LEVELS)[number];

/** All demand levels a career's market profile can carry. */
export const DEMAND_LEVELS: DemandLevel[] = ['High', 'Medium', 'Low'];

/** Combined filter state the panel and the search bar both write to. */
export interface CareerFilterState {
  categories: CareerCategoryId[];
  fitLevels: FitLevel[];
  demandLevels: DemandLevel[];
}

export const EMPTY_FILTER_STATE: CareerFilterState = {
  categories: [],
  fitLevels: [],
  demandLevels: [],
};

/** A career's category, falling back to title-based inference. */
export function categoryOf(career: Career): CareerCategoryId {
  return career.categoryId ?? categoriseRole(career.title);
}

/**
 * A career's demand level, from its Cambodia market profile. Undefined when
 * no profile has been researched yet — such a career is excluded the moment
 * a demand filter is applied, since we cannot claim a demand level we don't
 * have data for.
 */
export function demandOf(career: Career): DemandLevel | undefined {
  return getMarketProfile(career.slug)?.overview.demandLevel;
}

/**
 * Search filter. Matches against title, category, and fit label.
 * Returns everything if query is empty.
 */
export function searchCareers(
  careers: Career[],
  query: string
): Career[] {
  if (!query.trim()) return careers;

  const q = query.toLowerCase();
  return careers.filter((career) => {
    const category = CATEGORY_BY_ID[categoryOf(career)];
    return (
      career.title.toLowerCase().includes(q) ||
      category.label.toLowerCase().includes(q) ||
      career.fitLabel.toLowerCase().includes(q) ||
      career.missingSkill.toLowerCase().includes(q)
    );
  });
}

/**
 * Multi-select filter. An empty selection means "no filter applied" and
 * returns everything — not an empty list. This is the behaviour students
 * expect from pill filters and it keeps the panel useful on first paint.
 */
export function filterCareers(
  careers: Career[],
  selected: CareerCategoryId[]
): Career[] {
  if (selected.length === 0) return careers;
  const wanted = new Set(selected);
  return careers.filter((career) => wanted.has(categoryOf(career)));
}

/**
 * Applies search text and every filter dimension together. Each dimension is
 * independently optional (an empty array means "don't filter on this"), and
 * dimensions combine with AND — picking "Data" and "High demand" narrows to
 * careers that are both, not either.
 */
export function applyCareerFilters(
  careers: Career[],
  query: string,
  filters: CareerFilterState
): Career[] {
  let result = searchCareers(careers, query);

  if (filters.categories.length > 0) {
    const wanted = new Set(filters.categories);
    result = result.filter((career) => wanted.has(categoryOf(career)));
  }

  if (filters.fitLevels.length > 0) {
    const wanted = new Set(filters.fitLevels);
    result = result.filter((career) =>
      wanted.has(career.fitLabel as FitLevel)
    );
  }

  if (filters.demandLevels.length > 0) {
    const wanted = new Set(filters.demandLevels);
    result = result.filter((career) => {
      const demand = demandOf(career);
      return demand !== undefined && wanted.has(demand);
    });
  }

  return result;
}

/** Total number of individual filter selections across every dimension. */
export function activeFilterCount(filters: CareerFilterState): number {
  return (
    filters.categories.length +
    filters.fitLevels.length +
    filters.demandLevels.length
  );
}

/** Toggle one value in one filter dimension, returning a new state object. */
export function toggleFilterValue<K extends keyof CareerFilterState>(
  filters: CareerFilterState,
  dimension: K,
  value: CareerFilterState[K][number]
): CareerFilterState {
  const current = filters[dimension] as CareerFilterState[K][number][];
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];

  return { ...filters, [dimension]: next };
}

/** Toggle one category in a selection, preserving taxonomy order. */
export function toggleCategory(
  selected: CareerCategoryId[],
  categoryId: CareerCategoryId
): CareerCategoryId[] {
  const next = selected.includes(categoryId)
    ? selected.filter((id) => id !== categoryId)
    : [...selected, categoryId];

  const order = CAREER_CATEGORIES.map((c) => c.id);
  return next.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

/**
 * How many careers sit in each category, for the counts shown on the pills.
 * Counts are computed against the unfiltered list so they stay stable while
 * the student changes their selection — a count that changes as you click is
 * disorienting and makes it look like careers are disappearing.
 */
export function countByCategory(
  careers: Career[]
): Record<CareerCategoryId, number> {
  const counts = CAREER_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = 0;
    return acc;
  }, {} as Record<CareerCategoryId, number>);

  for (const career of careers) {
    counts[categoryOf(career)] += 1;
  }
  return counts;
}