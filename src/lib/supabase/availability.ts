import "server-only";

// The SDK retries a failed read up to 3 times (1s, 2s, 4s backoff). That absorbs
// brief blips, but during a sustained outage (the host does not resolve, refuses
// connections) it holds every CMS-backed page ~7s before it can fall back.
// Once network-level failures have persisted for OUTAGE_AFTER_MS with no success
// in between, new clients make a single attempt instead; the first response of
// any kind restores the normal retry policy. HTTP errors such as 503 are
// responses, so they never open this breaker and keep the SDK's retries.
// A stalled attempt (slow DNS, unanswered connect) otherwise waits for the
// runtime's own limits (10s connect, 300s headers). Timing out rejects with a
// TimeoutError, which the SDK retries like any other network failure.
const ATTEMPT_TIMEOUT_MS = 5_000;
const OUTAGE_AFTER_MS = 3_000;
const OUTAGE_EXPIRES_MS = 60_000;
let firstFailure: number | null = null, lastFailure = 0;

const trackingFetch: typeof fetch = async (input, init) => {
  const timeout = AbortSignal.timeout(ATTEMPT_TIMEOUT_MS);
  try {
    const response = await fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout });
    firstFailure = null;
    return response;
  } catch (error) {
    if (!init?.signal?.aborted) { lastFailure = Date.now(); firstFailure ??= lastFailure; }
    throw error;
  }
};

export function cmsOutageDetected(now = Date.now()) {
  return firstFailure !== null && lastFailure - firstFailure >= OUTAGE_AFTER_MS && now - lastFailure < OUTAGE_EXPIRES_MS;
}

export function availabilityAwareOptions() {
  return { db: { retry: !cmsOutageDetected() }, global: { fetch: trackingFetch } };
}
