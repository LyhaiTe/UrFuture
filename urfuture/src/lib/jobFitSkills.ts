export interface StudentSkillEvidence {
  name: string;
  proficiency: number;
  source: string;
}

export interface JobFitSkillItem {
  skillName: string;
  userProficiency: number;
  requiredImportance: number;
  gap: number;
}

export interface JobFitAssessment {
  fitScore: number;
  matchedSkills: JobFitSkillItem[];
  missingSkills: JobFitSkillItem[];
  totalRequired: number;
}

export function buildJobFitAssessment(
  skillRequirements: { skillName: string; requiredProficiency: number }[],
  skills: StudentSkillEvidence[]
): JobFitAssessment {
  const seenNames = new Set<string>();
  const uniqueRequirements = skillRequirements.filter((requirement) => {
    const normalizedName = normalizeSkillName(requirement.skillName);

    if (!normalizedName || seenNames.has(normalizedName)) {
      return false;
    }

    seenNames.add(normalizedName);
    return true;
  });

  const skillItems = uniqueRequirements.map(({ skillName, requiredProficiency }) => {
    const userProficiency =
      resolveStudentSkillProficiency(skillName, skills) ?? 0;

    return {
      skillName,
      userProficiency,
      requiredImportance: requiredProficiency,
      gap: Math.max(requiredProficiency - userProficiency, 0),
    };
  });

  return {
    fitScore:
      skillItems.length === 0
        ? 0
        : skillItems.reduce(
            (total, skill) =>
              total + Math.min(skill.userProficiency / skill.requiredImportance, 1) * 100,
            0
          ) / skillItems.length,
    matchedSkills: skillItems.filter((skill) => skill.gap === 0),
    missingSkills: skillItems.filter((skill) => skill.gap > 0),
    totalRequired: skillItems.length,
  };
}

export function resolveStudentSkillProficiency(
  label: string,
  skills: StudentSkillEvidence[]
): number | null {
  const normalizedLabel = normalizeSkillName(label);
  const exactMatches = skills.filter(
    (skill) =>
      normalizeSkillName(skill.name) ===
      normalizedLabel
  );

  if (exactMatches.length > 0) {
    return preferCurrentEvidence(exactMatches).proficiency;
  }

  const labelTokens = new Set(normalizedLabel.split(' '));

  if (labelTokens.size === 0) {
    return null;
  }

  const candidates = skills.flatMap((skill) => {
    const skillTokens = new Set(
      normalizeSkillName(skill.name).split(' ')
    );
    const overlap = [...labelTokens].filter((token) =>
      skillTokens.has(token)
    ).length;

    if (
      overlap === 0 ||
      overlap / Math.min(labelTokens.size, skillTokens.size) < 0.66
    ) {
      return [];
    }

    return [{ skill, overlap }];
  });

  if (candidates.length === 0) {
    return null;
  }

  const bestOverlap = Math.max(
    ...candidates.map((candidate) => candidate.overlap)
  );
  const bestCandidates = candidates.filter(
    (candidate) => candidate.overlap === bestOverlap
  );
  const bestSkillNames = new Set(
    bestCandidates.map((candidate) =>
      normalizeSkillName(candidate.skill.name)
    )
  );

  if (bestSkillNames.size !== 1) {
    return null;
  }

  return preferCurrentEvidence(
    bestCandidates.map((candidate) => candidate.skill)
  ).proficiency;
}

function normalizeSkillName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token !== 'and')
    .map((token) => {
      if (token.length > 4 && token.endsWith('ies')) {
        return `${token.slice(0, -3)}y`;
      }

      if (
        token.length > 4 &&
        token.endsWith('s') &&
        !token.endsWith('ss')
      ) {
        return token.slice(0, -1);
      }

      return token;
    })
    .join(' ');
}

function preferCurrentEvidence(
  skills: StudentSkillEvidence[]
): StudentSkillEvidence {
  return [...skills].sort((left, right) =>
    sourcePriority(right.source) - sourcePriority(left.source)
  )[0];
}

function sourcePriority(source: string): number {
  if (source === 'QUIZ') {
    return 2;
  }

  if (source === 'TRANSCRIPT') {
    return 1;
  }

  return 0;
}