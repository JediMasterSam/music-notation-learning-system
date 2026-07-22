# Architecture Sprint 0 Review Report

Status: Complete — proposed for Product Owner and implementation handoff review  
Date: 2026-07-22

## 1. Executive summary

Architecture Sprint 0 has converted the approved product baseline into an implementation-ready technical design without writing production code or selecting final notation punctuation.

The design establishes:

- canonical semantic JSON as the sole musical authority;
- a separately versioned disposable normalized timeline;
- exact rational beat/subdivision timing;
- explicit five-state specificity wrappers;
- separate models for song/arrangement, role/hand, structural/learning chunks, and inversion/slash bass/voicing;
- replaceable pitch, beat-presentation, pattern, repetition, learning-chunk, and hint boundaries;
- stable IDs and append-only provenance;
- deterministic semantic transposition;
- projection, layout, and accessible HTML/SVG rendering as separate stages;
- structured diagnostics, migrations, corpus policy, and testing gates;
- an ordered Sprint 1 plan another agent can execute without deciding product meaning.

## 2. Artifacts reviewed and completed

Completed or revised:

1. `02_Architecture/Architecture.md`
2. `02_Architecture/CanonicalModel.md`
3. `02_Architecture/RepositoryStructure.md`
4. `02_Architecture/RenderingPipeline.md`
5. `02_Architecture/PatternEngine.md`
6. `02_Architecture/RenderingEngine.md`
7. `02_Architecture/TestingStrategy.md`
8. `02_Architecture/TechnicalDecisions.md`
9. `01_Product/TraceabilityMatrix.md`
10. `05_Implementation/Sprint1.md`
11. `02_Architecture/ArchitectureReview.md`

No production implementation was added.

## 3. Architecture decisions

| ADR | Decision | Review result |
|---|---|---|
| ADR-001 | layered npm workspace packages | technically sound; preserves ownership boundaries |
| ADR-002 | JSON Schema 2020-12 structural source of truth | consistent with approved stack and interoperability |
| ADR-003 | canonical graph plus disposable normalized timeline | required for repetition/provenance and multi-view rendering |
| ADR-004 | strategy-tagged semantic pitch envelope | keeps E-001 replaceable; does not settle product pitch strategy |
| ADR-005 | stable IDs and append-only provenance | satisfies traceability and deterministic derivation |
| ADR-006 | projection/layout/renderer separation | prevents renderer ownership of semantics |
| ADR-007 | structured diagnostics and result-returning stages | prevents guessed repairs and supports authoring feedback |
| ADR-008 | explicit semantic-version migrations | protects long-lived canonical meaning |
| ADR-009 | semantic pattern expansion before projection | keeps patterns consistent across views and transposition |
| ADR-010 | validated subordinate familiar-shape hints | preserves canonical harmony and E-006 replaceability |

No ADR contains a learner-facing product decision. Each ADR cites approved requirements and records assumptions rather than silently resolving them.

## 4. Product-rule conformance review

### Canonical versus rendering

Pass. Canonical schemas prohibit final pixels, coordinates, line breaks, and renderer-owned labels. Normalized, projected, layout, and rendered data are explicitly disposable and separately versioned.

### Song versus arrangement

Pass. `Song` owns identity-level data; `Arrangement` owns realization, time, roles, events, structures, patterns, repeats, and practice metadata while referencing the song.

### Role versus hand

Pass. `MusicalRole` and `HandAssignment` are separate types, validators, projection dimensions, and rendered labels.

### Structural versus learning chunks

Pass. Sections and musical ideas own structural references. Learning chunks reference canonical content and never copy or own music.

### Inversion, slash bass, and voicing

Pass. They are separate fields and semantic validators. `ChordEvent.voicing` requires an explicit specificity wrapper so missing data cannot become root/close position.

### Specificity states

Pass. The five states are a closed discriminated union tested across schema, model, normalization, transposition, projection, layout, and rendering.

### Timing

Pass. Rational absolute beats are authoritative; measures are coordinate records. No timing or lyric placement relies on whitespace.

### Repetition, variation, patterns, and provenance

Pass. Canonical relationships remain unexpanded; normalization materializes deterministic events with complete provenance chains.

### Transposition

Pass. Transposition is semantic and strategy-based. Rendered labels are outputs, not inputs. Structural and pedagogical relationships remain stable.

### Familiar-shape hints

Pass. Authored hints remain optional metadata attached to canonical chords; exact/subset/approximation is validated; bass is explicit; hiding a hint changes no music; generated hints remain disabled by default.

### Legal source handling

Pass. Sprint 1 can use synthetic fixtures, so no legal source constraint blocks validation. Corpus source records are a merge gate.

## 5. Assumption treatment

| Assumption | Architecture treatment | Status after Sprint 0 |
|---|---|---|
| A-001 desktop browser | static HTML/SVG target isolated behind projection/layout/renderer | open; safe for Prototype 1 |
| A-002 static output sufficient | no required interaction in Sprint 1; renderer contracts permit later interaction | open; safe for first evaluation artifact |
| A-003 manual encoding acceptable | canonical JSON and migrations preserve future authoring-tool path | open |
| A-004 five-minute target | not encoded as a technical limit | open; later benchmark only |
| A-005 learner knows triad shapes | hints remain optional and off by default for generation | open; E-006 required |
| A-006 personal evaluation sufficient | software reports separate from later human protocol | open; no success claim allowed |
| A-007 JSON acceptable | JSON is Prototype 1 serialization, not final authoring syntax | open |
| A-008 libraries sufficient | libraries wrapped behind `PitchStrategy`; domain model authoritative | open; implementation selection pending |
| A-009 piano narrow enough | roles/instrument semantics kept separate from hands | open |
| A-010 six-to-ten fixtures sufficient | Sprint 1 uses three proof fixtures; corpus coverage gaps reported explicitly | open |

No assumption was converted into an approved product decision.

## 6. Risks requiring continued attention

### RISK-01 — Canonical model breadth

The model is intentionally broader than the Sprint 1 vertical slice. The implementation agent must implement only the required slice while preserving public extension points. Overbuilding would slow validation and harden experiments.

### RISK-02 — Pitch strategy payload looseness

A strategy envelope can become too permissive if strategy schemas are not versioned and validated. Sprint 1 must require registered strategy payload validators and conformance tests.

### RISK-03 — Specificity ergonomics

Explicit wrappers add authoring verbosity. This is an accepted technical cost for correctness during Prototype 1; A-007 and future authoring tools should evaluate ergonomics rather than removing states.

### RISK-04 — Pattern vocabulary inflation

Document-local patterns could be promoted casually. Vocabulary reports and `PatternAdmissionRecord` must remain evidence tools, not automatic approval.

### RISK-05 — Renderer overreach

Layout code may be tempted to infer missing voicings or compress distinctions. Package dependency rules, semantic DOM tests, and diagnostic placeholders are mandatory controls.

### RISK-06 — Hint misteaching

Exact pitch-class equivalence alone does not prove pedagogical benefit. E-006 remains required, and generated hints cannot become default.

### RISK-07 — Snapshot complacency

Stable HTML snapshots could hide semantic regressions. The testing strategy requires direct assertions for time, specificity, provenance, harmonic identity, and accessibility.

### RISK-08 — Corpus undercoverage

Three Sprint 1 fixtures prove architecture, not abstraction quality across styles. Classical/baroque, ragtime/stride, independent-hand, and richer pattern cases remain required corpus expansion.

## 7. Unresolved product escalations

None.

No approved requirements conflict. Architecture does not require an experimental product decision to become permanent. No new learner-facing concept is unavoidable. Synthetic fixtures remove legal blocking risk. Familiar-shape hints can be represented without replacing or materially misteaching canonical harmony, subject to E-006 validation.

## 8. Work that may proceed immediately

The Implementation Agent may begin Sprint 1 WP-01 and continue through the ordered work packages in `05_Implementation/Sprint1.md`. No Product Owner answer is required before workspace/tooling, schema, model, pitch boundary, validators, lawful synthetic fixtures, normalizer, transposition, projection, renderer, CLI, or tests begin.

Product Owner involvement becomes necessary only if an escalation gate is triggered or an experimental treatment is proposed as default learner behavior.

## 9. Exit-criteria checklist

- [x] Every requirement has an owning component or explicit later-phase disposition.
- [x] Every experimental question remains replaceable.
- [x] Canonical and normalized models are clearly separated.
- [x] Canonical data contains no final pixel coordinates or line breaks.
- [x] Renderer-specific metadata is optional and namespaced.
- [x] Pitch encoding can be compared through a strategy interface.
- [x] Transposition operates on semantic values, not rendered labels.
- [x] Song and arrangement are separate.
- [x] Musical roles and hands are separate.
- [x] Structural chunks and learning chunks are separate.
- [x] Inversion, slash bass, and voicing cannot be accidentally collapsed.
- [x] Required, suggested, optional, intentionally unspecified, and unknown states survive the full pipeline by contract and test plan.
- [x] Beat and subdivision timing are foundational and rational.
- [x] Measures remain coordinates, not mandatory cognitive chunks.
- [x] Repetition, variation, patterns, and overrides preserve provenance.
- [x] Familiar-shape hints remain subordinate, optional, classified, and suppressible.
- [x] Exact notes remain supported without invented harmony.
- [x] Identical input and options are required to produce deterministic output.
- [x] User text and lyrics are safely escaped.
- [x] Accessibility does not depend on color alone.
- [x] Repository commands, packages, dependency rules, and exit codes are defined.
- [x] Sprint 1 can be executed in order by another agent.
- [x] No final notation syntax has been selected.
- [x] No ADR contains a hidden product decision.
- [x] No unresolved product escalation blocks implementation.

## 10. Review recommendation

Accept the Architecture Sprint 0 artifacts as the engineering baseline for Sprint 1, subject to Product Owner review of traceability and confirmation that no product meaning was unintentionally changed. Begin implementation with the exact prompt embedded in `05_Implementation/Sprint1.md`.
