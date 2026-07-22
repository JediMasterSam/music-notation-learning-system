# Music Notation Learning System

Version: 1.1 product and architecture handoff baseline  
Status: Architecture baseline 0.2 ready for Product Owner approval

## Purpose

This repository is the source of truth for Prototype 1 of a music-learning notation system. Prototype 1 is an experimental notation and learning workbench: one canonical musical arrangement can drive multiple reproducible representation treatments and reusable pedagogical transformations without becoming coupled to any final notation system.

The product is intended to help a musician understand, learn, memorize, transpose, and perform an arrangement with less cognitive effort than traditional notation while preserving more musical information than a chord sheet.

## Roles

- **Business stakeholder:** defines desired outcomes and approves product decisions.
- **Product Owner:** owns requirements, priorities, acceptance criteria, product decisions, and approval of experimental defaults.
- **Lead Software Architect:** converts approved product direction into implementation-ready technical design.
- **Implementation Agent:** builds only from approved architecture and sprint specifications.
- **Validation Agent or Product Owner:** evaluates software evidence, workbench usability, corpus behavior, and learner outcomes without conflating them.

## Required reading order for implementation

1. `00_Project_Constitution/ProjectConstitution.md`
2. `00_Project_Constitution/GuidingPrinciples.md`
3. `00_Project_Constitution/DecisionMaking.md`
4. `01_Product/Vision.md`
5. `01_Product/Requirements.md`
6. `01_Product/DecisionLog.md`
7. `01_Product/AssumptionLog.md`
8. `01_Product/Glossary.md`
9. `01_Product/ArchitectureSprint0.1Handoff.md`
10. `02_Architecture/ArchitectureSprint0.1ProductOwnerReview.md`
11. `03_Corpus/Corpus.md`
12. `04_Experiments/ExperimentRegister.md`
13. `05_Implementation/AcceptanceTests.md`
14. all approved files in `02_Architecture`, beginning with `Architecture.md`
15. `05_Implementation/Sprint1.md`

## Authority order

1. Project Constitution
2. Approved product decisions
3. Product requirements
4. Acceptance criteria
5. Approved architecture decisions
6. Sprint instructions
7. Implementation convenience

Lower-level documents may not silently override higher-level documents.

## Repository status

Architecture Sprint 0 and the Sprint 0.1 workbench amendment are complete. Architecture baseline 0.2 incorporates the Product Owner correction pass covering product-governance records, artifact-scoped capability ownership, controlled chord-quality semantics, workbench-usability evidence, and precise experiment framing.

No final notation syntax, final rendering strategy, default learning transformation, or winning experiment treatment has been selected.

## Handoff rule

A separate Implementation Agent must be able to execute Sprint 1 without making product decisions. If it must guess learner behavior, musical semantics, artifact authority, product scope, or notation meaning, the architecture handoff is incomplete.
