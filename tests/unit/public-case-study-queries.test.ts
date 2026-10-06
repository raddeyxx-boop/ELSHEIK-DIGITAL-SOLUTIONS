import { expect, it, vi } from "vitest";

const queries = vi.hoisted(() => ({
  started: [] as string[],
  selections: {} as Record<string, string>,
  filters: {} as Record<string, [string, unknown][]>,
  finishCaseStudy: () => {},
}));
vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: () => ({ from: (table: string) => {
    const rows: Record<string, unknown> = {
      projects: { id: "public-project", title_en: "Project", title_ar: "مشروع" },
      project_results: [{ label_en: "Result", value: "10", context_en: "Context" }],
      project_technologies: [{ technologies: [{ name: "Next.js", category: "frontend" }] }],
      testimonials: [{ client_name: "Public client", quote_en: "Approved quote" }],
    };
    const query = {
      select: (columns: string) => { queries.selections[table] = columns; return query; },
      eq: (column: string, value: unknown) => { (queries.filters[table] ??= []).push([column, value]); return query; },
      order: () => query,
      maybeSingle: () => query,
      then: (resolve: (value: { data: unknown; error: null }) => unknown) => {
        queries.started.push(table);
        if (table === "case_studies") return new Promise<void>(done => {
          queries.finishCaseStudy = () => { resolve({ data: null, error: null }); done(); };
        });
        return Promise.resolve({ data: rows[table] ?? [], error: null }).then(resolve);
      },
    };
    return query;
  } }),
}));

import { getPublishedCaseStudy } from "@/server/queries/public-content";

it("starts independent project reads before the case-study lookup finishes and preserves public filters", async () => {
  const pending = getPublishedCaseStudy("public-project", "en");
  await vi.waitFor(() => expect(queries.started).toEqual(expect.arrayContaining([
    "case_studies", "project_results", "project_technologies", "testimonials",
  ])));
  queries.finishCaseStudy();
  const result = await pending;
  expect(result?.results).toEqual([{ label: "Result", value: "10", context: "Context" }]);
  expect(result?.testimonials[0].quote).toBe("Approved quote");
  expect(queries.filters.project_results).toEqual(expect.arrayContaining([["verified", true], ["publishable", true]]));
  expect(queries.filters.testimonials).toEqual(expect.arrayContaining([["status", "published"], ["approved", true]]));
  expect(Object.values(queries.selections)).not.toContain("*");
});
