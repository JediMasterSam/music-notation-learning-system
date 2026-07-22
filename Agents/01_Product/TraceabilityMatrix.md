# Requirements Traceability Matrix

Status: Updated for Architecture baseline 0.2 Product Owner amendments

Every approved requirement has an owning component or explicit later-phase disposition. D-025–D-029 and R-051–R-058 are the authoritative workbench records. Historical `H-*` identifiers remain crosswalk labels only and cannot define product scope independently.

| Requirement | Owning component or disposition | Canonical/derived type or interface | ADR | Validation/test coverage | Open assumption |
|---|---|---|---|---|---|
| R-001 | Product validation; workbench/learning | canonical plus derived treatment/plan artifacts | ADR-006, ADR-011–ADR-012, ADR-015 | AT-011, AT-020; later learner study | A-006 |
| R-002 | Product validation protocol; test-fixtures | Target profile in study plan | No ADR required | AT-011; learner recruitment | A-005, A-006 |
| R-003 | learning, workbench, projection, product validation | musical structure plus LearningPlan/ExperimentDefinition | ADR-003, ADR-006, ADR-011, ADR-015 | AT-014–AT-015, AT-020–AT-021; later study | A-004, A-006 |
| R-004 | schema, model, normalizer, workbench | CanonicalDocument; NormalizedArrangement; recipes/plans separate | ADR-002–ADR-003, ADR-011–ADR-012, ADR-016 | AT-014–AT-015; canonical no-mutation hashes | A-007 |
| R-005 | model; patterns; normalizer | MusicalEvent; PatternDefinition; PatternInstance | ADR-003, ADR-009 | intent/direct-event and pattern tests | A-010 |
| R-006 | model; pitch | NoteEvent; PitchEnvelope | ADR-004 | AT-001, AT-008 | A-008 |
| R-007 | model; validator; all pipeline stages | SpecificValue<T> | ADR-002, ADR-007 | five-state preservation suite | None |
| R-008 | model | Song; Arrangement | ADR-003 | song/arrangement reference tests | None |
| R-009 | model; projection | MusicalRole; HandAssignment | ADR-001, ADR-006 | AT-007 plus hand/role tests | A-009 |
| R-010 | model boundary; learning | canonical structural types vs derived LearningPlan/LearningChunk | ADR-003, ADR-011 | AT-014; no-copy/regeneration | None |
| R-011 | model, layout, compatibility | Rational/TimePosition/Duration; time strategies | ADR-006, ADR-012, ADR-016–ADR-017 | AT-002, AT-021; exact geometry | None |
| R-012 | model; learning selectors; layout overlays | MeasureCoordinate; TimeSpan | ADR-006, ADR-011, ADR-012 | cross-measure idea/plan tests; optional coordinate overlay | None |
| R-013 | model; normalizer | RepetitionReference; Variation; ProvenanceChain | ADR-003, ADR-005 | AT-006 | None |
| R-014 | pitch; transposition; normalizer; learning/workbench manifests | PitchStrategy; SemanticInterval; ProvenanceChain; plan/recipe refs | ADR-004, ADR-005, ADR-011, ADR-015 | AT-008; plan selector and recipe invariants | A-008 |
| R-015 | model, harmony, validator | ChordEvent; ChordAnalysis; ChordQualityRef; annotations | ADR-002, ADR-004, ADR-018 | AT-018–AT-019 plus chord contradictions | None |
| R-016 | model; validator; renderer-html | Inversion | ADR-003 | AT-003 | None |
| R-017 | model; validator; renderer-html | ChordEvent.slashBass | ADR-003 | AT-003 | None |
| R-018 | model; validator; renderer-html | Voicing | ADR-003 | AT-005 | A-009 |
| R-019 | model; validator; renderer-html | SpecificValue<Voicing> | ADR-007 | AT-004 | None |
| R-020 | model; normalizer; projection | Section | ADR-003, ADR-006 | section/reference/repeat tests | None |
| R-021 | model, normalizer | MusicalIdea without learning membership | ADR-003, ADR-005, ADR-011 | AT-006, AT-014 | None |
| R-022 | patterns; model | PatternDefinition; PatternInstance | ADR-009 | pattern conformance tests | A-010 |
| R-023 | patterns; corpus-tools | PatternAdmissionRecord; VocabularyReport | ADR-009 | vocabulary/admission tests; E-005 | A-010 |
| R-024 | model transitions; derived plan relationships | Transition; transition-practice LearningRelationship | ADR-003, ADR-011 | canonical transition and plan-reference tests | None |
| R-025 | model; layout; renderer-html | LyricTrack; LyricEvent | ADR-006 | AT-012; escaping tests | None |
| R-026 | workbench, projection, layout, renderer | RepresentationRecipe; ProjectedView; LayoutPlan | ADR-006, ADR-012, ADR-014–ADR-017 | AT-015, AT-021; M-A DOM | A-001, A-002, A-011 |
| R-027 | projection/layout contract; Sprint 2 functional treatment | harmonic-roadmap recipe capability | ADR-006, ADR-012, ADR-017 | contract tests; functional roadmap deferred | A-001 |
| R-028 | projection/workbench contract; Sprint 2 functional treatment | role visibility + artifact-scoped capabilities | ADR-006, ADR-012, ADR-017 | AT-007; functional UI deferred | A-001 |
| R-029 | projection/compatibility; Sprint 2 treatment | hand visibility; arrangement hand capability | ADR-006, ADR-012, ADR-017 | unknown-hand incompatibility; AT-016 | A-009 |
| R-030 | learning, capabilities, workbench, projection | VerifiedLearningPlan; LearningPlanCapabilityProfile; overlay | ADR-006, ADR-011, ADR-014, ADR-017 | AT-014, AT-017 | None |
| R-031 | workbench; projection; layout | recipe/excerpt selection; TimeSpan | ADR-006, ADR-012 | M-A phrase/excerpt clipping/context tests | None |
| R-032 | recipe disclosure, layout, renderer | disclosure strategy; content priority | ADR-006, ADR-012, ADR-017 | required-content/limitation tests | A-001 |
| R-033 | projection, recipe, layout, renderer | SpecificValue and scene state nodes | ADR-006–ADR-007, ADR-012, ADR-017 | five-state full-pipeline suite | None |
| R-034 | normalizer; recipe overlays; layout; renderer-html | Provenance relationships; repeated-family overlay | ADR-003, ADR-005, ADR-006, ADR-012 | AT-006 contract; functional breadth may defer | None |
| R-035 | model; projection | PedagogicalHint/FamiliarShapeHint | ADR-010 | AT-009 | A-005 |
| R-036 | validator; projection; renderer-html | ChordEvent.harmony plus hint relation | ADR-010 | AT-009 canonical-first assertions | A-005 |
| R-037 | validator; pitch | Hint.equivalence | ADR-004, ADR-010 | exact/subset/approximation tests | A-008 |
| R-038 | model; validator; renderer-html | FamiliarShapeHint.bass | ADR-010 | AT-009 | None |
| R-039 | projection, compatibility, renderer | hint overlay selection; artifact profiles | ADR-006, ADR-010, ADR-017 | show/hide semantic diff; AT-016 | A-005 |
| R-040 | validator, capabilities, optional generator | hint status/suppression | ADR-010, ADR-017–ADR-018 | AT-010; no annotation authority | A-005, A-008 |
| R-041 | Fixture C; validator; renderer-html | Am7 ChordEvent plus C/A hint | ADR-010 | AT-009 | A-005 |
| R-042 | learning transformations; recipes; human protocol | LearningTransformationDefinition; LearningPlan | ADR-011–ADR-012, ADR-015, ADR-017 | AT-014, AT-017; later workflow studies | A-004, A-006 |
| R-043 | corpus-tools; experiment runner | CorpusManifest; ExperimentDefinition; manifests | ADR-001, ADR-005, ADR-015–ADR-016 | AT-020–AT-021; corpus gates | A-010 |
| R-044 | corpus-tools; Product Owner | Corpus category manifest | No ADR required | coverage report by C-G01–C-G09 | A-010 |
| R-045 | corpus-tools | SourceRecord; SOURCE_REGISTER | ADR-007 | source-policy tests | A-003, A-010 |
| R-046 | Product Owner/validation; experiment boundary | separate ObservationRecord | ADR-015 | AT-011, AT-020; later human protocol | A-004, A-006 |
| R-047 | all packages | versioned artifacts without final punctuation/defaults | ADR-002, ADR-004, ADR-006, ADR-011–ADR-018 | AT-013, AT-019, output scans | A-007 |
| R-048 | schema, model, harmony, learning, workbench, CLI | independent artifact/vocabulary versions | ADR-002, ADR-008, ADR-011–ADR-012, ADR-015, ADR-018 | version/pin/hash/schema tests | A-007 |
| R-049 | renderer, workbench, CLI | static comparison page and manifests | ADR-006, ADR-014–ADR-016 | AT-015, AT-020–AT-022 | A-001, A-002, A-011 |
| R-050 | pitch, adapters, strategy contracts | PitchStrategy; NormalizedArrangement; descriptors | ADR-001, ADR-004, ADR-008, ADR-017 | adapter/conformance/AT-013 | A-008, A-009 |
| R-051 | workbench and product validation | workbench objective/treatment artifacts | ADR-012, ADR-014–ADR-016 | AT-015, AT-020–AT-021 | A-011 |
| R-052 | schema, workbench, strategy catalog | RepresentationRecipe; ResolvedRecipe | ADR-012, ADR-017 | AT-015–AT-016 | A-007, A-011 |
| R-053 | capabilities, capability-analysis, learning, workbench | separate artifact profiles; CompatibilityInput | ADR-017 | AT-016–AT-017 | None |
| R-054 | learning and capabilities | LearningTransformationDefinition/descriptor | ADR-011, ADR-017 | AT-014, AT-017 | None |
| R-055 | learning, schema, projection | LearningPlan; LearningChunk; provenance | ADR-011, ADR-017 | AT-014, AT-017 | None |
| R-056 | workbench/experiment runner; human protocol | ExperimentDefinition; RunManifest; ObservationRecord | ADR-015 | AT-020 | A-006 |
| R-057 | workbench, projection, layout, renderer | two recipes from one canonical/normalized hash | ADR-012, ADR-016–ADR-017 | AT-015, AT-021 | A-011 |
| R-058 | layout/workbench/experiment runner | E-007 controlled strategies and manifests | ADR-016 | AT-021 | None |

## Product decision to requirement mapping

| Decision | Requirements | Architecture |
|---|---|---|
| D-025 | R-001, R-003–R-004, R-043, R-046–R-049, R-051 | ADR-012, ADR-014–ADR-016 |
| D-026 | R-010, R-030, R-042, R-054–R-055 | ADR-011, ADR-017 |
| D-027 | R-004, R-026–R-034, R-043, R-047–R-049, R-052–R-053, R-057 | ADR-012, ADR-014, ADR-016–ADR-017 |
| D-028 | R-001, R-003, R-006, R-011, R-032, R-043, R-046, R-058 | ADR-016 |
| D-029 | R-043, R-046, R-048–R-049, R-056 | ADR-015 |

## Acceptance-test ownership

| Acceptance tests | Primary automated owner | Human owner where applicable |
|---|---|---|
| AT-001–AT-010 | schema/model/harmony/validator/normalizer/projection/layout as mapped above | E-006 or later studies where noted |
| AT-011 | observation schema separation | Product Owner or Validation Agent |
| AT-012–AT-013 | model/security/architecture scans | later lyric study for AT-012 |
| AT-014 | learning/schema/model | later learning-transformation experiment |
| AT-015 | workbench/projection/layout/renderer | Product Owner treatment review |
| AT-016 | capabilities/capability-analysis/learning | — |
| AT-017 | learning/workbench compatibility | — |
| AT-018–AT-019 | harmony/model/validator/all semantic packages | — |
| AT-020–AT-021 | workbench experiment runner/layout/reproducibility | human observations remain separate |
| AT-022 | Sprint report/workbench workflow | Product Owner |

## Experiment isolation

| Experiment | Boundary | Sprint/default status |
|---|---|---|
| E-001 canonical pitch representation | ADR-004 PitchStrategy | experimental; no default |
| E-002 repetition representation | material resolver/provenance | alternatives preserved |
| E-003 beat presentation | recipe time/overlay strategies | informed by E-007 |
| E-004 learning chunks | ADR-011 transformations/plans | idea-boundary@1 experimental |
| E-005 pattern vocabulary | ADR-009 admission | deliberately small |
| E-006 familiar-shape hints | ADR-010 | generation disabled by default |
| E-007 proportional time/duration vs grid | ADR-016 | required Sprint 1 controlled comparison; y mapping held constant |
| E-008 visual pitch mapping | visual PitchMappingStrategy | future; time/duration held constant |
| E-009 headless workbench usability | ADR-014 and A-011 | required Sprint 1 workflow evidence |

## Historical H-* crosswalk

H-01–H-12 are retained only to link the approved Sprint 0.1 handoff to stable authority. Their long-term authority is now D-025–D-029 and R-051–R-058. Architecture and implementation must cite the stable decision/requirement IDs.

## Sprint 1 functional/deferred disposition

| Area | Sprint 1 disposition | Protection retained |
|---|---|---|
| melody/time/duration treatments | two functional treatments with shared absolute-chromatic y | mathematical, DOM, accessibility, reproducibility tests |
| learning transformations/plans | one reusable transformation on two fixtures | ownership, verification, capability, no-copy tests |
| capability ownership | full artifact-scoped implementation | AT-016–AT-017 |
| harmonic semantics | controlled quality vocabulary; annotations non-authoritative | AT-018–AT-019; C-D contracts |
| harmony timing/repetition | canonical + normalization fixture H-C | AT-002, AT-006 |
| broad role/hand/lyric/hint rendering | deferred functional breadth | contract and diagnostic tests retained |
| browser live preview | adapter boundary only | A-011/E-009 decides priority |

## Unresolved architecture blockers

None after this correction pass. A-001–A-011 remain assumptions with explicit treatment; none has been promoted silently to a product decision.
