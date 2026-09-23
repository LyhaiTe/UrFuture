interface RunResult {
  ttftMs: number;
  totalMs: number;
  ok: boolean;
  error?: string;
}

function parseArg(flag: string, fallback: string): string {
  const args = process.argv.slice(2);
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
}

const BASE_URL = parseArg('--url', 'http://localhost:3000');
const RUNS = Number(parseArg('--runs', '5'));
const MESSAGE = parseArg('--message', 'What skills do I need to become a frontend developer in Cambodia?');
const THRESHOLD_MS = 500;

async function getDemoUserId(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/dev/demo-user`);
  if (!res.ok) throw new Error(`GET /api/dev/demo-user failed: ${res.status}`);
  const { userId } = (await res.json()) as { userId: string };
  return userId;
}

async function runOnce(userId: string): Promise<RunResult> {
  const start = performance.now();
  let ttft: number | null = null;

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message: MESSAGE }),
    });
    if (!res.ok || !res.body) {
      return { ttftMs: -1, totalMs: performance.now() - start, ok: false, error: `HTTP ${res.status}` };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      if (ttft === null) {
        const events = buffer.split('\n\n');
        for (const raw of events) {
          if (raw.includes('event: token') || raw.includes('event:token')) {
            ttft = performance.now() - start;
            break;
          }
        }
      }
    }

    const totalMs = performance.now() - start;
    if (ttft === null) {
      return { ttftMs: -1, totalMs, ok: false, error: 'stream ended without a token event (check GROQ_API_KEY / server logs)' };
    }
    return { ttftMs: ttft, totalMs, ok: true };
  } catch (err) {
    return { ttftMs: -1, totalMs: performance.now() - start, ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  console.log(`Measuring TTFT against ${BASE_URL}/api/chat (${RUNS} run(s))`);
  console.log(`Message: "${MESSAGE}"\n`);

  const userId = await getDemoUserId();
  const results: RunResult[] = [];

  for (let i = 1; i <= RUNS; i++) {
    const r = await runOnce(userId);
    results.push(r);
    if (r.ok) {
      const flag = r.ttftMs < THRESHOLD_MS ? '✓' : '✗';
      console.log(`  run ${i}: TTFT=${r.ttftMs.toFixed(0)}ms  total=${r.totalMs.toFixed(0)}ms  ${flag} (<${THRESHOLD_MS}ms target)`);
    } else {
      console.log(`  run ${i}: FAILED — ${r.error}`);
    }
  }

  const ok = results.filter((r) => r.ok);
  if (ok.length === 0) {
    console.log('\nNo successful runs — nothing to summarize.');
    process.exit(1);
  }

  const ttfts = ok.map((r) => r.ttftMs).sort((a, b) => a - b);
  const avg = ttfts.reduce((a, b) => a + b, 0) / ttfts.length;
  const p50 = ttfts[Math.floor(ttfts.length * 0.5)];
  const p95 = ttfts[Math.min(ttfts.length - 1, Math.floor(ttfts.length * 0.95))];

  console.log(`\nSummary (${ok.length}/${RUNS} successful runs):`);
  console.log(`  avg TTFT: ${avg.toFixed(0)}ms`);
  console.log(`  p50 TTFT: ${p50.toFixed(0)}ms`);
  console.log(`  p95 TTFT: ${p95.toFixed(0)}ms`);
  console.log(`  target:   < ${THRESHOLD_MS}ms`);
  console.log(avg < THRESHOLD_MS ? '\n✓ Under target on average.' : '\n✗ Over target on average — see "If TTFT is too high" below.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});