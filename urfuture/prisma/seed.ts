/**
 * Seeds a small but realistic knowledge base so the prototype can run
 * end-to-end without live O*NET / ILOSTAT / NEA credentials.
 *
 * In production, replace this static snapshot with a scheduled ingestion
 * job (see README §"Swapping in real RAG") that pulls from:
 *  - O*NET Web Services (skills/knowledge taxonomy)
 *  - ILOSTAT Cambodia labor force & wage statistics
 *  - NEA Cambodia skills-gap & employer survey reports
 *  - University course catalogs
 */
import { PrismaClient, EducationLevel, PathwayStepType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding skills...');
  const skillDefs = [
    { name: 'Algebra & Precalculus', category: 'Quantitative', onetElementId: '2.A.1.a' },
    { name: 'Calculus', category: 'Quantitative', onetElementId: '2.A.1.b' },
    { name: 'Programming Fundamentals', category: 'Technical', onetElementId: '2.B.3.f' },
    { name: 'Data Structures & Algorithms', category: 'Technical', onetElementId: '2.B.3.g' },
    { name: 'Statistics & Probability', category: 'Quantitative', onetElementId: '2.A.1.f' },
    { name: 'Written Communication', category: 'Communication', onetElementId: '2.A.1.d' },
    { name: 'English Proficiency', category: 'Communication', onetElementId: '2.C.1.a' },
    { name: 'Physics', category: 'Science', onetElementId: '2.C.4.a' },
    { name: 'Circuit & Systems Design', category: 'Technical', onetElementId: '2.B.3.b' },
    { name: 'Business & Financial Literacy', category: 'Business', onetElementId: '2.C.9.a' },
    { name: 'Project Management', category: 'Business', onetElementId: '2.B.5.a' },
  ];
  const skills: Record<string, string> = {};
  for (const s of skillDefs) {
    const rec = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    skills[s.name] = rec.id;
  }

  console.log('Seeding career paths...');
  const softwareEngineer = await prisma.careerPath.upsert({
    where: { title: 'Software Engineer' },
    update: {},
    create: {
      title: 'Software Engineer',
      onetSocCode: '15-1252.00',
      descriptionShort:
        'Designs, builds, and maintains software systems; strong demand in Cambodia\'s growing digital economy and BPO/IT-outsourcing sector.',
      medianSalaryUsd: 9000,
      growthOutlook: 'High — ADB (2016) flags digital/technical skills as a national upgrade priority.',
      sourceNote:
        'O*NET-SOC 15-1252.00 (task/skill taxonomy); salary figure is a Cambodia-context estimate pending a verified NEA/ILOSTAT wage snapshot — flag for counselor verification before quoting to students.',
      requiredEducation: EducationLevel.UNIVERSITY_YEAR_2,
    },
  });

  const electricalEngineer = await prisma.careerPath.upsert({
    where: { title: 'Electrical Engineer' },
    update: {},
    create: {
      title: 'Electrical Engineer',
      onetSocCode: '17-2071.00',
      descriptionShort:
        'Designs and tests electrical systems and components; foundational math/physics-heavy path relevant to Cambodia\'s energy and manufacturing growth.',
      medianSalaryUsd: 7500,
      growthOutlook: 'Moderate-High — ADB (2016) cites infrastructure and manufacturing skills gaps.',
      sourceNote:
        'O*NET-SOC 17-2071.00. Salary is an estimate; requires NEA Cambodia wage-survey confirmation before being presented as fact.',
      requiredEducation: EducationLevel.UNIVERSITY_YEAR_1,
    },
  });

  const businessAnalyst = await prisma.careerPath.upsert({
    where: { title: 'Business / Data Analyst' },
    update: {},
    create: {
      title: 'Business / Data Analyst',
      onetSocCode: '13-1111.00',
      descriptionShort:
        'Analyzes business data to guide decisions; growing role as Cambodian firms digitize operations and reporting.',
      medianSalaryUsd: 6500,
      growthOutlook: 'Moderate — consistent with regional SEA digitization trends.',
      sourceNote: 'O*NET-SOC 13-1111.00. Salary figure is an estimate pending NEA confirmation.',
      requiredEducation: EducationLevel.UNIVERSITY_YEAR_1,
    },
  });

  console.log('Seeding skill requirements...');
  const reqs: [string, string, number][] = [
    [softwareEngineer.id, 'Programming Fundamentals', 95],
    [softwareEngineer.id, 'Data Structures & Algorithms', 90],
    [softwareEngineer.id, 'Algebra & Precalculus', 60],
    [softwareEngineer.id, 'Statistics & Probability', 55],
    [softwareEngineer.id, 'Written Communication', 50],
    [softwareEngineer.id, 'English Proficiency', 70],

    [electricalEngineer.id, 'Physics', 95],
    [electricalEngineer.id, 'Calculus', 90],
    [electricalEngineer.id, 'Circuit & Systems Design', 90],
    [electricalEngineer.id, 'Algebra & Precalculus', 80],
    [electricalEngineer.id, 'English Proficiency', 55],

    [businessAnalyst.id, 'Statistics & Probability', 80],
    [businessAnalyst.id, 'Business & Financial Literacy', 85],
    [businessAnalyst.id, 'Written Communication', 65],
    [businessAnalyst.id, 'English Proficiency', 65],
    [businessAnalyst.id, 'Project Management', 55],
  ];
  for (const [careerPathId, skillName, importance] of reqs) {
    await prisma.careerSkillRequirement.upsert({
      where: { careerPathId_skillId: { careerPathId, skillId: skills[skillName] } },
      update: { importance },
      create: { careerPathId, skillId: skills[skillName], importance },
    });
  }

  console.log('Seeding pathway steps (for the React Flow graph)...');
  const swSteps: [PathwayStepType, string, number][] = [
    ['CURRENT_STATE', 'You are here', 0],
    ['MAJOR', 'Declare Computer Science / IT major', 1],
    ['COURSE_MILESTONE', 'Complete Data Structures & Algorithms', 2],
    ['COURSE_MILESTONE', 'Complete Statistics for CS', 3],
    ['INTERNSHIP', 'Software engineering internship', 4],
    ['CERTIFICATION', 'Optional: cloud or full-stack certification', 5],
    ['CAREER_ENTRY', 'Junior Software Engineer', 6],
  ];
  for (const [type, label, order] of swSteps) {
    await prisma.pathwayStep.create({
      data: { careerPathId: softwareEngineer.id, type, label, order },
    });
  }

  console.log('Seeding quiz questions...');
  await prisma.quizQuestion.createMany({
    data: [
      {
        skillId: skills['Algebra & Precalculus'],
        prompt: 'Solve for x: 3x + 7 = 22',
        choices: JSON.stringify(['x = 5', 'x = 3', 'x = 7', 'x = 15']),
        correctIndex: 0,
        difficulty: 'EASY',
        sourceCourse: 'MATH101',
      },
      {
        skillId: skills['Programming Fundamentals'],
        prompt: 'What data structure uses FIFO (First-In-First-Out) ordering?',
        choices: JSON.stringify(['Stack', 'Queue', 'Tree', 'Hash Map']),
        correctIndex: 1,
        difficulty: 'EASY',
        sourceCourse: 'CS101',
      },
      {
        skillId: skills['Statistics & Probability'],
        prompt: 'What does a p-value of 0.03 typically suggest at a 0.05 significance level?',
        choices: JSON.stringify([
          'The result is not statistically significant',
          'The result is statistically significant',
          'The sample size was too small',
          'The null hypothesis is definitely true',
        ]),
        correctIndex: 1,
        difficulty: 'MEDIUM',
        sourceCourse: 'STAT201',
      },
      {
        skillId: skills['Physics'],
        prompt: 'What is the SI unit of electrical resistance?',
        choices: JSON.stringify(['Volt', 'Ampere', 'Ohm', 'Watt']),
        correctIndex: 2,
        difficulty: 'EASY',
        sourceCourse: 'PHYS102',
      },
      {
        skillId: skills['Data Structures & Algorithms'],
        prompt: 'What is the average time complexity of binary search on a sorted array?',
        choices: JSON.stringify(['O(n)', 'O(log n)', 'O(n^2)', 'O(1)']),
        correctIndex: 1,
        difficulty: 'MEDIUM',
        sourceCourse: 'CS201',
      },
    ],
  });

  console.log('Seeding demo student...');
  await prisma.user.upsert({
    where: { email: 'sokha.demo@camtech.edu.kh' },
    update: {},
    create: {
      email: 'sokha.demo@camtech.edu.kh',
      name: 'Sokha (Demo Student)',
      role: 'STUDENT',
      educationLevel: EducationLevel.HS_JUNIOR,
      institution: 'Demo High School',
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
