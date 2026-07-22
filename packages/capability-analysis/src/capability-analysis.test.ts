import { describe, expect, it } from "vitest";

import type { CapabilityEvidence } from "@mnls/capabilities";
import { canonicalStringify, type CanonicalDocument } from "@mnls/model";
import { normalize } from "@mnls/normalizer";
import { schemaIds, validateArtifact } from "@mnls/schema";
import { loadFixture } from "@mnls/test-fixtures";

import {
  analyzeArrangementCapabilities,
  analyzeEnvironmentCapabilities,
  analyzeRendererCapabilities,
} from "./index.js";

function normalizedFixture(name: "melody-spatial-a" | "contract-voicing-hints") {
  const document = loadFixture(name) as CanonicalDocument;
  const arrangementId = document.arrangements[0]!.id;
  const normalized = normalize(document, arrangementId);
  expect(normalized.ok, JSON.stringify(normalized.diagnostics)).toBe(true);
  if (!normalized.ok) throw new Error("fixture normalization failed");
  return { document, normalized: normalized.value };
}

describe("artifact-scoped capability analysis", () => {
  it("emits only arrangement-authoritative evidence with IDs, hashes, and refs", () => {
    const { document, normalized } = normalizedFixture("melody-spatial-a");
    const profile = analyzeArrangementCapabilities(document, normalized);
    expect(
      profile.capabilities.every(({ source }) => source.authority === "canonical-arrangement"),
    ).toBe(true);
    expect(
      profile.capabilities.every(({ source }) => source.artifactId === profile.arrangementId),
    ).toBe(true);
    expect(
      profile.capabilities.every(({ source }) => /^sha256:[a-f0-9]{64}$/.test(source.contentHash)),
    ).toBe(true);
    expect(profile.capabilities.every(({ evidenceRefs }) => evidenceRefs !== undefined)).toBe(true);
    expect(profile.capabilities.map(({ capability }) => capability)).not.toContain(
      "learning-plan.has-chunks",
    );
    expect(profile.capabilities.map(({ capability }) => capability)).not.toContain("renderer.svg");
    expect(validateArtifact(schemaIds.capabilityProfile, profile).ok).toBe(true);
  });

  it("does not let metadata or plan-file existence forge arrangement facts", () => {
    const { document, normalized } = normalizedFixture("melody-spatial-a");
    const baseline = analyzeArrangementCapabilities(document, normalized);
    const claimedDocument: CanonicalDocument = {
      ...document,
      metadata: { planClaim: "learning-plan.has-chunks", rendererClaim: "renderer.svg" },
    };
    const claimedNormalized = normalize(claimedDocument, claimedDocument.arrangements[0]!.id);
    expect(claimedNormalized.ok).toBe(true);
    if (!claimedNormalized.ok) return;
    const claimed = analyzeArrangementCapabilities(claimedDocument, claimedNormalized.value);
    const facts = (capabilities: readonly CapabilityEvidence[]) =>
      capabilities.map(({ capability, state, evidenceRefs }) => ({
        capability,
        state,
        evidenceRefs,
      }));
    expect(facts(claimed.capabilities)).toEqual(facts(baseline.capabilities));
  });

  it("keeps renderer and environment support in separate deterministic profiles", () => {
    const renderer = analyzeRendererCapabilities({
      id: "mnls.renderer.html-svg",
      version: "1",
      implementationHash: `sha256:${"a".repeat(64)}`,
      capabilities: ["renderer.svg", "renderer.accessible-event-list"],
    });
    const environment = analyzeEnvironmentCapabilities({
      id: "comparison-wide",
      environmentHash: `sha256:${"b".repeat(64)}`,
      capabilities: ["environment.comparison-wide"],
    });
    expect(renderer.capabilities.every(({ source }) => source.authority === "renderer")).toBe(true);
    expect(environment.capabilities.every(({ source }) => source.authority === "environment")).toBe(
      true,
    );
    expect(validateArtifact(schemaIds.capabilityProfile, renderer).ok).toBe(true);
    expect(validateArtifact(schemaIds.capabilityProfile, environment).ok).toBe(true);
    expect(canonicalStringify(renderer)).toBe(
      canonicalStringify(
        analyzeRendererCapabilities({
          id: "mnls.renderer.html-svg",
          version: "1",
          implementationHash: `sha256:${"a".repeat(64)}`,
          capabilities: ["renderer.accessible-event-list", "renderer.svg"],
        }),
      ),
    );
  });

  it("reports melody and harmony capabilities from their actual artifacts", () => {
    const melody = normalizedFixture("melody-spatial-a");
    const harmony = normalizedFixture("contract-voicing-hints");
    const melodyProfile = analyzeArrangementCapabilities(melody.document, melody.normalized);
    const harmonyProfile = analyzeArrangementCapabilities(harmony.document, harmony.normalized);
    const state = (profile: typeof melodyProfile, capability: string) =>
      profile.capabilities.find((evidence) => evidence.capability === capability)?.state;
    expect(state(melodyProfile, "pitch.exact-register")).toBe("present");
    expect(state(melodyProfile, "harmony.present")).toBe("absent");
    expect(state(harmonyProfile, "harmony.present")).toBe("present");
    expect(state(harmonyProfile, "pitch.pitch-class-comparison")).toBe("present");
  });
});
