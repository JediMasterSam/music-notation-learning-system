# Rendering Pipeline

Status: Architecture Sprint 0.1 complete — proposed for review  
Architecture baseline: 0.2

## 1. Purpose

The pipeline converts one canonical arrangement into one or more reproducible visual treatments selected by declarative recipes. It may also consume a derived learning plan. It never mutates canonical music, silently resolves incompatibility, or selects a final notation system.

Related requirements: R-004, R-007, R-011–R-014, R-025–R-041, R-047–R-050. Amendment source: Architecture Sprint 0.1 handoff §§3–10.

## 2. Stage overview

```text
1.  Artifact load
2.  Structural validation
3.  Canonical semantic validation
4.  Canonical reference resolution
5.  Musical normalization
6.  Optional semantic transposition
7.  Arrangement capability analysis
8.  Recipe and optional learning-plan load
9.  Strategy discovery and recipe resolution
10. Compatibility validation
11. View projection
12. Strategy-driven layout preparation
13. Accessible HTML/SVG rendering
14. Manifest, diagnostics, and provenance output
```

Learning-plan generation is a sibling derived pipeline between stages 7 and 8:

```text
normalized arrangement + capability profile
  + transformation definition + parameters
  -> transformation compatibility
  -> deterministic LearningPlan
  -> optional plan-local overrides
```

Experiment execution orchestrates the pipeline once per fixture/treatment pair and then produces a comparison index and run manifest.

## 3. Shared stage contract

```text
PipelineContext {
  canonicalInputHash: string;
  canonicalSchemaVersion: string;
  registries: RegistryVersionSet;
  deterministicOptions: JSONValue;
  diagnostics: Diagnostic[];
}

StageResult<T> =
  | { ok: true; value: T; diagnostics: Diagnostic[] }
  | { ok: false; diagnostics: Diagnostic[] }
```

All inputs are treated as immutable. Stages are pure except load/output adapters. Warnings and explicit limitations may accompany success. Error-severity diagnostics stop dependent stages.

## 4. Stage 1 — Artifact load

**Inputs:** canonical JSON path; recipe path; optional learning-plan or transformation path; optional experiment definition.  
**Outputs:** parsed JSON values and content hashes.  
**Guarantees:** UTF-8, duplicate-key detection where parser support permits, no expression evaluation, no URL fetching.  
**Errors:** unreadable file, malformed JSON, unsupported size limit, path traversal, hash mismatch in reproduction mode.

The loader does not infer artifact type solely from file extension. Each root declares `documentType` or `formatVersion`/schema identity.

## 5. Stage 2 — Structural validation

Each artifact validates against its own JSON Schema 2020-12 family:

- canonical document;
- representation recipe;
- learning transformation definition;
- learning plan;
- experiment definition;
- run/reproduction manifest.

Structural validation applies no musical or compatibility defaults. Recipe/transformation option defaults are handled only after the selected implementation's option schema is known.

## 6. Stage 3 — Canonical semantic validation

Validation order remains:

1. stable ID uniqueness and typed references;
2. rational time, meter map, measure coordinates, arrangement extent;
3. role and hand separation;
4. chord analysis, inversion, slash bass, and voicing independently;
5. specificity-state contradictions;
6. repetition, variation, pattern, and transition graphs;
7. familiar-shape hint equivalence and suppression rules;
8. corpus source-policy checks where applicable.

No recipe or learning transformation may weaken canonical validation.

## 7. Stage 4 — Canonical reference resolution

Produces an immutable typed index and resolution graph. It validates reference kind, scope, cycles, and source relationships but does not duplicate repeated material or assign display order beyond canonical ordering rules.

Every resolved edge records source JSON pointer and canonical IDs for later diagnostics/provenance.

## 8. Stage 5 — Musical normalization

Produces `NormalizedArrangement` by:

- reducing exact rational values;
- expanding pattern instances through the pattern engine;
- materializing repetitions, variations, alternate endings, and transitions;
- resolving role and hand assignments without collapsing them;
- preserving all `SpecificValue` states;
- appending deterministic provenance steps;
- sorting events by exact onset, then source order/stable ID.

Normalization does not produce learning chunks, choose a recipe, compute pixels, or generate display labels.

## 9. Stage 6 — Optional semantic transposition

Transposition operates through the canonical pitch strategy and semantic interval/key operations. It does not rewrite rendered labels.

Preserved invariants:

- IDs and rational time;
- form, ideas, roles, hand assignments, patterns, repetition, variations, and provenance;
- specificity states;
- learning-plan selectors and relationships when a plan is regenerated/applied to the transposed arrangement;
- hint classification after recomputation/revalidation.

A transformation/recipe run manifest records whether transposition preceded capability analysis and the exact target.

## 10. Stage 7 — Arrangement capability analysis

The analyzer computes evidence-backed capabilities from the validated normalized arrangement. It does not accept recipe claims as evidence.

Examples:

- exact register-bearing pitch available for all selected note events;
- exact onset/duration available;
- sections or musical ideas present;
- hand assignments complete/partial/unknown;
- harmony/pitch-class-set comparison available.

Output is deterministic and hashable. Capability diagnostics include canonical evidence refs.

## 11. Learning-plan generation sibling pipeline

When a run requests a transformation rather than an existing verified plan:

1. load and structurally validate the definition;
2. resolve its pinned implementation;
3. validate/materialize parameters;
4. compare required capabilities with the profile;
5. execute deterministically;
6. validate reference-only chunks and relationship graphs;
7. apply plan-local overrides in stable order;
8. compute plan/provenance hashes;
9. optionally verify regeneration byte-for-byte.

The result is a derived `LearningPlan`. Failure does not affect the canonical arrangement. A rendering recipe that requires a plan is incompatible when no valid plan is supplied/generated.

## 12. Stage 8 — Recipe and optional learning-plan load

Recipe identity, version, content hash, and option values are retained. A supplied learning plan is verified against arrangement ID/hash, transformation definition hash, and deterministic regeneration when requested.

Stale plans do not silently retarget to a changed arrangement.

## 13. Stage 9 — Strategy discovery and recipe resolution

The composition root registers built-in strategy descriptors and implementations. Resolution:

- pins exact ID/version;
- validates option JSON against each strategy schema;
- materializes only declared presentation defaults;
- canonicalizes option ordering;
- produces `ResolvedRecipe` with a resolution hash.

Missing pinned versions produce `unavailable`, never an upgrade.

## 14. Stage 10 — Compatibility validation

Compatibility combines:

- arrangement capability profile;
- optional plan capabilities;
- selected strategy requirements/provisions;
- cross-strategy conflicts;
- renderer support;
- explicit limitation policy.

Classification:

- `supported` — proceed;
- `supported-with-limitations` — proceed only when every limitation class is explicitly accepted and visibly reported;
- `incompatible` — stop;
- `unavailable` — stop.

Examples:

- proportional duration with unknown duration: incompatible;
- exact hand isolation with unknown assignment: incompatible;
- displaying hand-assignment state without isolation: supported with visible unknown-state limitation;
- contour-only pitch mapping plus requested exact pitch labels: incompatible unless an independent exact-pitch label provider has access to canonical pitch and declares compatibility.

No stage falls back to another strategy.

## 15. Stage 11 — View projection

```text
ProjectionInput {
  arrangement: NormalizedArrangement;
  recipe: ResolvedRecipe;
  learningPlan?: LearningPlan;
  excerpt?: TimeSpan;
}
```

Projection may filter roles/hands, select excerpts, expose learning-plan chunks, and add semantic overlays. It preserves temporal/structural context required by the recipe and cannot reinterpret harmony or alter canonical values.

Projected nodes include semantic IDs, source IDs, exact time/pitch values where available, specificity, role/hand data, learning-plan references, and provenance. They contain no final coordinates.

## 16. Stage 12 — Strategy-driven layout preparation

Layout composes the selected time, pitch, duration, label, overlay, disclosure, and renderer-neutral scene strategies.

### Explicit grid treatment

- x positions derive from beat/subdivision cells;
- widths/spans derive from exact duration cells;
- beat/subdivision boundaries are explicit;
- pitch y mapping is consistent and exact pitch text remains available.

### Proportional spatial melody treatment

- x derives linearly from exact onset;
- event duration edge/extent derives linearly from exact duration;
- y derives deterministically from semantic pitch;
- equal pitch maps to equal y;
- interval magnitude maps monotonically to vertical displacement;
- no stem/flag/symbol is required to recover basic duration.

Layout may apply deterministic scaling, margins, lane allocation, and break opportunities. It may not change musical time/pitch or hide an acknowledged limitation.

## 17. Stage 13 — Accessible HTML/SVG rendering

The renderer consumes only the layout plan and resolved render options. It:

- escapes all text;
- emits semantic headings/landmarks and treatment metadata;
- emits accessible names/descriptions and source-order event text;
- preserves canonical chord priority over hints;
- distinguishes specificity without color-only coding;
- labels the treatment as experimental/comparison;
- includes recipe/strategy versions and limitations.

Renderer output cannot modify the manifest or decide compatibility.

## 18. Stage 14 — Manifest, diagnostics, and provenance output

Each treatment bundle contains:

```text
index.html
scene.svg (or embedded SVG)
manifest.json
diagnostics.json
provenance.json
resolved-recipe.json
learning-plan.json       # when used; derived
```

The manifest records canonical/normalized hashes, recipe hash, all strategy versions/options, optional learning plan/transformation hashes, tool/package versions, output hashes, compatibility status, limitations, and deterministic run hash.

Experiment runs add `experiment-run.json` and a comparison `index.html` linking all treatments.

## 19. Determinism controls

- exact rational arithmetic until deterministic coordinate serialization;
- fixed decimal rounding policy owned by layout format version;
- canonical JSON serializer;
- stable registry/diagnostic ordering;
- no timestamps in hashed output (optional human metadata stored outside hash authority);
- pinned fonts are not required; text metrics cannot determine semantic coordinates in Sprint 1 treatments;
- no locale-dependent number or pitch formatting unless locale is a pinned option.

## 20. Error recovery policy

Diagnostic-only commands may continue independent validations. Rendering never continues after semantic error, recipe incompatibility, unavailable strategy, invalid plan, or unacknowledged limitation. One failed treatment in a multi-treatment experiment does not corrupt other outputs; the experiment run fails overall and records per-treatment status.

## 21. Tests

- canonical immutability across every stage;
- structural/semantic validation order;
- five specificity states survive normalization, transposition, projection, both layouts, and DOM;
- provenance traces every rendered event to canonical IDs plus transformation/recipe where applicable;
- recipe resolution exact-version and default-materialization tests;
- all compatibility classifications and no-fallback assertions;
- learning-plan generation/verification and no-copy assertions;
- same fixture, two recipes, distinct deterministic scene outputs;
- explicit-grid exact onset/duration assertions;
- proportional x/width/y mathematical invariants;
- experiment rerun byte identity and hash mismatch failure;
- escaping and accessibility checks;
- canonical harmony remains primary over familiar-shape hint.

## 22. Rejected alternatives

- inserting recipe resolution into the canonical loader;
- generating learning chunks during normalization;
- allowing layout to request missing musical defaults;
- renderer-selected strategy fallbacks;
- treatment-specific canonical fixtures;
- floating-point timing before exact mapping;
- screenshots without manifests or semantic DOM assertions;
- one monolithic render function that owns projection, compatibility, layout, and serialization.
