# Product Vision

Status: Approved  
Version: 1.1 workbench clarification

## Product statement

For piano players who can learn from chord symbols and listening but find chord sheets incomplete and traditional notation cognitively expensive, this product provides structured, adaptive representations that communicate harmony, timing, bass, accompaniment, voicing, form, repetition, and arrangement identity through a reusable musical vocabulary.

## Target learner

The initial learner:

- understands basic chord symbols;
- can learn from chord sheets and recordings;
- may read traditional notation slowly or inconsistently;
- thinks first in key and chord relationships;
- learns through repeated patterns and physical practice;
- needs timing, bass, voicing, and arrangement information that chord sheets omit.

## Primary use case

A learner receives an unfamiliar song, understands its structure and harmonic roadmap, practices its distinct musical ideas, coordinates the required roles or hands, and reaches a convincing performance faster than with either a chord sheet or a complete conventional score.

## Product hypothesis

A representation centered on musical ideas, roles, harmony, time, patterns, and explicit arrangement identity can reduce learning effort without discarding musically essential information.

## Prototype 1 objective

Prototype 1 is an experimental notation and learning workbench. It constructs, configures, renders, and compares multiple learning-oriented representations and pedagogical transformations derived from the same canonical arrangements. It does not present one treatment as the final product.

The workbench intentionally exposes a larger construction set than the eventual learner-facing product may retain. Its purpose is to produce reproducible evidence about which combinations improve understanding, learning, memory, transposition, and performance.

## Prototype 1 boundaries

Included:

- piano-oriented canonical representation and rendering;
- melody-only material;
- harmony, bass, accompaniment, primary line, and rhythm roles;
- beat and subdivision alignment;
- sections and musical ideas;
- repetition, variation, alternate endings, and transitions;
- inversion, slash bass, voicing, controlled chord qualities, extensions, and alterations;
- patterns;
- reusable learning transformations and derived learning plans;
- role-isolated and hand-isolated views;
- declarative representation recipes;
- multiple reproducible treatments from the same source;
- headless CLI operation and generated static comparison output for Sprint 1;
- later browser configurator through a separate adapter if workbench-usability evidence requires it;
- transposition and representation experiments;
- lawful manually encoded corpus fixtures.

Excluded:

- graphical music editing;
- automatic audio transcription;
- optical music recognition;
- arrangement generation;
- fingering generation;
- microphone evaluation;
- performance capture;
- accounts and collaboration;
- marketplaces;
- engraving-quality output;
- comprehensive import;
- orchestral completeness;
- arbitrary executable recipe code;
- final notation punctuation, final visual vocabulary, winning treatment, or default learning strategy.
