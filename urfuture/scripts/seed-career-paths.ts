import { PrismaClient } from '@prisma/client';
import { CAREER_CATALOG } from '../src/data/careerCatalog';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding career paths...');

  for (const career of CAREER_CATALOG) {
    const descriptionShort =
      career.rationale.length > 250
        ? `${career.rationale.slice(0, 247)}...`
        : career.rationale;

    const description = [
      career.rationale,
      '',
      `Matched skills: ${career.matchedSkills.join(', ')}`,
      `Skills to strengthen: ${career.skillsToStrengthen.join(', ')}`,
    ].join('\n');

    const careerPath = await prisma.careerPath.upsert({
      where: {
        title: career.title,
      },
      update: {
        industry: career.categoryId,
        onetSocCode: career.onetSocCode ?? null,
        descriptionShort,
        description,
        sourceNote:
          'Seeded from src/data/careerCatalog.ts for UrFuture career and diagnostic quiz integration.',
      },
      create: {
        title: career.title,
        industry: career.categoryId,
        onetSocCode: career.onetSocCode ?? null,
        descriptionShort,
        description,
        sourceNote:
          'Seeded from src/data/careerCatalog.ts for UrFuture career and diagnostic quiz integration.',
      },
    });

    console.log(
      `✓ ${careerPath.title} (${careerPath.id})`,
    );
  }

  console.log(
    `\nSeeded ${CAREER_CATALOG.length} career paths successfully.`,
  );
}

main()
  .catch((error) => {
    console.error('Career path seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });