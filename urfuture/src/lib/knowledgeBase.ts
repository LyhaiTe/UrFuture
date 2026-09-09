import { prisma } from '@/lib/db';

/**
 * Prototype-level "RAG" retrieval. In production this would query a
 * Pinecone (or pgvector) index built from O*NET Web Services, ILOSTAT
 * Cambodia labor data, and NEA Cambodia survey PDFs — see README
 * "Swapping in real RAG". For the working prototype we retrieve directly
 * from the seeded Postgres tables, which already carry citation metadata
 * (sourceNote / onetSocCode fields) so the groundedness contract still
 * holds end-to-end.
 */
export async function getCareerContext(careerTitle?: string) {
  const careers = await prisma.careerPath.findMany({
    where: careerTitle ? { title: { contains: careerTitle, mode: 'insensitive' } } : undefined,
    include: { skillRequirements: { include: { skill: true } }, pathwaySteps: { orderBy: { order: 'asc' } } },
  });
  return careers;
}

export async function getStudentSkillContext(userId: string) {
  return prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
  });
}

export async function getParsedTranscripts(userId: string) {
  return prisma.transcript.findMany({
    where: { userId, status: 'PARSED' },
  });
}

/** Formats retrieved rows into a compact, citation-friendly context block
 * to inject into the Claude prompt. Keeping this in one place means every
 * route feeds the model the same shape of grounding data. */
export function formatCareerContextForPrompt(careers: Awaited<ReturnType<typeof getCareerContext>>): string {
  return careers
    .map((c) => {
      const skills = c.skillRequirements
        .map((r) => `${r.skill.name} (importance ${r.importance}/100, O*NET element ${r.skill.onetElementId ?? 'n/a'})`)
        .join('; ');
      return [
        `CAREER: ${c.title} [O*NET-SOC ${c.onetSocCode ?? 'n/a'}]`,
        `Description: ${c.descriptionShort}`,
        `Median salary (Cambodia est.): $${c.medianSalaryUsd ?? 'n/a'}/yr`,
        `Growth outlook: ${c.growthOutlook ?? 'n/a'}`,
        `Required skills: ${skills}`,
        `Source note (cite this): ${c.sourceNote}`,
      ].join('\n');
    })
    .join('\n\n');
}

export function formatStudentSkillsForPrompt(
  skills: Awaited<ReturnType<typeof getStudentSkillContext>>
): string {
  if (skills.length === 0) return 'No skill data on file yet for this student.';
  return skills
    .map((s) => `${s.skill.name}: proficiency ${s.proficiency}/100 (source: ${s.source})`)
    .join('\n');
}
