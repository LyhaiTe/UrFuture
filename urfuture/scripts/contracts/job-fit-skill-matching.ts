import assert from 'node:assert/strict';
import {
  buildJobFitAssessment,
  resolveStudentSkillProficiency,
} from '../../src/lib/jobFitSkills';

const skills = [
  {
    name: 'Programming Fundamentals',
    proficiency: 91,
    source: 'TRANSCRIPT',
  },
  {
    name: 'Data Structures & Algorithms',
    proficiency: 74,
    source: 'TRANSCRIPT',
  },
  {
    name: 'Data Structures & Algorithms',
    proficiency: 86,
    source: 'QUIZ',
  },
  {
    name: 'SQL & Database Design',
    proficiency: 80,
    source: 'TRANSCRIPT',
  },
];

assert.equal(
  resolveStudentSkillProficiency('programming fundamentals', skills),
  91,
  'Case-insensitive profile labels should match'
);
assert.equal(
  resolveStudentSkillProficiency('Data structures', skills),
  86,
  'A clear partial skill label should use the quiz result'
);
assert.equal(
  resolveStudentSkillProficiency('Algorithms', skills),
  86,
  'A unique single-token skill alias should resolve'
);
assert.equal(
  resolveStudentSkillProficiency('Programming Fundamentals', [
    {
      name: 'Programming',
      proficiency: 67,
      source: 'TRANSCRIPT',
    },
  ]),
  67,
  'A unique short course label should resolve to its fuller skill name'
);
assert.equal(
  resolveStudentSkillProficiency('Git', skills),
  null,
  'Skills without profile evidence should remain unmatched'
);

const consistentAssessment = buildJobFitAssessment(
  [
    { skillName: 'Data Structures', requiredProficiency: 80 },
    { skillName: 'SQL', requiredProficiency: 80 },
    { skillName: 'Docker', requiredProficiency: 75 },
    { skillName: 'AWS', requiredProficiency: 70 },
    { skillName: 'TypeScript', requiredProficiency: 60 },
  ],
  [
    { name: 'Data Structures', proficiency: 100, source: 'QUIZ' },
    { name: 'SQL', proficiency: 100, source: 'QUIZ' },
    { name: 'Docker', proficiency: 100, source: 'QUIZ' },
    { name: 'AWS', proficiency: 100, source: 'QUIZ' },
    { name: 'TypeScript', proficiency: 10, source: 'QUIZ' },
  ]
);

assert.equal(consistentAssessment.fitScore, 83.33333333333334);
assert.equal(consistentAssessment.matchedSkills.length, 4);
assert.equal(consistentAssessment.missingSkills.length, 1);
assert.equal(consistentAssessment.missingSkills[0].gap, 50);

const demonstratedSkillAssessment = buildJobFitAssessment(
  [{ skillName: 'Frontend Development', requiredProficiency: 80 }],
  [{ name: 'Frontend Development', proficiency: 92, source: 'TRANSCRIPT' }]
);

assert.equal(demonstratedSkillAssessment.fitScore, 100);
assert.equal(demonstratedSkillAssessment.matchedSkills.length, 1);
assert.equal(demonstratedSkillAssessment.missingSkills.length, 0);

const zeroProficiencyAssessment = buildJobFitAssessment(
  [{ skillName: 'Data Structures & Algorithms', requiredProficiency: 100 }],
  [
    {
      name: 'Data Structures & Algorithms',
      proficiency: 0,
      source: 'QUIZ',
    },
  ]
);

assert.equal(zeroProficiencyAssessment.fitScore, 0);
assert.equal(zeroProficiencyAssessment.matchedSkills.length, 0);
assert.equal(zeroProficiencyAssessment.missingSkills[0].gap, 100);

console.log('All job-fit skill matching checks passed.');