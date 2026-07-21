# Architecture

Status: TEMPLATE — Architect must complete during Sprint 0.

## Required contents

1. Context and architectural goals
2. System boundaries
3. Major modules and responsibilities
4. Canonical versus derived data flows
5. Experiment boundaries
6. Error and diagnostic strategy
7. Versioning and migration strategy
8. Accessibility and security considerations
9. Risks and rejected alternatives
10. Requirement traceability

## Constraints already approved

- TypeScript 5.x
- compatible current Node.js LTS
- npm workspaces
- JSON canonical serialization
- JSON Schema 2020-12 as structural validation source of truth
- Vitest
- HTML plus SVG renderer
- command-line validation, normalization, rendering, corpus testing, and vocabulary reporting
- no renderer ownership of musical semantics
- no final notation punctuation during Sprint 0
