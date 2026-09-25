import { describe, expect, it } from "vitest";
import { getProcessContent, processArabic, processEnglish } from "@/content/process";

const arabic = /[؀-ۿ]/;
const shape = (items: unknown[]) => items.length;

describe("process content", () => {
  it("resolves by locale", () => {
    expect(getProcessContent("ar")).toBe(processArabic);
    expect(getProcessContent("en")).toBe(processEnglish);
  });

  it("keeps the eight-stage model in the same order in both languages", () => {
    for (const c of [processEnglish, processArabic]) {
      expect(c.stages.map(s => s.number)).toEqual(["01", "02", "03", "04", "05", "06", "07", "08"]);
      expect(c.stages.map(s => s.id)).toEqual(["discovery", "strategy", "design", "engineering", "automation", "testing", "launch", "evolution"]);
      expect(c.automationByDesign.rows).toHaveLength(8);
    }
    expect(processArabic.stages.map(s => s.code)).toEqual(processEnglish.stages.map(s => s.code));
  });

  it("gives every stage the same structured depth in English and Arabic", () => {
    processEnglish.stages.forEach((en, i) => {
      const ar = processArabic.stages[i];
      for (const key of ["inputs", "activities", "automation", "outputs", "quality"] as const) {
        expect(en[key].length, `${en.id}.${key}`).toBeGreaterThan(0);
        expect(shape(ar[key]), `${en.id}.${key}`).toBe(shape(en[key]));
      }
      expect(ar.tracks?.map(t => t.items.length)).toEqual(en.tracks?.map(t => t.items.length));
      expect(Boolean(ar.principle)).toBe(Boolean(en.principle));
      for (const text of [ar.title, ar.short, ar.objective, ar.gate.name, ar.gate.question, ar.next]) expect(text).toMatch(arabic);
    });
    expect(processArabic.executionModel.nodes.map(n => n.code)).toEqual(processEnglish.executionModel.nodes.map(n => n.code));
    expect(processArabic.artifacts.items.map(a => a.stages)).toEqual(processEnglish.artifacts.items.map(a => a.stages));
    expect(processArabic.boundary.rows.map(r => r.code)).toEqual(processEnglish.boundary.rows.map(r => r.code));
  });

  it("gives the live execution-model demo and loop controls the same shape in both languages", () => {
    for (const c of [processEnglish, processArabic]) {
      expect(c.executionModel.demo.success).toHaveLength(c.executionModel.nodes.length);
      expect(c.automationByDesign.phases).toHaveLength(5);
      expect(Object.keys(c.executionModel.demo.failure)).toEqual(["verify", "retry", "handoff", "record", "notify"]);
    }
    const d = processArabic.executionModel.demo;
    for (const text of [d.runSuccess, d.runFailure, d.pause, d.model, ...d.success, ...Object.values(d.failure), ...processArabic.automationByDesign.phases, ...Object.values(processArabic.loop.controls), processArabic.loop.stagesLabel]) expect(text).toMatch(arabic);
  });

  it("localizes ordinary interface language in Arabic", () => {
    const f = processArabic.framework;
    for (const text of [f.selected, f.nextLabel, f.loopLabel, f.loopHint, f.tablist, ...Object.values(f.fields)]) expect(text).toMatch(arabic);
  });

  it("describes methodology without invented metrics or certifications", () => {
    const text = JSON.stringify([processEnglish, processArabic]);
    expect(text).not.toMatch(/\d+\s?%|٪|\bSLA\b|uptime|SOC\s?2|ISO\s?\d|certified|guarantee/i);
  });
});
