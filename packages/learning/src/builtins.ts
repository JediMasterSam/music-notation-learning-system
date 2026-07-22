import { ideaBoundaryV1 } from "./idea-boundary-v1.js";
import {
  LearningTransformationRegistry,
  type LearningTransformationDescriptor,
} from "./registry.js";
import type { LearningTransformationImplementation } from "./transformation.js";

export const ideaBoundaryDescriptor = Object.freeze({
  id: ideaBoundaryV1.id,
  version: ideaBoundaryV1.version,
  optionSchemaRef: ideaBoundaryV1.parameterSchemaRef,
  requiresCapabilities: [
    {
      source: "arrangement",
      capability: "structure.musical-ideas",
      acceptedStates: ["present"],
    },
  ],
  providesPlanCapabilities: [
    { capability: "learning-plan.valid", state: "present" },
    { capability: "learning-plan.matches-arrangement", state: "present" },
    { capability: "learning-plan.has-chunks", state: "present" },
  ],
  deterministic: true,
} satisfies LearningTransformationDescriptor);

export function createBuiltInLearningRegistry(): LearningTransformationRegistry<LearningTransformationImplementation> {
  const registry = new LearningTransformationRegistry<LearningTransformationImplementation>();
  registry.register(ideaBoundaryDescriptor, ideaBoundaryV1);
  return registry;
}

export function listLearningStrategies(): readonly LearningTransformationDescriptor[] {
  return createBuiltInLearningRegistry().list();
}
