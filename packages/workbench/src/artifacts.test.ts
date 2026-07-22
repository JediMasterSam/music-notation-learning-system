import { describe, expect, it } from "vitest";

import { contentHash, textContentHash } from "@mnls/model";
import { schemaIds, validateArtifact } from "@mnls/schema";

import {
  createTreatmentArtifactBundle,
  type ResolvedRecipe,
  type TreatmentArtifactBundleInput,
} from "./index.js";

const hash = (character: string): string => `sha256:${character.repeat(64)}`;

const resolvedRecipe: ResolvedRecipe = {
  formatVersion: "0.1.0",
  recipeRef: { id: "mnls.recipe.test", version: "1", contentHash: hash("a") },
  authoredIdentity: {
    name: "Comparison treatment",
    status: "comparison",
  },
  selections: [
    {
      slot: "timeMapping",
      strategyId: "mnls.time.proportional",
      strategyVersion: "1",
      kind: "time-mapping",
      optionSchemaRef: "mnls.time.proportional.options@1",
      options: { originX: 48, unitsPerBeat: 96 },
    },
    {
      slot: "renderer",
      strategyId: "mnls.renderer.html-svg",
      strategyVersion: "1",
      kind: "renderer",
      optionSchemaRef: "mnls.renderer.html-svg.options@1",
      options: { includeEventTable: true, titleLevel: 1 },
    },
  ],
  compatibility: { status: "supported", diagnostics: [], limitations: [] },
  canonicalOptions: {},
  resolutionHash: hash("b"),
};

function bundleInput(): TreatmentArtifactBundleInput {
  return {
    id: "treatment.test",
    inputRefs: [
      { id: "mnls.recipe.test", version: "1", contentHash: hash("a") },
      { id: "arrangement.test", version: "0.1.0", contentHash: hash("c") },
    ],
    resolvedRecipe,
    identity: {
      canonicalHash: hash("c"),
      normalizedHash: hash("d"),
      projectionHash: hash("e"),
      layoutHash: hash("f"),
      learningPlanHash: hash("1"),
      transformationHash: hash("2"),
      environmentHash: hash("3"),
    },
    rendererRef: {
      id: "mnls.renderer.html-svg",
      version: "1",
      implementationHash: hash("4"),
    },
    toolVersions: {
      "mnls.layout": "0.1.0",
      "mnls.renderer-html": "0.1.0",
      "mnls.workbench": "0.1.0",
    },
    indexHtml: "<!doctype html>\n<title>Comparison treatment</title>\n",
    diagnostics: [],
    provenance: {
      events: [
        {
          sourceId: "event.test",
          provenanceRefs: ["canonical:event.test", "projection:event.test"],
        },
      ],
    },
    learningPlan: { id: "plan.test", planHash: hash("1") },
  };
}

describe("deterministic treatment artifacts", () => {
  it("creates all required evidence files and a schema-valid manifest", () => {
    const input = bundleInput();
    const result = createTreatmentArtifactBundle(input);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.value.files).sort()).toEqual([
      "diagnostics.json",
      "index.html",
      "learning-plan.json",
      "manifest.json",
      "provenance.json",
      "resolved-recipe.json",
    ]);
    expect(validateArtifact(schemaIds.runManifest, result.value.manifest).ok).toBe(true);
    expect(
      result.value.manifest.outputArtifacts.find(({ id }) => id === "index.html")?.contentHash,
    ).toBe(textContentHash(input.indexHtml));
    expect(result.value.manifest.resolvedOptions).toMatchObject({
      identity: {
        canonicalHash: input.identity.canonicalHash,
        normalizedHash: input.identity.normalizedHash,
        projectionHash: input.identity.projectionHash,
        layoutHash: input.identity.layoutHash,
        learningPlanHash: input.identity.learningPlanHash,
        transformationHash: input.identity.transformationHash,
      },
      recipe: {
        contentHash: resolvedRecipe.recipeRef.contentHash,
        resolutionHash: resolvedRecipe.resolutionHash,
      },
      renderer: input.rendererRef,
      strategies: resolvedRecipe.selections,
      compatibility: { status: "supported", limitations: [] },
    });
    const { runHash, ...manifestWithoutHash } = result.value.manifest;
    expect(runHash).toBe(contentHash(manifestWithoutHash));
    expect(createTreatmentArtifactBundle(input)).toEqual(result);
  });

  it("changes output and run hashes when serialized bytes change", () => {
    const baseline = createTreatmentArtifactBundle(bundleInput());
    const changed = createTreatmentArtifactBundle({
      ...bundleInput(),
      indexHtml: "<!doctype html>\n<title>Changed treatment</title>\n",
    });
    expect(baseline.ok && changed.ok).toBe(true);
    if (!baseline.ok || !changed.ok) return;
    expect(changed.value.manifest.runHash).not.toBe(baseline.value.manifest.runHash);
    expect(changed.value.manifest.outputArtifacts).not.toEqual(
      baseline.value.manifest.outputArtifacts,
    );
  });

  it("does not emit files for an incompatible treatment", () => {
    const input = bundleInput();
    expect(
      createTreatmentArtifactBundle({
        ...input,
        resolvedRecipe: {
          ...input.resolvedRecipe,
          compatibility: {
            status: "incompatible",
            diagnostics: [],
            limitations: [],
          },
        },
      }),
    ).toMatchObject({
      ok: false,
      diagnostics: [{ code: "TREATMENT_BUNDLE_INCOMPATIBLE" }],
    });
  });
});
