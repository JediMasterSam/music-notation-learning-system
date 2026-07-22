import type {
  ArrangementCapabilityProfile,
  CapabilityEvidence,
  LearningPlanCapabilityProfile,
} from "@mnls/capabilities";
import {
  canonicalStringify,
  compareRational,
  contentHash,
  deepFreeze,
  type Arrangement,
  type CanonicalDocument,
  type Diagnostic,
  type JSONValue,
  type StageResult,
} from "@mnls/model";
import { normalizedHash, type NormalizedArrangement } from "@mnls/normalizer";

import type {
  LearningChunk,
  LearningPlan,
  LearningPlanOverride,
  LearningRelationship,
  LearningTransformationDefinition,
  VerifiedLearningPlan,
  VersionedContentRef,
} from "./contracts.js";
import type {
  GeneratedLearningChunk,
  LearningTransformationImplementation,
} from "./transformation.js";
import { createBuiltInLearningRegistry } from "./builtins.js";
import type { LearningTransformationRegistry } from "./registry.js";

const verifiedPlans = new WeakSet<object>();

function diagnostic(
  code: string,
  message: string,
  canonicalId?: string,
  relatedIds?: readonly string[],
): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "learning",
    message,
    ...(canonicalId ? { canonicalId } : {}),
    ...(relatedIds ? { relatedIds } : {}),
    requirementIds: ["R-010", "R-030", "R-042", "R-055"],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsExecutableConfiguration(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsExecutableConfiguration);
  if (!isRecord(value)) return false;
  const forbidden = new Set([
    "__proto__",
    "prototype",
    "constructor",
    "script",
    "callback",
    "executable",
    "code",
    "html",
    "markup",
  ]);
  return Object.entries(value).some(
    ([key, child]) => forbidden.has(key) || containsExecutableConfiguration(child),
  );
}

export function validateLearningTransformationDefinition(
  value: unknown,
): StageResult<LearningTransformationDefinition> {
  if (!isRecord(value)) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_DEFINITION_INVALID",
          "Learning transformation definition must be an object.",
        ),
      ],
    };
  }
  const implementationRef = value.implementationRef;
  const requirements = value.supportedArrangementCapabilities;
  const validRequirements =
    Array.isArray(requirements) &&
    requirements.every(
      (requirement) =>
        isRecord(requirement) &&
        requirement.source === "arrangement" &&
        typeof requirement.capability === "string" &&
        Array.isArray(requirement.acceptedStates) &&
        requirement.acceptedStates.length > 0 &&
        requirement.acceptedStates.every((state) => state === "present" || state === "partial"),
    );
  if (
    value.formatVersion !== "0.1.0" ||
    typeof value.id !== "string" ||
    typeof value.version !== "string" ||
    typeof value.name !== "string" ||
    !["experimental", "comparison", "internal"].includes(String(value.status)) ||
    !validRequirements ||
    typeof value.parameterSchemaRef !== "string" ||
    !isRecord(implementationRef) ||
    typeof implementationRef.transformationId !== "string" ||
    typeof implementationRef.transformationVersion !== "string" ||
    value.outputContractVersion !== "0.1.0" ||
    containsExecutableConfiguration(value.ruleConfiguration)
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_DEFINITION_INVALID",
          "Learning transformation definition is invalid or contains non-declarative configuration.",
        ),
      ],
    };
  }
  return {
    ok: true,
    value: value as unknown as LearningTransformationDefinition,
    diagnostics: [],
  };
}

function arrangementFor(
  document: CanonicalDocument,
  arrangementId: string,
): Arrangement | undefined {
  return document.arrangements.find(({ id }) => id === arrangementId);
}

function transformationRef(definition: LearningTransformationDefinition): VersionedContentRef {
  return {
    id: definition.id,
    version: definition.version,
    contentHash: contentHash(definition),
  };
}

function stableDerivedId(prefix: string, parts: unknown): string {
  return `${prefix}.${contentHash(parts).slice("sha256:".length, "sha256:".length + 24)}`;
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right, "en"));
}

function materializeChunks(
  planId: string,
  ref: VersionedContentRef,
  generated: readonly GeneratedLearningChunk[],
): readonly LearningChunk[] {
  return generated.map((chunk) => ({
    id: stableDerivedId("chunk", [planId, ref.id, ref.version, chunk.ruleId, chunk.selectors]),
    selectors: chunk.selectors,
    provenance: {
      transformationRef: ref,
      ruleId: chunk.ruleId,
      sourceRefs: uniqueSorted(chunk.sourceRefs),
      sourceSpans: chunk.sourceSpans,
    },
  }));
}

function precedesRelationships(chunks: readonly LearningChunk[]): readonly LearningRelationship[] {
  return chunks.slice(1).map((chunk, index) => ({
    type: "precedes" as const,
    fromChunkId: chunks[index]!.id,
    toChunkId: chunk.id,
  }));
}

function withOverrideProvenance(chunk: LearningChunk, overrideId: string): LearningChunk {
  return {
    ...chunk,
    provenance: {
      ...chunk.provenance,
      overrideRefs: uniqueSorted([...(chunk.provenance.overrideRefs ?? []), overrideId]),
    },
  };
}

function rewriteRelationship(
  relationship: LearningRelationship,
  replacements: ReadonlyMap<string, string>,
): LearningRelationship | undefined {
  if (relationship.type === "precedes" || relationship.type === "prerequisite") {
    const fromChunkId = replacements.get(relationship.fromChunkId) ?? relationship.fromChunkId;
    const toChunkId = replacements.get(relationship.toChunkId) ?? relationship.toChunkId;
    if (fromChunkId === toChunkId) return undefined;
    return { ...relationship, fromChunkId, toChunkId };
  }
  if (relationship.type === "transition-practice") {
    return {
      ...relationship,
      chunkId: replacements.get(relationship.chunkId) ?? relationship.chunkId,
    };
  }
  if (relationship.type === "recombine") {
    return {
      ...relationship,
      sourceChunkIds: uniqueSorted(
        relationship.sourceChunkIds.map((id) => replacements.get(id) ?? id),
      ),
      targetChunkId: replacements.get(relationship.targetChunkId) ?? relationship.targetChunkId,
    };
  }
  return {
    ...relationship,
    chunkIds: uniqueSorted(relationship.chunkIds.map((id) => replacements.get(id) ?? id)),
  };
}

function applyOverrides(
  initialChunks: readonly LearningChunk[],
  initialRelationships: readonly LearningRelationship[],
  overrides: readonly LearningPlanOverride[],
): StageResult<{
  readonly chunks: readonly LearningChunk[];
  readonly relationships: readonly LearningRelationship[];
}> {
  let chunks = [...initialChunks];
  let relationships = [...initialRelationships];
  const seenOverrides = new Set<string>();
  for (const override of [...overrides].sort((left, right) =>
    left.id.localeCompare(right.id, "en"),
  )) {
    if (seenOverrides.has(override.id)) {
      return {
        ok: false,
        diagnostics: [
          diagnostic(
            "LEARN_OVERRIDE_CONFLICT",
            `Override ID ${override.id} is duplicated.`,
            override.targetChunkId,
          ),
        ],
      };
    }
    seenOverrides.add(override.id);
    const targetIndex = chunks.findIndex(({ id }) => id === override.targetChunkId);
    if (targetIndex < 0) {
      return {
        ok: false,
        diagnostics: [
          diagnostic(
            "LEARN_OVERRIDE_CONFLICT",
            `Override ${override.id} targets missing chunk ${override.targetChunkId}.`,
            override.targetChunkId,
          ),
        ],
      };
    }
    const target = chunks[targetIndex]!;
    switch (override.operation.type) {
      case "suppress": {
        chunks.splice(targetIndex, 1);
        relationships = relationships.filter((relationship) => {
          const serialized = canonicalStringify(relationship);
          return !serialized.includes(`"${target.id}"`);
        });
        break;
      }
      case "replace-label":
        chunks[targetIndex] = withOverrideProvenance(
          { ...target, label: override.operation.label },
          override.id,
        );
        break;
      case "set-filter":
        chunks[targetIndex] = withOverrideProvenance(
          {
            ...target,
            ...(override.operation.roleFilter
              ? { roleFilter: uniqueSorted(override.operation.roleFilter) }
              : {}),
            ...(override.operation.handFilter ? { handFilter: override.operation.handFilter } : {}),
          },
          override.id,
        );
        break;
      case "split": {
        if (
          override.operation.selectors.length < 2 ||
          override.operation.selectors.some((selectors) => selectors.length === 0)
        ) {
          return {
            ok: false,
            diagnostics: [
              diagnostic(
                "LEARN_OVERRIDE_CONFLICT",
                `Split override ${override.id} requires at least two non-empty selector groups.`,
                target.id,
              ),
            ],
          };
        }
        const splitChunks = override.operation.selectors.map((selectors, index) =>
          withOverrideProvenance(
            {
              ...target,
              id: stableDerivedId("chunk", [target.id, override.id, "split", index, selectors]),
              selectors,
            },
            override.id,
          ),
        );
        chunks.splice(targetIndex, 1, ...splitChunks);
        relationships = relationships
          .map((relationship) => {
            if (relationship.type !== "precedes" && relationship.type !== "prerequisite") {
              return rewriteRelationship(relationship, new Map([[target.id, splitChunks[0]!.id]]));
            }
            return {
              ...relationship,
              fromChunkId:
                relationship.fromChunkId === target.id
                  ? splitChunks[splitChunks.length - 1]!.id
                  : relationship.fromChunkId,
              toChunkId:
                relationship.toChunkId === target.id ? splitChunks[0]!.id : relationship.toChunkId,
            };
          })
          .filter((relationship) => relationship !== undefined);
        relationships.push(...precedesRelationships(splitChunks));
        break;
      }
      case "merge": {
        const sourceIds = uniqueSorted([target.id, ...override.operation.sourceChunkIds]);
        const sources = sourceIds.map((id) => chunks.find((chunk) => chunk.id === id));
        if (sources.some((chunk) => chunk === undefined)) {
          return {
            ok: false,
            diagnostics: [
              diagnostic(
                "LEARN_OVERRIDE_CONFLICT",
                `Merge override ${override.id} references a missing chunk.`,
                target.id,
                sourceIds,
              ),
            ],
          };
        }
        const concreteSources = sources.filter(
          (chunk): chunk is LearningChunk => chunk !== undefined,
        );
        const merged = withOverrideProvenance(
          {
            ...target,
            selectors: concreteSources.flatMap(({ selectors }) => selectors),
            provenance: {
              ...target.provenance,
              sourceRefs: uniqueSorted(
                concreteSources.flatMap(({ provenance }) => provenance.sourceRefs),
              ),
              sourceSpans: concreteSources.flatMap(({ provenance }) => provenance.sourceSpans),
            },
          },
          override.id,
        );
        const sourceSet = new Set(sourceIds);
        chunks = chunks.filter(({ id }) => !sourceSet.has(id));
        chunks.splice(Math.min(targetIndex, chunks.length), 0, merged);
        const replacements = new Map(sourceIds.map((id) => [id, merged.id] as const));
        relationships = relationships
          .map((relationship) => rewriteRelationship(relationship, replacements))
          .filter((relationship) => relationship !== undefined);
        break;
      }
    }
  }
  const dedupedRelationships = new Map(
    relationships.map((relationship) => [canonicalStringify(relationship), relationship] as const),
  );
  return {
    ok: true,
    value: {
      chunks,
      relationships: [...dedupedRelationships.values()].sort((left, right) =>
        canonicalStringify(left).localeCompare(canonicalStringify(right), "en"),
      ),
    },
    diagnostics: [],
  };
}

function planHash(plan: Omit<LearningPlan, "planHash">): string {
  return contentHash(plan);
}

function buildPlan(
  document: CanonicalDocument,
  normalized: NormalizedArrangement,
  definition: LearningTransformationDefinition,
  parameterInput: JSONValue,
  overrides: readonly LearningPlanOverride[],
  implementation: LearningTransformationImplementation,
): StageResult<LearningPlan> {
  const arrangement = arrangementFor(document, normalized.arrangementId);
  if (!arrangement) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_ARRANGEMENT_NOT_FOUND",
          `Arrangement ${normalized.arrangementId} is absent from the canonical document.`,
          normalized.arrangementId,
        ),
      ],
    };
  }
  const parameters = implementation.validateParameters(parameterInput);
  if (!parameters.ok) return parameters;
  const generated = implementation.execute({
    document,
    arrangement,
    normalized,
    parameters: parameters.value,
  });
  if (!generated.ok) return generated;
  const definitionRef = transformationRef(definition);
  const parameterHash = contentHash(parameters.value);
  const id = stableDerivedId("plan", [arrangement.id, definitionRef, parameterHash]);
  const initialChunks = materializeChunks(id, definitionRef, generated.value);
  const overridden = applyOverrides(initialChunks, precedesRelationships(initialChunks), overrides);
  if (!overridden.ok) return overridden;
  if (overridden.value.chunks.length === 0) {
    return {
      ok: false,
      diagnostics: [
        diagnostic("LEARN_EMPTY_PLAN", "All generated chunks were suppressed.", arrangement.id),
      ],
    };
  }
  const canonicalHash = contentHash(document);
  const normalizedContentHash = normalizedHash(normalized);
  const withoutHash: Omit<LearningPlan, "planHash"> = {
    formatVersion: "0.1.0",
    id,
    arrangementRef: {
      id: arrangement.id,
      version: document.schemaVersion,
      contentHash: canonicalHash,
    },
    normalizedArrangementHash: normalizedContentHash,
    transformationRef: definitionRef,
    transformationParameters: parameters.value,
    chunks: overridden.value.chunks,
    relationships: overridden.value.relationships,
    ...(overrides.length > 0 ? { overrides: [...overrides] } : {}),
    provenance: {
      arrangementId: arrangement.id,
      arrangementHash: canonicalHash,
      normalizedHash: normalizedContentHash,
      transformationId: implementation.id,
      transformationVersion: implementation.version,
      definitionHash: definitionRef.contentHash,
      parameterHash,
      executorVersion: "0.1.0",
    },
    diagnostics: [],
  };
  const complete: LearningPlan = {
    ...withoutHash,
    planHash: planHash(withoutHash),
  };
  const generatedDiagnostics = [
    ...selectorDiagnostics(complete, arrangement),
    ...(hasForbiddenCanonicalCopy(complete.chunks) ||
    hasForbiddenCanonicalCopy(complete.overrides ?? [])
      ? [
          diagnostic(
            "LEARN_CANONICAL_COPY_FORBIDDEN",
            "Learning chunks and overrides may contain selectors, but not copied musical payloads.",
          ),
        ]
      : []),
    ...(relationshipCycle(complete)
      ? [
          diagnostic(
            "LEARN_RELATIONSHIP_CYCLE",
            "Precedes and prerequisite relationships must be acyclic.",
          ),
        ]
      : []),
  ];
  if (generatedDiagnostics.length > 0) {
    return { ok: false, diagnostics: generatedDiagnostics };
  }
  return {
    ok: true,
    value: deepFreeze(complete),
    diagnostics: [],
  };
}

function capabilityDiagnostics(
  document: CanonicalDocument,
  normalized: NormalizedArrangement,
  profile: ArrangementCapabilityProfile,
  definition: LearningTransformationDefinition,
): readonly Diagnostic[] {
  const canonicalHash = contentHash(document);
  if (
    profile.arrangementId !== normalized.arrangementId ||
    profile.canonicalHash !== canonicalHash ||
    profile.normalizedHash !== normalizedHash(normalized)
  ) {
    return [
      diagnostic(
        "LEARN_CAPABILITY_PROFILE_STALE",
        "Arrangement capability evidence does not match the selected canonical/normalized artifact.",
        normalized.arrangementId,
      ),
    ];
  }
  const diagnostics: Diagnostic[] = [];
  for (const requirement of definition.supportedArrangementCapabilities) {
    const evidence = profile.capabilities.find(
      ({ capability }) => capability === requirement.capability,
    );
    if (
      !evidence ||
      evidence.source.authority !== "canonical-arrangement" ||
      evidence.source.contentHash !== canonicalHash ||
      !requirement.acceptedStates.includes(evidence.state as "present" | "partial")
    ) {
      diagnostics.push(
        diagnostic(
          "LEARN_CAPABILITY_MISSING",
          `Arrangement does not provide ${requirement.capability} in an accepted state.`,
          normalized.arrangementId,
        ),
      );
    }
  }
  return diagnostics;
}

export function generateLearningPlan(
  document: CanonicalDocument,
  normalized: NormalizedArrangement,
  arrangementProfile: ArrangementCapabilityProfile,
  definitionInput: unknown,
  parameters: JSONValue,
  overrides: readonly LearningPlanOverride[] = [],
  registry: LearningTransformationRegistry<LearningTransformationImplementation> = createBuiltInLearningRegistry(),
): StageResult<LearningPlan> {
  const beforeHash = contentHash(document);
  const validatedDefinition = validateLearningTransformationDefinition(definitionInput);
  if (!validatedDefinition.ok) return validatedDefinition;
  const definition = validatedDefinition.value;
  const resolution = registry.resolve(
    definition.implementationRef.transformationId,
    definition.implementationRef.transformationVersion,
  );
  if (!resolution.ok) {
    return {
      ok: false,
      diagnostics: resolution.diagnostics.map(({ code, message }) => diagnostic(code, message)),
    };
  }
  if (
    definition.parameterSchemaRef !== resolution.implementation.parameterSchemaRef ||
    definition.parameterSchemaRef !== resolution.descriptor.optionSchemaRef ||
    canonicalStringify(definition.supportedArrangementCapabilities) !==
      canonicalStringify(resolution.descriptor.requiresCapabilities)
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_DEFINITION_INVALID",
          "Definition requirements or parameter schema do not match the pinned implementation descriptor.",
        ),
      ],
    };
  }
  const compatibility = capabilityDiagnostics(document, normalized, arrangementProfile, definition);
  if (compatibility.length > 0) return { ok: false, diagnostics: compatibility };
  const plan = buildPlan(
    document,
    normalized,
    definition,
    parameters,
    overrides,
    resolution.implementation,
  );
  if (contentHash(document) !== beforeHash) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_CANONICAL_MUTATION",
          "Learning-plan generation mutated canonical content.",
        ),
      ],
    };
  }
  return plan;
}

function allCanonicalIds(arrangement: Arrangement): ReadonlySet<string> {
  return new Set([
    arrangement.id,
    ...arrangement.measures.map(({ id }) => id),
    ...arrangement.roles.map(({ id }) => id),
    ...arrangement.sections.map(({ id }) => id),
    ...arrangement.ideas.map(({ id }) => id),
    ...arrangement.events.map(({ id }) => id),
    ...(arrangement.transitions ?? []).map(({ id }) => id),
    ...(arrangement.repetitions ?? []).map(({ id }) => id),
    ...(arrangement.variations ?? []).map(({ id }) => id),
  ]);
}

function selectorDiagnostics(plan: LearningPlan, arrangement: Arrangement): readonly Diagnostic[] {
  const ids = allCanonicalIds(arrangement);
  const diagnostics: Diagnostic[] = [];
  const chunks = new Set(plan.chunks.map(({ id }) => id));
  for (const chunk of plan.chunks) {
    if (chunk.selectors.length === 0) {
      diagnostics.push(
        diagnostic("LEARN_SELECTOR_INVALID", `Chunk ${chunk.id} has no selectors.`, chunk.id),
      );
    }
    for (const selector of chunk.selectors) {
      if (selector.type === "canonical-ref" && !ids.has(selector.ref)) {
        diagnostics.push(
          diagnostic(
            "LEARN_SELECTOR_INVALID",
            `Chunk ${chunk.id} references unknown canonical ID ${selector.ref}.`,
            chunk.id,
            [selector.ref],
          ),
        );
      }
    }
  }
  for (const relationship of plan.relationships) {
    const serialized = canonicalStringify(relationship);
    for (const id of [
      ...serialized.matchAll(/"(?:fromChunkId|toChunkId|chunkId)": "([^"]+)"/g),
    ].map((match) => match[1]!)) {
      if (!chunks.has(id)) {
        diagnostics.push(
          diagnostic(
            "LEARN_SELECTOR_INVALID",
            `Relationship references unknown plan chunk ${id}.`,
            id,
          ),
        );
      }
    }
  }
  return diagnostics;
}

function hasForbiddenCanonicalCopy(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(hasForbiddenCanonicalCopy);
  if (!isRecord(value)) return false;
  const forbidden = new Set([
    "events",
    "event",
    "notes",
    "note",
    "chords",
    "chord",
    "pitch",
    "harmony",
    "semanticEvent",
  ]);
  return Object.entries(value).some(
    ([key, child]) => forbidden.has(key) || hasForbiddenCanonicalCopy(child),
  );
}

function relationshipCycle(plan: LearningPlan): boolean {
  const edges = new Map<string, string[]>();
  for (const relationship of plan.relationships) {
    if (relationship.type !== "precedes" && relationship.type !== "prerequisite") continue;
    const values = edges.get(relationship.fromChunkId) ?? [];
    values.push(relationship.toChunkId);
    edges.set(relationship.fromChunkId, values);
  }
  const active = new Set<string>();
  const done = new Set<string>();
  const visit = (id: string): boolean => {
    if (active.has(id)) return true;
    if (done.has(id)) return false;
    active.add(id);
    if ((edges.get(id) ?? []).some(visit)) return true;
    active.delete(id);
    done.add(id);
    return false;
  };
  return plan.chunks.some(({ id }) => visit(id));
}

export function verifyLearningPlan(
  plan: LearningPlan,
  document: CanonicalDocument,
  normalized: NormalizedArrangement,
  definitionInput: unknown,
  registry: LearningTransformationRegistry<LearningTransformationImplementation> = createBuiltInLearningRegistry(),
): StageResult<VerifiedLearningPlan> {
  const definitionResult = validateLearningTransformationDefinition(definitionInput);
  if (!definitionResult.ok) return definitionResult;
  const definition = definitionResult.value;
  const arrangement = arrangementFor(document, normalized.arrangementId);
  if (!arrangement) {
    return {
      ok: false,
      diagnostics: [diagnostic("LEARN_ARRANGEMENT_NOT_FOUND", "Plan arrangement is unavailable.")],
    };
  }
  const canonicalHash = contentHash(document);
  const normalizedContentHash = normalizedHash(normalized);
  const definitionHash = contentHash(definition);
  const diagnostics: Diagnostic[] = [];
  if (
    plan.arrangementRef.id !== arrangement.id ||
    plan.arrangementRef.contentHash !== canonicalHash ||
    plan.provenance.arrangementHash !== canonicalHash
  ) {
    diagnostics.push(
      diagnostic(
        "LEARN_ARRANGEMENT_HASH_MISMATCH",
        "Learning plan is stale or belongs to another canonical arrangement hash.",
        arrangement.id,
      ),
    );
  }
  if (
    plan.normalizedArrangementHash !== normalizedContentHash ||
    plan.provenance.normalizedHash !== normalizedContentHash
  ) {
    diagnostics.push(
      diagnostic(
        "LEARN_NORMALIZED_HASH_MISMATCH",
        "Learning plan does not match the normalized arrangement hash.",
        arrangement.id,
      ),
    );
  }
  if (
    plan.transformationRef.id !== definition.id ||
    plan.transformationRef.version !== definition.version ||
    plan.transformationRef.contentHash !== definitionHash ||
    plan.provenance.definitionHash !== definitionHash
  ) {
    diagnostics.push(
      diagnostic(
        "LEARN_TRANSFORMATION_HASH_MISMATCH",
        "Learning plan does not match the pinned transformation definition.",
      ),
    );
  }
  const { planHash: suppliedHash, ...withoutHash } = plan;
  if (planHash(withoutHash) !== suppliedHash) {
    diagnostics.push(
      diagnostic("LEARN_REGENERATION_MISMATCH", "Learning plan hash is not reproducible."),
    );
  }
  if (hasForbiddenCanonicalCopy(plan.chunks)) {
    diagnostics.push(
      diagnostic(
        "LEARN_CANONICAL_COPY_FORBIDDEN",
        "Learning chunks must reference canonical content rather than copying musical event payloads.",
      ),
    );
  }
  diagnostics.push(...selectorDiagnostics(plan, arrangement));
  if (relationshipCycle(plan)) {
    diagnostics.push(
      diagnostic(
        "LEARN_RELATIONSHIP_CYCLE",
        "Precedes and prerequisite relationships must be acyclic.",
      ),
    );
  }
  const resolution = registry.resolve(
    definition.implementationRef.transformationId,
    definition.implementationRef.transformationVersion,
  );
  if (!resolution.ok) {
    diagnostics.push(
      ...resolution.diagnostics.map(({ code, message }) => diagnostic(code, message)),
    );
  } else if (diagnostics.length === 0) {
    const regenerated = buildPlan(
      document,
      normalized,
      definition,
      plan.transformationParameters,
      plan.overrides ?? [],
      resolution.implementation,
    );
    if (!regenerated.ok || canonicalStringify(regenerated.value) !== canonicalStringify(plan)) {
      diagnostics.push(
        diagnostic(
          "LEARN_REGENERATION_MISMATCH",
          "Learning plan differs from deterministic regeneration.",
        ),
      );
    }
  }
  if (diagnostics.length > 0) return { ok: false, diagnostics };
  const verified: VerifiedLearningPlan = deepFreeze({
    verification: "verified-learning-plan",
    plan,
    planHash: plan.planHash,
    arrangementId: arrangement.id,
    arrangementHash: canonicalHash,
    normalizedHash: normalizedContentHash,
    definitionHash,
  });
  verifiedPlans.add(verified);
  return { ok: true, value: verified, diagnostics: [] };
}

function planEvidence(
  verified: VerifiedLearningPlan,
  capability: string,
  state: "present" | "absent",
  evidenceRefs: readonly string[],
): CapabilityEvidence {
  return {
    capability,
    state,
    source: {
      authority: "verified-learning-plan",
      artifactId: verified.plan.id,
      contentHash: verified.planHash,
    },
    evidenceRefs: uniqueSorted([
      `arrangement:${verified.arrangementId}@${verified.arrangementHash}`,
      ...evidenceRefs,
    ]),
    detail: `Verified against canonical arrangement hash ${verified.arrangementHash}.`,
  };
}

export function analyzeLearningPlanCapabilities(
  verified: VerifiedLearningPlan,
): LearningPlanCapabilityProfile {
  if (!verifiedPlans.has(verified)) {
    throw new Error("Learning-plan capabilities require a value returned by verifyLearningPlan().");
  }
  const chunkIds = verified.plan.chunks.map(({ id }) => id);
  const roleFilterIds = verified.plan.chunks
    .filter(({ roleFilter }) => (roleFilter?.length ?? 0) > 0)
    .map(({ id }) => id);
  const handFilterIds = verified.plan.chunks
    .filter(({ handFilter }) => handFilter !== undefined)
    .map(({ id }) => id);
  const prerequisiteIds = verified.plan.relationships
    .filter(({ type }) => type === "prerequisite")
    .flatMap((relationship) =>
      relationship.type === "prerequisite"
        ? [relationship.fromChunkId, relationship.toChunkId]
        : [],
    );
  const transitionIds = verified.plan.relationships
    .filter(({ type }) => type === "transition-practice")
    .flatMap((relationship) =>
      relationship.type === "transition-practice" ? [relationship.transitionRef] : [],
    );
  const capabilities = [
    planEvidence(verified, "learning-plan.valid", "present", [verified.plan.id]),
    planEvidence(verified, "learning-plan.matches-arrangement", "present", [verified.plan.id]),
    planEvidence(
      verified,
      "learning-plan.has-chunks",
      chunkIds.length > 0 ? "present" : "absent",
      chunkIds,
    ),
    planEvidence(
      verified,
      "learning-plan.has-role-filters",
      roleFilterIds.length > 0 ? "present" : "absent",
      roleFilterIds,
    ),
    planEvidence(
      verified,
      "learning-plan.has-hand-filters",
      handFilterIds.length > 0 ? "present" : "absent",
      handFilterIds,
    ),
    planEvidence(
      verified,
      "learning-plan.has-prerequisites",
      prerequisiteIds.length > 0 ? "present" : "absent",
      prerequisiteIds,
    ),
    planEvidence(
      verified,
      "learning-plan.has-transition-practice",
      transitionIds.length > 0 ? "present" : "absent",
      transitionIds,
    ),
  ].sort((left, right) => left.capability.localeCompare(right.capability, "en"));
  return deepFreeze({
    formatVersion: "0.1.0",
    profileType: "learning-plan",
    planId: verified.plan.id,
    planHash: verified.planHash,
    arrangementId: verified.arrangementId,
    arrangementHash: verified.arrangementHash,
    capabilities,
  });
}

export function learningPlanHash(plan: LearningPlan): string {
  const withoutHash = Object.fromEntries(
    Object.entries(plan).filter(([key]) => key !== "planHash"),
  ) as unknown as Omit<LearningPlan, "planHash">;
  return planHash(withoutHash);
}

export function compareLearningChunkOrder(left: LearningChunk, right: LearningChunk): number {
  const leftSpan = left.provenance.sourceSpans[0];
  const rightSpan = right.provenance.sourceSpans[0];
  return leftSpan && rightSpan
    ? compareRational(leftSpan.start.beat, rightSpan.start.beat) ||
        left.id.localeCompare(right.id, "en")
    : left.id.localeCompare(right.id, "en");
}
