import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { validateExperimentDefinition } from "./index.js";

const definitionPath = new URL(
  "../../../experiments/definitions/spatial-melody-comparison.experiment.json",
  import.meta.url,
);

function definition(): unknown {
  return JSON.parse(readFileSync(definitionPath, "utf8")) as unknown;
}

describe("experiment definition", () => {
  it("validates the pinned E-007 comparison intent", () => {
    const result = validateExperimentDefinition(definition());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.fixtureRefs).toHaveLength(1);
    expect(result.value.treatmentRefs).toHaveLength(2);
    expect(result.value.controlledVariables.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "canonical-normalized-source",
        "vertical-pitch-mapping",
        "exact-pitch-labels",
        "accessibility-data",
        "renderer-environment-policy",
      ]),
    );
    expect(result.value.changedVariables.map(({ id }) => id)).toEqual([
      "time-mapping",
      "duration-encoding",
      "temporal-reference-overlay",
    ]);
    expect(result.value.researchQuestion).toContain("absolute-chromatic vertical pitch mapping");
  });

  it("rejects overlapping controlled and changed variables", () => {
    const value = definition() as {
      changedVariables: { id: string; description: string }[];
    };
    value.changedVariables[0]!.id = "canonical-normalized-source";
    expect(validateExperimentDefinition(value)).toMatchObject({
      ok: false,
      diagnostics: [{ code: "EXPERIMENT_SCHEMA_INVALID" }],
    });
  });
});
