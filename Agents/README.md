# Music Notation Learning System

Version: 1.0 product and architecture handoff baseline  
Status: Ready for Architecture Sprint 0

## Purpose

This repository is the source of truth for designing Prototype 1 of a music-learning notation system. The product is intended to help a musician understand, learn, memorize, transpose, and perform an arrangement with less cognitive effort than traditional notation while preserving more musical information than a chord sheet.

## Roles

- **Business stakeholder:** defines desired outcomes and approves product decisions.
- **Product Owner:** owns requirements, priorities, acceptance criteria, and product decisions.
- **Lead Software Architect:** converts settled product requirements into an implementation-ready technical design.
- **Implementation Agent:** builds only from approved architecture and sprint specifications.
- **Validation Agent or Product Owner:** evaluates outputs against the corpus and learning goals.

## Required reading order for the architect

1. `00_Project_Constitution/ProjectConstitution.md`
2. `00_Project_Constitution/GuidingPrinciples.md`
3. `00_Project_Constitution/DecisionMaking.md`
4. `01_Product/Vision.md`
5. `01_Product/Requirements.md`
6. `01_Product/DecisionLog.md`
7. `01_Product/AssumptionLog.md`
8. `01_Product/Glossary.md`
9. `03_Corpus/Corpus.md`
10. `04_Experiments/ExperimentRegister.md`
11. `05_Implementation/Sprint0.md`
12. `ARCHITECT_PROMPT.md`

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

The product documents are authoritative. Files in `02_Architecture` are architecture templates and constraints, not approved final designs. The architect must complete them during Sprint 0.

## Handoff rule

A separate implementation agent must be able to execute Sprint 1 without making product decisions. If it must guess learner behavior, musical semantics, product scope, or notation meaning, Architecture Sprint 0 is incomplete.
