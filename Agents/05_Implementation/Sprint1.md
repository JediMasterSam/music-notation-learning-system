# Implementation Sprint 1

Status: Product baseline; architect must refine after Sprint 0.

## Objective

Prove that the core architecture can represent, validate, normalize, transpose, and render three small but meaningfully different fixtures without choosing final notation syntax.

## Work order

1. Initialize repository and tooling.
2. Seed governance and traceability documents.
3. Implement schema version `0.1.0`.
4. Implement structural and semantic validation.
5. Implement pitch strategy interface.
6. Create three lawful fixtures.
7. Implement deterministic normalizer with provenance.
8. Implement primitive accessible HTML/SVG renderer.
9. Add tests.
10. Produce Sprint 1 report.

## Required fixtures

### Fixture A — Melody only

- complete phrase;
- exact note events;
- pickup or tied duration where practical;
- renders in at least two keys;
- no invented harmony.

### Fixture B — Beat-aligned harmony

- multiple chords in one measure;
- repeated idea;
- alternate ending;
- unambiguous temporal alignment.

### Fixture C — Voicing and familiar-shape hint

- canonical `Am7`;
- bass A;
- optional exact-pitch-set hint `C/A`;
- explicit voicing;
- intentionally unspecified voicing;
- a separate slash chord that cannot be confused with inversion.

## Required initial views

- full arrangement;
- harmonic roadmap;
- isolated primary line;
- isolated harmony.

## Exit criteria

- fresh clone installs, builds, lints, and tests;
- all fixtures validate, normalize, and render;
- melody fixture transposes through strategy interface;
- chord changes are temporally unambiguous;
- `Am7` remains canonical and `C/A` remains optional;
- slash bass, inversion, and voicing remain distinct;
- repetition and alternate endings preserve provenance;
- no final notation punctuation is invented;
- assumptions and deviations are documented.
