# Architecture Sprint 0.1 Handoff

## Experimental Workbench Amendment

**Status:** Approved Product Owner direction for architecture amendment
**Owner:** Product Owner
**Applies to:** Prototype 1 architecture and revised Sprint 1 planning
**Supersedes:** Any Architecture Sprint 0 assumption that Prototype 1 needs only one functional rendering treatment or must remain entirely static
**Does not supersede:** The Project Constitution, approved musical semantics, or the requirement that canonical music remain independent of presentation

---

## 1. Purpose of this handoff

Architecture Sprint 0 produced a strong technical baseline for canonical music, normalization, transformations, projection, layout, rendering, testing, and implementation.

Product discussion following that sprint clarified that Prototype 1 should not primarily demonstrate one proposed notation system. It should provide an experimental environment in which multiple musical representations and learning transformations can be constructed, configured, compared, and evaluated without repeatedly modifying production code.

The architecture must therefore be amended to support an **experimental notation and learning workbench**.

The final notation system is expected to emerge from experiments performed with this workbench. Prototype 1 must not present any one experimental treatment as the final product.

Do not write production code during this architecture amendment.

---

## 2. Product objective clarification

The revised Prototype 1 objective is:

> Prototype 1 shall be an experimental workbench for constructing, configuring, rendering, and comparing multiple learning-oriented musical representations and pedagogical transformations derived from the same canonical musical arrangement.

The workbench should expose a broad set of meaningful configuration options. It may intentionally be more configurable than the eventual learner-facing product.

The purpose of this configurability is to allow the Product Owner to combine available representational components, observe the result, and identify which combinations improve understanding, learning, memory, transposition, and performance.

The eventual product may expose only a small set of validated treatments. Prototype 1 should expose the larger construction set used to discover them.

---

## 3. Governing product principles

### 3.1 Canonical music remains authoritative

The canonical arrangement must not be altered when a learner, researcher, renderer, or learning strategy changes:

* visual layout;
* pitch presentation;
* duration presentation;
* visible labels;
* learning chunks;
* practice sequence;
* role isolation;
* hand isolation;
* disclosure level;
* experiment treatment.

All such results are derived artifacts or overlays.

### 3.2 Configuration must not create musical meaning

The workbench may select, combine, hide, emphasize, or spatially arrange existing semantic information.

It may not:

* invent harmony;
* infer an unspecified voicing;
* silently assign a hand;
* reinterpret a chord through a pedagogical hint;
* convert unknown information into a default;
* alter pitch, timing, roles, form, or arrangement identity merely for display convenience.

Unsupported or semantically contradictory configurations must produce explicit diagnostics.

### 3.3 Experiments should not require source-code changes

Once a representational or pedagogical primitive has been implemented, the Product Owner should be able to recombine it with other available primitives through versioned declarative configuration.

Adding a fundamentally new primitive may still require implementation. Changing a treatment by combining existing primitives should not.

### 3.4 No experimental treatment is the final notation

Names such as `explicit-grid`, `spatial-melody`, or any future treatment identify experiment implementations. They must not be described as the final or approved notation system.

### 3.5 Experimental freedom requires reproducibility

Every treatment must be saveable, versioned, identifiable, and reproducible from:

* canonical input identity;
* transformation versions;
* configuration values;
* renderer and layout versions;
* experiment definition;
* options and compatibility diagnostics.

---

## 4. Learning chunks and pedagogical transformations

The arrangement itself must not own a learner’s practice decomposition.

Learning chunks should be treated as the output of a transformation applied to an arrangement.

The intended relationship is:

```text
Canonical Arrangement
        ↓
Learning Transformation Definition
        ↓
Learning Plan
        ↓
Learning Chunks and Practice Relationships
```

### 4.1 Learning transformation

Introduce an architecture concept equivalent to:

```text
LearningTransformationDefinition {
  id
  version
  name
  supportedArrangementCapabilities
  parameterSchema
  transformationRules
  outputContract
}
```

A learning transformation is a reusable, versioned, deterministic pedagogical strategy.

Potential examples include:

* phrase-boundary chunking;
* role-first decomposition;
* hand-separated practice;
* transitions learned after surrounding material;
* repeated ideas grouped into one learning unit;
* progressive recombination of roles;
* chunks sized according to configured duration or complexity limits.

These are examples of possible transformations, not approved default learning behavior.

### 4.2 Learning plan

Introduce a derived artifact equivalent to:

```text
LearningPlan {
  id
  formatVersion
  arrangementRef
  transformationRef
  transformationParameters
  chunks
  relationships
  provenance
  diagnostics
}
```

A learning plan:

* references one canonical arrangement;
* does not mutate that arrangement;
* may be regenerated;
* records the transformation and parameters used;
* may contain derived practice order, prerequisites, role filters, hand filters, and transitions;
* must preserve references to canonical IDs and time spans;
* must not copy canonical musical events as new authorities.

### 4.3 Learning chunks

A `LearningChunk` belongs to a derived learning plan, not directly to the canonical arrangement.

Each chunk should reference canonical material through stable references, spans, roles, hands, or approved query results.

The architecture may allow explicit derived-plan overrides, but those overrides must:

* remain outside the canonical arrangement;
* preserve provenance;
* be reproducible;
* never rewrite canonical music.

### 4.4 Reusable application

The architecture must support applying the same learning transformation definition to more than one compatible arrangement.

Sprint 1 should include a minimal proof that one reusable transformation can be applied to at least two small lawful arrangements or fixtures without transformation-specific source-code changes.

---

## 5. Representational workbench

The architecture must support declarative composition of representation strategies.

Introduce an architecture concept equivalent to `ViewRecipe`, `RepresentationRecipe`, or `ExperimentTreatment`. The final technical name is an architecture decision.

A recipe should select compatible strategies and presentation options without containing musical content.

A possible conceptual structure is:

```text
RepresentationRecipe {
  id
  version
  name
  timeMapping
  pitchMapping
  durationEncoding
  pitchLabels
  structuralOverlays
  harmonicOverlays
  roleVisibility
  handVisibility
  learningPlanVisibility
  disclosure
  accessibilityOptions
  rendererOptions
}
```

The architect may reorganize these fields, but the architecture must preserve independent configuration boundaries where practical.

### 5.1 Time-mapping strategies

The workbench should be capable of supporting treatments such as:

* proportional continuous time;
* fixed beat cells;
* subdivision grids;
* compressed structural spacing;
* hybrid proportional and structural spacing.

Not every strategy must be fully implemented in Sprint 1, but the architecture must allow them to be independently selected and versioned.

### 5.2 Pitch-mapping strategies

The workbench should be capable of supporting treatments such as:

* absolute chromatic vertical position;
* diatonic vertical position;
* key-relative scale-degree position;
* interval-relative position;
* melodic-contour-only position;
* traditional staff-like position as a comparison treatment.

These are experimental options, not approved defaults.

### 5.3 Duration encoding

Duration should be independently configurable from pitch and onset.

Candidate treatments include:

* horizontal extent proportional to duration;
* conventional symbolic duration;
* proportional extent plus symbolic reinforcement;
* fixed event width with explicit duration labels;
* sustained connection or continuation treatment.

### 5.4 Labels and overlays

Treatments may independently configure:

* note names;
* scale degrees;
* interval from the preceding event;
* chord-relative degree;
* no pitch labels;
* measure coordinates;
* beat and subdivision markers;
* phrase boundaries;
* musical-idea boundaries;
* repetitions and variations;
* harmony;
* roles;
* hand assignments;
* learning-plan chunks;
* pedagogical hints.

The architecture should distinguish semantic overlays from purely decorative options.

---

## 6. Required spatial-melody experiment

Prototype 1 must include a real experiment related to the Product Owner’s spatial-notation hypothesis.

The hypothesis is that a learner may understand melody more directly when the visual representation makes the following relationships spatially consistent:

* higher pitch appears higher;
* lower pitch appears lower;
* a larger interval produces a larger vertical displacement;
* earlier events appear farther left;
* later events appear farther right;
* longer duration occupies more horizontal extent;
* repeated pitch remains at the same vertical position.

Traditional notation provides some of these relationships but does not consistently represent duration through proportional horizontal extent.

### 6.1 Minimum functional treatments

Sprint 1 should implement at least two functional treatments of the same melody fixture.

#### Treatment A — Explicit beat-grid baseline

This treatment should provide:

* explicit beats and subdivisions;
* unambiguous onset;
* unambiguous duration;
* a consistent pitch representation;
* readable exact pitch information;
* no dependence on whitespace.

#### Treatment B — Proportional spatial melody

This treatment should provide:

* horizontal onset proportional to canonical musical time;
* horizontal event extent proportional to canonical duration;
* a consistent vertical pitch mapping;
* repeated pitch at the same vertical coordinate;
* visible interval direction and approximate magnitude;
* exact pitch information available through labels or accessible text;
* no flags, stems, or traditional note-value symbols required to determine basic duration.

A third hybrid treatment may be proposed if it adds architectural value without making Sprint 1 excessively broad.

### 6.2 Same source, different treatment

All melody treatments must consume the same canonical fixture.

No treatment-specific music may be stored in the canonical arrangement.

Differences must arise entirely from recipe, projection, layout, and rendering configuration.

---

## 7. Experiment definitions

Introduce a reproducible experiment artifact equivalent to:

```text
ExperimentDefinition {
  id
  version
  fixtureRefs
  treatmentRefs
  researchQuestion
  controlledVariables
  changedVariables
  tasks
  observations
  status
}
```

The architecture should support recording:

* which canonical fixtures were used;
* which treatment recipes were compared;
* what variables changed;
* what variables were held constant;
* what learner or researcher task was performed;
* what observations or metrics should be recorded;
* which versions produced the output.

Automated software output must remain separate from human learning results.

An experiment definition does not itself prove that a treatment is effective.

---

## 8. Interaction and configurability

The previous architecture assumed static HTML/SVG could be sufficient for Prototype 1. That assumption must be reconsidered.

The workbench must allow the Product Owner to change configurations without modifying TypeScript source code.

The architect must recommend the smallest technically sound interaction model that satisfies this requirement. Options may include:

* declarative JSON recipe files rendered through the CLI;
* a local browser-based control panel;
* a generated static comparison page;
* a minimal interactive browser application with save/load recipes;
* a combination of CLI and local UI.

A polished learner-facing interface is not required.

However, an architecture that technically supports strategies while requiring a developer to edit source code for every experiment is not sufficient.

At minimum, the revised architecture must define:

* how recipes are created and validated;
* how compatible strategies are discovered;
* how invalid combinations are reported;
* how recipes are saved and loaded;
* how treatment outputs are reproduced;
* whether live preview is included in Sprint 1 or deferred;
* how interactive workbench concerns remain separate from canonical musical semantics.

---

## 9. Compatibility and constraint handling

Broad configurability can produce meaningless or unsupported combinations.

The architecture must therefore define capability and compatibility contracts.

Examples:

* a contour-only pitch strategy may not support exact pitch-class labels;
* a renderer may not support a requested relationship overlay;
* a learning transformation may require section or phrase information absent from an arrangement;
* a duration strategy may require exact timing data;
* a familiar-shape hint treatment may require pitch-class-set comparison;
* a hand-specific view may not be meaningful when assignments are unknown.

The system must respond with structured diagnostics rather than silently approximating or inserting defaults.

A recipe may be:

* valid and fully supported;
* valid with explicit limitations;
* incompatible;
* unsupported by the selected strategy versions.

---

## 10. Required architecture artifacts

Revise the existing Architecture Sprint 0 documents as necessary and produce the following additional or expanded artifacts.

### Required new documents

1. `Agents/02_Architecture/ExperimentWorkbench.md`

   * workbench boundaries;
   * recipe model;
   * strategy discovery;
   * compatibility validation;
   * save/load and reproducibility;
   * static versus interactive delivery recommendation.

2. `Agents/02_Architecture/LearningTransformations.md`

   * transformation definitions;
   * derived learning plans;
   * learning-chunk ownership;
   * application to multiple arrangements;
   * provenance and overrides;
   * deterministic regeneration.

### Required revisions

Review and amend:

* `Architecture.md`
* `CanonicalModel.md`
* `RenderingPipeline.md`
* `RenderingEngine.md`
* `RepositoryStructure.md`
* `TestingStrategy.md`
* `TechnicalDecisions.md`
* `ArchitectureReview.md`
* `01_Product/TraceabilityMatrix.md`
* `05_Implementation/Sprint1.md`

### ADR requirements

Create new ADRs or amend existing ADRs for at least:

* derived learning plans and reusable learning transformations;
* declarative representation recipes;
* strategy capability and compatibility contracts;
* workbench interaction boundary;
* experiment-definition persistence;
* multiple functional rendering strategies in Sprint 1.

Do not silently revise an accepted ADR whose consequences have materially changed.

---

## 11. Revised Sprint 1 objective

Revise Sprint 1 around this objective:

> Prove that one canonical musical representation can drive multiple reproducible visual treatments and reusable pedagogical transformations without code changes, semantic mutation, or selection of a final notation system.

The revised Sprint 1 should remain the smallest credible vertical slice.

It must prove at least:

1. one canonical melody fixture renders through the explicit-grid and proportional-spatial treatments;
2. treatment selection occurs through validated declarative configuration;
3. the same canonical source remains unchanged across treatments;
4. recipe versions and options appear in output manifests;
5. one reusable learning transformation produces derived learning plans for at least two compatible arrangements or fixtures;
6. learning chunks reference canonical content and do not copy or mutate it;
7. unsupported recipe combinations produce structured diagnostics;
8. experiment definitions can reproduce treatment outputs;
9. outputs remain deterministic, safe, and accessible;
10. no treatment is described as the final notation system.

The architect should decide whether the existing harmony, repetition, voicing, and familiar-shape fixtures remain in Sprint 1, are reduced to contract-level tests, or move to Sprint 2.

The decision should prioritize proving the experimental workbench without abandoning essential architecture-risk coverage.

---

## 12. Non-goals

Architecture Sprint 0.1 must not:

* select a final notation language;
* decide the best pitch mapping;
* decide the best duration treatment;
* decide the best chunking strategy;
* define a polished learner-facing product;
* implement automatic transcription;
* implement a comprehensive graphical editor;
* expose arbitrary executable code in recipes;
* permit recipes to mutate canonical music;
* claim that high configurability should remain in the final learner interface;
* treat one Product Owner preference as proof of learning benefit;
* write production code.

---

## 13. Architecture completion criteria

Architecture Sprint 0.1 is complete only when:

* the arrangement remains canonical and independent of learning plans;
* learning transformations are reusable, versioned, deterministic, and applicable across compatible arrangements;
* learning chunks belong to derived learning plans;
* representation treatments are data-driven and reproducible;
* existing visual primitives can be recombined without source-code changes;
* strategy compatibility is explicit and validated;
* proportional spatial melody is a real Sprint 1 treatment, not merely a stub;
* the same fixture can be rendered through multiple treatments;
* experiment definitions record controlled and changed variables;
* the static-output assumption has been explicitly confirmed, replaced, or narrowed;
* the revised Sprint 1 is executable without hidden product decisions;
* no final notation system has been selected;
* all affected requirements, ADRs, tests, packages, and sprint work packages are traceable.

---

## 14. Escalation requirements

Escalate only if architecture cannot proceed without a Product Owner decision concerning:

* whether a proposed configuration dimension represents musical meaning or presentation;
* whether a learning transformation introduces a new learner-facing concept;
* whether a recipe combination could materially misrepresent music;
* whether interactive configuration is required to meet the workbench objective;
* whether the revised Sprint 1 must defer an existing product requirement;
* whether a proposed strategy should become an approved default.

Use the repository’s required escalation format.

Work that does not depend on the disputed decision should continue.

---

## 15. Exact kickoff prompt for the architect

```text
Read the Project Constitution, approved product documents, Architecture Sprint 0 artifacts, and this handoff document.

Begin Architecture Sprint 0.1.

Do not write production code. Amend the architecture so Prototype 1 becomes an experimental notation and learning workbench rather than a demonstration of one proposed notation treatment.

Preserve canonical musical authority. Model learning chunks as derived outputs of reusable, versioned learning transformations applied to arrangements. Define derived learning plans that reference canonical content without copying or mutating it.

Define declarative, versioned representation recipes that allow existing time, pitch, duration, label, overlay, disclosure, and rendering strategies to be recombined without TypeScript source-code changes. Define capability and compatibility validation for unsupported combinations.

Require at least two functional Sprint 1 melody treatments using the same canonical fixture: an explicit beat-grid baseline and a proportional spatial-melody treatment in which horizontal position represents onset, horizontal extent represents duration, and vertical position consistently represents pitch.

Define reproducible experiment artifacts, reconsider the static-only Prototype 1 assumption, and recommend the smallest interaction model that lets the Product Owner configure, save, load, and compare treatments.

Create or revise the required architecture artifacts, ADRs, traceability, tests, repository structure, and Sprint 1 plan. Do not select final notation punctuation, a final visual vocabulary, a default learning strategy, or a polished learner-facing interface.

Escalate unresolved product decisions using the required format. Architecture Sprint 0.1 is complete only when a separate Implementation Agent can execute the revised Sprint 1 without inventing product meaning.
```
