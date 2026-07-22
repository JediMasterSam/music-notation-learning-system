# Pattern Engine

Status: Architecture Sprint 0.1 Product Owner amendments complete — proposed for approval
Architecture baseline: 0.2

## 1. Purpose and boundary

The pattern engine represents and expands reusable musical behavior while preserving canonical musical terminology, typed parameters, explicit exceptions, and full provenance. A pattern is semantic reusable behavior; it is not a renderer shorthand or a compressed source-code macro.

Linked requirements: R-005, R-013–R-014, R-022–R-023, R-034, R-043. Linked experiments: E-002, E-005.

## 2. Ownership

`@mnls/patterns` owns:

- pattern definition and reference registries;
- typed parameter schemas;
- definition composition and cycle detection;
- deterministic semantic event-template expansion;
- instance override validation and application;
- pattern provenance;
- vocabulary reporting;
- shared-library admission records.

`@mnls/model` owns serialized canonical contracts. `@mnls/normalizer` owns placement in the arrangement timeline. `@mnls/layout` and renderers only present already-expanded or pattern-aware semantic data; they do not interpret pattern meaning.

## 3. Definition model

A `PatternDefinition` contains:

- stable ID and independent semantic version;
- canonical musical name;
- optional aliases and exemplar references;
- applicable musical roles;
- typed parameter definitions;
- relative-time semantic body;
- optional nested pattern references;
- transposition declarations;
- optional shared-library admission record.

Pattern parameter kinds for Prototype 1:

```text
pitch
pitch-class
chord-analysis
chord-degree
integer
rational
boolean
enum
role-reference
specific-value
```

Arbitrary code, expressions, templates, or callbacks are prohibited in canonical JSON.

## 4. Pattern body and output

The body is a deterministic list of relative semantic templates:

```text
PatternBody {
  duration: Rational;
  templates: PatternTemplate[];
}

PatternTemplate {
  templateId: StableId;
  eventType: supported semantic event type;
  relativeStart: Rational;
  duration: Rational or parameter expression from approved declarative operators;
  roleKind: MusicalRoleKind;
  fields: typed parameter bindings or literal semantic values;
  specificity?: SpecificityState
}
```

Approved declarative operators are limited to parameter lookup, rational addition/multiplication, ordered-list lookup, chord-degree selection, and strategy-delegated pitch derivation. Adding operators that create learner-facing semantics requires product review.

Pattern output is event-based and role-aware. Role is part of semantic output; hand assignment remains a separate instance/reference layer.

## 5. Built-in and user-defined patterns

Built-in and document-local patterns implement the same contract.

- **Built-in/shared:** versioned in `packages/patterns/libraries`, pinned by ID/version, and accompanied by corpus admission evidence.
- **Document-local:** stored in canonical document, usable without shared-vocabulary admission, and reported separately in vocabulary output.
- **Aliases:** search/authoring aids only; canonical name remains authoritative.
- **Song-specific names:** may be aliases or fixture labels but cannot become the canonical shared name without corpus evidence.

## 6. Expansion algorithm

For each `PatternInstance`:

1. Resolve definition ID/version from local then configured shared registries; duplicate resolution is an error.
2. Verify applicable roles.
3. Validate required parameters and reject unknown parameters unless definition explicitly allows namespaced metadata.
4. Resolve nested definitions and detect cycles.
5. Evaluate templates in stable body order using exact rational arithmetic.
6. Construct semantic event candidates with deterministic derived IDs.
7. Apply instance-level role and separate hand-assignment references.
8. Apply overrides in document order.
9. Verify instance duration and event bounds.
10. Return events plus provenance and vocabulary usage.

Derived ID shape is deterministic, for example `patternInstanceId/templateId/repetitionIndex`. The exact delimiter is internal and not learner-facing punctuation.

## 7. Nested composition

Nested pattern composition is permitted because composition can reduce vocabulary without inventing new shared primitives.

Rules:

- composition graph must be acyclic;
- child definition versions are pinned;
- parameter forwarding is explicit and typed;
- parent and child applicable roles must be compatible;
- provenance includes every definition layer;
- technical expansion-depth limit is configurable and produces an error when exceeded;
- vocabulary reports count both the top-level pattern and nested canonical names.

Rejected: textual macro inclusion, recursive self-expansion, or implicit lookup by alias.

## 8. Overrides and exceptions

```text
PatternOverride =
  | ReplaceTemplateField
  | ReplaceTemplateEvent
  | SuppressTemplateEvent
  | InsertEventAfterTemplate
```

Every override has a stable ID and exact target template ID. Override precedence:

1. definition literal;
2. parameter binding;
3. nested parent binding;
4. instance override;
5. enclosing variation operation.

An override may change only fields declared overridable by the definition. It cannot:

- change source or derived stable IDs;
- change a musical role into a hand;
- collapse specificity states;
- mutate canonical harmony through a familiar-shape hint;
- insert renderer coordinates;
- target events by array index alone.

Conflicting overrides at the same layer are errors.

## 9. Specificity behavior

- Pattern templates may emit value-bearing or absent-value specificity states.
- Instance parameters may supply `SpecificValue<T>` only where declared.
- `intentionally-unspecified` and `unknown` are emitted as such; they are never replaced by definition defaults.
- Defaults are allowed only for parameters whose omission does not represent one of the product specificity states. A parameter with musically meaningful omission must itself be a required `SpecificValue<T>`.
- Overrides changing specificity must do so explicitly and add provenance.

## 10. Hand assignment

Definitions declare musical roles, not hands. A pattern instance may reference separate `HandAssignment` objects. A shared pattern must remain usable when assigned to a different hand or both hands unless its canonical musical meaning genuinely depends on execution; such a dependency requires corpus justification and Product Owner review.

## 11. Transposition

Each parameter definition declares one of:

- `transpose-value` through `PitchStrategy`;
- `preserve-relative` for chord degrees/interval relationships;
- `unchanged` for time, booleans, enums, role refs;
- `unsupported`, which blocks transposition with a diagnostic.

For supported definitions, expanding then transposing must equal transposing parameters then expanding. Tests compare normalized semantic values, not rendered labels.

Pattern definition names, aliases, IDs, timing, roles, and provenance do not transpose.

## 12. Provenance

Each expanded event receives ordered steps:

1. canonical pattern instance ID;
2. pattern definition ID/version;
3. nested definition IDs, if any;
4. template ID;
5. parameter bindings relevant to the event;
6. override ID(s), if any;
7. repetition/variation/transposition steps added by later stages.

The provenance report must answer: “Which canonical instance, definition, template, parameter, and exception produced this event?”

## 13. Vocabulary reporting

`music vocabulary report` produces:

- shared canonical pattern names and versions used;
- document-local patterns;
- aliases encountered but not counted as separate canonical vocabulary;
- parameter kinds used;
- direct-event passages used instead of patterns;
- proposed shared patterns lacking admission evidence;
- corpus IDs exercising each shared pattern;
- per-fixture and aggregate counts.

Vocabulary reporting does not decide admission. It supplies evidence to Product Owner and E-005.

## 14. Shared-library admission gate

A proposed shared pattern record must include:

```text
PatternAdmissionRecord {
  status: "candidate" | "approved" | "rejected";
  corpusRefs: string[];
  alternativesConsidered: ("composition" | "parameterization" | "direct-events" | string)[];
  vocabularyEffect: string;
  rationale: string;
  productDecisionRef?: string
}
```

Only `approved` patterns with a Product Owner decision may be treated as default shared vocabulary. Candidate definitions remain usable in experiment registries but are not silently promoted.

## 15. Error codes

| Code | Meaning |
|---|---|
| `PATTERN_UNKNOWN_DEFINITION` | no pinned definition exists |
| `PATTERN_VERSION_MISMATCH` | requested version unavailable |
| `PATTERN_ROLE_INCOMPATIBLE` | instance role not supported |
| `PATTERN_PARAMETER_MISSING` | required parameter absent |
| `PATTERN_PARAMETER_UNKNOWN` | undeclared parameter supplied |
| `PATTERN_PARAMETER_INVALID` | value fails type/semantic validation |
| `PATTERN_CYCLE` | nested definition cycle |
| `PATTERN_DEPTH_EXCEEDED` | technical bound reached |
| `PATTERN_OVERRIDE_TARGET` | target template absent |
| `PATTERN_OVERRIDE_FORBIDDEN` | field not declared overridable |
| `PATTERN_OVERRIDE_CONFLICT` | same-layer contradiction |
| `PATTERN_DURATION_MISMATCH` | expanded events exceed instance span |
| `PATTERN_TRANSPOSE_UNSUPPORTED` | strategy/parameter cannot transpose |
| `PATTERN_ADMISSION_MISSING` | shared-default request lacks approval |

## 16. Tests

- valid built-in and document-local definitions;
- invalid parameter and role cases;
- nested composition and cycle detection;
- stable expansion order and byte-identical normalized output;
- overrides by stable template ID;
- unknown/intentionally-unspecified preservation;
- independent hand assignment;
- expansion/transposition commutativity;
- provenance completeness;
- alternate ending via variation after pattern expansion;
- vocabulary report counts aliases correctly;
- corpus admission gate rejects convenience-only shared patterns.

## 17. Rejected alternatives

- renderer-only shorthand;
- arbitrary executable pattern functions in canonical data;
- pattern names based solely on a song example;
- hand-specific pattern as the default representation of a musical role;
- unversioned global registry;
- array-index overrides;
- expansion that discards definition or override provenance;
- hidden fallback values for unspecified parameters;
- automatic shared-library admission from usage count alone.


## 18. Architecture Sprint 0.1 compatibility review

No material pattern-engine change is required. Patterns still expand to semantic events during normalization before any learning transformation, recipe projection, or layout strategy. Learning plans may reference canonical ideas/events produced through normal normalization provenance; recipes may expose or hide pattern/repetition overlays but cannot reinterpret pattern semantics. Pattern definitions and instances remain musical content, while workbench strategies remain presentation configuration.
