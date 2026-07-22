import type {
  CapabilityDiagnostic,
  CapabilityEvidence,
  CapabilityRequirement,
  CompatibilityInput,
  CompatibilityLimitation,
  CompatibilityReport,
} from "@mnls/capabilities";

import type { StrategyDescriptor } from "./catalog.js";

export interface StrategyRef {
  readonly id: string;
  readonly version: string;
}

export interface CompatibilityEvaluationInput extends CompatibilityInput<StrategyDescriptor> {
  readonly unavailableSelections?: readonly StrategyRef[];
}

interface EvaluatedCapability {
  readonly capability: string;
  readonly state: "present" | "partial" | "absent" | "unknown";
  readonly evidence?: CapabilityEvidence;
}

function sourceEvidence(
  input: CompatibilityEvaluationInput,
  requirement: CapabilityRequirement,
): readonly EvaluatedCapability[] {
  switch (requirement.source) {
    case "arrangement":
      return input.inputProfile.arrangement.capabilities.map((evidence) => ({
        capability: evidence.capability,
        state: evidence.state,
        evidence,
      }));
    case "learning-plan":
      return (input.inputProfile.learningPlan?.capabilities ?? []).map((evidence) => ({
        capability: evidence.capability,
        state: evidence.state,
        evidence,
      }));
    case "renderer":
      return input.inputProfile.renderer.capabilities.map((evidence) => ({
        capability: evidence.capability,
        state: evidence.state,
        evidence,
      }));
    case "environment":
      return (input.inputProfile.environment?.capabilities ?? []).map((evidence) => ({
        capability: evidence.capability,
        state: evidence.state,
        evidence,
      }));
    case "selected-strategy":
      return input.selectedStrategyDescriptors.flatMap((descriptor) =>
        descriptor.providesCapabilities.map((declaration) => ({
          capability: declaration.capability,
          state: declaration.state,
        })),
      );
  }
}

function missingDiagnostic(requirement: CapabilityRequirement): CapabilityDiagnostic {
  return {
    code: "CAPABILITY_MISSING",
    severity: "error",
    stage: "capability",
    message: `${requirement.source} does not provide ${requirement.capability} in an accepted state.`,
    requirementSource: requirement.source,
    capability: requirement.capability,
  };
}

export function evaluateCompatibility(input: CompatibilityEvaluationInput): CompatibilityReport {
  const diagnostics: CapabilityDiagnostic[] = [];
  const limitations: CompatibilityLimitation[] = [];
  if ((input.unavailableSelections?.length ?? 0) > 0) {
    for (const selection of input.unavailableSelections ?? []) {
      diagnostics.push({
        code: "STRATEGY_NOT_FOUND",
        severity: "error",
        stage: "capability",
        message: `Pinned strategy ${selection.id}@${selection.version} is unavailable.`,
        requirementSource: "selected-strategy",
        capability: `strategy:${selection.id}@${selection.version}`,
      });
    }
    return { status: "unavailable", diagnostics, limitations };
  }

  const plan = input.inputProfile.learningPlan;
  if (
    plan &&
    (plan.arrangementId !== input.inputProfile.arrangement.arrangementId ||
      plan.arrangementHash !== input.inputProfile.arrangement.canonicalHash)
  ) {
    diagnostics.push({
      code: "CAPABILITY_PLAN_ARRANGEMENT_MISMATCH",
      severity: "error",
      stage: "capability",
      message:
        "Learning-plan capability evidence does not match the treatment arrangement ID/hash.",
      requirementSource: "learning-plan",
      capability: "learning-plan.matches-arrangement",
      sourceAuthority: "verified-learning-plan",
      sourceArtifactId: plan.planId,
      sourceHash: plan.planHash,
    });
  }

  for (const descriptor of input.selectedStrategyDescriptors) {
    for (const requirement of descriptor.requiresCapabilities) {
      const matching = sourceEvidence(input, requirement).find(
        ({ capability }) => capability === requirement.capability,
      );
      if (
        !matching ||
        !requirement.acceptedStates.includes(matching.state as "present" | "partial")
      ) {
        diagnostics.push(missingDiagnostic(requirement));
        continue;
      }
      if (matching.state === "partial") {
        const limitationClass = `partial:${requirement.source}:${requirement.capability}`;
        limitations.push({
          class: limitationClass,
          message: `${requirement.capability} is supported only partially by ${requirement.source}.`,
          source: requirement.source,
          capability: requirement.capability,
        });
        diagnostics.push({
          code: input.limitationPolicy.acceptedClasses.includes(limitationClass)
            ? "CAPABILITY_PARTIAL"
            : "LIMITATION_UNACKNOWLEDGED",
          severity: input.limitationPolicy.acceptedClasses.includes(limitationClass)
            ? "warning"
            : "error",
          stage: "capability",
          message: `Capability ${requirement.capability} is partial.`,
          requirementSource: requirement.source,
          capability: requirement.capability,
          ...(matching.evidence
            ? {
                sourceAuthority: matching.evidence.source.authority,
                sourceArtifactId: matching.evidence.source.artifactId,
                sourceHash: matching.evidence.source.contentHash,
                ...(matching.evidence.evidenceRefs
                  ? { evidenceRefs: matching.evidence.evidenceRefs }
                  : {}),
              }
            : {}),
        });
      }
    }
    for (const limitation of descriptor.limitations ?? []) {
      limitations.push({
        class: limitation.class,
        message: limitation.message,
        source: "selected-strategy",
        capability: `strategy:${descriptor.id}@${descriptor.version}`,
      });
      if (!input.limitationPolicy.acceptedClasses.includes(limitation.class)) {
        diagnostics.push({
          code: "LIMITATION_UNACKNOWLEDGED",
          severity: "error",
          stage: "capability",
          message: limitation.message,
          requirementSource: "selected-strategy",
          capability: `strategy:${descriptor.id}@${descriptor.version}`,
        });
      }
    }
  }

  diagnostics.sort((left, right) =>
    `${left.code}:${left.requirementSource}:${left.capability}`.localeCompare(
      `${right.code}:${right.requirementSource}:${right.capability}`,
      "en",
    ),
  );
  limitations.sort((left, right) => left.class.localeCompare(right.class, "en"));
  if (diagnostics.some(({ severity }) => severity === "error")) {
    return { status: "incompatible", diagnostics, limitations };
  }
  return {
    status: limitations.length > 0 ? "supported-with-limitations" : "supported",
    diagnostics,
    limitations,
  };
}
