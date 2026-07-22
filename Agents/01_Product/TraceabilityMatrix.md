# Requirements Traceability Matrix

Status: Updated for Architecture Sprint 0

Every approved requirement has an owning component or an explicit later-phase disposition. Architecture references do not replace product requirements.

| Requirement | Owning component or disposition | Canonical type/interface | ADR | Validation/test coverage | Open assumption |
|---|---|---|---|---|---|
| R-001 | Product validation protocol; projection | Canonical document/view artifacts | ADR-006 | AT-011; later learner study | A-006 |
| R-002 | Product validation protocol; test-fixtures | Target profile in study plan | No ADR required | AT-011; learner recruitment | A-005, A-006 |
| R-003 | Projection; corpus-tools; product validation | Section/idea/role/pattern model | ADR-003, ADR-006 | AT-006–AT-008, AT-011 | A-004, A-006 |
| R-004 | schema; model; normalizer | CanonicalDocument; NormalizedArrangement | ADR-002, ADR-003 | immutability and multi-view tests | A-007 |
| R-005 | model; patterns; normalizer | MusicalEvent; PatternDefinition; PatternInstance | ADR-003, ADR-009 | intent/direct-event and pattern tests | A-010 |
| R-006 | model; pitch | NoteEvent; PitchEnvelope | ADR-004 | AT-001, AT-008 | A-008 |
| R-007 | model; validator; all pipeline stages | SpecificValue<T> | ADR-002, ADR-007 | five-state preservation suite | None |
| R-008 | model | Song; Arrangement | ADR-003 | song/arrangement reference tests | None |
| R-009 | model; projection | MusicalRole; HandAssignment | ADR-001, ADR-006 | AT-007 plus hand/role tests | A-009 |
| R-010 | model; projection | Section/MusicalIdea versus LearningChunk | ADR-003, ADR-006 | chunk-reference/no-copy tests | None |
| R-011 | model; layout | Rational; TimePosition; Duration | ADR-006 | AT-002; syncopation tests | None |
| R-012 | model; layout | MeasureCoordinate | ADR-006 | cross-measure idea/chunk tests | None |
| R-013 | model; normalizer | RepetitionReference; Variation; ProvenanceChain | ADR-003, ADR-005 | AT-006 | None |
| R-014 | pitch; transposition; normalizer | PitchStrategy; SemanticInterval; ProvenanceChain | ADR-004, ADR-005 | AT-008; metamorphic suite | A-008 |
| R-015 | model; validator | ChordEvent; ChordAnalysis | ADR-002, ADR-004 | chord component valid/invalid tests | None |
| R-016 | model; validator; renderer-html | Inversion | ADR-003 | AT-003 | None |
| R-017 | model; validator; renderer-html | ChordEvent.slashBass | ADR-003 | AT-003 | None |
| R-018 | model; validator; renderer-html | Voicing | ADR-003 | AT-005 | A-009 |
| R-019 | model; validator; renderer-html | SpecificValue<Voicing> | ADR-007 | AT-004 | None |
| R-020 | model; normalizer; projection | Section | ADR-003, ADR-006 | section/reference/repeat tests | None |
| R-021 | model; normalizer | MusicalIdea | ADR-003, ADR-005 | AT-006 | None |
| R-022 | patterns; model | PatternDefinition; PatternInstance | ADR-009 | pattern conformance tests | A-010 |
| R-023 | patterns; corpus-tools | PatternAdmissionRecord; VocabularyReport | ADR-009 | vocabulary/admission tests; E-005 | A-010 |
| R-024 | model; normalizer; projection | Transition | ADR-003 | transition endpoint/context tests | None |
| R-025 | model; layout; renderer-html | LyricTrack; LyricEvent | ADR-006 | AT-012; escaping tests | None |
| R-026 | projection; layout; renderer-html | ViewSpec(full); ProjectedView | ADR-006 | full-view DOM assertions | A-001, A-002 |
| R-027 | projection; layout; renderer-html | ViewSpec(harmonic-roadmap) | ADR-006 | roadmap assertions | A-001, A-002 |
| R-028 | projection; renderer-html | ViewSpec(role) | ADR-006 | AT-007 | A-001 |
| R-029 | projection; renderer-html | ViewSpec(hand); HandAssignment | ADR-006 | hand/role separation tests | A-009 |
| R-030 | projection; renderer-html | ViewSpec(learning-chunk); LearningChunk | ADR-006 | chunk projection tests | None |
| R-031 | projection; layout | ViewSpec(excerpt); TimeSpan | ADR-006 | excerpt clipping/context tests | None |
| R-032 | layout; renderer-html | DisclosureOptions; content priority | ADR-006 | density required-content tests; E-003/E-004 | A-001, A-002 |
| R-033 | projection; layout; renderer-html | SpecificValue<T>; specificity nodes | ADR-006, ADR-007 | five-state render/a11y tests | None |
| R-034 | normalizer; layout; renderer-html | Provenance relationships; repeated-family nodes | ADR-003, ADR-005, ADR-006 | AT-006 | None |
| R-035 | model; projection | PedagogicalHint/FamiliarShapeHint | ADR-010 | AT-009 | A-005 |
| R-036 | validator; projection; renderer-html | ChordEvent.harmony plus hint relation | ADR-010 | AT-009 canonical-first assertions | A-005 |
| R-037 | validator; pitch | Hint.equivalence | ADR-004, ADR-010 | exact/subset/approximation tests | A-008 |
| R-038 | model; validator; renderer-html | FamiliarShapeHint.bass | ADR-010 | AT-009 | None |
| R-039 | projection; renderer-html | ViewSpec.includeHints | ADR-006, ADR-010 | show/hide semantic diff | A-005 |
| R-040 | validator; optional hint generator boundary | Hint source/status/suppression | ADR-010 | AT-010; deterministic generator contract later | A-005, A-008 |
| R-041 | Fixture C; validator; renderer-html | Am7 ChordEvent plus C/A hint | ADR-010 | AT-009 | A-005 |
| R-042 | projection; later validation protocol | ViewSpec variants; LearningChunk | ADR-006 | software view tests; later human workflows | A-004, A-006 |
| R-043 | corpus-tools | CorpusManifest; SourceRecord; expected assertions | ADR-001, ADR-005 | corpus regression gate | A-010 |
| R-044 | corpus-tools; Product Owner | Corpus category manifest | No ADR required | coverage report by C-G01–C-G09 | A-010 |
| R-045 | corpus-tools | SourceRecord; SOURCE_REGISTER | ADR-007 | source-policy tests | A-003, A-010 |
| R-046 | Product Owner/validation agent | Learning evaluation record (later phase) | No ADR required | AT-011 human protocol | A-004, A-006 |
| R-047 | all architecture packages | No final authoring syntax dependency | ADR-002, ADR-004, ADR-006 | AT-013 repository/API scan | A-007 |
| R-048 | schema; model; CLI | CanonicalDocument.schemaVersion | ADR-002, ADR-008 | schema/version/CLI tests | A-007 |
| R-049 | renderer-html; CLI | RenderedBundle | ADR-006 | static output tests | A-001, A-002 |
| R-050 | pitch; normalized adapters boundary | PitchStrategy; NormalizedArrangement | ADR-001, ADR-004, ADR-008 | adapter-boundary compile tests; AT-013 | A-008, A-009 |

## Acceptance-test ownership

| Acceptance test | Primary automated owner | Later human owner where applicable |
|---|---|---|
| AT-001 | schema, model, renderer-html | — |
| AT-002 | model, layout, renderer-html | later place-keeping study |
| AT-003 | model, validator, normalizer, renderer-html | E-006 confusion observation |
| AT-004 | model, normalizer, renderer-html | later performer interpretation |
| AT-005 | model, validator, renderer-html | later playability review |
| AT-006 | normalizer, layout, renderer-html | later repetition-recognition study |
| AT-007 | projection, renderer-html | later practice workflow study |
| AT-008 | pitch, transposition, normalizer | later relearning-burden study |
| AT-009 | validator, projection, renderer-html | E-006 |
| AT-010 | validator, optional generator boundary | E-006 |
| AT-011 | protocol schema/reporting only | Product Owner or Validation Agent |
| AT-012 | model, layout, renderer-html | later lyric readability study |
| AT-013 | architecture/package tests | — |

## Experimental isolation

| Experiment | Architecture boundary | Default status |
|---|---|---|
| E-001 pitch representation | ADR-004 `PitchStrategy` | `spelled-pitch@1` is a Sprint 1 implementation strategy, not a settled product default |
| E-002 repetition representation | ADR-003 material source/normalizer | reference-plus-variation is supported without excluding competing canonical treatments |
| E-003 beat presentation | ADR-006 beat-presentation strategy | one explicit grid implementation; no final notation syntax |
| E-004 learning chunks | `LearningChunk` plus projection | authored references only; boundaries remain product/experiment data |
| E-005 pattern vocabulary | ADR-009 registry/admission report | deliberately small; no automatic admission |
| E-006 familiar-shape hints | ADR-010 hint validator/projection | authored hints supported; generated hints disabled by default |

## Unresolved architecture blockers

None. A-001–A-010 remain open assumptions with the isolation shown above; no assumption has been promoted to a product decision.
