# Acceptance and Validation Tests

## AT-001 — Melody without harmony
Given only NoteEvents, validation and rendering succeed and no chord is invented.

## AT-002 — Beat-aligned chord changes
Given two or more chords in one measure, onset is unambiguous without manual spaces.

## AT-003 — Inversion versus slash bass
Given inversion metadata and an independent bass note, both survive normalization and render distinctly.

## AT-004 — Unspecified voicing
Intentionally unspecified voicing does not imply a fixed pitch collection.

## AT-005 — Required voicing
Required upper pitches and bass appear and are not replaced by generic chord rendering.

## AT-006 — Repeated idea with different ending
The repeated source is recognizable and the changed ending is visible, with provenance preserved.

## AT-007 — Role isolation
Selecting a role preserves timing and section context while hiding unrelated detail.

## AT-008 — Transposition
Changing key preserves structure, timing, roles, repetitions, patterns, hints, and idea relationships.

## AT-009 — Familiar-shape hint
For canonical `Am7` with `C/A` hint, the canonical label is primary, the hint is subordinate and optional, equivalence is exact pitch-class set, bass A is explicit, hiding the hint changes no music, and harmonic analysis remains Am7.

## AT-010 — Misleading hint suppression
A hint omitting an essential alteration or conflicting with authored voicing fails validation or is marked suppressed.

## AT-011 — Learning validation
A user test records comprehension, memory, execution, coordination, time, errors, and subjective friction separately.

## AT-012 — Lyrics alignment
Lyrics remain bound to musical time or events without manual whitespace padding.

## AT-013 — No final syntax dependency
Canonical behavior, tests, and rendering do not require a final human-authoring punctuation system.

## AT-014 — Derived learning-plan ownership
`Arrangement.learningChunks` fails schema validation. One reusable transformation generates plans for two compatible arrangements; chunks reference canonical IDs/spans and copy no event payloads.

## AT-015 — Declarative recipe recombination
Two functional treatments consume the same canonical/normalized source and are selected through validated recipe data without TypeScript source changes.

## AT-016 — Artifact-scoped capability ownership
Arrangement capabilities contain only arrangement-derived evidence; verified-plan, renderer, and environment capabilities remain in separate profiles with authoritative source hashes.

## AT-017 — Verified learning overlay
A requested learning-plan overlay is incompatible without a verified matching plan, fails for a stale arrangement hash, and succeeds when a valid matching plan is supplied without changing arrangement capability results.

## AT-018 — Controlled chord quality
Unknown chord-quality IDs fail; aliases cannot serve as canonical identity; display labels derive from a validated pinned vocabulary reference.

## AT-019 — Non-authoritative harmonic annotations
Free-form function, Roman-numeral, tag, or analysis text cannot affect validation, transposition, compatibility, learning transformations, projection selection, or strategy branching.

## AT-020 — Reproducible evidence authority
An experiment definition reproduces byte-identical automated run manifests and treatment hashes while human observation records remain separate and cannot alter automated evidence.

## AT-021 — Controlled proportional time-and-duration comparison
The explicit-grid and proportional treatments hold canonical source and absolute-chromatic vertical mapping constant while changing only declared time, duration, and temporal-reference strategies.

## AT-022 — Headless workbench usability evidence
The Sprint 1 report records the A-011 usability measures and the number of implementation changes required for recipe-only experiments.
