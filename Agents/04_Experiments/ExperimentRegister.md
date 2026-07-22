# Experiment Register

## E-001 — Pitch representation

Compare absolute, key-relative, chord-relative, and hybrid canonical pitch strategies.

Measures:

- readability;
- authoring burden;
- renderer complexity;
- handling of non-chord tones;
- transposition behavior;
- amount of knowledge that must be relearned.

Decision owner: Product Owner.

## E-002 — Repetition representation

Compare duplication, reference-plus-variation, and pattern-plus-override.

Measures:

- learner recognition;
- source maintainability;
- alternate-ending clarity;
- provenance;
- vocabulary cost.

## E-003 — Beat presentation

Compare at least two non-whitespace-based temporal treatments in simple and syncopated material.

Measures:

- speed locating chord changes;
- place-keeping;
- visual density;
- compatibility with lyrics and roles.

## E-004 — Learning chunk boundaries

Compare reusable learning transformations across at least three pieces and role-specific chunking conditions.

Measures:

- approachability;
- momentum;
- intimidation from chunk count;
- transition handling;
- difference between structural and pedagogical boundaries;
- transformation reuse and override burden.

## E-005 — Pattern vocabulary

Attempt corpus encoding with a deliberately small library. Every proposed shared pattern must be compared with composition, parameterization, or direct events.

## E-006 — Familiar-shape chord hints

Hypothesis: a player who knows common triad shapes can understand and voice some seventh chords faster when shown a subordinate upper-structure-over-bass hint.

Conditions:

1. canonical chord only;
2. authored hint;
3. generated hint.

Required examples:

- `Am7` → `C/A`;
- `Dm7` → `F/D`;
- at least two rejected candidates;
- one subset or approximate hint.

Measures:

- time to produce three usable voicings;
- wrong chord tones;
- ability to identify canonical root and function afterward;
- confusion between slash bass and inversion;
- perceived helpfulness;
- whether the hint remains necessary after repetition.

Failure conditions:

- learner misnames the chord;
- essential alterations are omitted;
- bass is confused with root;
- hints become a competing vocabulary system.

Automatic generation may not become default without Product Owner approval.

## E-007 — Proportional horizontal time and duration versus explicit grid

**Status:** Required Sprint 1 software/representation experiment under D-028. No winning treatment or learning claim is implied.

**Research question:** How does proportional horizontal onset and duration extent compare with an explicit beat/subdivision grid when the canonical melody and vertical pitch mapping are held constant?

**Controlled variables:**

- exact same canonical melody fixture and normalized source hash;
- `mnls.pitch.absolute-chromatic-y@1` vertical mapping;
- exact-pitch label strategy;
- accessible event data for pitch, onset, and duration;
- renderer, typography environment, viewport policy, and disclosure level where practical;
- no harmony invented.

**Changed variables:**

- horizontal time mapping: fixed beat/subdivision cells versus proportional onset;
- duration encoding: exact grid span versus proportional horizontal extent;
- temporal reference overlay: explicit grid versus proportional time reference.

**Fixture characteristics:** repeated pitch, small and large intervals, at least three durations, subdivision or pickup onset, exact register-bearing notes, and at least two musical ideas.

**Tasks:** locate event onsets; compare duration relationships; identify repeated pitches and interval direction; reproduce or describe a short phrase; report place-keeping and visual friction.

**Planned observations:** task time, onset/duration errors, place loss, interpretation errors, subjective effort, and comments about the time reference. Automated coordinate and reproducibility assertions remain separate from human observations.

## E-008 — Visual pitch-mapping comparison

**Status:** Future experiment; not a Sprint 1 functional requirement.

Hold the time mapping, duration encoding, labels, fixture, renderer, and accessibility treatment constant while comparing visual pitch mappings such as:

- absolute chromatic;
- diatonic;
- key-relative scale degree;
- interval-relative;
- melodic contour only;
- staff-like comparison.

The experiment must define how exact pitch remains available and must not treat contour-only output as exact-pitch evidence.

## E-009 — Headless workbench usability

**Status:** Required Sprint 1 research-workflow review under A-011; not a learner study.

Record:

- time to create or modify a recipe;
- strategy-discovery comprehension;
- option-schema and diagnostic usefulness;
- implementation changes required for a recipe-only experiment;
- friction switching treatments;
- friction reproducing a prior run;
- friction saving variants;
- whether live preview appears necessary.

If the workflow materially slows experimentation, recommend a schema-driven browser configurator for Sprint 2 without moving musical semantics into the browser.
