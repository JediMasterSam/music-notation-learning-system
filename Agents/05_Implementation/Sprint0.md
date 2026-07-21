# Architecture Sprint 0

Role: Lead Software Architect  
Production code: Prohibited except tiny disposable examples required to compare designs.

## Objective

Produce a complete engineering specification that allows a separate implementation agent to execute Sprint 1 without making product decisions.

## Required deliverables

1. Completed `02_Architecture/Architecture.md`
2. Completed `02_Architecture/CanonicalModel.md`
3. Completed `02_Architecture/RepositoryStructure.md`
4. Completed `02_Architecture/RenderingPipeline.md`
5. Completed `02_Architecture/PatternEngine.md`
6. Completed `02_Architecture/RenderingEngine.md`
7. Completed `02_Architecture/TestingStrategy.md`
8. Initial ADRs in `02_Architecture/TechnicalDecisions.md` or separate ADR files
9. Updated `01_Product/TraceabilityMatrix.md`
10. Revised engineering-ready `05_Implementation/Sprint1.md`
11. Architecture review report identifying risks, unresolved product questions, and recommendations

## Required depth

Each architecture document must define:

- module boundaries;
- input and output contracts;
- invariants;
- failure behavior;
- data ownership;
- versioning;
- test strategy;
- examples;
- rejected alternatives;
- linked requirement IDs.

## Exit criteria

Sprint 0 is complete only when:

- every requirement has an owning component or explicit future-phase disposition;
- experimental decisions remain replaceable;
- canonical and normalized models are clearly separated;
- pitch strategy can be swapped;
- inversion, slash bass, and voicing cannot be accidentally collapsed;
- specificity states survive all pipeline stages;
- familiar-shape hints cannot change harmonic semantics;
- repository commands and package dependencies are defined;
- Sprint 1 is executable in order;
- no final notation syntax has been selected;
- no product decision is hidden inside an ADR.

## Escalation gates

Stop only when:

1. approved requirements directly conflict;
2. a product behavior is genuinely undefined and blocks architecture;
3. an experimental question must be made permanent to proceed;
4. a new learner-facing concept appears unavoidable;
5. legal source constraints prevent required validation and no lawful fixture can substitute.

Ordinary technical choices must be decided, documented, and continued.
