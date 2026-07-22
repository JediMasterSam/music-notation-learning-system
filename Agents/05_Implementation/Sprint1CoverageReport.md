# Sprint 1 Coverage Report

Status: Implementation evidence complete; pending Lead Architect conformance review

This report maps Sprint 1 implementation evidence to the approved acceptance tests and corpus categories. It records automated contract evidence, not learner outcomes or Product Owner approval.

## Acceptance evidence

| Acceptance | Sprint 1 evidence | Disposition |
|---|---|---|
| AT-001 | `melody-spatial-a` and `melody-learning-b` contain exact note events and no harmony; layout and renderer tests produce no invented chords. | Covered |
| AT-002 | `harmony-grid-c` validator/normalizer tests retain multiple exact chord onsets; explicit-grid tests use rational onset cells. | Covered |
| AT-003 | C-D validator, normalizer, transposition, and projection tests retain inversion independently from slash bass. | Contract covered; broad harmony rendering deferred |
| AT-004 | C-D retains the intentionally-unspecified voicing specificity state without deriving pitches. | Contract covered |
| AT-005 | C-D retains the required upper-pitch voicing and explicit bass as separate authored evidence. | Contract covered |
| AT-006 | H-C normalization tests materialize the repeat and alternate ending with append-only provenance. | Covered |
| AT-007 | Projection role filtering retains timeline/section context while omitting unrelated events. | Contract covered; role-isolation UI deferred |
| AT-008 | Pitch/transposition tests cover identity, inverse, structure, timing, roles, repetition, hints, ideas, and annotations; full-pipeline specificity test includes transposition. | Covered |
| AT-009 | C-D tests keep canonical Am7 primary, C/A hint subordinate/optional, bass A explicit, and exact pitch-class equivalence. | Contract covered; hint visualization deferred |
| AT-010 | Validator rejects or suppresses misleading hint evidence and authored-voicing conflicts with stable diagnostics. | Covered |
| AT-011 | Experiment schemas define observation dimensions separately; reproducibility tests prove automated output does not emit human observations. | Artifact boundary covered; no human study performed |
| AT-012 | `LyricTrack`/`LyricEvent` schema and semantic tests require time spans or event anchors, reject whitespace positioning, preserve text under transposition, and keep hostile text inert. | Contract covered; broad lyric rendering deferred |
| AT-013 | Canonical data is JSON with typed fields; dependency/output scans and renderer security tests require no final authoring punctuation or implicit representation default. | Covered |
| AT-014 | Schema rejects arrangement-owned chunks; `idea-boundary@1` deterministically creates reference-only plans for M-A and M-B from one definition/parameter artifact. | Covered |
| AT-015 | CLI/workbench tests resolve and render both committed recipes from the same source without source edits. | Covered |
| AT-016 | Capability tests keep arrangement, verified plan, renderer, and environment profiles separate and require authority/hash/ref evidence. | Covered |
| AT-017 | Compatibility tests reject missing/stale learning plans and accept one verified matching plan across both recipes without changing arrangement evidence. | Covered |
| AT-018 | Harmony tests reject unknown quality IDs and aliases as identity while deriving labels from the pinned vocabulary. | Covered |
| AT-019 | Validator/transposition/projection tests prove annotation text does not branch semantic behavior. | Covered |
| AT-020 | CLI and reproducibility tests produce byte-identical treatment files/manifests in two clean output directories and keep observations separate. | Covered |
| AT-021 | Layout/reproducibility tests hold canonical/normalized hashes and `mnls.pitch.absolute-chromatic-y@1` constant while changing only time, duration, and temporal-reference strategies. | Covered |
| AT-022 | `ImplementationSprint1Report.md` records the A-011/E-009 measures and recipe-only implementation change count. | Covered as implementation-agent evidence; Product Owner evaluation remains open |

## Corpus category disposition

| Category | Evidence | Disposition |
|---|---|---|
| C-G01 | M-A, M-B, and E-007 same-source treatments | Covered |
| C-G02 | H-C exact harmony timing | Contract-only |
| C-G03 | Harmonic-roadmap behavior | Deferred functional breadth |
| C-G04 | C-D role/hand contracts | Contract-only |
| C-G05 | C-D inversion, slash bass, voicing, controlled quality | Covered |
| C-G06 | H-C repeat/variation/alternate-ending provenance | Covered |
| C-G07 | Lawful classical/baroque expansion | Deferred |
| C-G08 | Lawful ragtime/stride expansion | Deferred |
| C-G09 | C-D exact familiar-shape hint | Covered |
| C-G10 | Same `idea-boundary@1` definition/parameters for M-A and M-B | Covered |
| C-G11 | Supported, supported-with-limitations, incompatible, and unavailable compatibility cases | Covered |

`music corpus test` verifies these dispositions, the four fixtures' permitted source records, recipe/strategy/transformation coverage, and the separation of experiment identifiers from canonical learner vocabulary.

## Fixture and source inventory

| Fixture | Purpose | Source status | Canonical hash |
|---|---|---|---|
| `melody-spatial-a` | Same-source two-treatment proof and plan reuse | Synthetic; repository use permitted | `sha256:2a196eb8fd53daf4284485d6147cbd3276c8d2e8fd2c9f6058ffef1903e0f3ce` |
| `melody-learning-b` | Transformation reuse with different timing | Synthetic; repository use permitted | `sha256:f19ccd2c015ddba3cea499387f62abe20a65596584dbd5b77a78e9ea9fac2f44` |
| `harmony-grid-c` | Exact chord timing, repeat, variation, alternate ending | Synthetic; repository use permitted | `sha256:c4b4c6666d0801734985f2e889e70a6171e17a70d96c9982ac4753ef218c385c` |
| `contract-voicing-hints` | C-D harmony/inversion/slash-bass/voicing/hint contracts | Analytical fixture; repository use permitted | `sha256:d6dfd4ca0cc3080967d25d99e7123b0c068ec56f5de851735e8103a28487c9fa` |

## Deferred functional renderer coverage

The following remain explicitly deferred under Sprint 1 §10 while their data or compatibility contracts remain protected: harmonic-roadmap rendering; broad role/hand isolation UI; broad lyric rendering; familiar-shape-hint visualization; additional visual pitch mappings; additional duration treatments; and the full golden-corpus style pool.
