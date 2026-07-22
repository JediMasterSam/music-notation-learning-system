# Assumption Log

Assumptions are not requirements or decisions. The architect must challenge, confirm, replace, or isolate them.

| ID | Status | Assumption | Required treatment |
|---|---|---|---|
| A-001 | OPEN | The initial implementation can target a current desktop browser. | Confirm in Architecture Sprint 0; keep rendering portable. |
| A-002 | NARROWED | Static HTML/SVG is sufficient for the Sprint 1 architecture proof, but not necessarily for the complete experimental workflow. | Evaluate the generated comparison workflow; preserve a browser-adapter boundary. |
| A-003 | OPEN | Manual encoding is acceptable for the initial golden corpus. | Preserve migration path to authoring tools. |
| A-004 | OPEN | A five-minute piano arrangement is a representative performance target. | Use only as a prototype performance benchmark. |
| A-005 | OPEN | The target learner knows common major and minor triad shapes. | Validate before defaulting familiar-shape hints. |
| A-006 | OPEN | The user can evaluate learning speed personally during early trials. | Define repeatable protocol before claiming product success. |
| A-007 | OPEN | JSON is acceptable as canonical serialized data for Prototype 1. | Confirm authoring burden; do not equate serialization with final language. |
| A-008 | OPEN | Existing libraries can provide sufficient pitch and interval primitives without controlling semantics. | Evaluate libraries; keep domain model authoritative. |
| A-009 | OPEN | Piano is narrow enough to validate the canonical model without overfitting it to hands. | Preserve role/instrument separation. |
| A-010 | OPEN | Six to ten lawful fixtures can reveal major model weaknesses before a larger corpus exists. | Record coverage gaps explicitly. |
| A-011 | OPEN | Declarative JSON recipes, CLI commands, and generated static comparison pages are usable enough for the Product Owner to conduct initial representation experiments without recurring developer assistance. | Evaluate after the first complete experiment run. Record friction in recipe discovery, option editing, diagnostics, rerunning, comparison, saving variants, and reproduction. If the workflow materially slows experimentation, prioritize a schema-driven browser configurator in Sprint 2. |
