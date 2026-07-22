import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { analyzeArrangementCapabilities } from "@mnls/capability-analysis";
import {
  canonicalStringify,
  contentHash,
  type CanonicalDocument,
  type JSONValue,
} from "@mnls/model";
import { normalize } from "@mnls/normalizer";
import { schemaIds, validateArtifact } from "@mnls/schema";
import { loadFixture, type FixtureName } from "@mnls/test-fixtures";
import { transposeCanonicalDocument } from "@mnls/transposition";

import {
  analyzeLearningPlanCapabilities,
  generateLearningPlan,
  materializeIdeaBoundaryParameters,
  verifyLearningPlan,
  type LearningPlan,
  type LearningPlanOverride,
  type LearningTransformationDefinition,
} from "./index.js";

const definitionUrl = new URL(
  "../../../learning/transformations/idea-boundary.learning-transform.json",
  import.meta.url,
);
const parametersUrl = new URL(
  "../../../learning/transformations/idea-boundary.parameters.json",
  import.meta.url,
);

function readJson(url: URL): unknown {
  return JSON.parse(readFileSync(url, "utf8")) as unknown;
}

const definition = readJson(definitionUrl) as LearningTransformationDefinition;
const parameters = readJson(parametersUrl) as JSONValue;

function artifacts(name: FixtureName, source?: CanonicalDocument) {
  const document = source ?? (loadFixture(name) as CanonicalDocument);
  const arrangementId = document.arrangements[0]!.id;
  const normalized = normalize(document, arrangementId);
  expect(normalized.ok, JSON.stringify(normalized.diagnostics)).toBe(true);
  if (!normalized.ok) throw new Error("normalization failed");
  const profile = analyzeArrangementCapabilities(document, normalized.value);
  return { document, normalized: normalized.value, profile };
}

function generate(name: FixtureName, source?: CanonicalDocument): LearningPlan {
  const values = artifacts(name, source);
  const generated = generateLearningPlan(
    values.document,
    values.normalized,
    values.profile,
    definition,
    parameters,
  );
  expect(generated.ok, JSON.stringify(generated.diagnostics)).toBe(true);
  if (!generated.ok) throw new Error("plan generation failed");
  return generated.value;
}

describe("idea-boundary@1 definition and parameters", () => {
  it("validates the committed definition and materializes deterministic defaults", () => {
    expect(validateArtifact(schemaIds.learningTransformation, definition).ok).toBe(true);
    const defaults = materializeIdeaBoundaryParameters({});
    expect(defaults.ok).toBe(true);
    if (!defaults.ok) return;
    expect(defaults.value).toEqual({
      includedRoleKinds: [],
      includeTransitions: false,
      order: "canonical-time",
    });
    expect(materializeIdeaBoundaryParameters(parameters)).toMatchObject({ ok: true });
    expect(materializeIdeaBoundaryParameters({ callback: "fixture-code" })).toMatchObject({
      ok: false,
      diagnostics: [{ code: "LEARN_PARAMETER_INVALID" }],
    });
  });

  it("contains no fixture-specific branch names", () => {
    const source = readFileSync(new URL("./idea-boundary-v1.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/melody-spatial-a|melody-learning-b|harmony-grid-c/);
  });
});

describe("derived learning plans", () => {
  it.each(["melody-spatial-a", "melody-learning-b"] as const)(
    "generates and verifies %s byte-identically without canonical mutation",
    (name) => {
      const values = artifacts(name);
      const beforeHash = contentHash(values.document);
      const first = generateLearningPlan(
        values.document,
        values.normalized,
        values.profile,
        definition,
        parameters,
      );
      const second = generateLearningPlan(
        values.document,
        values.normalized,
        values.profile,
        definition,
        parameters,
      );
      expect(first.ok && second.ok).toBe(true);
      if (!first.ok || !second.ok) return;
      expect(canonicalStringify(first.value)).toBe(canonicalStringify(second.value));
      expect(first.value.chunks).toHaveLength(2);
      expect(new Set(first.value.chunks.map(({ id }) => id)).size).toBe(2);
      expect(first.value.chunks.every(({ selectors }) => selectors.length === 2)).toBe(true);
      expect(canonicalStringify(first.value.chunks)).not.toMatch(/"pitch"|"harmony"|"events"/);
      expect(validateArtifact(schemaIds.learningPlan, first.value).ok).toBe(true);
      const expected = readJson(
        new URL(`../../../learning/expected/${name}.learning-plan.json`, import.meta.url),
      );
      expect(validateArtifact(schemaIds.learningPlan, expected).ok).toBe(true);
      expect(canonicalStringify(first.value)).toBe(canonicalStringify(expected));
      expect(contentHash(values.document)).toBe(beforeHash);
      const verified = verifyLearningPlan(
        first.value,
        values.document,
        values.normalized,
        definition,
      );
      expect(verified.ok, JSON.stringify(verified.diagnostics)).toBe(true);
    },
  );

  it("keeps selectors and relationships invariant under semantic transposition", () => {
    const source = loadFixture("melody-spatial-a") as CanonicalDocument;
    const transposed = transposeCanonicalDocument(source, { semitones: 2 });
    expect(transposed.ok).toBe(true);
    if (!transposed.ok) return;
    const originalPlan = generate("melody-spatial-a", source);
    const transposedPlan = generate(
      "melody-spatial-a",
      transposed.value.document as CanonicalDocument,
    );
    expect(transposedPlan.chunks.map(({ id, selectors }) => ({ id, selectors }))).toEqual(
      originalPlan.chunks.map(({ id, selectors }) => ({ id, selectors })),
    );
    expect(transposedPlan.relationships).toEqual(originalPlan.relationships);
    expect(transposedPlan.arrangementRef.contentHash).not.toBe(
      originalPlan.arrangementRef.contentHash,
    );
  });

  it("emits a structured incompatible result when musical ideas are absent", () => {
    const source = loadFixture("melody-spatial-a") as CanonicalDocument;
    const arrangement = source.arrangements[0]!;
    const withoutIdeas: CanonicalDocument = {
      ...source,
      arrangements: [
        {
          ...arrangement,
          ideas: [],
          sections: arrangement.sections.map((section) => ({ ...section, ideaRefs: [] })),
        },
      ],
    };
    const values = artifacts("melody-spatial-a", withoutIdeas);
    const result = generateLearningPlan(
      values.document,
      values.normalized,
      values.profile,
      definition,
      parameters,
    );
    expect(result).toMatchObject({
      ok: false,
      diagnostics: [{ code: "LEARN_CAPABILITY_MISSING", stage: "learning" }],
    });
  });
});

describe("verification, overrides, and plan evidence", () => {
  it("rejects stale arrangement hashes and copied canonical payloads", () => {
    const values = artifacts("melody-spatial-a");
    const plan = generate("melody-spatial-a");
    const stale: LearningPlan = {
      ...plan,
      arrangementRef: { ...plan.arrangementRef, contentHash: `sha256:${"0".repeat(64)}` },
    };
    const staleResult = verifyLearningPlan(stale, values.document, values.normalized, definition);
    expect(staleResult.ok).toBe(false);
    expect(staleResult.diagnostics.map(({ code }) => code)).toContain(
      "LEARN_ARRANGEMENT_HASH_MISMATCH",
    );

    const copied = structuredClone(plan) as unknown as Record<string, unknown>;
    const chunks = copied.chunks as Record<string, unknown>[];
    chunks[0]!.event = { type: "note", pitch: "C4" };
    const copiedResult = verifyLearningPlan(
      copied as unknown as LearningPlan,
      values.document,
      values.normalized,
      definition,
    );
    expect(copiedResult.ok).toBe(false);
    expect(copiedResult.diagnostics.map(({ code }) => code)).toContain(
      "LEARN_CANONICAL_COPY_FORBIDDEN",
    );
  });

  it("applies plan-local overrides in lexical ID order and records provenance", () => {
    const values = artifacts("melody-spatial-a");
    const base = generate("melody-spatial-a");
    const targetChunkId = base.chunks[0]!.id;
    const overrides: readonly LearningPlanOverride[] = [
      {
        id: "override.z-filter",
        targetChunkId,
        operation: { type: "set-filter", roleFilter: ["role.melody-spatial-a.primary"] },
        reason: "Exercise the plan-local filter contract",
      },
      {
        id: "override.a-label",
        targetChunkId,
        operation: { type: "replace-label", label: "Opening practice unit" },
        reason: "Exercise the plan-local label contract",
      },
    ];
    const result = generateLearningPlan(
      values.document,
      values.normalized,
      values.profile,
      definition,
      parameters,
      overrides,
    );
    expect(result.ok, JSON.stringify(result.diagnostics)).toBe(true);
    if (!result.ok) return;
    expect(result.value.chunks[0]).toMatchObject({
      label: "Opening practice unit",
      roleFilter: ["role.melody-spatial-a.primary"],
      provenance: { overrideRefs: ["override.a-label", "override.z-filter"] },
    });
    expect(
      verifyLearningPlan(result.value, values.document, values.normalized, definition).ok,
    ).toBe(true);
  });

  it("creates plan-scoped capabilities only after verification", () => {
    const values = artifacts("melody-spatial-a");
    const plan = generate("melody-spatial-a");
    expect(() =>
      analyzeLearningPlanCapabilities({
        verification: "verified-learning-plan",
        plan,
        planHash: plan.planHash,
        arrangementId: plan.arrangementRef.id,
        arrangementHash: plan.arrangementRef.contentHash,
        normalizedHash: plan.normalizedArrangementHash,
        definitionHash: plan.transformationRef.contentHash,
      }),
    ).toThrow(/verifyLearningPlan/);
    const verified = verifyLearningPlan(plan, values.document, values.normalized, definition);
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    const profile = analyzeLearningPlanCapabilities(verified.value);
    expect(validateArtifact(schemaIds.capabilityProfile, profile).ok).toBe(true);
    expect(
      profile.capabilities.every(({ source }) => source.authority === "verified-learning-plan"),
    ).toBe(true);
    expect(
      profile.capabilities.every(
        ({ source, evidenceRefs }) =>
          source.contentHash === plan.planHash &&
          evidenceRefs?.some((ref) => ref.includes(values.profile.canonicalHash)),
      ),
    ).toBe(true);
    expect(
      canonicalStringify(analyzeArrangementCapabilities(values.document, values.normalized)),
    ).toBe(canonicalStringify(values.profile));
  });
});
