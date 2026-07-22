import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import type { RepresentationRecipeData } from "./types.js";
import { schemaIds, validateArtifact } from "./validator.js";

const examplesDirectory = new URL("../examples/", import.meta.url);

function example(name: string): unknown {
  return JSON.parse(readFileSync(new URL(name, examplesDirectory), "utf8")) as unknown;
}

const exampleFamilies = [
  [schemaIds.canonical, "canonical"],
  [schemaIds.chordQualityVocabulary, "chord-quality-vocabulary"],
  [schemaIds.representationRecipe, "recipe"],
  [schemaIds.learningTransformation, "learning-transformation"],
  [schemaIds.learningPlan, "learning-plan"],
  [schemaIds.experimentDefinition, "experiment"],
  [schemaIds.runManifest, "run-manifest"],
  [schemaIds.capabilityProfile, "capability-profile"],
] as const;

function canonicalWithEvent(event: Record<string, unknown>): Record<string, unknown> {
  const document = structuredClone(example("canonical.valid.json")) as Record<string, unknown>;
  const arrangement = (document.arrangements as Record<string, unknown>[])[0]!;
  arrangement.roles = [{ id: "role.primary", kind: "primary-line" }];
  arrangement.events = [event];
  return document;
}

function chordEvent(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "event.chord",
    type: "chord",
    start: { beat: { numerator: 0, denominator: 1 } },
    duration: { beats: { numerator: 1, denominator: 1 } },
    roleRefs: ["role.primary"],
    harmony: {
      root: {
        strategy: "spelled-pitch",
        version: "1",
        value: { step: "C", alter: 0 },
      },
      quality: {
        vocabularyId: "mnls.chord-quality",
        vocabularyVersion: "1.0.0",
        qualityId: "major",
      },
    },
    voicing: { state: "intentionally-unspecified", reason: "performer choice" },
    ...overrides,
  };
}

describe("schema family examples", () => {
  for (const [schemaId, basename] of exampleFamilies) {
    it(`accepts ${basename}.valid.json`, () => {
      expect(validateArtifact(schemaId, example(`${basename}.valid.json`)).ok).toBe(true);
    });

    it(`rejects ${basename}.invalid.json`, () => {
      const result = validateArtifact(schemaId, example(`${basename}.invalid.json`));
      expect(result.ok).toBe(false);
      expect(result.diagnostics[0]?.code).toBe("SCHEMA_INVALID");
    });
  }
});

describe("mandatory ownership and authority negatives", () => {
  it("rejects arrangement-owned learning chunks and layout fields", () => {
    const document = structuredClone(example("canonical.valid.json")) as Record<string, unknown>;
    const arrangement = (document.arrangements as Record<string, unknown>[])[0]!;
    arrangement.learningChunks = [];
    arrangement.x = 10;
    arrangement.lineBreak = true;
    expect(validateArtifact(schemaIds.canonical, document).ok).toBe(false);
  });

  it("rejects a value attached to an absent specificity state", () => {
    const document = canonicalWithEvent({
      id: "event.note",
      type: "note",
      start: { beat: { numerator: 0, denominator: 1 } },
      duration: { beats: { numerator: 1, denominator: 1 } },
      roleRefs: ["role.primary"],
      pitch: {
        state: "unknown",
        value: { strategy: "spelled-pitch", version: "1", value: { step: "C", octave: 4 } },
      },
    });
    expect(validateArtifact(schemaIds.canonical, document).ok).toBe(false);
  });

  it("rejects unrestricted chord quality and authoritative analysis strings", () => {
    const opaqueQuality = chordEvent({
      harmony: {
        root: { strategy: "spelled-pitch", version: "1", value: { step: "C", alter: 0 } },
        quality: "kind of major-ish",
        function: "dominant feeling",
        romanNumeral: "V7/V maybe",
      },
    });
    expect(validateArtifact(schemaIds.canonical, canonicalWithEvent(opaqueQuality)).ok).toBe(false);
  });

  it("accepts annotations only with explicit annotation authority", () => {
    const event = chordEvent({
      analysisAnnotations: [
        {
          id: "annotation.analysis",
          text: "V7/V maybe",
          system: "free-form",
          authority: "annotation",
        },
      ],
    });
    expect(validateArtifact(schemaIds.canonical, canonicalWithEvent(event)).ok).toBe(true);
  });

  it("rejects recipes with music, coordinates, code, markup, or capability evidence", () => {
    const prohibitedKeys = ["events", "x", "script", "html", "capabilities"] as const;
    for (const key of prohibitedKeys) {
      const recipe = structuredClone(example("recipe.valid.json")) as Record<string, unknown>;
      recipe[key] = key === "x" ? 10 : [];
      expect(validateArtifact(schemaIds.representationRecipe, recipe).ok).toBe(false);
    }
  });

  it("rejects executable transformation configuration", () => {
    const definition = structuredClone(example("learning-transformation.valid.json")) as Record<
      string,
      unknown
    >;
    definition.ruleConfiguration = { callback: "fixtureSpecificCode" };
    expect(validateArtifact(schemaIds.learningTransformation, definition).ok).toBe(false);
  });

  it("rejects copied musical payload in a learning chunk", () => {
    expect(validateArtifact(schemaIds.learningPlan, example("learning-plan.invalid.json")).ok).toBe(
      false,
    );
  });

  it("rejects arrangement capability evidence from another authority", () => {
    expect(
      validateArtifact(schemaIds.capabilityProfile, example("capability-profile.invalid.json")).ok,
    ).toBe(false);
  });
});

describe("TypeScript contract parity", () => {
  it("keeps a valid recipe assignable to the public recipe type and schema", () => {
    const recipe = {
      formatVersion: "0.1.0",
      id: "mnls.recipe.type-parity",
      version: "1.0.0",
      name: "Type parity",
      status: "comparison",
      strategies: {
        timeMapping: { strategyId: "mnls.time.example", strategyVersion: "1", options: {} },
        pitchMapping: { strategyId: "mnls.pitch.example", strategyVersion: "1", options: {} },
        durationEncoding: {
          strategyId: "mnls.duration.example",
          strategyVersion: "1",
          options: {},
        },
        pitchLabels: { strategyId: "mnls.labels.example", strategyVersion: "1", options: {} },
      },
      visibility: {},
      accessibility: {
        includeExactPitch: true,
        includeExactTime: true,
        includeSourceOrderEvents: true,
      },
      renderer: { strategyId: "mnls.renderer.example", strategyVersion: "1", options: {} },
    } as const satisfies RepresentationRecipeData;

    expect(validateArtifact(schemaIds.representationRecipe, recipe).ok).toBe(true);
  });
});
