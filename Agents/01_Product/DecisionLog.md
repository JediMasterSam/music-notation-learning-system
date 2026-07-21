# Product Decision Log

Statuses: APPROVED, REJECTED, EXPERIMENTAL.

| ID | Status | Decision | Rationale | Related requirements |
|---|---|---|---|---|
| D-001 | APPROVED | Product optimizes learning and mental-model formation, not engraving. | Core mission. | R-001, R-003 |
| D-002 | APPROVED | Canonical representation is separate from presentation. | Enables multiple views without duplicate music. | R-004 |
| D-003 | APPROVED | Musical intent and reusable concepts are represented before unnecessary note expansion. | Reduces unique ideas. | R-005 |
| D-004 | APPROVED | Exact notes remain supported primitives. | Melody-only and detail-critical music require them. | R-006 |
| D-005 | APPROVED | Learner vocabulary is minimized; new constructs require corpus-wide justification. | Avoids permanent recognition cost. | R-022, R-023, R-043 |
| D-006 | APPROVED | Measures are temporal coordinates, not mandatory cognitive chunks. | Ideas may cross or subdivide measures. | R-012 |
| D-007 | APPROVED | Beat alignment is foundational. | Harmony without timing is insufficient. | R-011 |
| D-008 | APPROVED | Initial roles are harmony, bass, accompaniment, primary line, and rhythm; roles and hands are independent. | Supports varied arrangements and practice modes. | R-009, R-028, R-029 |
| D-009 | APPROVED | Song and arrangement are distinct. | Arrangement identity may depend on voicing, bass, or accompaniment. | R-008 |
| D-010 | APPROVED | Structural chunks and learning chunks are distinct. | Music structure and pedagogy differ. | R-010, R-030 |
| D-011 | APPROVED | Inversion, slash bass, and upper voicing are separate concepts. | Bass does not prescribe upper voicing. | R-016–R-019 |
| D-012 | APPROVED | Omission distinguishes intentionally unspecified from unknown. | Prevents false defaults. | R-007, R-019 |
| D-013 | APPROVED | Canonical musical terminology precedes song-name aliases. | Teaches transferable vocabulary. | R-022, R-023 |
| D-014 | APPROVED | Transposition preserves learned structure. | Core learning requirement. | R-014 |
| D-015 | EXPERIMENTAL | Canonical pitch encoding strategy. | Absolute, key-relative, chord-relative, and hybrid approaches must be compared. | R-006, R-014, R-048 |
| D-016 | EXPERIMENTAL | Final human-authoring syntax. | Syntax follows semantic and learning validation. | R-047 |
| D-017 | APPROVED | Prototype renderer uses HTML and SVG. | Inspectable, accessible, and fast to iterate. | R-026–R-034 |
| D-018 | APPROVED | Prototype stack is TypeScript, Node, JSON Schema, Vitest, and npm workspaces. | Supports typed model, portability, and autonomous execution. | R-048, R-050 |
| D-019 | APPROVED | Familiar-shape chord hints are optional presentation metadata. | They reuse known shapes without replacing harmonic analysis. | R-035–R-040 |
| D-020 | APPROVED | `Am7` may be hinted as `C/A` when labeled exact pitch-class-set equivalence. | Same pitch classes; useful voicing bridge. | R-041 |
| D-021 | REJECTED | Treat a familiar-shape hint as the canonical chord symbol. | Would erase harmonic function and analysis. | R-036 |
| D-022 | APPROVED | Copyrighted pilot songs require permission, user-supplied source, or lawful analytical fixtures. | Keeps corpus legally safe. | R-045 |
| D-023 | APPROVED | The first architecture phase produces documents, not production code. | Prevents implementation from hardening unresolved assumptions. | Sprint 0 |
| D-024 | APPROVED | This Product Owner repository is the source of product truth. | Prevents agent conversations from becoming competing specifications. | All |
