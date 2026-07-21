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

For canonical `Am7` with `C/A` hint:

- canonical label is primary;
- hint is subordinate and optional;
- equivalence is exact pitch-class set;
- bass A is explicit;
- hiding the hint changes no music;
- harmonic analysis remains Am7.

## AT-010 — Misleading hint suppression

A hint omitting an essential alteration or conflicting with authored voicing fails validation or is marked suppressed.

## AT-011 — Learning validation

A user test records comprehension, memory, execution, coordination, time, errors, and subjective friction separately.

## AT-012 — Lyrics alignment

Lyrics remain bound to musical time or events without manual whitespace padding.

## AT-013 — No final syntax dependency

Canonical behavior, tests, and rendering do not require a final human-authoring punctuation system.
