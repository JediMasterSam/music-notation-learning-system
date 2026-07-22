# Testing Strategy

Status: Architecture Sprint 0 complete — proposed for review

## 1. Objectives

Testing must prove semantic correctness, preservation of approved distinctions, deterministic derivation, safe accessible rendering, and corpus-wide abstraction fitness. Passing parser or renderer tests does not prove learning value; human evaluation remains a separate product validation track.

Linked requirements: R-004–R-050. Acceptance tests: AT-001–AT-013.

## 2. Test layers

| Layer | Scope | Primary package | Required evidence |
|---|---|---|---|
| schema | JSON shape and discriminated unions | `schema` | valid/invalid examples for every canonical construct |
| semantic model | invariants and typed references | `model`, `validator` | exact diagnostic codes and canonical IDs |
| pitch strategy | validation, formatting, transposition capabilities | `pitch` | strategy conformance suite |
| pattern engine | parameters, composition, overrides, provenance | `patterns` | deterministic expansion and vocabulary reports |
| normalization | references, repeats, variations, endings, timing | `normalizer` | normalized semantic assertions and provenance |
| transposition | graph-wide semantic preservation | `transposition` | metamorphic and round-trip tests |
| projection | role/hand/chunk/excerpt filtering | `projection` | retained time/structure and no semantic mutation |
| layout | beat cells, lanes, adaptive priorities | `layout` | structural plan assertions |
| rendering | DOM/SVG, escaping, accessibility | `renderer-html` | semantic DOM assertions plus limited snapshots |
| CLI | orchestration, files, exit codes | `cli` | black-box command tests |
| corpus | representative permanent regressions | `corpus-tools` | source policy, coverage, vocabulary, output checks |
| human learning | comprehension, memory, execution, coordination | Product Owner/validation | repeatable protocol and observations |

## 3. Mandatory construct test rule

Every canonical semantic construct requires:

1. at least one valid schema example;
2. at least one invalid structural or semantic example;
3. model/reference behavior test;
4. specificity-state test when omission can be meaningful;
5. transposition test when pitch-bearing;
6. normalization/provenance test when reusable or referenced;
7. rendering test when learner-visible;
8. corpus regression when the construct is introduced or challenged by representative music.

A construct is incomplete until its invalid behavior is defined.

## 4. Fixture taxonomy

### Requirement-isolation fixtures

Small synthetic fixtures under `packages/test-fixtures/fixtures` isolate one rule and are safe to modify as tests evolve. Naming uses requirement/acceptance IDs, for example `at-004-unspecified-voicing.json`.

### Golden corpus fixtures

Permanent lawful fixtures under `corpus/fixtures` exercise combinations representative of real music. They require source-register entries and explicit behavior coverage. They are not chosen for ease of encoding.

### Generated test cases

Deterministic test generators may create rational times, specificity states, transposition operations, and reference graphs. A fixed seed is recorded on failure. No generated case becomes a golden-corpus item without source and product review.

## 5. Schema tests

- Compile every supported schema with strict JSON Schema 2020-12 settings.
- Validate every published valid and invalid example.
- Assert diagnostic JSON pointers and stable schema error mapping.
- Test `additionalProperties` behavior and namespaced extensions.
- Test all `SpecificValue<T>` branches.
- Test exact rational shapes and positive denominators.
- Test no canonical layout fields through a forbidden-field fixture set.
- Test schema version rejection and explicit migration requirement.

Schema snapshots may capture schema files, but behavior assertions remain authoritative.

## 6. Semantic validation tests

Passes are tested independently and as an ordered aggregate:

- stable ID uniqueness and wrong-kind references;
- song/arrangement linkage;
- event spans and measure map consistency;
- sections versus learning chunks;
- roles versus hands;
- inversion versus slash bass versus voicing;
- unknown versus intentionally unspecified;
- pattern/repetition/variation cycles;
- override target and allowlist rules;
- lyric anchors;
- lawful source status;
- familiar-shape exact/subset/approximation classification.

Tests assert diagnostic code, severity, canonical ID, JSON pointer, and requirement ID where applicable. Message wording may be snapshot-tested separately but is not the only assertion.

## 7. Pitch-strategy conformance suite

Every registered strategy runs the same contract tests:

- accepts its valid pitch and pitch-class payloads;
- rejects wrong-kind and malformed payloads;
- formats without changing semantic values;
- transposes supported values deterministically;
- preserves or explicitly reports spelling decisions;
- compares pitch-class sets when capability is declared;
- round-trips supported operations where musically valid;
- never exposes third-party library types through public contracts.

`spelled-pitch@1` is required in Sprint 1. At least one minimal test strategy proves registry replacement and unsupported-capability diagnostics.

## 8. Specificity preservation suite

For each of the five states, create a fixture that passes through:

```text
schema -> model -> semantic validation -> normalization -> transposition
-> projection -> layout -> render manifest
```

Assertions:

- state is unchanged;
- value-bearing states transpose only the value;
- absent-value states never acquire a value;
- view hiding does not modify source/normalized state;
- rendered state uses noncolor text/semantic tokens;
- serialization round-trip preserves state.

This suite is a release gate.

## 9. Normalization and provenance tests

Required cases:

- direct event;
- referenced musical idea;
- repeated idea;
- repeated idea with alternate ending;
- document-local pattern;
- nested pattern;
- pattern override;
- variation after pattern expansion;
- role assignment plus independent hand assignment;
- event crossing measure boundary;
- syncopated subdivision;
- cycle and depth failures.

Each normalized event must identify canonical source ID and every derivation step. Tests compare semantic events and provenance arrays, not only counts or snapshots.

Determinism test: run normalization repeatedly with object insertion orders varied where order is nonsemantic and assert byte-identical canonical serialization of normalized output.

## 10. Transposition tests

### Invariants

Transposition preserves:

- stable IDs;
- time and duration;
- section/idea/chunk structure;
- role and hand assignments;
- repetition, variation, pattern, and transition relationships;
- specificity states;
- provenance source identities;
- canonical hint subordination.

### Metamorphic tests

- transpose by zero yields semantic identity;
- transpose by interval then inverse returns semantic identity where strategy guarantees reversible spelling;
- transpose canonical then normalize equals normalize then transpose for declared-commutative constructs;
- render before/after transposition has identical structure and changed semantic pitch labels only where expected;
- exact familiar-shape equivalence is revalidated after transposition.

Unsupported operations produce explicit diagnostics, never partial string substitution.

## 11. Projection tests

- Full view retains all selected content.
- Harmonic roadmap keeps form, time, canonical harmony, repeat/variation context.
- Role isolation hides unrelated events but keeps section/idea/beat context.
- Hand isolation does not relabel musical roles.
- Unknown/unspecified hand assignment follows explicit view policy.
- Learning chunks reference rather than copy music.
- Excerpts clip visually while retaining source/provenance.
- Showing/hiding hints changes only hint nodes and layout space.

Projection tests deep-freeze normalized input.

## 12. Layout and rendering tests

### Semantic assertions

- multiple chords in one measure occupy distinct beat/subdivision nodes;
- measures do not force idea/chunk boundaries;
- canonical harmony precedes hint in visual and accessible order;
- inversion, slash bass, and voicing use separate nodes and labels;
- repeated source and alternate ending have explicit relationships;
- lyric text anchors to time/event nodes;
- required content is not dropped under compact density;
- unknown and intentionally unspecified are distinguishable without color.

### Security assertions

Inject titles, lyrics, labels, aliases, and annotations containing HTML, SVG, CSS, URL, and script payloads. Assert they are escaped text and cannot create nodes, attributes, styles, URLs, or scripts.

### Accessibility assertions

- unique IDs;
- valid heading order for fixture structure;
- accessible names for groups and SVG;
- reading order matches source order;
- text equivalents for beat position, state, repetition, variation, and hints;
- color-independent state markers;
- no interactive element in Sprint 1 output without keyboard/focus behavior.

Automated assertions do not replace manual screen-reader and zoom review before learner tests.

## 13. Snapshot policy

Snapshots are allowed for:

- stable normalized JSON;
- renderer-neutral layout plan excerpts;
- small HTML/SVG fragments;
- CLI human diagnostic format.

Snapshots may not replace assertions for harmony identity, specificity, provenance, timing, role/hand distinction, hint classification, or accessibility. Large whole-page snapshots require a documented reason and stable serializer.

## 14. Corpus regression

Each corpus fixture declares:

- corpus ID/category;
- source status and repository permission;
- requirements and acceptance tests exercised;
- expected valid/invalid status;
- required semantic assertions;
- required views;
- transposition operations;
- vocabulary expectations;
- known coverage limitations.

`music corpus test` fails when:

- source registration is missing or unlawful for repository use;
- validation/normalization/rendering fails unexpectedly;
- requirement assertions fail;
- vocabulary changes without an approved expectation update;
- normalized/rendered deterministic outputs drift without reviewed semantic cause.

## 15. Acceptance-test mapping

| Acceptance test | Automated coverage | Human coverage |
|---|---|---|
| AT-001 | schema/model/render no invented harmony | none |
| AT-002 | rational time, layout beat cells | place-keeping later |
| AT-003 | separate normalized/render nodes | confusion observation later |
| AT-004 | specificity preservation | performer interpretation later |
| AT-005 | exact required voicing assertions | playability later |
| AT-006 | provenance and variation relationships | recognition later |
| AT-007 | projection assertions | practice usefulness later |
| AT-008 | transposition metamorphic suite | relearning burden later |
| AT-009 | hint semantic/render assertions | usefulness/confusion E-006 |
| AT-010 | validation/suppression cases | misteaching observation E-006 |
| AT-011 | protocol schema only | required human study |
| AT-012 | anchor and escaping tests | lyric readability later |
| AT-013 | repository scan and API tests | none |

## 16. Sprint 1 required fixtures

### Fixture A — Melody only

Covers AT-001 and AT-008 with exact notes, a pickup or tied duration, and two-key render comparison. No harmony object is allowed.

### Fixture B — Beat-aligned harmony

Covers AT-002 and AT-006 with at least two chords in one measure, a repeated idea, and alternate ending.

### Fixture C — Voicing and hint distinctions

Covers AT-003–AT-005 and AT-009–AT-010 with canonical `Am7`, explicit A bass, authored exact `C/A` hint, required voicing, intentionally unspecified voicing, explicit inversion, and a separate slash-bass case that does not imply inversion.

All are synthetic unless a clearly public-domain source is selected and registered.

## 17. CI and local gates

Required merge gate command: `npm run check`.

CI jobs may be parallelized after dependency installation, but the logical gate includes:

1. format verification;
2. lint;
3. strict typecheck;
4. schema compilation/examples;
5. unit/integration tests;
6. accessibility assertions;
7. corpus tests;
8. deterministic rerun check on a representative fixture.

No network access is required for tests after `npm ci`.

## 18. Human learning validation

Automated software tests do not close R-001–R-003 or R-046. A later protocol must record separately:

- comprehension;
- memory;
- physical execution;
- coordination;
- elapsed time;
- errors;
- assistance requested;
- subjective friction.

Early self-evaluation may generate observations but cannot support a general product-success claim until A-006 is resolved.

## 19. Rejected approaches

- snapshots as the primary semantic test;
- only “happy path” corpus songs;
- copyrighted scores committed without lawful basis;
- float-based time comparisons;
- tests that infer expected semantics from renderer output;
- generated hints enabled by default in tests;
- random test generation without reproducible seeds;
- claiming learning success from software correctness.
