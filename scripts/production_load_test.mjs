const BASE_URL = process.env.LOAD_TEST_URL ?? "https://kuly.com.cn";
const DURATION_SECONDS = Number(process.env.LOAD_TEST_DURATION_SECONDS ?? 20);
const CONCURRENCY = Number(process.env.LOAD_TEST_CONCURRENCY ?? 6);
const TARGET_RPS = Number(process.env.LOAD_TEST_TARGET_RPS ?? 6);
const REQUEST_TIMEOUT_MS = Number(process.env.LOAD_TEST_REQUEST_TIMEOUT_MS ?? 8000);
const MAX_ERROR_RATE = Number(process.env.LOAD_TEST_MAX_ERROR_RATE ?? 0.02);
const MAX_P95_MS = Number(process.env.LOAD_TEST_MAX_P95_MS ?? 2500);
const PATHS = (process.env.LOAD_TEST_PATHS ?? "/,/services,/help/quick-start,/products,/api/health,/api/services,/api/docs")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const result = {
  baseUrl: BASE_URL,
  durationSeconds: DURATION_SECONDS,
  concurrency: CONCURRENCY,
  targetRps: TARGET_RPS,
  paths: PATHS,
  total: 0,
  ok: 0,
  failed: 0,
  statusCounts: {},
  failures: [],
  latencyMs: []
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index];
}

function targetUrl(path) {
  return new URL(path, BASE_URL).toString();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function oneRequest(path) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const started = performance.now();
  try {
    const response = await fetch(targetUrl(path), {
      signal: controller.signal,
      headers: {
        "User-Agent": "KuliProductionLoadTest/1.0"
      }
    });
    const latency = Math.round(performance.now() - started);
    result.total += 1;
    result.latencyMs.push(latency);
    result.statusCounts[response.status] = (result.statusCounts[response.status] ?? 0) + 1;
    if (response.ok) {
      result.ok += 1;
      return;
    }
    result.failed += 1;
    if (result.failures.length < 20) result.failures.push({ path, status: response.status, latency });
  } catch (error) {
    const latency = Math.round(performance.now() - started);
    result.total += 1;
    result.failed += 1;
    result.latencyMs.push(latency);
    const message = error instanceof Error ? error.message : String(error);
    result.statusCounts.network_error = (result.statusCounts.network_error ?? 0) + 1;
    if (result.failures.length < 20) result.failures.push({ path, status: "network_error", latency, message });
  } finally {
    clearTimeout(timeout);
  }
}

async function worker(workerIndex, deadline) {
  let index = workerIndex;
  const perWorkerDelayMs = Math.max(0, Math.round((1000 * CONCURRENCY) / TARGET_RPS));
  while (Date.now() < deadline) {
    await oneRequest(PATHS[index % PATHS.length]);
    index += CONCURRENCY;
    if (perWorkerDelayMs > 0) await sleep(perWorkerDelayMs);
  }
}

async function run() {
  assert(PATHS.length > 0, "LOAD_TEST_PATHS must contain at least one path");
  assert(DURATION_SECONDS > 0, "LOAD_TEST_DURATION_SECONDS must be positive");
  assert(CONCURRENCY > 0, "LOAD_TEST_CONCURRENCY must be positive");
  assert(TARGET_RPS > 0, "LOAD_TEST_TARGET_RPS must be positive");

  const deadline = Date.now() + DURATION_SECONDS * 1000;
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, index) => worker(index, deadline)));

  const p50 = percentile(result.latencyMs, 50);
  const p95 = percentile(result.latencyMs, 95);
  const p99 = percentile(result.latencyMs, 99);
  const errorRate = result.total ? result.failed / result.total : 1;
  const summary = {
    ...result,
    p50,
    p95,
    p99,
    errorRate
  };
  console.log(JSON.stringify(summary, null, 2));

  assert(result.total > 0, "load test sent no requests");
  assert(errorRate <= MAX_ERROR_RATE, `error rate ${errorRate} exceeded ${MAX_ERROR_RATE}`);
  assert(p95 <= MAX_P95_MS, `p95 latency ${p95}ms exceeded ${MAX_P95_MS}ms`);
}

run().catch((error) => {
  console.error(error);
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
});
