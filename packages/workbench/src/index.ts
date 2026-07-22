export { StrategyCatalog } from "./catalog.js";
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
export { createBuiltInStrategyCatalog, listBuiltInStrategies } from "./strategies.js";
export type { RepresentationStrategyImplementation } from "./strategies.js";
