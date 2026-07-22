# Architecture Decision Records

Status: Architecture Sprint 0 complete — proposed for review

These ADRs make technical decisions only. Product meaning remains governed by the Constitution, approved product decisions, requirements, acceptance tests, and experiments.

---

# ADR-001 — Layered npm workspace packages

Status: Accepted for Prototype 1 architecture

## Context

The system must preserve experimental boundaries, prevent renderer ownership of semantics, and allow a separate implementation agent to work in order.

## Decision

Use npm workspaces with separate packages for schema, model, pitch, validator, patterns, normalizer, transposition, projection, layout, HTML renderer, corpus tools, CLI, and test fixtures. Dependencies follow the direction documented in `RepositoryStructure.md`; circular dependencies are prohibited.

## Consequences

Package boundaries make semantic ownership enforceable and allow future renderer/interchange adapters. The cost is additional package configuration and explicit public APIs.

## Alternatives considered

- Single package: rejected because boundaries would be conventions only.
- Package per canonical type: rejected as over-fragmented.
- Renderer/model combined: rejected because presentation would control semantics.

## Requirements served

R-004, R-009–R-010, R-026–R-034, R-047–R-050.

## Assumptions introduced

A-001 and A-002 remain isolated in renderer packages; no permanent browser-only semantic dependency is introduced.

---

# ADR-002 — JSON Schema 2020-12 is structural source of truth

Status: Accepted

## Context

Canonical JSON must be versioned, interoperable, and independently validatable. TypeScript types alone do not validate external data.

## Decision

Versioned JSON Schema 2020-12 files define serialized structure. TypeScript types are generated or mechanically checked against the schemas. Semantic rules that cannot be expressed structurally live in ordered validators with stable diagnostic codes.

## Consequences

External tools can validate documents without executing the application. Schema/type drift becomes a build failure. Semantic validation remains a separate necessary stage.

## Alternatives considered

- Generate schema from handwritten TypeScript: rejected because the approved source of truth would be reversed.
- Runtime TypeScript validator as sole authority: rejected for interoperability.
- Put semantic repair/defaults in schema: rejected because omission states and musical rules would be obscured.

## Requirements served

R-004, R-007, R-048, R-050.

## Assumptions introduced

A-007 remains open regarding authoring burden; JSON serialization is not final authoring syntax.

---

# ADR-003 — Canonical graph and disposable normalized timeline

Status: Accepted

## Context

Canonical data must preserve reusable ideas, patterns, repetitions, variations, and provenance, while rendering needs a deterministic temporal sequence.

## Decision

Persist a reference-rich canonical semantic graph. Derive an immutable `NormalizedArrangement` that resolves references and materializes a deterministic timeline with full provenance. Normalized data has a separate format version, is cacheable/disposable, and is never accepted as canonical input.

## Consequences

The canonical model preserves repetition as repetition and remains renderer-independent. Normalization adds complexity and requires careful cycle detection and provenance tests.

## Alternatives considered

- Flat canonical event list: rejected because shared source and variation provenance would be lost.
- Renderer performs expansion: rejected because different views could disagree semantically.
- Persist normalized output as authority: rejected because experiments and source relationships would harden.

## Requirements served

R-004–R-005, R-010, R-013–R-014, R-020–R-024, R-034.

## Assumptions introduced

None beyond technical cacheability; normalized output remains optional.

---

# ADR-004 — Strategy-tagged semantic pitch envelope

Status: Accepted as an experimental boundary, not a product decision

## Context

D-015 and E-001 require comparison of absolute, key-relative, chord-relative, and hybrid pitch strategies. Transposition must operate semantically, not on rendered labels.

## Decision

Canonical pitch values use a stable envelope containing strategy ID, strategy version, and strategy-validated semantic payload. `PitchStrategy` supplies validation, kind checking, transposition, pitch-class comparison, and formatting capabilities. Sprint 1 implements `spelled-pitch@1` plus a test strategy to prove replacement.

## Consequences

Pitch experiments remain replaceable and third-party libraries remain internal. Documents must pin strategy versions, and unsupported operations can produce explicit diagnostics.

## Alternatives considered

- MIDI numbers everywhere: rejected because spelling and relative experiments would be constrained.
- Rendered note-name strings: rejected because transposition would become string rewriting.
- One large union of all future pitch models: rejected because adding experiments would change core types continually.

## Requirements served

R-006, R-014–R-015, R-018, R-040, R-048, R-050.

## Assumptions introduced

A-008 remains open; any music library is wrapped and cannot define domain semantics.

---

# ADR-005 — Stable IDs and append-only provenance chains

Status: Accepted

## Context

Every derived event must trace to canonical sources through pattern, override, repetition, variation, and transposition steps.

## Decision

All referenceable canonical entities use stable human-readable IDs. Derived IDs are deterministic. Normalized events carry ordered append-only provenance chains beginning with canonical IDs. Random IDs are prohibited in normalization/rendering.

## Consequences

Debugging, traceability, repeat recognition, and regression analysis become reliable. Authors must maintain ID stability, and migrations must preserve or explicitly map IDs.

## Alternatives considered

- Array indexes as references: rejected because edits would break identity.
- Random UUIDs during derivation: rejected because output would not be deterministic.
- Single source ID on derived events: rejected because intermediate overrides and variations would disappear.

## Requirements served

R-013–R-014, R-020–R-024, R-034, R-043.

## Assumptions introduced

None.

---

# ADR-006 — Projection, layout, and renderer are separate boundaries

Status: Accepted

## Context

The renderer must support several views and adaptive density without becoming a semantic source of truth. Canonical data cannot contain pixels or line breaks.

## Decision

Use three stages: semantic `ViewProjection`, renderer-neutral `LayoutPlan`, and safe HTML/SVG serialization. Only `LayoutPlan` may contain derived geometry and break decisions. Beat presentation is a replaceable layout strategy.

## Consequences

Views remain semantically consistent and future renderers can reuse earlier stages. The pipeline has more explicit data contracts and test layers.

## Alternatives considered

- Canonical-to-HTML renderer: rejected because filtering, expansion, and layout would entangle.
- Store layout hints as required canonical fields: rejected because presentation would become authority.
- One renderer-specific scene graph as normalized data: rejected because future renderers would inherit HTML assumptions.

## Requirements served

R-004, R-011–R-012, R-026–R-034, R-039, R-049.

## Assumptions introduced

A-001 and A-002 are confirmed only for Prototype 1 delivery; the projection/layout contracts remain portable.

---

# ADR-007 — Structured diagnostics and result-returning stages

Status: Accepted

## Context

Manual corpus encoding and experiments require human-readable errors, stable automation, and no guessed repair.

## Decision

Every pipeline stage returns a typed success/failure result with structured diagnostics containing code, severity, stage, message, JSON pointer, canonical IDs, related IDs, and requirement IDs where applicable. Expected user-data errors do not throw exceptions. The CLI alone formats and prints diagnostics.

## Consequences

Tests can assert exact failure meaning; JSON and human reports share one source. Stage APIs are more verbose and must aggregate diagnostics deterministically.

## Alternatives considered

- Throw on first error: rejected because authors need complete actionable feedback.
- Free-form logging: rejected because automation and traceability would be weak.
- Automatic repair: rejected because it could invent musical certainty.

## Requirements served

R-007, R-019, R-023, R-035–R-041, R-043, R-048.

## Assumptions introduced

None.

---

# ADR-008 — Explicit semantic-version migrations

Status: Accepted

## Context

Canonical data is long-lived while the model will evolve through experiments. Silent upgrades could change meaning.

## Decision

Canonical documents declare semantic schema versions. Migrations are pure, explicit, sequential functions that emit migration reports and ID maps. `validate` never migrates silently. Normalized/layout/render formats version independently and are not migration sources.

## Consequences

Meaning changes are reviewable and old fixtures remain reproducible. The implementation must maintain migration tests once a second version exists.

## Alternatives considered

- Always accept latest loose shape: rejected because meaning becomes ambiguous.
- In-place mutation during load: rejected because original data and provenance would be lost.
- Migrate normalized output: rejected because normalized data is disposable.

## Requirements served

R-004, R-013, R-048, R-050.

## Assumptions introduced

A-003 and A-007 remain open; migration supports later authoring tools and serialization changes.

---

# ADR-009 — Patterns expand to semantic events before projection

Status: Accepted

## Context

Patterns must represent musical behavior, support overrides and provenance, and remain consistent across views and transposition.

## Decision

Pattern definitions emit typed relative semantic event templates. Expansion occurs in normalization before view projection. Built-in and document-local definitions share one versioned contract. Nested composition is allowed only when acyclic and pinned. Overrides target stable template IDs and are allowlisted.

## Consequences

All views consume the same semantic expansion, and pattern/transposition behavior is testable. Expansion can increase derived data size and requires cycle/depth controls.

## Alternatives considered

- Renderer shorthand: rejected because views could interpret patterns differently.
- Executable callbacks in canonical JSON: rejected for portability and security.
- Expand during load and discard source: rejected because provenance and experimentation would be lost.

## Requirements served

R-005, R-013–R-014, R-022–R-023, R-028–R-034, R-043.

## Assumptions introduced

A deliberately small shared pattern library is used; admission remains a Product Owner decision under E-005.

---

# ADR-010 — Familiar-shape hints are validated subordinate overlays

Status: Accepted

## Context

Approved hints may help learning but must not replace canonical harmony or misteach bass, inversion, alterations, omissions, or function.

## Decision

Authored familiar-shape hints are optional canonical pedagogical metadata attached to a chord event. They include explicit bass, equivalence classification, and source. A semantic validator verifies exact pitch-class equivalence or labels subset/approximation accurately. Projection may hide hints. Generated hints remain derived, disabled by default, deterministic when requested, and suppressible.

## Consequences

`Am7` can retain canonical analysis while showing `C/A` as an exact subordinate hint. Hint validation requires pitch-class-set capability and must consider required voicing/alterations.

## Alternatives considered

- Replace canonical chord with hint: rejected by D-021 and R-036.
- Store hint as unclassified free text: rejected because misleading equivalence could not be detected.
- Generate hints in renderer by default: rejected because E-006 remains experimental.

## Requirements served

R-035–R-041, AT-009, AT-010.

## Assumptions introduced

A-005 remains open. Hints cannot become default learner-facing output without Product Owner approval.
