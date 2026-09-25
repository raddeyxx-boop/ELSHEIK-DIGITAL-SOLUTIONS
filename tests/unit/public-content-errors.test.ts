import { beforeEach, describe, expect, it, vi } from "vitest";

const result = vi.hoisted(() => ({ value: { data: null as unknown, error: null as unknown } }));
vi.mock("@/lib/supabase/public", () => {
  const query = new Proxy({}, { get: (_, key) => key === "maybeSingle" ? async () => result.value : () => query });
  return { createPublicClient: () => ({ from: () => query }) };
});

import { CmsReadError, getPublishedCaseStudy, getPublishedInsight } from "@/server/queries/public-content";

describe("public detail reads distinguish missing content from CMS failures", () => {
  beforeEach(() => { result.value = { data: null, error: null }; });

  it("returns null for a slug the CMS does not have", async () => {
    await expect(getPublishedCaseStudy("unknown", "en")).resolves.toBeNull();
    await expect(getPublishedInsight("unknown", "en")).resolves.toBeNull();
  });

  it("throws CmsReadError when the CMS cannot answer", async () => {
    result.value = { data: null, error: { message: "TypeError: fetch failed", code: "" } };
    await expect(getPublishedCaseStudy("relax-moon-spa-automation", "en")).rejects.toBeInstanceOf(CmsReadError);
    await expect(getPublishedInsight("any", "ar")).rejects.toBeInstanceOf(CmsReadError);
  });
});
