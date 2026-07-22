# Canonical Model

Status: Architecture Sprint 0 complete — proposed for review  
Canonical schema target: 0.1.0

## 1. Model purpose

The canonical model stores authoritative musical meaning independently of any learner-facing notation, renderer, or final punctuation. It supports exact notes and higher-level musical intent, preserves reusable sources and explicit differences, and keeps all experimental representations replaceable.

The canonical document is JSON validated first by JSON Schema 2020-12 and then by semantic validators. TypeScript model types are generated or mechanically checked against the schema; handwritten TypeScript types may add behavior but may not broaden or narrow accepted serialized data silently.

Linked requirements: R-004–R-025, R-035–R-041, R-048–R-050.

## 2. Cross-cutting primitives

### 2.1 `StableId`

**Purpose:** stable reference identity inside one canonical document and across derived artifacts.  
**Serialized form:** string matching `^[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)*$`.  
**Invariants:** nonempty, unique within its declared namespace, case-sensitive, never generated randomly during derivation.  
**References:** all references are typed by target kind and validated after structural validation.  
**Transposition:** unchanged.  
**Versioning:** syntax is part of canonical major version.  
**Provenance:** source IDs begin every provenance chain.  
**Tests:** uniqueness, wrong-kind reference, stable output ordering.

Valid: `idea.verse-hook`  
Invalid: `Verse Hook` because spaces and uppercase are prohibited.

### 2.2 `Rational`

```text
Rational { numerator: integer; denominator: positive integer }
```

**Purpose:** exact beat, duration, ratio, and subdivision values without floating-point drift.  
**Invariants:** normalized to lowest terms; denominator positive; zero represented as `0/1`.  
**Transposition:** unchanged.  
**Error behavior:** zero denominator is structural error; non-normalized input is accepted only if the normalizer records canonical reduction, or may be rejected under strict mode. Sprint 1 uses strict normalized input.

Valid: `{ "numerator": 3, "denominator": 2 }`  
Invalid: `{ "numerator": 1, "denominator": 0 }`.

### 2.3 `SpecificValue<T>` and `SpecificityState`

```text
SpecificValue<T> =
  | { state: "required"; value: T }
  | { state: "suggested"; value: T }
  | { state: "optional"; value: T }
  | { state: "intentionally-unspecified"; reason?: string }
  | { state: "unknown"; note?: string }
```

**Purpose:** preserve prescribed, suggested, optional, intentionally unspecified, and unknown/not-entered information as distinct states.  
**Ownership:** `model`; schema defines the discriminated union.  
**Invariants:** states with values must contain exactly one `value`; absent-value states must not contain `value`; consumers may hide a value but may not convert its state.  
**References:** `T` may contain typed references.  
**Transposition:** transpose `value` only for value-bearing states; state and annotations remain unchanged.  
**Normalization:** copied losslessly. No default value is inserted.  
**Rendering:** each visible state has a text/shape distinction; color is supplemental.  
**Errors:** `SPEC_VALUE_FOR_ABSENT_STATE`, `SPEC_MISSING_VALUE`.  
**Versioning:** adding a state is a major schema change.  
**Tests:** round-trip through every pipeline stage.

Valid: `{ "state": "intentionally-unspecified", "reason": "performer choice" }`  
Invalid: `{ "state": "unknown", "value": ["C4","E4"] }`.

### 2.4 `PitchValue` and `PitchClassValue`

```text
PitchEnvelope {
  strategy: string;
  version: string;
  value: JSON value validated by the registered strategy
}
```

`PitchValue` represents register-bearing pitch; `PitchClassValue` represents register-free pitch class. The envelope is canonical; its strategy payload remains replaceable.

**Invariants:** registered strategy and version required; a strategy declares whether the payload is pitch or pitch class; display labels are never the semantic value.  
**Transposition:** delegated to the strategy.  
**Errors:** unknown strategy, wrong payload kind, unsupported operation, ambiguous transposition.  
**Versioning:** strategy payloads version independently.  
**Provenance:** transposition adds a derived provenance step but does not rewrite source IDs.

Sprint 1 required strategy: `spelled-pitch@1`, with semantic step, alteration, and optional octave. This is a baseline strategy, not a final product decision.

Valid pitch: `{ "strategy":"spelled-pitch", "version":"1", "value":{"step":"C","alter":1,"octave":4} }`  
Invalid pitch: `{ "strategy":"label", "version":"1", "value":"C#4" }` because rendered labels are not a registered semantic strategy.

### 2.5 `TimePosition`, `Duration`, and `MeasureCoordinate`

```text
TimePosition { beat: Rational }
Duration { beats: Rational }
MeasureCoordinate {
  id: StableId;
  ordinal: nonnegative integer;
  start: TimePosition;
  duration: Duration;
  displayNumber?: string;
  pickup?: boolean
}
```

**Purpose:** events use absolute beat positions from arrangement start; measure records provide coordinates, not ownership or learning boundaries.  
**Invariants:** event durations are positive unless the event type explicitly permits a marker; measure spans do not overlap; events may cross measures; beat values need not be integers.  
**Transposition:** unchanged.  
**Normalization:** time is exact rational arithmetic.  
**Errors:** negative start, nonpositive duration, overlapping measure map, event outside arrangement extent when extent is declared.

Valid event time: start `3/2`, duration `1/2`.  
Invalid: duration `0/1` for a sounding event.

### 2.6 Common metadata

```text
CanonicalMetadata {
  title?: string;
  labels?: string[];
  annotations?: string[];
  extensions?: { [namespacedKey: string]: JSON value }
}
```

Extension keys must be reverse-domain or package namespaced, such as `org.example.renderer-hint`. Renderer-specific metadata is optional, namespaced, ignored safely by unknown consumers, and cannot override semantic fields.

## 3. Top-level document

### 3.1 `CanonicalDocument`

```text
CanonicalDocument {
  documentType: "music-notation-learning-system";
  schemaVersion: string;
  id: StableId;
  song: Song;
  arrangements: Arrangement[];
  localPatternDefinitions?: PatternDefinition[];
  sourceRegister?: SourceRecord[];
  metadata?: CanonicalMetadata
}
```

**Purpose:** serialization root and version boundary.  
**Ownership:** `schema` for structure, `model` for semantics.  
**Invariants:** exactly one `Song`; at least one arrangement in Prototype 1; arrangement `songRef` equals the contained song ID; all IDs unique in document scope.  
**Specificity:** not applied to structural existence.  
**Transposition:** returns a new document; song identity metadata remains unchanged unless explicitly strategy-defined.  
**Errors:** unsupported schema version, duplicate ID, missing arrangement.  
**Versioning:** explicit `schemaVersion`; no implicit upgrade.  
**Provenance:** document ID anchors reports.

Valid: one song and one arrangement referring to it.  
Invalid: arrangement refers to a different song ID.

## 4. Identity and arrangement types

### 4.1 `Song`

```text
Song {
  id: StableId;
  title: string;
  creators?: CreatorCredit[];
  sourceStatus?: SourceStatus;
  lyricTracks?: LyricTrack[];
  metadata?: CanonicalMetadata
}
```

**Purpose:** identity-level concept independent of a particular realization.  
**Ownership:** canonical document.  
**Invariants:** contains no arrangement-specific voicing, hand assignment, pattern realization, or renderer layout.  
**References:** arrangements reference `Song.id`.  
**Specificity:** unknown creator/source information is represented in source records, not invented.  
**Transposition:** unchanged.  
**Errors:** blank title; copyrighted source marked repository-permitted without a lawful basis.  
**Versioning:** backward-compatible metadata additions allowed.  
**Provenance:** source records link lawful origin.  
**Tests:** two arrangements may reference one song without sharing realization data.

Valid: song identity with title and lawful source status.  
Invalid: `Song` contains a `voicing` field.

### 4.2 `Arrangement`

```text
Arrangement {
  id: StableId;
  songRef: StableId;
  title?: string;
  keyContext?: KeyContext;
  meterMap: MeterChange[];
  measures: MeasureCoordinate[];
  sections: Section[];
  ideas: MusicalIdea[];
  events: MusicalEvent[];
  patternInstances?: PatternInstance[];
  repetitions?: RepetitionReference[];
  variations?: Variation[];
  transitions?: Transition[];
  learningChunks?: LearningChunk[];
  handAssignments?: HandAssignment[];
  duration?: Duration;
  metadata?: CanonicalMetadata
}
```

**Purpose:** realization-specific musical and pedagogical content.  
**Invariants:** references one song; owns temporal and realization data; section/idea/event spans fit the arrangement; no final layout.  
**Specificity:** realization fields whose omission has meaning use `SpecificValue`.  
**Transposition:** key and pitch-bearing descendants transpose; IDs, time, form, roles, chunks, repetition, and provenance remain stable.  
**Errors:** reference cycles, overlap contradictions, impossible meter coordinates.  
**Versioning:** arrangement objects migrate with document schema.  
**Tests:** transposition invariants, immutable load, multiple views from one arrangement.

Valid: arrangement with sections, events, and independent hand assignments.  
Invalid: final `x`, `y`, or `lineBreak` fields in canonical arrangement.

## 5. Structure and pedagogy

### 5.1 `Section`

```text
Section {
  id: StableId;
  label?: string;
  type?: string;
  span: TimeSpan;
  order: integer;
  ideaRefs: StableId[];
  repeatBehavior?: RepeatBehavior;
  endingRefs?: StableId[];
  transitionRefs?: StableId[];
  lyricTrackRefs?: StableId[];
  similarTo?: SimilarityReference[];
  metadata?: CanonicalMetadata
}
```

**Purpose:** arrangement structural unit.  
**Invariants:** stable order; span may contain or overlap ideas according to explicit references; a section is not automatically a learning chunk.  
**Transposition:** unchanged except pitch-bearing metadata is prohibited.  
**Errors:** duplicate order where strict sequence is required, dangling idea reference.  
**Provenance:** section ID survives projection and rendering.

Valid: verse section containing two idea refs.  
Invalid: section implicitly declared as a practice chunk with no `LearningChunk`.

### 5.2 `MusicalIdea`

```text
MusicalIdea {
  id: StableId;
  span: TimeSpan;
  roleRefs: StableId[];
  eventRefs: StableId[];
  sourceIdeaRef?: StableId;
  variationRef?: StableId;
  endingBehavior?: EndingBehavior;
  essentiality?: SpecificValue<Essentiality>;
  learningChunkRefs?: StableId[];
  metadata?: CanonicalMetadata
}
```

**Purpose:** reusable cognitive and structural unit.  
**Invariants:** event refs lie inside the idea span unless explicitly marked pickup/transition; source references are acyclic; direct source and variation relation are explicit.  
**Transposition:** descendants transpose; relationships remain.  
**Errors:** cyclic source, event outside span, source and duplicate material disagree.  
**Provenance:** repeated/varied instances retain source idea ID.

Valid: chorus idea referencing a source verse pattern with explicit variation.  
Invalid: copied events claimed as repetition with no source reference.

### 5.3 `Transition`

```text
Transition {
  id: StableId;
  fromRef: TypedStructuralRef;
  toRef: TypedStructuralRef;
  span?: TimeSpan;
  eventRefs?: StableId[];
  essentiality?: SpecificValue<Essentiality>;
  metadata?: CanonicalMetadata
}
```

**Purpose:** explicit connection between sections, ideas, endings, or learning chunks.  
**Invariants:** endpoints exist and are not identical unless a loop is explicitly intended; optional span/events align temporally.  
**Transposition:** referenced pitch events transpose.  
**Errors:** dangling endpoint, incompatible ordering.  
**Provenance:** transition identity remains visible in learning views.

Valid: transition from verse idea to chorus idea.  
Invalid: free text “transition” with no endpoints.

### 5.4 `LearningChunk`

```text
LearningChunk {
  id: StableId;
  label?: string;
  contentRefs: TypedCanonicalRef[];
  roleFilter?: StableId[];
  handFilter?: HandName[];
  span?: TimeSpan;
  prerequisiteRefs?: StableId[];
  strategyTags?: string[];
  metadata?: CanonicalMetadata
}
```

**Purpose:** pedagogical practice unit referencing canonical content without owning or copying music.  
**Invariants:** references at least one canonical item; role/hand filters do not mutate referenced music; chunks may cross sections/measures and differ by role/hand.  
**Transposition:** references unchanged; projected content transposes with arrangement.  
**Errors:** copied event payload inside chunk, dangling references, prerequisite cycle.  
**Versioning:** strategy tags are descriptive and non-semantic unless approved later.

Valid: left-hand chunk referencing two ideas and a transition.  
Invalid: chunk embeds duplicate note events.

## 6. Roles and execution

### 6.1 `MusicalRole`

```text
MusicalRole {
  id: StableId;
  kind: "harmony" | "bass" | "accompaniment" | "primary-line" | "rhythm";
  label?: string;
  metadata?: CanonicalMetadata
}
```

**Purpose:** musical function independent of execution hand.  
**Invariants:** Prototype 1 role kinds are closed; aliases do not create new learner-facing primitives.  
**Transposition:** unchanged.  
**Errors:** hand name used as role kind.  
**Versioning:** adding a built-in learner-facing role requires Product Owner approval and corpus justification.

Valid: `{ "id":"role.bass", "kind":"bass" }`.  
Invalid: `{ "kind":"left-hand" }`.

### 6.2 `HandAssignment`

```text
HandAssignment {
  id: StableId;
  targetRef: TypedCanonicalRef;
  assignment: SpecificValue<"left" | "right" | "both" | "either">;
  span?: TimeSpan;
  priority?: integer;
  metadata?: CanonicalMetadata
}
```

**Purpose:** execution assignment layered over musical roles.  
**Invariants:** assignment cannot change target role; overlapping assignments must be ordered or noncontradictory; `unknown` and `intentionally-unspecified` survive.  
**Transposition:** unchanged.  
**Errors:** contradictory required assignments at same priority.  
**Provenance:** normalized events record assignment source ID.

Valid: accompaniment idea suggested for right hand.  
Invalid: assignment rewrites the event role to `right-hand`.

## 7. Event model

### 7.1 `EventBase`

```text
EventBase {
  id: StableId;
  type: string;
  start: TimePosition;
  duration: Duration;
  roleRefs: StableId[];
  specificity?: SpecificityState;
  essentiality?: SpecificValue<Essentiality>;
  handAssignmentRefs?: StableId[];
  metadata?: CanonicalMetadata
}
```

All sounding events require positive duration and at least one musical role. Event-level specificity describes whether the event itself is prescribed; nested values retain their own specificity where needed.

### 7.2 `NoteEvent`

```text
NoteEvent extends EventBase {
  type: "note";
  pitch: SpecificValue<PitchValue>;
  tie?: { fromEventRef?: StableId; toEventRef?: StableId };
  articulation?: SpecificValue<Articulation[]>;
  dynamic?: SpecificValue<DynamicMark>;
  voiceId?: StableId
}
```

**Purpose:** exact note primitive for melody-only and detail-critical material.  
**Invariants:** required/suggested/optional pitch contains a register-bearing pitch; tied events agree semantically; no harmony is inferred.  
**Transposition:** pitch strategy transposes value-bearing pitch; ties and timing unchanged.  
**Errors:** unsupported pitch strategy, mismatched tie, missing role.  
**Normalization:** may originate directly or from a pattern; provenance records both.  
**Tests:** AT-001, AT-008.

Valid: exact melody note with primary-line role.  
Invalid: note represented only as display text `"F#"`.

### 7.3 `ChordEvent`

```text
ChordEvent extends EventBase {
  type: "chord";
  harmony: ChordAnalysis;
  inversion?: SpecificValue<Inversion>;
  slashBass?: SpecificValue<PitchClassValue>;
  voicing: SpecificValue<Voicing>;
  hints?: PedagogicalHint[];
  analysisMetadata?: { function?: string; romanNumeral?: string; tags?: string[] }
}
```

**Purpose:** harmony event with independent inversion, slash bass, and upper voicing.  
**Invariants:** `voicing` is mandatory as a specificity wrapper, so absence cannot imply a default; inversion never inferred from slash bass; slash bass never determines upper voicing; canonical harmony remains primary.  
**Transposition:** root, alterations, slash bass, voicing pitches, and hints transpose semantically; quality and structural metadata remain unless strategy says otherwise.  
**Errors:** collapsed chord-string fields, contradictory required voicing, hint inconsistency.  
**Normalization:** keeps all distinctions and IDs.  
**Tests:** AT-002–AT-005, AT-008–AT-010.

Valid: canonical `Am7`, explicit A bass, first-class inversion state, required voicing, optional `C/A` hint.  
Invalid: one string `"Am7/C/A(first inversion)"` standing in for harmony, slash bass, inversion, and voicing.

### 7.4 `ChordAnalysis`

```text
ChordAnalysis {
  root: PitchClassValue;
  quality: string;
  extensions?: ChordDegree[];
  alterations?: Alteration[];
  omissions?: SpecificValue<ChordDegree[]>;
  addedTones?: ChordDegree[]
}
```

**Invariants:** quality/degree vocabulary is versioned; alterations and omissions target valid degrees; display spelling is produced by pitch/harmony formatters, not stored as authority.  
**Transposition:** root transposes; quality/degrees remain.  
**Errors:** contradictory add/omit of the same required degree, invalid degree.  
**Rejected alternative:** opaque chord symbol string.

Valid: root A, minor quality, extension 7.  
Invalid: root encoded only by a rendered `Am7` label.

### 7.5 `Inversion`

```text
Inversion {
  kind: "chord-member-lowest";
  chordDegree: ChordDegree
}
```

**Purpose:** state which chord member is lowest in the harmonic realization when musically important.  
**Invariants:** degree belongs to canonical chord analysis; independent of slash bass and exact voicing.  
**Transposition:** degree unchanged.  
**Errors:** degree absent from the chord unless an explicit omission/alteration model explains it.

Valid: third is lowest chord member.  
Invalid: inversion inferred solely because slash bass is present.

### 7.6 `Voicing`

```text
Voicing {
  pitches?: SpecificValue<PitchValue[]>;
  pitchClasses?: SpecificValue<PitchClassValue[]>;
  register?: SpecificValue<RegisterConstraint>;
  spacing?: SpecificValue<SpacingConstraint>;
  doublings?: SpecificValue<DoublingRule[]>;
  omissions?: SpecificValue<ChordDegree[]>;
  roleRefs?: StableId[];
  handAssignmentRefs?: StableId[]
}
```

**Purpose:** upper or complete harmonic realization details without changing chord analysis or slash bass.  
**Invariants:** at least one voicing dimension must be supplied when the enclosing specificity has a value; exact pitches and pitch classes cannot contradict; hand/role association stays separate.  
**Transposition:** all pitch-bearing fields transpose; relative spacing/doubling remains.  
**Errors:** empty valued voicing, contradiction with required chord tones, hidden default close position.  
**Tests:** AT-004, AT-005.

Valid: required upper pitches C4, E4, G4 for `Am7` over explicit A bass.  
Invalid: `{ "state":"intentionally-unspecified", "value":{} }`.

### 7.7 `LyricEvent` and `LyricTrack`

```text
LyricTrack { id: StableId; language?: string; events: LyricEvent[] }
LyricEvent {
  id: StableId;
  text: string;
  start?: TimePosition;
  duration?: Duration;
  anchorEventRef?: StableId;
  syllabic?: "single" | "begin" | "middle" | "end";
  verse?: integer
}
```

**Purpose:** bind lyrics to time or events without whitespace padding.  
**Invariants:** each lyric event has a time span or event anchor; text is plain untrusted text; source order is stable.  
**Transposition:** unchanged.  
**Errors:** no anchor, invalid verse, unsafe raw markup treated as text.  
**Tests:** AT-012 and escaping tests.

Valid: lyric syllable anchored to a note event.  
Invalid: lyric placement represented by leading spaces.

## 8. Reuse, repetition, and variation

### 8.1 `PatternDefinition`

```text
PatternDefinition {
  id: StableId;
  version: string;
  canonicalName: string;
  aliases?: string[];
  exemplarRefs?: string[];
  applicableRoles: MusicalRoleKind[];
  parameters: PatternParameterDefinition[];
  body: PatternBody;
  compositionRefs?: PatternDefinitionRef[];
  admission?: PatternAdmissionRecord;
  metadata?: CanonicalMetadata
}
```

**Purpose:** named reusable musical behavior, not rendering shorthand.  
**Invariants:** canonical musical name first; aliases do not become new vocabulary; parameters typed; composition graph acyclic; shared definitions include corpus evidence or remain document-local.  
**Transposition:** definition declares pitch parameter semantics; expansion then transposes or transposition then expansion must be equivalent where declared.  
**Errors:** cycle, unknown parameter, unsupported role, missing pinned version.  
**Provenance:** definition ID/version included in expanded events.

Valid: versioned Alberti-bass pattern applicable to bass/accompaniment with typed chord-tone sequence.  
Invalid: pattern named after one song merely to shorten its fixture.

### 8.2 `PatternInstance`

```text
PatternInstance {
  id: StableId;
  definitionRef: PatternDefinitionRef;
  start: TimePosition;
  duration: Duration;
  roleRefs: StableId[];
  parameters: { [name: string]: JSON value };
  overrides?: PatternOverride[];
  handAssignmentRefs?: StableId[];
  specificity?: SpecificityState
}
```

**Purpose:** parameterized use of a pattern at a concrete span.  
**Invariants:** definition version pinned; parameters validate; explicit overrides target deterministic template IDs; hand assignment does not alter role.  
**Transposition:** semantic pitch parameters transpose; nonpitch parameters remain.  
**Errors:** override target absent, required parameter missing, duration incompatible.  
**Provenance:** every expanded event records instance, definition, template, and override IDs.

Valid: Alberti instance over two beats with an explicit last-note override.  
Invalid: free-form callback code embedded in JSON.

### 8.3 `RepetitionReference`

```text
RepetitionReference {
  id: StableId;
  sourceRef: TypedMaterialRef;
  start: TimePosition;
  duration?: Duration;
  count?: positive integer;
  variationRefs?: StableId[];
  endingRefs?: StableId[]
}
```

**Purpose:** preserve repeated material as a relationship rather than duplication.  
**Invariants:** acyclic source graph; placement does not overwrite source; count bounded by normalizer policy; differences require variation/ending records.  
**Transposition:** source and placed result transpose consistently.  
**Errors:** cycle, incompatible duration, silent edited copy.  
**Tests:** AT-006, AT-008.

Valid: repeat idea twice with second-ending variation.  
Invalid: duplicated events with a text annotation “repeat.”

### 8.4 `Variation`

```text
Variation {
  id: StableId;
  sourceRef: TypedMaterialRef;
  operations: VariationOperation[];
  label?: string;
  metadata?: CanonicalMetadata
}

VariationOperation =
  | { type: "replace-event"; targetEventRef: StableId; event: MusicalEvent }
  | { type: "suppress-event"; targetEventRef: StableId }
  | { type: "time-offset"; targetRef: TypedMaterialRef; offset: Rational }
  | { type: "transpose"; targetRef: TypedMaterialRef; interval: SemanticInterval }
  | { type: "set-field"; targetRef: TypedMaterialRef; field: approved overridable field; value: JSON value }
```

**Purpose:** explicit difference from known material.  
**Invariants:** operation order is canonical and deterministic; only allowlisted fields can be changed; operations retain source identity; no operation may change an object’s stable ID.  
**Transposition:** variation-level transpose composes semantically with document transposition; order is recorded.  
**Errors:** invalid target, conflicting operations, attempt to change ID or source semantics silently.  
**Provenance:** source, variation, and operation index recorded.

Valid: alternate ending replaces one final chord event.  
Invalid: arbitrary JSON Patch capable of deleting provenance.

## 9. Pedagogical hints

### 9.1 `PedagogicalHint`

```text
PedagogicalHint = FamiliarShapeHint | NamespacedHint

FamiliarShapeHint {
  id: StableId;
  type: "familiar-shape";
  source: "authored" | "generated";
  upperStructure: ChordAnalysis;
  bass: PitchClassValue;
  equivalence: "exact-pitch-class-set" | "voicing-subset" | "approximation";
  status?: "active" | "suppressed";
  suppressionReasons?: string[];
  metadata?: CanonicalMetadata
}
```

**Purpose:** optional subordinate learning overlay.  
**Invariants:** parent canonical harmony remains unchanged; bass explicit; equivalence classified; exact equivalence verified by pitch-class-set comparison; subset/approximation never labeled exact; generated hints are disabled unless explicitly requested and remain derived unless authored and saved.  
**Specificity:** hint presence is optional; hiding it changes no music.  
**Transposition:** upper structure and bass transpose through pitch strategy; equivalence is recomputed or revalidated.  
**Errors:** missing bass, false exact equivalence, essential alteration omitted, conflict with required voicing.  
**Tests:** AT-009, AT-010, E-006 examples.

Valid: `Am7` parent with exact-pitch-class-set `C/A` hint.  
Invalid: replacing parent harmony with `C/A` or claiming exact equivalence for a subset.

## 10. Provenance model

```text
ProvenanceStep {
  kind: "canonical" | "reference" | "pattern" | "override" | "repetition" |
        "variation" | "transposition" | "projection";
  sourceId: StableId;
  detail?: string;
  operationIndex?: integer
}

ProvenanceChain { steps: ProvenanceStep[] }
```

Canonical data stores declared source relationships; normalized data materializes the full chain. Chains are ordered, append-only, deterministic, and never replaced by a single “generated” flag.

Invalid provenance includes a normalized event with no canonical source ID or a variation that omits its source.

## 11. Normalized representation

`NormalizedArrangement` is not canonical input:

```text
NormalizedArrangement {
  formatVersion: string;
  canonicalDocumentId: StableId;
  canonicalSchemaVersion: string;
  arrangementId: StableId;
  keyContext?: KeyContext;
  extent: TimeSpan;
  measures: NormalizedMeasureCoordinate[];
  sections: NormalizedSection[];
  events: NormalizedEvent[];
  learningChunks: NormalizedLearningChunk[];
  diagnostics: Diagnostic[];
  inputHash: string;
  optionsHash: string
}

NormalizedEvent {
  derivedId: string;
  sourceEventId: StableId;
  start: Rational;
  duration: Rational;
  semanticEvent: MusicalEvent;
  roleIds: StableId[];
  handAssignments: ResolvedSpecificValue<HandName[]>[];
  provenance: ProvenanceChain
}
```

Normalization resolves references and expands reusable material but does not choose layout, labels, line breaks, or hidden defaults. Unknown and intentionally unspecified states remain exact discriminated values.

## 12. Reference and validation order

1. Parse JSON.
2. Validate schema version and JSON Schema.
3. Build ID index by type.
4. Validate typed references and uniqueness.
5. Validate rational time and arrangement extent.
6. Validate role/hand separation.
7. Validate chord, inversion, slash bass, voicing, and hints independently.
8. Detect repetition/pattern/variation cycles.
9. Validate lawful source records for corpus-marked documents.
10. Normalize only when no error-severity diagnostics remain.

## 13. Serialization and ordering

- UTF-8 JSON, no comments, no executable expressions.
- Canonical examples use two-space indentation.
- Object key order is not semantic, but normalized output and snapshots use a fixed serializer order.
- Arrays whose order is musical retain document order; set-like arrays are normalized by stable ID.
- Unknown extension fields are rejected unless under `metadata.extensions` with a valid namespace.

## 14. Rejected alternatives

- one opaque chord symbol string;
- MIDI-only pitch storage;
- nullable values for all specificity states;
- hand as a musical role;
- learning chunks owning copied music;
- duplicated canonical repeats;
- arbitrary JSON Patch for variations;
- renderer metadata in core event fields;
- generated familiar-shape hints stored as canonical by default;
- normalized output accepted as canonical input.

## 15. Requirement coverage

- R-004–R-014: document, identity, time, specificity, provenance, pitch envelope.
- R-015–R-019: chord analysis, inversion, slash bass, voicing.
- R-020–R-025: sections, ideas, patterns, transitions, lyrics.
- R-035–R-041: pedagogical hints.
- R-048–R-050: versioned machine-readable data and future adapter boundaries.
