# Learning Transformations

Status: Architecture Sprint 0.1 Product Owner amendments complete — proposed for approval
Architecture baseline: 0.2  
Applies to: Prototype 1

## 1. Purpose and ownership

A learning transformation is a reusable, versioned, deterministic pedagogical strategy applied to a validated arrangement. It produces a derived `LearningPlan`. Learning chunks belong to that plan, not to the canonical arrangement.

The learning package owns transformation definitions, execution, plan validation, deterministic IDs, provenance, overrides, and verified-plan capability analysis. It consumes neutral arrangement capability contracts from `@mnls/capabilities`; it does not import workbench orchestration. The canonical model owns only the musical material and stable references that plans target.

This boundary implements R-010, R-030, R-042, R-054–R-055, D-026, and Architecture Sprint 0.1 handoff §4 without choosing a default learning strategy.

## 2. Data flow

```text
Canonical Arrangement
  -> validation and normalization
  -> ArrangementCapabilityProfile
  + LearningTransformationDefinition
  + transformation parameters
  -> compatibility validation
  -> deterministic transformation execution
  -> LearningPlan
  -> optional plan-local overrides
  -> verify against arrangement ID/hash and deterministic regeneration
  -> LearningPlanCapabilityProfile
  -> learning-plan view projection
```

The arrangement remains byte-identical. Regeneration may replace the plan because the plan is derived and versioned.

## 3. `LearningTransformationDefinition`

```text
LearningTransformationDefinition {
  formatVersion: string;
  id: string;
  version: string;
  name: string;
  status: "experimental" | "comparison" | "internal";
  supportedArrangementCapabilities: CapabilityRequirement[];
  parameterSchemaRef: string;
  implementationRef: {
    transformationId: string;
    transformationVersion: string;
  };
  ruleConfiguration?: JSONValue;
  outputContractVersion: string;
  metadata?: TransformationMetadata;
}
```

`implementationRef` selects a compiled, registered transformation primitive. `ruleConfiguration` and runtime parameters are declarative data validated against schemas. They may compose an approved finite rule vocabulary but may not contain executable code.

A fundamentally new transformation primitive requires implementation. Reapplying or reconfiguring an existing primitive does not.

## 4. Transformation registry

```text
LearningTransformationDescriptor {
  id: string;
  version: string;
  optionSchemaRef: string;
  requiresCapabilities: CapabilityRequirement[];
  providesPlanCapabilities: CapabilityDeclaration[];
  deterministic: true;
}

LearningTransformationRegistry {
  list(): LearningTransformationDescriptor[];
  resolve(id, version): RegisteredLearningTransformation | Diagnostic;
}
```

Registry rules match representation strategies: immutable versions, unique IDs, conformance tests, deterministic registration, and no runtime arbitrary-code loading in Prototype 1.

### 4.1 Capability dependency and ownership

`LearningTransformationDescriptor.requiresCapabilities` may reference only arrangement capability requirements when generating a plan. These contracts come from `@mnls/capabilities`. The learning engine neither computes canonical arrangement capabilities nor depends on `@mnls/workbench`.

After plan generation and verification, learning computes a separate `LearningPlanCapabilityProfile` containing evidence such as:

- `learning-plan.valid`;
- `learning-plan.matches-arrangement`;
- `learning-plan.has-chunks`;
- `learning-plan.has-role-filters`;
- `learning-plan.has-hand-filters`;
- `learning-plan.has-prerequisites`;
- `learning-plan.has-transition-practice`.

Each evidence item cites the verified plan hash, matching arrangement hash, and stable chunk/relationship references. An unverified or stale plan cannot provide capabilities.

## 5. `LearningPlan`

```text
LearningPlan {
  formatVersion: string;
  id: string;
  arrangementRef: VersionedContentRef;
  normalizedArrangementHash: string;
  transformationRef: VersionedContentRef;
  transformationParameters: JSONValue;
  chunks: LearningChunk[];
  relationships: LearningRelationship[];
  overrides?: LearningPlanOverride[];
  provenance: LearningPlanProvenance;
  diagnostics: Diagnostic[];
  planHash: string;
}
```

A plan is persisted as a reproducible derived artifact. It is never accepted as canonical music input. It may be discarded and regenerated.

### Invariants

- exactly one canonical arrangement is referenced;
- arrangement and transformation content hashes are pinned;
- chunks contain references/queries/spans, never copied canonical events;
- every chunk resolves to at least one canonical target unless explicitly suppressed by a plan override;
- relationships reference chunk IDs in the same plan;
- output order and IDs are deterministic;
- transformation parameters are fully materialized after schema defaults;
- unknown and intentionally unspecified canonical states remain unchanged in projected content.

## 6. `LearningChunk`

```text
LearningChunk {
  id: string;
  label?: string;
  selectors: LearningContentSelector[];
  roleFilter?: StableId[];
  handFilter?: SpecificValue<HandName[]>;
  practiceIntent?: string[];
  provenance: LearningChunkProvenance;
  metadata?: DerivedMetadata;
}

LearningContentSelector =
  | { type: "canonical-ref"; ref: TypedCanonicalRef }
  | { type: "time-span"; span: TimeSpan }
  | { type: "role-in-span"; roleRefs: StableId[]; span: TimeSpan }
  | { type: "hand-in-span"; hands: HandName[]; span: TimeSpan }
  | { type: "approved-query-result"; queryRef: string; resolvedRefs: TypedCanonicalRef[] }
```

`approved-query-result` stores the deterministic resolved references and the query definition/version in provenance. It does not execute an open-ended query language at render time.

### Invariants

- selectors reference canonical IDs or canonical time spans;
- no event payload, chord analysis, note pitch, lyric text, or arrangement structure is copied into a chunk as authority;
- role and hand filters restrict practice projection only;
- unknown hand assignment cannot become left or right through a filter;
- chunks may cross measures or sections;
- chunk boundaries do not become musical form boundaries.

### Transposition

Chunks do not transpose. Their canonical references and rational spans remain stable. When applied to a transposed derived arrangement, the selected musical content transposes through the normal semantic transposition pipeline.

## 7. Learning relationships

```text
LearningRelationship =
  | { type: "precedes"; fromChunkId: string; toChunkId: string }
  | { type: "prerequisite"; fromChunkId: string; toChunkId: string }
  | { type: "recombine"; sourceChunkIds: string[]; targetChunkId: string }
  | { type: "transition-practice"; transitionRef: StableId; chunkId: string }
  | { type: "alternate-treatment"; chunkIds: string[] }
```

Relationships describe a derived practice plan. They do not alter canonical sequence, section order, repetition, or transitions. Prerequisite and precedes graphs must be acyclic unless a future approved cyclic-practice relationship type is added.

## 8. Plan-local overrides

```text
LearningPlanOverride {
  id: string;
  targetChunkId: string;
  operation:
    | { type: "suppress" }
    | { type: "replace-label"; label: string }
    | { type: "set-filter"; roleFilter?: StableId[]; handFilter?: SpecificValue<HandName[]> }
    | { type: "split"; selectors: LearningContentSelector[][] }
    | { type: "merge"; sourceChunkIds: string[] };
  reason: string;
}
```

Overrides are applied after deterministic transformation output in lexical override-ID order. They preserve the original generated plan and transformation provenance in the resulting plan manifest. They cannot edit canonical fields or embed musical events.

## 9. Provenance

```text
LearningPlanProvenance {
  arrangementId: StableId;
  arrangementHash: string;
  normalizedHash: string;
  transformationId: string;
  transformationVersion: string;
  definitionHash: string;
  parameterHash: string;
  executorVersion: string;
}

LearningChunkProvenance {
  transformationRef: VersionedContentRef;
  ruleId: string;
  sourceRefs: TypedCanonicalRef[];
  sourceSpans: TimeSpan[];
  overrideRefs?: string[];
}
```

Derived chunk IDs are deterministic from plan ID, transformation version, rule ID, and a canonicalized selector set. Random IDs are prohibited during generation.

## 10. Sprint 1 reusable transformation

Sprint 1 implements one experimental transformation primitive:

### `mnls.learning.idea-boundary@1`

**Purpose:** produce one chunk for each selected canonical `MusicalIdea`, optionally filtered by role kind.

```text
parameters {
  includedRoleKinds?: MusicalRoleKind[];
  includeTransitions: boolean = false;
  order: "canonical-time" = "canonical-time";
}
```

**Requirements:** arrangement capability `structure.musical-ideas` is present; every selected idea has a valid span or content references.

**Output:** chunks with canonical-ref and/or time-span selectors, ordered by start time then stable ID. When `includeTransitions` is true, explicitly referenced transitions may become separate chunks; this option remains experimental and is not enabled in the Sprint 1 proof.

**Why this transformation:** it proves reusable derived-plan ownership with minimal new vocabulary. It does not claim that musical-idea boundaries are the best learning boundaries.

**Sprint 1 proof:** apply the same pinned definition and parameters to the melody fixture and the beat-aligned harmony fixture. No fixture-specific transformation code is permitted.

## 11. Compatibility and diagnostics

A transformation may be:

- `supported`;
- `supported-with-limitations`;
- `incompatible`;
- `unavailable`.

Examples:

- phrase-boundary transformation with no phrase metadata: incompatible;
- hand-separated transformation with partial assignments: limitation only when the plan is allowed to preserve/display unknown assignments; otherwise incompatible;
- role-first transformation with no requested role events: supported with a diagnostic and zero chunks only when the definition explicitly permits empty output;
- pinned transformation implementation missing: unavailable.

Diagnostic families:

- `LEARN_TRANSFORM_NOT_FOUND`;
- `LEARN_PARAMETER_INVALID`;
- `LEARN_CAPABILITY_MISSING`;
- `LEARN_EMPTY_PLAN`;
- `LEARN_SELECTOR_INVALID`;
- `LEARN_RELATIONSHIP_CYCLE`;
- `LEARN_CANONICAL_COPY_FORBIDDEN`;
- `LEARN_OVERRIDE_CONFLICT`;
- `LEARN_REGENERATION_MISMATCH`.

## 12. Serialization and commands

```text
learning/
  transformations/*.learning-transform.json
  plans/*.learning-plan.json          # generated or reviewed derived artifacts
  expected/*.learning-plan.json
```

CLI:

```text
music learning strategy list
music learning validate <definition.json>
music learning plan <arrangement.json> --transformation <definition.json> --out <plan.json>
music learning verify <plan.json> --arrangement <arrangement.json>
music learning capabilities <verified-plan.json> --arrangement <arrangement.json>
```

The output plan contains resolved parameter values and hashes. `verify` fails on hash mismatch, stale references, copied canonical payloads, or output that differs from deterministic regeneration.

## 13. Tests

Every transformation primitive requires:

1. descriptor and option-schema tests;
2. compatible and incompatible capability cases;
3. deterministic output and derived-ID tests;
4. no canonical mutation test using deep freeze/content hash;
5. no copied canonical-event payload test;
6. canonical-reference resolution test;
7. specificity preservation in projected content;
8. transposition invariance of selectors/relationships;
9. override precedence and provenance tests;
10. application to at least two arrangements before promotion beyond local experiment status;
11. stale arrangement-hash rejection;
12. plan capabilities cannot forge canonical capabilities;
13. the same verified plan can support multiple recipes without changing arrangement capability output;
14. every plan capability includes authoritative plan/arrangement hashes and evidence refs.

Sprint 1 specifically asserts that `idea-boundary@1` with identical parameters generates valid plans for two fixtures and produces structured diagnostics for a fixture without musical ideas.

## 14. Rejected alternatives

- storing learning chunks inside `Arrangement`;
- transformation code specialized to a fixture ID;
- copying note/chord events into a plan;
- allowing a plan to overwrite hand assignments or specificity;
- unversioned learner-strategy names;
- arbitrary scripting inside transformation JSON;
- silently using measures as chunks when transformation requirements are unmet;
- presenting `idea-boundary@1` as the approved learning method.
