import type {
  Diagnostic,
  HandName,
  JSONValue,
  MusicalRoleKind,
  SpecificValue,
  TimeSpan,
} from "@mnls/model";

export interface VersionedContentRef {
  readonly id: string;
  readonly version: string;
  readonly contentHash: string;
}

export interface LearningTransformationDefinition {
  readonly formatVersion: "0.1.0";
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly status: "experimental" | "comparison" | "internal";
  readonly supportedArrangementCapabilities: readonly {
    readonly source: "arrangement";
    readonly capability: string;
    readonly acceptedStates: readonly ("present" | "partial")[];
  }[];
  readonly parameterSchemaRef: string;
  readonly implementationRef: {
    readonly transformationId: string;
    readonly transformationVersion: string;
  };
  readonly ruleConfiguration?: JSONValue;
  readonly outputContractVersion: string;
  readonly metadata?: JSONValue;
}

export type IdeaBoundaryParameters = {
  readonly includedRoleKinds: readonly MusicalRoleKind[];
  readonly includeTransitions: boolean;
  readonly order: "canonical-time";
};

export type LearningContentSelector =
  | { readonly type: "canonical-ref"; readonly ref: string }
  | { readonly type: "time-span"; readonly span: TimeSpan };

export interface LearningChunkProvenance {
  readonly transformationRef: VersionedContentRef;
  readonly ruleId: string;
  readonly sourceRefs: readonly string[];
  readonly sourceSpans: readonly TimeSpan[];
  readonly overrideRefs?: readonly string[];
}

export interface LearningChunk {
  readonly id: string;
  readonly label?: string;
  readonly selectors: readonly LearningContentSelector[];
  readonly roleFilter?: readonly string[];
  readonly handFilter?: SpecificValue<readonly HandName[]>;
  readonly practiceIntent?: readonly string[];
  readonly provenance: LearningChunkProvenance;
}

export type LearningRelationship =
  | {
      readonly type: "precedes";
      readonly fromChunkId: string;
      readonly toChunkId: string;
    }
  | {
      readonly type: "prerequisite";
      readonly fromChunkId: string;
      readonly toChunkId: string;
    }
  | {
      readonly type: "recombine";
      readonly sourceChunkIds: readonly string[];
      readonly targetChunkId: string;
    }
  | {
      readonly type: "transition-practice";
      readonly transitionRef: string;
      readonly chunkId: string;
    }
  | { readonly type: "alternate-treatment"; readonly chunkIds: readonly string[] };

export type LearningPlanOverrideOperation =
  | { readonly type: "suppress" }
  | { readonly type: "replace-label"; readonly label: string }
  | {
      readonly type: "set-filter";
      readonly roleFilter?: readonly string[];
      readonly handFilter?: SpecificValue<readonly HandName[]>;
    }
  | { readonly type: "split"; readonly selectors: readonly (readonly LearningContentSelector[])[] }
  | { readonly type: "merge"; readonly sourceChunkIds: readonly string[] };

export interface LearningPlanOverride {
  readonly id: string;
  readonly targetChunkId: string;
  readonly operation: LearningPlanOverrideOperation;
  readonly reason: string;
}

export interface LearningPlanProvenance {
  readonly arrangementId: string;
  readonly arrangementHash: string;
  readonly normalizedHash: string;
  readonly transformationId: string;
  readonly transformationVersion: string;
  readonly definitionHash: string;
  readonly parameterHash: string;
  readonly executorVersion: "0.1.0";
}

export interface LearningPlan {
  readonly formatVersion: "0.1.0";
  readonly id: string;
  readonly arrangementRef: VersionedContentRef;
  readonly normalizedArrangementHash: string;
  readonly transformationRef: VersionedContentRef;
  readonly transformationParameters: JSONValue;
  readonly chunks: readonly LearningChunk[];
  readonly relationships: readonly LearningRelationship[];
  readonly overrides?: readonly LearningPlanOverride[];
  readonly provenance: LearningPlanProvenance;
  readonly diagnostics: readonly Diagnostic[];
  readonly planHash: string;
}

export interface VerifiedLearningPlan {
  readonly verification: "verified-learning-plan";
  readonly plan: LearningPlan;
  readonly planHash: string;
  readonly arrangementId: string;
  readonly arrangementHash: string;
  readonly normalizedHash: string;
  readonly definitionHash: string;
}
