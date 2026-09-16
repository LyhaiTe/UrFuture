import type {
  CareerMarketProfile,
  CompanySize,
  HiringCompany,
  MarketSource,
  SalaryBand,
} from '@/types/career';

/* ===========================================================================
 * ⚠ PROTOTYPE DATA — NOT CLEARED FOR STUDENT-FACING RELEASE
 *
 * Every figure below is an editorial estimate assembled for the prototype.
 * None of it is sourced from a primary dataset yet, which is exactly the
 * limitation specs/backend/career-paths/spec.md already records for the
 * CareerPath table ("Market data remains source-labeled prototype data and is
 * not a hiring guarantee").
 *
 * Before this ships to real students, each profile's `sources` array must be
 * replaced with real references. The intended primary sources are:
 *   - National Employment Agency (NEA) Cambodia skills-shortage surveys
 *   - ILOSTAT Cambodia labour-force series
 *   - Live posting counts scraped from BongThom / CamHR / EverJobs
 *   - Employer-published salary bands
 *
 * `companies[].careersUrl` is intentionally left unset everywhere. Populate it
 * only with a URL someone has opened and verified; the UI degrades to a
 * non-link company name when it is absent, so an empty field is safe and a
 * wrong one is not.
 *
 * The UI surfaces `lastReviewed` and `sources` on every profile so this
 * caveat is visible to the student, not buried in a code comment.
 * ======================================================================== */

const REVIEWED = '2026-09-15';

const PROTOTYPE_SOURCES: MarketSource[] = [
  {
    label: 'Prototype estimate — pending NEA Cambodia verification',
    reference: 'specs/frontend/career-paths/spec.md#data-provenance',
  },
];

const band = (level: SalaryBand['level'], minUsd: number, maxUsd: number): SalaryBand => ({
  level,
  minUsd,
  maxUsd,
});

/* ----------------------------- employer registry -------------------------
 * Company identity (size, sector, benefits) lives here once. Per-role salary
 * ranges are applied at the call site, because the same employer pays a QA
 * engineer and a data engineer differently.
 * ------------------------------------------------------------------------ */

interface EmployerRecord {
  name: string;
  size: CompanySize;
  sector: string;
  benefits: string[];
  careersUrl?: string;
}

const EMPLOYERS = {
  aba: {
    name: 'ABA Bank',
    size: 'Large',
    sector: 'Banking & Finance',
    benefits: ['Health insurance', 'Annual bonus', 'Structured training budget'],
  },
  acleda: {
    name: 'ACLEDA Bank',
    size: 'Large',
    sector: 'Banking & Finance',
    benefits: ['Pension contribution', 'Health insurance', 'Internal mobility'],
  },
  canadia: {
    name: 'Canadia Bank',
    size: 'Large',
    sector: 'Banking & Finance',
    benefits: ['Health insurance', 'Performance bonus', 'Staff loan rates'],
  },
  wing: {
    name: 'Wing Bank',
    size: 'Large',
    sector: 'Fintech',
    benefits: ['Health insurance', 'Hybrid schedule', 'Certification support'],
  },
  smart: {
    name: 'Smart Axiata',
    size: 'Large',
    sector: 'Telecommunications',
    benefits: ['Health insurance', 'Regional secondment', 'Learning stipend'],
  },
  cellcard: {
    name: 'Cellcard',
    size: 'Large',
    sector: 'Telecommunications',
    benefits: ['Health insurance', 'Phone and data allowance', 'Annual bonus'],
  },
  metfone: {
    name: 'Metfone',
    size: 'Large',
    sector: 'Telecommunications',
    benefits: ['Health insurance', 'Overtime pay', 'On-the-job training'],
  },
  bookmebus: {
    name: 'BookMeBus',
    size: 'Small',
    sector: 'Technology & Startups',
    benefits: ['Flexible hours', 'Direct product ownership', 'Small-team exposure'],
  },
  pathmazing: {
    name: 'Pathmazing',
    size: 'Medium',
    sector: 'Technology & Startups',
    benefits: ['Flexible hours', 'International client work', 'Remote-friendly'],
  },
  koompi: {
    name: 'KOOMPI',
    size: 'Small',
    sector: 'Technology & Startups',
    benefits: ['Open-source work', 'Flexible hours', 'Hardware allowance'],
  },
  nham24: {
    name: 'Nham24',
    size: 'Medium',
    sector: 'E-commerce & Delivery',
    benefits: ['Meal allowance', 'Fast promotion track', 'Young team'],
  },
  sabay: {
    name: 'Sabay Digital',
    size: 'Medium',
    sector: 'Media & Technology',
    benefits: ['Creative environment', 'Health insurance', 'Flexible hours'],
  },
  manulife: {
    name: 'Manulife Cambodia',
    size: 'Large',
    sector: 'Insurance',
    benefits: ['Health and life cover', 'Annual bonus', 'Regional training'],
  },
  amret: {
    name: 'Amret Microfinance',
    size: 'Large',
    sector: 'Banking & Finance',
    benefits: ['Health insurance', 'Provincial allowance', 'Training program'],
  },
  ministry: {
    name: 'Ministry of Post & Telecommunications',
    size: 'Large',
    sector: 'Government',
    benefits: ['Job stability', 'Public pension', 'Formal training pathway'],
  },
  unicefKh: {
    name: 'UNICEF Cambodia',
    size: 'Medium',
    sector: 'NGO & Development',
    benefits: ['International standards', 'Strong leave policy', 'Learning budget'],
  },
  aii: {
    name: 'American Intercon School',
    size: 'Large',
    sector: 'Education & EdTech',
    benefits: ['School holidays', 'Health insurance', 'Tuition discount for family'],
  },
} satisfies Record<string, EmployerRecord>;

type EmployerKey = keyof typeof EMPLOYERS;

/** Attach a role-specific salary range to a registry employer. */
const hiring = (
  key: EmployerKey,
  salaryMinUsd: number,
  salaryMaxUsd: number
): HiringCompany => ({
  ...EMPLOYERS[key],
  salaryMinUsd,
  salaryMaxUsd,
});

/* ------------------------------- profiles -------------------------------- */

const profiles: CareerMarketProfile[] = [
  {
    slug: 'software-engineer',
    overview: {
      demandLevel: 'High',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 600, 1000), band('Mid', 1000, 1800), band('Senior', 1800, 2800)],
      openPositions: 320,
      applicantsPerPosition: 28,
      competitionLevel: 'High',
      note: 'The largest single tech hiring pool in Phnom Penh. Banks and telcos take the most people, and both screen on a working portfolio before a CV.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 34, exampleEmployers: ['ABA Bank', 'ACLEDA Bank', 'Canadia Bank'] },
      { sector: 'Technology & Startups', shareOfPostings: 26, exampleEmployers: ['BookMeBus', 'Pathmazing', 'KOOMPI'] },
      { sector: 'Telecommunications', shareOfPostings: 18, exampleEmployers: ['Smart Axiata', 'Cellcard', 'Metfone'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 12, exampleEmployers: ['Nham24'] },
      { sector: 'Government & NGOs', shareOfPostings: 10, exampleEmployers: ['Ministry of Post & Telecommunications', 'UNICEF Cambodia'] },
    ],
    companies: [
      hiring('aba', 800, 2500),
      hiring('smart', 700, 2000),
      hiring('canadia', 800, 2400),
      hiring('bookmebus', 600, 1800),
      hiring('pathmazing', 700, 2000),
      hiring('wing', 750, 2200),
    ],
    qualifications: {
      technicalSkills: ['One language to depth (Java, C#, Python or JavaScript)', 'Relational databases and SQL', 'Git and code review', 'REST API design', 'Automated testing'],
      softSkills: ['Written English', 'Working in a code-review culture', 'Breaking down vague requirements', 'Estimating your own work'],
      education: "Bachelor's in Computer Science, Software Engineering or IT. Bootcamp graduates with a strong portfolio are accepted at startups, less so at banks.",
      certifications: ['None required', 'AWS or Azure associate certifications help at enterprise employers'],
      experienceExpected: '0–1 years for junior roles; internships and university projects count.',
    },
    progression: [
      { level: 'Junior Software Engineer', timeline: 'Years 0–2', salaryRangeUsd: '$600–$1,000', skillsToAdvance: ['Ship features without hand-holding', 'Write tests as a habit', 'Read an unfamiliar codebase'] },
      { level: 'Software Engineer', timeline: 'Years 2–4', salaryRangeUsd: '$1,000–$1,800', skillsToAdvance: ['Own a service end to end', 'Design schemas that survive change', 'Review other people\u2019s code well'] },
      { level: 'Senior Engineer', timeline: 'Years 4–7', salaryRangeUsd: '$1,800–$2,800', skillsToAdvance: ['System design at scale', 'Mentoring juniors', 'Making trade-offs explicit to non-engineers'] },
      { level: 'Tech Lead / Engineering Manager', timeline: 'Years 7+', salaryRangeUsd: '$2,500–$4,000', skillsToAdvance: ['Team planning', 'Hiring and performance conversations', 'Connecting technical work to business outcomes'] },
    ],
    related: [
      { title: 'Backend Developer', relationship: 'Specialisation', reason: 'Same foundation, narrowed to services and data.', slug: 'backend-developer' },
      { title: 'Frontend Developer', relationship: 'Specialisation', reason: 'Same foundation, narrowed to interfaces.', slug: 'frontend-developer' },
      { title: 'DevOps Engineer', relationship: 'Lateral move', reason: 'A common move after two or three years of shipping.', slug: 'devops-engineer' },
      { title: 'Data Engineer', relationship: 'Lateral move', reason: 'Reuses your SQL and programming depth.', slug: 'data-engineer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'frontend-developer',
    overview: {
      demandLevel: 'High',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 500, 900), band('Mid', 900, 1600), band('Senior', 1600, 2400)],
      openPositions: 145,
      applicantsPerPosition: 32,
      competitionLevel: 'High',
      note: 'The most accessible entry point into Cambodian tech, and the most crowded. A live, polished portfolio does more than a degree here.',
    },
    industries: [
      { sector: 'Technology & Startups', shareOfPostings: 35, exampleEmployers: ['Pathmazing', 'BookMeBus', 'KOOMPI'] },
      { sector: 'Banking & Finance', shareOfPostings: 24, exampleEmployers: ['ABA Bank', 'Wing Bank'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 18, exampleEmployers: ['Nham24'] },
      { sector: 'Media & Technology', shareOfPostings: 13, exampleEmployers: ['Sabay Digital'] },
      { sector: 'Education & EdTech', shareOfPostings: 10, exampleEmployers: ['American Intercon School'] },
    ],
    companies: [
      hiring('pathmazing', 600, 1800),
      hiring('aba', 700, 2000),
      hiring('bookmebus', 500, 1500),
      hiring('nham24', 550, 1600),
      hiring('sabay', 600, 1700),
      hiring('wing', 700, 1900),
    ],
    qualifications: {
      technicalSkills: ['HTML, CSS, responsive layout', 'JavaScript and TypeScript', 'React or Vue', 'Working against REST APIs', 'Git'],
      softSkills: ['Reading a design file accurately', 'Taking feedback on visual detail', 'Explaining trade-offs to designers'],
      education: "Bachelor's in IT or Computer Science is typical; a strong portfolio can substitute at startups and agencies.",
      certifications: ['None required'],
      experienceExpected: '0–1 years. Two or three deployed personal projects is the practical bar.',
    },
    progression: [
      { level: 'Junior Frontend Developer', timeline: 'Years 0–2', salaryRangeUsd: '$500–$900', skillsToAdvance: ['Build to a design without supervision', 'Component reuse', 'Basic accessibility'] },
      { level: 'Frontend Developer', timeline: 'Years 2–4', salaryRangeUsd: '$900–$1,600', skillsToAdvance: ['State management at scale', 'Performance profiling', 'Owning a design system'] },
      { level: 'Senior Frontend Developer', timeline: 'Years 4–7', salaryRangeUsd: '$1,600–$2,400', skillsToAdvance: ['Frontend architecture', 'Mentoring', 'Setting quality standards for a team'] },
      { level: 'Frontend Lead', timeline: 'Years 7+', salaryRangeUsd: '$2,200–$3,200', skillsToAdvance: ['Cross-team standards', 'Hiring', 'Roadmap input'] },
    ],
    related: [
      { title: 'Full-Stack Developer', relationship: 'Similar role', reason: 'Add server-side work to what you already do.', slug: 'full-stack-developer' },
      { title: 'UI/UX Designer', relationship: 'Lateral move', reason: 'Realistic if the craft side interests you more than the code.', slug: 'ui-ux-designer' },
      { title: 'Mobile Developer', relationship: 'Specialisation', reason: 'React Native reuses most of your skill set.', slug: 'mobile-developer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'backend-developer',
    overview: {
      demandLevel: 'High',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 650, 1100), band('Mid', 1100, 1900), band('Senior', 1900, 2900)],
      openPositions: 190,
      applicantsPerPosition: 21,
      competitionLevel: 'Moderate',
      note: 'Fewer applicants than frontend and higher starting pay. Banking employers dominate and expect security awareness at interview.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 38, exampleEmployers: ['ABA Bank', 'ACLEDA Bank', 'Amret Microfinance'] },
      { sector: 'Fintech', shareOfPostings: 22, exampleEmployers: ['Wing Bank'] },
      { sector: 'Technology & Startups', shareOfPostings: 20, exampleEmployers: ['Pathmazing', 'BookMeBus'] },
      { sector: 'Telecommunications', shareOfPostings: 13, exampleEmployers: ['Smart Axiata', 'Cellcard'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 7, exampleEmployers: ['Nham24'] },
    ],
    companies: [
      hiring('aba', 900, 2600),
      hiring('acleda', 800, 2300),
      hiring('wing', 850, 2400),
      hiring('smart', 800, 2200),
      hiring('pathmazing', 700, 1900),
      hiring('amret', 700, 1800),
    ],
    qualifications: {
      technicalSkills: ['Java, C#, Node.js, Go or Python', 'Relational database design and tuning', 'REST or gRPC API design', 'Authentication and authorisation', 'Caching and message queues'],
      softSkills: ['Precision in written specs', 'Debugging under pressure', 'Handover documentation'],
      education: "Bachelor's in Computer Science or Software Engineering. Banks rarely waive this.",
      certifications: ['None required', 'Cloud associate certification is a differentiator'],
      experienceExpected: '1+ years preferred, but graduate intakes exist at the larger banks.',
    },
    progression: [
      { level: 'Junior Backend Developer', timeline: 'Years 0–2', salaryRangeUsd: '$650–$1,100', skillsToAdvance: ['Write a safe migration', 'Handle errors deliberately', 'Understand the request lifecycle'] },
      { level: 'Backend Developer', timeline: 'Years 2–4', salaryRangeUsd: '$1,100–$1,900', skillsToAdvance: ['Own a service', 'Query optimisation', 'Async and background processing'] },
      { level: 'Senior Backend Developer', timeline: 'Years 4–7', salaryRangeUsd: '$1,900–$2,900', skillsToAdvance: ['Distributed system design', 'Capacity planning', 'Security review'] },
      { level: 'Principal / Architect', timeline: 'Years 7+', salaryRangeUsd: '$2,800–$4,200', skillsToAdvance: ['Platform strategy', 'Vendor evaluation', 'Cross-team technical direction'] },
    ],
    related: [
      { title: 'Data Engineer', relationship: 'Lateral move', reason: 'Your SQL depth transfers almost directly.', slug: 'data-engineer' },
      { title: 'DevOps Engineer', relationship: 'Lateral move', reason: 'Natural if you gravitate to deployment and reliability.', slug: 'devops-engineer' },
      { title: 'Full-Stack Developer', relationship: 'Similar role', reason: 'Add the interface layer.', slug: 'full-stack-developer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'full-stack-developer',
    overview: {
      demandLevel: 'High',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 600, 1000), band('Mid', 1000, 1800), band('Senior', 1800, 2700)],
      openPositions: 165,
      applicantsPerPosition: 24,
      competitionLevel: 'Moderate',
      note: 'The default hire at small Cambodian product companies, where one person carries a feature from database to screen.',
    },
    industries: [
      { sector: 'Technology & Startups', shareOfPostings: 40, exampleEmployers: ['BookMeBus', 'Pathmazing', 'KOOMPI'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 20, exampleEmployers: ['Nham24'] },
      { sector: 'Banking & Finance', shareOfPostings: 17, exampleEmployers: ['Wing Bank'] },
      { sector: 'Education & EdTech', shareOfPostings: 13, exampleEmployers: ['American Intercon School'] },
      { sector: 'Government & NGOs', shareOfPostings: 10, exampleEmployers: ['UNICEF Cambodia'] },
    ],
    companies: [
      hiring('bookmebus', 600, 1800),
      hiring('pathmazing', 700, 2000),
      hiring('nham24', 650, 1800),
      hiring('koompi', 550, 1500),
      hiring('wing', 800, 2200),
      hiring('sabay', 650, 1800),
    ],
    qualifications: {
      technicalSkills: ['A frontend framework', 'A server-side runtime', 'Database design', 'Deployment and environment config', 'Git workflow'],
      softSkills: ['Prioritising under a deadline', 'Talking directly to non-technical stakeholders', 'Knowing when to stop polishing'],
      education: "Bachelor's in IT, Computer Science or equivalent practical experience.",
      certifications: ['None required'],
      experienceExpected: '1–2 years, or a substantial deployed project you maintain.',
    },
    progression: [
      { level: 'Junior Full-Stack Developer', timeline: 'Years 0–2', salaryRangeUsd: '$600–$1,000', skillsToAdvance: ['Ship a vertical slice alone', 'Basic deployment', 'Debug across the stack'] },
      { level: 'Full-Stack Developer', timeline: 'Years 2–4', salaryRangeUsd: '$1,000–$1,800', skillsToAdvance: ['Architecture decisions', 'Testing strategy', 'Cost-aware infrastructure choices'] },
      { level: 'Senior Full-Stack Developer', timeline: 'Years 4–7', salaryRangeUsd: '$1,800–$2,700', skillsToAdvance: ['Technical leadership', 'Mentoring across specialisms', 'Product-level judgement'] },
      { level: 'Technical Lead / CTO at a small firm', timeline: 'Years 7+', salaryRangeUsd: '$2,500–$4,000', skillsToAdvance: ['Team building', 'Budget ownership', 'Long-range technical planning'] },
    ],
    related: [
      { title: 'Software Engineer', relationship: 'Similar role', reason: 'The same work under a broader title at larger employers.', slug: 'software-engineer' },
      { title: 'Product Manager', relationship: 'Lateral move', reason: 'Common for people who enjoy the problem more than the code.', slug: 'product-manager' },
      { title: 'DevOps Engineer', relationship: 'Specialisation', reason: 'You already touch deployment; go deeper.', slug: 'devops-engineer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'mobile-developer',
    overview: {
      demandLevel: 'Medium',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 600, 1000), band('Mid', 1000, 1700), band('Senior', 1700, 2500)],
      openPositions: 85,
      applicantsPerPosition: 18,
      competitionLevel: 'Moderate',
      note: 'Cambodia is a mobile-first market, so the apps matter more than the websites — but the teams building them are small, so postings are fewer.',
    },
    industries: [
      { sector: 'Fintech', shareOfPostings: 32, exampleEmployers: ['Wing Bank'] },
      { sector: 'Banking & Finance', shareOfPostings: 25, exampleEmployers: ['ABA Bank', 'ACLEDA Bank'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 20, exampleEmployers: ['Nham24'] },
      { sector: 'Telecommunications', shareOfPostings: 13, exampleEmployers: ['Smart Axiata', 'Cellcard'] },
      { sector: 'Technology & Startups', shareOfPostings: 10, exampleEmployers: ['BookMeBus'] },
    ],
    companies: [
      hiring('wing', 800, 2200),
      hiring('aba', 800, 2300),
      hiring('nham24', 650, 1700),
      hiring('smart', 700, 1900),
      hiring('acleda', 700, 2000),
      hiring('bookmebus', 600, 1600),
    ],
    qualifications: {
      technicalSkills: ['Kotlin/Swift or React Native/Flutter', 'Offline-first data sync', 'App store release process', 'Push notifications', 'Mobile performance profiling'],
      softSkills: ['Attention to interaction detail', 'Patience with release cycles', 'Handling crash reports from real users'],
      education: "Bachelor's in IT or Computer Science; portfolio apps count heavily.",
      certifications: ['None required'],
      experienceExpected: '1+ years, or one app you have published and maintained.',
    },
    progression: [
      { level: 'Junior Mobile Developer', timeline: 'Years 0–2', salaryRangeUsd: '$600–$1,000', skillsToAdvance: ['Ship a screen to production', 'Handle API failures gracefully', 'Read crash logs'] },
      { level: 'Mobile Developer', timeline: 'Years 2–4', salaryRangeUsd: '$1,000–$1,700', skillsToAdvance: ['Own the release process', 'Offline sync design', 'Khmer localisation done properly'] },
      { level: 'Senior Mobile Developer', timeline: 'Years 4–7', salaryRangeUsd: '$1,700–$2,500', skillsToAdvance: ['Mobile architecture', 'Performance budgets on low-end devices', 'Mentoring'] },
      { level: 'Mobile Lead', timeline: 'Years 7+', salaryRangeUsd: '$2,300–$3,400', skillsToAdvance: ['Platform strategy', 'Release governance', 'Team leadership'] },
    ],
    related: [
      { title: 'Frontend Developer', relationship: 'Similar role', reason: 'Shared component thinking; easy to move between.', slug: 'frontend-developer' },
      { title: 'Full-Stack Developer', relationship: 'Lateral move', reason: 'Broadens you if mobile postings dry up.', slug: 'full-stack-developer' },
      { title: 'UI/UX Designer', relationship: 'Lateral move', reason: 'Mobile developers often have the strongest interaction instincts.', slug: 'ui-ux-designer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'devops-engineer',
    overview: {
      demandLevel: 'Medium',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 800, 1300), band('Mid', 1300, 2200), band('Senior', 2200, 3200)],
      openPositions: 60,
      applicantsPerPosition: 11,
      competitionLevel: 'Low',
      note: 'Few applicants and strong pay, but almost no true graduate roles — most people arrive after two or three years in development or sysadmin work.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 35, exampleEmployers: ['ABA Bank', 'ACLEDA Bank'] },
      { sector: 'Telecommunications', shareOfPostings: 26, exampleEmployers: ['Smart Axiata', 'Metfone'] },
      { sector: 'Fintech', shareOfPostings: 18, exampleEmployers: ['Wing Bank'] },
      { sector: 'Technology & Startups', shareOfPostings: 13, exampleEmployers: ['Pathmazing'] },
      { sector: 'Government & NGOs', shareOfPostings: 8, exampleEmployers: ['Ministry of Post & Telecommunications'] },
    ],
    companies: [
      hiring('aba', 1200, 3000),
      hiring('smart', 1100, 2800),
      hiring('wing', 1100, 2700),
      hiring('acleda', 1000, 2600),
      hiring('metfone', 900, 2300),
      hiring('pathmazing', 900, 2200),
    ],
    qualifications: {
      technicalSkills: ['Linux administration', 'CI/CD pipelines', 'Docker and container orchestration', 'Infrastructure as code (Terraform)', 'Monitoring and alerting'],
      softSkills: ['Calm incident handling', 'Writing runbooks other people can follow', 'Saying no to unsafe releases'],
      education: "Bachelor's in IT, Computer Science or Network Engineering.",
      certifications: ['AWS/Azure associate', 'Certified Kubernetes Administrator (CKA)', 'Often explicitly listed in postings here'],
      experienceExpected: '2–3 years, usually after a development or systems-administration role.',
    },
    progression: [
      { level: 'Junior DevOps / Build Engineer', timeline: 'Years 0–2', salaryRangeUsd: '$800–$1,300', skillsToAdvance: ['Maintain an existing pipeline', 'Container basics', 'Scripting'] },
      { level: 'DevOps Engineer', timeline: 'Years 2–5', salaryRangeUsd: '$1,300–$2,200', skillsToAdvance: ['Infrastructure as code', 'Observability', 'Secrets and access management'] },
      { level: 'Senior DevOps / SRE', timeline: 'Years 5–8', salaryRangeUsd: '$2,200–$3,200', skillsToAdvance: ['Reliability targets and error budgets', 'Multi-environment architecture', 'Cost control'] },
      { level: 'Platform Lead', timeline: 'Years 8+', salaryRangeUsd: '$3,000–$4,500', skillsToAdvance: ['Platform roadmap', 'Vendor negotiation', 'Team leadership'] },
    ],
    related: [
      { title: 'Cloud Engineer', relationship: 'Similar role', reason: 'Heavy overlap; cloud roles lean more toward architecture.', slug: 'cloud-engineer' },
      { title: 'Backend Developer', relationship: 'Lateral move', reason: 'The most common route into and out of DevOps.', slug: 'backend-developer' },
      { title: 'Cybersecurity Analyst', relationship: 'Specialisation', reason: 'Pipeline security is a growing niche here.', slug: 'cybersecurity-analyst' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'qa-engineer',
    overview: {
      demandLevel: 'Medium',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 450, 800), band('Mid', 800, 1400), band('Senior', 1400, 2000)],
      openPositions: 95,
      applicantsPerPosition: 14,
      competitionLevel: 'Low',
      note: 'One of the easiest technical roles to enter in Cambodia, and a reliable route into development if manual testing is where you start.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 33, exampleEmployers: ['ABA Bank', 'ACLEDA Bank'] },
      { sector: 'Technology & Startups', shareOfPostings: 25, exampleEmployers: ['Pathmazing', 'BookMeBus'] },
      { sector: 'Telecommunications', shareOfPostings: 20, exampleEmployers: ['Smart Axiata', 'Cellcard'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 12, exampleEmployers: ['Nham24'] },
      { sector: 'Insurance', shareOfPostings: 10, exampleEmployers: ['Manulife Cambodia'] },
    ],
    companies: [
      hiring('aba', 600, 1800),
      hiring('smart', 550, 1600),
      hiring('pathmazing', 500, 1400),
      hiring('acleda', 550, 1500),
      hiring('nham24', 450, 1200),
      hiring('manulife', 600, 1600),
    ],
    qualifications: {
      technicalSkills: ['Test case design', 'One automation framework (Selenium, Cypress or Playwright)', 'API testing', 'Bug tracking tools', 'SQL for data verification'],
      softSkills: ['Precise bug reports', 'Persistence', 'Pushing back on "it works on my machine"'],
      education: "Bachelor's in IT or a related field; some employers accept a diploma plus demonstrated testing work.",
      certifications: ['ISTQB Foundation is commonly requested'],
      experienceExpected: '0–1 years. This is a genuine graduate-entry role in Cambodia.',
    },
    progression: [
      { level: 'Manual QA Tester', timeline: 'Years 0–2', salaryRangeUsd: '$450–$800', skillsToAdvance: ['Systematic test coverage', 'Clear reproduction steps', 'Basic scripting'] },
      { level: 'QA Automation Engineer', timeline: 'Years 2–4', salaryRangeUsd: '$800–$1,400', skillsToAdvance: ['Build and maintain a test suite', 'CI integration', 'API and data testing'] },
      { level: 'Senior QA Engineer', timeline: 'Years 4–7', salaryRangeUsd: '$1,400–$2,000', skillsToAdvance: ['Test strategy for a product', 'Performance testing', 'Mentoring testers'] },
      { level: 'QA Lead', timeline: 'Years 7+', salaryRangeUsd: '$1,800–$2,800', skillsToAdvance: ['Quality process ownership', 'Release sign-off authority', 'Team management'] },
    ],
    related: [
      { title: 'Software Engineer', relationship: 'Lateral move', reason: 'A very common transition once automation skills are solid.', slug: 'software-engineer' },
      { title: 'DevOps Engineer', relationship: 'Lateral move', reason: 'Test automation and CI work overlap heavily.', slug: 'devops-engineer' },
      { title: 'Business Analyst', relationship: 'Lateral move', reason: 'QA people know the product better than almost anyone.', slug: 'business-analyst' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'data-analyst',
    overview: {
      demandLevel: 'High',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 500, 900), band('Mid', 900, 1600), band('Senior', 1600, 2400)],
      openPositions: 140,
      applicantsPerPosition: 26,
      competitionLevel: 'High',
      note: 'Banks and microfinance institutions are the biggest employers. A public dashboard portfolio separates candidates far more than coursework does.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 40, exampleEmployers: ['ABA Bank', 'ACLEDA Bank', 'Amret Microfinance'] },
      { sector: 'Telecommunications', shareOfPostings: 20, exampleEmployers: ['Smart Axiata', 'Cellcard'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 15, exampleEmployers: ['Nham24'] },
      { sector: 'Government & NGOs', shareOfPostings: 15, exampleEmployers: ['UNICEF Cambodia', 'Ministry of Post & Telecommunications'] },
      { sector: 'Insurance', shareOfPostings: 10, exampleEmployers: ['Manulife Cambodia'] },
    ],
    companies: [
      hiring('aba', 700, 2200),
      hiring('acleda', 650, 2000),
      hiring('smart', 700, 2000),
      hiring('amret', 600, 1700),
      hiring('unicefKh', 800, 2200),
      hiring('nham24', 550, 1500),
    ],
    qualifications: {
      technicalSkills: ['SQL to an advanced level', 'Excel or Google Sheets to an advanced level', 'Power BI or Tableau', 'Basic Python or R', 'Statistics fundamentals'],
      softSkills: ['Explaining a number to a non-technical manager', 'Asking the question behind the request', 'Bilingual reporting in Khmer and English'],
      education: "Bachelor's in IT, Statistics, Economics, Finance or Mathematics.",
      certifications: ['Google Data Analytics Certificate', 'Microsoft Power BI (PL-300)'],
      experienceExpected: '0–1 years. Portfolio dashboards substitute effectively for experience.',
    },
    progression: [
      { level: 'Junior Data Analyst', timeline: 'Years 0–2', salaryRangeUsd: '$500–$900', skillsToAdvance: ['Reliable SQL', 'Clean chart design', 'Checking your own numbers'] },
      { level: 'Data Analyst', timeline: 'Years 2–4', salaryRangeUsd: '$900–$1,600', skillsToAdvance: ['Owning a reporting domain', 'Statistical testing', 'Stakeholder management'] },
      { level: 'Senior Data Analyst', timeline: 'Years 4–7', salaryRangeUsd: '$1,600–$2,400', skillsToAdvance: ['Framing business questions', 'Experiment design', 'Mentoring analysts'] },
      { level: 'Analytics Lead / Data Manager', timeline: 'Years 7+', salaryRangeUsd: '$2,200–$3,500', skillsToAdvance: ['Data strategy', 'Team leadership', 'Governance and data quality'] },
    ],
    related: [
      { title: 'Data Engineer', relationship: 'Specialisation', reason: 'Move toward the pipelines that feed your dashboards.', slug: 'data-engineer' },
      { title: 'Business Analyst', relationship: 'Lateral move', reason: 'Same evidence-gathering instinct, applied to process.', slug: 'business-analyst' },
      { title: 'Product Manager', relationship: 'Lateral move', reason: 'Analysts who frame good questions often end up here.', slug: 'product-manager' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'business-analyst',
    overview: {
      demandLevel: 'Medium',
      growthTrend: 'Stable',
      salaryBands: [band('Entry', 550, 950), band('Mid', 950, 1700), band('Senior', 1700, 2500)],
      openPositions: 75,
      applicantsPerPosition: 22,
      competitionLevel: 'Moderate',
      note: 'Almost entirely a banking and insurance role in Cambodia. Employers weigh communication and documentation above technical depth.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 45, exampleEmployers: ['ABA Bank', 'ACLEDA Bank', 'Canadia Bank'] },
      { sector: 'Insurance', shareOfPostings: 18, exampleEmployers: ['Manulife Cambodia'] },
      { sector: 'Telecommunications', shareOfPostings: 15, exampleEmployers: ['Smart Axiata'] },
      { sector: 'Government & NGOs', shareOfPostings: 12, exampleEmployers: ['UNICEF Cambodia'] },
      { sector: 'Technology & Startups', shareOfPostings: 10, exampleEmployers: ['Pathmazing'] },
    ],
    companies: [
      hiring('aba', 800, 2300),
      hiring('acleda', 700, 2000),
      hiring('manulife', 750, 2100),
      hiring('canadia', 700, 2000),
      hiring('smart', 750, 2100),
      hiring('unicefKh', 900, 2400),
    ],
    qualifications: {
      technicalSkills: ['Requirements documentation', 'Process modelling (BPMN)', 'SQL for data checks', 'Wireframing', 'Familiarity with the SDLC'],
      softSkills: ['Facilitating a room', 'Writing unambiguously', 'Managing disagreement between departments', 'Khmer and English fluency'],
      education: "Bachelor's in IT, Business, Finance or Management Information Systems.",
      certifications: ['IIBA ECBA or CCBA', 'Agile/Scrum foundation'],
      experienceExpected: '1–2 years, often after a support, operations or QA role.',
    },
    progression: [
      { level: 'Junior Business Analyst', timeline: 'Years 0–2', salaryRangeUsd: '$550–$950', skillsToAdvance: ['Capture requirements accurately', 'Map an existing process', 'Run a short workshop'] },
      { level: 'Business Analyst', timeline: 'Years 2–5', salaryRangeUsd: '$950–$1,700', skillsToAdvance: ['Own a project\u2019s requirements', 'Impact analysis', 'Negotiating scope'] },
      { level: 'Senior Business Analyst', timeline: 'Years 5–8', salaryRangeUsd: '$1,700–$2,500', skillsToAdvance: ['Cross-department programmes', 'Vendor assessment', 'Coaching analysts'] },
      { level: 'BA Lead / Product Owner', timeline: 'Years 8+', salaryRangeUsd: '$2,300–$3,400', skillsToAdvance: ['Portfolio prioritisation', 'Executive communication', 'Team management'] },
    ],
    related: [
      { title: 'Product Manager', relationship: 'Similar role', reason: 'The most common next title for strong BAs here.', slug: 'product-manager' },
      { title: 'Data Analyst', relationship: 'Lateral move', reason: 'If you want the numbers side rather than the process side.', slug: 'data-analyst' },
      { title: 'QA Engineer', relationship: 'Lateral move', reason: 'Requirements and acceptance testing sit close together.', slug: 'qa-engineer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'data-engineer',
    overview: {
      demandLevel: 'Medium',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 800, 1300), band('Mid', 1300, 2100), band('Senior', 2100, 3000)],
      openPositions: 45,
      applicantsPerPosition: 9,
      competitionLevel: 'Low',
      note: 'The shortest applicant queue of any role on this list. Cambodian banks and telcos are building their first data warehouses and cannot fill these seats.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 42, exampleEmployers: ['ABA Bank', 'ACLEDA Bank'] },
      { sector: 'Telecommunications', shareOfPostings: 25, exampleEmployers: ['Smart Axiata', 'Metfone'] },
      { sector: 'Fintech', shareOfPostings: 15, exampleEmployers: ['Wing Bank'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 10, exampleEmployers: ['Nham24'] },
      { sector: 'Government & NGOs', shareOfPostings: 8, exampleEmployers: ['UNICEF Cambodia'] },
    ],
    companies: [
      hiring('aba', 1200, 3000),
      hiring('smart', 1100, 2700),
      hiring('acleda', 1000, 2500),
      hiring('wing', 1100, 2600),
      hiring('metfone', 900, 2200),
      hiring('nham24', 800, 1900),
    ],
    qualifications: {
      technicalSkills: ['Advanced SQL', 'Python', 'ETL orchestration (Airflow or similar)', 'Warehouse modelling (star schema)', 'Cloud data services'],
      softSkills: ['Defensive thinking about data quality', 'Documenting lineage', 'Working with analysts as customers'],
      education: "Bachelor's in Computer Science, IT or a quantitative field.",
      certifications: ['Cloud data engineering associate certifications carry real weight here'],
      experienceExpected: '2+ years, commonly after a backend or analyst role.',
    },
    progression: [
      { level: 'Junior Data Engineer', timeline: 'Years 0–2', salaryRangeUsd: '$800–$1,300', skillsToAdvance: ['Build a reliable batch job', 'Schema design', 'Version-controlled pipelines'] },
      { level: 'Data Engineer', timeline: 'Years 2–5', salaryRangeUsd: '$1,300–$2,100', skillsToAdvance: ['Orchestration at scale', 'Streaming ingestion', 'Automated data quality checks'] },
      { level: 'Senior Data Engineer', timeline: 'Years 5–8', salaryRangeUsd: '$2,100–$3,000', skillsToAdvance: ['Warehouse architecture', 'Cost and performance tuning', 'Mentoring'] },
      { level: 'Data Platform Lead', timeline: 'Years 8+', salaryRangeUsd: '$2,800–$4,200', skillsToAdvance: ['Platform strategy', 'Governance', 'Team leadership'] },
    ],
    related: [
      { title: 'Backend Developer', relationship: 'Similar role', reason: 'Nearly the same toolkit, pointed at data instead of requests.', slug: 'backend-developer' },
      { title: 'Data Analyst', relationship: 'Lateral move', reason: 'If you prefer answering questions to moving the data.', slug: 'data-analyst' },
      { title: 'Cloud Engineer', relationship: 'Lateral move', reason: 'Managed data services sit in both job descriptions.', slug: 'cloud-engineer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'cybersecurity-analyst',
    overview: {
      demandLevel: 'High',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 700, 1200), band('Mid', 1200, 2000), band('Senior', 2000, 3000)],
      openPositions: 70,
      applicantsPerPosition: 12,
      competitionLevel: 'Low',
      note: 'Cambodia\u2019s banking regulator has pushed security staffing hard, so demand is real and the applicant pool is thin. Certifications matter more here than in any other role on this list.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 44, exampleEmployers: ['ABA Bank', 'ACLEDA Bank', 'Canadia Bank'] },
      { sector: 'Telecommunications', shareOfPostings: 22, exampleEmployers: ['Smart Axiata', 'Metfone'] },
      { sector: 'Fintech', shareOfPostings: 16, exampleEmployers: ['Wing Bank'] },
      { sector: 'Government & NGOs', shareOfPostings: 12, exampleEmployers: ['Ministry of Post & Telecommunications'] },
      { sector: 'Insurance', shareOfPostings: 6, exampleEmployers: ['Manulife Cambodia'] },
    ],
    companies: [
      hiring('aba', 1000, 2800),
      hiring('acleda', 900, 2500),
      hiring('canadia', 900, 2400),
      hiring('smart', 950, 2600),
      hiring('wing', 950, 2500),
      hiring('ministry', 700, 1800),
    ],
    qualifications: {
      technicalSkills: ['Network fundamentals and packet analysis', 'SIEM tooling', 'Vulnerability assessment', 'Incident response process', 'Scripting for automation'],
      softSkills: ['Writing an incident report under time pressure', 'Explaining risk to executives', 'Discretion'],
      education: "Bachelor's in Computer Science, IT or Network Security.",
      certifications: ['CompTIA Security+ (common entry requirement)', 'CEH', 'CISSP for senior roles'],
      experienceExpected: '1–2 years, often after IT support or network administration.',
    },
    progression: [
      { level: 'Junior Security Analyst / SOC Tier 1', timeline: 'Years 0–2', salaryRangeUsd: '$700–$1,200', skillsToAdvance: ['Triage alerts accurately', 'Log analysis', 'Security+ certification'] },
      { level: 'Security Analyst', timeline: 'Years 2–5', salaryRangeUsd: '$1,200–$2,000', skillsToAdvance: ['Lead an incident', 'Vulnerability management programme', 'Threat hunting'] },
      { level: 'Senior Security Analyst', timeline: 'Years 5–8', salaryRangeUsd: '$2,000–$3,000', skillsToAdvance: ['Security architecture review', 'Regulatory compliance', 'Mentoring the SOC'] },
      { level: 'Security Manager / CISO track', timeline: 'Years 8+', salaryRangeUsd: '$2,800–$4,500', skillsToAdvance: ['Risk governance', 'Board reporting', 'Budget and team ownership'] },
    ],
    related: [
      { title: 'Cloud Engineer', relationship: 'Lateral move', reason: 'Cloud security is where the two roles meet.', slug: 'cloud-engineer' },
      { title: 'DevOps Engineer', relationship: 'Lateral move', reason: 'Pipeline and infrastructure security overlaps directly.', slug: 'devops-engineer' },
      { title: 'IT Support Specialist', relationship: 'Similar role', reason: 'The usual starting point if you need experience first.', slug: 'it-support-specialist' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'cloud-engineer',
    overview: {
      demandLevel: 'Medium',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 800, 1400), band('Mid', 1400, 2300), band('Senior', 2300, 3300)],
      openPositions: 50,
      applicantsPerPosition: 10,
      competitionLevel: 'Low',
      note: 'Enterprises here are mid-migration, so the work is real but the hiring bar is a certification plus evidence you have run something in production.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 36, exampleEmployers: ['ABA Bank', 'Canadia Bank'] },
      { sector: 'Telecommunications', shareOfPostings: 28, exampleEmployers: ['Smart Axiata', 'Metfone', 'Cellcard'] },
      { sector: 'Fintech', shareOfPostings: 16, exampleEmployers: ['Wing Bank'] },
      { sector: 'Technology & Startups', shareOfPostings: 12, exampleEmployers: ['Pathmazing'] },
      { sector: 'Government & NGOs', shareOfPostings: 8, exampleEmployers: ['Ministry of Post & Telecommunications'] },
    ],
    companies: [
      hiring('smart', 1200, 3000),
      hiring('aba', 1200, 2900),
      hiring('metfone', 1000, 2400),
      hiring('wing', 1100, 2600),
      hiring('cellcard', 1000, 2400),
      hiring('pathmazing', 900, 2200),
    ],
    qualifications: {
      technicalSkills: ['One major cloud platform to depth', 'Networking and IAM', 'Infrastructure as code', 'Backup and disaster recovery', 'Cost management'],
      softSkills: ['Documenting architecture decisions', 'Working with procurement and vendors', 'Explaining cost trade-offs'],
      education: "Bachelor's in IT, Computer Science or Network Engineering.",
      certifications: ['AWS Solutions Architect Associate', 'Azure Administrator (AZ-104)', 'Frequently a hard requirement, not a bonus'],
      experienceExpected: '2–3 years in systems, network or development work.',
    },
    progression: [
      { level: 'Cloud Support / Junior Cloud Engineer', timeline: 'Years 0–2', salaryRangeUsd: '$800–$1,400', skillsToAdvance: ['Associate certification', 'Provision and monitor basic services', 'Scripting'] },
      { level: 'Cloud Engineer', timeline: 'Years 2–5', salaryRangeUsd: '$1,400–$2,300', skillsToAdvance: ['Design a resilient environment', 'IAM at organisation scale', 'Migration delivery'] },
      { level: 'Senior Cloud Engineer', timeline: 'Years 5–8', salaryRangeUsd: '$2,300–$3,300', skillsToAdvance: ['Multi-account architecture', 'Disaster recovery testing', 'Cost governance'] },
      { level: 'Cloud Architect', timeline: 'Years 8+', salaryRangeUsd: '$3,000–$4,800', skillsToAdvance: ['Enterprise architecture', 'Vendor strategy', 'Technical leadership'] },
    ],
    related: [
      { title: 'DevOps Engineer', relationship: 'Similar role', reason: 'Often the same job under a different title in Cambodia.', slug: 'devops-engineer' },
      { title: 'Cybersecurity Analyst', relationship: 'Lateral move', reason: 'Cloud security is an underfilled niche.', slug: 'cybersecurity-analyst' },
      { title: 'Data Engineer', relationship: 'Lateral move', reason: 'Managed data services bridge the two.', slug: 'data-engineer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'ui-ux-designer',
    overview: {
      demandLevel: 'Medium',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 450, 800), band('Mid', 800, 1500), band('Senior', 1500, 2300)],
      openPositions: 65,
      applicantsPerPosition: 30,
      competitionLevel: 'High',
      note: 'Many applicants, few roles that are genuinely UX rather than visual design. Postings that say "UI/UX" often mean graphic design — read them carefully.',
    },
    industries: [
      { sector: 'Technology & Startups', shareOfPostings: 34, exampleEmployers: ['Pathmazing', 'BookMeBus', 'KOOMPI'] },
      { sector: 'Fintech', shareOfPostings: 22, exampleEmployers: ['Wing Bank'] },
      { sector: 'Media & Technology', shareOfPostings: 18, exampleEmployers: ['Sabay Digital'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 14, exampleEmployers: ['Nham24'] },
      { sector: 'Banking & Finance', shareOfPostings: 12, exampleEmployers: ['ABA Bank'] },
    ],
    companies: [
      hiring('pathmazing', 600, 1800),
      hiring('wing', 700, 2000),
      hiring('sabay', 550, 1600),
      hiring('aba', 700, 1900),
      hiring('nham24', 500, 1400),
      hiring('bookmebus', 450, 1300),
    ],
    qualifications: {
      technicalSkills: ['Figma', 'Prototyping and interaction states', 'Design systems', 'User research methods', 'Usability testing'],
      softSkills: ['Presenting and defending a design decision', 'Taking critique without taking it personally', 'Designing for Khmer and English side by side'],
      education: "Bachelor's in Design, IT, Multimedia or a strong self-taught portfolio.",
      certifications: ['None required', 'Google UX Design Certificate is a common portfolio starter'],
      experienceExpected: '1+ years, or a portfolio with two or three documented case studies.',
    },
    progression: [
      { level: 'Junior UI/UX Designer', timeline: 'Years 0–2', salaryRangeUsd: '$450–$800', skillsToAdvance: ['Consistent visual execution', 'Component thinking', 'Running a basic usability test'] },
      { level: 'UI/UX Designer', timeline: 'Years 2–4', salaryRangeUsd: '$800–$1,500', skillsToAdvance: ['Owning a product area', 'Research that changes the design', 'Working from metrics'] },
      { level: 'Senior Designer', timeline: 'Years 4–7', salaryRangeUsd: '$1,500–$2,300', skillsToAdvance: ['Design-system ownership', 'Facilitating workshops', 'Mentoring'] },
      { level: 'Design Lead', timeline: 'Years 7+', salaryRangeUsd: '$2,000–$3,200', skillsToAdvance: ['Design strategy', 'Hiring and team building', 'Stakeholder influence'] },
    ],
    related: [
      { title: 'Frontend Developer', relationship: 'Lateral move', reason: 'Designers who code have an unusual advantage in this market.', slug: 'frontend-developer' },
      { title: 'Product Manager', relationship: 'Lateral move', reason: 'Research skills transfer directly.', slug: 'product-manager' },
      { title: 'Mobile Developer', relationship: 'Similar role', reason: 'Mobile-first design is where most of the local work is.', slug: 'mobile-developer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'product-manager',
    overview: {
      demandLevel: 'Low',
      growthTrend: 'Growing',
      salaryBands: [band('Entry', 900, 1500), band('Mid', 1500, 2500), band('Senior', 2500, 3800)],
      openPositions: 30,
      applicantsPerPosition: 40,
      competitionLevel: 'High',
      note: 'Well paid but scarce, and almost never a first job. Most Cambodian PMs arrive from engineering, analysis or business-analyst roles after three or four years.',
    },
    industries: [
      { sector: 'Fintech', shareOfPostings: 33, exampleEmployers: ['Wing Bank'] },
      { sector: 'Banking & Finance', shareOfPostings: 27, exampleEmployers: ['ABA Bank', 'ACLEDA Bank'] },
      { sector: 'Technology & Startups', shareOfPostings: 20, exampleEmployers: ['Pathmazing', 'BookMeBus'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 12, exampleEmployers: ['Nham24'] },
      { sector: 'Telecommunications', shareOfPostings: 8, exampleEmployers: ['Smart Axiata'] },
    ],
    companies: [
      hiring('wing', 1500, 3500),
      hiring('aba', 1500, 3400),
      hiring('smart', 1400, 3200),
      hiring('acleda', 1300, 3000),
      hiring('pathmazing', 1000, 2400),
      hiring('nham24', 900, 2200),
    ],
    qualifications: {
      technicalSkills: ['Product metrics and funnels', 'Roadmap and backlog tooling', 'Enough technical literacy to argue with engineers', 'Basic SQL', 'User research'],
      softSkills: ['Written clarity', 'Saying no with reasons', 'Facilitating between engineering, design and business', 'Khmer and English fluency'],
      education: "Bachelor's in Business, IT, Engineering or Economics. An MBA appears in senior postings.",
      certifications: ['Certified Scrum Product Owner (CSPO)', 'Agile certifications are commonly listed'],
      experienceExpected: '3+ years in a delivery role first. Associate PM roles are rare here.',
    },
    progression: [
      { level: 'Associate Product Manager', timeline: 'Years 0–2 in product', salaryRangeUsd: '$900–$1,500', skillsToAdvance: ['Write clear specs', 'Run a sprint cycle', 'Read product metrics honestly'] },
      { level: 'Product Manager', timeline: 'Years 2–5 in product', salaryRangeUsd: '$1,500–$2,500', skillsToAdvance: ['Own a roadmap', 'Discovery interviews', 'Prioritising against business goals'] },
      { level: 'Senior Product Manager', timeline: 'Years 5–8', salaryRangeUsd: '$2,500–$3,800', skillsToAdvance: ['Product strategy', 'Influencing without authority', 'Pricing and business cases'] },
      { level: 'Head of Product', timeline: 'Years 8+', salaryRangeUsd: '$3,500–$5,500', skillsToAdvance: ['Portfolio strategy', 'Building a product team', 'Executive stakeholder management'] },
    ],
    related: [
      { title: 'Business Analyst', relationship: 'Similar role', reason: 'The most realistic entry point in Cambodia.', slug: 'business-analyst' },
      { title: 'Data Analyst', relationship: 'Lateral move', reason: 'Another common route in, via metrics ownership.', slug: 'data-analyst' },
      { title: 'Full-Stack Developer', relationship: 'Lateral move', reason: 'Engineers who like the problem framing often switch.', slug: 'full-stack-developer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },

  {
    slug: 'it-support-specialist',
    overview: {
      demandLevel: 'High',
      growthTrend: 'Stable',
      salaryBands: [band('Entry', 300, 550), band('Mid', 550, 900), band('Senior', 900, 1400)],
      openPositions: 210,
      applicantsPerPosition: 35,
      competitionLevel: 'High',
      note: 'The highest volume of postings and the lowest pay. Useful as a first job and a documented route into security or cloud work — not as a destination.',
    },
    industries: [
      { sector: 'Banking & Finance', shareOfPostings: 28, exampleEmployers: ['ACLEDA Bank', 'Canadia Bank', 'Amret Microfinance'] },
      { sector: 'Education & EdTech', shareOfPostings: 22, exampleEmployers: ['American Intercon School'] },
      { sector: 'Telecommunications', shareOfPostings: 18, exampleEmployers: ['Cellcard', 'Metfone'] },
      { sector: 'Government & NGOs', shareOfPostings: 17, exampleEmployers: ['Ministry of Post & Telecommunications', 'UNICEF Cambodia'] },
      { sector: 'E-commerce & Delivery', shareOfPostings: 15, exampleEmployers: ['Nham24'] },
    ],
    companies: [
      hiring('acleda', 350, 1200),
      hiring('aii', 300, 900),
      hiring('cellcard', 400, 1200),
      hiring('metfone', 350, 1100),
      hiring('canadia', 400, 1300),
      hiring('unicefKh', 500, 1400),
    ],
    qualifications: {
      technicalSkills: ['Windows and Linux desktop support', 'Networking basics', 'Hardware diagnostics', 'Active Directory', 'Ticketing systems'],
      softSkills: ['Patience with non-technical colleagues', 'Khmer and English support writing', 'Prioritising a queue'],
      education: 'Diploma or Bachelor in IT. This is one of the few technical roles where a diploma is genuinely sufficient.',
      certifications: ['CompTIA A+', 'CompTIA Network+', 'ITIL Foundation'],
      experienceExpected: '0 years. A true entry-level role.',
    },
    progression: [
      { level: 'IT Support Officer', timeline: 'Years 0–2', salaryRangeUsd: '$300–$550', skillsToAdvance: ['Close tickets independently', 'Document fixes', 'Network fundamentals'] },
      { level: 'Senior IT Support / Systems Administrator', timeline: 'Years 2–5', salaryRangeUsd: '$550–$900', skillsToAdvance: ['Server administration', 'Backup management', 'Scripting repetitive work'] },
      { level: 'IT Infrastructure Officer', timeline: 'Years 5–8', salaryRangeUsd: '$900–$1,400', skillsToAdvance: ['Virtualisation', 'Security hardening', 'Vendor coordination'] },
      { level: 'IT Manager', timeline: 'Years 8+', salaryRangeUsd: '$1,400–$2,500', skillsToAdvance: ['Budgeting', 'Team management', 'IT policy and compliance'] },
    ],
    related: [
      { title: 'Cybersecurity Analyst', relationship: 'Specialisation', reason: 'The best-paid escape route from support work here.', slug: 'cybersecurity-analyst' },
      { title: 'Cloud Engineer', relationship: 'Specialisation', reason: 'Systems administration is the usual on-ramp.', slug: 'cloud-engineer' },
      { title: 'QA Engineer', relationship: 'Lateral move', reason: 'A realistic sideways step into software work.', slug: 'qa-engineer' },
    ],
    sources: PROTOTYPE_SOURCES,
    lastReviewed: REVIEWED,
  },
];

export const MARKET_PROFILE_BY_SLUG = new Map(
  profiles.map((profile) => [profile.slug, profile])
);

export function getMarketProfile(slug: string): CareerMarketProfile | undefined {
  return MARKET_PROFILE_BY_SLUG.get(slug);
}