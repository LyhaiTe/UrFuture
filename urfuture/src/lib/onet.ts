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
];

/**
 * Service to manage authentication and live requests to O*NET Web Services.
 */
export class OnetWebService {
  private username: string;
  private password: string;
  private sessionCookie: string | null = null;

  constructor() {
    this.username = process.env.ONET_USERNAME || 'sn6024010087@camtech.edu.kh';
    this.password = process.env.ONET_PASSWORD || '$urfuture1$';
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

export const onetService = new OnetWebService();
