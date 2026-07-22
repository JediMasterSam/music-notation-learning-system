export { StrategyCatalog } from "./catalog.js";
export { createExperimentRunManifest, createTreatmentArtifactBundle } from "./artifacts.js";
export type {
  ExperimentRunManifestInput,
  ExperimentRunManifest,
  ExperimentTreatmentEvidence,
  TreatmentArtifactBundle,
  TreatmentArtifactBundleInput,
  TreatmentIdentityEvidence,
  TreatmentManifest,
  VersionedContentRef,
} from "./artifacts.js";
export { validateExperimentDefinition } from "./experiment.js";
export type {
  ExperimentDefinition,
  ExperimentNamedText,
  ExperimentVariable,
} from "./experiment.js";
export type {
  CatalogResolution,
  LimitationDeclaration,
  StrategyDescriptor,
  StrategyKind,
} from "./catalog.js";
export { evaluateCompatibility } from "./compatibility.js";
export type { CompatibilityEvaluationInput, StrategyRef } from "./compatibility.js";
export { materializeStrategyOptions } from "./options.js";
export type { OptionFieldSchema, StrategyOptionSchema } from "./options.js";
export { resolveRecipe, validateRepresentationRecipe } from "./recipe.js";
export type {
  RecipeResolutionResult,
  RecipeSelectionSlot,
  RecipeValidationResult,
  RepresentationRecipe,
  ResolvedRecipe,
  ResolvedStrategySelection,
  StrategySelection,
} from "./recipe.js";
export {
  createBuiltInStrategyCatalog,
  describeBuiltInStrategy,
  listBuiltInStrategies,
} from "./strategies.js";
export type { RepresentationStrategyImplementation } from "./strategies.js";
