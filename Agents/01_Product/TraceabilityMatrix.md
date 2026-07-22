# Requirements Traceability Matrix

Status: Updated for Architecture Sprint 0.1

Every approved requirement has an owning component or an explicit later-phase disposition. Architecture references do not replace product requirements.

| Requirement | Owning component or disposition | Canonical type/interface | ADR | Validation/test coverage | Open assumption |
|---|---|---|---|---|---|
| R-001 | Product validation protocol; workbench; learning | Canonical document plus derived treatment/plan artifacts | ADR-006, ADR-011, ADR-012, ADR-015 | deterministic treatments/plans; AT-011 later learner study | A-006 |
| R-002 | Product validation protocol; test-fixtures | Target profile in study plan | No ADR required | AT-011; learner recruitment | A-005, A-006 |
| R-003 | learning; workbench; projection; product validation | Section/idea/role/pattern model plus LearningPlan/ExperimentDefinition | ADR-003, ADR-006, ADR-011, ADR-015 | treatment/plan tests; AT-006–AT-008, AT-011 | A-004, A-006 |
| R-004 | schema; model; normalizer; workbench | CanonicalDocument; NormalizedArrangement; RepresentationRecipe | ADR-002, ADR-003, ADR-012, ADR-016 | canonical hash unchanged across two treatments/plans | A-007 |
| R-005 | model; patterns; normalizer | MusicalEvent; PatternDefinition; PatternInstance | ADR-003, ADR-009 | intent/direct-event and pattern tests | A-010 |
| R-006 | model; pitch | NoteEvent; PitchEnvelope | ADR-004 | AT-001, AT-008 | A-008 |
| R-007 | model; validator; all pipeline stages | SpecificValue<T> | ADR-002, ADR-007 | five-state preservation suite | None |
| R-008 | model | Song; Arrangement | ADR-003 | song/arrangement reference tests | None |
| R-009 | model; projection | MusicalRole; HandAssignment | ADR-001, ADR-006 | AT-007 plus hand/role tests | A-009 |
| R-010 | model canonical reference surface; learning package | MusicalIdea/Transition versus derived LearningPlan/LearningChunk | ADR-003, ADR-011 | no arrangement-owned chunks; reference/no-copy/regeneration tests | None |
| R-011 | model; layout strategies; workbench compatibility | Rational; TimePosition; Duration; TimeMappingStrategy | ADR-006, ADR-012, ADR-013, ADR-016 | AT-002; grid/proportional mathematical invariants | None |
| R-012 | model; learning selectors; layout overlays | MeasureCoordinate; TimeSpan | ADR-006, ADR-011, ADR-012 | cross-measure idea/plan tests; optional coordinate overlay | None |
| R-013 | model; normalizer | RepetitionReference; Variation; ProvenanceChain | ADR-003, ADR-005 | AT-006 | None |
| R-014 | pitch; transposition; normalizer; learning/workbench manifests | PitchStrategy; SemanticInterval; ProvenanceChain; plan/recipe refs | ADR-004, ADR-005, ADR-011, ADR-015 | AT-008; plan selector and recipe invariants | A-008 |
| R-015 | model; validator | ChordEvent; ChordAnalysis | ADR-002, ADR-004 | chord component valid/invalid tests | None |
| R-016 | model; validator; renderer-html | Inversion | ADR-003 | AT-003 | None |
| R-017 | model; validator; renderer-html | ChordEvent.slashBass | ADR-003 | AT-003 | None |
| R-018 | model; validator; renderer-html | Voicing | ADR-003 | AT-005 | A-009 |
| R-019 | model; validator; renderer-html | SpecificValue<Voicing> | ADR-007 | AT-004 | None |
| R-020 | model; normalizer; projection | Section | ADR-003, ADR-006 | section/reference/repeat tests | None |
| R-021 | model; normalizer | MusicalIdea | ADR-003, ADR-005 | AT-006 | None |
| R-022 | patterns; model | PatternDefinition; PatternInstance | ADR-009 | pattern conformance tests | A-010 |
| R-023 | patterns; corpus-tools | PatternAdmissionRecord; VocabularyReport | ADR-009 | vocabulary/admission tests; E-005 | A-010 |
| R-024 | model canonical transitions; learning plan relationships; projection | Transition; transition-practice LearningRelationship | ADR-003, ADR-011 | canonical transition plus plan relationship tests | None |
| R-025 | model; layout; renderer-html | LyricTrack; LyricEvent | ADR-006 | AT-012; escaping tests | None |
| R-026 | workbench; projection; layout; renderer-html | RepresentationRecipe; ProjectedView; LayoutPlan | ADR-006, ADR-012–ADR-016 | M-A functional treatment DOM assertions | A-001, A-002 narrowed |
| R-027 | projection/layout contract; Sprint 2 functional treatment | harmonic-roadmap recipe capability | ADR-006, ADR-012, ADR-013 | contract tests in Sprint 1; functional roadmap deferred | A-001 |
| R-028 | projection/workbench contract; Sprint 2 functional treatment | role visibility recipe and capabilities | ADR-006, ADR-012, ADR-013 | AT-007 projection contract; functional UI deferred | A-001 |
| R-029 | projection/workbench compatibility; Sprint 2 treatment | hand visibility; HandAssignment capability state | ADR-006, ADR-012, ADR-013 | unknown-hand incompatibility and separation tests | A-009 |
| R-030 | learning; workbench; projection; renderer-html | LearningPlan; LearningChunk; learning-plan overlay | ADR-006, ADR-011–ADR-014 | two-plan generation; optional chunk overlay tests | None |
| R-031 | workbench; projection; layout | recipe/excerpt selection; TimeSpan | ADR-006, ADR-012 | M-A phrase/excerpt clipping/context tests | None |
| R-032 | recipe disclosure strategy; layout; renderer-html | RepresentationRecipe.disclosure; content priority | ADR-006, ADR-012, ADR-013 | strategy option and required-content tests | A-001 |
| R-033 | projection; recipe; layout; renderer-html | SpecificValue<T>; specificity scene nodes | ADR-006, ADR-007, ADR-012, ADR-013 | five-state full-pipeline/render/a11y suite | None |
| R-034 | normalizer; recipe overlays; layout; renderer-html | Provenance relationships; repeated-family overlay | ADR-003, ADR-005, ADR-006, ADR-012 | AT-006 contract; functional breadth may defer | None |
| R-035 | model; projection | PedagogicalHint/FamiliarShapeHint | ADR-010 | AT-009 | A-005 |
| R-036 | validator; projection; renderer-html | ChordEvent.harmony plus hint relation | ADR-010 | AT-009 canonical-first assertions | A-005 |
| R-037 | validator; pitch | Hint.equivalence | ADR-004, ADR-010 | exact/subset/approximation tests | A-008 |
| R-038 | model; validator; renderer-html | FamiliarShapeHint.bass | ADR-010 | AT-009 | None |
| R-039 | projection; renderer-html | ViewSpec.includeHints | ADR-006, ADR-010 | show/hide semantic diff | A-005 |
| R-040 | validator; optional hint generator boundary | Hint source/status/suppression | ADR-010 | AT-010; deterministic generator contract later | A-005, A-008 |
| R-041 | Fixture C; validator; renderer-html | Am7 ChordEvent plus C/A hint | ADR-010 | AT-009 | A-005 |
| R-042 | learning transformations; workbench recipes; later human protocol | LearningTransformationDefinition; LearningPlan; recipes | ADR-011, ADR-012, ADR-015 | reusable-plan/treatment tests; later workflow studies | A-004, A-006 |
| R-043 | corpus-tools; workbench experiment runner | CorpusManifest; ExperimentDefinition; expected manifests | ADR-001, ADR-005, ADR-015, ADR-016 | corpus/workbench coverage and reproduction gates | A-010 |
| R-044 | corpus-tools; Product Owner | Corpus category manifest | No ADR required | coverage report by C-G01–C-G09 | A-010 |
| R-045 | corpus-tools | SourceRecord; SOURCE_REGISTER | ADR-007 | source-policy tests | A-003, A-010 |
| R-046 | Product Owner/validation agent; experiment artifact boundary | ObservationDefinition and separate human ObservationRecord | ADR-015 | AT-011 schema separation; later human protocol | A-004, A-006 |
| R-047 | all packages; workbench configuration boundary | versioned JSON artifacts without final punctuation/default treatment | ADR-002, ADR-004, ADR-006, ADR-011–ADR-016 | AT-013 scans; treatment status assertions | A-007 |
| R-048 | schema; model; learning; workbench; CLI | independent canonical/recipe/plan/experiment/manifest versions | ADR-002, ADR-008, ADR-011, ADR-012, ADR-015 | schema/version/pinning/hash/CLI tests | A-007 |
| R-049 | renderer-html; workbench; CLI | treatment bundles and static comparison page | ADR-006, ADR-014–ADR-016 | Sprint 1 static output/reproduction; live UI deferred | A-001; A-002 narrowed |
| R-050 | pitch; normalized adapters; strategy contracts | PitchStrategy; NormalizedArrangement; strategy descriptors | ADR-001, ADR-004, ADR-008, ADR-013 | adapter/conformance/AT-013 tests | A-008, A-009 |

## Acceptance-test ownership

| Acceptance test | Primary automated owner | Later human owner where applicable |
|---|---|---|
| AT-001 | schema, model, projection/layout/renderer on M-A/M-B | — |
| AT-002 | model, H-C normalizer, explicit-grid layout/renderer | later place-keeping study |
| AT-003 | model, validator, normalizer, projection contract (C-D) | E-006 confusion observation |
| AT-004 | model, normalizer, projection/render contract (C-D) | later performer interpretation |
| AT-005 | model, validator, projection/render contract (C-D) | later playability review |
| AT-006 | H-C normalizer/provenance; overlay contract | later repetition-recognition study |
| AT-007 | projection/workbench compatibility; functional role UI deferred | later practice workflow study |
| AT-008 | pitch, transposition, normalizer, learning/workbench invariants | later relearning-burden study |
| AT-009 | C-D validator/projection/render contract | E-006 |
| AT-010 | validator, optional generator boundary | E-006 |
| AT-011 | protocol schema/reporting only | Product Owner or Validation Agent |
| AT-012 | model/security contract; broad functional lyric treatment deferred | later lyric readability study |
| AT-013 | architecture/package tests | — |

## Experimental isolation

| Experiment | Architecture boundary | Default status |
|---|---|---|
| E-001 pitch representation | ADR-004 `PitchStrategy` | `spelled-pitch@1` is a Sprint 1 implementation strategy, not a settled product default |
| E-002 repetition representation | ADR-003 material source/normalizer | reference-plus-variation is supported without excluding competing canonical treatments |
| E-003 beat presentation | ADR-012/ADR-013 time-mapping recipes | explicit-grid and proportional treatments; neither is final/default |
| E-004 learning chunks | ADR-011 reusable transformations -> derived plans | `idea-boundary@1` is an experiment implementation, not a default; arrangement owns no chunks |
| E-005 pattern vocabulary | ADR-009 registry/admission report | deliberately small; no automatic admission |
| E-006 familiar-shape hints | ADR-010 hint validator/projection | authored hints supported; generated hints disabled by default |

## Architecture Sprint 0.1 handoff obligations

| Obligation | Owning artifact/component | ADR | Sprint 1 evidence | Disposition |
|---|---|---|---|---|
| H-01 canonical arrangement independent of learning/treatment changes | CanonicalModel; model/schema | ADR-003, ADR-011, ADR-012 | canonical hash/no-mutation tests | Sprint 1 |
| H-02 reusable versioned learning transformations | LearningTransformations; learning | ADR-011, ADR-013 | `idea-boundary@1` on M-A and M-B | Sprint 1 |
| H-03 chunks belong to derived learning plans | LearningTransformations; schema/model boundary | ADR-011 | `Arrangement.learningChunks` rejected; plan no-copy tests | Sprint 1 |
| H-04 declarative representation recipes | ExperimentWorkbench; workbench | ADR-012 | two committed recipes resolve/run without source edits | Sprint 1 |
| H-05 independent strategy dimensions/discovery | workbench/layout | ADR-012, ADR-013 | catalog/descriptor/conformance tests | Sprint 1 core; more strategies later |
| H-06 explicit-grid and proportional-spatial melody treatments | layout/renderer/workbench | ADR-016 | same M-A source, mathematical/DOM tests | Sprint 1 |
| H-07 reproducible experiment definitions/runs | ExperimentWorkbench; workbench | ADR-015 | spatial comparison definition and byte-identical rerun | Sprint 1 |
| H-08 configuration without TypeScript edits | CLI + declarative artifacts | ADR-012, ADR-014 | recipe/experiment commands | Sprint 1 |
| H-09 capability/compatibility diagnostics | workbench/learning | ADR-013 | all four statuses and no-fallback tests | Sprint 1 |
| H-10 static-only assumption reconsidered | Architecture/ExperimentWorkbench | ADR-014 | static comparison in Sprint 1; `workbench-web` boundary deferred | Resolved/narrowed |
| H-11 experiment output separate from human learning evidence | ExperimentWorkbench; product validation | ADR-015 | run manifest vs observation schema separation | Sprint 1 contract; human studies later |
| H-12 no final notation/default strategy | all packages/output language | ADR-012, ADR-016 | AT-013/status assertions | Continuous gate |

## Revised Sprint 1 functional/deferred disposition

| Area | Sprint 1 disposition | Protection retained |
|---|---|---|
| melody/time/pitch/duration treatments | two functional treatments | full mathematical, DOM, a11y, reproducibility tests |
| learning chunks/workflows | one functional reusable transformation on two fixtures | plan compatibility/no-copy/provenance tests |
| harmony timing/repetition | canonical + normalization/provenance fixture H-C | AT-002, AT-006 |
| inversion/slash bass/voicing/hints | contract fixture C-D; broad functional rendering deferred | AT-003–AT-005, AT-009–AT-010 |
| role/hand views | projection/compatibility contracts; functional breadth deferred | AT-007 and unknown-hand diagnostics |
| lyrics | model/escaping contract; broad layout deferred | AT-012 |
| browser live preview | adapter boundary only | recipe/workbench APIs and schemas |

## Unresolved architecture blockers

None. A-001–A-010 remain open assumptions with the isolation shown above; no assumption has been promoted to a product decision.
