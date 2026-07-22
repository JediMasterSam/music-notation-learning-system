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
