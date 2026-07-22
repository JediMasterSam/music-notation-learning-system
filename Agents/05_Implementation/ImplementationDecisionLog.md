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
