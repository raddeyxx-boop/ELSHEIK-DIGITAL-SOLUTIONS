import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";


type Availability = typeof import("../../src/lib/supabase/availability");
async function load(): Promise<Availability> {
  vi.resetModules();
  return import("../../src/lib/supabase/availability");
}
const dnsFailure = () => Object.assign(new TypeError("fetch failed"), { cause: { code: "ENOTFOUND" } });

describe("CMS availability breaker", () => {
  beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(0); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it("keeps the SDK retry policy while the CMS is healthy or failing briefly", async () => {
    const { availabilityAwareOptions } = await load();
    const fetchMock = vi.fn().mockRejectedValueOnce(dnsFailure()).mockResolvedValue(new Response("[]"));
    vi.stubGlobal("fetch", fetchMock);
    const options = availabilityAwareOptions();
    expect(options.db.retry).toBe(true);
    await expect(options.global.fetch("https://cms.example/rest/v1/projects")).rejects.toThrow();
    vi.setSystemTime(1_000);
    await options.global.fetch("https://cms.example/rest/v1/projects");
    vi.setSystemTime(5_000);
    expect(availabilityAwareOptions().db.retry).toBe(true);
  });

  it("switches new reads to a single attempt once network failures persist, and recovers on any response", async () => {
    const { availabilityAwareOptions, cmsOutageDetected } = await load();
    const fetchMock = vi.fn().mockRejectedValue(dnsFailure());
    vi.stubGlobal("fetch", fetchMock);
    const { global } = availabilityAwareOptions();
    await expect(global.fetch("https://cms.example/rest/v1/projects")).rejects.toThrow();
    vi.setSystemTime(2_000);
    await expect(global.fetch("https://cms.example/rest/v1/projects")).rejects.toThrow();
    expect(cmsOutageDetected()).toBe(false);
    vi.setSystemTime(3_100);
    await expect(global.fetch("https://cms.example/rest/v1/projects")).rejects.toThrow();
    expect(availabilityAwareOptions().db.retry).toBe(false);
    // An HTTP error is still a response: the CMS is reachable, so retries return.
    fetchMock.mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
    await global.fetch("https://cms.example/rest/v1/projects");
    expect(availabilityAwareOptions().db.retry).toBe(true);
  });

  it("forgets an outage when no read has failed for a minute", async () => {
    const { availabilityAwareOptions, cmsOutageDetected } = await load();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(dnsFailure()));
    const { global } = availabilityAwareOptions();
    await expect(global.fetch("https://cms.example/a")).rejects.toThrow();
    vi.setSystemTime(3_500);
    await expect(global.fetch("https://cms.example/a")).rejects.toThrow();
    expect(cmsOutageDetected()).toBe(true);
    expect(cmsOutageDetected(3_500 + 60_000)).toBe(false);
  });

  it("does not count requests the caller aborted", async () => {
    const { availabilityAwareOptions, cmsOutageDetected } = await load();
    const controller = new AbortController(); controller.abort();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")));
    const { global } = availabilityAwareOptions();
    await expect(global.fetch("https://cms.example/a", { signal: controller.signal })).rejects.toThrow();
    vi.setSystemTime(10_000);
    await expect(global.fetch("https://cms.example/a", { signal: controller.signal })).rejects.toThrow();
    expect(cmsOutageDetected()).toBe(false);
  });

  it("bounds each attempt with a timeout signal and keeps the caller's signal", async () => {
    const { availabilityAwareOptions } = await load();
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]"));
    vi.stubGlobal("fetch", fetchMock);
    const controller = new AbortController();
    await availabilityAwareOptions().global.fetch("https://cms.example/a", { signal: controller.signal });
    const signal = fetchMock.mock.calls[0][1].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    controller.abort();
    expect(signal.aborted).toBe(true);
  });
});
