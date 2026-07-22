# Architecture

Status: Architecture Sprint 0.1 complete — proposed for review  
Architecture baseline: 0.2  
Applies to: Prototype 1 experimental notation and learning workbench

## 1. Context and architectural goals

Prototype 1 is an experimental workbench, not a demonstration of one proposed notation system. It stores authoritative musical meaning once, then applies reusable pedagogical transformations and declarative representational recipes to produce multiple reproducible learning plans and visual treatments without mutating the arrangement or editing TypeScript source for each experiment.

Architectural goals:

1. Preserve every approved semantic distinction: song versus arrangement, role versus hand, structural content versus derived learning plans, and inversion versus slash bass versus voicing.
2. Make omission explicit through `SpecificityState`; no pipeline stage, transformation, recipe, or strategy may invent certainty.
3. Keep canonical data free of learning-plan ownership, final layout decisions, pixel coordinates, line breaks, and notation punctuation.
4. Preserve stable identity and provenance through reference resolution, pattern expansion, repetition, variation, transposition, learning transformation, projection, layout, and rendering.
5. Make pitch, time mapping, pitch mapping, duration encoding, labels, overlays, disclosure, learning transformations, and renderer treatments independently replaceable where their contracts permit.
6. Allow the Product Owner to configure, save, load, reproduce, and compare treatments through versioned data rather than source edits.
7. Give Sprint 1 an ordered vertical slice proving two functional melody treatments and one reusable learning transformation without selecting a final notation or learning strategy.

Linked product requirements: R-001–R-050. Linked product decisions: D-001–D-024. Amendment source: `01_Product/ArchitectureSprint0.1Handoff.md`.

## 2. System boundaries

### 2.1 In scope

- versioned canonical JSON documents;
- JSON Schema 2020-12 structural validation;
- TypeScript semantic model and validation;
- deterministic reference resolution and normalization;
- replaceable pitch strategies and semantic transposition;
- patterns, repetition, variation, alternate endings, and provenance;
- reusable versioned learning transformations;
- derived learning plans and plan-local overrides;
- declarative versioned representation recipes;
- strategy discovery, capability analysis, and compatibility validation;
- multiple time, pitch, duration, label, overlay, disclosure, and renderer strategies;
- reproducible experiment definitions and run manifests;
- accessible HTML/SVG output and deterministic static comparison pages;
- CLI commands for validation, normalization, transformation, recipe resolution, rendering, experiment execution, corpus tests, and vocabulary reports;
- lawful manually encoded, synthetic, or public-domain fixtures.

### 2.2 Outside Prototype 1

Graphical score editing, automatic transcription, OMR, arrangement generation, fingering generation, microphone evaluation, performance capture, accounts, collaboration, marketplaces, engraving-quality pagination, comprehensive import/export, arbitrary runtime plugins, arbitrary executable configuration, final notation punctuation, a selected default learning strategy, and a polished learner-facing interface remain out of scope.

### 2.3 External boundaries

- **File system:** canonical documents, recipes, learning transformation definitions, experiment definitions, generated plans/manifests, reports, and rendered output.
- **Browser:** Sprint 1 receives generated accessible HTML/SVG and a static comparison page. A later local browser adapter may provide controls/live preview through the same workbench APIs.
- **Future interchange:** MusicXML and MIDI adapters may consume normalized semantic data later; they do not shape canonical or recipe contracts.
- **Human evaluation:** experiment definitions identify tasks and metrics; human observations remain separate from automated output and claims of learning effectiveness.

## 3. Architectural style

The architecture is layered and dependency directed. Canonical semantics point inward; configuration and delivery adapters point outward.

```text
                    +-----------------------------+
                    | ExperimentDefinition        |
                    | recipes + transformations   |
                    +--------------+--------------+
                                   |
canonical JSON -> validate -> normalize -> optional transpose
                                   |
                    +--------------+--------------+
                    | capability analysis         |
                    +-------+--------------+-------+
                            |              |
          learning transform|              |representation recipe
                            v              v
                     LearningPlan     resolved treatment
                            |              |
                            +-------+------+
                                    v
                              view projection
                                    v
                           strategy-driven layout
                                    v
                           accessible HTML/SVG
                                    v
                    run manifest + comparison page
```

The renderer serializes a semantic scene and layout plan. It does not infer musical meaning. The workbench resolves configuration; it does not define canonical semantics. Learning plans reference canonical content; they do not own it.

## 4. Major components

| Component | Owns | Inputs | Outputs | Must not own | Primary requirements/obligations |
|---|---|---|---|---|---|
| `schema` | JSON Schemas, schema IDs, examples, structural diagnostic mapping for canonical and configuration artifacts | JSON value | structurally valid artifact or diagnostics | semantic defaults, layout | R-004–R-013, R-048; handoff §§4–7 |
| `model` | canonical TypeScript contracts, stable IDs, rational time, specificity, semantic invariants | structurally valid canonical document | immutable canonical model | learning chunks, recipe options, pixels | R-004–R-025, R-035–R-041 |
| `pitch` | strategy registry and semantic pitch operations | strategy-tagged pitch values | validated/transposed/comparable values | rendered labels, final pitch mapping | R-006, R-014–R-015, R-050 |
| `validator` | cross-reference, temporal, harmonic, hint, contradiction, and extension checks | canonical model plus registries | semantic validation report | mutation or normalization | R-007–R-025, R-035–R-041 |
| `patterns` | pattern registry, parameter validation, expansion contracts, vocabulary accounting | definitions/instances | semantic event templates plus provenance | rendering shorthand | R-005, R-013, R-022–R-023 |
| `normalizer` | reference resolution, repeats, variations, endings, timeline materialization, provenance | validated canonical model | immutable disposable `NormalizedArrangement` | canonical persistence, layout, learning plan | R-004, R-011–R-014, R-020–R-024 |
| `transposition` | graph-wide semantic transposition | canonical/normalized model and target | transposed copy plus diagnostics | string rewriting | R-014, R-040, R-050 |
| `learning` | transformation registry, compatibility, deterministic plan generation, plan validation/overrides | normalized arrangement, definition, parameters | `LearningPlan` | canonical mutation or copied events | R-010, R-030, R-042; handoff §4 |
| `workbench` | recipe/experiment models, strategy catalog, capability profile, compatibility, orchestration, manifests | normalized arrangement, recipe, optional plan/experiment | resolved recipes, run manifests, comparison model | musical semantics or learning claims | R-026–R-034, R-042, R-047–R-050; handoff §§5–10 |
| `projection` | view filtering, semantic overlays, pedagogical disclosure | normalized arrangement, optional learning plan, resolved recipe | renderer-neutral `ProjectedView` | semantic reinterpretation | R-026–R-033, R-039, R-042 |
| `layout` | strategy interfaces and deterministic scene coordinates | projected view, resolved recipe | `LayoutPlan` | canonical meaning or compatibility fallback | R-011–R-012, R-025–R-034; handoff §§5–6 |
| `renderer-html` | safe accessible HTML/SVG serialization | layout plan and render options | deterministic output bundle | semantic inference, strategy resolution | R-026–R-041, R-049 |
| `corpus-tools` | source-policy checks, corpus manifest, regression/vocabulary/coverage reports | fixtures and expected assertions | reports/diagnostics | corpus approval | R-023, R-043–R-046 |
| `cli` | command parsing, file I/O, composition root, exit codes, report formatting | files and flags | files, stdout/stderr, process code | musical or pedagogical semantics | R-048–R-050; handoff §8 |
| `workbench-web` (deferred) | local form controls, save/load, live preview adapter | public workbench APIs/schemas | browser interaction | canonical internals or strategy meaning | handoff §8 |
| `test-fixtures` | small lawful requirement/workbench fixtures and builders | none | test documents | corpus approval | R-043–R-045 |

## 5. Data ownership

### 5.1 Canonical musical authority

Canonical JSON is the only persisted musical authority. It contains songs, arrangements, structure, events, roles, hand assignments, patterns, repetitions, variations, lyrics, and authored pedagogical hints. It contains no:

- learning plans or learning chunks;
- recipe/treatment selections;
- experiment tasks or observations;
- final pixel coordinates, line/page breaks, or viewport state;
- renderer-owned labels;
- inferred defaults for unknown or intentionally unspecified information.

Canonical objects are immutable after loading. Every transformation returns a new artifact.

### 5.2 Persisted noncanonical configuration

The following are persisted, versioned data but are not musical authority:

- `LearningTransformationDefinition`;
- `RepresentationRecipe`;
- `ExperimentDefinition`.

They may reference canonical capabilities and stable IDs where allowed, but may not contain canonical event payloads or redefine musical semantics.

### 5.3 Derived and disposable artifacts

- validated in-memory model;
- resolved reference graph;
- normalized timeline;
- transposed copy;
- arrangement capability profile;
- resolved recipe and compatibility report;
- learning plan and learning chunks;
- projected view;
- layout plan;
- rendered HTML/SVG;
- experiment run manifest;
- comparison page;
- vocabulary, diagnostic, and coverage reports.

Derived artifacts declare independent format versions. They may be cached by content hash but are never accepted as canonical input.

## 6. Core contracts

### 6.1 Immutable result contract

```text
Success<T> { ok: true; value: T; diagnostics: Diagnostic[] }
Failure    { ok: false; diagnostics: Diagnostic[] }
```

Warnings and explicit limitations may accompany success. Errors prevent downstream execution. No domain stage logs directly; adapters format diagnostic data.

### 6.2 Determinism contract

Identical parsed canonical values, canonical serializer, installed registry versions, fully resolved options, transformation definitions, recipes, experiment definitions, and tool versions produce byte-identical normalized JSON, learning plans, layout plans, manifests, and output bundles.

Ordering is document order where musically meaningful; otherwise stable ID lexical order. Derived IDs use deterministic path/content hashing. Random UUID generation, wall-clock timestamps, locale-sensitive formatting, and registry iteration order are prohibited from output authority.

### 6.3 Identity and provenance contract

Every canonical entity that can be referenced has a stable ID. Every normalized event has an append-only provenance chain. Every learning chunk records transformation, rule, canonical references/spans, parameters, and overrides. Every output manifest pins canonical, recipe, strategy, transformation, renderer, and layout versions plus content hashes.

### 6.4 Capability and compatibility contract

Strategies and transformations declare required/provided capabilities. Capability evidence is computed from validated canonical/normalized semantics. Unsupported combinations return one of `supported`, `supported-with-limitations`, `incompatible`, or `unavailable`. No layer silently approximates or inserts musical defaults.

## 7. Experimental boundaries

| Experiment | Replaceable boundary | Prohibited hardening |
|---|---|---|
| E-001 pitch representation | canonical `PitchStrategy`; independent visual `PitchMappingStrategy` | treating one library type, y mapping, or rendered label as canonical |
| E-002 repetition representation | `MaterialSource` resolver and provenance | duplication that loses common source |
| E-003 beat/time presentation | `TimeMappingStrategy` and overlay strategies | whitespace timing or one treatment becoming final |
| E-004 learning chunks | `LearningTransformationDefinition` -> derived `LearningPlan` | chunks stored in arrangement or one transformation made default |
| E-005 pattern vocabulary | versioned pattern registry and admission report | fixture-specific shared primitives |
| E-006 familiar-shape hints | hint validator and optional overlay | replacing harmony or default generation |
| spatial melody | `TimeMappingStrategy`, `DurationEncodingStrategy`, `PitchMappingStrategy`, recipe | treatment-specific canonical music or claims of superiority |
| workbench interaction | headless core plus adapters | browser UI owning semantics/configuration formats |

No experimental strategy becomes a learner-facing default without Product Owner approval and evidence.

## 8. Diagnostics and error behavior

```text
Diagnostic {
  code: string;
  severity: "info" | "warning" | "error";
  stage: "load" | "schema" | "semantic" | "resolve" | "normalize" |
         "transpose" | "capability" | "recipe" | "learning" |
         "project" | "layout" | "render" | "experiment" | "corpus";
  message: string;
  jsonPointer?: string;
  canonicalId?: string;
  relatedIds?: string[];
  requirementIds?: string[];
  handoffSections?: string[];
  hint?: string;
}
```

Existing code families remain. New families are `RECIPE`, `STRATEGY`, `CAPABILITY`, `LEARN`, `EXPERIMENT`, and `REPRODUCIBILITY`.

Exceptions are reserved for programmer defects or unrecoverable environment failures. User-authored invalid data, incompatible treatments, missing capabilities, stale hashes, or unavailable pinned versions produce structured diagnostics and nonzero CLI exit codes.

## 9. Versioning and migration

- Canonical documents use semantic `schemaVersion` and explicit sequential migrations.
- Recipes, learning transformation definitions, learning plans, experiment definitions, run manifests, normalized data, projected views, and layout plans each have independent format versions.
- Strategy and transformation implementations have immutable IDs/versions.
- A recipe or experiment pins exact versions; no `latest` resolution is permitted in reproducible runs.
- Option defaults are materialized into resolved artifacts.
- Migrations never run silently during validation or reproduction.
- Material changes to accepted architecture decisions require a new ADR rather than an unmarked rewrite.

## 10. Security, privacy, and accessibility

- Parse every artifact as data; never evaluate expressions, templates, callbacks, scripts, CSS, or HTML from input.
- Reject prototype-pollution keys in extension/option metadata.
- Escape lyrics, titles, labels, recipe names, aliases, annotations, and experiment text.
- Render through DOM-safe serialization; no untrusted `innerHTML`.
- Confine file output to requested destinations and prevent path traversal.
- Do not fetch external URLs during validate, normalize, plan, resolve, render, test, or experiment run.
- Color may reinforce but never solely communicate pitch, timing, specificity, selection, compatibility, or comparison differences.
- Spatial renderings include an accessible source-order event representation and exact pitch/time text.
- Generated comparison pages identify treatment versions and limitations in visible and machine-readable form.

## 11. Runtime and dependency constraints

Sprint 1 uses TypeScript 5.x, the current compatible Node.js LTS selected at implementation start, npm workspaces, JSON Schema 2020-12, Vitest, and HTML/SVG. Version pins belong in `.nvmrc`, `package.json#engines`, lockfile, and CI.

Dependencies must be maintained, ESM-compatible, deterministic under pinned versions, and unable to define canonical semantics. Music-theory libraries remain wrapped behind domain interfaces. Runtime dynamic plugin loading is prohibited in Sprint 1.

## 12. Repository commands

```text
npm ci
npm run build
npm run typecheck
npm run lint
npm test
npm run test:corpus
npm run check

music validate <file> [--format text|json]
music normalize <file> --out <file>
music transpose <file> --interval <semantic-interval> --out <file>
music strategy list [--kind <kind>]
music recipe validate <recipe.json> --arrangement <file>
music recipe resolve <recipe.json> --arrangement <file> --out <file>
music learning strategy list
music learning plan <arrangement.json> --transformation <definition.json> --out <plan.json>
music render <file> --recipe <recipe.json> [--learning-plan <plan.json>] --out <directory>
music compare <file> --recipes <a.json> <b.json> --out <directory>
music experiment run <experiment.json> --out <directory>
music corpus test
music vocabulary report [<file-or-corpus>]
```

`npm run check` runs formatting verification, lint, typecheck, unit/integration tests, schema examples, deterministic fixture generation, corpus tests, and reproducibility checks.

## 13. Workbench interaction decision

Sprint 1 implements a headless workbench core plus declarative files, CLI commands, and a generated static comparison page. This satisfies configuration without TypeScript changes and creates reproducible review artifacts.

A local browser control panel and live preview are deferred to a later sprint behind `workbench-web`. The static-output assumption is therefore narrowed: static generation is sufficient for the Sprint 1 proof, but the full Prototype 1 architecture is not restricted to static-only interaction.

## 14. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Canonical model becomes renderer or workbench shaped | package direction, schema review, no recipe/layout/plan fields in canonical schemas |
| Configuration matrix becomes incoherent | capability descriptors, compatibility rules, conformance tests, no silent fallback |
| Learning plans become shadow arrangements | reference-only selectors, copied-payload rejection, regeneration verification |
| Pitch experiment leaks across layers | canonical pitch strategy distinct from visual pitch mapping strategy |
| Specificity erased by convenient strategy defaults | discriminated wrappers and full-pipeline preservation suite |
| Spatial treatment hardens as final notation | experimental status metadata, recipe identity in output, no default recipe |
| Workbench UI starts owning state formats | headless schemas/APIs are authoritative; UI is adapter only |
| Recipe versions fail reproducibility | exact pins, content hashes, resolved options, immutable run manifests |
| Pattern/recipe vocabulary inflates | separate admission gate and vocabulary reports |
| Renderer overreach | renderer consumes layout plan only; semantic assertions before snapshots |
| Legal uncertainty blocks experiment fixtures | synthetic/public-domain fixtures and source manifest gates |
| Sprint 1 scope expands excessively | defer polished UI, staff-like comparison, generated hints, and broad corpus while retaining contract tests |

## 15. Rejected alternatives

- storing learning chunks or recipes inside `Arrangement`;
- a single hard-coded notation treatment;
- source-code edits as the experiment configuration mechanism;
- arbitrary executable rules or plugins in JSON;
- strategy fallback that silently approximates missing semantics;
- separate canonical fixtures for each visual treatment;
- browser UI as the source of truth for recipes;
- output screenshots without manifests or content hashes;
- final notation punctuation or a default learning strategy during Prototype 1 architecture.

## 16. Requirement ownership summary

| Requirements | Primary owner | Secondary owner |
|---|---|---|
| R-001–R-003 | product evaluation protocol | workbench, learning, corpus-tools |
| R-004–R-014 | schema, model, normalizer, pitch | validator, transposition, capability analysis |
| R-015–R-019 | model, validator | pitch, projection, renderer-html |
| R-020–R-025 | model, patterns, normalizer | learning, projection, layout |
| R-026–R-034 | workbench, projection, layout, renderer-html | normalizer, learning |
| R-035–R-041 | model, hint validator, projection | workbench, renderer-html |
| R-042–R-046 | learning, workbench, corpus-tools, human protocol | test-fixtures |
| R-047–R-050 | schema, workbench, CLI, all packages | future adapters |

Detailed one-to-one mapping and amendment obligations are in `01_Product/TraceabilityMatrix.md`.

## 17. Architecture escalation status

No Architecture Sprint 0.1 escalation gate is triggered.

The interaction question is resolved as an architecture choice: CLI/declarative configuration and generated comparison output are sufficient for Sprint 1, while a browser adapter remains supported and deferred. Harmony, repetition, voicing, and familiar-shape behavior remain covered by contract tests or retained fixtures as specified in revised Sprint 1; no approved requirement is abandoned. No strategy or transformation is selected as a default.
