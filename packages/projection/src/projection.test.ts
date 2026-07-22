import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  analyzeArrangementCapabilities,
  analyzeRendererCapabilities,
} from "@mnls/capability-analysis";
import {
  analyzeLearningPlanCapabilities,
  verifyLearningPlan,
  type LearningPlan,
  type LearningTransformationDefinition,
  type VerifiedLearningPlan,
} from "@mnls/learning";
import { canonicalStringify, contentHash, type CanonicalDocument } from "@mnls/model";
import { normalize, type NormalizedArrangement } from "@mnls/normalizer";
import { loadFixture } from "@mnls/test-fixtures";
import { resolveRecipe, type RepresentationRecipe, type ResolvedRecipe } from "@mnls/workbench";

import { projectView, projectedSemanticBytes, type ProjectedChordEvent } from "./index.js";

const repositoryFile = (path: string): URL => new URL(`../../../${path}`, import.meta.url);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(repositoryFile(path), "utf8")) as unknown;
}

function rendererProfile() {
  return analyzeRendererCapabilities({
    id: "mnls.renderer.html-svg",
    version: "1",
    implementationHash: contentHash({ id: "mnls.renderer.html-svg", version: "1" }),
    capabilities: [
      "renderer.svg",
      "renderer.accessible-event-list",
      "renderer.overlay.beat-subdivision",
      "renderer.overlay.time-reference",
      "renderer.overlay.learning-chunks",
    ],
  });
}

function verifiedMelodyPlan(
  document: CanonicalDocument,
  normalized: NormalizedArrangement,
): VerifiedLearningPlan {
  const definition = readJson(
    "learning/transformations/idea-boundary.learning-transform.json",
  ) as LearningTransformationDefinition;
  const plan = readJson("learning/expected/melody-spatial-a.learning-plan.json") as LearningPlan;
  const verified = verifyLearningPlan(plan, document, normalized, definition);
  if (!verified.ok) throw new Error(JSON.stringify(verified.diagnostics));
  return verified.value;
}

function melodyPipeline(recipeName: string) {
  const document = loadFixture("melody-spatial-a") as CanonicalDocument;
  const normalized = normalize(document, document.arrangements[0]!.id);
  if (!normalized.ok) throw new Error(JSON.stringify(normalized.diagnostics));
  const verified = verifiedMelodyPlan(document, normalized.value);
  const inputProfile = {
    arrangement: analyzeArrangementCapabilities(document, normalized.value),
    learningPlan: analyzeLearningPlanCapabilities(verified),
    renderer: rendererProfile(),
  };
  const recipe = readJson(`experiments/recipes/${recipeName}.recipe.json`) as RepresentationRecipe;
  const resolved = resolveRecipe(recipe, inputProfile);
  if (!resolved.ok) throw new Error(JSON.stringify(resolved.diagnostics));
  return { document, normalized: normalized.value, verified, recipe: resolved.value };
}

function chordProjectionRecipe(includeHints: boolean): ResolvedRecipe {
  const withoutHash: Omit<ResolvedRecipe, "resolutionHash"> = {
    formatVersion: "0.1.0",
    recipeRef: {
      id: "mnls.recipe.projection-contract",
      version: "1.0.0",
      contentHash: contentHash({ id: "mnls.recipe.projection-contract", includeHints }),
    },
    authoredIdentity: {
      name: "Projection contract",
      status: "internal",
    },
    selections: [],
    compatibility: { status: "supported", diagnostics: [], limitations: [] },
    canonicalOptions: {
      accessibility: {
        includeExactPitch: true,
        includeExactTime: true,
        includeSourceOrderEvents: true,
      },
      limitationPolicy: { acceptedClasses: [] },
      strategies: {},
      visibility: { includeHints, includeLearningPlan: false },
    },
  };
  return { ...withoutHash, resolutionHash: contentHash(withoutHash) };
}

describe("recipe-neutral M-A projection", () => {
  it("projects identical semantic content and overlays for both required treatments", () => {
    const grid = melodyPipeline("explicit-grid");
    const proportional = melodyPipeline("proportional-spatial-melody");
    const gridProjection = projectView({
      arrangement: grid.normalized,
      recipe: grid.recipe,
      learningPlan: grid.verified,
    });
    const proportionalProjection = projectView({
      arrangement: proportional.normalized,
      recipe: proportional.recipe,
      learningPlan: proportional.verified,
    });
    expect(gridProjection.ok && proportionalProjection.ok).toBe(true);
    if (!gridProjection.ok || !proportionalProjection.ok) return;
    expect(projectedSemanticBytes(gridProjection.value)).toBe(
      projectedSemanticBytes(proportionalProjection.value),
    );
    expect(gridProjection.value.semanticContentHash).toBe(
      proportionalProjection.value.semanticContentHash,
    );
    expect(canonicalStringify(gridProjection.value)).toBe(
      canonicalStringify(proportionalProjection.value),
    );
    expect(gridProjection.value.events).toHaveLength(6);
    expect(gridProjection.value.semanticOverlays).toHaveLength(2);
    expect(
      gridProjection.value.semanticOverlays.every(
        ({ planId, selectedEventIds }) =>
          planId === grid.verified.plan.id && selectedEventIds.length > 0,
      ),
    ).toBe(true);
    expect(canonicalStringify(gridProjection.value.semanticOverlays)).not.toMatch(
      /"pitch"|"harmony"|"events"/,
    );
    expect(canonicalStringify(gridProjection.value)).not.toMatch(
      /"x"\s*:|"y"\s*:|"width"\s*:|"lineBreak"\s*:/,
    );
  });

  it("preserves exact time, pitch, role, specificity, and append-only provenance", () => {
    const pipeline = melodyPipeline("explicit-grid");
    const result = projectView({
      arrangement: pipeline.normalized,
      recipe: pipeline.recipe,
      learningPlan: pipeline.verified,
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.events.map(({ start }) => start)).toEqual(
      pipeline.normalized.events.map(({ start }) => start),
    );
    expect(result.value.events.map(({ duration }) => duration)).toEqual(
      pipeline.normalized.events.map(({ duration }) => duration),
    );
    expect(result.value.events.map(({ eventSpecificity }) => eventSpecificity)).toEqual([
      "required",
      "suggested",
      "optional",
      "required",
      "required",
      "required",
    ]);
    expect(
      result.value.events.every(
        (event) =>
          event.type === "note" &&
          event.exactPitchLabelSource !== undefined &&
          event.provenance.steps[0]?.sourceId === event.sourceId,
      ),
    ).toBe(true);
    expect(Object.keys(result.value.provenanceIndex)).toEqual(
      result.value.events.map(({ id }) => id),
    );
  });

  it("stops before projection when a resolved learning overlay lacks its verified plan", () => {
    const pipeline = melodyPipeline("explicit-grid");
    const result = projectView({ arrangement: pipeline.normalized, recipe: pipeline.recipe });
    expect(result).toMatchObject({
      ok: false,
      diagnostics: [{ code: "PROJECT_LEARNING_PLAN_MISSING", stage: "project" }],
    });
  });
});

describe("canonical harmony and subordinate hint projection", () => {
  function projected(document: CanonicalDocument, includeHints = true) {
    const normalized = normalize(document, document.arrangements[0]!.id);
    if (!normalized.ok) throw new Error(JSON.stringify(normalized.diagnostics));
    const result = projectView({
      arrangement: normalized.value,
      recipe: chordProjectionRecipe(includeHints),
    });
    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    return result.value;
  }

  it("keeps C-D canonical harmony primary and familiar-shape hints separately subordinate", () => {
    const view = projected(loadFixture("contract-voicing-hints") as CanonicalDocument);
    const chord = view.events[0] as ProjectedChordEvent;
    expect(chord.canonicalHarmony.quality).toEqual({
      vocabularyId: "mnls.chord-quality",
      vocabularyVersion: "1.0.0",
      qualityId: "minor",
    });
    expect(chord.familiarShapeHints[0]?.upperStructure.quality.qualityId).toBe("major");
    expect(chord.slashBass).toMatchObject({
      state: "required",
      value: { value: { step: "A" } },
    });
    expect(chord.voicing.state).toBe("required");
    expect(canonicalStringify(view.events)).not.toMatch(/analysisAnnotations|V7\/V|do not parse/);
  });

  it("does not let free-form harmonic annotation text affect projected semantic content", () => {
    const source = loadFixture("contract-voicing-hints") as CanonicalDocument;
    const arrangement = source.arrangements[0]!;
    const firstEvent = arrangement.events[0]!;
    if (firstEvent.type !== "chord") throw new Error("fixture contract changed");
    const changed: CanonicalDocument = {
      ...source,
      arrangements: [
        {
          ...arrangement,
          events: [
            {
              ...firstEvent,
              analysisAnnotations: [
                {
                  id: "annotation.contract-voicing-hints.analysis",
                  text: "Completely different unparsed analysis text",
                  authority: "annotation",
                },
              ],
            },
            ...arrangement.events.slice(1),
          ],
        },
      ],
    };
    const baseline = projected(source);
    const altered = projected(changed);
    expect(projectedSemanticBytes(altered)).toBe(projectedSemanticBytes(baseline));
    expect(altered.semanticContentHash).toBe(baseline.semanticContentHash);
  });
});
