import { prisma } from '../src/lib/db';
import { estimateGroundedness, estimateGroundednessAgainstChunks, flagForCounselorReview } from '../src/lib/guardrails';
import { retrieveRelevantContext } from '../src/lib/rag';
import type { RetrievedChunk } from '../src/lib/rag';
import type { Citation } from '../src/types';

let failures = 0;

function check(label: string, condition: boolean, detail: string) {
  const icon = condition ? '✓' : '✗';
  console.log(`  ${icon} ${label} ${condition ? '' : `— ${detail}`}`);
  if (!condition) failures++;
}

const FAKE_CHUNKS: RetrievedChunk[] = [
  {
    id: 'chunk_1',
    documentId: 'doc_1',
    source: 'NEA_SURVEY_2023',
    title: 'NEA Cambodia Skills Gap Survey 2023 — ICT Sector Summary',
    content: 'Employers rank hands-on project experience above GPA for entry-level hiring...',
    similarity: 0.86,
    metadata: {},
  },
  {
    id: 'chunk_2',
    documentId: 'doc_2',
    source: 'ILOSTAT_KH',
    title: 'ILOSTAT Cambodia — ICT Occupations Wage Snapshot',
    content: 'Median monthly earnings for ICT professionals in Cambodia sit below regional ASEAN peers...',
    similarity: 0.79,
    metadata: {},
  },
];

const rationale =
  'Based on real labor-market data, this student is a strong fit for frontend development. ' +
  'The NEA survey shows employers prioritize hands-on project experience, which this student has. ' +
  'Regional wage data suggests a competitive entry-level salary band. Their JavaScript and React ' +
  'coursework directly matches what employers are hiring for in Phnom Penh right now, and their ' +
  'quiz performance on component architecture confirms readiness for this specific role today.';

async function part1_pureFunctionChecks() {
  console.log('\n[1/3] estimateGroundedness() / estimateGroundednessAgainstChunks() — synthetic cases\n');

  // Case A: citations correctly trace back to the retrieved chunks → high score.
  const goodCitations: Citation[] = [
    { source: 'NEA_SURVEY_2023', reference: 'NEA Cambodia Skills Gap Survey 2023 — ICT Sector Summary (chunk chunk_1)', claim: 'hands-on project experience' },
    { source: 'ILOSTAT_KH', reference: 'ILOSTAT Cambodia — ICT Occupations Wage Snapshot (chunk chunk_2)', claim: 'wage band' },
  ];
  const scoreGood = estimateGroundednessAgainstChunks(rationale, goodCitations, FAKE_CHUNKS);
  check('verified citations → score >= 0.9', scoreGood >= 0.9, `got ${scoreGood.toFixed(2)}`);

  // Case B: citations cite something that was NOT in the retrieved chunks
  // (simulating the model hallucinating a plausible-sounding source) →
  // should score low, NOT get partial credit just for existing.
  const hallucinatedCitations: Citation[] = [
    { source: 'US_BLS_2024', reference: 'U.S. Bureau of Labor Statistics Occupational Outlook Handbook', claim: 'salary projection' },
  ];
  const scoreBad = estimateGroundednessAgainstChunks(rationale, hallucinatedCitations, FAKE_CHUNKS);
  check('unverified/hallucinated citation → score < 0.9', scoreBad < 0.9, `got ${scoreBad.toFixed(2)}`);

  // Case C: no citations at all despite a substantive rationale → 0.
  const scoreNone = estimateGroundednessAgainstChunks(rationale, [], FAKE_CHUNKS);
  check('zero citations on a long rationale → score is 0', scoreNone === 0, `got ${scoreNone.toFixed(2)}`);

  // Case D: no chunks were retrieved at all (RAG found nothing above
  // threshold) → falls back to the plain word-count heuristic rather than
  // auto-failing every request that hits a knowledge-base gap.
  const scoreFallback = estimateGroundednessAgainstChunks(rationale, goodCitations, []);
  const scorePlainHeuristic = estimateGroundedness(rationale, goodCitations.length);
  check(
    'no retrieved chunks → falls back to estimateGroundedness()',
    scoreFallback === scorePlainHeuristic,
    `chunk-aware=${scoreFallback.toFixed(2)} vs plain=${scorePlainHeuristic.toFixed(2)}`
  );
}

async function part2_realRetrieval() {
  console.log('\n[2/3] estimateGroundednessAgainstChunks() against REAL retrieved chunks\n');

  const { chunks } = await retrieveRelevantContext('frontend developer skills demand Cambodia', {
    category: 'LABOR_STAT',
  });

  if (chunks.length === 0) {
    console.log('  ⚠ No chunks retrieved — skipping this part. Run `npm run rag:ingest` first, then re-run this script.');
    return;
  }

  console.log(`  Retrieved ${chunks.length} real chunk(s): ${chunks.map((c) => c.source).join(', ')}`);

  const realCitations: Citation[] = chunks.map((c) => ({
    source: c.source,
    reference: `${c.title} (chunk ${c.id})`,
    claim: c.content.slice(0, 80),
  }));
  const score = estimateGroundednessAgainstChunks(rationale, realCitations, chunks);
  check('citations matching real retrieved chunks → score >= 0.9', score >= 0.9, `got ${score.toFixed(2)}`);
}

async function part3_counselorReviewEscalation() {
  console.log('\n[3/3] flagForCounselorReview() writes a real CounselorReview row\n');

  // Use the same demo user src/app/api/dev/demo-user/route.ts creates, so
  // this doesn't require a real logged-in session.
  const student = await prisma.user.upsert({
    where: { email: 'sokha.demo@camtech.edu.kh' },
    update: {},
    create: {
      email: 'sokha.demo@camtech.edu.kh',
      name: 'Sokha (Demo Student)',
      role: 'STUDENT',
      educationLevel: 'HS_JUNIOR',
      institution: 'Demo High School',
    },
  });

  const before = await prisma.counselorReview.count({ where: { studentId: student.id } });

  const testReason = `[verify-guardrails.ts test] Automated groundedness check scored 42% (< 90% threshold) at ${new Date().toISOString()}`;
  const review = await flagForCounselorReview({ studentId: student.id, reason: testReason });

  const after = await prisma.counselorReview.count({ where: { studentId: student.id } });

  check('CounselorReview row was created', after === before + 1, `count went ${before} -> ${after}`);
  check('created row has status PENDING', review.status === 'PENDING', `got ${review.status}`);
  check('created row has our test reason', review.reason === testReason, `got "${review.reason}"`);

  console.log(`\n  Row id: ${review.id} — inspect it with:`);
  console.log(`    npx prisma studio`);
  console.log(`  or:`);
  console.log(`    docker exec -it cambodia-advisor-db psql -U advisor -d urfuture`);
  console.log(`    SELECT * FROM "CounselorReview" WHERE id = '${review.id}';`);
  console.log(`\n  Clean up this test row when you're done:`);
  console.log(`    DELETE FROM "CounselorReview" WHERE id = '${review.id}';`);
}

async function main() {
  await part1_pureFunctionChecks();
  await part2_realRetrieval();
  await part3_counselorReviewEscalation();

  console.log(`\n${failures === 0 ? '✓ All checks passed.' : `✗ ${failures} check(s) failed — see above.`}\n`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});