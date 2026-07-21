# Project Constitution

ID: CONSTITUTION-001  
Status: Approved  
Owner: Product Owner

## Mission

Create a music notation system that minimizes the effort required to understand, learn, memorize, transpose, and perform a musical arrangement while preserving the information necessary for a convincing performance.

The product is optimized for learning and mental-model formation, not for reproducing conventional engraving.

## Non-negotiable rules

### C-001 — Representation is canonical

The musical representation is authoritative. Every visual or educational view is derived from it. A renderer may hide, emphasize, reorganize, or annotate information, but it may not mutate the stored music.

### C-002 — Learning value outranks engraving convention

Traditional notation is evidence and a compatibility target, not the default authority. A conventional choice may be rejected when it materially increases cognitive load for the target learner.

### C-003 — Musical meaning outranks notation punctuation

The project defines semantic concepts before choosing symbols or authoring syntax. Final punctuation may not be designed during early architecture work.

### C-004 — Reduce vocabulary, not merely marks

The project minimizes the number of unique concepts a learner must recognize. A shorter source file or visually compact symbol does not justify a new primitive.

### C-005 — Existing vocabulary must fail before a new primitive is admitted

Before adding a learner-facing construct, the proposer must demonstrate that existing constructs cannot express representative corpus examples clearly through composition, parameterization, or presentation.

### C-006 — Song and arrangement are distinct

A song defines musical identity at one level. An arrangement defines voicing, bass movement, accompaniment, fills, articulation, hooks, and other realization-specific choices. Neither may be collapsed into the other.

### C-007 — Omission must not create false certainty

Required, suggested, optional, intentionally unspecified, and unknown/not-entered information are distinct states. Missing voicing may not silently become root position or a generic default.

### C-008 — The corpus arbitrates abstraction quality

A proposed abstraction must be tested against representative music. Improving one example while worsening several representative examples is evidence against the abstraction.

### C-009 — Architecture must preserve experimentation

Unresolved product questions remain replaceable behind interfaces or isolated modules. An experimental choice may not be embedded as a permanent assumption.

### C-010 — Learning must be validated with people

Successful parsing, rendering, or export does not prove learning value. The project must eventually distinguish comprehension, memory, physical execution, and coordination in user evaluation.

## Amendment rule

The Constitution may be changed only by explicit Product Owner approval. Architecture and implementation agents may propose amendments but may not enact them.
