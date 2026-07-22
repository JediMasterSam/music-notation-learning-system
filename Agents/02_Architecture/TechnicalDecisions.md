# Architecture Decision Records

Status: Architecture Sprint 0.1 Product Owner amendments complete — proposed for approval

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


---

# ADR-011 — Learning chunks belong to derived learning plans

Status: Accepted

## Context

The Sprint 0 model allowed learning chunks to be represented alongside arrangement content. Product Owner direction now clarifies that a learner's practice decomposition must be generated by reusable transformations and must not be owned by the canonical arrangement.

## Decision

Remove learning-chunk ownership from `Arrangement`. Introduce versioned `LearningTransformationDefinition` artifacts executed by a registered deterministic learning engine to produce a derived, independently versioned `LearningPlan`. `LearningChunk` exists only inside a plan and references canonical IDs, exact time spans, roles, hands, or approved deterministic query results. Plans may contain practice relationships and plan-local overrides, but they may not copy or mutate canonical musical events.

## Consequences

One transformation can be applied to multiple compatible arrangements. Plans can be regenerated and compared without changing music. Existing Sprint 0 canonical fixtures containing `learningChunks` must migrate by extracting those chunks into an explicit derived plan; the canonical schema 0.1.0 implementation must never ship the obsolete arrangement field.

The learning engine needs capability checks, plan provenance, deterministic IDs, override precedence, no-copy validation, and plan verification.

## Alternatives considered

- Keep chunks in `Arrangement`: rejected because arrangement would own learner-specific pedagogy.
- Store copied event excerpts in a plan: rejected because plans would become shadow arrangements.
- Treat chunks as renderer bookmarks only: rejected because practice relationships and reusable transformations require a first-class derived contract.

## Requirements served

R-010, R-030, R-042; Architecture Sprint 0.1 handoff §4.

## Assumptions introduced

No learning transformation is a product default. Sprint 1's `idea-boundary@1` is an experimental implementation used only to prove the boundary.

---

# ADR-012 — Representation treatments are declarative versioned recipes

Status: Accepted

## Context

Prototype 1 must allow existing representational primitives to be recombined without TypeScript source-code changes and without storing treatment-specific music.

## Decision

Introduce `RepresentationRecipe` as versioned declarative JSON. A recipe pins strategy IDs/versions and validates options for time mapping, pitch mapping, duration encoding, labels, semantic overlays, disclosure, accessibility, and renderer selection. Recipes contain no musical events, executable code, raw markup, or final coordinates. Resolution materializes option defaults and produces a hashed `ResolvedRecipe`.

## Consequences

The Product Owner can save, load, and compare treatments through data. Strategy implementations still require code and conformance review, while recombination does not. Recipe schemas and migrations become independent versioned artifacts. Outputs must identify recipe and strategy versions.

## Alternatives considered

- Hard-coded renderer modes: rejected because each experiment would require source edits.
- Store recipes inside arrangements: rejected because presentation would contaminate canonical music.
- Free-form JavaScript configuration: rejected for security, determinism, and portability.

## Requirements served

R-004, R-026–R-034, R-039, R-047–R-049; handoff §§3, 5, 8.

## Assumptions introduced

JSON is the Sprint 1 configuration serialization, not a final authoring language or learner interface.

---

# ADR-013 — Strategies use evidence-backed capability and compatibility contracts

Status: Superseded by ADR-017

## Context

Broad recipe configurability can request combinations that are unavailable, incomplete, or musically misleading. Silent approximation would violate canonical authority and specificity rules.

## Decision

Every representation strategy and learning transformation publishes a versioned descriptor containing kind, option schema, required arrangement/strategy capabilities, provided capabilities, conflicts, limitations, and deterministic status. Capabilities are computed from validated canonical/normalized semantics and include evidence references. Compatibility returns exactly one of `supported`, `supported-with-limitations`, `incompatible`, or `unavailable`. Rendering/planning stops on incompatibility, unavailable versions, or unacknowledged limitations; there is no strategy fallback.

## Consequences

The architecture requires a strategy catalog, capability analyzer, compatibility diagnostics, conformance suites, and visible limitation reporting. Recipes remain broad without creating false meaning.

## Alternatives considered

- Let each renderer improvise: rejected because behavior would diverge and become untestable.
- Boolean compatible/incompatible only: rejected because truthful partial treatments need explicit limitations.
- Author-declared capability flags in recipes: rejected because configuration cannot create evidence.

## Requirements served

R-007, R-019, R-026–R-034, R-039–R-040, R-047–R-050; handoff §9.

## Assumptions introduced

The initial capability vocabulary is architecture-internal and may grow compatibly. A capability that becomes learner-facing terminology requires Product Owner review.

---

# ADR-014 — Sprint 1 uses a headless workbench with CLI and static comparison output

Status: Accepted

## Context

The prior static-only assumption is too narrow for the full workbench, but Sprint 1 must remain the smallest credible vertical slice. The Product Owner must configure experiments without editing TypeScript.

## Decision

Implement a headless `workbench` package, declarative recipe/experiment files, CLI discovery/validation/run commands, and a generated deterministic static comparison page in Sprint 1. Defer live browser controls to a later `workbench-web` adapter that consumes the same schemas and public APIs. The browser adapter may not own musical semantics or configuration formats.

## Consequences

Sprint 1 proves configuration, compatibility, reproducibility, and browser review without UI-state complexity. The full Prototype 1 architecture remains interactive-capable; static generation is confirmed only for the Sprint 1 proof.

## Alternatives considered

- Build a live editor first: rejected as avoidable scope before contracts are proven.
- CLI flags only with no saved recipes: rejected because treatments would not be versioned/reproducible.
- Continue static renderer with source-code options: rejected because it fails the workbench objective.

## Requirements served

R-047–R-049; handoff §§3.3, 8, 11.

## Assumptions introduced

The Product Owner is willing to edit or generate JSON recipe files during Sprint 1. Usability of this interaction is to be evaluated before deciding the next UI increment.

---

# ADR-015 — Experiment definitions and immutable run manifests are separate artifacts

Status: Accepted

## Context

Comparisons must record inputs, changed/controlled variables, treatment versions, tasks, and observations without confusing software reproducibility with evidence of learning benefit.

## Decision

Persist versioned `ExperimentDefinition` JSON separately from immutable generated `ExperimentRunManifest` JSON. Definitions reference fixtures, recipes, optional learning transformations, research question, controlled/changed variables, tasks, observation definitions, and status. Run manifests pin content hashes, resolved options, strategy/transformation/tool versions, diagnostics, and output hashes. Human observation records reference a run hash and remain separate from automated results.

## Consequences

Treatment outputs can be reproduced exactly and compared responsibly. Experiment definitions can evolve without rewriting past run evidence. The repository needs experiment schema, resolver, runner, manifest verification, and observation-directory policy.

## Alternatives considered

- Put experiment metadata only in README prose: rejected because reproduction is not machine-verifiable.
- Store observations inside run manifests: rejected because software execution and human evidence have different authority.
- Re-resolve latest recipe versions on rerun: rejected because past treatment identity would change.

## Requirements served

R-043, R-046, R-048–R-049; handoff §§3.5, 7.

## Assumptions introduced

Sprint 1 records experiment tasks/observation fields but does not implement a human-study data collection UI.

---

# ADR-016 — Sprint 1 implements two functional melody treatments from one source

Status: Accepted

## Context

Architecture support alone would not prove that independent time, duration, and pitch strategies can produce materially different representations from the same canonical music.

## Decision

Sprint 1 implements two complete recipes and their required strategies against one canonical melody fixture:

1. `explicit-grid@1`: fixed beat/subdivision cells, exact grid-span duration, absolute chromatic vertical mapping, exact pitch labels.
2. `proportional-spatial-melody@1`: proportional onset, proportional duration extent, the same absolute chromatic vertical mapping, exact pitch labels/accessibility text.

Both use the same normalized/projection source. Equal pitch must map to equal y; larger intervals to larger vertical displacement; duration is readable from horizontal extent in the spatial treatment. Neither treatment is a default or final notation.

Harmony, repetition, voicing, specificity, and familiar-shape risks remain protected through canonical/normalization/projection contract fixtures and tests. Full rendering breadth moves to Sprint 2 unless Sprint 1 workbench exit criteria already pass.

## Consequences

Sprint 1 scope shifts from broad renderer feature coverage toward the workbench's architecture-risk proof while retaining semantic regression gates. Layout must expose independent strategy interfaces and mathematical invariant tests.

## Alternatives considered

- Implement only descriptors/stubs: rejected because the spatial hypothesis would not be exercised.
- Use separate canonical fixtures for each treatment: rejected because that would not prove derived presentation.
- Keep all prior functional renderer requirements in Sprint 1: rejected because it would obscure the smallest credible workbench proof and increase delivery risk.

## Requirements served

R-004, R-006, R-011, R-014, R-026, R-031–R-033, R-043, R-047–R-050; handoff §§6 and 11.

## Assumptions introduced

Absolute chromatic y mapping is a comparison implementation for Sprint 1, not an approved pitch presentation. Staff-like, diatonic, relative, and contour mappings remain replaceable future strategies.

## Product Owner amendment note

E-007 holds `mnls.pitch.absolute-chromatic-y@1`, canonical source, labels, accessibility data, and renderer environment constant. It compares horizontal time mapping, duration encoding, and temporal reference treatment. A separate future E-008 compares pitch mappings while holding time/duration treatment constant.

---

# ADR-017 — Capability evidence is artifact-scoped and composed through neutral contracts

Status: Accepted

## Context

ADR-013 correctly required evidence-backed compatibility but allowed `ArrangementCapabilityProfile` to contemplate learning-plan availability and placed capability contracts under workbench ownership. That conflicts with derived-plan ownership and creates a dependency from learning into experiment orchestration.

## Decision

Create dependency-neutral `@mnls/capabilities` contracts and separate analyzers. `ArrangementCapabilityProfile` contains only validated arrangement/normalized evidence. `LearningPlanCapabilityProfile` is produced only after plan verification and pins plan and arrangement hashes. Renderer and environment profiles remain separate. `CompatibilityInput` composes these profiles with selected strategy descriptors and limitation policy. A learning overlay without a verified matching plan is incompatible. Recipes cannot author capability evidence.

Add `@mnls/capability-analysis` for arrangement, renderer, and environment analyzers. `@mnls/learning` consumes neutral arrangement requirements and produces verified-plan profiles; it does not import `@mnls/workbench`. ADR-013 is superseded; ADR-001 is explicitly amended by the additional neutral packages.

## Consequences

Capability ownership is truthful, dependency direction remains inward, stale plan hashes are rejected, deleting plans cannot change arrangement analysis, and diagnostics can name the authoritative evidence source. More profile types may be added only when they represent a genuinely separate authority.

## Alternatives considered

- Keep `learning-plan.available` on arrangements: rejected because an arrangement cannot own plan existence.
- Let recipes declare capabilities: rejected because configuration cannot create evidence.
- Keep contracts in workbench behind an interface: rejected because it still makes learning depend on orchestration ownership.
- Flatten every fact into one profile: rejected because authority and stale-hash validation become ambiguous.

## Requirements and decisions served

R-004, R-007, R-010, R-019, R-030, R-039–R-040, R-052–R-055, R-057; D-002, D-012, D-026–D-027.

## Assumptions introduced

The capability vocabulary remains architecture-internal. A capability becoming learner-facing terminology requires Product Owner review.

---

# ADR-018 — Chord quality uses a controlled vocabulary and free-form harmonic analysis is annotation-only

Status: Accepted

## Context

Unrestricted canonical `quality`, `function`, and `romanNumeral` strings cannot be reliably validated, compared, transposed, or reasoned about. They would recreate opaque rendered labels as accidental musical authority immediately before schema `0.1.0` implementation.

## Decision

Replace `quality: string` with `ChordQualityRef { vocabularyId, vocabularyVersion, qualityId }`. `@mnls/harmony` owns immutable registered vocabularies, semantic resolution, aliases, fixture-required pitch-class meaning, and derived display labels. Unknown references fail; aliases cannot be stored as semantic IDs; new shared qualities follow vocabulary/corpus governance.

Defer harmonic function and Roman-numeral semantics. Free-form material is allowed only as `HarmonicAnalysisAnnotation` with `authority: "annotation"`. Annotation text, system identifiers, and tags are non-authoritative and cannot affect validation, transposition, compatibility, learning transformations, projection selection, layout, or strategy branching. Sprint 1 does not render them.

## Consequences

Canonical chord quality is testable and extensible without arbitrary text becoming authority. A future typed functional-analysis model requires a new product decision, requirements, and ADR rather than reinterpretation of annotation strings.

## Alternatives considered

- Enumerate all qualities directly in the canonical schema: rejected because extension requires schema churn and aliases remain ambiguous.
- Preserve strings with a naming convention: rejected because conventions are not enforceable semantic identity.
- Implement partial Roman-numeral semantics now: rejected because key context, scale degree, alterations, applied targets, inversion, system/version, validation, and transposition would be incomplete.

## Requirements and decisions served

R-005, R-015–R-019, R-035–R-041, R-048; D-003, D-011–D-013, D-019–D-021.

## Assumptions introduced

Sprint 1's initial quality vocabulary contains only controlled IDs required by lawful fixtures and tests. Corpus admission, not implementation convenience, governs expansion.

---

# Product-decision mapping for ADR-011 through ADR-018

| ADR | Product decisions |
|---|---|
| ADR-011 | D-002, D-010, D-026 |
| ADR-012 | D-002, D-025, D-027 |
| ADR-013 | Superseded by ADR-017; originally D-012, D-027 |
| ADR-014 | D-025, D-027; assumption A-011 |
| ADR-015 | D-025, D-029 |
| ADR-016 | D-025, D-027–D-028 |
| ADR-017 | D-002, D-012, D-026–D-027 |
| ADR-018 | D-003, D-011–D-013, D-019–D-021 |
