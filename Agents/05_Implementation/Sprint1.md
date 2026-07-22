# Implementation Sprint 1

Status: Revised after Architecture Sprint 0.1  
Sprint objective version: 0.2  
Production implementation authorized only within this plan

## 1. Objective

Prove that one canonical musical representation can drive multiple reproducible visual treatments and reusable pedagogical transformations without code changes, semantic mutation, or selection of a final notation system.

Sprint 1 is the smallest credible vertical slice of the experimental notation and learning workbench. It must produce two functional melody treatments from the same canonical fixture and apply one reusable learning transformation to at least two compatible arrangements.

## 2. Governing documents and reading order

Read in this order before implementation:

1. `Agents/00_Project_Constitution/ProjectConstitution.md`
2. `Agents/00_Project_Constitution/GuidingPrinciples.md`
3. `Agents/00_Project_Constitution/DecisionMaking.md`
4. `Agents/01_Product/Vision.md`
5. `Agents/01_Product/Requirements.md`
6. `Agents/01_Product/DecisionLog.md`
7. `Agents/01_Product/AssumptionLog.md`
8. `Agents/01_Product/Glossary.md`
9. `Agents/01_Product/ArchitectureSprint0.1Handoff.md`
10. `Agents/03_Corpus/Corpus.md`
11. `Agents/04_Experiments/ExperimentRegister.md`
12. all files in `Agents/02_Architecture`, beginning with `Architecture.md`
13. this Sprint 1 plan

Authority order remains Constitution, approved product decisions/direction, requirements, acceptance criteria, architecture decisions, sprint instructions, implementation convenience.

## 3. Non-negotiable implementation constraints

- Do not invent final notation punctuation, a final visual vocabulary, or a default recipe.
- Do not describe either Sprint 1 treatment as the final notation system.
- Canonical music is immutable and contains no learning chunks, recipes, experiment definitions, pixels, or line breaks.
- Learning chunks exist only in derived `LearningPlan` artifacts and reference canonical content without copying it.
- Recipes contain no musical events or executable code.
- Strategy/transform versions are exact and reproducible; no `latest` or silent upgrade.
- Unsupported combinations produce structured diagnostics; no fallback or musical approximation.
- Song/arrangement, role/hand, inversion/slash bass/voicing, structural/learning content, and all five specificity states remain distinct.
- Pitch operations are semantic; rendered labels are derived.
- Pattern/repetition/variation provenance remains intact.
- User text is escaped; accessibility does not depend on color.
- Copyrighted music is not committed without lawful basis.

## 4. Required environment

At WP-01, select the then-current compatible Node.js LTS and pin exact Node/npm versions in `.nvmrc`, `package.json#engines`, CI, and the Sprint report. Use:

- TypeScript 5.x;
- npm workspaces;
- JSON Schema 2020-12;
- Vitest;
- HTML plus SVG;
- ESM;
- strict TypeScript;
- deterministic canonical JSON serialization.

Do not add a frontend framework or runtime plugin loader in Sprint 1.

## 5. Required fixtures and artifacts

### 5.1 M-A — `melody-spatial-a`

A lawful synthetic or public-domain canonical arrangement with:

- one complete melody phrase;
- exact register-bearing note events;
- repeated pitch;
- at least one step/small interval and one larger interval;
- at least three distinct durations;
- pickup or subdivision onset;
- at least two `MusicalIdea` records;
- primary-line role;
- no invented harmony.

This exact canonical file drives both functional treatment recipes.

### 5.2 M-B — `melody-learning-b`

A second lawful small arrangement with:

- exact notes;
- at least two musical ideas;
- timing different from M-A;
- enough structure to prove transformation reuse;
- no fixture-specific learning code.

### 5.3 H-C — `harmony-grid-c`

Retain a lawful small fixture with:

- two or more chords in one measure;
- repeated idea;
- alternate ending;
- exact rational timing;
- musical ideas.

Required use: canonical validation, normalization/provenance, AT-002/AT-006 regression, and optionally a second or third `idea-boundary@1` plan. Functional broad harmony rendering is not a Sprint 1 gate.

### 5.4 C-D — `contract-voicing-hints`

Retain a minimal lawful contract fixture with:

- canonical `Am7`;
- explicit A slash bass where appropriate;
- separate inversion state;
- explicit required upper voicing;
- intentionally unspecified voicing in a separate event;
- optional exact `C/A` familiar-shape hint;
- another slash chord that cannot be confused with inversion.

Required use: schema/model/semantic validation, normalization, projection/DOM contract tests where implemented, and AT-003–AT-005/AT-009–AT-010. Full visual treatment is deferred unless every mandatory workbench gate already passes.

### 5.5 Recipes

Commit:

- `experiments/recipes/explicit-grid.recipe.json`
- `experiments/recipes/proportional-spatial-melody.recipe.json`

Each pins exact strategy versions and contains no music.

### 5.6 Learning transformation

Commit `learning/transformations/idea-boundary.learning-transform.json`, selecting `mnls.learning.idea-boundary@1` with parameters usable unchanged for M-A and M-B.

### 5.7 Experiment definition

Commit `experiments/definitions/spatial-melody-comparison.experiment.json` referencing M-A and both recipes, with:

- research question;
- controlled variables;
- changed variables;
- tasks;
- observation definitions;
- draft/ready status;
- no claim of effectiveness.

## 6. Work order and completion gates

Complete work packages in order. Do not begin a dependent package until the preceding completion gate passes.

### WP-01 — Initialize workspace and quality gates

Create the workspace/packages/directories in `RepositoryStructure.md`.

Required:

- root scripts for build, lint, typecheck, unit/integration/corpus/reproducibility tests, and `check`;
- exact Node/npm pins;
- strict shared TypeScript config;
- Vitest config;
- dependency-cycle check;
- deterministic serializer utility contract;
- CI workflow running `npm ci` and `npm run check`;
- gitignore for generated output/plans while retaining expected artifacts.

**Gate:** fresh clone installs and empty package tests/build/typecheck/lint pass.

### WP-02 — Implement schema families `0.1.0`

Implement JSON Schema 2020-12 for:

1. canonical document;
2. representation recipe;
3. learning transformation definition;
4. learning plan;
5. experiment definition;
6. resolved recipe/treatment/experiment manifests.

Required canonical rule: `Arrangement.learningChunks` is invalid.

Required configuration rules:

- exact ID/version fields;
- no arbitrary code/raw markup;
- no canonical event payloads in recipes/plans;
- discriminated specificity union;
- valid/invalid examples for every root.

Generate or mechanically verify TypeScript type parity.

**Gate:** schema example suite passes and rejects the mandatory negative cases in TestingStrategy §5.

### WP-03 — Implement canonical model primitives and semantic validation

Implement:

- stable IDs and typed refs;
- exact `Rational`, `TimePosition`, `Duration`, measure coordinates;
- `SpecificValue<T>` five-state union;
- Song/Arrangement/Section/MusicalIdea/Transition;
- roles and independent hand assignments;
- NoteEvent and required harmony contracts;
- pattern/repetition/variation/provenance interfaces required by fixtures;
- familiar-shape hint contract;
- semantic validators and structured diagnostics.

Do not implement learner-plan ownership in model.

**Gate:** M-A, M-B, H-C, and C-D validate; required invalid/contradiction cases fail with stable codes.

### WP-04 — Implement canonical pitch strategy boundary

Implement `PitchStrategy` and `spelled-pitch@1` sufficient for:

- exact register-bearing melody pitch;
- pitch-class comparison for C-D;
- semantic transposition;
- deterministic labels under pinned options;
- semitone/ordered-pitch calculation used by visual mapping through a public semantic operation, not library leakage.

Run the pitch conformance suite.

**Gate:** M-A transposes to at least one additional key/interval and inverse/identity tests pass where supported.

### WP-05 — Implement deterministic normalization and provenance

Implement reference resolution, exact timeline materialization, direct event normalization, required pattern/repetition/variation behavior for H-C, hand assignment resolution, and append-only provenance.

Normalized output contains no recipe, learning chunk, or layout fields.

**Gate:** all fixtures normalize deterministically; H-C repeat/alternate ending provenance passes; canonical hashes remain unchanged.

### WP-06 — Implement capability analysis and strategy catalogs

Implement:

- `ArrangementCapabilityProfile` with evidence refs;
- `StrategyDescriptor`, `StrategyCatalog`, exact version resolution;
- representation strategy kinds;
- learning transformation descriptors/registry;
- deterministic registry ordering;
- `supported`, `supported-with-limitations`, `incompatible`, `unavailable` result model.

Initial capabilities must cover exact onset/duration, exact register pitch, musical ideas, roles, hands status, harmony, pitch-class-set comparison, and learning-plan availability.

**Gate:** capability/registry/compatibility unit tests cover all four statuses and prove recipes cannot forge capabilities.

### WP-07 — Implement reusable learning transformation and derived plans

Implement `@mnls/learning` contracts and `mnls.learning.idea-boundary@1`.

Required behavior:

- definition and parameters validated;
- one chunk per selected musical idea;
- deterministic chunk IDs/order;
- canonical-ref/time-span selectors only;
- no copied event payloads;
- arrangement/transformation/parameter hashes and provenance;
- plan verification/regeneration;
- structured diagnostic when musical ideas are absent;
- plan-local override framework sufficient for validation tests; full authoring UI not required.

Generate plans for M-A and M-B using the same definition and parameter file. H-C may be included as additional proof.

**Gate:** both plans validate and regenerate byte-identically; canonical files remain byte-identical; no fixture-specific transformation branch exists.

### WP-08 — Implement recipe resolution and compatibility

Implement recipe load/schema validation, strategy option schemas, exact resolution, fully materialized presentation defaults, resolution hash, cross-strategy compatibility, limitation acknowledgment, and no-fallback behavior.

Required invalid examples:

- missing strategy version;
- unavailable version;
- exact hand isolation with unknown hands;
- duration strategy without exact duration;
- grid subdivision too coarse for selected onset;
- learning overlay without valid plan;
- recipe containing musical events or executable content.

**Gate:** both required recipes resolve as supported for M-A; invalid combinations produce stable structured diagnostics and no output.

### WP-09 — Implement projection for melody treatments and plan overlays

Implement `ProjectedView` for:

- full selected melody phrase/excerpt;
- exact note events, time, pitch, role, specificity, provenance;
- structural idea boundaries when requested;
- optional learning-plan chunk overlay;
- exact-pitch label source data;
- no final coordinates.

Retain canonical harmony/hint priority contracts in projection tests using C-D, even if no full C-D layout is implemented.

**Gate:** M-A projection content hash is the same semantic selection for both recipes; recipe differences have not entered canonical/normalized/projected event values.

### WP-10 — Implement layout strategy interfaces and explicit-grid treatment

Implement layout scalar/rounding, scene model, and:

- `mnls.time.fixed-beat-grid@1`;
- `mnls.duration.grid-span@1`;
- `mnls.pitch.absolute-chromatic-y@1`;
- `mnls.labels.exact-pitch@1`;
- `mnls.overlay.beat-subdivision@1`;
- required accessibility scene descriptions.

Exact onset/duration must map to cells. Insufficient configured subdivision fails; it is never rounded.

**Gate:** explicit-grid mathematical assertions and semantic scene tests pass for M-A.

### WP-11 — Implement proportional spatial-melody treatment

Implement:

- `mnls.time.proportional@1`;
- `mnls.duration.proportional-extent@1`;
- `mnls.overlay.time-reference@1`;
- reuse of absolute-chromatic y mapping and exact labels.

Required assertions:

- onset x linear in rational time;
- semantic width linear in duration;
- equal pitch equal y;
- higher pitch higher visually;
- larger interval larger absolute displacement;
- exact pitch/onset/duration retained in accessible scene data;
- basic duration does not require flags, stems, or conventional note-value symbols.

**Gate:** proportional spatial invariant suite passes for M-A and output differs from explicit grid only through recipe/layout-derived artifacts.

### WP-12 — Implement safe accessible HTML/SVG and comparison output

Implement:

- renderer consuming only `LayoutPlan`;
- semantic HTML around SVG;
- source-order accessible event list/table;
- treatment name/ID/version/status/limitations;
- escaped text and no scripts/external resources;
- deterministic SVG IDs/classes/data refs;
- manifest/provenance/diagnostic/resolved-recipe files;
- generated deterministic comparison page for two treatments.

The words “final notation,” “approved notation,” or equivalent must not describe a treatment.

**Gate:** semantic DOM, security, accessibility, deterministic-byte, and treatment-label tests pass.

### WP-13 — Implement CLI and experiment reproduction

Implement commands:

```text
music validate
music normalize
music transpose
music strategy list/describe
music recipe validate/resolve
music learning strategy list
music learning validate/plan/verify
music render --recipe
music compare --recipes
music experiment run
music corpus test
music vocabulary report
```

`music experiment run` resolves the committed spatial comparison definition and emits:

- both treatment bundles;
- resolved recipe files;
- experiment run manifest;
- top-level comparison page;
- diagnostics/provenance;
- output hashes.

Rerun must be byte-identical. Missing/version/hash mismatch fails rather than upgrades.

**Gate:** CLI integration and reproduction tests pass from a clean output directory.

### WP-14 — Complete regression, traceability, and Sprint report

Complete:

- all acceptance mappings in TestingStrategy §19;
- C-D contract tests for harmony/inversion/slash bass/voicing/hints;
- H-C normalization/repetition regression;
- specificity full-pipeline suite;
- source-policy checks;
- traceability verification;
- coverage report listing deferred functional renderer work;
- Sprint 1 report with versions, commands, fixture sources, output paths/hashes, diagnostics, assumptions, deviations, and screenshots only as supplemental evidence.

**Gate:** `npm run check` passes twice with no generated diff and all Sprint exit criteria evidenced.

## 7. Required output bundle

A successful Sprint 1 demonstration command must be documented, for example:

```text
music experiment run experiments/definitions/spatial-melody-comparison.experiment.json \
  --out output/spatial-melody-comparison
```

Expected structure:

```text
output/spatial-melody-comparison/
  index.html
  experiment-run.json
  diagnostics.json
  explicit-grid/
    index.html
    manifest.json
    resolved-recipe.json
    provenance.json
  proportional-spatial-melody/
    index.html
    manifest.json
    resolved-recipe.json
    provenance.json
```

Learning plans are generated separately and may be included in treatment bundles when a recipe enables the learning overlay.

## 8. Definition of done

Sprint 1 is complete only when:

- [ ] fresh clone: `npm ci && npm run check` passes;
- [ ] canonical schema/model contain no arrangement-owned learning chunks;
- [ ] M-A renders functionally through both required recipes;
- [ ] both treatments consume the exact same canonical and normalized source hashes;
- [ ] recipe selection/options require no TypeScript source edit;
- [ ] recipe/strategy versions and resolved options appear in manifests;
- [ ] explicit grid gives exact beat/subdivision onset and duration;
- [ ] proportional spatial melody maps onset, duration, and pitch according to required invariants;
- [ ] exact pitch remains visible or accessibly available;
- [ ] one reusable transformation generates valid plans for M-A and M-B without fixture-specific code;
- [ ] learning chunks reference canonical content and copy no events;
- [ ] unsupported/unavailable combinations produce structured diagnostics and no fallback;
- [ ] experiment definition reproduces byte-identical treatment outputs/run manifest;
- [ ] canonical inputs remain byte-identical across rendering/planning;
- [ ] all five specificity states survive tested full pipeline;
- [ ] harmony/inversion/slash bass/voicing/hint distinctions remain protected by C-D regression;
- [ ] repetition/alternate ending provenance remains protected by H-C regression;
- [ ] all text is escaped and generated output passes accessibility gates;
- [ ] human observation fields remain separate from automated evidence;
- [ ] no output or documentation selects a final notation or default learning strategy;
- [ ] traceability and Sprint report are complete.

## 9. Explicitly deferred to Sprint 2 or later

Provided all contract tests remain:

- polished local browser control panel/live preview;
- graphical recipe editor;
- staff-like, diatonic, key-relative, interval-relative, and contour-only pitch mappings;
- additional duration treatments;
- full functional harmony/role/hand/learning-chunk view suite;
- broad lyric rendering;
- generated familiar-shape hints;
- full golden corpus categories;
- authoring tools and migration UI;
- final notation punctuation or learner-facing defaults.

A deferred item may be implemented only after mandatory Sprint 1 gates pass and may not delay the required vertical slice.

## 10. Escalation rules

Escalate only when:

1. approved requirements/direction conflict;
2. a configuration dimension cannot be classified as presentation versus musical meaning;
3. a transformation requires a new learner-facing concept;
4. a recipe would materially misrepresent music and no diagnostic/compatibility rule resolves it;
5. interactive browser configuration is proven necessary to meet the Sprint 1 objective;
6. deferring existing behavior would violate a required acceptance criterion rather than merely functional breadth;
7. a strategy is being proposed as a default;
8. lawful fixtures cannot substitute for blocked copyrighted material.

Required format:

1. blocked requirement/decision/handoff section;
2. concrete musical example;
3. options considered;
4. effect on vocabulary and corpus;
5. recommendation;
6. work that can continue meanwhile.

Ordinary implementation choices must be made and documented, not escalated.

## 11. Exact first prompt for the Implementation Agent

```text
You are the Implementation Agent for Music Notation Learning System Sprint 1, revised after Architecture Sprint 0.1.

Read the governing documents in the exact order listed in Agents/05_Implementation/Sprint1.md. Treat the Constitution, approved Product Owner direction, requirements, acceptance tests, Architecture Sprint 0.1 documents, ADRs, and this sprint plan as authoritative in that order.

Implement the work packages in order, beginning with WP-01. Do not invent final notation punctuation, a final visual vocabulary, a default recipe, or a default learning strategy.

Preserve canonical musical authority. Arrangement must not own learning chunks, recipes, experiment definitions, or layout. Learning chunks must exist only in derived LearningPlan artifacts created by reusable, versioned, deterministic transformations and must reference canonical content without copying or mutating it.

Implement declarative versioned representation recipes and evidence-backed strategy capability/compatibility validation. Unsupported or unavailable combinations must produce structured diagnostics; never fall back silently or create musical meaning.

Implement the two required functional treatments from the same canonical melody fixture: explicit-grid@1 and proportional-spatial-melody@1. In the spatial treatment, horizontal position represents canonical onset, horizontal extent represents canonical duration, and vertical position consistently represents pitch. Preserve exact pitch/time in accessible output.

Implement mnls.learning.idea-boundary@1 and apply the same definition and parameters to at least two compatible fixtures without fixture-specific source branches. Preserve plan and canonical provenance.

Keep harmony, inversion, slash bass, voicing, specificity, repetition, variation, and familiar-shape semantics protected by the required contract/regression fixtures even where broad functional rendering is deferred.

Produce reproducible experiment outputs and manifests, run every required check, update traceability and the Sprint 1 report, and do not declare completion until every Definition of Done item is evidenced. Escalate only through the repository's required escalation format when a genuine product or architecture decision blocks work.
```
