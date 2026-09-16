import type { CareerCategory, CareerCategoryId } from '@/types/career';
export const CAREER_CATEGORIES: CareerCategory[] = [
  {
    id: 'engineering',
    label: 'Engineering & Development',
    pillLabel: 'Engineering',
    roles: [
      'Software Engineer',
      'Full-Stack Developer',
      'Backend Developer',
      'Frontend Developer',
      'Mobile Developer',
      'DevOps Engineer',
      'QA Engineer',
    ],
  },
  {
    id: 'data',
    label: 'Data & Analytics',
    pillLabel: 'Data',
    roles: [
      'Data Analyst',
      'Data Engineer',
      'Business Analyst',
      'Data Scientist',
    ],
  },
  {
    id: 'design',
    label: 'Design & UX',
    pillLabel: 'Design',
    roles: ['UI/UX Designer', 'Product Designer', 'Graphic Designer'],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure & Security',
    pillLabel: 'Infrastructure',
    roles: [
      'Cybersecurity Analyst',
      'Network Engineer',
      'Cloud Engineer',
      'Systems Administrator',
    ],
  },
  {
    id: 'management',
    label: 'Management & Product',
    pillLabel: 'Management',
    roles: ['Product Manager', 'Project Manager', 'Scrum Master'],
  },
  {
    id: 'other',
    label: 'Other',
    pillLabel: 'Other',
    roles: ['IT Support Specialist', 'Technical Writer'],
  },
];

export const CATEGORY_BY_ID: Record<CareerCategoryId, CareerCategory> =
  CAREER_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Record<CareerCategoryId, CareerCategory>);

/** Keyword hints for titles that are not an exact match in `roles`. */
const KEYWORD_HINTS: [RegExp, CareerCategoryId][] = [
  [/devops|sre|platform engineer/i, 'engineering'],
  [/qa|test|quality/i, 'engineering'],
  [/developer|engineer(?!ing manager)|programmer/i, 'engineering'],
  [/data|analytics|analyst|machine learning|\bml\b|\bai\b/i, 'data'],
  [/design|\bux\b|\bui\b/i, 'design'],
  [/security|cyber|network|cloud|infrastructure|sysadmin|administrator/i, 'infrastructure'],
  [/product manager|project manager|scrum|program manager|lead/i, 'management'],
  [/support|helpdesk|technical writer|documentation/i, 'other'],
];

export function categoriseRole(title: string): CareerCategoryId {
  const normalised = title.trim().toLowerCase();

  for (const category of CAREER_CATEGORIES) {
    if (category.roles.some((role) => role.toLowerCase() === normalised)) {
      return category.id;
    }
  }
  for (const [pattern, categoryId] of KEYWORD_HINTS) {
    if (pattern.test(title)) return categoryId;
  }

  return 'other';
}