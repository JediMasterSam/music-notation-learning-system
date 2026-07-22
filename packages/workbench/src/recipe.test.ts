import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { TreatmentInputProfile } from "@mnls/capabilities";
import {
  analyzeArrangementCapabilities,
  analyzeRendererCapabilities,
} from "@mnls/capability-analysis";
import {
  analyzeLearningPlanCapabilities,
  verifyLearningPlan,
  type LearningPlan,
  type LearningTransformationDefinition,
} from "@mnls/learning";
import { canonicalStringify, contentHash, type CanonicalDocument } from "@mnls/model";
import { normalize } from "@mnls/normalizer";
import { schemaIds, validateArtifact } from "@mnls/schema";
import { loadFixture } from "@mnls/test-fixtures";

import { resolveRecipe, type RepresentationRecipe } from "./index.js";

const repositoryFile = (path: string): URL => new URL(`../../../${path}`, import.meta.url);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(repositoryFile(path), "utf8")) as unknown;
}

const recipes = {
  grid: readJson("experiments/recipes/explicit-grid.recipe.json") as RepresentationRecipe,
  proportional: readJson(
    "experiments/recipes/proportional-spatial-melody.recipe.json",
  ) as RepresentationRecipe,
};

function inputProfile(): TreatmentInputProfile {
  const document = loadFixture("melody-spatial-a") as CanonicalDocument;
  const normalized = normalize(document, document.arrangements[0]!.id);
  if (!normalized.ok) throw new Error(JSON.stringify(normalized.diagnostics));
  const arrangement = analyzeArrangementCapabilities(document, normalized.value);
  const definition = readJson(
    "learning/transformations/idea-boundary.learning-transform.json",
  ) as LearningTransformationDefinition;
  const plan = readJson("learning/expected/melody-spatial-a.learning-plan.json") as LearningPlan;
  const verified = verifyLearningPlan(plan, document, normalized.value, definition);
  if (!verified.ok) throw new Error(JSON.stringify(verified.diagnostics));
  const learningPlan = analyzeLearningPlanCapabilities(verified.value);
  const renderer = analyzeRendererCapabilities({
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
  return { arrangement, learningPlan, renderer };
}

function diagnosticCodes(result: ReturnType<typeof resolveRecipe>): readonly string[] {
  return result.diagnostics.map(({ code }) => code);
}

describe("committed Sprint 1 recipes", () => {
  it("validates and resolves both recipes as supported with fully materialized defaults", () => {
    const input = inputProfile();
    const arrangementBefore = canonicalStringify(input.arrangement);
    const planBefore = canonicalStringify(input.learningPlan);
    const grid = resolveRecipe(recipes.grid, input);
    const proportional = resolveRecipe(recipes.proportional, input);
    expect(validateArtifact(schemaIds.representationRecipe, recipes.grid).ok).toBe(true);
    expect(validateArtifact(schemaIds.representationRecipe, recipes.proportional).ok).toBe(true);
    expect(grid.ok && proportional.ok).toBe(true);
    if (!grid.ok || !proportional.ok) return;
    expect(grid.value.compatibility.status).toBe("supported");
    expect(proportional.value.compatibility.status).toBe("supported");
    expect(grid.value.selections.find(({ slot }) => slot === "timeMapping")?.options).toEqual({
      originX: 48,
      subdivisionsPerBeat: 2,
      unitsPerCell: 48,
    });
    expect(
      proportional.value.selections.find(({ slot }) => slot === "timeMapping")?.options,
    ).toEqual({ originX: 48, unitsPerBeat: 96 });
    const pitch = (result: typeof grid) =>
      result.value.selections.find(({ slot }) => slot === "pitchMapping");
    expect(pitch(grid)).toEqual(pitch(proportional));
    expect(resolveRecipe(recipes.grid, input)).toEqual(grid);
    expect(canonicalStringify(input.arrangement)).toBe(arrangementBefore);
    expect(canonicalStringify(input.learningPlan)).toBe(planBefore);
    expect(grid.value.resolutionHash).not.toBe(proportional.value.resolutionHash);
    expect(canonicalStringify(grid.value)).not.toMatch(/"events"|"pitch"\s*:/);
  });

  it("does not describe either comparison treatment as final, approved, preferred, or winning", () => {
    const serialized = canonicalStringify(recipes).toLowerCase();
    expect(serialized).not.toMatch(/final notation|approved notation|preferred|winning/);
  });
});

describe("recipe structural and exact-resolution failures", () => {
  it("rejects a missing strategy version before resolution", () => {
    const invalid = structuredClone(recipes.grid) as unknown as Record<string, unknown>;
    const strategies = invalid.strategies as Record<string, Record<string, unknown>>;
    delete strategies.timeMapping!.strategyVersion;
    const result = resolveRecipe(invalid, inputProfile());
    expect(result.ok).toBe(false);
    expect(diagnosticCodes(result)).toContain("RECIPE_SCHEMA_INVALID");
    expect(result).not.toHaveProperty("value");
  });

  it("returns unavailable for an uninstalled pinned version and never falls back", () => {
    const invalid: RepresentationRecipe = {
      ...recipes.grid,
      strategies: {
        ...recipes.grid.strategies,
        timeMapping: { ...recipes.grid.strategies.timeMapping, strategyVersion: "99" },
      },
    };
    const result = resolveRecipe(invalid, inputProfile());
    expect(result).toMatchObject({ ok: false, status: "unavailable" });
    expect(diagnosticCodes(result)).toContain("STRATEGY_NOT_FOUND");
    expect(result).not.toHaveProperty("value");
  });

  it("rejects unknown strategy options instead of inventing defaults", () => {
    const invalid: RepresentationRecipe = {
      ...recipes.proportional,
      strategies: {
        ...recipes.proportional.strategies,
        timeMapping: {
          ...recipes.proportional.strategies.timeMapping,
          options: { fixturePitch: "C4" },
        },
      },
    };
    const result = resolveRecipe(invalid, inputProfile());
    expect(result.ok).toBe(false);
    expect(diagnosticCodes(result)).toContain("STRATEGY_OPTION_INVALID");
    expect(result).not.toHaveProperty("value");
  });

  it.each(["events", "callback", "html"])(
    "rejects recipe configuration containing %s",
    (prohibitedKey) => {
      const invalid = structuredClone(recipes.grid) as unknown as Record<string, unknown>;
      invalid[prohibitedKey] = prohibitedKey === "events" ? [] : "executable-or-markup";
      const result = resolveRecipe(invalid, inputProfile());
      expect(result.ok).toBe(false);
      expect(diagnosticCodes(result)).toContain("RECIPE_SCHEMA_INVALID");
      expect(result).not.toHaveProperty("value");
    },
  );
});

describe("artifact-scoped and cross-strategy compatibility", () => {
  it("rejects exact hand isolation when assignments are not exact", () => {
    const recipe: RepresentationRecipe = {
      ...recipes.grid,
      visibility: { ...recipes.grid.visibility, hands: ["left"] },
    };
    const result = resolveRecipe(recipe, inputProfile());
    expect(result).toMatchObject({ ok: false, status: "incompatible" });
    if (result.ok) return;
    expect(result.compatibility?.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "CAPABILITY_MISSING",
          requirementSource: "arrangement",
          capability: "hands.exact-assignment",
        }),
      ]),
    );
  });

  it("rejects a duration strategy when exact duration evidence is absent", () => {
    const source = inputProfile();
    const profile: TreatmentInputProfile = {
      ...source,
      arrangement: {
        ...source.arrangement,
        capabilities: source.arrangement.capabilities.map((evidence) =>
          evidence.capability === "time.exact-duration"
            ? { ...evidence, state: "unknown" }
            : evidence,
        ),
      },
    };
    const result = resolveRecipe(recipes.proportional, profile);
    expect(result).toMatchObject({ ok: false, status: "incompatible" });
    if (result.ok) return;
    expect(result.compatibility?.diagnostics.map(({ capability }) => capability)).toContain(
      "time.exact-duration",
    );
  });

  it("rejects a grid subdivision too coarse for exact event boundaries", () => {
    const recipe: RepresentationRecipe = {
      ...recipes.grid,
      strategies: {
        ...recipes.grid.strategies,
        timeMapping: {
          ...recipes.grid.strategies.timeMapping,
          options: { subdivisionsPerBeat: 1 },
        },
      },
    };
    const result = resolveRecipe(recipe, inputProfile());
    expect(result).toMatchObject({ ok: false, status: "incompatible" });
    if (result.ok) return;
    expect(result.compatibility?.diagnostics.map(({ capability }) => capability)).toContain(
      "time.grid-subdivision.1",
    );
  });

  it("rejects a learning overlay without a verified matching plan profile", () => {
    const profile = inputProfile();
    const result = resolveRecipe(recipes.grid, {
      arrangement: profile.arrangement,
      renderer: profile.renderer,
    });
    expect(result).toMatchObject({ ok: false, status: "incompatible" });
    if (result.ok) return;
    expect(result.compatibility?.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          requirementSource: "learning-plan",
          capability: "learning-plan.has-chunks",
        }),
      ]),
    );
  });

  it("rejects a stale learning-plan arrangement hash", () => {
    const source = inputProfile();
    if (!source.learningPlan) throw new Error("test setup requires plan profile");
    const profile: TreatmentInputProfile = {
      ...source,
      learningPlan: {
        ...source.learningPlan,
        arrangementHash: `sha256:${"0".repeat(64)}`,
      },
    };
    const result = resolveRecipe(recipes.grid, profile);
    expect(result).toMatchObject({ ok: false, status: "incompatible" });
    if (result.ok) return;
    expect(result.compatibility?.diagnostics.map(({ code }) => code)).toContain(
      "CAPABILITY_PLAN_ARRANGEMENT_MISMATCH",
    );
  });

  it("rejects an overlay absent from renderer evidence", () => {
    const source = inputProfile();
    const profile: TreatmentInputProfile = {
      ...source,
      renderer: {
        ...source.renderer,
        capabilities: source.renderer.capabilities.filter(
          ({ capability }) => capability !== "renderer.overlay.beat-subdivision",
        ),
      },
    };
    const result = resolveRecipe(recipes.grid, profile);
    expect(result).toMatchObject({ ok: false, status: "incompatible" });
    if (result.ok) return;
    expect(result.compatibility?.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          requirementSource: "renderer",
          capability: "renderer.overlay.beat-subdivision",
        }),
      ]),
    );
  });
});
