# Sprint 1 Implementation Report

Status: Implementation complete; pending Lead Architect conformance review

## Review target

- Branch: `implementation/sprint-1`
- Baseline: `7310bdd` (`main`, Architecture baseline 0.2)
- Review range: `7310bdd..implementation/sprint-1`
- Final commit: branch `HEAD`; the immutable hash is supplied in the handoff response because a commit cannot contain its own hash.
- Runtime pins: Node.js `24.14.0`, npm `11.16.0`, TypeScript `5.9.3`, Vitest `4.1.10`, Ajv `8.20.0`, Rolldown `1.1.5`.

No merge to `main`, remote push, or architecture approval was performed.

## Completed work packages

| Work package | Commit | Result |
|---|---|---|
| WP-01 | `e381ba7` | Workspace, pins, quality gates, CI, deterministic serialization |
| WP-02 | `85460b3` | JSON Schema 2020-12 artifact families and negative examples |
| WP-03 | `66e9b80` | Canonical model, controlled harmony, semantic diagnostics, four fixtures |
| WP-04 | `bfb410b` | Pinned pitch strategy and semantic transposition |
| WP-05 | `036711e` | Deterministic normalization and provenance |
| WP-06 | `0ba7aac` | Artifact-scoped capabilities, analyzers, catalogs, compatibility statuses |
| WP-07 | `f8bd9e9` | Reusable transformation and verified derived plans |
| WP-08 | `ee6ab3e` | Recipe resolution, materialized options, structured compatibility failures |
| WP-09 | `afe6a32` | Semantic projection and optional verified-plan overlays |
| WP-10 | `539d232` | Exact fixed-grid layout treatment |
| WP-11 | `00d74d4` | Proportional onset/duration layout treatment |
| WP-12 | `1755812` | Deterministic safe accessible HTML/SVG and comparison bundles |
| WP-13 | `d52c076` | Runnable CLI and experiment reproduction |
| WP-14 | Branch `HEAD` | Regression, lyric contract, traceability, coverage, usability evidence, final gates |

## Verification and test results

The WP-14 completion gate is:

```text
npm run check
npm run check
git diff --exit-code
```

Both repository-wide passes run formatting, ESLint, strict typechecking, build/bundle, dependency-direction checks, the complete Vitest suite, corpus tests, and reproducibility tests. Each completion pass reports 23 test files and 136 tests in the complete suite, followed by a dedicated corpus rerun of 2 files/7 tests and reproducibility rerun of 1 file/2 tests. The handoff also verifies a clean local clone with `npm ci && npm run check`. Automated traceability prevents this report from claiming an unevidenced requirement.

Important focused gates include `npm run test:unit`, `npm run test:integration`, `npm run test:corpus`, and `npm run test:reproducibility`. No negative test was weakened.

## Generated artifacts and reproduction

Generated output is intentionally ignored. Reproduce the required bundle from a clean output directory:

```text
npm ci
npm run build
node_modules/.bin/music experiment run experiments/definitions/spatial-melody-comparison.experiment.json --out output/spatial-melody-comparison
```

The bundle contains top-level `index.html`, `experiment-run.json`, and `diagnostics.json`, plus `explicit-grid/` and `proportional-spatial-melody/` directories containing `index.html`, `manifest.json`, `resolved-recipe.json`, `provenance.json`, `diagnostics.json`, and the shared verified learning plan.

Reference Sprint 1 identities:

- experiment run: `sha256:b3fe3bfbbd886005867bbbb684390d478f41dcca716d8eab1acd78666c1be0c8`;
- M-A canonical: `sha256:2a196eb8fd53daf4284485d6147cbd3276c8d2e8fd2c9f6058ffef1903e0f3ce`;
- M-A normalized: `sha256:b1275e7844281f173664101287a8893bd504d7809603d302aae6ea75bf6618d6`;
- explicit-grid recipe: `sha256:ea4e1b8965be21d69a3a8fb912f7144aefd6e18f2c1326e1957a127e8d681c32`, resolution `sha256:1ffa88233817618c63cd8f827f454d56c8d5b1d9ada0d3531678664cd1b6b873`, treatment run `sha256:b579bfb9971ff7415dec90e1529f1fe9cae36dbd157b87a1dc993843d6ee27b4`;
- proportional recipe: `sha256:b7881768f0ba5b360ad940626c10d2fc310de7f08ed819bad9d5de99ba31a772`, resolution `sha256:ed3847843bed3b9a930260d6af26d6a983ba7315aedca7ccf8b6125f66ee6c63`, treatment run `sha256:98f862b15a4d6e6b362414b99da49f5e87f28c61ac07128ea49568bef30df42d`;
- transformation definition: `sha256:df371239cbf6dcda7f597fae7a441ebaa724c74d57d945f9fc898323499d3255`;
- parameters: `sha256:12744c7454e505aabe7231c1751de9f058acef952c71415e0a5345af54a80768`.

Reproducibility tests execute the experiment twice into separate clean directories and compare every file byte-for-byte. A stale controlled hash or unavailable pinned version fails without output or upgrade.

## Fixture inventory

The committed lawful fixtures are `corpus/fixtures/melody-spatial-a`, `melody-learning-b`, `harmony-grid-c`, and `contract-voicing-hints`. Each has an explicit `sourceRegister` entry with repository permission. Exact hashes and category coverage are in `Sprint1CoverageReport.md` and machine output from `music corpus test`.

## Source, recipe, and learning identity evidence

Both treatments' manifests identify the same M-A canonical hash, normalized hash, projection hash (`sha256:5f4cadbff6c91d75a00571df2323e8d61084469ba9c1bc1f1cd4a248c73b2410`), verified plan hash (`sha256:05217b4e61cabda775f5bed579c6860aedba21c7bcbcfb7b2fb10c29f4892734`), absolute-chromatic pitch strategy/version/options, exact-label policy, renderer, and environment policy. They differ only in the declared time mapping, duration encoding, and temporal-reference overlay.

The single committed `idea-boundary@1` definition and parameter artifact generates M-A plan `sha256:05217b4e61cabda775f5bed579c6860aedba21c7bcbcfb7b2fb10c29f4892734` and M-B plan `sha256:76a4bdb17aca39e1fc3af942b5520b0480e7b2166f785b0d8645598b57ebd110`. Chunks contain canonical refs/time spans and provenance, not event payloads. Regeneration is byte-identical, and stale arrangement hashes fail verification.

## Negative diagnostics

Stable negative coverage includes schema errors; unknown/alias chord-quality identity; contradictory inversion, slash-bass, voicing, and hint evidence; unanchored or whitespace-positioned lyrics; missing/unavailable strategy versions; coarse grid subdivisions; missing/stale learning plans; forged capability claims; unsupported renderer overlays; recipe event/code payloads; experiment input-hash mismatches; unsafe output paths; and source-policy failures. Incompatible or unavailable input produces structured diagnostics and no fallback artifact.

## Accessibility and safety

The renderer consumes only `LayoutPlan`, escapes user text, emits no scripts or external resources, uses deterministic injective DOM IDs, and provides semantic headings, treatment status/limitations, SVG title/description, and a source-order accessible event table. Exact pitch, onset, duration, specificity, provenance, and text alternatives remain available independently of color or spatial perception. Hostile lyric strings remain inert data; functional lyric rendering is deferred.

## A-011 / E-009 workbench usability evidence

This is an implementation-agent workflow exercise, not Product Owner sign-off and not a learner study.

| Measure | Observation |
|---|---|
| Recipe create/modify time | Copying a committed recipe, changing ID/version plus one option, and validating it took under two minutes in an implementation-agent smoke exercise. This was not a timed Product Owner task. |
| Strategy discovery comprehension | `music strategy list` exposes stable IDs, versions, kinds, requirements, status, and schema refs. `music strategy describe mnls.time.proportional@1` now exposes the option schema, constraints, and defaults (`unitsPerBeat: 96`, `originX: 48`). IDs are technical but unambiguous. |
| Option-schema sufficiency | The described field types, minima, and materialized defaults were sufficient to make the tested recipe-only variant. A discoverable human-oriented explanation for each option would improve later authoring ergonomics. |
| Diagnostic usefulness | Stable codes, stages, messages, sources, and relevant capabilities identify the failed pin, source, plan, grid, or renderer condition. Negative CLI tests verify actionable pinned-version failures. |
| Implementation changes for recipe-only experiment | Zero TypeScript/domain-source changes once the cataloged strategy dimensions exist. The recipe JSON and experiment hash/reference are the only required authored changes. |
| Switching treatments | One `music compare ... --recipes <a> <b>` command; low friction. |
| Rerun/reproduction | One pinned experiment command. Measured machine runtime was 0.13 seconds; the run hash was stable. |
| Discovery/validation timing | Strategy list 0.11 s; strategy describe 0.10 s; recipe validation 0.11 s on the implementation machine. These are machine timings, not human-task timings. |
| Saving variants | Manual JSON copy plus unique ID/version/options and experiment reference/hash update; moderate friction and the clearest remaining headless-workflow weakness. |
| Live preview necessity | Not necessary for the Sprint 1 proof. A schema-driven preview/editor could reduce variant friction in Sprint 2, but A-011 remains OPEN until Product Owner evaluation. Musical semantics must remain outside that UI. |

## Technical decisions

`ImplementationDecisionLog.md` records IDL-001–IDL-014. WP-14 adds no architectural boundary: the approved lyric model is implemented as track events anchored by exact time spans or canonical event refs, with whitespace positioning rejected; and strategy description returns the already-authoritative option schema used by resolution. Neither choice adds a notation default or musical vocabulary.

## Deviations and unresolved defects

`Sprint1DeviationLog.md` contains one repository-input variance: the requested root `AGENTS.md` was absent. There are no product or Architecture baseline 0.2 deviations and no known unresolved mandatory Sprint 1 defects. A-011 remains a Product Owner assumption requiring their workflow evaluation; it is not closed by this implementation report.

## Deferred Sprint 2 or later candidates

Polished local browser control/live preview, graphical recipe editing, additional pitch/duration mappings, full harmony/role/hand/learning-chunk rendering, broad lyric rendering, generated familiar-shape hints, broader lawful corpus styles, authoring/migration tools, and any learner-facing syntax/default remain deferred. E-008 remains the future controlled visual pitch-mapping comparison.

## Lead Architect reproduction steps

1. Check out branch `implementation/sprint-1` at the handoff hash and verify the review range begins at `7310bdd`.
2. Activate Node.js `24.14.0` and npm `11.16.0`.
3. Run `npm ci` and then `npm run check` twice; confirm `git status --short` is empty.
4. Run `npm run build` and the documented `music experiment run` command into a new `output/spatial-melody-comparison` directory.
5. Compare the emitted experiment, treatment, recipe, source, normalized, projection, plan, transformation, renderer, and environment hashes with this report and the manifests.
6. Run the experiment into a second clean directory and compare all file bytes.
7. Inspect both treatment manifests to confirm shared canonical/normalized/projection/plan/pitch identities and only declared E-007 strategy changes.
8. Inspect the two expected learning plans and regenerate/verify them with the CLI.
9. Run `music corpus test` and `music vocabulary report`; confirm lawful sources, C-G01–C-G11 dispositions, and vocabulary separation.
10. Review `Sprint1CoverageReport.md`, `TraceabilityMatrix.md`, `Sprint1DeviationLog.md`, and the automated traceability test before issuing an independent conformance decision.
