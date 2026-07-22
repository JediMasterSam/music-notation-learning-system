import type { Arrangement, CanonicalDocument, JSONValue, StageResult, TimeSpan } from "@mnls/model";
import type { NormalizedArrangement } from "@mnls/normalizer";

import type { LearningContentSelector } from "./contracts.js";

export interface GeneratedLearningChunk {
  readonly ruleId: string;
  readonly selectors: readonly LearningContentSelector[];
  readonly sourceRefs: readonly string[];
  readonly sourceSpans: readonly TimeSpan[];
  readonly sortSpan: TimeSpan;
}

export interface LearningTransformationExecutionContext<TParameters extends JSONValue> {
  readonly document: CanonicalDocument;
  readonly arrangement: Arrangement;
  readonly normalized: NormalizedArrangement;
  readonly parameters: TParameters;
}

export interface LearningTransformationImplementation<TParameters extends JSONValue = JSONValue> {
  readonly id: string;
  readonly version: string;
  readonly parameterSchemaRef: string;
  validateParameters(value: JSONValue): StageResult<TParameters>;
  execute(
    context: LearningTransformationExecutionContext<TParameters>,
  ): StageResult<readonly GeneratedLearningChunk[]>;
}
