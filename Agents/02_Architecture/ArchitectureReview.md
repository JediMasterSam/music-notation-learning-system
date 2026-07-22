# Architecture Review

Status: Architecture Sprint 0.1 Product Owner amendments complete — proposed for approval  
Architecture baseline: 0.2  
Review basis: `ArchitectureSprint0.1ProductOwnerReview.md`

## 1. Disposition

The targeted correction pass is complete. The experimental-workbench architecture remains intact; governance records, capability authority, harmonic typing, usability evidence, and experiment framing are now consistent with the Constitution and Product Owner direction.

Recommendation: Product Owner may approve architecture baseline 0.2 as the Implementation Sprint 1 baseline.

## 2. Required Amendment 1 — Product governance

Completed:

- D-025 through D-029 are recorded in `DecisionLog.md`.
- R-051 through R-058 provide stable workbench, recipe, capability, transformation, plan, experiment, same-source, and E-007 requirements.
- R-010, R-015, R-021, R-024, R-030, R-046, R-048, and R-049 are clarified where ownership/authority changed.
- `H-*` identifiers are now historical crosswalk labels only.
- ADR-011 through ADR-018 map to Product Decision IDs.
- Traceability and Sprint 1 cite stable requirements/decisions.

Result: no architecture ADR or handoff-only identifier substitutes for Product Owner authority.

## 3. Required Amendment 2 — Capability ownership

Completed:

- `ArrangementCapabilityProfile` contains only canonical/normalized arrangement evidence.
- `LearningPlanCapabilityProfile` is produced only from a verified plan matching arrangement ID/hash.
- renderer and environment profiles are separate.
- `TreatmentInputProfile` and `CompatibilityInput` compose artifact-scoped sources.
- learning overlays require verified matching plans and are incompatible otherwise.
- recipes cannot forge evidence.
- `@mnls/capabilities` owns neutral contracts; `@mnls/capability-analysis` owns arrangement/renderer/environment analyzers; learning no longer imports workbench.
- ADR-013 is superseded by ADR-017; ADR-001 is explicitly amended rather than silently rewritten.

Required Sprint 1 tests cover deletion invariance, stale plan hashes, plan reuse, cross-artifact forgery, evidence refs, and dependency direction.

## 4. Required Amendment 3 — Harmonic typing

Completed:

- `ChordAnalysis.quality` is `ChordQualityRef { vocabularyId, vocabularyVersion, qualityId }`.
- immutable registered vocabularies own semantic identity; labels and aliases are derived.
- unknown IDs and aliases-as-authority fail.
- harmonic function, Roman numerals, and tags are deferred to `HarmonicAnalysisAnnotation` with `authority: "annotation"`.
- annotations cannot affect validation, transposition, capability analysis, learning, compatibility, projection, layout, or strategy branching.
- Sprint 1 does not render analysis annotations.
- ADR-018 records the decision and rejects partial functional-analysis semantics.

Result: schema `0.1.0` cannot accept opaque harmonic authority.

## 5. Required Amendment 4 — Workbench usability

Completed:

- A-011 is recorded.
- E-009 defines the research-workbench usability review.
- Sprint 1 report requirements include recipe-edit time, discovery/diagnostic comprehension, implementation changes, treatment switching, rerun/reproduction, variant-saving friction, and live-preview need.
- a browser configurator remains a deferred adapter and may be prioritized from evidence.

Result: the headless workflow is an explicit testable assumption, not an unrecorded conclusion.

## 6. Spatial experiment clarification

Completed:

- E-007 asks how proportional horizontal onset/duration compares with an explicit beat/subdivision grid.
- canonical melody, normalized source, `mnls.pitch.absolute-chromatic-y@1`, exact labels, accessibility data, and renderer/environment policy are controlled.
- time mapping, duration encoding, and temporal reference overlay are changed.
- E-007 is not described as a complete spatial pitch-mapping test.
- E-008 records future pitch-mapping comparisons with time/duration held constant.

## 7. Sprint 1 scope

Sprint 1 remains broad but ordered and executable. It prioritizes:

1. workspace/schema/model foundations;
2. controlled harmony vocabulary;
3. normalization/pitch;
4. neutral capability contracts and analyzers;
5. reusable learning plans and verified plan capabilities;
6. declarative recipe resolution and composite compatibility;
7. two functional M-A treatments;
8. accessible deterministic rendering;
9. reproducible E-007 execution;
10. regression, traceability, and A-011 usability evidence.

Broad harmony, role, hand, lyric, and hint treatments remain deferred while their semantic contracts stay mandatory.

## 8. Product Owner amendment acceptance checklist

- [x] D-025–D-029 exist.
- [x] stable requirements R-051–R-058 represent workbench obligations.
- [x] H-* is not parallel product authority.
- [x] A-011 is recorded.
- [x] arrangement capabilities contain arrangement evidence only.
- [x] learning-plan capabilities are separate and verified.
- [x] compatibility consumes explicit artifact sources.
- [x] learning overlay requires a verified matching plan.
- [x] learning does not depend on workbench orchestration.
- [x] chord quality is controlled and versioned.
- [x] function/Roman-numeral data is non-authoritative and deferred.
- [x] annotations cannot control semantic behavior.
- [x] E-007 accurately holds pitch mapping constant.
- [x] E-008 records future pitch-mapping work.
- [x] Sprint 1 requires A-011 usability evidence.
- [x] traceability, tests, packages, ADRs, and work packages are updated.
- [x] a separate Implementation Agent can begin WP-01 without inventing product or semantic meaning.

## 9. Remaining assumptions and risks

No architecture blocker remains. A-001–A-011 remain explicit assumptions.

Primary execution risks are Sprint 1 breadth, capability vocabulary growth, initial chord-quality vocabulary governance, and headless-workbench friction. The ordered gates, deliberately small vocabulary, source-qualified capability evidence, and A-011 review contain these risks.

## 10. No hidden product decisions

This pass does not select a final notation, default recipe, winning time/duration treatment, visual pitch mapping, default learning transformation, functional-analysis system, or polished learner interface. E-007 and `idea-boundary@1` remain experiments.

## 11. Exit determination

Architecture Sprint 0.1 correction work is complete. Architecture baseline 0.2 is implementation-ready subject to Product Owner approval.
