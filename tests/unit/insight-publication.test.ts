import { describe, expect, it } from "vitest";
import { isPublicEditorialInsight } from "@/lib/insights/publication";

describe("public insight classification", () => {
  it("excludes the known verification record", () => {
    expect(isPublicEditorialInsight({ title: "UI verified insight", excerpt: "Insight excerpt verified through the browser", category: "Verification" })).toBe(false);
  });

  it("allows legitimate articles that discuss testing or verification", () => {
    expect(isPublicEditorialInsight({ title: "Verification strategies for distributed systems", excerpt: "Practical testing patterns for reliable software.", category: "Engineering" })).toBe(true);
  });
});
