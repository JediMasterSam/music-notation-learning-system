# Product Backlog

Priority: P0 required for the next viable milestone; P1 required for Prototype 1; P2 later.

## Governance

| ID | Priority | Story | Acceptance |
|---|---|---|---|
| PB-A01 | P0 | Maintain product decision log. | Every settled or rejected product decision has ID, status, rationale, and links. |
| PB-A02 | P0 | Maintain assumption log. | Agents distinguish assumptions from requirements. |
| PB-A03 | P0 | Maintain traceability. | Requirements link to decisions, architecture, experiments, and tests. |

## Canonical model

| ID | Priority | Story |
|---|---|---|
| PB-B01 | P0 | Model Song and Arrangement separately. |
| PB-B02 | P0 | Model sections, form, and stable references. |
| PB-B03 | P0 | Model reusable MusicalIdea objects. |
| PB-B04 | P0 | Model meter, beat, subdivision, onset, and duration. |
| PB-B05 | P0 | Model NoteEvent behind an experimental pitch strategy boundary. |
| PB-B06 | P0 | Model ChordEvent, inversion, slash bass, and voicing separately. |
| PB-B07 | P0 | Model musical roles separately from hand assignments. |
| PB-B08 | P0 | Model repetition, variation, alternate endings, and provenance. |
| PB-B09 | P1 | Model PatternDefinition and PatternInstance. |
| PB-B10 | P1 | Model transitions. |
| PB-B11 | P1 | Model learning chunks. |
| PB-B12 | P0 | Model specificity states. |
| PB-B13 | P1 | Model PedagogicalHint and familiar-shape hints. |
| PB-B14 | P1 | Model lyric alignment without whitespace dependence. |

## Tooling and rendering

| ID | Priority | Story |
|---|---|---|
| PB-C01 | P0 | Validate canonical data with human-readable diagnostics. |
| PB-C02 | P0 | Provide minimal lawful fixtures for each core behavior. |
| PB-C03 | P1 | Normalize references and repetitions into a deterministic timeline with provenance. |
| PB-C04 | P1 | Report vocabulary introduced by each fixture. |
| PB-D01 | P0 | Render structural form and temporal coordinates. |
| PB-D02 | P0 | Render beat-aligned harmony. |
| PB-D03 | P0 | Render melody-only material. |
| PB-D04 | P0 | Render role-isolated views. |
| PB-D05 | P1 | Render hand-separated and combined views. |
| PB-D06 | P0 | Render bass, inversion, and voicing distinctly. |
| PB-D07 | P0 | Render repetition and alternate endings recognizably. |
| PB-D08 | P1 | Render learning chunks and excerpts. |
| PB-D09 | P1 | Render optional familiar-shape hints subordinate to canonical harmony. |

## Corpus and validation

| ID | Priority | Story |
|---|---|---|
| PB-F01 | P0 | Approve source status for every corpus item. |
| PB-F02 | P0 | Encode melody-only fixture. |
| PB-F03 | P0 | Encode melody plus harmony fixture. |
| PB-F04 | P0 | Encode chord-driven fixture. |
| PB-F05 | P1 | Encode independent-hands fixture. |
| PB-F06 | P0 | Encode voicing-critical fixture. |
| PB-F07 | P1 | Encode classical or baroque fixture. |
| PB-F08 | P1 | Encode ragtime or stride fixture. |
| PB-F09 | P1 | Encode familiar-shape-hint fixture. |

## Experiments

| ID | Priority | Story |
|---|---|---|
| PB-G01 | P0 | Compare pitch representation strategies. |
| PB-G02 | P0 | Compare beat presentation treatments. |
| PB-G03 | P1 | Compare learning chunk boundaries. |
| PB-G04 | P0 | Review minimum vocabulary. |
| PB-G05 | P0 | Test transposition without relearning. |
| PB-G06 | P1 | Test familiar-shape hints for benefit and harmonic confusion. |
| PB-G07 | P1 | Compare repetition representation strategies. |
