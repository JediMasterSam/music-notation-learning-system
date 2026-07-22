import { describe, expect, it } from "vitest";

import type {
  ArrangementCapabilityProfile,
  RendererCapabilityProfile,
  TreatmentInputProfile,
} from "@mnls/capabilities";

import { StrategyCatalog, evaluateCompatibility, type StrategyDescriptor } from "./index.js";

const arrangement: ArrangementCapabilityProfile = {
  formatVersion: "0.1.0",
  profileType: "arrangement",
  arrangementId: "arrangement.test",
  canonicalHash: `sha256:${"a".repeat(64)}`,
  normalizedHash: `sha256:${"b".repeat(64)}`,
  capabilities: [
    {
      capability: "time.exact-duration",
      state: "present",
      source: {
        authority: "canonical-arrangement",
        artifactId: "arrangement.test",
        contentHash: `sha256:${"a".repeat(64)}`,
      },
      evidenceRefs: ["event.test"],
    },
    {
      capability: "hands.exact-assignment",
      state: "partial",
      source: {
        authority: "canonical-arrangement",
        artifactId: "arrangement.test",
        contentHash: `sha256:${"a".repeat(64)}`,
      },
      evidenceRefs: ["assignment.unknown"],
    },
  ],
};

const renderer: RendererCapabilityProfile = {
  formatVersion: "0.1.0",
  profileType: "renderer",
  rendererRef: { id: "mnls.renderer.test", version: "1" },
  implementationHash: `sha256:${"c".repeat(64)}`,
  capabilities: [
    {
      capability: "renderer.svg",
      state: "present",
      source: {
        authority: "renderer",
        artifactId: "mnls.renderer.test@1",
        contentHash: `sha256:${"c".repeat(64)}`,
      },
      evidenceRefs: ["renderer.svg"],
    },
  ],
};

const profile: TreatmentInputProfile = { arrangement, renderer };

function descriptor(
  id: string,
  requiresCapabilities: StrategyDescriptor["requiresCapabilities"],
): StrategyDescriptor {
  return {
    id,
    version: "1",
    kind: "duration-encoding",
    displayName: id,
    status: "comparison",
    optionSchemaRef: `${id}.options@1`,
    requiresCapabilities,
    providesCapabilities: [],
    deterministic: true,
  };
}

describe("strategy catalog", () => {
  it("resolves exact versions and lists independently of registration order", () => {
    const catalog = new StrategyCatalog<string>();
    const second = descriptor("mnls.strategy.b", []);
    const first = descriptor("mnls.strategy.a", []);
    catalog.register(second, "b");
    catalog.register(first, "a");
    expect(catalog.list().map(({ id }) => id)).toEqual(["mnls.strategy.a", "mnls.strategy.b"]);
    expect(catalog.resolve(first.id, "1")).toMatchObject({ ok: true, implementation: "a" });
    expect(catalog.resolve(first.id, "2")).toMatchObject({ ok: false, status: "unavailable" });
    expect(() => catalog.register(first, "duplicate")).toThrow(/already registered/);
  });
});

describe("four compatibility statuses", () => {
  it("returns supported for proven artifact-scoped requirements", () => {
    const report = evaluateCompatibility({
      inputProfile: profile,
      selectedStrategyDescriptors: [
        descriptor("mnls.strategy.supported", [
          { source: "arrangement", capability: "time.exact-duration", acceptedStates: ["present"] },
          { source: "renderer", capability: "renderer.svg", acceptedStates: ["present"] },
        ]),
      ],
      limitationPolicy: { acceptedClasses: [] },
    });
    expect(report.status).toBe("supported");
  });

  it("returns supported-with-limitations only when partial evidence is acknowledged", () => {
    const limitationClass = "partial:arrangement:hands.exact-assignment";
    const report = evaluateCompatibility({
      inputProfile: profile,
      selectedStrategyDescriptors: [
        descriptor("mnls.strategy.partial", [
          {
            source: "arrangement",
            capability: "hands.exact-assignment",
            acceptedStates: ["present", "partial"],
          },
        ]),
      ],
      limitationPolicy: { acceptedClasses: [limitationClass] },
    });
    expect(report.status).toBe("supported-with-limitations");
    expect(report.limitations[0]?.class).toBe(limitationClass);
    expect(report.diagnostics[0]?.sourceAuthority).toBe("canonical-arrangement");
  });

  it("returns incompatible without a required verified learning plan or acknowledgment", () => {
    const missingPlan = evaluateCompatibility({
      inputProfile: profile,
      selectedStrategyDescriptors: [
        descriptor("mnls.strategy.learning-overlay", [
          {
            source: "learning-plan",
            capability: "learning-plan.has-chunks",
            acceptedStates: ["present"],
          },
        ]),
      ],
      limitationPolicy: { acceptedClasses: [] },
    });
    expect(missingPlan.status).toBe("incompatible");
    expect(missingPlan.diagnostics[0]?.requirementSource).toBe("learning-plan");

    const unacknowledged = evaluateCompatibility({
      inputProfile: profile,
      selectedStrategyDescriptors: [
        descriptor("mnls.strategy.partial", [
          {
            source: "arrangement",
            capability: "hands.exact-assignment",
            acceptedStates: ["present", "partial"],
          },
        ]),
      ],
      limitationPolicy: { acceptedClasses: [] },
    });
    expect(unacknowledged.status).toBe("incompatible");
    expect(unacknowledged.diagnostics.map(({ code }) => code)).toContain(
      "LIMITATION_UNACKNOWLEDGED",
    );
  });

  it("returns unavailable for a missing pinned strategy and never falls back", () => {
    const report = evaluateCompatibility({
      inputProfile: profile,
      selectedStrategyDescriptors: [],
      unavailableSelections: [{ id: "mnls.strategy.missing", version: "9" }],
      limitationPolicy: { acceptedClasses: [] },
    });
    expect(report.status).toBe("unavailable");
    expect(report.diagnostics[0]?.code).toBe("STRATEGY_NOT_FOUND");
  });

  it("rejects stale or mismatched plan capability evidence", () => {
    const report = evaluateCompatibility({
      inputProfile: {
        ...profile,
        learningPlan: {
          formatVersion: "0.1.0",
          profileType: "learning-plan",
          planId: "plan.stale",
          planHash: `sha256:${"d".repeat(64)}`,
          arrangementId: arrangement.arrangementId,
          arrangementHash: `sha256:${"e".repeat(64)}`,
          capabilities: [],
        },
      },
      selectedStrategyDescriptors: [],
      limitationPolicy: { acceptedClasses: [] },
    });
    expect(report.status).toBe("incompatible");
    expect(report.diagnostics[0]?.code).toBe("CAPABILITY_PLAN_ARRANGEMENT_MISMATCH");
  });
});
