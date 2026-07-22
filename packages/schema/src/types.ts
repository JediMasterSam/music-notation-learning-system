export interface VersionedContentRef {
  readonly id: string;
  readonly version: string;
  readonly contentHash: string;
}

export interface StrategySelectionData {
  readonly strategyId: string;
  readonly strategyVersion: string;
  readonly options: unknown;
}

export interface RepresentationRecipeData {
  readonly formatVersion: "0.1.0";
  readonly id: string;
  readonly version: string;
  readonly name: string;
  readonly status: "experimental" | "comparison" | "internal";
  readonly strategies: {
    readonly timeMapping: StrategySelectionData;
    readonly pitchMapping: StrategySelectionData;
    readonly durationEncoding: StrategySelectionData;
    readonly pitchLabels: StrategySelectionData;
    readonly structuralOverlays?: readonly StrategySelectionData[];
  };
  readonly visibility: Readonly<Record<string, unknown>>;
  readonly accessibility: {
    readonly includeExactPitch: true;
    readonly includeExactTime: true;
    readonly includeSourceOrderEvents: true;
  };
  readonly renderer: StrategySelectionData;
}

export interface LearningTransformationDefinitionData {
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
  readonly outputContractVersion: string;
}

export interface StructuralDiagnostic {
  readonly code: "SCHEMA_NOT_REGISTERED" | "SCHEMA_INVALID";
  readonly severity: "error";
  readonly stage: "schema";
  readonly message: string;
  readonly jsonPointer?: string;
  readonly schemaPath?: string;
}

export type StructuralValidationResult =
  | { readonly ok: true; readonly value: unknown; readonly diagnostics: readonly [] }
  | { readonly ok: false; readonly diagnostics: readonly StructuralDiagnostic[] };
