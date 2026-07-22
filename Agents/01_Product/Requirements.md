# Product Requirements

Status: Approved baseline with Architecture Sprint 0.1 Product Owner amendments  
Version: 1.1

Each requirement has a stable ID. Architecture and tests must reference these IDs rather than restating requirements as new decisions.

## Mission and users

### R-001 — Learning-centered product
The product shall optimize understanding, learning, memorization, transposition, and convincing performance rather than conventional engraving fidelity.

### R-002 — Chord-sheet-capable initial learner
Prototype 1 shall target a piano player who understands chord symbols and learns through harmony, listening, reusable patterns, repetition, and physical practice but may not be fluent in traditional notation.

### R-003 — Faster formation of a musical mental model
The product shall help a learner form a mental model of structure, harmony, timing, roles, patterns, and arrangement identity before or during physical practice.

## Canonical representation

### R-004 — Representation separated from presentation
The canonical representation shall be stored once and rendered into multiple views without mutation.

### R-005 — Musical intent represented directly
The representation shall support harmony, bass movement, accompaniment behavior, rhythmic identity, primary lines, reusable patterns, voicing intent, and arrangement-defining ideas without requiring premature note-by-note expansion.

### R-006 — Exact notes remain primitives
The representation shall support exact notes for melody-only music and passages where pitch detail is the musical idea.

### R-007 — Explicit specificity state
The representation shall distinguish required, suggested, optional, intentionally unspecified, and unknown/not-entered values.

### R-008 — Song and arrangement separation
Song identity and arrangement identity shall be separate canonical concepts.

### R-009 — Musical roles independent of hands
Harmony, bass, accompaniment, primary line, and rhythm shall be modeled independently of hand assignment.

### R-010 — Structural content and derived learning chunks separated
Structural units shall belong to canonical music. Learning chunks shall belong to derived learning plans and reference canonical content without copying or mutating it; they may differ by role or hand.

### R-011 — Beat-based temporal model
Chord and role events shall have unambiguous onset and duration at beat or subdivision resolution without relying on whitespace.

### R-012 — Measures remain coordinates
Measures shall be supported as temporal coordinates but shall not be required as cognitive or learning boundaries.

### R-013 — Repetition and variation preserve provenance
Repeated ideas, alternate endings, and variations shall reference common source material and preserve explicit differences.

### R-014 — Transposition preserves learned structure
Changing key shall preserve form, time, roles, repetitions, patterns, musical ideas, arrangement relationships, and pedagogical metadata where semantically valid.

## Harmony and voicing

### R-015 — Typed chord structure
A chord event shall support root, a controlled versioned chord-quality reference, extensions, alterations, omissions where required, duration, onset, specificity, and non-authoritative analysis annotations. Display labels and aliases shall be derived and shall not become semantic identity.

### R-016 — Inversion is explicit
Inversion shall be a first-class concept when musically important and shall not be inferred merely because a bass note is present.

### R-017 — Slash bass is independent
A slash bass shall specify bass independently of the upper harmony or right-hand voicing.

### R-018 — Voicing is independent
Voicing shall support required or suggested pitches, register, spacing, doubling, omissions, hand or role association, and specificity state without collapsing into chord symbol or slash bass.

### R-019 — Unspecified voicing remains unspecified
A missing or intentionally unspecified voicing shall not imply root position, close position, or a fixed pitch collection.

## Musical organization

### R-020 — Sections
The model shall support sections with stable IDs, labels or types, order, contained ideas, repeat behavior, endings, transitions, lyrics references, and similarity relationships.

### R-021 — Musical ideas
The model shall support reusable musical ideas with stable IDs, spans, roles, repetition sources, variation parameters, ending behavior, and essentiality. Learning-plan membership is derived and shall not be stored as arrangement authority.

### R-022 — Patterns
The model shall support reusable pattern definitions and parameterized instances, including built-in and user-defined patterns, aliases, exemplars, applicable roles, overrides, and provenance.

### R-023 — Pattern admission discipline
A new shared pattern shall require evidence that composition or parameterization of existing vocabulary is insufficient across representative corpus examples.

### R-024 — Transitions
Canonical transitions shall be representable explicitly and may connect sections, ideas, or endings. Derived learning plans may reference transitions for practice relationships without altering canonical transition ownership.

### R-025 — Lyrics alignment
Lyrics shall align to musical time or events without manual whitespace padding.

## Views and rendering

### R-026 — Full arrangement view
The renderer shall support a complete arrangement view.

### R-027 — Harmonic roadmap
The renderer shall support a reduced view emphasizing form, beat-aligned harmony, repetition, and major variations.

### R-028 — Role-isolated views
The renderer shall support isolated harmony, bass, accompaniment, primary line, and rhythm views while preserving temporal and structural context.

### R-029 — Hand-separated and combined views
The renderer shall support left-hand, right-hand, and combined practice views independently of musical roles.

### R-030 — Learning-plan view
The renderer shall support pedagogical chunks supplied by a verified matching derived learning plan without changing canonical music.

### R-031 — Arbitrary excerpts
The renderer shall support sections, phrases, ideas, or arbitrary temporal excerpts.

### R-032 — Adaptive density
Rendering density shall follow musical and learning complexity rather than enforcing uniform detail.

### R-033 — Required versus optional information visible
Rendering shall distinguish prescribed, suggested, optional, intentionally unspecified, and unknown information when relevant to the learner.

### R-034 — Repetition visually recognizable
Repeated material shall appear recognizably related, with variations and alternate endings clearly exposed.

## Familiar-shape chord hints

### R-035 — Optional pedagogical chord hints
A chord event may contain zero or more optional familiar-shape hints that connect an unfamiliar chord to a familiar upper structure over a bass.

### R-036 — Canonical harmony remains primary
A familiar-shape hint shall not replace, respell, or reinterpret the canonical chord analysis.

### R-037 — Hint equivalence classified
A hint shall identify whether it represents exact pitch-class-set equivalence, voicing subset, or approximation.

### R-038 — Hint bass explicit
The bass associated with a familiar-shape hint shall remain explicit.

### R-039 — Hint visibility removable
A learner shall be able to hide a hint without changing canonical music or other rendering behavior.

### R-040 — Hint generation deterministic and suppressible
Generated hints, if implemented, shall be deterministic, testable, and suppressed when they obscure essential alterations, omissions, bass meaning, or harmonic function.

### R-041 — Exact example: Am7 as C/A
`Am7` may show `C/A` as a subordinate exact pitch-class-set hint because both contain A, C, E, and G. The canonical label remains `Am7`.

## Learning and validation

### R-042 — Required learning workflows
The product shall support harmonic-first learning, role-separated learning, hand-separated practice, continuous learning until friction, transition-late learning, and coordination practice as distinct from comprehension or memory. Prototype transformations are experimental and do not establish a default workflow.

### R-043 — Golden corpus
The project shall maintain a permanent representative corpus used to evaluate requirements, abstractions, rendering, transposition, vocabulary, workbench treatments, and regression.

### R-044 — Corpus categories
The corpus shall cover melody only, melody plus harmony, chord-driven pop, independent hands, inversion or voicing-critical material, repeated accompaniment, classical or baroque material, and ragtime or stride.

### R-045 — Lawful source handling
Copyrighted music shall not be committed unless permission or another lawful basis exists. Synthetic fixtures and public-domain works may be used to test behavior.

### R-046 — Learning validation
Prototype success shall be evaluated through learner understanding and performance, distinguishing comprehension, memory, execution, and coordination. Automated workbench output alone shall not establish learning effectiveness.

## Prototype constraints

### R-047 — No final syntax in early prototype
Prototype 1 shall not standardize final notation punctuation before semantic and learning experiments are complete.

### R-048 — Machine-readable versioned artifacts
Prototype 1 shall use documented, versioned, machine-readable canonical data and derived configuration/evidence artifacts.

### R-049 — Headless static proof with replaceable interaction
Prototype 1 may use static HTML/SVG, manual corpus encoding, declarative JSON, and command-line operation for the Sprint 1 proof, while preserving a separate interaction adapter for later configuration needs.

### R-050 — Standard-format future compatibility
The architecture shall avoid choices that prevent later export to common interchange formats such as MusicXML or MIDI, without making full export a Prototype 1 requirement.

## Experimental workbench

### R-051 — Experimental workbench objective
Prototype 1 shall construct, configure, render, and compare multiple learning-oriented representations and pedagogical transformations derived from the same canonical arrangements without presenting any treatment as the final notation system.

### R-052 — Declarative representation recipes
Representation treatments shall be defined through versioned declarative recipes. Existing strategy primitives shall be recombinable without TypeScript source-code changes, and recipes shall contain neither musical content nor executable code.

### R-053 — Artifact-scoped capability and compatibility evidence
Compatibility shall consume separately authoritative capability evidence from the arrangement, optional verified learning plan, selected strategies, renderer, and environment. Configuration shall not forge capabilities, and unsupported combinations shall produce structured diagnostics without silent fallback.

### R-054 — Reusable learning transformations
Learning transformations shall be versioned, deterministic, parameter-validated, capability-checked, reproducible, and applicable without transformation-specific source changes to more than one compatible arrangement.

### R-055 — Derived learning plans
A learning plan shall reference one canonical arrangement, record its transformation and parameters, preserve provenance, and contain derived chunks and practice relationships without copying canonical musical events as new authorities.

### R-056 — Reproducible experiment evidence separation
Experiment definitions, resolved treatment/run manifests, and human observation records shall be separate versioned artifact classes. Automated output shall record exact inputs, versions, hashes, controlled/changed variables, diagnostics, and output hashes without implying learning benefit.

### R-057 — Same source, multiple treatments
At least two functional Sprint 1 representation treatments shall consume the same canonical melody fixture; all differences shall arise from validated recipes, projection, layout, and rendering configuration.

### R-058 — Controlled proportional time-and-duration experiment
Sprint 1 shall compare an explicit beat/subdivision grid with proportional horizontal onset and duration extent while holding the canonical melody, exact labels, accessibility data, and absolute-chromatic vertical pitch mapping constant. The experiment shall not be described as a complete comparison of pitch-mapping strategies.
