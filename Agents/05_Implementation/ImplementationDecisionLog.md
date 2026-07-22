# Sprint 1 Implementation Decision Log

Status: Active

This log records ordinary implementation choices made inside Architecture baseline 0.2. It does not amend product meaning or architecture boundaries.

## IDL-001 — Runtime pins

- **Decision:** Pin Node.js `24.14.0` and npm `11.16.0` in `.nvmrc`, package engines, package-manager metadata, the lockfile, and CI.
- **Reason:** Node 24 is the compatible LTS line available in the implementation environment; npm 11.16.0 is the matching explicitly selected workspace tool.
- **Scope:** WP-01 tooling only.

## IDL-002 — Root build orchestration

- **Decision:** Use a strict root TypeScript compilation for the Sprint 1 workspace while retaining explicit npm package public boundaries and a dependency-direction gate.
- **Reason:** It keeps the disposable prototype build small while making forbidden cross-package imports a failing check.
- **Scope:** May be replaced by project references later without changing public package contracts.

## IDL-003 — Dependency vulnerability response

- **Decision:** Pin Ajv `8.20.0` and Vitest `4.1.10` after the initial selected versions produced published audit findings.
- **Reason:** Both patched versions preserve the approved stack and removed the reported advisories without a major-version change.

## IDL-004 — Structural versus registry validation

- **Decision:** JSON Schema requires the complete `ChordQualityRef` shape and forbids opaque quality strings, while vocabulary/version/quality existence is checked by the ordered semantic validator in WP-03.
- **Reason:** This preserves JSON Schema as serialized-structure authority without hard-coding an extensible controlled vocabulary into the canonical schema.
- **Scope:** Schema `0.1.0` and semantic validation staging.

## IDL-005 — Arrangement role collection

- **Decision:** Serialize `MusicalRole` records in `Arrangement.roles` so event, idea, and hand-assignment references have an authoritative arrangement-owned target.
- **Reason:** The approved model defines `MusicalRole` and requires typed role references, but its abbreviated `Arrangement` listing omits the collection that owns them. Arrangement ownership preserves song/arrangement and role/hand boundaries.
- **Scope:** Canonical schema/model completion; no new role kinds or learner vocabulary.

## IDL-006 — Sprint 1 transposition spelling policy

- **Decision:** `spelled-pitch@1` preserves authored spelling for identity transposition and uses a deterministic sharp-based spelling table for nonzero semitone transposition.
- **Reason:** Sprint 1 requires semantic, reproducible transposition but does not approve a final enharmonic-spelling policy. The policy is encapsulated entirely inside the replaceable pitch strategy.
- **Scope:** Experimental pitch strategy behavior only; it is not a learner-facing default or canonical pitch-model decision.

## IDL-007 — Normalized derived identity and ordering

- **Decision:** Derive normalized event IDs from a SHA-256 hash of arrangement, canonical source, and placement path; order events by exact onset, canonical source ID, then derived ID.
- **Reason:** This makes direct, repeated, and varied placements stable across runs without random identifiers or registry iteration order.
- **Scope:** Disposable normalized format `0.1.0`; canonical IDs remain authoritative and begin every provenance chain.

## IDL-008 — Learning-plan hash and verification boundary

- **Decision:** Compute `planHash` over the complete canonicalized plan except the self-referential `planHash` field, and allow plan capabilities only from an in-process value returned by deterministic regeneration verification.
- **Reason:** Excluding only the hash field gives a stable integrity calculation; the runtime verification token prevents a deserialized or hand-constructed plan from self-asserting verified-plan authority.
- **Scope:** Derived learning-plan format and capability analysis only; canonical music remains unchanged.

## IDL-009 — Explicit capability-profile schema variants

- **Decision:** Represent arrangement, learning-plan, renderer, and environment capability profiles as separate JSON Schema union variants matching their public neutral TypeScript contracts.
- **Reason:** Each authority has different identifying hashes and references. Explicit variants mechanically prevent a generic artifact profile from obscuring or forging that authority boundary.
- **Scope:** Capability-profile schema `0.1.0`; no capability meaning or ownership changed.

## IDL-010 — Option-sensitive grid compatibility

- **Decision:** Arrangement analysis publishes evidence for each subdivision from 1 through 16 that exactly represents every normalized event onset and end; the resolved fixed-grid strategy adds the capability requirement matching its materialized subdivision option.
- **Reason:** Grid compatibility depends on both artifact timing and the selected presentation option. Source-qualified dynamic requirements reject coarse grids before projection without giving the recipe authority to claim musical timing facts.
- **Scope:** Sprint 1 fixed-grid options and arrangement evidence only; layout still performs exact arithmetic and fails rather than rounds.

## IDL-011 — Normalized structural projection context

- **Decision:** Carry canonical roles, musical ideas, and transitions into the immutable normalized artifact alongside sections and events.
- **Reason:** Projection must apply role-kind visibility and resolve structural/learning selectors without re-reading canonical JSON or inferring meaning from IDs. These records remain derived references and contain no recipe, learning chunk, or layout data.
- **Scope:** Normalized format `0.1.0`; the added structural context changes normalized and dependent plan hashes, so committed expected plans were regenerated.

## IDL-012 — Exact layout scalar serialization

- **Decision:** Store every layout coordinate as a normalized rational plus its deterministic `mnls.decimal@1` serialization; terminating decimals remain exact and non-terminating values use six-place half-up rounding.
- **Reason:** Scene arithmetic and mathematical tests retain exact values while HTML/SVG serialization receives locale-independent pinned text with no browser floating-point or font-metric dependency.
- **Scope:** Disposable layout/scene format `0.1.0`; canonical and projected artifacts contain no coordinates.

## IDL-013 — Serialized artifact identity and DOM identifiers

- **Decision:** Hash serialized text artifacts over their exact UTF-8 bytes, while retaining canonical JSON value hashes for semantic artifacts; encode every DOM ID source code point into a fixed hexadecimal identifier.
- **Reason:** Output manifests must detect any byte change, and full code-point encoding makes deterministic SVG/HTML IDs injective without accepting user-controlled markup characters or colliding with literal escape-looking source text.
- **Scope:** Derived treatment evidence and safe HTML/SVG serialization only; canonical identity and musical semantics are unchanged.

## IDL-014 — Runnable CLI bundle

- **Decision:** Keep the strict TypeScript workspace build as the package/conformance artifact and additionally bundle the CLI composition root into one Node-targeted ESM file with pinned Rolldown `1.1.5`.
- **Reason:** TypeScript preserves workspace aliases and the source-oriented package exports used by tests, which are not directly runnable by Node after a root `outDir` build. A single deterministic adapter bundle makes the installed `music` binary executable without changing package dependency directions or introducing a runtime loader.
- **Scope:** CLI delivery only; domain packages remain independently typed public boundaries, and no browser framework or plugin loader is added.
