# Implementation Sprint 1

Status: Engineering-ready after Architecture Sprint 0  
Role: Implementation Agent  
Objective version: canonical schema 0.1.0

## 1. Objective

Prove the core architecture can represent, structurally and semantically validate, normalize, transpose, project, and render three small lawful fixtures without selecting final notation punctuation or making new product decisions.

Sprint 1 is a vertical architectural proof, not a polished notation product. Prefer the smallest implementation that satisfies the approved contracts and acceptance tests.

## 2. Governing documents

Read in this order before implementation:

1. `Agents/00_Project_Constitution/ProjectConstitution.md`
2. `Agents/00_Project_Constitution/GuidingPrinciples.md`
3. `Agents/00_Project_Constitution/DecisionMaking.md`
4. `Agents/01_Product/Vision.md`
5. `Agents/01_Product/Requirements.md`
6. `Agents/01_Product/DecisionLog.md`
7. `Agents/01_Product/AssumptionLog.md`
8. `Agents/01_Product/Glossary.md`
9. `Agents/02_Architecture/Architecture.md`
10. `Agents/02_Architecture/CanonicalModel.md`
11. `Agents/02_Architecture/RepositoryStructure.md`
12. `Agents/02_Architecture/RenderingPipeline.md`
13. `Agents/02_Architecture/PatternEngine.md`
14. `Agents/02_Architecture/RenderingEngine.md`
15. `Agents/02_Architecture/TestingStrategy.md`
16. `Agents/02_Architecture/TechnicalDecisions.md`
17. `Agents/01_Product/TraceabilityMatrix.md`
18. `Agents/05_Implementation/AcceptanceTests.md`
19. this sprint plan.

Authority order remains Constitution, approved product decisions, requirements, acceptance criteria, approved architecture, sprint instructions, implementation convenience.

## 3. Non-negotiable implementation constraints

- Do not invent learner-facing notation punctuation.
- Do not change approved product semantics for convenience.
- Do not flatten song/arrangement, role/hand, structural/learning chunks, or inversion/slash-bass/voicing distinctions.
- Do not use `null`, absence, or defaults to collapse the five specificity states.
- Do not put pixels, line breaks, or renderer-owned labels in canonical data.
- Do not transpose rendered strings.
- Do not discard pattern/repetition/variation provenance.
- Do not generate familiar-shape hints by default.
- Do not commit copyrighted music without permission or another lawful basis.
- Do not begin broad authoring, import/export, editing, or engraving features.

## 4. Required environment

- Node.js 24 LTS pinned in `.nvmrc` and `package.json#engines`.
- npm workspaces and committed `package-lock.json`.
- TypeScript 5.x with strict settings from `RepositoryStructure.md`.
- Vitest workspace.
- JSON Schema 2020-12 validator.
- ESM packages.

Record exact selected package versions in the Sprint 1 report. A consequential dependency change from the architecture requires an ADR amendment; ordinary compatible package selection does not.

## 5. Work order and completion gates

Complete work packages in order. Do not start a dependent package until the prior gate passes.

### WP-01 — Initialize workspace and quality gates

Create root configuration and package directories exactly as assigned in `RepositoryStructure.md`. Add root commands for build, clean, formatting, lint, typecheck, tests, schema checks, accessibility checks, corpus checks, and aggregate `check`.

Deliverables:

- root package/workspace configuration;
- Node/npm pinning;
- TypeScript/Vitest/lint/format configuration;
- empty package entry points that compile without circular dependencies;
- CI workflow running `npm ci` and `npm run check`.

Gate:

```text
npm ci
npm run build
npm run typecheck
npm test
```

must pass from a fresh clone.

### WP-02 — Implement schema 0.1.0

Implement JSON Schema 2020-12 for the Sprint 1 slice of:

- CanonicalDocument;
- Song and Arrangement;
- StableId, Rational, TimePosition, Duration, MeasureCoordinate;
- SpecificValue and all five states;
- MusicalRole and HandAssignment;
- Section, MusicalIdea, LearningChunk, Transition;
- NoteEvent, ChordEvent, ChordAnalysis, Inversion, Voicing;
- authored FamiliarShapeHint;
- RepetitionReference and Variation needed by Fixture B;
- minimal PatternDefinition/PatternInstance contracts even if no full shared pattern fixture is required;
- LyricTrack/LyricEvent contract, with a small schema test even if not rendered in Sprint 1;
- SourceRecord required for fixture lawfulness.

Deliverables:

- versioned schema files and `$id` values;
- valid and invalid examples for every implemented construct;
- schema registry and structural diagnostics;
- no final notation syntax fields.

Gate: `npm run schema:check` passes and invalid examples fail for the expected reason.

### WP-03 — Implement model, rational time, and specificity

Implement immutable TypeScript contracts mechanically consistent with schema. Provide stable serialization, rational normalization/arithmetic, stable ID index, and the `SpecificValue<T>` union.

Deliverables:

- public model API;
- readonly canonical types;
- deterministic serializer;
- deep-freeze immutability tests;
- five-state round-trip tests.

Gate: no model package import from normalizer, projection, layout, renderer, corpus-tools, or CLI.

### WP-04 — Implement pitch strategy boundary

Implement the `PitchStrategy` registry and `spelled-pitch@1` for pitch and pitch-class values. Add a deliberately minimal test strategy to prove registry replacement and unsupported capability diagnostics.

Required capabilities:

- payload validation;
- pitch versus pitch-class kind checking;
- semantic interval transposition;
- deterministic formatting for renderer display;
- pitch-class-set comparison for exact familiar-shape validation.

Do not expose a third-party music-library type in public APIs.

Gate: strategy conformance suite passes, including zero/inverse transposition where supported.

### WP-05 — Implement semantic validation

Implement ordered pure validators and structured diagnostics for:

- ID uniqueness and typed references;
- song/arrangement linkage;
- rational time and measure map;
- role/hand separation;
- structural versus learning-chunk references;
- chord analysis, inversion, slash bass, and voicing independence;
- specificity contradictions;
- repetition/variation cycles and targets;
- authored familiar-shape equivalence/suppression;
- lawful source records for corpus mode.

Gate: AT-003–AT-005 and AT-009–AT-010 invalid cases produce stable diagnostic codes and canonical IDs.

### WP-06 — Create three lawful fixtures

Use synthetic fixtures unless a clearly public-domain source is registered and simpler.

#### Fixture A — Melody only (`C-G01`)

Must contain:

- one complete phrase;
- exact NoteEvents with primary-line role;
- pickup or tied duration;
- no ChordEvent or invented harmony;
- transposition/rendering in at least two keys.

#### Fixture B — Beat-aligned harmony and repetition (`C-G03`/`C-G06`)

Must contain:

- at least two chord changes inside one measure;
- rational subdivision timing;
- a reusable MusicalIdea;
- a RepetitionReference;
- an explicit alternate-ending Variation;
- provenance assertions.

#### Fixture C — Voicing, inversion, slash bass, and hint (`C-G05`/`C-G09`)

Must contain separate examples of:

- canonical `Am7`;
- explicit A bass;
- authored `C/A` familiar-shape hint classified exact pitch-class set;
- required upper voicing;
- intentionally unspecified voicing in another chord event;
- explicit inversion;
- a slash-bass chord where slash bass must not imply inversion;
- at least one misleading hint candidate rejected or suppressed.

Every fixture requires a source-register entry, behaviors tested, and limitations.

Gate: fixtures pass structural and semantic validation before normalization work begins.

### WP-07 — Implement deterministic normalization and provenance

Implement:

- typed reference resolution;
- direct event placement;
- repetition placement;
- the Variation operations required by Fixture B;
- minimal pattern registry/expansion conformance path;
- role and independent hand-assignment resolution;
- exact rational sorting;
- deterministic derived IDs;
- append-only provenance chains;
- normalized format version and input/options hashes.

Do not accept normalized output as canonical input.

Gate:

- repeated runs are byte-identical;
- AT-006 provenance is complete;
- all five specificity states survive;
- cycles fail with full ID paths.

### WP-08 — Implement semantic transposition

Implement graph traversal through the pitch registry. Transpose notes, chord roots, slash bass, exact voicing pitches, pitch-bearing pattern parameters, and familiar-shape hints. Preserve IDs, time, roles, hands, chunks, repetition, variation, and provenance.

Gate:

- Fixture A renders in at least two keys;
- AT-008 invariants pass;
- zero/inverse metamorphic tests pass where supported;
- exact `Am7`/`C/A` hint equivalence remains valid after transposition;
- no string-replacement implementation exists.

### WP-09 — Implement projection

Implement `ViewSpec` and projections for:

- full arrangement;
- harmonic roadmap;
- isolated primary line;
- isolated harmony.

Define contract-level behavior for hand, learning-chunk, and excerpt views even if full rendering is deferred.

Gate:

- AT-007 passes for roles;
- structure and time context remain;
- hint visibility changes only hint nodes;
- projection never mutates normalized input.

### WP-10 — Implement primitive layout and HTML/SVG renderer

Implement `explicit-grid@1`, renderer-neutral `LayoutPlan`, and safe deterministic HTML/SVG.

Required visible semantics:

- section and idea structure;
- beat/subdivision position;
- note events;
- canonical harmony;
- separate inversion, slash bass, and voicing nodes;
- required/suggested/optional/intentionally-unspecified/unknown distinctions;
- repetition and alternate ending relationship;
- subordinate authored familiar-shape hint;
- basic lyric-anchor rendering test;
- provenance manifest.

Required safety/accessibility:

- escaped user text;
- no untrusted `innerHTML`, scripts, external URLs, or SVG event attributes;
- logical headings/reading order;
- noncolor specificity distinctions;
- accessible labels for chord components, hints, beat positions, repetition, and variation;
- deterministic IDs and output.

Gate: AT-001–AT-010, AT-012, and rendering security/accessibility tests pass for the implemented slice.

### WP-11 — Implement CLI and corpus/vocabulary commands

Implement:

```text
music validate
music normalize
music transpose
music render
music corpus test
music vocabulary report
```

Use exit codes and stdout/stderr separation from `RepositoryStructure.md`. No command owns musical semantics.

Gate: black-box tests pass from temporary directories, including invalid files and unsafe output paths.

### WP-12 — Complete regression suite and Sprint 1 report

Run the complete gate from a fresh clone:

```text
npm ci
npm run check
```

Create `reports/sprint-1/Sprint1Report.md` containing:

- exact environment and dependency versions;
- implemented scope by work package;
- command results;
- fixture coverage and source status;
- acceptance-test results;
- deterministic output evidence;
- traceability updates;
- open defects, assumptions, and deviations;
- recommendations for Sprint 2;
- explicit statement that no final notation syntax was selected.

## 6. Definition of done

Sprint 1 is complete only when:

- fresh clone installs, builds, lints, typechecks, and tests;
- schema 0.1.0 and examples are documented;
- fixtures A–C validate, normalize, transpose where applicable, project, and render;
- canonical and normalized data remain separate;
- exact notes work without invented harmony;
- chord timing is unambiguous without whitespace;
- inversion, slash bass, and voicing remain separate through rendering;
- all five specificity states survive the full pipeline;
- repetition/alternate ending and pattern paths preserve provenance;
- pitch strategy can be replaced in tests;
- canonical `Am7` remains primary and `C/A` remains optional/subordinate;
- misleading hint is rejected or suppressed;
- output is deterministic, escaped, and accessible without color-only meaning;
- source policy passes;
- no final notation punctuation, graphical editor, or broad import/export is introduced;
- traceability and Sprint 1 report are updated.

## 7. Escalation rules

Make ordinary implementation choices within architecture and continue. Escalate only when:

1. two approved requirements conflict;
2. implementation cannot proceed without making an experimental product decision permanent;
3. a new learner-facing concept is unavoidable;
4. legal source constraints block a required fixture and no synthetic fixture can substitute;
5. familiar-shape hints cannot be implemented without materially misteaching harmony;
6. an architecture contract is internally contradictory or technically impossible.

Use this exact format:

```text
Escalation ID:
Blocked requirement or decision IDs:
Concrete musical example:
Options considered:
Effect on learner vocabulary and corpus:
Recommendation:
Work that can continue meanwhile:
```

Do not silently revise architecture. Record ordinary architecture defects as proposed ADR amendments and continue on unaffected work.

## 8. Explicit non-goals

- final human-authoring language;
- polished visual notation vocabulary;
- generated familiar-shape hints;
- complete pattern library;
- automatic pagination;
- comprehensive MusicXML/MIDI export;
- graphical editing;
- user accounts or persistence service;
- claims of improved learning based solely on software tests.

## 9. Exact first prompt for the Implementation Agent

```text
You are the Implementation Agent for Music Notation Learning System Sprint 1.

Read the repository in the exact order listed in Agents/05_Implementation/Sprint1.md. Treat the Project Constitution, approved product decisions, requirements, acceptance tests, and Architecture Sprint 0 documents as authoritative in that order.

Implement Sprint 1 exactly as specified in Agents/05_Implementation/Sprint1.md. Begin with WP-01 and proceed in order. Do not invent final notation punctuation or learner-facing semantics. Do not collapse song and arrangement, roles and hands, structural and learning chunks, inversion and slash bass and voicing, or any of the five specificity states. Keep pitch representation behind the approved strategy interface, preserve provenance through normalization and transposition, keep familiar-shape hints subordinate to canonical harmony, and use only lawful synthetic or public-domain fixtures.

Make ordinary implementation decisions and continue. Escalate only through the required escalation format when a product or architecture decision genuinely blocks progress. Update traceability and produce the required Sprint 1 report. Do not declare completion until npm run check passes from a fresh clone and every Sprint 1 exit criterion is evidenced.
```
