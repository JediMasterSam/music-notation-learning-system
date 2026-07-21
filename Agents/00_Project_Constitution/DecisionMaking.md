# Decision Making

Status: Approved

## Decision classes

### Product decisions

Owned by the Product Owner. Examples:

- learner-facing behavior;
- musical semantics;
- notation meaning;
- product scope;
- corpus priorities;
- learning philosophy;
- terminology;
- acceptance thresholds.

### Architecture decisions

Owned by the Lead Software Architect within approved requirements. Examples:

- package boundaries;
- interfaces;
- serialization mechanics;
- build tooling;
- internal algorithms;
- testing architecture;
- migration mechanisms.

### Implementation decisions

Owned by the Implementation Agent within approved architecture. Examples:

- internal function names;
- local refactors;
- library configuration;
- ordinary error handling;
- non-user-facing code organization.

## Required records

- Product decisions: `01_Product/DecisionLog.md`
- Open assumptions: `01_Product/AssumptionLog.md`
- Architecture decisions: `02_Architecture/TechnicalDecisions.md`
- Experiments: `04_Experiments/ExperimentRegister.md`
- Requirement coverage: `01_Product/TraceabilityMatrix.md`

## Escalation format

When blocked by a product decision, provide:

1. requirement or decision ID;
2. concrete musical example;
3. options considered;
4. effect on learner vocabulary and corpus;
5. recommendation;
6. work that can continue without the answer.

Do not escalate ordinary technical choices.

## Experimental decisions

An experimental decision must:

- remain replaceable;
- have at least two competing treatments where practical;
- identify the corpus examples used;
- define success and failure criteria;
- record a Product Owner decision before becoming default behavior.

## Conflict resolution

When documents conflict, use this order:

1. Constitution
2. Approved decision
3. Requirement
4. Acceptance test
5. Architecture decision
6. Sprint instruction

Record the conflict; do not silently choose whichever is easiest to implement.
