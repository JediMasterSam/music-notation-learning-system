import { describe, expect, it } from "vitest";

import { createVocabularyReport, runCorpusTest } from "@mnls/corpus-tools";
import { listLearningStrategies } from "@mnls/learning";
import { fixtureNames, loadFixture } from "@mnls/test-fixtures";
import { listBuiltInStrategies } from "@mnls/workbench";

describe("Sprint 1 corpus report", () => {
  it("validates every fixture, source record, category disposition, and coverage family", () => {
    const report = runCorpusTest(
      fixtureNames.map((name) => ({
        path: `corpus/fixtures/${name}/canonical.json`,
        value: loadFixture(name),
      })),
    );
    expect(report.status, JSON.stringify(report.diagnostics)).toBe("pass");
    expect(report.fixtures).toHaveLength(4);
    expect(report.fixtures.every(({ lawfulSourceRecords }) => lawfulSourceRecords > 0)).toBe(true);
    expect(report.sourcePolicy).toBe("pass");
    expect(report.categoryCoverage.map(({ id }) => id)).toEqual(
      Array.from({ length: 11 }, (_, index) => `C-G${String(index + 1).padStart(2, "0")}`),
    );
    expect(report.categoryCoverage.filter(({ status }) => status === "deferred")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "C-G03" }),
        expect.objectContaining({ id: "C-G07" }),
        expect.objectContaining({ id: "C-G08" }),
      ]),
    );
    expect(report.coverage.requirements).toEqual(
      expect.arrayContaining(["R-043", "R-045", "R-057", "R-058"]),
    );
    expect(report.coverage.architectureDecisions).toContain("ADR-017");
    expect(report.coverage.handoffObligations).toContain("deterministic-run-evidence");
    expect(report.coverage.recipes).toHaveLength(2);
    expect(report.coverage.strategies).toHaveLength(10);
    expect(report.coverage.transformations).toEqual(["mnls.learning.idea-boundary@1"]);
    expect(report.coverage.deferredFunctionalRendering.length).toBeGreaterThan(0);
  });

  it("keeps experiment identifiers separate from canonical learner vocabulary", () => {
    const report = createVocabularyReport({
      experimentStrategyIds: listBuiltInStrategies().map(({ id }) => id),
      learningTransformationIds: listLearningStrategies().map(({ id }) => id),
    });
    expect(report.canonicalPatternVocabulary).toEqual([]);
    expect(report.experimentStrategyIds).toContain("mnls.pitch.absolute-chromatic-y");
    expect(report.learningTransformationIds).toEqual(["mnls.learning.idea-boundary"]);
    expect(report.note).toContain("not canonical learner vocabulary");
  });

  it("fails a fixture whose lawful-use evidence is missing", () => {
    const value = structuredClone(loadFixture("melody-spatial-a")) as Record<string, unknown>;
    value.sourceRegister = [];
    const report = runCorpusTest([{ path: "unlawful.json", value }]);
    expect(report.status).toBe("fail");
    expect(report.diagnostics.map(({ code }) => code)).toContain("CORPUS_SOURCE_POLICY_INVALID");
  });
});
