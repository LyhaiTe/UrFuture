import { PrismaClient, EducationLevel } from '@prisma/client';
import { TARGET_ONET_CAREERS } from '../src/lib/onet';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding O*NET Data into UrFuture Database ---');

  for (const career of TARGET_ONET_CAREERS) {
    console.log(`\nProcessing Career: ${career.title} [O*NET-SOC ${career.onetSocCode}]...`);

    const educationMap: Record<string, EducationLevel> = {
      UNIVERSITY_YEAR_1: EducationLevel.UNIVERSITY_YEAR_1,
      UNIVERSITY_YEAR_2: EducationLevel.UNIVERSITY_YEAR_2,
      UNIVERSITY_YEAR_3: EducationLevel.UNIVERSITY_YEAR_3,
      UNIVERSITY_YEAR_4: EducationLevel.UNIVERSITY_YEAR_4,
      GRADUATE: EducationLevel.GRADUATE,
    };

    const careerRecord = await prisma.careerPath.upsert({
      where: { title: career.title },
      update: {
        onetSocCode: career.onetSocCode,
        descriptionShort: career.descriptionShort,
        medianSalaryUsd: career.medianSalaryUsd,
        growthOutlook: career.growthOutlook,
        sourceNote: `O*NET-SOC ${career.onetSocCode} (task & skill taxonomy). Aligned with Cambodia digital workforce priorities.`,
        requiredEducation: educationMap[career.requiredEducation] || EducationLevel.UNIVERSITY_YEAR_2,
      },
      create: {
        title: career.title,
        onetSocCode: career.onetSocCode,
        descriptionShort: career.descriptionShort,
        medianSalaryUsd: career.medianSalaryUsd,
        growthOutlook: career.growthOutlook,
        sourceNote: `O*NET-SOC ${career.onetSocCode} (task & skill taxonomy). Aligned with Cambodia digital workforce priorities.`,
        requiredEducation: educationMap[career.requiredEducation] || EducationLevel.UNIVERSITY_YEAR_2,
      },
    });

    for (const skillReq of career.skills) {
      // 1. Upsert Skill
      const skillRecord = await prisma.skill.upsert({
        where: { name: skillReq.name },
        update: {
          category: skillReq.category,
          onetElementId: skillReq.onetElementId,
        },
        create: {
          name: skillReq.name,
          category: skillReq.category,
          onetElementId: skillReq.onetElementId,
        },
      });

      // 2. Upsert CareerSkillRequirement
      await prisma.careerSkillRequirement.upsert({
        where: {
          careerPathId_skillId: {
            careerPathId: careerRecord.id,
            skillId: skillRecord.id,
          },
        },
        update: {
          importance: skillReq.importance,
        },
        create: {
          careerPathId: careerRecord.id,
          skillId: skillRecord.id,
          importance: skillReq.importance,
        },
      });
    }

    console.log(`  ✓ Synced ${career.skills.length} O*NET skills for ${career.title}`);
  }

  const totalCareers = await prisma.careerPath.count();
  const totalSkills = await prisma.skill.count();
  const totalReqs = await prisma.careerSkillRequirement.count();

  console.log('\n--- O*NET Seeding Complete ---');
  console.log(`Total Career Paths in DB: ${totalCareers}`);
  console.log(`Total Skills in DB: ${totalSkills}`);
  console.log(`Total CareerSkillRequirements in DB: ${totalReqs}`);
}

main()
  .catch((err) => {
    console.error('Error seeding O*NET data:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
