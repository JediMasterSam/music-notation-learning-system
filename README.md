# Music Notation Learning System

## Overview

The Music Notation Learning System is a research and development project exploring a new way to represent music for learning and performance.

Rather than starting from traditional sheet music or chord sheets, the project begins with a canonical representation of musical knowledge. Different visual notations are then derived from that representation, allowing the same musical data to be presented in ways that best support learning, practice, analysis, and eventually performance.

The long-term objective is to create a notation system that helps musicians understand, learn, memorize, transpose, and perform music with less cognitive effort while preserving the information necessary to play convincing arrangements.

## Project Principles

* Learning is prioritized over engraving.
* Representation is canonical; rendering is derived.
* Song identity and arrangement identity are separate concepts.
* Musical intent is represented before graphical appearance.
* Reusable musical ideas are preferred over repeated notation.
* The system is validated against a representative corpus of music rather than isolated examples.
* Product decisions are evidence-driven and validated through experimentation.

## Current Status

This repository currently contains the product specification and project governance documents.

The implementation is intentionally separated into distinct phases:

1. Product definition
2. Software architecture
3. Prototype implementation
4. Corpus validation
5. Learning experiments
6. Iterative refinement

No final notation syntax has been selected. The current focus is designing a robust canonical music model that can support multiple renderers and future interchange formats.

## Repository Organization

* **Project Constitution** — Foundational principles and governance.
* **Product** — Vision, requirements, roadmap, decisions, and glossary.
* **Architecture** — Technical design produced during Architecture Sprint 0.
* **Corpus** — Representative musical examples used for validation.
* **Experiments** — Open design questions and evaluation plans.
* **Implementation** — Sprint plans, coding standards, and acceptance criteria.
* **Reference** — Research and supporting material.

## Project Philosophy

The central hypothesis of this project is that most of the difficulty musicians experience when learning music comes from the way musical information is represented rather than from the music itself.

By separating musical meaning from visual notation, the project aims to create representations that are easier to understand, easier to memorize, easier to transpose, and better suited to modern learning workflows.

## Repository Status

This repository is under active development. Product requirements are expected to evolve as research, architectural work, and prototype validation continue.

## Copyright and License

Copyright © 2026 Sam Gutermuth. All rights reserved.

This repository is provided for viewing and discussion purposes only. No license is granted to copy, modify, distribute, or use the contents without prior written permission.
