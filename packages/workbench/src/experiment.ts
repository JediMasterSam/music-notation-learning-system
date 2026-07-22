import type { Diagnostic, StageResult } from "@mnls/model";
import { schemaIds, validateArtifact } from "@mnls/schema";

import type { VersionedContentRef } from "./artifacts.js";

export interface ExperimentVariable {
  readonly id: string;
  readonly description: string;
}

export interface ExperimentNamedText {
  readonly id: string;
  readonly description: string;
}

export interface ExperimentDefinition {
  readonly formatVersion: "0.1.0";
  readonly id: string;
  readonly version: string;
  readonly fixtureRefs: readonly VersionedContentRef[];
  readonly treatmentRefs: readonly VersionedContentRef[];
  readonly learningTransformationRefs?: readonly VersionedContentRef[];
  readonly researchQuestion: string;
  readonly controlledVariables: readonly ExperimentVariable[];
  readonly changedVariables: readonly ExperimentVariable[];
  readonly tasks: readonly ExperimentNamedText[];
  readonly observations: readonly ExperimentNamedText[];
  readonly status: "draft" | "ready" | "completed" | "archived";
}

function diagnostic(message: string, jsonPointer?: string): Diagnostic {
  return {
    code: "EXPERIMENT_SCHEMA_INVALID",
    severity: "error",
    stage: "experiment",
    message,
    ...(jsonPointer ? { jsonPointer } : {}),
    requirementIds: ["R-056", "R-057", "R-058"],
  };
}

export function validateExperimentDefinition(value: unknown): StageResult<ExperimentDefinition> {
  const structural = validateArtifact(schemaIds.experimentDefinition, value);
  if (!structural.ok) {
    return {
      ok: false,
      diagnostics: structural.diagnostics.map((item) => diagnostic(item.message, item.jsonPointer)),
    };
  }
  const definition = value as ExperimentDefinition;
  const controlled = new Set(definition.controlledVariables.map(({ id }) => id));
  const changed = new Set(definition.changedVariables.map(({ id }) => id));
  const overlap = [...controlled].filter((id) => changed.has(id)).sort();
  if (
    controlled.size !== definition.controlledVariables.length ||
    changed.size !== definition.changedVariables.length ||
    overlap.length > 0
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          overlap.length > 0
            ? `Controlled and changed variables overlap: ${overlap.join(", ")}.`
            : "Controlled and changed variable IDs must each be unique.",
          overlap.length > 0 ? "/changedVariables" : undefined,
        ),
      ],
    };
  }
  return { ok: true, value: definition, diagnostics: [] };
}
