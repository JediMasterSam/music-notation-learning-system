# Familiar-Shape Chord Hints

Status: Approved feature; generation remains experimental.

## Product behavior

The canonical chord remains the harmonic analysis. A hint is a subordinate learning overlay.

Example:

- canonical: `Am7`
- hint: `think C/A`
- equivalence: exact pitch-class set
- explicit bass: A

## Data requirements

A hint should support:

- display label;
- alternate upper-structure or chord symbol;
- bass note;
- equivalence type;
- explanatory note;
- author approval or confidence;
- visibility level;
- suppression reason.

## Safety against misteaching

A hint must be suppressed or rejected when it obscures an essential alteration, omission, or authored voicing; confuses bass and root; or materially changes harmonic interpretation.
