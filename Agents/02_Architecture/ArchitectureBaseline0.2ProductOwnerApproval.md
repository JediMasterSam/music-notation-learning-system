# Architecture Baseline 0.2 — Product Owner Approval

**Status:** APPROVED  
**Architecture baseline:** 0.2  
**Approved for:** Implementation Sprint 1  
**Review type:** Product Owner architecture acceptance  
**Repository reviewed:** `JediMasterSam/music-notation-learning-system`, branch `main`  
**Review basis:** `Agents/02_Architecture/ArchitectureSprint0.1ProductOwnerReview.md`

## 1. Approval decision

Architecture baseline 0.2 is approved as the implementation baseline for Sprint 1.

The Architecture Sprint 0.1 correction pass satisfies the amendments required by the Product Owner review. No unresolved architecture or product-semantics blocker prevents a separate Lead Developer from beginning Sprint 1.

This approval authorizes implementation of the approved architecture. It does not approve a final notation system, a winning experimental treatment, a default learning transformation, or any learning-effectiveness claim.

## 2. Scope of this review

The review examined the updated product-governance, architecture, experiment, traceability, testing, and Sprint 1 documents, with particular attention to the three required corrections and two clarifications from the previous Product Owner review:

1. formal product authority for the experimental-workbench scope;
2. separation of arrangement and learning-plan capabilities;
3. controlled chord-quality semantics and deferral of opaque harmonic-analysis strings;
4. explicit evaluation of the headless workbench assumption;
5. accurate framing of the first spatial experiment.

The review assessed whether the documents agree well enough for an implementation agent to proceed without inventing product or musical meaning. It did not review production code because Sprint 1 implementation has not yet occurred.

## 3. Accepted corrections

### 3.1 Product governance is complete

The repository now records the workbench changes through stable Product Owner authority:

- D-025 approves Prototype 1 as an experimental notation and learning workbench.
- D-026 assigns learning chunks to derived learning plans produced by reusable transformations.
- D-027 requires versioned declarative representation recipes.
- D-028 requires the proportional spatial-melody treatment as an experiment without selecting it as the final notation.
- D-029 separates experiment definitions, automated run evidence, and human observations.
- R-051 through R-058 formalize the corresponding requirements.
- Historical `H-*` identifiers are retained only as crosswalks and no longer act as parallel product authority.
- The traceability matrix connects the new decisions and requirements to ADRs, tests, experiments, assumptions, and Sprint 1 work.

This satisfies the Constitution's requirement that product scope be established in the Product Decision Log and Requirements rather than only in a handoff or architecture document.

### 3.2 Capability authority is correctly separated

The architecture now separates capability evidence by artifact:

- `ArrangementCapabilityProfile` contains only evidence derived from validated canonical or normalized arrangement content.
- `LearningPlanCapabilityProfile` is produced only from a verified plan that matches the referenced arrangement and content hash.
- renderer and environment capability profiles are separate.
- `TreatmentInputProfile` and `CompatibilityInput` explicitly compose the applicable evidence sources.
- a learning-plan overlay requires an explicitly supplied, verified, matching learning plan.
- recipes cannot manufacture capability evidence.
- neutral capability contracts live outside workbench orchestration.
- the learning subsystem no longer depends on the workbench package.

ADR-017 explicitly supersedes the conflicting portion of ADR-013, preserving an auditable decision history.

This correction protects the central ownership rule: pedagogy may be derived from an arrangement, but it is not evidence contained by the arrangement itself.

### 3.3 Harmonic semantics are sufficiently constrained

The canonical model no longer accepts arbitrary chord-quality text as semantic authority.

- chord quality uses `ChordQualityRef` with a vocabulary ID, vocabulary version, and quality ID;
- immutable registered vocabularies own semantic identity;
- display labels and aliases are derived and cannot substitute for controlled IDs;
- unknown vocabulary or quality IDs fail validation;
- harmonic function, Roman numerals, and related free-form tags are deferred;
- free-form harmonic material is classified as `HarmonicAnalysisAnnotation` with annotation-only authority;
- annotations cannot control validation, transposition, capability analysis, learning transformations, compatibility, projection, layout, or strategy branching;
- Sprint 1 does not render those annotations.

ADR-018 records this boundary. The initial controlled vocabulary remains deliberately small and corpus-driven.

This prevents schema version `0.1.0` from hardening opaque strings into accidental musical semantics.

### 3.4 The headless-workbench assumption is explicit and testable

A-011 now states the assumption that declarative JSON recipes, CLI commands, and generated comparison pages are usable enough for initial Product Owner experimentation without recurring developer intervention.

E-009 and Sprint 1 require evidence about:

- recipe discovery and editing;
- diagnostic comprehension;
- treatment switching;
- rerunning and reproducing an experiment;
- saving a variant;
- implementation changes required for recipe-only experiments;
- whether lack of live preview materially slows experimentation.

The browser configurator remains a deferred adapter rather than an assumed requirement. Sprint 1 evidence will determine its priority.

This is approved as an experiment, not as a conclusion that a CLI/JSON workflow will be sufficient for the full product.

### 3.5 The spatial experiment is correctly controlled

E-007 now compares:

- an explicit beat/subdivision grid; and
- proportional horizontal onset and duration extent.

The comparison holds constant:

- canonical melody;
- normalized source;
- absolute-chromatic vertical pitch mapping;
- exact labels;
- accessibility data;
- renderer and environment policy.

The changed variables are horizontal time mapping, duration encoding, and temporal-reference treatment.

E-007 is therefore a controlled time-and-duration presentation experiment, not a complete test of spatial pitch representation. E-008 separately records a future pitch-mapping comparison that will hold time and duration constant.

This framing is approved.

## 4. Architecture accepted for implementation

The following boundaries are approved for Sprint 1 implementation:

- canonical musical content is authoritative;
- normalized content is derived and disposable;
- learning transformations are reusable, versioned, deterministic strategies;
- learning plans and chunks are derived artifacts that reference canonical content;
- representation recipes contain presentation configuration, not music;
- capability evidence is artifact-scoped and source-qualified;
- compatibility validation precedes projection and layout;
- the same canonical melody drives both required treatments;
- projection, layout, and serialization remain separate;
- experiment definitions, run manifests, and observation records have separate authority;
- deterministic HTML/SVG and manifests provide the Sprint 1 comparison output;
- the browser workbench is a later adapter over the same schemas and public APIs;
- no experimental strategy is a product default.

## 5. Sprint 1 implementation authorization

The Lead Developer is authorized to execute `Agents/05_Implementation/Sprint1.md` in work-package order.

Sprint 1 must prove, at minimum:

1. one canonical melody fixture renders through both required treatments;
2. recipe selection and configuration occur through validated declarative data rather than TypeScript edits;
3. both treatments retain the same canonical or normalized source identity;
4. one reusable learning transformation produces verified learning plans for at least two compatible arrangements or fixtures;
5. learning chunks reference canonical material without copying or mutating it;
6. learning-plan capabilities remain separate from arrangement capabilities;
7. unsupported or forged combinations produce structured diagnostics;
8. experiment definitions and manifests reproduce output deterministically;
9. chord qualities use controlled vocabulary references;
10. free-form harmonic-analysis annotations cannot influence behavior;
11. the generated output remains accessible and safe;
12. the A-011/E-009 Product Owner usability evidence is recorded;
13. neither treatment is described as the final notation system;
14. all mandatory Sprint 1 quality gates pass.

Broad harmony, lyric, role, hand, voicing, repetition, and familiar-shape rendering may remain deferred as specified, but their semantic contracts and regression protection must not be weakened.

## 6. Conditions that remain in force

This approval does not authorize the Lead Developer to:

- alter approved product requirements;
- select a final notation language or visual vocabulary;
- make either treatment the default product experience;
- turn `idea-boundary@1` into the default learning method;
- expand the chord-quality vocabulary for implementation convenience;
- give semantic authority to labels, aliases, Roman-numeral strings, or free-form annotations;
- infer missing musical information silently;
- place pedagogical artifacts inside canonical arrangements;
- allow recipes to create or modify music;
- bypass capability evidence or compatibility validation;
- add a browser UI before the mandatory Sprint 1 gates pass, except through an approved escalation;
- begin optional Sprint 2 work before completing Sprint 1;
- claim learning benefit from successful software execution alone.

Any conflict requiring one of these actions must be escalated rather than resolved silently.

## 7. Known risks accepted for Sprint 1

The following risks are acknowledged and accepted because they are explicit, bounded, and covered by evidence or gates:

### 7.1 Sprint breadth

Sprint 1 spans schema, canonical semantics, normalization, capabilities, learning plans, recipes, two layout treatments, rendering, experiment orchestration, accessibility, reproducibility, and usability review.

Mitigation: execute work packages and gates in order; do not add optional Sprint 2 scope.

### 7.2 Headless-workbench friction

JSON and CLI configuration may prove too cumbersome for Product Owner experimentation.

Mitigation: collect A-011/E-009 evidence and prioritize the browser configurator if the workflow materially slows experimentation.

### 7.3 Vocabulary growth

Capability IDs and chord-quality IDs could expand faster than corpus evidence warrants.

Mitigation: keep registries controlled, source-qualified, versioned, and limited to lawful fixture requirements.

### 7.4 Experimental misinterpretation

Users or agents may treat the proportional treatment or learning transformation as an approved product design.

Mitigation: manifests, documentation, generated pages, and reports must identify them as experimental and avoid winner/default language.

## 8. Required implementation evidence

Before the architecture can be considered faithfully implemented, the Lead Developer must provide:

- source code and committed fixtures;
- passing repository quality gates, including the command defined by Sprint 1;
- schema and semantic validation results;
- generated explicit-grid and proportional-treatment outputs;
- normalized-source identity and provenance evidence;
- learning plans generated for at least two compatible fixtures;
- capability and compatibility diagnostics, including negative cases;
- experiment definition and deterministic run manifests;
- accessibility checks and safe-serialization evidence;
- Sprint 1 implementation report;
- A-011/E-009 usability observations;
- traceability updates;
- a deviation log listing any variance from baseline 0.2.

## 9. Post-implementation approval flow

Sprint 1 completion requires two independent reviews:

1. **Lead Architect implementation-conformance review**
   - verifies module and dependency boundaries;
   - verifies canonical-versus-derived ownership;
   - verifies capability and compatibility contracts;
   - verifies deterministic behavior and provenance;
   - classifies deviations as defects, acceptable variances, or proposed ADR amendments.

2. **Product Owner acceptance review**
   - verifies that the deliverable provides the promised experiment workbench;
   - verifies that experiments can be configured without code changes;
   - verifies that semantics and authority were preserved;
   - evaluates whether the workflow is usable enough to begin Product Owner experiments;
   - determines whether Sprint 1 is accepted and what evidence should shape Sprint 2.

Passing tests alone does not constitute either approval.

## 10. Repository status update

After this document is committed:

- mark architecture baseline 0.2 as `APPROVED` where architecture documents currently say `proposed for approval`;
- retain the prior Product Owner review and architect response as historical records;
- do not rewrite or delete superseded ADRs;
- use baseline 0.2 as the fixed reference for Implementation Sprint 1;
- require any material architecture change during implementation to use the established ADR and escalation process.

Suggested repository location for this document:

`Agents/02_Architecture/ArchitectureBaseline0.2ProductOwnerApproval.md`

## 11. Lead Developer kickoff prompt

```text
Read the repository's root instructions, Project Constitution, authoritative Product documents, Architecture baseline 0.2, this Product Owner approval, and Agents/05_Implementation/Sprint1.md in the prescribed order.

Act as the Lead Developer and Implementation Agent for Sprint 1. Implement the approved architecture; do not redesign it and do not make product or musical-semantic decisions.

Execute the Sprint 1 work packages and gates in order. Keep canonical music, normalized artifacts, derived learning plans, representation recipes, capability evidence, experiment definitions, run manifests, and human observations within their approved authority boundaries.

Implement both required melody treatments from the same canonical fixture. Implement the reusable learning transformation and verified learning plans for at least two compatible arrangements or fixtures. Preserve artifact-scoped capabilities, controlled chord-quality semantics, annotation-only harmonic-analysis text, deterministic provenance, structured compatibility diagnostics, safe accessible rendering, and reproducible experiment output.

Do not describe any treatment as final or winning. Do not add optional Sprint 2 work before every mandatory Sprint 1 gate passes. Escalate any contradiction that would require changing an approved product requirement, semantic meaning, architecture boundary, or ADR.

At completion, provide the full evidence package required by Sprint1.md and ArchitectureBaseline0.2ProductOwnerApproval.md, including the implementation report, generated experiment artifacts, passing quality gates, traceability updates, usability evidence under A-011/E-009, and a complete deviation log.
```

## 12. Final determination

Architecture Sprint 0.1 and its correction pass are complete.

**Architecture baseline 0.2 is approved for Implementation Sprint 1.**

