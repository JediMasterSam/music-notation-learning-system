# Architecture Sprint 0.1 Product Owner Review Handoff

**Status:** Conditional approval — amendments required before implementation  
**Review owner:** Product Owner  
**Applies to:** Architecture baseline 0.2 and revised Implementation Sprint 1  
**Reviewed commit:** `9ccca941083390ee915dec0d277b8d627c601fa6`  
**Date:** 2026-07-22

---

## 1. Purpose

This document records the Product Owner review of Architecture Sprint 0.1.

The amendment successfully reorients Prototype 1 from a demonstration of one proposed notation treatment into an experimental notation and learning workbench. The core architecture is approved in direction, but three corrections are required before Sprint 1 implementation begins.

The purpose of the requested amendments is to:

1. preserve repository governance and decision authority;
2. clarify capability ownership between arrangements and derived learning plans;
3. prevent loosely typed harmonic-analysis strings from becoming accidental canonical semantics.

This is an architecture correction pass. Do not write production code while completing these amendments.

---

## 2. Overall review result

### Recommendation

**Conditionally approve Architecture Sprint 0.1.**

The architecture may become the implementation baseline after the required amendments in this document are completed and reviewed.

### What is approved

The following architecture directions are approved:

- Prototype 1 is an experimental notation and learning workbench, not a proposed final notation system.
- Canonical musical arrangements remain independent of recipes, experiments, learning plans, layout, and workbench state.
- Learning chunks belong to derived learning plans produced through reusable, versioned learning transformations.
- Representation treatments are declarative, versioned recipes.
- Existing strategy primitives can be recombined without TypeScript source-code changes.
- Unsupported or misleading combinations fail through structured diagnostics rather than silent fallback.
- The same canonical melody fixture drives both the explicit-grid and proportional-spatial treatments.
- Experiment definitions, automated run manifests, and human observations have separate authority.
- A headless workbench with declarative JSON, CLI commands, and static comparison output is sufficient for the first implementation proof.
- Live browser configuration remains an explicit later adapter rather than being allowed to control musical semantics.
- No final notation, default rendering strategy, default learning transformation, or winning treatment has been selected.

---

## 3. Positive architecture findings

### 3.1 Canonical and derived ownership is now correct

`Arrangement` no longer owns:

- learning chunks;
- practice sequence;
- prerequisites;
- recipe selections;
- experiment definitions;
- coordinates;
- renderer state.

Learning chunks now exist inside derived `LearningPlan` artifacts and reference canonical material without copying it.

This is the correct ownership boundary.

### 3.2 Reusable learning transformations are properly separated

The new learning architecture supports:

- versioned transformation definitions;
- registered deterministic implementations;
- parameter validation;
- compatibility checking;
- deterministic chunk IDs;
- plan provenance;
- plan-local overrides;
- regeneration and verification;
- application of one transformation to multiple compatible arrangements.

The Sprint 1 `idea-boundary@1` transformation is appropriately described as an experimental proof rather than an approved learning method.

### 3.3 Representation recipes support the workbench objective

`RepresentationRecipe` correctly separates configurable dimensions such as:

- time mapping;
- duration encoding;
- pitch mapping;
- pitch labels;
- structural overlays;
- harmonic overlays;
- disclosure;
- accessibility;
- renderer selection.

Recipes contain configuration rather than musical content. Strategy implementations remain compiled, registered, versioned, and tested.

This supports the intended “construction kit” workflow while preventing arbitrary scripts or misleading configuration.

### 3.4 The spatial-melody hypothesis is now exercised

Sprint 1 requires two functional treatments from the same canonical melody:

1. an explicit beat-grid treatment;
2. a proportional spatial-melody treatment.

The spatial treatment now has testable invariants:

- horizontal position derives from onset;
- horizontal extent derives from duration;
- equal pitch maps to equal vertical position;
- higher pitch appears higher;
- larger intervals produce larger displacement;
- exact pitch, onset, and duration remain available accessibly;
- conventional note-duration glyphs are not required to recover basic duration.

This is a meaningful experiment rather than a replaceability stub.

### 3.5 Reproducibility is well designed

The architecture distinguishes:

- authored experiment definitions;
- resolved recipes;
- generated treatment bundles;
- immutable run manifests;
- separate human-observation records.

Pinned versions and hashes prevent silent upgrades and make treatment comparisons reproducible.

### 3.6 Sprint 1 sequencing is disciplined

The revised Sprint 1 correctly prioritizes:

- the workbench architecture;
- two melody treatments;
- one reusable learning transformation;
- capability and compatibility diagnostics;
- reproducible experiment execution.

Broader harmony, role, hand, lyric, and hint rendering is deferred while canonical and contract-level protections remain in place.

---

## 4. Required Amendment 1 — Record the new product decisions formally

### Problem

The Project Constitution assigns learner-facing behavior, product scope, learning philosophy, terminology, and acceptance thresholds to the Product Owner.

Product decisions are required to be recorded in:

`Agents/01_Product/DecisionLog.md`

Architecture Sprint 0.1 currently relies on:

- the handoff document;
- `H-01` through `H-12` traceability obligations;
- architecture ADRs.

Those artifacts provide useful direction, but they do not replace the required Product Decision Log.

The Decision Log currently ends at `D-024`.

As a result, the repository contains approved product direction that is not recorded through its authoritative product-decision mechanism.

### Required action

Add Product Owner decisions equivalent to the following.

#### D-025 — Experimental workbench objective

**Status:** APPROVED

**Decision:** Prototype 1 is an experimental notation and learning workbench. It is not a demonstration of one proposed final notation system.

**Rationale:** The eventual notation and learning product should emerge from configurable, reproducible experiments rather than being fixed before evidence is gathered.

**Related requirements:** R-001, R-003, R-004, R-043, R-046, R-047–R-049.

#### D-026 — Learning chunks are derived plan content

**Status:** APPROVED

**Decision:** Learning chunks belong to derived learning plans produced through reusable transformations. They do not belong to canonical arrangements.

**Rationale:** An arrangement represents musical realization. A learning plan represents a pedagogical transformation of that realization and must remain replaceable and reproducible.

**Related requirements:** R-010, R-030, R-042.

#### D-027 — Representation treatments are declarative recipes

**Status:** APPROVED

**Decision:** Prototype representation treatments are defined through versioned declarative recipes. Existing strategy primitives must be recombinable without TypeScript source-code changes.

**Rationale:** The prototype is intended to support rapid controlled experimentation without requiring a developer to hard-code each treatment combination.

**Related requirements:** R-004, R-026–R-034, R-043, R-047–R-049.

#### D-028 — Proportional spatial melody treatment

**Status:** EXPERIMENTAL

**Decision:** Prototype 1 shall implement a proportional spatial-melody treatment in which onset, duration, and pitch have testable spatial mappings.

**Rationale:** This treatment exercises the hypothesis that spatial consistency may externalize aspects of how musicians perceive melodic movement and duration.

**Related requirements:** R-001, R-003, R-006, R-011, R-032, R-043, R-046.

#### D-029 — Experiment evidence authority separation

**Status:** APPROVED

**Decision:** Experiment definitions, automated software run evidence, and human observation records are separate artifact classes with separate authority.

**Rationale:** Reproducible rendering output proves software behavior but does not prove learning effectiveness.

**Related requirements:** R-043, R-046, R-048, R-049.

### Requirement treatment

The architect must review whether the new workbench obligations require new requirement IDs.

Acceptable options are:

1. create new stable requirement IDs for the workbench, recipe, transformation, and experiment-artifact obligations; or
2. explicitly amend existing requirements so these obligations are unambiguously part of the approved product baseline.

Do not rely solely on `H-*` identifiers as a parallel long-term product-requirement system.

### Traceability updates

After recording the decisions:

- map each new decision to affected requirements;
- map ADR-011 through ADR-016 to the new Product Decisions;
- update `TraceabilityMatrix.md`;
- ensure Sprint 1 references the Product Decision IDs where appropriate.

---

## 5. Required Amendment 2 — Separate arrangement capabilities from learning-plan capabilities

### Problem

`ArrangementCapabilityProfile` currently includes or contemplates:

`learning-plan.available`

A learning plan is deliberately not part of the arrangement.

The rendering pipeline elsewhere correctly treats compatibility as a combination of:

- arrangement capabilities;
- optional learning-plan capabilities;
- strategy capabilities;
- renderer/environment capabilities.

These models must be made consistent.

An arrangement cannot truthfully possess a learning-plan capability merely because a plan may be supplied separately.

### Required design correction

Create a capability-input boundary equivalent to:

```text
TreatmentInputProfile {
  arrangement: ArrangementCapabilityProfile;
  learningPlan?: LearningPlanCapabilityProfile;
  environment?: EnvironmentCapabilityProfile;
}
```

The exact type names may differ, but ownership must remain explicit.

### Arrangement capability profile

`ArrangementCapabilityProfile` may contain evidence derived only from validated canonical or normalized musical data, such as:

- exact onset available;
- exact duration available;
- subdivision resolution available;
- exact register-bearing pitch available;
- pitch spelling available;
- harmony present;
- musical ideas present;
- sections present;
- roles assigned;
- hand assignments complete, partial, unknown, or absent;
- pitch-class-set comparison supported by the selected canonical pitch strategy.

It must not claim:

- a learning plan exists;
- a learning plan is valid;
- learning chunks are available;
- a renderer supports an overlay;
- an experiment definition exists.

### Learning-plan capability profile

A verified plan may provide evidence such as:

```text
learning-plan.valid
learning-plan.matches-arrangement
learning-plan.has-chunks
learning-plan.has-role-filters
learning-plan.has-hand-filters
learning-plan.has-prerequisites
learning-plan.has-transition-practice
```

Every capability must be backed by:

- the verified plan;
- plan hash;
- arrangement hash;
- stable evidence references.

### Environment and renderer capabilities

Where compatibility depends on output environment or renderer support, define a separate environment or renderer capability source rather than placing those facts in the arrangement profile.

Examples:

- renderer supports SVG;
- renderer supports a requested overlay;
- comparison-wide environment available;
- accessibility parallel event list supported.

### Compatibility contract

Compatibility should evaluate a composite input:

```text
CompatibilityInput {
  arrangementProfile;
  learningPlanProfile?;
  selectedStrategyDescriptors;
  rendererProfile;
  environmentProfile?;
  limitationPolicy;
}
```

A requested learning-plan overlay without a verified matching plan must be classified as incompatible.

It must not be treated as an absent arrangement feature.

### Package ownership

Review the current dependency in which `learning` imports a capability contract owned by `workbench`.

Prefer a neutral shared contract location, such as:

- a small `capabilities` package;
- a model-adjacent non-musical contract package;
- or another dependency-neutral interface package.

The learning engine should not depend on the experiment-orchestration package merely to describe evidence-backed capabilities.

The architect may retain the current dependency only if it documents why this does not invert ownership or create future coupling.

### Required tests

Add or clarify tests proving:

- recipes cannot forge arrangement capabilities;
- learning plans cannot forge canonical capabilities;
- arrangement analysis remains unchanged when all plans are deleted;
- plan capability analysis fails for stale arrangement hashes;
- learning overlay compatibility requires a verified plan;
- a valid plan can be supplied to multiple compatible recipes without changing arrangement capability results;
- capability evidence always identifies its authoritative artifact source.

---

## 6. Required Amendment 3 — Tighten or defer opaque harmonic-analysis strings

### Problem

The canonical chord model still contains unrestricted strings equivalent to:

```text
ChordAnalysis {
  quality: string;
}

analysisMetadata?: {
  function?: string;
  romanNumeral?: string;
  tags?: string[];
}
```

The architecture rejects opaque rendered strings as musical authority for pitch and chord symbols, but unrestricted canonical strings can recreate the same problem.

If implemented as currently written, the system may accept values such as:

```text
quality: "kind of minor-ish"
function: "dominant feeling"
romanNumeral: "V7/V maybe"
```

The system cannot reliably validate, compare, transpose, or reason about these values.

Sprint 1 is about to implement canonical schema `0.1.0`, so this must be resolved before WP-02 and WP-03.

### Required action for chord quality

Replace unrestricted `quality: string` with a controlled, versioned semantic identifier or structure.

An acceptable direction is:

```text
ChordQualityRef {
  vocabularyId: string;
  vocabularyVersion: string;
  qualityId: string;
}
```

Or use another architecture-consistent registered vocabulary mechanism.

Requirements:

- values must be validated;
- display labels must be derived;
- aliases must not become semantic identities;
- adding a new shared quality must follow vocabulary governance;
- the representation must remain extensible without arbitrary free text becoming authoritative.

### Required action for harmonic function and Roman numerals

Choose one of these approaches.

#### Preferred Sprint 1 approach — defer semantics

For Prototype 1:

- remove `function` and `romanNumeral` from authoritative canonical semantics;
- permit them only as clearly labeled non-authoritative annotations;
- do not use them for validation, transposition, compatibility, learning transformations, or rendering logic.

Example:

```text
analysisAnnotations?: {
  text: string;
  system?: string;
  authority: "annotation";
}
```

#### Alternative — define typed semantics

If retained as authoritative canonical meaning, define proper typed structures with:

- key or tonic context;
- scale degree;
- alteration;
- chord function category;
- applied/secondary target;
- inversion where applicable;
- notation-system/version identity;
- validation rules;
- transposition behavior;
- display formatting.

Do not implement a partial semantic model merely to preserve the current strings.

### Tags

Clarify whether `tags` are:

- non-authoritative search/annotation metadata;
- controlled analysis vocabulary;
- or learner-facing terminology.

If non-authoritative, document that no semantic code may depend on them.

### Required tests

Add tests proving:

- unknown chord-quality IDs fail;
- quality aliases do not become authority;
- display labels are derived from validated semantic values;
- free-form annotations cannot affect transposition or compatibility;
- no renderer or learning transformation branches on arbitrary Roman-numeral/function strings;
- schema/type contracts do not silently accept opaque harmonic authority.

---

## 7. Required Amendment 4 — Record the Sprint 1 workbench-usability assumption

### Problem

ADR-014 assumes the Product Owner can conduct early experiments by editing or generating JSON recipes and using CLI-generated comparison pages.

This is a reasonable Sprint 1 assumption, but it is not recorded in the Assumption Log.

### Required action

Add:

#### A-011 — Headless workbench usability

**Status:** OPEN

**Assumption:** Declarative JSON recipes, CLI commands, and generated static comparison pages are usable enough for the Product Owner to conduct initial representation experiments without recurring developer assistance.

**Required treatment:** Evaluate after the first complete experiment run. Record friction involving recipe discovery, option editing, validation diagnostics, rerunning, comparing results, and saving variants. If this workflow materially slows experimentation, prioritize a schema-driven browser configurator in Sprint 2.

### Sprint 1 evidence

The Sprint 1 report should contain a Product Owner usability section recording:

- time required to create or modify a recipe;
- whether strategy discovery was understandable;
- whether option schemas and diagnostics were sufficient;
- number of implementation changes required for a recipe-only experiment;
- friction switching treatments;
- friction reproducing a prior run;
- whether live preview appears necessary.

This is not a human learning study. It evaluates the research workbench itself.

---

## 8. Clarification — What the first spatial experiment actually varies

Both required Sprint 1 treatments currently share:

`mnls.pitch.absolute-chromatic-y@1`

Therefore the first comparison primarily changes:

- horizontal time mapping;
- duration encoding;
- temporal reference treatment.

It does not substantially compare alternative pitch mappings.

This is good controlled experimental design, but the experiment definition and documentation must say so accurately.

### Required wording

The research question should be framed approximately as:

> How does proportional horizontal onset and duration extent compare with an explicit beat/subdivision grid when the canonical melody and vertical pitch mapping are held constant?

Do not describe the first experiment as a complete test of spatial pitch notation.

### Future experiment recommendation

Record a future experiment that holds time and duration treatment constant while comparing pitch mappings such as:

- absolute chromatic;
- diatonic;
- key-relative scale degree;
- interval-relative;
- contour only;
- staff-like comparison.

No additional Sprint 1 functional pitch mapping is required by this review.

---

## 9. Sprint 1 scope review

Sprint 1 now includes substantial breadth:

- multiple schema families;
- canonical model and validation;
- normalization and provenance;
- pitch strategy;
- capability analysis;
- learning transformations;
- plan verification;
- representation recipes;
- compatibility evaluation;
- two functional layout treatments;
- accessible HTML/SVG rendering;
- experiment orchestration;
- CLI;
- reproducibility;
- retained harmony and repetition regression contracts.

The work remains executable only if the implementation agent adheres strictly to the ordered work packages.

### Scope control requirements

- Do not implement optional Sprint 2 features before all mandatory Sprint 1 gates pass.
- Do not polish the visual vocabulary beyond what is needed to evaluate the treatments.
- Do not add a browser UI during Sprint 1 unless the headless workflow is proven incapable of meeting the stated objective and the required escalation is accepted.
- Do not expand the shared pattern vocabulary.
- Do not add new pitch mappings beyond the required strategy unless needed as a minimal test double.
- Do not implement broad functional harmony, hand, role, lyric, or hint rendering merely because the underlying contracts exist.
- Do not claim corpus completeness.
- Do not add final notation punctuation.

### Recommended implementation emphasis

Prioritize evidence that:

1. one canonical source produces distinct treatment outputs;
2. treatment configuration requires no source-code edit;
3. mathematical visual invariants are correct;
4. derived plans are reusable and non-authoritative;
5. compatibility failures are truthful;
6. runs are reproducible;
7. the Product Owner can practically operate the workbench.

---

## 10. Required artifact revisions

Review and amend at least:

- `Agents/01_Product/DecisionLog.md`
- `Agents/01_Product/AssumptionLog.md`
- `Agents/01_Product/Requirements.md`, if new requirement IDs or amendments are needed
- `Agents/01_Product/TraceabilityMatrix.md`
- `Agents/02_Architecture/Architecture.md`
- `Agents/02_Architecture/CanonicalModel.md`
- `Agents/02_Architecture/ExperimentWorkbench.md`
- `Agents/02_Architecture/LearningTransformations.md`
- `Agents/02_Architecture/RenderingPipeline.md`
- `Agents/02_Architecture/RepositoryStructure.md`
- `Agents/02_Architecture/TechnicalDecisions.md`
- `Agents/02_Architecture/TestingStrategy.md`
- `Agents/02_Architecture/ArchitectureReview.md`
- `Agents/05_Implementation/Sprint1.md`
- `Agents/04_Experiments/ExperimentRegister.md`

### Experiment Register update

Add or amend an experiment entry for the proportional-time/duration comparison.

The entry should identify:

- the exact controlled variables;
- the exact changed variables;
- the shared pitch mapping;
- the melody fixture characteristics;
- the learner/research tasks;
- the planned observations;
- the fact that no learning claim is made by automated output.

---

## 11. Acceptance criteria for this amendment pass

The amendment is complete only when:

- [ ] D-025 through D-029, or equivalent Product Decision records, exist;
- [ ] the workbench obligations are represented through stable product requirements or explicit amendments;
- [ ] `H-*` identifiers are not the sole long-term authority for product scope;
- [ ] A-011 is recorded;
- [ ] arrangement capabilities contain only arrangement-derived evidence;
- [ ] learning-plan capabilities are modeled separately;
- [ ] compatibility consumes explicit artifact capability sources;
- [ ] a requested learning overlay requires a verified matching plan;
- [ ] capability ownership does not create an unjustified dependency from learning into workbench orchestration;
- [ ] chord quality is controlled and versioned rather than unrestricted text;
- [ ] Roman-numeral and function data are either properly typed or explicitly non-authoritative and deferred;
- [ ] arbitrary analysis annotations cannot control semantic behavior;
- [ ] the first spatial experiment accurately states that pitch mapping is held constant;
- [ ] a later pitch-mapping comparison is recorded as future experimental work;
- [ ] Sprint 1 includes a workbench-usability review tied to A-011;
- [ ] all traceability mappings are updated;
- [ ] Architecture Review no longer reports “no unresolved blockers” until these amendments are completed;
- [ ] a separate Implementation Agent can begin WP-01 without inventing product or semantic meaning.

---

## 12. Product Owner disposition

Architecture Sprint 0.1 remains **conditionally accepted**.

No redesign of the core workbench architecture is required.

The requested changes are targeted corrections involving:

- product-governance records;
- capability-source ownership;
- canonical harmonic typing;
- explicit workbench-usability validation;
- precise experiment framing.

After these corrections are made, Architecture baseline 0.2 may be approved as the Sprint 1 implementation baseline.

---

## 13. Exact kickoff prompt for the architect

```text
Read the Project Constitution, Product Decision Log, Assumption Log, Requirements, Architecture Sprint 0.1 artifacts, and ArchitectureSprint0.1ProductOwnerReview.md.

Complete the Architecture Sprint 0.1 Product Owner review amendments. Do not write production code.

First, formalize the approved workbench direction in the Product Decision Log and update requirements and traceability so H-* handoff obligations do not become a parallel product-authority system. Record the headless-workbench usability assumption in the Assumption Log.

Second, correct the capability model so ArrangementCapabilityProfile contains only evidence derived from the validated arrangement. Model verified learning-plan capabilities separately, along with renderer or environment capabilities where needed. Update compatibility contracts, package ownership, APIs, diagnostics, and tests accordingly. A learning-plan overlay must require an explicitly supplied or generated verified plan and must not appear as an arrangement capability.

Third, resolve opaque canonical harmonic-analysis strings before schema implementation. Replace unrestricted chord quality text with a controlled versioned semantic identifier or structure. Either define harmonic function and Roman-numeral analysis as proper typed semantics or defer them to clearly non-authoritative annotations that cannot affect validation, transposition, compatibility, learning transformations, or rendering logic.

Fourth, clarify that the first spatial experiment compares proportional horizontal onset/duration treatment with an explicit beat grid while holding the absolute chromatic vertical pitch mapping constant. Record future pitch-mapping comparison work separately.

Revise all affected product, architecture, traceability, experiment, testing, and Sprint 1 documents. Preserve the approved experimental-workbench architecture, derived learning-plan ownership, declarative recipes, reproducibility, and no-final-notation constraints.

The amendment is complete only when every acceptance criterion in ArchitectureSprint0.1ProductOwnerReview.md is satisfied and a separate Implementation Agent can begin Sprint 1 without inventing product or semantic meaning.
```
