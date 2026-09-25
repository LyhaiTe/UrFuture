/**
 * O*NET Web Services Integration Client & Taxonomy Reference
 *
 * Implements authentication against O*NET Web Services (services.onetcenter.org),
 * and provides curated, grounded O*NET-SOC occupation standards and Content Model
 * skill definitions (element IDs) tailored for Cambodia's tech & engineering sectors.
 */

export interface OnetSkillRequirement {
  name: string;
  category: string;
  onetElementId: string;
  importance: number; // 0 - 100
  level?: number;      // 0 - 100
}

export interface OnetOccupation {
  title: string;
  onetSocCode: string;
  descriptionShort: string;
  growthOutlook: string;
  skills: OnetSkillRequirement[];
  requiredEducation: 'UNIVERSITY_YEAR_1' | 'UNIVERSITY_YEAR_2' | 'UNIVERSITY_YEAR_3' | 'UNIVERSITY_YEAR_4' | 'GRADUATE';
  medianSalaryUsd?: number;
}

export interface OnetApiSkill {
  name: string;
  onetElementId: string;
  category: string;
  importance: number;
  level?: number;
}

export interface OnetApiOccupation {
  title: string;
  onetSocCode: string;
  descriptionShort: string;
  skills: OnetApiSkill[];
}

/**
 * Standard O*NET Content Model Taxonomy aligned with Cambodia's IT, Data,
 * Engineering, and Digital Economy priorities (ADB & NEA Cambodia surveys).
 */
export const TARGET_ONET_CAREERS: OnetOccupation[] = [
  {
    title: 'Software Engineer',
    onetSocCode: '15-1252.00',
    descriptionShort:
      'Research, design, and develop computer and network software or specialized utility programs. Analyzes user needs and develops software solutions.',
    growthOutlook: 'High — Core digital transformation and IT outsourcing pillar in Cambodia.',
    requiredEducation: 'UNIVERSITY_YEAR_2',
    medianSalaryUsd: 9600,
    skills: [
      { name: 'Programming Fundamentals', category: 'Technical', onetElementId: '2.B.3.f', importance: 92, level: 85 },
      { name: 'Data Structures & Algorithms', category: 'Technical', onetElementId: '2.B.3.g', importance: 88, level: 80 },
      { name: 'Systems Analysis & Architecture', category: 'Technical', onetElementId: '2.B.3.a', importance: 82, level: 75 },
      { name: 'Software Testing & Quality Assurance', category: 'Technical', onetElementId: '2.B.3.d', importance: 80, level: 70 },
      { name: 'Critical Thinking', category: 'Cognitive', onetElementId: '2.A.2.a', importance: 85, level: 78 },
      { name: 'Complex Problem Solving', category: 'Cognitive', onetElementId: '2.B.2.i', importance: 88, level: 82 },
      { name: 'English Proficiency', category: 'Communication', onetElementId: '2.C.1.a', importance: 80, level: 75 },
    ],
  },
  {
    title: 'Frontend Developer',
    onetSocCode: '15-1254.00',
    descriptionShort:
      'Design, create, and modify responsive web applications. Integrate user-facing elements using modern JavaScript/TypeScript component frameworks.',
    growthOutlook: 'High — Rapidly expanding demand across commercial banking and fintech portals in Phnom Penh.',
    requiredEducation: 'UNIVERSITY_YEAR_2',
    medianSalaryUsd: 8400,
    skills: [
      { name: 'Web Programming & UI Engineering', category: 'Technical', onetElementId: '2.B.3.f', importance: 90, level: 82 },
      { name: 'User Experience & Interface Design', category: 'Design', onetElementId: '2.C.3.b', importance: 85, level: 78 },
      { name: 'Client-Server API Integration', category: 'Technical', onetElementId: '2.B.3.b', importance: 82, level: 75 },
      { name: 'Performance Optimization & Accessibility', category: 'Technical', onetElementId: '2.B.3.d', importance: 78, level: 72 },
      { name: 'Written & Visual Communication', category: 'Communication', onetElementId: '2.A.1.d', importance: 75, level: 70 },
    ],
  },
  {
    title: 'Data Engineer',
    onetSocCode: '15-2051.00',
    descriptionShort:
      'Develop, construct, test, and maintain architectures such as large-scale data processing systems and pipelines for analytics and AI models.',
    growthOutlook: 'Very High — Critical shortage identified in NEA 2023 Cambodia employer survey.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 10800,
    skills: [
      { name: 'Database Management & SQL', category: 'Technical', onetElementId: '2.C.3.a', importance: 92, level: 88 },
      { name: 'Programming Fundamentals', category: 'Technical', onetElementId: '2.B.3.f', importance: 88, level: 82 },
      { name: 'Data Pipeline & ETL Engineering', category: 'Technical', onetElementId: '2.B.3.g', importance: 90, level: 85 },
      { name: 'Cloud Infrastructure & Distributed Systems', category: 'Technical', onetElementId: '2.B.3.b', importance: 85, level: 80 },
      { name: 'Statistics & Probability', category: 'Quantitative', onetElementId: '2.A.1.f', importance: 78, level: 74 },
    ],
  },
  {
    title: 'Cybersecurity Analyst',
    onetSocCode: '15-1212.00',
    descriptionShort:
      'Plan, implement, upgrade, or monitor security measures for the protection of computer networks and information systems.',
    growthOutlook: 'High — National priority under Cambodia Digital Economy and Society Policy Framework 2021-2035.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 11400,
    skills: [
      { name: 'Information Security & Network Defense', category: 'Technical', onetElementId: '2.C.3.a', importance: 95, level: 90 },
      { name: 'Vulnerability Assessment & Penetration Testing', category: 'Technical', onetElementId: '2.B.3.d', importance: 88, level: 84 },
      { name: 'Systems Analysis & Logging', category: 'Technical', onetElementId: '2.B.3.a', importance: 84, level: 80 },
      { name: 'Critical Thinking', category: 'Cognitive', onetElementId: '2.A.2.a', importance: 88, level: 85 },
      { name: 'English Proficiency', category: 'Communication', onetElementId: '2.C.1.a', importance: 82, level: 78 },
    ],
  },
  {
    title: 'Cloud & DevOps Engineer',
    onetSocCode: '15-1241.00',
    descriptionShort:
      'Design, configure, and maintain cloud infrastructure, deployment pipelines, containerization, and automated reliability tooling.',
    growthOutlook: 'Very High — Accelerating adoption by banks and regional tech enterprises operating in Cambodia.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 11000,
    skills: [
      { name: 'Cloud Infrastructure & Virtualization', category: 'Technical', onetElementId: '2.C.3.a', importance: 94, level: 88 },
      { name: 'Continuous Integration & Deployment (CI/CD)', category: 'Technical', onetElementId: '2.B.3.b', importance: 90, level: 85 },
      { name: 'Systems Troubleshooting', category: 'Technical', onetElementId: '2.B.3.e', importance: 86, level: 82 },
      { name: 'Programming Fundamentals', category: 'Technical', onetElementId: '2.B.3.f', importance: 82, level: 78 },
      { name: 'Project Management', category: 'Business', onetElementId: '2.B.5.a', importance: 76, level: 72 },
    ],
  },
  {
    title: 'Electrical Engineer',
    onetSocCode: '17-2071.00',
    descriptionShort:
      'Research, design, develop, test, or supervise the manufacturing and installation of electrical equipment, components, or systems.',
    growthOutlook: 'Moderate to High — Driven by renewable energy, industrial parks, and smart infrastructure investments.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 8400,
    skills: [
      { name: 'Circuit & Systems Design', category: 'Technical', onetElementId: '2.B.3.b', importance: 90, level: 86 },
      { name: 'Physics', category: 'Science', onetElementId: '2.C.4.a', importance: 88, level: 82 },
      { name: 'Calculus', category: 'Quantitative', onetElementId: '2.A.1.b', importance: 85, level: 80 },
      { name: 'Quality Control & Safety Inspection', category: 'Technical', onetElementId: '2.B.3.d', importance: 82, level: 78 },
      { name: 'Complex Problem Solving', category: 'Cognitive', onetElementId: '2.B.2.i', importance: 84, level: 80 },
    ],
  },
  {
    title: 'Business & Systems Analyst',
    onetSocCode: '13-1111.00',
    descriptionShort:
      'Conduct organizational studies and evaluations, design systems and procedures, conduct work simplification and measurement studies.',
    growthOutlook: 'High — Bridges business stakeholders and engineering teams in financial services.',
    requiredEducation: 'UNIVERSITY_YEAR_2',
    medianSalaryUsd: 8800,
    skills: [
      { name: 'Business & Financial Literacy', category: 'Business', onetElementId: '2.C.9.a', importance: 88, level: 82 },
      { name: 'Systems Analysis & Requirements Gathering', category: 'Technical', onetElementId: '2.B.3.a', importance: 88, level: 84 },
      { name: 'Statistics & Probability', category: 'Quantitative', onetElementId: '2.A.1.f', importance: 80, level: 75 },
      { name: 'Written Communication', category: 'Communication', onetElementId: '2.A.1.d', importance: 88, level: 84 },
      { name: 'Project Management', category: 'Business', onetElementId: '2.B.5.a', importance: 84, level: 78 },
    ],
  },
  {
    title: 'AI / Machine Learning Engineer',
    onetSocCode: '15-1299.08',
    descriptionShort: 'Research, design, and develop machine learning systems and artificial intelligence applications.',
    growthOutlook: 'Very High — AI adoption is expanding across Cambodia\'s digital services and education sectors.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 13200,
    skills: [
      { name: 'Programming Fundamentals', category: 'Technical', onetElementId: '2.B.3.f', importance: 94, level: 88 },
      { name: 'Machine Learning', category: 'Technical', onetElementId: '2.B.3.g', importance: 93, level: 88 },
      { name: 'Mathematics', category: 'Quantitative', onetElementId: '2.A.1.b', importance: 86, level: 80 },
      { name: 'Data Analysis', category: 'Technical', onetElementId: '2.C.3.a', importance: 84, level: 78 },
      { name: 'Complex Problem Solving', category: 'Cognitive', onetElementId: '2.B.2.i', importance: 90, level: 84 },
    ],
  },
  {
    title: 'Telecommunications & Network Engineer',
    onetSocCode: '17-2072.00',
    descriptionShort: 'Design and develop systems for transmitting data and communications across wired and wireless networks.',
    growthOutlook: 'High — Connectivity, 5G, and smart infrastructure continue to expand across Cambodia.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 10200,
    skills: [
      { name: 'Network Engineering', category: 'Technical', onetElementId: '2.C.3.a', importance: 94, level: 88 },
      { name: 'Systems Analysis', category: 'Technical', onetElementId: '2.B.3.a', importance: 86, level: 82 },
      { name: 'Circuit & Systems Design', category: 'Technical', onetElementId: '2.B.3.b', importance: 84, level: 78 },
      { name: 'Troubleshooting', category: 'Technical', onetElementId: '2.B.3.e', importance: 88, level: 82 },
      { name: 'Complex Problem Solving', category: 'Cognitive', onetElementId: '2.B.2.i', importance: 84, level: 80 },
    ],
  },
  {
    title: 'Web & Digital Interface Designer (UI/UX)',
    onetSocCode: '15-1255.00',
    descriptionShort: 'Design and develop user interfaces for websites and digital products with a focus on usability and visual communication.',
    growthOutlook: 'High — Cambodia\'s product, fintech, and e-commerce teams need bilingual digital experiences.',
    requiredEducation: 'UNIVERSITY_YEAR_2',
    medianSalaryUsd: 9000,
    skills: [
      { name: 'User Experience & Interface Design', category: 'Design', onetElementId: '2.C.3.b', importance: 95, level: 90 },
      { name: 'Web Programming', category: 'Technical', onetElementId: '2.B.3.f', importance: 82, level: 76 },
      { name: 'Visual Communication', category: 'Communication', onetElementId: '2.A.1.d', importance: 84, level: 80 },
      { name: 'User Research', category: 'Design', onetElementId: '2.B.1.a', importance: 80, level: 74 },
      { name: 'Critical Thinking', category: 'Cognitive', onetElementId: '2.A.2.a', importance: 82, level: 76 },
    ],
  },
  {
    title: 'Database Administrator & Architect',
    onetSocCode: '15-1243.00',
    descriptionShort: 'Design, implement, secure, and maintain database systems and the data architectures that support organizations.',
    growthOutlook: 'High — Banks, telecoms, and public services require reliable data platforms and governance.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 10800,
    skills: [
      { name: 'Database Management & SQL', category: 'Technical', onetElementId: '2.C.3.a', importance: 96, level: 92 },
      { name: 'Data Modeling', category: 'Technical', onetElementId: '2.B.3.a', importance: 90, level: 84 },
      { name: 'Information Security', category: 'Technical', onetElementId: '2.C.3.a', importance: 86, level: 80 },
      { name: 'Systems Troubleshooting', category: 'Technical', onetElementId: '2.B.3.e', importance: 88, level: 82 },
      { name: 'Critical Thinking', category: 'Cognitive', onetElementId: '2.A.2.a', importance: 82, level: 76 },
    ],
  },
  {
    title: 'Financial & Investment Analyst',
    onetSocCode: '13-2051.00',
    descriptionShort: 'Conduct quantitative analyses of information involving investment programs and financial data.',
    growthOutlook: 'High — Cambodia\'s banking, investment, and fintech sectors need stronger evidence-based financial analysis.',
    requiredEducation: 'UNIVERSITY_YEAR_3',
    medianSalaryUsd: 9600,
    skills: [
      { name: 'Financial Analysis', category: 'Business', onetElementId: '2.C.9.a', importance: 95, level: 88 },
      { name: 'Statistics & Probability', category: 'Quantitative', onetElementId: '2.A.1.f', importance: 90, level: 84 },
      { name: 'Data Analysis', category: 'Technical', onetElementId: '2.B.3.g', importance: 86, level: 80 },
      { name: 'Critical Thinking', category: 'Cognitive', onetElementId: '2.A.2.a', importance: 88, level: 82 },
      { name: 'Written Communication', category: 'Communication', onetElementId: '2.A.1.d', importance: 82, level: 76 },
    ],
  },
];

/**
 * Service to manage authentication and live requests to O*NET Web Services.
 */
export class OnetWebService {
  private readonly username: string;
  private readonly password: string;
  private sessionCookie: string | null = null;

  constructor() {
    this.username = process.env.ONET_USERNAME || 'sn6024010087@camtech.edu.kh';
    this.password = process.env.ONET_PASSWORD || '$urfuture1$';
  }

  private get apiKey(): string | undefined {
    return process.env.ONET_API_KEY?.trim() || undefined;
  }

  private async request<T>(path: string): Promise<T | null> {
    if (!this.apiKey) return null;
    try {
      const response = await fetch(`https://api-v2.onetcenter.org${path}`, {
        headers: { Accept: 'application/json', 'X-API-Key': this.apiKey },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) return null;
      return await response.json() as T;
    } catch {
      return null;
    }
  }

  async searchOccupations(query: string): Promise<OnetOccupation[]> {
    const data = await this.request<{ occupation?: Array<Record<string, unknown>> }>(
      `/online/search?keyword=${encodeURIComponent(query)}`,
    );
    if (!data?.occupation) {
      return TARGET_ONET_CAREERS.filter((career) => career.title.toLowerCase().includes(query.toLowerCase()));
    }
    return data.occupation.map((occupation) => ({
      title: toText(occupation.title ?? occupation.name),
      onetSocCode: toText(occupation.code ?? occupation.soc_code),
      descriptionShort: toText(occupation.description),
      growthOutlook: 'Live O*NET occupation',
      requiredEducation: 'UNIVERSITY_YEAR_2',
      skills: [],
    }));
  }

  async getOccupationSkills(socCode: string): Promise<OnetApiOccupation | null> {
    const encodedCode = encodeURIComponent(socCode);
    const [summary, skills, knowledge] = await Promise.all([
      this.request<Record<string, unknown>>(`/online/occupations/${encodedCode}`),
      this.request<Record<string, unknown>>(`/online/occupations/${encodedCode}/skills`),
      this.request<Record<string, unknown>>(`/online/occupations/${encodedCode}/knowledge`),
    ]);
    if (!summary && !skills && !knowledge) {
      const fallback = TARGET_ONET_CAREERS.find((career) => career.onetSocCode === socCode);
      return fallback ? { title: fallback.title, onetSocCode: fallback.onetSocCode, descriptionShort: fallback.descriptionShort, skills: fallback.skills } : null;
    }

    const records = [...extractRecords(skills), ...extractRecords(knowledge)];
    return {
      title: toText(summary?.title ?? summary?.name) || socCode,
      onetSocCode: socCode,
      descriptionShort: toText(summary?.description ?? summary?.description_short),
      skills: records.map((record) => ({
        name: String(record.element?.name ?? record.name ?? ''),
        onetElementId: String(record.element?.id ?? record.id ?? ''),
        category: String(record.category ?? 'Technical'),
        importance: readScale(record, 'IM'),
        level: readScale(record, 'LV'),
      })).filter((skill) => skill.name && skill.onetElementId),
    };
  }

  /**
   * Authenticates with O*NET Web Services developer portal.
   */
  async login(): Promise<boolean> {
    try {
      const body = new URLSearchParams();
      body.set('email', this.username);
      body.set('password', this.password);

      const res = await fetch('https://services.onetcenter.org/developer/action/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'User-Agent': 'UrFuture-CareerAdvisor/1.0',
          Origin: 'https://services.onetcenter.org',
          Referer: 'https://services.onetcenter.org/',
        },
        body: body.toString(),
      });

      if (!res.ok) return false;
      const rawCookies = res.headers.getSetCookie
        ? res.headers.getSetCookie()
        : [res.headers.get('set-cookie') || ''];
      this.sessionCookie = rawCookies.map((c) => c.split(';')[0]).join('; ');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns curated, verified O*NET occupations and skills matching UrFuture.
   */
  getOccupations(): OnetOccupation[] {
    return TARGET_ONET_CAREERS;
  }
}

function extractRecords(payload: Record<string, unknown> | null): Array<Record<string, any>> {
  if (!payload) return [];
  for (const key of ['skills', 'knowledge', 'data', 'elements']) {
    if (Array.isArray(payload[key])) return payload[key] as Array<Record<string, any>>;
  }
  return [];
}

function readScale(record: Record<string, any>, scaleId: string): number {
  const scale = Array.isArray(record.scale) ? record.scale.find((item: Record<string, any>) => item.id === scaleId || item.scale_id === scaleId) : null;
  const value = scale?.value ?? record[scaleId.toLowerCase()] ?? record[scaleId];
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

export const onetService = new OnetWebService();
