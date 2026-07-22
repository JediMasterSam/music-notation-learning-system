export type StableId = string;
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue =
  | JSONPrimitive
  | readonly JSONValue[]
  | { readonly [key: string]: JSONValue };

export interface Rational {
  readonly numerator: number;
  readonly denominator: number;
}

export interface TimePosition {
  readonly beat: Rational;
}

export interface Duration {
  readonly beats: Rational;
}

export interface TimeSpan {
  readonly start: TimePosition;
  readonly duration: Duration;
}

export type SpecificityState =
  | "required"
  | "suggested"
  | "optional"
  | "intentionally-unspecified"
  | "unknown";

export type SpecificValue<T> =
  | { readonly state: "required" | "suggested" | "optional"; readonly value: T }
  | { readonly state: "intentionally-unspecified"; readonly reason?: string }
  | { readonly state: "unknown"; readonly note?: string };

export interface PitchEnvelope<TValue extends JSONValue = JSONValue> {
  readonly strategy: string;
  readonly version: string;
  readonly value: TValue;
}

export type MusicalRoleKind = "harmony" | "bass" | "accompaniment" | "primary-line" | "rhythm";
export type HandName = "left" | "right" | "both" | "either";

export interface Song {
  readonly id: StableId;
  readonly title: string;
  readonly metadata?: JSONValue;
}

export interface SourceRecord {
  readonly id: StableId;
  readonly status:
    | "public-domain"
    | "licensed"
    | "user-supplied"
    | "synthetic"
    | "analytical-fixture";
  readonly repositoryUsePermitted: true;
  readonly sourceReference?: string;
  readonly behaviors: readonly string[];
  readonly limitations: readonly string[];
}

export interface MeterChange {
  readonly start: TimePosition;
  readonly numerator: number;
  readonly denominator: number;
}

export interface MeasureCoordinate {
  readonly id: StableId;
  readonly ordinal: number;
  readonly start: TimePosition;
  readonly duration: Duration;
  readonly displayNumber?: string;
  readonly pickup?: boolean;
}

export interface MusicalRole {
  readonly id: StableId;
  readonly kind: MusicalRoleKind;
  readonly label?: string;
}

export interface Section {
  readonly id: StableId;
  readonly label?: string;
  readonly type?: string;
  readonly span: TimeSpan;
  readonly order: number;
  readonly ideaRefs: readonly StableId[];
  readonly transitionRefs?: readonly StableId[];
}

export interface MusicalIdea {
  readonly id: StableId;
  readonly span: TimeSpan;
  readonly roleRefs: readonly StableId[];
  readonly eventRefs: readonly StableId[];
  readonly sourceIdeaRef?: StableId;
  readonly variationRef?: StableId;
}

export interface Transition {
  readonly id: StableId;
  readonly fromRef: StableId;
  readonly toRef: StableId;
  readonly span?: TimeSpan;
  readonly eventRefs?: readonly StableId[];
}

export interface HandAssignment {
  readonly id: StableId;
  readonly targetRef: StableId;
  readonly assignment: SpecificValue<HandName>;
  readonly span?: TimeSpan;
  readonly priority?: number;
}

export interface ChordQualityRef {
  readonly vocabularyId: string;
  readonly vocabularyVersion: string;
  readonly qualityId: string;
}

export interface ChordAnalysis {
  readonly root: PitchEnvelope;
  readonly quality: ChordQualityRef;
  readonly extensions?: readonly number[];
  readonly alterations?: readonly JSONValue[];
  readonly omissions?: SpecificValue<readonly number[]>;
  readonly addedTones?: readonly number[];
}

export interface HarmonicAnalysisAnnotation {
  readonly id: StableId;
  readonly text: string;
  readonly system?: string;
  readonly tags?: readonly string[];
  readonly authority: "annotation";
}

export interface Inversion {
  readonly kind: "chord-member-lowest";
  readonly chordDegree: number;
}

export interface Voicing {
  readonly pitches?: SpecificValue<readonly PitchEnvelope[]>;
  readonly pitchClasses?: SpecificValue<readonly PitchEnvelope[]>;
  readonly register?: SpecificValue<JSONValue>;
  readonly spacing?: SpecificValue<JSONValue>;
  readonly doublings?: SpecificValue<readonly JSONValue[]>;
  readonly omissions?: SpecificValue<readonly number[]>;
  readonly roleRefs?: readonly StableId[];
  readonly handAssignmentRefs?: readonly StableId[];
}

export interface FamiliarShapeHint {
  readonly id: StableId;
  readonly type: "familiar-shape";
  readonly source: "authored" | "generated";
  readonly upperStructure: ChordAnalysis;
  readonly bass: PitchEnvelope;
  readonly equivalence: "exact-pitch-class-set" | "voicing-subset" | "approximation";
  readonly status?: "active" | "suppressed";
  readonly suppressionReasons?: readonly string[];
}

export interface EventBase {
  readonly id: StableId;
  readonly start: TimePosition;
  readonly duration: Duration;
  readonly roleRefs: readonly StableId[];
  readonly specificity?: SpecificityState;
  readonly handAssignmentRefs?: readonly StableId[];
}

export interface NoteEvent extends EventBase {
  readonly type: "note";
  readonly pitch: SpecificValue<PitchEnvelope>;
}

export interface ChordEvent extends EventBase {
  readonly type: "chord";
  readonly harmony: ChordAnalysis;
  readonly inversion?: SpecificValue<Inversion>;
  readonly slashBass?: SpecificValue<PitchEnvelope>;
  readonly voicing: SpecificValue<Voicing>;
  readonly hints?: readonly FamiliarShapeHint[];
  readonly analysisAnnotations?: readonly HarmonicAnalysisAnnotation[];
}

export type MusicalEvent = NoteEvent | ChordEvent;

export interface RepetitionReference {
  readonly id: StableId;
  readonly sourceRef: StableId;
  readonly start: TimePosition;
  readonly duration?: Duration;
  readonly count?: number;
  readonly variationRefs?: readonly StableId[];
}

export interface ReplaceEventOperation {
  readonly type: "replace-event";
  readonly targetEventRef: StableId;
  readonly event: MusicalEvent;
}

export interface Variation {
  readonly id: StableId;
  readonly sourceRef: StableId;
  readonly label?: string;
  readonly operations: readonly ReplaceEventOperation[];
}

export interface Arrangement {
  readonly id: StableId;
  readonly songRef: StableId;
  readonly title?: string;
  readonly keyContext?: JSONValue;
  readonly meterMap: readonly MeterChange[];
  readonly measures: readonly MeasureCoordinate[];
  readonly roles: readonly MusicalRole[];
  readonly sections: readonly Section[];
  readonly ideas: readonly MusicalIdea[];
  readonly events: readonly MusicalEvent[];
  readonly repetitions?: readonly RepetitionReference[];
  readonly variations?: readonly Variation[];
  readonly transitions?: readonly Transition[];
  readonly handAssignments?: readonly HandAssignment[];
  readonly duration?: Duration;
  readonly metadata?: JSONValue;
}

export interface CanonicalDocument {
  readonly documentType: "music-notation-learning-system";
  readonly schemaVersion: "0.1.0";
  readonly id: StableId;
  readonly song: Song;
  readonly arrangements: readonly Arrangement[];
  readonly sourceRegister?: readonly SourceRecord[];
  readonly metadata?: JSONValue;
}

export type DiagnosticStage =
  | "load"
  | "schema"
  | "semantic"
  | "resolve"
  | "normalize"
  | "transpose"
  | "capability"
  | "recipe"
  | "learning"
  | "project"
  | "layout"
  | "render"
  | "experiment"
  | "corpus";

export interface Diagnostic {
  readonly code: string;
  readonly severity: "info" | "warning" | "error";
  readonly stage: DiagnosticStage;
  readonly message: string;
  readonly jsonPointer?: string;
  readonly canonicalId?: string;
  readonly relatedIds?: readonly string[];
  readonly requirementIds?: readonly string[];
  readonly hint?: string;
  readonly detail?: Readonly<Record<string, JSONValue>>;
}

export interface ProvenanceStep {
  readonly kind:
    | "canonical"
    | "reference"
    | "pattern"
    | "override"
    | "repetition"
    | "variation"
    | "transposition"
    | "projection";
  readonly sourceId: StableId;
  readonly detail?: string;
  readonly operationIndex?: number;
}

export interface ProvenanceChain {
  readonly steps: readonly ProvenanceStep[];
}

export type StageResult<T> =
  | { readonly ok: true; readonly value: T; readonly diagnostics: readonly Diagnostic[] }
  | { readonly ok: false; readonly diagnostics: readonly Diagnostic[] };
