import {
  analyzeArrangementCapabilities,
  analyzeEnvironmentCapabilities,
  analyzeRendererCapabilities,
} from "@mnls/capability-analysis";
import { layoutProjectedView, type LayoutPlan } from "@mnls/layout";
import {
  analyzeLearningPlanCapabilities,
  verifyLearningPlan,
  type LearningPlan,
  type LearningTransformationDefinition,
  type VerifiedLearningPlan,
} from "@mnls/learning";
import {
  contentHash,
  type CanonicalDocument,
  type Diagnostic,
  type JSONValue,
  type StageResult,
} from "@mnls/model";
import { normalize, normalizedHash, type NormalizedArrangement } from "@mnls/normalizer";
import { projectView, type ProjectedView } from "@mnls/projection";
import { renderLayoutPlan, type RenderedTreatment } from "@mnls/renderer-html";
import { schemaIds, validateArtifact } from "@mnls/schema";
import { validateCanonicalSemantics } from "@mnls/validator";
import {
  createTreatmentArtifactBundle,
  resolveRecipe,
  type RepresentationRecipe,
  type ResolvedRecipe,
  type TreatmentArtifactBundle,
  type VersionedContentRef,
} from "@mnls/workbench";

export const toolVersions = Object.freeze({
  "mnls.cli": "0.1.0",
  "mnls.layout": "0.1.0",
  "mnls.normalizer": "0.1.0",
  "mnls.projection": "0.1.0",
  "mnls.renderer-html": "0.1.0",
  "mnls.workbench": "0.1.0",
});

export const rendererDescriptor = Object.freeze({
  id: "mnls.renderer.html-svg",
  version: "1",
  implementationHash: contentHash({
    package: "@mnls/renderer-html",
    packageVersion: "0.1.0",
    renderer: "mnls.renderer.html-svg@1",
  }),
  capabilities: [
    "renderer.svg",
    "renderer.accessible-event-list",
    "renderer.overlay.beat-subdivision",
    "renderer.overlay.time-reference",
    "renderer.overlay.learning-chunks",
  ],
});

export const environmentDescriptor = Object.freeze({
  id: "mnls.environment.static-html",
  environmentHash: contentHash({
    id: "mnls.environment.static-html",
    version: "1",
    viewportClass: "comparison-wide",
    locale: "en",
  }),
  capabilities: ["environment.static-html", "environment.comparison-wide"],
});

export interface PreparedCanonical {
  readonly document: Readonly<CanonicalDocument>;
  readonly normalized: NormalizedArrangement;
}

export interface ExecutedTreatment {
  readonly slug: string;
  readonly normalized: NormalizedArrangement;
  readonly verifiedPlan?: VerifiedLearningPlan;
  readonly recipe: ResolvedRecipe;
  readonly projection: ProjectedView;
  readonly layout: LayoutPlan;
  readonly rendered: RenderedTreatment;
  readonly bundle: TreatmentArtifactBundle;
}

function diagnostic(code: string, message: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "experiment",
    message,
    requirementIds: ["R-048", "R-049", "R-057"],
  };
}

export function treatmentSlug(recipeId: string): string {
  const slug = recipeId
    .replace(/^mnls\.recipe\./u, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return slug || "treatment";
}

export function prepareCanonical(
  value: unknown,
  arrangementId?: string,
): StageResult<PreparedCanonical> {
  const structural = validateArtifact(schemaIds.canonical, value);
  if (!structural.ok) return { ok: false, diagnostics: structural.diagnostics };
  const document = value as CanonicalDocument;
  const semantic = validateCanonicalSemantics(document);
  if (!semantic.ok) return semantic;
  const selectedArrangementId = arrangementId ?? document.arrangements[0]?.id;
  if (!selectedArrangementId) {
    return {
      ok: false,
      diagnostics: [
        diagnostic("CLI_ARRANGEMENT_REQUIRED", "Document has no arrangement to select."),
      ],
    };
  }
  const normalized = normalize(document, selectedArrangementId);
  if (!normalized.ok) return normalized;
  return {
    ok: true,
    value: { document: semantic.value, normalized: normalized.value },
    diagnostics: [],
  };
}

function verifyOptionalPlan(
  planInput: unknown | undefined,
  definitionInput: unknown | undefined,
  prepared: PreparedCanonical,
): StageResult<VerifiedLearningPlan | undefined> {
  if (planInput === undefined && definitionInput === undefined) {
    return { ok: true, value: undefined, diagnostics: [] };
  }
  if (planInput === undefined || definitionInput === undefined) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "CLI_PLAN_INPUT_INCOMPLETE",
          "A supplied learning plan requires its pinned transformation definition and vice versa.",
        ),
      ],
    };
  }
  const planSchema = validateArtifact(schemaIds.learningPlan, planInput);
  if (!planSchema.ok) return { ok: false, diagnostics: planSchema.diagnostics };
  return verifyLearningPlan(
    planInput as LearningPlan,
    prepared.document,
    prepared.normalized,
    definitionInput,
  );
}

function provenance(
  prepared: PreparedCanonical,
  recipe: ResolvedRecipe,
  projection: ProjectedView,
  layout: LayoutPlan,
  verifiedPlan: VerifiedLearningPlan | undefined,
): JSONValue {
  return {
    formatVersion: "0.1.0",
    source: {
      canonicalDocumentId: prepared.document.id,
      arrangementId: prepared.normalized.arrangementId,
      canonicalHash: contentHash(prepared.document),
      normalizedHash: normalizedHash(prepared.normalized),
    },
    recipe: {
      id: recipe.recipeRef.id,
      version: recipe.recipeRef.version,
      contentHash: recipe.recipeRef.contentHash,
      resolutionHash: recipe.resolutionHash,
    },
    projectionHash: projection.projectionHash,
    layoutHash: layout.layoutHash,
    ...(verifiedPlan
      ? {
          learningPlan: {
            id: verifiedPlan.plan.id,
            planHash: verifiedPlan.planHash,
            definitionHash: verifiedPlan.definitionHash,
          },
        }
      : {}),
    nodes: layout.nodes.map((node) => ({
      nodeId: node.id,
      sourceRefs: node.sourceRefs,
      provenanceRefs: node.provenanceRefs,
      strategyRef: node.strategyRef,
    })),
  };
}

export function executeTreatment(input: {
  readonly prepared: PreparedCanonical;
  readonly recipeInput: unknown;
  readonly planInput?: unknown;
  readonly definitionInput?: unknown;
}): StageResult<ExecutedTreatment> {
  const verified = verifyOptionalPlan(input.planInput, input.definitionInput, input.prepared);
  if (!verified.ok) return verified;
  const arrangement = analyzeArrangementCapabilities(
    input.prepared.document,
    input.prepared.normalized,
  );
  const renderer = analyzeRendererCapabilities(rendererDescriptor);
  const environment = analyzeEnvironmentCapabilities(environmentDescriptor);
  const recipe = resolveRecipe(input.recipeInput, {
    arrangement,
    ...(verified.value ? { learningPlan: analyzeLearningPlanCapabilities(verified.value) } : {}),
    renderer,
    environment,
  });
  if (!recipe.ok) return { ok: false, diagnostics: recipe.diagnostics };
  const projection = projectView({
    arrangement: input.prepared.normalized,
    recipe: recipe.value,
    ...(verified.value ? { learningPlan: verified.value } : {}),
  });
  if (!projection.ok) return projection;
  const layout = layoutProjectedView({ view: projection.value, recipe: recipe.value });
  if (!layout.ok) return layout;
  const rendered = renderLayoutPlan(layout.value);
  if (!rendered.ok) return { ok: false, diagnostics: rendered.diagnostics };
  const refs: VersionedContentRef[] = [
    {
      id: input.prepared.document.id,
      version: input.prepared.document.schemaVersion,
      contentHash: contentHash(input.prepared.document),
    },
    {
      id: `normalized.${input.prepared.normalized.arrangementId}`,
      version: input.prepared.normalized.formatVersion,
      contentHash: normalizedHash(input.prepared.normalized),
    },
    recipe.value.recipeRef,
  ];
  if (verified.value) {
    refs.push(verified.value.plan.transformationRef, {
      id: verified.value.plan.id,
      version: verified.value.plan.formatVersion,
      contentHash: verified.value.planHash,
    });
  }
  const slug = treatmentSlug(recipe.value.recipeRef.id);
  const bundle = createTreatmentArtifactBundle({
    id: `treatment.${slug}`,
    inputRefs: refs,
    resolvedRecipe: recipe.value,
    identity: {
      canonicalHash: arrangement.canonicalHash,
      normalizedHash: arrangement.normalizedHash,
      projectionHash: projection.value.projectionHash,
      layoutHash: layout.value.layoutHash,
      ...(verified.value
        ? {
            learningPlanHash: verified.value.planHash,
            transformationHash: verified.value.definitionHash,
          }
        : {}),
      environmentHash: environment.environmentHash,
    },
    rendererRef: {
      id: renderer.rendererRef.id,
      version: renderer.rendererRef.version,
      implementationHash: renderer.implementationHash,
    },
    toolVersions,
    indexHtml: rendered.value.html,
    diagnostics: [],
    provenance: provenance(
      input.prepared,
      recipe.value,
      projection.value,
      layout.value,
      verified.value,
    ),
    ...(verified.value ? { learningPlan: verified.value.plan as unknown as JSONValue } : {}),
  });
  if (!bundle.ok) return bundle;
  return {
    ok: true,
    value: {
      slug,
      normalized: input.prepared.normalized,
      ...(verified.value ? { verifiedPlan: verified.value } : {}),
      recipe: recipe.value,
      projection: projection.value,
      layout: layout.value,
      rendered: rendered.value,
      bundle: bundle.value,
    },
    diagnostics: [],
  };
}

export function recipeContentRef(recipe: RepresentationRecipe): VersionedContentRef {
  return { id: recipe.id, version: recipe.version, contentHash: contentHash(recipe) };
}

export function transformationContentRef(
  definition: LearningTransformationDefinition,
): VersionedContentRef {
  return { id: definition.id, version: definition.version, contentHash: contentHash(definition) };
}
