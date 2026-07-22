import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const repositoryFile = (path: string): URL => new URL(`../../${path}`, import.meta.url);

function read(path: string): string {
  return readFileSync(repositoryFile(path), "utf8");
}

const traceability = read("Agents/01_Product/TraceabilityMatrix.md");
const coverage = read("Agents/05_Implementation/Sprint1CoverageReport.md");
const report = read("Agents/05_Implementation/ImplementationSprint1Report.md");
const deviations = read("Agents/05_Implementation/Sprint1DeviationLog.md");

describe("Sprint 1 traceability records", () => {
  it("retains every approved requirement and acceptance mapping", () => {
    for (let index = 1; index <= 58; index += 1) {
      expect(traceability).toContain(`| R-${String(index).padStart(3, "0")} |`);
    }
    for (let index = 1; index <= 22; index += 1) {
      expect(coverage).toContain(`| AT-${String(index).padStart(3, "0")} |`);
    }
  });

  it("records every corpus category and ordered work package", () => {
    for (let index = 1; index <= 11; index += 1) {
      expect(coverage).toContain(`| C-G${String(index).padStart(2, "0")} |`);
    }
    for (let index = 1; index <= 14; index += 1) {
      expect(report).toContain(`| WP-${String(index).padStart(2, "0")} |`);
    }
  });

  it("records every required A-011 usability dimension", () => {
    for (const evidence of [
      "Recipe create/modify time",
      "Strategy discovery comprehension",
      "Option-schema sufficiency",
      "Diagnostic usefulness",
      "Implementation changes for recipe-only experiment",
      "Switching treatments",
      "Rerun/reproduction",
      "Saving variants",
      "Live preview necessity",
    ]) {
      expect(report).toContain(evidence);
    }
    expect(report).toContain("A-011 remains OPEN");
    expect(report).toContain("not a learner study");
  });

  it("makes deviations and deferred rendering explicit", () => {
    expect(deviations).toContain("DEV-001");
    expect(deviations).toContain("Implementation deviations from Architecture baseline 0.2: none");
    expect(coverage).toContain("Deferred functional renderer coverage");
    expect(report).toContain("pending Lead Architect conformance review");
  });
});
