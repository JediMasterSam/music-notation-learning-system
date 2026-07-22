# Repository Structure

Status: Architecture Sprint 0.1 Product Owner amendments complete — proposed for approval
Architecture baseline: 0.2

## 1. Workspace layout

```text
/
  README.md
  package.json
  package-lock.json
  tsconfig.base.json
  eslint.config.js
  .nvmrc
  .github/
    workflows/check.yml

  Agents/
    README.md
    ARCHITECT_PROMPT.md
    00_Project_Constitution/
      ProjectConstitution.md
      GuidingPrinciples.md
      DecisionMaking.md
    01_Product/
      Vision.md
      Requirements.md
      DecisionLog.md
      AssumptionLog.md
      Glossary.md
      Backlog.md
      TraceabilityMatrix.md
      ArchitectureSprint0.1Handoff.md
    02_Architecture/
      Architecture.md
      CanonicalModel.md
      ExperimentWorkbench.md
      LearningTransformations.md
      PatternEngine.md
      RenderingPipeline.md
      RenderingEngine.md
      RepositoryStructure.md
      TestingStrategy.md
      TechnicalDecisions.md
      ArchitectureReview.md
      ArchitectureSprint0.1ProductOwnerReview.md
    03_Corpus/
      Corpus.md
    04_Experiments/
      ExperimentRegister.md
    05_Implementation/
      Sprint0.md
      Sprint1.md
      AcceptanceTests.md

  packages/
    schema/
      src/
        canonical/
        recipes/
        learning/
        experiments/
        manifests/
      examples/
      tests/

    model/
      src/
        canonical/
        time/
        specificity/
        provenance/
      tests/

    harmony/
      src/
        contracts/
        vocabularies/core-v1/
        formatting/
      tests/conformance/

    capabilities/
      src/
        contracts/
        evidence/
        diagnostics/
      tests/

    capability-analysis/
      src/
        arrangement/
        renderer/
        environment/
      tests/

    pitch/
      src/
        contracts/
        strategies/spelled-pitch-v1/
      tests/conformance/

    validator/
      src/
        canonical/
        harmony/
        hints/
        references/
        time/
      tests/

    patterns/
      src/
      tests/

    normalizer/
      src/
      tests/

    transposition/
      src/
      tests/

    learning/
      src/
        contracts/
        registry/
        compatibility/
        executor/
        overrides/
        strategies/idea-boundary-v1/
      tests/

    workbench/
      src/
        recipes/
        strategies/
        compatibility/
        experiments/
        manifests/
        comparison/
      tests/

    projection/
      src/
      tests/

    layout/
      src/
        contracts/
        scene/
        strategies/
          time-fixed-beat-grid-v1/
          time-proportional-v1/
          duration-grid-span-v1/
          duration-proportional-extent-v1/
          pitch-absolute-chromatic-y-v1/
          labels-exact-pitch-v1/
          overlay-beat-subdivision-v1/
          overlay-time-reference-v1/
      tests/

    renderer-html/
      src/
      tests/

    corpus-tools/
      src/
      tests/

    cli/
      src/
        commands/
        composition-root/
      tests/

    test-fixtures/
      src/
      fixtures/

    workbench-web/                 # reserved; no Sprint 1 production implementation
      README.md

  corpus/
    fixtures/
      melody-spatial-a/
      melody-learning-b/
      harmony-grid-c/
      contract-voicing-hints/
    sources/
    expected/
    SOURCE_REGISTER.md

  experiments/
    recipes/
      explicit-grid.recipe.json
      proportional-spatial-melody.recipe.json
    definitions/
      spatial-melody-comparison.experiment.json
    expected/
    observations/
      README.md

  learning/
    transformations/
      idea-boundary.learning-transform.json
    plans/                         # generated; selected expected plans may be committed
    expected/

  output/                          # generated; gitignored except README if needed

  scripts/
    verify-generated.ts
    verify-traceability.ts
```

## 2. Package dependency direction

Arrows point from a consumer to a package it may import. The neutral `capabilities` package owns contracts only; analyzers and orchestrators remain separate.

```text
schema

model <--- pitch
  ^         ^
  |         |
harmony ----+
  ^
  |
validator
  ^
  |
patterns
  ^
  |
normalizer <--- transposition
  ^
  |
  +---------------- learning ----------------> capabilities
  |                     |                         ^
  |                     +-- produces verified ---+
  |                         plan profiles
  |
  +---- capability-analysis --------------------> capabilities
  |        |
  |        +-- analyzes arrangement, renderer, environment artifacts
  |
projection <--- verified learning plan + resolved recipe
  ^
  |
layout <--- workbench --------------------------> capabilities
  ^          |
  |          +-- composes artifact profiles and strategy descriptors
  |
renderer-html
  ^
  |
cli (composition root; imports public APIs and registers implementations)

corpus-tools -> schema/model/validator/normalizer/learning/workbench/renderer-html
test-fixtures -> schema/model/harmony contracts only
workbench-web (deferred) -> public workbench/learning/CLI-service adapters only
```

Normative rules:

1. `model` never imports workbench, learning, projection, layout, renderer, CLI, or corpus tools.
2. `normalizer` never imports learning or workbench; learning chunks are not normalization output.
3. `capabilities` imports only shared diagnostic/reference primitives and owns non-musical artifact-scoped contracts.
4. `harmony` imports model/pitch primitives and owns controlled quality vocabularies and derived labels.
5. `capability-analysis` imports model/normalizer/capabilities plus renderer/environment public descriptors; it cannot inspect recipes or learning plans.
6. `learning` imports normalized/model/capabilities contracts, but never `workbench` or renderer implementations.
7. `workbench` owns registry/recipe/experiment orchestration and composite compatibility evaluation; it receives artifact profiles through public APIs and does not import CLI.
8. `layout` owns strategy implementations and scene contracts; it does not resolve recipes or inspect canonical JSON.
9. `renderer-html` consumes `LayoutPlan` only.
10. `cli` is the composition root that registers built-in pitch, harmony, learning, layout, and renderer strategies.
11. `workbench-web` cannot define schemas or musical semantics; when implemented, it calls public workbench APIs.

A dependency-cycle check runs in `npm run check`.

## 3. Package responsibilities and public APIs

### `@mnls/schema`

Owns JSON Schema 2020-12 for:

- canonical schema `0.1.0`;
- chord-quality vocabulary schema `0.1.0`;
- recipe format `0.1.0`;
- learning transformation definition `0.1.0`;
- learning plan `0.1.0`;
- experiment definition `0.1.0`;
- resolved recipe and run manifests `0.1.0`.

Exports schema IDs, validators, structural diagnostic mapping, valid/invalid examples, and migration entrypoints. It does not apply semantic/compatibility defaults.

### `@mnls/model`

Owns canonical TypeScript types, rational arithmetic, stable IDs, specificity wrappers, typed references, canonical provenance declarations, immutable helpers, and canonical serializer contracts. `Arrangement` has no learning-plan/recipe fields.

### `@mnls/harmony`

Owns immutable registered `ChordQualityVocabulary` versions, `ChordQualityRef` resolution, aliases/display labels, fixture-required pitch-class semantics, and vocabulary conformance. Unknown quality IDs fail. Aliases never become canonical identity. It contains no rendering layout and does not treat free-form analysis annotations as semantics.

### `@mnls/capabilities`

Owns dependency-neutral contracts for `CapabilityEvidence`, `CapabilityRequirement`, `ArrangementCapabilityProfile`, `LearningPlanCapabilityProfile`, `RendererCapabilityProfile`, `EnvironmentCapabilityProfile`, `TreatmentInputProfile`, and `CompatibilityInput`. It contains no analyzers and cannot depend on `learning` or `workbench`.

### `@mnls/capability-analysis`

Owns analyzers that derive `ArrangementCapabilityProfile` from validated canonical/normalized music and renderer/environment profiles from installed implementations. It imports neutral contracts but not recipes. It cannot inspect learning plans; plan profiles are produced by `@mnls/learning` after verification.

```text
analyzeArrangementCapabilities(arrangement, normalized): ArrangementCapabilityProfile
analyzeRendererCapabilities(renderer): RendererCapabilityProfile
analyzeEnvironmentCapabilities(environment): EnvironmentCapabilityProfile
```

### `@mnls/pitch`

Owns canonical pitch strategy contracts, semantic comparison/transposition/formatting, and Sprint 1 `spelled-pitch@1`. Visual y mapping belongs to layout, not pitch canonical strategy.

### `@mnls/validator`

Owns semantic validation of canonical data: references, timing, roles/hands, harmony/inversion/slash bass/voicing, patterns/repetition/variation graph constraints, hints, and contradictions.

### `@mnls/patterns`

Owns pattern registry, parameter schemas, deterministic semantic expansion, override precedence, vocabulary reports, and pattern provenance.

### `@mnls/normalizer`

Owns reference resolution and deterministic semantic timeline materialization. Public API:

```text
normalize(document, arrangementId, options): StageResult<NormalizedArrangement>
```

No learning plans, recipes, or coordinates.

### `@mnls/transposition`

Owns semantic graph transposition using `PitchStrategy`. Public APIs accept canonical or normalized inputs and return new values plus provenance/diagnostics.

### `@mnls/learning`

Owns:

- transformation definition/descriptor interfaces;
- transformation registry;
- deterministic execution;
- learning-plan validation and hashing;
- plan-local overrides;
- `idea-boundary@1` Sprint 1 strategy.

Public API:

```text
listLearningStrategies(): LearningTransformationDescriptor[]
resolveLearningTransformation(ref): StageResult<RegisteredLearningTransformation>
generateLearningPlan(arrangement, arrangementProfile, definition, parameters): StageResult<LearningPlan>
verifyLearningPlan(plan, arrangement, definition): StageResult<VerifiedLearningPlan>
analyzeLearningPlanCapabilities(verifiedPlan, arrangement): LearningPlanCapabilityProfile
```

### `@mnls/workbench`

Owns:

- `RepresentationRecipe`, `StrategyDescriptor`, `StrategyCatalog` contracts;
- composite compatibility evaluation;
- recipe structural/option resolution;
- compatibility classification;
- experiment definition/run orchestration;
- resolved recipe and run manifest hashing;
- deterministic comparison-page model (not serialization).

Public API:

```text
listStrategies(kind?): StrategyDescriptor[]
resolveRecipe(recipe, catalog): StageResult<ResolvedRecipe>
validateCompatibility(input: CompatibilityInput, resolvedRecipe): CompatibilityReport
runTreatment(input): StageResult<TreatmentRun>
runExperiment(definition, resolver): StageResult<ExperimentRun>
```

### `@mnls/projection`

Owns semantic selection/filtering from normalized arrangement plus optional learning plan and resolved recipe into `ProjectedView`. It preserves context and provenance, and does not compute coordinates.

### `@mnls/layout`

Owns strategy contracts, built-in Sprint 1 time/pitch/duration/label/overlay strategies, scene graph, deterministic coordinate scalar/rounding, and `LayoutPlan`.

Public API:

```text
layout(projectedView, resolvedRecipe, strategyCatalog, environment): StageResult<LayoutPlan>
```

### `@mnls/renderer-html`

Owns safe HTML/SVG serialization and accessibility plan realization. Public API:

```text
renderHtml(layoutPlan, manifestSummary, options): StageResult<RenderedBundle>
```

It does not import canonical validators or strategy registries.

### `@mnls/corpus-tools`

Owns source-policy validation, category coverage, corpus regression, expected semantic assertions, vocabulary reports, and workbench treatment coverage reports.

### `@mnls/cli`

Owns commands, composition root, stable exit codes, text/JSON diagnostic formatting, file I/O, and output directory management. It registers built-in strategy implementations and delegates all domain work.

### `@mnls/test-fixtures`

Owns small lawful test fixtures/builders. It cannot hide invalid canonical data through builder defaults; generated JSON must pass the same validators as authored files.

### `@mnls/workbench-web` (deferred)

Reserved adapter boundary. Sprint 1 contains only a README/API dependency contract so no UI placeholder is mistaken for a functional requirement. Later implementation may provide generated forms and live preview using schemas and public workbench APIs.

## 4. Artifact directories

### `experiments/recipes`

Authored declarative recipes. No TypeScript or musical events. Sprint 1 commits the two required treatment recipes.

### `experiments/definitions`

Reproducible experiment definitions. Sprint 1 commits one spatial-melody comparison definition.

### `learning/transformations`

Reusable transformation definitions. Sprint 1 commits `idea-boundary@1` configuration.

### Generated plans and expected artifacts

`learning/plans` and `output` are generated and normally gitignored. Small expected plans/manifests may be committed under `learning/expected`, `experiments/expected`, or `corpus/expected` when they serve regression tests and contain no copyrighted music beyond lawful fixtures.

## 5. TypeScript and package configuration

- ESM packages with explicit exports;
- strict TypeScript, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`;
- project references or equivalent build ordering;
- shared test/tsconfig bases;
- package-specific public API tests;
- no deep imports across packages;
- dependency graph verification;
- deterministic JSON serializer shared through model/util contract;
- exact Node/npm versions selected and pinned at Sprint 1 start.

## 6. Dependency policy

1. Prefer small maintained libraries with compatible licenses.
2. Lock all versions through `package-lock.json`.
3. No music library type leaks into canonical public APIs.
4. No runtime dynamic plugin/module loading in Sprint 1.
5. No renderer/layout library may infer music.
6. No schema library default may create musical meaning.
7. A new consequential runtime dependency requires ADR review.
8. A new strategy implementation requires descriptor, option schema, conformance tests, and registry entry.

## 7. Repository commands

```text
npm ci
npm run build
npm run typecheck
npm run lint
npm test
npm run test:unit
npm run test:integration
npm run test:corpus
npm run test:reproducibility
npm run check

music validate <file> [--format text|json]
music normalize <file> --out <file>
music transpose <file> --interval <semantic-interval> --out <file>
music harmony vocabulary list
music harmony quality describe <quality-ref>
music strategy list [--kind <kind>] [--format text|json]
music strategy describe <id>@<version>
music recipe validate <recipe> --arrangement <file>
music recipe resolve <recipe> --arrangement <file> --out <file>
music learning strategy list
music learning validate <definition>
music learning plan <arrangement> --transformation <definition> --out <plan>
music learning verify <plan> --arrangement <arrangement>
music render <arrangement> --recipe <recipe> [--learning-plan <plan>] --out <dir>
music compare <arrangement> --recipes <a> <b> --out <dir>
music experiment run <definition> --out <dir>
music corpus test
music vocabulary report [<file-or-corpus>]
```

## 8. Exit codes

| Code | Meaning |
|---|---|
| 0 | success, including acknowledged limitations |
| 1 | invalid command or environment |
| 2 | load/parse/schema error |
| 3 | canonical semantic/reference error |
| 4 | normalization/transposition error |
| 5 | recipe/strategy/capability incompatibility or unavailable version |
| 6 | learning transformation/plan error |
| 7 | layout/render/accessibility error |
| 8 | corpus/experiment regression failure |
| 9 | reproducibility/hash mismatch |

JSON diagnostic output remains stable and is not inferred from prose.

## 9. Fixture policy for revised Sprint 1

Functional fixtures:

1. `melody-spatial-a` — canonical melody used by both explicit-grid and proportional-spatial recipes.
2. `melody-learning-b` — second small melody/arrangement with musical ideas for reusable learning transformation proof.
3. `harmony-grid-c` — beat-aligned harmony/repetition fixture, retained for normalization/contract coverage and second learning-plan application when compatible.

Contract fixture:

4. `contract-voicing-hints` — minimal lawful data preserving inversion/slash bass/voicing/specificity/familiar-shape assertions. Full functional rendering is deferred unless implementation capacity remains after all workbench exit criteria pass.

Each fixture has source status, behaviors tested, limitations, and expected assertions.

## 10. Documentation ownership

- Product Owner owns Constitution, requirements, decisions, assumptions, handoff, experiments, and corpus approval.
- Architect owns `02_Architecture`, architecture ADRs, traceability architecture columns, and Sprint plan technical sequencing.
- Implementation Agent updates implementation reports and proposes, but does not silently change, architecture/product meaning.

## 11. Rejected structures

- learning transformation code inside fixtures;
- recipes embedded in renderer source;
- one package containing model through UI;
- `Arrangement.learningChunks` or `Arrangement.recipe`;
- browser app defining configuration JSON ad hoc;
- runtime plugin folder that executes arbitrary JavaScript;
- output snapshots committed without manifest/version provenance;
- duplicate package contracts for capability or strategy identity.

## 12. Requirement links

- R-004–R-025: schema/model/pitch/validator/patterns/normalizer/transposition.
- R-010, R-030, R-042: learning package and derived plan artifacts.
- R-026–R-034: workbench/projection/layout/renderer-html.
- R-035–R-041: model/validator/projection/render contract fixture.
- R-043–R-046: corpus-tools/test-fixtures and human observation separation.
- R-047–R-050: schema/workbench/CLI/package boundaries.
