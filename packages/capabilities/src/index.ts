export type CapabilityState = "present" | "partial" | "absent" | "unknown";
export type CapabilityAuthority =
  | "canonical-arrangement"
  | "verified-learning-plan"
  | "renderer"
  | "environment";
export type CapabilityRequirementSource =
  | "arrangement"
  | "learning-plan"
  | "renderer"
  | "environment"
  | "selected-strategy";

export interface VersionedRef {
  readonly id: string;
  readonly version: string;
}

export interface CapabilityEvidenceSource {
  readonly authority: CapabilityAuthority;
  readonly artifactId: string;
  readonly contentHash: string;
}

export interface CapabilityEvidence {
  readonly capability: string;
  readonly state: CapabilityState;
  readonly source: CapabilityEvidenceSource;
  readonly evidenceRefs?: readonly string[];
  readonly detail?: string;
}

export interface ArrangementCapabilityProfile {
  readonly formatVersion: "0.1.0";
  readonly profileType: "arrangement";
  readonly arrangementId: string;
  readonly canonicalHash: string;
  readonly normalizedHash: string;
  readonly capabilities: readonly CapabilityEvidence[];
}

export interface LearningPlanCapabilityProfile {
  readonly formatVersion: "0.1.0";
  readonly profileType: "learning-plan";
  readonly planId: string;
  readonly planHash: string;
  readonly arrangementId: string;
  readonly arrangementHash: string;
  readonly capabilities: readonly CapabilityEvidence[];
}

export interface RendererCapabilityProfile {
  readonly formatVersion: "0.1.0";
  readonly profileType: "renderer";
  readonly rendererRef: VersionedRef;
  readonly implementationHash: string;
  readonly capabilities: readonly CapabilityEvidence[];
}

export interface EnvironmentCapabilityProfile {
  readonly formatVersion: "0.1.0";
  readonly profileType: "environment";
  readonly environmentId: string;
  readonly environmentHash: string;
  readonly capabilities: readonly CapabilityEvidence[];
}

export interface TreatmentInputProfile {
  readonly arrangement: ArrangementCapabilityProfile;
  readonly learningPlan?: LearningPlanCapabilityProfile;
  readonly renderer: RendererCapabilityProfile;
  readonly environment?: EnvironmentCapabilityProfile;
}

export interface CapabilityRequirement {
  readonly source: CapabilityRequirementSource;
  readonly capability: string;
  readonly acceptedStates: readonly ("present" | "partial")[];
}

export interface CapabilityDeclaration {
  readonly capability: string;
  readonly state: "present" | "partial";
}

export interface LimitationPolicy {
  readonly acceptedClasses: readonly string[];
}

export interface CompatibilityInput<TDescriptor = unknown> {
  readonly inputProfile: TreatmentInputProfile;
  readonly selectedStrategyDescriptors: readonly TDescriptor[];
  readonly limitationPolicy: LimitationPolicy;
}

export type CompatibilityStatus =
  | "supported"
  | "supported-with-limitations"
  | "incompatible"
  | "unavailable";

export interface CapabilityDiagnostic {
  readonly code: string;
  readonly severity: "warning" | "error";
  readonly stage: "capability";
  readonly message: string;
  readonly requirementSource: CapabilityRequirementSource;
  readonly capability: string;
  readonly sourceAuthority?: CapabilityAuthority;
  readonly sourceArtifactId?: string;
  readonly sourceHash?: string;
  readonly evidenceRefs?: readonly string[];
}

export interface CompatibilityLimitation {
  readonly class: string;
  readonly message: string;
  readonly source: CapabilityRequirementSource;
  readonly capability: string;
}

export interface CompatibilityReport {
  readonly status: CompatibilityStatus;
  readonly diagnostics: readonly CapabilityDiagnostic[];
  readonly limitations: readonly CompatibilityLimitation[];
}
