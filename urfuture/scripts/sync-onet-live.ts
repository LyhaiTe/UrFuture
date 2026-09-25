import { EducationLevel, PrismaClient } from '@prisma/client';
import { onetService } from '../src/lib/onet';

const prisma = new PrismaClient();

function readSocCode(): string {
  const index = process.argv.indexOf('--soc');
  const socCode = index >= 0 ? process.argv[index + 1] : undefined;
  if (!socCode || !/^\d{2}-\d{4}\.\d{2}$/.test(socCode)) {
    throw new Error('Usage: npx tsx scripts/sync-onet-live.ts --soc 15-1252.00');
  }
  return socCode;
}

async function main() {
  const socCode = readSocCode();
  const occupation = await onetService.getOccupationSkills(socCode);
  if (!occupation) {
    throw new Error(`No O*NET data was returned for ${socCode}. Set ONET_API_KEY or use a curated occupation.`);
  }

  const career = await prisma.careerPath.upsert({
    where: { title: occupation.title },
    update: {
      onetSocCode: occupation.onetSocCode,
      descriptionShort: occupation.descriptionShort || occupation.title,
      sourceNote: `O*NET-SOC ${occupation.onetSocCode} (live Web Services v2 sync).`,
    },
    create: {
      title: occupation.title,
      onetSocCode: occupation.onetSocCode,
      descriptionShort: occupation.descriptionShort || occupation.title,
      sourceNote: `O*NET-SOC ${occupation.onetSocCode} (live Web Services v2 sync).`,
      requiredEducation: EducationLevel.UNIVERSITY_YEAR_2,
    },
  });

  for (const requirement of occupation.skills) {
    const skill = await prisma.skill.upsert({
      where: { name: requirement.name },
      update: {
        category: requirement.category,
        onetElementId: requirement.onetElementId,
      },
      create: {
        name: requirement.name,
        category: requirement.category,
        onetElementId: requirement.onetElementId,
      },
    });
    await prisma.careerSkillRequirement.upsert({
      where: { careerPathId_skillId: { careerPathId: career.id, skillId: skill.id } },
      update: { importance: requirement.importance },
      create: { careerPathId: career.id, skillId: skill.id, importance: requirement.importance },
    });
  }

  console.log(`Synced ${career.title} (${socCode}) with ${occupation.skills.length} O*NET skills.`);
}

main()
  .catch((error) => {
    console.error('O*NET live sync failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
