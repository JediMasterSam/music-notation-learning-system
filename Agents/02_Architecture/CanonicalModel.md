# Canonical Model

Status: TEMPLATE — Architect must complete during Sprint 0.

## Required top-level concepts

- Song
- Arrangement
- Section
- MusicalIdea
- TimePosition
- Duration
- NoteEvent
- ChordEvent
- Voicing
- MusicalRole
- HandAssignment
- PatternDefinition
- PatternInstance
- RepetitionReference
- Variation
- Transition
- LearningChunk
- LyricEvent or lyric alignment
- PedagogicalHint
- SpecificityState

## Mandatory modeling rules

- Song and Arrangement are separate.
- Inversion, slash bass, and voicing are separate.
- Roles and hands are separate.
- Unknown and intentionally unspecified are separate.
- Canonical data contains no pixel coordinates or final line breaks.
- Repetition and pattern expansion preserve provenance.
- Normalized output is derived and disposable.
- Pitch representation is behind a replaceable strategy boundary.
- Familiar-shape hints never alter canonical harmony.

## Required model specification

For each type, define:

- purpose;
- stable identity;
- fields and types;
- required versus optional fields;
- invariants;
- reference behavior;
- specificity behavior;
- transposition behavior;
- validation errors;
- normalized representation;
- at least one valid and one invalid example.
