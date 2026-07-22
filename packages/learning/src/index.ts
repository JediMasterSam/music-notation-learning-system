export {
  createBuiltInLearningRegistry,
  ideaBoundaryDescriptor,
  listLearningStrategies,
} from "./builtins.js";
export type {
  IdeaBoundaryParameters,
  LearningChunk,
  LearningChunkProvenance,
  LearningContentSelector,
  LearningPlan,
  LearningPlanOverride,
  LearningPlanOverrideOperation,
  LearningPlanProvenance,
  LearningRelationship,
  LearningTransformationDefinition,
  VerifiedLearningPlan,
  VersionedContentRef,
} from "./contracts.js";
export { ideaBoundaryV1, materializeIdeaBoundaryParameters } from "./idea-boundary-v1.js";
export {
  analyzeLearningPlanCapabilities,
  compareLearningChunkOrder,
  generateLearningPlan,
  learningPlanHash,
  validateLearningTransformationDefinition,
  verifyLearningPlan,
} from "./plan.js";
export { LearningTransformationRegistry } from "./registry.js";
export type {
  LearningTransformationDescriptor,
  LearningTransformationResolution,
} from "./registry.js";
export type {
  GeneratedLearningChunk,
  LearningTransformationExecutionContext,
  LearningTransformationImplementation,
} from "./transformation.js";
