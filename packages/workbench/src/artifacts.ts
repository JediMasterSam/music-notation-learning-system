import {
  canonicalStringify,
  contentHash,
  textContentHash,
  type Diagnostic,
  type JSONValue,
  type StageResult,
} from "@mnls/model";
import { schemaIds, validateArtifact } from "@mnls/schema";

import type { ResolvedRecipe } from "./recipe.js";
import type { ExperimentDefinition } from "./experiment.js";

export interface VersionedContentRef {
  readonly id: string;
  readonly version: string;
  readonly contentHash: string;
}

export interface TreatmentIdentityEvidence {
  readonly canonicalHash: string;
  readonly normalizedHash: string;
  readonly projectionHash: string;
  readonly layoutHash: string;
  readonly learningPlanHash?: string;
  readonly transformationHash?: string;
  readonly environmentHash?: string;
}

export interface TreatmentArtifactBundleInput {
  readonly id: string;
  readonly inputRefs: readonly VersionedContentRef[];
  readonly resolvedRecipe: ResolvedRecipe;
  readonly identity: TreatmentIdentityEvidence;
  readonly rendererRef: {
    readonly id: string;
    readonly version: string;
    readonly implementationHash: string;
  };
  readonly toolVersions: Readonly<Record<string, string>>;
  readonly indexHtml: string;
  readonly diagnostics: readonly Diagnostic[];
  readonly provenance: JSONValue;
  readonly learningPlan?: JSONValue;
}

export interface TreatmentManifest {
  readonly formatVersion: "0.1.0";
  readonly artifactType: "treatment-manifest";
  readonly id: string;
  readonly inputRefs: readonly VersionedContentRef[];
  readonly toolVersions: Readonly<Record<string, string>>;
  readonly resolvedOptions: JSONValue;
  readonly diagnostics: readonly Diagnostic[];
  readonly outputArtifacts: readonly VersionedContentRef[];
  readonly runHash: string;
}

export interface ExperimentRunManifest {
  readonly formatVersion: "0.1.0";
  readonly artifactType: "experiment-run-manifest";
  readonly id: string;
  readonly inputRefs: readonly VersionedContentRef[];
  readonly toolVersions: Readonly<Record<string, string>>;
  readonly resolvedOptions: JSONValue;
  readonly diagnostics: readonly Diagnostic[];
  readonly outputArtifacts: readonly VersionedContentRef[];
  readonly runHash: string;
}

export interface TreatmentArtifactBundle {
  readonly manifest: TreatmentManifest;
  readonly files: Readonly<Record<string, string>>;
}

export interface ExperimentTreatmentEvidence {
  readonly id: string;
  readonly recipeRef: ResolvedRecipe["recipeRef"];
  readonly resolutionHash: string;
  readonly treatmentRunHash: string;
  readonly status: "experimental" | "comparison" | "internal";
}

export interface ExperimentRunManifestInput {
  readonly id: string;
  readonly definition: ExperimentDefinition;
  readonly definitionHash: string;
  readonly inputRefs: readonly VersionedContentRef[];
  readonly toolVersions: Readonly<Record<string, string>>;
  readonly treatments: readonly ExperimentTreatmentEvidence[];
  readonly outputFiles: Readonly<Record<string, string>>;
  readonly diagnostics: readonly Diagnostic[];
}

function diagnostic(code: string, message: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "experiment",
    message,
    requirementIds: ["R-049", "R-056", "R-057"],
  };
}

function outputReference(path: string, contents: string): VersionedContentRef {
  return { id: path, version: "0.1.0", contentHash: textContentHash(contents) };
}

function resolvedOptions(input: TreatmentArtifactBundleInput): JSONValue {
  const recipe = input.resolvedRecipe;
  return {
    identity: {
      canonicalHash: input.identity.canonicalHash,
      normalizedHash: input.identity.normalizedHash,
      projectionHash: input.identity.projectionHash,
      layoutHash: input.identity.layoutHash,
      ...(input.identity.learningPlanHash
        ? { learningPlanHash: input.identity.learningPlanHash }
        : {}),
      ...(input.identity.transformationHash
        ? { transformationHash: input.identity.transformationHash }
        : {}),
      ...(input.identity.environmentHash
        ? { environmentHash: input.identity.environmentHash }
        : {}),
    },
    recipe: {
      id: recipe.recipeRef.id,
      version: recipe.recipeRef.version,
      contentHash: recipe.recipeRef.contentHash,
      resolutionHash: recipe.resolutionHash,
      status: recipe.authoredIdentity.status,
    },
    renderer: {
      id: input.rendererRef.id,
      version: input.rendererRef.version,
      implementationHash: input.rendererRef.implementationHash,
    },
    strategies: recipe.selections.map(
      ({ slot, strategyId, strategyVersion, kind, optionSchemaRef, options }) => ({
        slot,
        strategyId,
        strategyVersion,
        kind,
        optionSchemaRef,
        options,
      }),
    ),
    compatibility: {
      status: recipe.compatibility.status,
      limitations: recipe.compatibility.limitations.map((limitation) => ({
        class: limitation.class,
        message: limitation.message,
        source: limitation.source,
        capability: limitation.capability,
      })),
    },
  };
}

export function createTreatmentArtifactBundle(
  input: TreatmentArtifactBundleInput,
): StageResult<TreatmentArtifactBundle> {
  if (
    input.resolvedRecipe.compatibility.status !== "supported" &&
    input.resolvedRecipe.compatibility.status !== "supported-with-limitations"
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "TREATMENT_BUNDLE_INCOMPATIBLE",
          `Cannot create evidence for ${input.resolvedRecipe.compatibility.status} treatment.`,
        ),
      ],
    };
  }

  const allDiagnostics: readonly Diagnostic[] = [
    ...input.resolvedRecipe.compatibility.diagnostics,
    ...input.diagnostics,
  ];
  const files: Record<string, string> = {
    "index.html": input.indexHtml,
    "diagnostics.json": canonicalStringify(allDiagnostics),
    "provenance.json": canonicalStringify(input.provenance),
    "resolved-recipe.json": canonicalStringify(input.resolvedRecipe),
    ...(input.learningPlan ? { "learning-plan.json": canonicalStringify(input.learningPlan) } : {}),
  };
  const outputArtifacts = Object.entries(files)
    .map(([path, contents]) => outputReference(path, contents))
    .sort((left, right) => left.id.localeCompare(right.id, "en"));
  const manifestWithoutHash = {
    formatVersion: "0.1.0" as const,
    artifactType: "treatment-manifest" as const,
    id: input.id,
    inputRefs: [...input.inputRefs].sort((left, right) =>
      `${left.id}@${left.version}`.localeCompare(`${right.id}@${right.version}`, "en"),
    ),
    toolVersions: input.toolVersions,
    resolvedOptions: resolvedOptions(input),
    diagnostics: allDiagnostics,
    outputArtifacts,
  };
  const manifest: TreatmentManifest = {
    ...manifestWithoutHash,
    runHash: contentHash(manifestWithoutHash),
  };
  const validation = validateArtifact(schemaIds.runManifest, manifest);
  if (!validation.ok) return { ok: false, diagnostics: validation.diagnostics };
  files["manifest.json"] = canonicalStringify(manifest);
  return {
    ok: true,
    value: { manifest, files },
    diagnostics: [],
  };
}

export function createExperimentRunManifest(
  input: ExperimentRunManifestInput,
): StageResult<ExperimentRunManifest> {
  const outputArtifacts = Object.entries(input.outputFiles)
    .map(([path, contents]) => outputReference(path, contents))
    .sort((left, right) => left.id.localeCompare(right.id, "en"));
  const manifestWithoutHash = {
    formatVersion: "0.1.0" as const,
    artifactType: "experiment-run-manifest" as const,
    id: input.id,
    inputRefs: [...input.inputRefs].sort((left, right) =>
      `${left.id}@${left.version}`.localeCompare(`${right.id}@${right.version}`, "en"),
    ),
    toolVersions: input.toolVersions,
    resolvedOptions: {
      experiment: {
        id: input.definition.id,
        version: input.definition.version,
        contentHash: input.definitionHash,
        status: input.definition.status,
        researchQuestion: input.definition.researchQuestion,
        controlledVariables: input.definition.controlledVariables.map((variable) => ({
          id: variable.id,
          description: variable.description,
        })),
        changedVariables: input.definition.changedVariables.map((variable) => ({
          id: variable.id,
          description: variable.description,
        })),
        tasks: input.definition.tasks.map(({ id, description }) => ({ id, description })),
        observationDefinitionIds: input.definition.observations.map(({ id }) => id),
        humanObservationResultsGenerated: false,
      },
      treatments: [...input.treatments]
        .sort((left, right) => left.id.localeCompare(right.id, "en"))
        .map(({ id, recipeRef, resolutionHash, treatmentRunHash, status }) => ({
          id,
          recipeRef,
          resolutionHash,
          treatmentRunHash,
          status,
        })),
    },
    diagnostics: input.diagnostics,
    outputArtifacts,
  };
  const manifest: ExperimentRunManifest = {
    ...manifestWithoutHash,
    runHash: contentHash(manifestWithoutHash),
  };
  const validation = validateArtifact(schemaIds.runManifest, manifest);
  return validation.ok
    ? { ok: true, value: manifest, diagnostics: [] }
    : { ok: false, diagnostics: validation.diagnostics };
}
