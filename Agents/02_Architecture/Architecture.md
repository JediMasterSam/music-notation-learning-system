# Architecture

Status: Architecture Sprint 0 complete — proposed for review  
Architecture baseline: 0.1  
Applies to: Prototype 1

## 1. Context and goals

The system stores authoritative musical meaning once and derives multiple learning views without mutating that meaning. Prototype 1 is a local, static TypeScript system that validates canonical JSON, normalizes references and reusable material into a deterministic semantic timeline, transposes through a replaceable pitch strategy, and renders accessible HTML/SVG.

Architectural goals:

1. Preserve every approved semantic distinction, especially song versus arrangement, role versus hand, structural versus learning chunks, and inversion versus slash bass versus voicing.
2. Make omission explicit through `SpecificityState`; no pipeline stage may invent certainty.
3. Keep canonical data free of final layout decisions, pixel coordinates, line breaks, and notation punctuation.
4. Preserve stable identity and provenance through reference resolution, pattern expansion, repetition, variation, transposition, projection, and rendering.
5. Keep experimental pitch, repetition, beat-presentation, learning-chunk, pattern-vocabulary, and familiar-shape treatments replaceable.
6. Give Sprint 1 an ordered implementation plan with no learner-facing product decisions left to the implementation agent.

Linked requirements: R-001–R-050. Linked decisions: D-001–D-024.

## 2. Scope and system boundaries

### In scope

- versioned canonical JSON documents;
- JSON Schema 2020-12 structural validation;
- TypeScript semantic model and validation;
- deterministic reference resolution and normalization;
- replaceable pitch strategies and semantic transposition;
- patterns, repetition, variation, alternate endings, and provenance;
- view projection for arrangement, roadmap, role, hand, chunk, and excerpt views;
- deterministic layout preparation;
- accessible static HTML/SVG output;
- CLI commands for validation, normalization, rendering, corpus tests, and vocabulary reports;
- lawful manually encoded and synthetic fixtures.

### Outside Prototype 1

Graphical editing, automatic transcription, OMR, arrangement generation, fingering generation, audio evaluation, accounts, collaboration, marketplaces, engraving-quality pagination, comprehensive import/export, and final notation punctuation remain out of scope.

### External boundaries

- **File system:** canonical documents, schema files, corpus fixtures, generated reports, and rendered output.
- **Browser:** current desktop browser receives static HTML, CSS, and SVG. No browser-owned musical semantics.
- **Future interchange:** MusicXML and MIDI adapters may consume normalized semantic data later; they do not shape the Prototype 1 canonical model.
- **Human evaluation:** learning studies consume rendered views and record comprehension, memory, execution, coordination, time, errors, and friction outside automated tests.

## 3. Architectural style

The architecture is a layered, dependency-directed workspace:

```text
canonical JSON
  -> schema validation
  -> semantic model validation
  -> reference resolution
  -> pattern/repetition/variation normalization
  -> optional semantic transposition
  -> view projection
  -> layout preparation
  -> HTML/SVG rendering
```

Dependencies point inward toward semantic contracts. Renderers, CLI adapters, and corpus tools depend on model contracts; the model never imports renderer or CLI packages.

## 4. Major components

| Component | Owns | Inputs | Outputs | Must not own | Primary requirements |
|---|---|---|---|---|---|
| `schema` | JSON Schema, schema IDs, schema examples, structural diagnostic mapping | JSON value | structurally valid document or diagnostics | semantic defaults, layout | R-004–R-013, R-048 |
| `model` | canonical TypeScript contracts, stable IDs, rational time, specificity, semantic invariants | structurally valid document | immutable canonical model or diagnostics | pattern expansion, pixels | R-004–R-025, R-035–R-041 |
| `pitch` | strategy registry and semantic pitch operations | strategy-tagged pitch values | validated/transposed/comparable pitch values | harmonic product decisions | R-006, R-014, R-015, R-050 |
| `validator` | cross-reference, temporal, harmonic, hint, and contradiction checks | canonical model plus registries | validation report | mutation or normalization | R-007–R-025, R-035–R-041 |
| `patterns` | pattern registry, parameter validation, expansion contracts, vocabulary accounting | canonical definitions/instances | semantic event templates plus provenance | rendering shorthand | R-005, R-013, R-022–R-023 |
| `normalizer` | reference resolution, repeats, variations, endings, timeline materialization, provenance | validated canonical model | immutable disposable `NormalizedArrangement` | canonical persistence, layout | R-004, R-010–R-014, R-020–R-024 |
| `transposition` | graph-wide semantic transposition orchestration | canonical or normalized model, interval/key target, pitch registry | transposed copy plus diagnostics | label string rewriting | R-014, R-040, R-050 |
| `projection` | view filtering and pedagogical disclosure | normalized arrangement plus `ViewSpec` | `ProjectedView` | semantic reinterpretation | R-026–R-033, R-039, R-042 |
| `layout` | renderer-neutral rows, lanes, beat cells, grouping, and break opportunities | projected view plus layout options | `LayoutPlan` | canonical musical meaning | R-011–R-012, R-025–R-034 |
| `renderer-html` | safe accessible HTML/SVG serialization | layout plan plus render options | deterministic output bundle | semantic inference | R-026–R-041, R-049 |
| `corpus-tools` | source-policy checks, corpus manifest, regression and vocabulary reports | fixtures and expected assertions | reports/diagnostics | corpus approval | R-023, R-043–R-046 |
| `cli` | command parsing, I/O, exit codes, report formatting | files and flags | files, stdout/stderr, process code | musical semantics | R-048–R-050 |
| `test-fixtures` | small requirement-focused lawful fixtures and builders | none | test documents | golden-corpus approval | R-043–R-045 |

## 5. Canonical and derived data ownership

### Canonical data

Canonical JSON is the only persisted musical authority. It contains semantic values, stable IDs, references, provenance declarations, and optional namespaced metadata. It contains no final pixels, glyph positions, line breaks, page breaks, or renderer-owned labels.

Canonical objects are immutable after loading. Transformations return new values. Authoring tools introduced later must emit the same canonical contract rather than bypass it.

### Derived data

The following are disposable and must include their own format version:

- validated in-memory model;
- resolved reference graph;
- normalized timeline;
- transposed copy;
- projected view;
- layout plan;
- rendered HTML/SVG;
- vocabulary and diagnostic reports.

Derived files may be cached, but cache validity is keyed by canonical content hash, canonical schema version, component version, registry versions, and normalized options.

## 6. Core contracts

### Immutable result contract

Every stage returns one of:

```text
Success<T> { ok: true; value: T; diagnostics: Diagnostic[] }
Failure    { ok: false; diagnostics: Diagnostic[] }
```

Warnings may accompany success. Errors prevent downstream execution unless a command explicitly requests diagnostic-only continuation. No stage logs directly except CLI adapters.

### Determinism contract

Identical canonical bytes after JSON parsing and canonical key ordering, identical registries, and identical options must produce byte-identical normalized JSON and rendered output. Ordering is always explicit: document order where meaningful, otherwise stable ID lexical order.

### Identity and provenance contract

Every canonical entity that can be referenced has a stable ID. Every normalized event contains an ordered provenance chain beginning with at least one canonical ID and optionally adding repetition, variation, pattern, override, transposition, and projection steps. Derived IDs are deterministic hashes or deterministic path-based IDs; random UUID generation is prohibited during normalization and rendering.

## 7. Experimental boundaries

| Experiment | Replaceable boundary | Prohibited hardening |
|---|---|---|
| E-001 pitch representation | `PitchStrategy` registry; strategy-tagged payload envelope | treating rendered note labels or one library type as canonical |
| E-002 repetition representation | `MaterialSource` resolver and provenance model | duplicating material during load and losing common source |
| E-003 beat presentation | `BeatPresentationStrategy` inside layout/renderer | whitespace alignment in canonical or rendered source |
| E-004 learning chunks | `LearningChunk` references plus view projection | making chunks structural owners of music |
| E-005 pattern vocabulary | versioned pattern registry and admission report | adding shared patterns merely to shorten a fixture |
| E-006 familiar-shape hints | hint validator and optional projection layer | replacing canonical harmony or enabling generated hints by default |

No experimental strategy becomes the default learner-facing behavior without Product Owner approval.

## 8. Diagnostics and error behavior

Diagnostics are data, not prose-only exceptions:

```text
Diagnostic {
  code: string;
  severity: "info" | "warning" | "error";
  stage: "load" | "schema" | "semantic" | "resolve" | "normalize" |
         "transpose" | "project" | "layout" | "render" | "corpus";
  message: string;
  jsonPointer?: string;
  canonicalId?: string;
  relatedIds?: string[];
  requirementIds?: string[];
  hint?: string;
}
```

Code families: `LOAD`, `SCHEMA`, `REF`, `TIME`, `SPEC`, `HARM`, `VOICE`, `PATTERN`, `PROV`, `TRANSPOSE`, `HINT`, `VIEW`, `LAYOUT`, `RENDER`, `SOURCE`, and `MIGRATION`.

Exceptions are reserved for programmer defects or unrecoverable environment failures. User-authored invalid data produces diagnostics and nonzero CLI exit codes.

## 9. Versioning and migration

- Canonical documents declare `schemaVersion` using semantic versioning.
- Schema `$id` includes the major/minor version.
- Patch changes may clarify validation without changing accepted meaning.
- Minor changes add backward-compatible fields or alternatives.
- Major changes may alter meaning or remove fields and require an explicit migration.
- Migrations are pure, ordered functions from one known version to the next and emit a migration report. They never run silently during `validate`.
- Normalized, projection, and layout formats have separate versions and are never accepted as canonical input.
- Pattern libraries and pitch strategies declare independent IDs and versions; canonical references pin versions for reproducibility.

## 10. Security, privacy, and accessibility

- Parse JSON as data only; never evaluate expressions from canonical input.
- Reject prototype-pollution keys in extension metadata.
- Escape all lyric, title, label, alias, and user annotation text.
- Render through DOM-safe serialization; no untrusted `innerHTML`.
- Restrict output paths to the requested destination and prevent path traversal.
- SVG IDs are deterministic, sanitized, and collision checked.
- External URLs are not fetched during validate, normalize, test, or render.
- Color may reinforce meaning but never carry required distinctions alone.
- HTML uses headings, landmarks, tables/lists only when semantically appropriate, accessible names, visible focus states, text equivalents, and source-order reading compatible with the visual order.
- SVG includes titles/descriptions where it conveys information not already present in adjacent HTML.

## 11. Approved runtime and dependencies

Sprint 1 pins Node.js 24 LTS and the corresponding npm major in `.nvmrc`, `package.json#engines`, and CI. TypeScript 5.x, npm workspaces, Vitest, a JSON Schema 2020-12 validator, and an HTML/SVG DOM serializer are permitted. Any music-theory library is wrapped behind `PitchStrategy` and cannot define canonical semantics.

Dependency selection rules:

1. Prefer small, maintained, ESM-compatible libraries.
2. No runtime dependency may mutate inputs.
3. No renderer dependency may interpret musical meaning.
4. Lockfile changes are committed.
5. New consequential dependencies require an ADR amendment.

## 12. Required repository commands

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
music render <file> --view <view-spec> --out <directory>
music corpus test
music vocabulary report [<file-or-corpus>]
```

`npm run check` runs formatting verification, lint, typecheck, unit/integration tests, schema examples, and corpus tests in that order.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Canonical model becomes a renderer-shaped score format | enforce package direction, schema review, and no layout fields in canonical schemas |
| Pitch experiment leaks into every type | strategy-tagged values and capability-based `PitchStrategy` interface |
| Specificity is erased by convenient defaults | required discriminated wrappers and round-trip tests |
| Pattern expansion hides source meaning | provenance chain, pinned definitions, deterministic overrides, vocabulary report |
| Repetition normalization explodes large documents | lazy internal iterators with bounded materialization and cycle detection |
| Familiar-shape hints become competing harmony | canonical-first contract, validation classification, removable projection, no default generation |
| Snapshot tests approve semantic regressions | semantic assertions are mandatory; snapshots only supplement |
| Legal uncertainty blocks corpus work | synthetic/public-domain fixtures and source manifest gates |
| Static renderer overfits desktop | renderer-neutral projection/layout contracts and semantic HTML |

## 14. Rejected alternatives

- **Renderer-owned model:** rejected because it would make presentation authoritative and block multiple views.
- **Single flattened event list as canonical storage:** rejected because it destroys reusable sources, variation provenance, and learner-visible repetition.
- **Whitespace-based timing:** rejected because timing becomes ambiguous and fragile.
- **MIDI numbers as universal canonical pitch:** rejected because spelling, harmonic role, and the pitch experiment would be lost.
- **Chord symbol containing inversion, slash bass, and voicing as one string:** rejected because approved semantics require independent concepts.
- **Null or absent field for all missing states:** rejected because unknown and intentionally unspecified would collapse.
- **Generated hints enabled by default:** rejected because E-006 remains experimental and may misteach harmony.
- **Full engraving engine in Prototype 1:** rejected as unnecessary scope and a source of layout-driven semantics.

## 15. Requirement ownership summary

| Requirements | Primary owner | Secondary owner |
|---|---|---|
| R-001–R-003 | product evaluation protocol | projection, corpus-tools |
| R-004–R-014 | schema, model, normalizer, pitch | validator, transposition |
| R-015–R-019 | model, validator | pitch, renderer-html |
| R-020–R-025 | model, patterns, normalizer | projection, layout |
| R-026–R-034 | projection, layout, renderer-html | normalizer |
| R-035–R-041 | model, hint validator, projection | renderer-html |
| R-042–R-046 | projection, corpus-tools, human protocol | test-fixtures |
| R-047–R-050 | all architecture packages, CLI | future adapters |

The detailed one-to-one mapping is maintained in `01_Product/TraceabilityMatrix.md`.

## 16. Architecture escalation status

No Sprint 0 escalation gate is triggered. Open assumptions A-001–A-010 remain explicit and isolated. None has been converted into a permanent product decision.
