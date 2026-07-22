# Rendering Pipeline

Status: Architecture Sprint 0 complete — proposed for review

## 1. Purpose

The rendering pipeline converts canonical semantic data into deterministic, accessible static HTML/SVG while preserving meaning, specificity, structural context, and provenance. Every stage is pure from the caller’s perspective and returns data plus diagnostics. Canonical input is never mutated.

Linked requirements: R-004, R-007, R-011–R-014, R-020–R-041, R-049.

## 2. Stage overview

```text
1. Load
2. Structural validation
3. Semantic validation
4. Reference resolution
5. Pattern/repetition/variation normalization
6. Optional semantic transposition
7. View projection
8. Layout preparation
9. Accessible HTML/SVG rendering
10. Diagnostic/provenance emission
```

Stages 1–5 produce the reusable normalized semantic timeline. Stages 7–9 are presentation derivations. Stage 6 may occur on canonical or normalized data, but Sprint 1 uses canonical transposition followed by a fresh normalization to prove semantic equivalence.

## 3. Shared stage contract

```text
PipelineContext {
  schemaRegistry;
  pitchRegistry;
  patternRegistry;
  options;
  inputIdentity;
}

StageResult<T> =
  | { ok: true; value: T; diagnostics: Diagnostic[]; metrics?: StageMetrics }
  | { ok: false; diagnostics: Diagnostic[]; partial?: DiagnosticOnlyArtifact }
```

- Stages do not print, write files, or terminate the process.
- Diagnostics are stable data structures.
- Error severity blocks the next semantic stage.
- Warning severity never authorizes a default or semantic repair.
- Inputs are treated as readonly and may be deep-frozen in tests.

## 4. Stage 1 — Canonical document load

**Owner:** `@mnls/model` with file adapter in `@mnls/cli`.  
**Input:** UTF-8 file bytes or already parsed JSON value.  
**Output:** parsed JSON plus source identity/hash.  
**Responsibilities:** reject invalid UTF-8, duplicate JSON keys where detectable, unsupported top-level media type, excessive input size, and non-JSON values.  
**Nonresponsibilities:** no schema repair, semantic inference, or migration.  
**Failure codes:** `LOAD_PARSE`, `LOAD_ENCODING`, `LOAD_SIZE`, `LOAD_DUPLICATE_KEY`.

The CLI resolves paths and prevents traversal. The model package never performs arbitrary file-system access.

## 5. Stage 2 — Structural validation

**Owner:** `@mnls/schema`.  
**Input:** parsed JSON.  
**Output:** branded structurally valid document.  
**Responsibilities:** schema version selection, JSON Schema 2020-12 validation, discriminated specificity unions, required fields, enums, numeric/rational shape, extension namespaces.  
**Failure behavior:** all practical schema errors are collected in deterministic JSON-pointer order.  
**Invariant:** no semantic validation rule exists only in TypeScript if JSON Schema can express it.

Unknown schema versions stop the pipeline with `SCHEMA_UNSUPPORTED_VERSION`; no silent migration occurs.

## 6. Stage 3 — Semantic validation

**Owner:** `@mnls/validator`.  
**Input:** structurally valid canonical document and registries.  
**Output:** validated immutable canonical document plus reference index.  
**Validation pass order:**

1. stable ID uniqueness and typed reference existence;
2. song/arrangement linkage;
3. rational time, measures, spans, and extent;
4. section, idea, transition, and learning-chunk relationships;
5. role and hand separation;
6. pitch strategy payload and capability validation;
7. harmony, inversion, slash bass, and voicing checks;
8. pattern definition/instance checks;
9. repetition/variation cycles and override targets;
10. lyric anchors;
11. familiar-shape hint classification and suppression rules;
12. corpus source-policy checks when corpus mode is enabled.

No pass changes data. A validator may recommend a correction in a diagnostic hint but cannot apply it.

## 7. Stage 4 — Reference resolution

**Owner:** `@mnls/normalizer`.  
**Input:** validated canonical document and arrangement ID.  
**Output:** immutable resolved graph with typed object handles and unresolved-data diagnostics absent.  
**Responsibilities:** resolve song, role, hand assignment, section, idea, event, pattern, repetition, variation, ending, transition, chunk, and lyric references.  
**Guarantees:**

- source object identity remains visible;
- resolution order does not depend on object-map iteration;
- cycles are reported with the complete stable-ID path;
- no repeated or pattern material is expanded yet.

## 8. Stage 5 — Normalization

**Owner:** `@mnls/normalizer`, delegating patterns to `@mnls/patterns`.  
**Input:** resolved graph and normalization options.  
**Output:** `NormalizedArrangement`.  
**Substages:**

1. establish deterministic arrangement extent and measure coordinates;
2. place direct events;
3. expand document-local and registered pattern instances;
4. place repetition references;
5. apply variations and alternate endings in canonical operation order;
6. resolve inherited role and hand assignments without changing either concept;
7. preserve all specificity wrappers;
8. sort events by start, duration, source order, and derived ID;
9. build full provenance chains;
10. calculate content hash, options hash, and normalized format version.

**Override precedence:** canonical direct event value < pattern parameter < pattern instance override < variation operation. A later layer may change only allowlisted fields and must add provenance. It may not change stable source IDs, erase unknown/unspecified states silently, or reinterpret harmony.

**Cycle/depth controls:** pattern/repetition graphs must be acyclic. Nested pattern expansion is permitted to a configurable technical limit; reaching the limit is an error, not truncation.

## 9. Stage 6 — Semantic transposition

**Owner:** `@mnls/transposition` and `@mnls/pitch`.  
**Input:** canonical or normalized document and semantic operation.  
**Output:** a new semantically transposed document plus diagnostics.  
**Operation examples:** interval, source key to target key, or strategy-supported mapping.  
**Rules:**

- transpose pitch values, chord roots, applicable alterations, slash bass, exact voicing pitches, note events, pattern pitch parameters, and familiar-shape hints;
- preserve IDs, time, form, roles, hands, repetitions, chunks, and structural relationships;
- recompute or revalidate exact hint equivalence;
- do not rewrite display labels;
- unsupported strategy capability is an error identifying the affected canonical ID.

**Metamorphic guarantee:** transpose then normalize must be semantically equivalent to normalize then transpose for constructs declaring commutativity. Any exception must be strategy-documented and covered by an ADR amendment.

## 10. Stage 7 — View projection

**Owner:** `@mnls/projection`.  
**Input:** normalized arrangement and `ViewSpec`.  
**Output:** `ProjectedView` retaining timing, structure, specificity, and provenance.  
**ViewSpec:**

```text
ViewSpec {
  kind: "full" | "harmonic-roadmap" | "role" | "hand" | "learning-chunk" | "excerpt";
  roleIds?: StableId[];
  hands?: HandName[];
  learningChunkIds?: StableId[];
  excerpt?: TimeSpan;
  includeHints?: boolean;
  disclosure?: DisclosureOptions;
}
```

Projection may hide detail but never change semantic values. It keeps enough section, idea, measure, and beat context for place-keeping. Hiding hints only removes hint nodes. Hand projection consults hand assignments; it never converts hand into role.

**Failure behavior:** invalid role/chunk IDs or empty contradictory filters produce `VIEW_*` diagnostics. A legitimately empty excerpt is a successful empty view with an informational diagnostic.

## 11. Stage 8 — Layout preparation

**Owner:** `@mnls/layout`.  
**Input:** projected view, layout options, and beat-presentation strategy.  
**Output:** renderer-neutral `LayoutPlan`.  
**Responsibilities:**

- create structural groups for sections/ideas/endings;
- create temporal grid cells from rational beats/subdivisions;
- allocate semantic lanes for harmony, bass, voicing, primary line, accompaniment, rhythm, lyrics, and annotations as required by the view;
- assign content priority for adaptive density;
- compute break opportunities and derived coordinates;
- expose repeated-family and variation relationships;
- create text alternatives and accessible reading order.

The layout package may calculate pixels, rows, columns, and break decisions only in the derived plan. It cannot add chord tones, infer voicing, generate hints by default, or alter specificity.

Beat presentation is strategy-based. Sprint 1 implements one explicit grid treatment and keeps at least one alternate strategy stub/test double for E-003 comparison; no final notation punctuation is selected.

## 12. Stage 9 — HTML/SVG rendering

**Owner:** `@mnls/renderer-html`.  
**Input:** layout plan and render options.  
**Output:** `RenderedBundle { html, css?, assets?, manifest }`.  
**Responsibilities:** deterministic safe serialization, semantic HTML structure, SVG geometry, text escaping, accessible names/descriptions, and renderer manifest.  
**Rules:**

- canonical harmony is visually and semantically primary;
- slash bass, inversion, and voicing are separate labeled nodes;
- specificity distinctions have noncolor text/shape/state markers;
- familiar-shape hints are subordinate and removable;
- lyrics are aligned through temporal anchors, not spaces;
- repeated material shares classes/data attributes and explicit source references;
- output contains canonical source IDs only as escaped data attributes or manifest entries;
- scripts are absent in Prototype 1 static output unless separately approved.

## 13. Stage 10 — Diagnostics and provenance output

The CLI can emit human text or JSON reports. Render output includes a manifest:

```text
RenderManifest {
  rendererVersion;
  layoutFormatVersion;
  normalizedFormatVersion;
  canonicalDocumentId;
  arrangementId;
  canonicalInputHash;
  optionsHash;
  viewSpec;
  diagnosticSummary;
  renderedNodeSources: { [renderNodeId]: ProvenanceChain }
}
```

This makes every visible derived node traceable without embedding the full canonical document into HTML.

## 14. Determinism controls

- rational arithmetic only for musical time;
- no current time, locale default, random ID, or filesystem-order dependency;
- locale and spelling context are explicit render options;
- stable serializer and key order;
- stable CSS class/token generation;
- font metrics are not used to make semantic choices;
- snapshots normalize platform-specific path separators and line endings.

## 15. Error recovery policy

- Load/schema/semantic errors stop normalization.
- Normalization errors stop projection/rendering.
- Projection errors stop layout.
- Layout/render warnings may still produce output if semantic meaning remains unambiguous.
- The renderer never substitutes a generic chord, root-position voicing, or guessed note for invalid/unknown data.
- In diagnostic-preview mode, invalid nodes may render as explicit error placeholders, never as plausible music.

## 16. Tests

| Pipeline concern | Required test |
|---|---|
| immutability | deep-freeze canonical input; all stages succeed without mutation |
| specificity | five states survive normalize, transpose, project, render manifest |
| provenance | direct, pattern, override, repeat, variation, and transpose chains |
| determinism | repeated runs produce byte-identical normalized JSON and HTML |
| semantic separation | inversion, slash bass, and voicing independently absent/present |
| hint safety | canonical harmony unchanged with hints shown/hidden/suppressed |
| escaping | malicious lyric/title text appears as text, never markup/script |
| accessibility | DOM has names, logical order, noncolor state text, valid IDs |
| timing | syncopated and multi-chord measure aligns without whitespace |
| transposition | AT-008 invariants and strategy capability failures |

## 17. Rejected alternatives

- direct canonical-to-HTML rendering;
- renderer-side reference and pattern expansion;
- normalization that overwrites source IDs;
- layout metadata stored back into canonical JSON;
- string-based transposition;
- warning-based fallback to guessed voicing;
- generated hints inserted during normalization without explicit option;
- whitespace as beat or lyric alignment.
