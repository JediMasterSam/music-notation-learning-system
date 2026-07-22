import type {
  CapabilityDiagnostic,
  CompatibilityReport,
  LimitationPolicy,
  TreatmentInputProfile,
} from "@mnls/capabilities";
import {
  contentHash,
  deepFreeze,
  type Diagnostic,
  type HandName,
  type JSONValue,
  type MusicalRoleKind,
} from "@mnls/model";
import { schemaIds, validateArtifact } from "@mnls/schema";

import type { StrategyCatalog, StrategyDescriptor, StrategyKind } from "./catalog.js";
import { evaluateCompatibility, type StrategyRef } from "./compatibility.js";
import { materializeStrategyOptions } from "./options.js";
import {
  createBuiltInStrategyCatalog,
  type RepresentationStrategyImplementation,
} from "./strategies.js";

export interface StrategySelection {
  readonly strategyId: string;
  readonly strategyVersion: string;
  readonly options: JSONValue;
}

export interface RepresentationRecipe {
  readonly formatVersion: "0.1.0";
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly description?: string;
  readonly status: "experimental" | "comparison" | "internal";
  readonly strategies: {
    readonly timeMapping: StrategySelection;
    readonly pitchMapping: StrategySelection;
    readonly durationEncoding: StrategySelection;
    readonly pitchLabels: StrategySelection;
    readonly structuralOverlays?: readonly StrategySelection[];
    readonly harmonicOverlays?: readonly StrategySelection[];
    readonly disclosure?: StrategySelection;
  };
  readonly visibility: {
    readonly roleIds?: readonly string[];
    readonly roleKinds?: readonly MusicalRoleKind[];
    readonly hands?: readonly HandName[];
    readonly includeLearningPlan?: boolean;
    readonly includeHints?: boolean;
  };
  readonly accessibility: {
    readonly includeExactPitch: true;
    readonly includeExactTime: true;
    readonly includeSourceOrderEvents: true;
  };
  readonly renderer: StrategySelection;
  readonly limitationPolicy?: LimitationPolicy;
  readonly metadata?: JSONValue;
}

export type RecipeSelectionSlot =
  | "timeMapping"
  | "pitchMapping"
  | "durationEncoding"
  | "pitchLabels"
  | `structuralOverlays[${number}]`
  | `harmonicOverlays[${number}]`
  | "disclosure"
  | "renderer";

export interface ResolvedStrategySelection {
  readonly slot: RecipeSelectionSlot;
  readonly strategyId: string;
  readonly strategyVersion: string;
  readonly kind: StrategyKind;
  readonly optionSchemaRef: string;
  readonly options: Readonly<Record<string, JSONValue>>;
}

export interface ResolvedRecipe {
  readonly formatVersion: "0.1.0";
  readonly recipeRef: {
    readonly id: string;
    readonly version: string;
    readonly contentHash: string;
  };
  readonly selections: readonly ResolvedStrategySelection[];
  readonly compatibility: CompatibilityReport;
  readonly canonicalOptions: JSONValue;
  readonly resolutionHash: string;
}

export type RecipeResolutionResult =
  | {
      readonly ok: true;
      readonly value: ResolvedRecipe;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly ok: false;
      readonly status: "incompatible" | "unavailable";
      readonly compatibility?: CompatibilityReport;
      readonly diagnostics: readonly Diagnostic[];
    };

export type RecipeValidationResult =
  | {
      readonly ok: true;
      readonly value: RepresentationRecipe;
      readonly diagnostics: readonly [];
    }
  | {
      readonly ok: false;
      readonly status: "incompatible";
      readonly diagnostics: readonly Diagnostic[];
    };

interface PendingSelection {
  readonly slot: RecipeSelectionSlot;
  readonly expectedKind: StrategyKind;
  readonly selection: StrategySelection;
}

function diagnostic(
  code: string,
  message: string,
  detail?: Readonly<Record<string, JSONValue>>,
): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "recipe",
    message,
    ...(detail ? { detail } : {}),
    requirementIds: ["R-047", "R-048", "R-050", "R-053"],
  };
}

function capabilityDiagnostic(item: CapabilityDiagnostic): Diagnostic {
  return diagnostic(item.code, item.message, {
    requirementSource: item.requirementSource,
    capability: item.capability,
    ...(item.sourceAuthority ? { sourceAuthority: item.sourceAuthority } : {}),
    ...(item.sourceArtifactId ? { sourceArtifactId: item.sourceArtifactId } : {}),
    ...(item.sourceHash ? { sourceHash: item.sourceHash } : {}),
  });
}

function pendingSelections(recipe: RepresentationRecipe): readonly PendingSelection[] {
  return [
    { slot: "timeMapping", expectedKind: "time-mapping", selection: recipe.strategies.timeMapping },
    {
      slot: "pitchMapping",
      expectedKind: "pitch-mapping",
      selection: recipe.strategies.pitchMapping,
    },
    {
      slot: "durationEncoding",
      expectedKind: "duration-encoding",
      selection: recipe.strategies.durationEncoding,
    },
    {
      slot: "pitchLabels",
      expectedKind: "pitch-labels",
      selection: recipe.strategies.pitchLabels,
    },
    ...(recipe.strategies.structuralOverlays ?? []).map((selection, index) => ({
      slot: `structuralOverlays[${index}]` as const,
      expectedKind: "structural-overlay" as const,
      selection,
    })),
    ...(recipe.strategies.harmonicOverlays ?? []).map((selection, index) => ({
      slot: `harmonicOverlays[${index}]` as const,
      expectedKind: "harmonic-overlay" as const,
      selection,
    })),
    ...(recipe.strategies.disclosure
      ? [
          {
            slot: "disclosure" as const,
            expectedKind: "disclosure" as const,
            selection: recipe.strategies.disclosure,
          },
        ]
      : []),
    { slot: "renderer", expectedKind: "renderer", selection: recipe.renderer },
  ];
}

function requestDescriptors(recipe: RepresentationRecipe): readonly StrategyDescriptor[] {
  const descriptors: StrategyDescriptor[] = [];
  if ((recipe.visibility.hands?.length ?? 0) > 0) {
    descriptors.push({
      id: "mnls.request.exact-hand-isolation",
      version: "1",
      kind: "disclosure",
      displayName: "Exact hand isolation request",
      status: "internal",
      optionSchemaRef: "mnls.request.exact-hand-isolation.options@1",
      requiresCapabilities: [
        {
          source: "arrangement",
          capability: "hands.exact-assignment",
          acceptedStates: ["present"],
        },
      ],
      providesCapabilities: [],
      deterministic: true,
    });
  }
  if (recipe.visibility.includeLearningPlan) {
    descriptors.push({
      id: "mnls.request.verified-learning-plan",
      version: "1",
      kind: "disclosure",
      displayName: "Verified learning-plan request",
      status: "internal",
      optionSchemaRef: "mnls.request.verified-learning-plan.options@1",
      requiresCapabilities: [
        {
          source: "learning-plan",
          capability: "learning-plan.valid",
          acceptedStates: ["present"],
        },
        {
          source: "learning-plan",
          capability: "learning-plan.matches-arrangement",
          acceptedStates: ["present"],
        },
      ],
      providesCapabilities: [],
      deterministic: true,
    });
  }
  return descriptors;
}

function canonicalOptions(
  recipe: RepresentationRecipe,
  selections: readonly ResolvedStrategySelection[],
): JSONValue {
  return {
    accessibility: {
      includeExactPitch: recipe.accessibility.includeExactPitch,
      includeExactTime: recipe.accessibility.includeExactTime,
      includeSourceOrderEvents: recipe.accessibility.includeSourceOrderEvents,
    },
    limitationPolicy: {
      acceptedClasses: [...(recipe.limitationPolicy?.acceptedClasses ?? [])],
    },
    strategies: Object.fromEntries(
      selections.map(({ slot, strategyId, strategyVersion, options }) => [
        slot,
        { strategyId, strategyVersion, options },
      ]),
    ),
    visibility: {
      ...(recipe.visibility.roleIds ? { roleIds: [...recipe.visibility.roleIds] } : {}),
      ...(recipe.visibility.roleKinds ? { roleKinds: [...recipe.visibility.roleKinds] } : {}),
      ...(recipe.visibility.hands ? { hands: [...recipe.visibility.hands] } : {}),
      ...(recipe.visibility.includeLearningPlan !== undefined
        ? { includeLearningPlan: recipe.visibility.includeLearningPlan }
        : {}),
      ...(recipe.visibility.includeHints !== undefined
        ? { includeHints: recipe.visibility.includeHints }
        : {}),
    },
  };
}

export function validateRepresentationRecipe(value: unknown): RecipeValidationResult {
  const structural = validateArtifact(schemaIds.representationRecipe, value);
  if (structural.ok) {
    return {
      ok: true,
      value: value as RepresentationRecipe,
      diagnostics: [],
    };
  }
  return {
    ok: false,
    status: "incompatible",
    diagnostics: structural.diagnostics.map((item) =>
      diagnostic(
        "RECIPE_SCHEMA_INVALID",
        `${item.message}${item.jsonPointer ? ` at ${item.jsonPointer}` : ""}`,
      ),
    ),
  };
}

export function resolveRecipe(
  recipeInput: unknown,
  inputProfile: TreatmentInputProfile,
  catalog: StrategyCatalog<RepresentationStrategyImplementation> = createBuiltInStrategyCatalog(),
): RecipeResolutionResult {
  const validated = validateRepresentationRecipe(recipeInput);
  if (!validated.ok) return validated;
  const recipe = validated.value;
  const descriptors: StrategyDescriptor[] = [];
  const unavailable: StrategyRef[] = [];
  const resolvedSelections: ResolvedStrategySelection[] = [];
  const optionDiagnostics: Diagnostic[] = [];

  for (const pending of pendingSelections(recipe)) {
    const resolution = catalog.resolve(
      pending.selection.strategyId,
      pending.selection.strategyVersion,
    );
    if (!resolution.ok) {
      unavailable.push({
        id: pending.selection.strategyId,
        version: pending.selection.strategyVersion,
      });
      continue;
    }
    if (
      resolution.descriptor.kind !== pending.expectedKind ||
      resolution.implementation.id !== resolution.descriptor.id ||
      resolution.implementation.version !== resolution.descriptor.version ||
      resolution.implementation.kind !== resolution.descriptor.kind
    ) {
      optionDiagnostics.push(
        diagnostic(
          "STRATEGY_KIND_MISMATCH",
          `Strategy ${resolution.descriptor.id}@${resolution.descriptor.version} cannot fill ${pending.slot}.`,
        ),
      );
      continue;
    }
    const options = materializeStrategyOptions(
      resolution.implementation.optionSchema,
      pending.selection.options,
    );
    if (!options.ok) {
      optionDiagnostics.push(...options.diagnostics);
      continue;
    }
    const additionalRequirements =
      resolution.implementation.additionalRequirements?.(options.value) ?? [];
    descriptors.push({
      ...resolution.descriptor,
      requiresCapabilities: [
        ...resolution.descriptor.requiresCapabilities,
        ...additionalRequirements,
      ],
    });
    resolvedSelections.push({
      slot: pending.slot,
      strategyId: resolution.descriptor.id,
      strategyVersion: resolution.descriptor.version,
      kind: resolution.descriptor.kind,
      optionSchemaRef: resolution.descriptor.optionSchemaRef,
      options: options.value,
    });
  }

  if (optionDiagnostics.length > 0) {
    return { ok: false, status: "incompatible", diagnostics: optionDiagnostics };
  }
  descriptors.push(...requestDescriptors(recipe));
  const compatibility = evaluateCompatibility({
    inputProfile,
    selectedStrategyDescriptors: descriptors,
    unavailableSelections: unavailable,
    limitationPolicy: recipe.limitationPolicy ?? { acceptedClasses: [] },
  });
  if (compatibility.status === "unavailable" || compatibility.status === "incompatible") {
    return {
      ok: false,
      status: compatibility.status,
      compatibility,
      diagnostics: compatibility.diagnostics.map(capabilityDiagnostic),
    };
  }
  const sortedSelections = [...resolvedSelections].sort((left, right) =>
    left.slot.localeCompare(right.slot, "en"),
  );
  const options = canonicalOptions(recipe, sortedSelections);
  const withoutHash: Omit<ResolvedRecipe, "resolutionHash"> = {
    formatVersion: "0.1.0",
    recipeRef: {
      id: recipe.id,
      version: recipe.version,
      contentHash: contentHash(recipe),
    },
    selections: sortedSelections,
    compatibility,
    canonicalOptions: options,
  };
  return {
    ok: true,
    value: deepFreeze({ ...withoutHash, resolutionHash: contentHash(withoutHash) }),
    diagnostics: compatibility.diagnostics.map(capabilityDiagnostic),
  };
}
