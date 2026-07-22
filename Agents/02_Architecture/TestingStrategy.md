# Testing Strategy

Status: Architecture Sprint 0.1 Product Owner amendments complete — proposed for approval
Architecture baseline: 0.2

## 1. Objectives

Testing must prove that canonical music remains authoritative while reusable learning transformations and declarative representation recipes produce deterministic, truthful, accessible, and reproducible derived artifacts.

Automated tests prove software behavior. They do not prove that a treatment improves learning. Human evaluation remains a separate protocol and observation record.

## 2. Test layers

1. schema validation;
2. canonical semantic model behavior;
3. pitch strategy conformance;
4. normalization and provenance;
5. semantic transposition;
6. controlled harmony-vocabulary conformance;
7. artifact-scoped arrangement/plan/renderer/environment capability analysis;
8. learning transformation and plan validation;
9. recipe resolution and composite strategy compatibility;
10. projection;
11. strategy-driven layout;
12. HTML/SVG semantic DOM, security, and accessibility;
13. experiment/run reproducibility;
14. corpus regression and vocabulary/coverage reporting;
15. workbench-usability evidence under A-011;
16. human learning protocol outside automated gates.

## 3. Mandatory construct rule

Every canonical type, derived artifact type, strategy kind, transformation primitive, and externally visible diagnostic requires:

1. a valid schema example;
2. an invalid structural example;
3. an invalid semantic/compatibility example where applicable;
4. TypeScript contract/type test;
5. deterministic round-trip or canonical serialization test;
6. provenance test when derived;
7. transposition test when pitch bearing;
8. rendering/DOM test when visible;
9. corpus regression case when the construct was introduced by representative music;
10. requirement/ADR/handoff traceability.

Visual snapshots may supplement but never replace semantic or mathematical assertions.

## 4. Fixture taxonomy

### 4.1 Requirement-isolation fixtures

Small synthetic JSON focused on one rule: specificity, inversion/slash bass, dangling refs, grid incompatibility, unknown hands, false hint equivalence, recipe conflicts, copied events in learning plans.

### 4.2 Sprint 1 vertical fixtures

- **M-A `melody-spatial-a`:** exact register-bearing melody, repeated pitch, small and large intervals, varied durations, pickup or subdivision onset, musical-idea boundaries. Same canonical source for both functional rendering treatments.
- **M-B `melody-learning-b`:** second lawful melody/arrangement with at least two musical ideas. Used with the same `idea-boundary@1` transformation.
- **H-C `harmony-grid-c`:** multiple chords in one measure, repeated idea, alternate ending, exact rational timing, musical ideas. Retained for normalization/provenance and as a second transformation target when compatible.
- **C-D `contract-voicing-hints`:** canonical `Am7`, explicit A bass, `C/A` exact hint, required and intentionally unspecified voicings, independent inversion/slash bass. Contract-level rendering/projection tests; full treatment rendering deferred unless capacity remains.

All fixtures have lawful source records and explicit limitations.

### 4.3 Golden corpus fixtures

Permanent category fixtures C-G01–C-G09. Sprint 1 does not claim broad corpus completion; it reports uncovered categories and retains source-policy gates.

### 4.4 Generated/property cases

Generated rational times, pitch sequences, specificity states, strategy option combinations, malicious text, and graph structures. Generators must be seeded and report the seed on failure.

## 5. Schema tests

Validate separate schema families:

- canonical `0.1.0`;
- representation recipe `0.1.0`;
- learning transformation definition `0.1.0`;
- learning plan `0.1.0`;
- experiment definition `0.1.0`;
- resolved recipe/run manifest `0.1.0`;
- chord-quality vocabulary `0.1.0`.

Required negative tests:

- `Arrangement.learningChunks` rejected;
- recipe contains note/chord events, x/y, raw markup, or executable fields;
- transformation definition contains executable callback/script;
- learning chunk copies event payload;
- unpinned strategy/transformation version;
- missing experiment controlled/changed variable declarations;
- specificity absent-value state contains `value`;
- canonical renderer coordinates/line breaks;
- unrestricted chord-quality string;
- unknown chord-quality vocabulary/version/ID;
- alias used as canonical quality identity;
- authoritative `function` or `romanNumeral` string;
- recipe-authored capability evidence;
- arrangement profile containing learning-plan, renderer, environment, or experiment capabilities.

Schema examples compile in CI and are cross-checked against TypeScript public types.

## 6. Canonical semantic validation

Retain Sprint 0 tests for:

- song/arrangement separation;
- exact rational time and measure coordinates;
- roles independent of hands;
- structural ideas independent of learning plans;
- inversion, slash bass, and voicing independent;
- all five specificity states;
- patterns/repetitions/variations/alternate endings and cycles;
- lyrics anchored without whitespace;
- familiar-shape hint equivalence/suppression;
- controlled `ChordQualityRef` resolution and derived labels;
- free-form harmonic annotations remain annotation-only;
- lawful source records.

Add a canonical-boundary test asserting that deleting every recipe, plan, and experiment file leaves canonical validation/meaning unchanged.

## 7. Controlled harmony vocabulary

For each registered immutable vocabulary version assert:

- known `ChordQualityRef` values resolve to semantic definitions;
- unknown vocabulary, version, or quality IDs fail with stable diagnostics;
- aliases resolve only during authoring/display lookup and never serialize as semantic identity;
- display labels derive from validated root/quality/degrees/options;
- vocabulary registration order does not change results;
- new shared quality admission requires a governance/corpus record;
- `HarmonicAnalysisAnnotation` text/system/tags cannot affect validation, transposition, capability analysis, learning transformations, projection selection, layout, rendering strategy selection, or compatibility;
- no code branches on arbitrary Roman-numeral/function text.

## 8. Pitch strategy conformance

Every canonical `PitchStrategy` implementation passes:

- payload schema/semantic validation;
- pitch versus pitch-class kind distinction;
- equality/comparison laws;
- transposition identity and inverse where supported;
- interval composition;
- deterministic formatting under pinned options;
- no library-specific type leakage;
- enharmonic/spelling behavior documented and tested.

Every visual `PitchMappingStrategy` separately passes its descriptor contract. Canonical pitch representation and y mapping are never conflated.

## 9. Specificity preservation suite

For each state — required, suggested, optional, intentionally unspecified, unknown — assert identity through:

```text
load -> schema -> semantic -> normalize -> transpose
-> capability analysis -> learning-plan selection
-> recipe projection -> explicit-grid layout/render
-> proportional-spatial layout/render
```

No stage may add a value to absent-value states. DOM/accessibility output contains state text when relevant. Hand-filter and overlay tests preserve unknown/unspecified rather than infer assignment.

## 10. Normalization and provenance

Required assertions:

- deterministic event order and IDs;
- exact rational reduction;
- pattern/repetition/variation expansion;
- alternate ending differences explicit;
- source family preserved;
- every normalized event begins with canonical provenance;
- pattern/override/repetition/variation steps appended in deterministic order;
- no learning-plan/recipe/layout data in normalized output;
- canonical input deep-frozen/content hash unchanged;
- cycles and expansion limits fail with structured diagnostics.

H-C exercises repeat/alternate-ending provenance. C-D exercises harmony distinctions through normalization.

## 11. Transposition tests

### Invariants

- form, IDs, exact time, roles, hands, source relationships, patterns, repetition, learning-plan selectors, recipe content, and experiment variables remain stable;
- pitch-bearing semantic values transpose through `PitchStrategy`;
- rendered labels are regenerated, not string shifted;
- hints are revalidated;
- both treatment recipes remain usable when their capabilities still hold.

### Metamorphic tests

- transpose by identity yields semantic equality;
- transpose by interval and inverse restores semantic values where the strategy supports it;
- normalize then transpose equals transpose then normalize where the pattern contract declares commutativity;
- generating a learning plan before versus after transposition yields equal selectors/relationships and different only in arrangement hashes where expected.

## 12. Artifact-scoped capability tests

### Arrangement profile

- exact timing/pitch evidence derives only from validated canonical/normalized events;
- partial/unknown hand states remain distinct;
- musical-idea capability appears only when valid ideas exist;
- pitch-class-set comparison depends on registered canonical pitch/harmony support;
- no learning-plan, renderer, environment, or experiment capability appears;
- deleting all plans leaves the profile byte-identical;
- recipe/fixture metadata cannot forge evidence;
- every item cites canonical authority, artifact/hash, and relevant refs.

### Learning-plan profile

- generated only after plan hash, arrangement ID/hash, references, and deterministic regeneration verify;
- stale arrangement hash yields no profile and stable error;
- plan evidence cites plan and canonical targets;
- plan cannot forge exact timing, pitch, harmony, role, or hand authority;
- the same valid plan supports multiple recipes without changing arrangement profile output.

### Renderer and environment profiles

- installed renderer/environment descriptors produce separate profiles;
- unsupported overlay/accessibility features are not placed on the arrangement;
- profiles and implementation/environment hashes are deterministic.

### Composite compatibility

- a requested learning overlay without a verified matching plan is incompatible;
- all four statuses are covered;
- diagnostics identify required source and authoritative evidence or absence;
- no fallback strategy/profile is synthesized.

## 13. Learning transformation tests

### Registry and definition

- duplicate/missing version rejection;
- parameter schema valid/invalid/default materialization;
- unavailable implementation classification;
- descriptor conformance and deterministic flag.

### `idea-boundary@1`

- same definition/parameters apply to M-A and M-B (and H-C if used) without fixture-specific code;
- one deterministic chunk per selected musical idea;
- selectors reference canonical IDs/spans;
- no canonical event payload copied;
- output order is exact start then stable ID;
- repeated run byte identical;
- fixture with no musical ideas returns `LEARN_CAPABILITY_MISSING`;
- role filter restricts selectors without changing roles;
- transposition leaves chunk selectors/relationships stable.

### Plan overrides and verification

- stable precedence and provenance;
- suppress/split/merge/filter only affect plan;
- conflicting overrides fail;
- stale arrangement/definition hash fails verification;
- regeneration matches committed expected plan;
- prerequisite graph cycle rejected.

## 14. Recipe and strategy tests

### Registry

- unique strategy ID/version/kind;
- descriptor/implementation version match;
- deterministic listing independent of registration order;
- missing pinned version is `unavailable`;
- kind-specific conformance suites.

### Recipe resolution

- schema/option validation;
- exact version pinning;
- presentation defaults fully materialized;
- no musical default insertion;
- canonical option ordering/hash;
- recipe containing canonical music or arbitrary code rejected;
- recipe version/options reflected in output manifest.

### Compatibility matrix

Test all four statuses with exact diagnostics:

- supported;
- supported with acknowledged limitation;
- incompatible;
- unavailable.

Required examples:

- contour-only y mapping plus exact label strategy: compatible only under declared independent exact-pitch access;
- exact hand isolation with unknown hands: incompatible;
- display of unknown hands without isolation: supported with limitation;
- duration extent with unknown duration: incompatible;
- grid resolution too coarse for onset: incompatible or layout error, never rounding;
- requested learning-plan overlay without a verified matching plan: incompatible;
- stale plan hash: error before compatibility;
- renderer overlay unsupported by renderer profile: incompatible or acknowledged limitation;
- false hint overlay capability: incompatible/suppressed upstream.

Assert no fallback strategy is selected.

## 15. Projection tests

- same normalized source and selected content for M-A across both recipes;
- role/hand filters preserve structural/time context;
- optional learning-plan chunk overlay requires a verified matching plan profile and references plan/canonical sources;
- disclosure hides only allowed information;
- canonical harmony remains primary over hints;
- projected nodes contain no final coordinates;
- limitations/provenance retained.

## 16. Layout strategy tests

### 15.1 Exact arithmetic

Use rational expected values and canonical decimal serialization. No approximate screenshot-only checks.

### 15.2 Explicit beat grid

- beat/subdivision markers at exact boundaries;
- event onset maps to the correct cell;
- duration spans correct cell range;
- pickup/subdivision onset represented;
- insufficient subdivision returns diagnostic rather than rounding;
- repeated pitch maps to same y;
- exact pitch text contract available.

### 15.3 Proportional spatial melody

For every selected event:

```text
x2 - x1 = unitsPerBeat * (t2 - t1)
width = unitsPerBeat * duration
abs(y2 - y1) = unitsPerSemitone * abs(semitone2 - semitone1)
```

Assert:

- earlier events left of later events;
- higher pitch visually higher;
- repeated pitch identical y;
- larger interval larger displacement;
- longer duration greater semantic horizontal extent;
- minimum hit-area decoration does not change semantic duration edge;
- no stems/flags/traditional note-value glyphs are needed for the duration assertion;
- exact pitch/onset/duration present in accessible content.

### 15.4 Independence

Swap compatible label/overlay options without changing time/pitch geometry. Change time strategy without changing canonical/projection content. Invalid cross-strategy combinations fail before layout.

## 17. Rendering, security, and accessibility

### Semantic DOM assertions

- treatment name, ID/version, experimental/comparison status;
- canonical arrangement ID/hash reference;
- exact pitch/time/duration event text;
- beat/subdivision markers for grid;
- recipe/strategy versions and limitations;
- source IDs/provenance hooks;
- specificity text;
- canonical harmony primary and hints subordinate when C-D is projected.

### Security

Property-based malicious text in titles, lyrics, labels, recipe names, experiment questions, annotations, and metadata must render as text. Assert no script execution, raw `innerHTML`, unsafe URL, path traversal, or option-supplied CSS/markup.

### Accessibility

- automated accessibility checker on generated pages;
- heading/landmark structure;
- source-order event list/table;
- keyboard focus order;
- SVG title/description;
- no color-only meaning;
- zoom/reflow smoke test;
- treatment limitations available in text;
- exact pitch/time available independent of spatial perception.

## 18. Experiment reproducibility

- definition schema and reference resolution;
- E-007 research question states proportional horizontal onset/duration versus explicit grid;
- controlled and changed variables nonempty and disjoint unless explicitly justified;
- E-007 holds canonical/normalized source, absolute-chromatic y mapping, exact labels, accessibility data, and renderer environment constant;
- changed variables are time mapping, duration encoding, and temporal reference overlay;
- output/docs do not call E-007 a complete pitch-mapping comparison;
- E-008 records future pitch-mapping comparison with time/duration held constant;
- fixture/recipe/transformation hashes pinned;
- rerun produces byte-identical treatment outputs and manifests;
- changing one declared changed variable changes recipe/run hash;
- changing a controlled variable without updating definition produces mismatch/failure;
- missing strategy/transformation version fails, never upgrades;
- comparison page contains all treatments and statuses;
- human observation records are not generated by automated run and are stored separately;
- no output language claims a treatment is effective or final.

## 19. Corpus regression and coverage

`music corpus test` reports:

- C-G01–C-G11 category coverage;
- requirements/ADRs/handoff obligations exercised;
- strategy/transformation/recipe coverage;
- source-lawfulness status;
- vocabulary introduced by canonical patterns versus experiment strategy IDs;
- deferred functional-render coverage.

New shared musical pattern admission still requires E-005 evidence. New visual strategies do not count as canonical learner vocabulary until Product Owner approval, but their experiment identifiers are reported separately.

## 20. Acceptance-test mapping

| Acceptance | Sprint 1 coverage |
|---|---|
| AT-001 | M-A/M-B exact notes, no invented harmony |
| AT-002 | H-C exact chord timing; explicit-grid time tests |
| AT-003–AT-005 | C-D canonical/normalization/projection contracts |
| AT-006 | H-C repetition/ending provenance |
| AT-007 | projection contract; full role UI may defer |
| AT-008 | M-A transposition plus treatment/plan invariants |
| AT-009–AT-010 | C-D hint validation/projection tests |
| AT-011 | separate human-observation artifact; no automated learning claim |
| AT-012 | lyric model/escaping contracts; functional breadth may defer |
| AT-013 | no final syntax/default scan |
| AT-014 | arrangement rejects chunks; one transformation creates reference-only plans for M-A/M-B |
| AT-015 | same source renders through two declarative recipes without source edits |
| AT-016 | separate arrangement/plan/renderer/environment profiles and evidence authority |
| AT-017 | stale/missing plan overlay incompatibility; valid plan reuse |
| AT-018 | controlled quality IDs, aliases, and derived labels |
| AT-019 | annotations cannot affect semantics or branching |
| AT-020 | immutable reproducible run evidence separate from observations |
| AT-021 | E-007 controlled/changed-variable and shared-y assertions |
| AT-022 | Sprint report contains A-011 workbench-usability evidence |

## 21. CI and local gates

`npm run check` order:

1. formatting verification;
2. lint;
3. typecheck/build;
4. schema examples/type parity;
5. chord-quality vocabulary conformance;
6. artifact-profile authority/dependency tests;
7. unit/property tests;
8. integration/CLI tests;
9. fixture generation and canonical hash checks;
10. learning-plan regeneration/profile verification;
11. two-treatment deterministic rendering;
12. accessibility/security checks;
13. experiment reproduction/E-007 control verification;
14. corpus/traceability/coverage reports.

A fresh clone must run with `npm ci` and no uncommitted generated differences after checks.

## 22. Workbench usability validation

The Sprint 1 report must record A-011 evidence: time to create/modify a recipe, strategy-discovery comprehension, option-schema/diagnostic sufficiency, implementation changes needed for a recipe-only experiment, treatment-switching friction, rerun/reproduction friction, variant-saving friction, and whether live preview appears necessary. This evaluates the research workbench, not learner outcomes.

## 23. Human learning validation

Experiment definitions may specify tasks and observation fields for comprehension, memory, execution, coordination, time, errors, and subjective friction. Automated tests only verify that these dimensions can be recorded separately. Human results require Product Owner/Validation Agent procedure and cannot be synthesized from render output.

## 24. Rejected approaches

- screenshot approval as semantic proof;
- tests specialized to duplicated treatment fixtures;
- unseeded property generators;
- fallback strategies hidden from expected output;
- plans validated only by successful rendering;
- checking only the happy-path recipe matrix;
- using automated output as evidence of learning benefit;
- allowing deferred harmony/voicing rendering to remove their canonical regression tests.
