# Repository Structure

Status: Architecture Sprint 0 complete — proposed for review

## 1. Workspace layout

```text
/
  README.md
  package.json
  package-lock.json
  tsconfig.base.json
  vitest.workspace.ts
  eslint.config.js
  .editorconfig
  .nvmrc
  Agents/
    00_Project_Constitution/
    01_Product/
    02_Architecture/
    03_Corpus/
    04_Experiments/
    05_Implementation/
    06_Reference/
  packages/
    schema/
      package.json
      src/
      schemas/
        0.1/
      examples/
      test/
    model/
      package.json
      src/
      test/
    pitch/
      package.json
      src/
        strategies/
      test/
    validator/
      package.json
      src/
      test/
    patterns/
      package.json
      src/
      libraries/
      test/
    normalizer/
      package.json
      src/
      test/
    transposition/
      package.json
      src/
      test/
    projection/
      package.json
      src/
      test/
    layout/
      package.json
      src/
      test/
    renderer-html/
      package.json
      src/
      test/
    corpus-tools/
      package.json
      src/
      test/
    cli/
      package.json
      src/
      test/
    test-fixtures/
      package.json
      src/
      fixtures/
  corpus/
    fixtures/
      synthetic/
      public-domain/
      analytical/
    expected/
      normalized/
      rendered/
      reports/
    sources/
    SOURCE_REGISTER.md
  reports/
    architecture/
    sprint-1/
    corpus/
  scripts/
```

The existing `Agents/` hierarchy remains the product and governance source of truth. Engineering implementation is added at repository root rather than nested under `Agents/`.

## 2. Package dependency direction

```text
schema
  ^
model <- pitch
  ^       ^
validator |
  ^       |
patterns  |
  ^       |
normalizer <- transposition
  ^
projection
  ^
layout
  ^
renderer-html

corpus-tools -> schema, model, validator, normalizer, projection, renderer-html
cli          -> all public application packages
test-fixtures-> schema/model contracts only
```

A package may depend on packages to its left or above, never on a package below it. In particular:

- `model` cannot import `normalizer`, `projection`, `layout`, or renderer packages.
- `normalizer` cannot import renderer packages.
- `renderer-html` cannot import schema internals or perform semantic validation.
- `cli` contains no music rules; it orchestrates public APIs.

Circular workspace dependencies are prohibited.

## 3. Package responsibilities and public APIs

### `@mnls/schema`

Owns versioned JSON Schemas, schema registry, examples, structural validation adapter, and schema-path-to-diagnostic mapping.

Public API:

```text
getSchema(version)
validateStructure(json, options) -> Result<StructurallyValidDocument>
listSupportedSchemaVersions()
```

No semantic defaults or TypeScript-only constraints may exist here without an equivalent schema rule.

### `@mnls/model`

Owns canonical domain types, stable ID types, rational arithmetic, specificity unions, immutable constructors, typed reference index, and semantic value objects independent of pitch-strategy implementation.

Public API:

```text
loadCanonical(structurallyValid, registries) -> Result<CanonicalDocument>
buildReferenceIndex(document) -> Result<ReferenceIndex>
canonicalSerialize(document) -> string
```

### `@mnls/pitch`

Owns `PitchStrategy`, strategy registry, `spelled-pitch@1`, semantic intervals, and capability negotiation.

Public API:

```text
registerPitchStrategy(strategy)
validatePitch(envelope)
transposePitch(envelope, operation)
comparePitchClassSets(values)
formatPitch(envelope, context)
```

No external music library type appears in public canonical contracts.

### `@mnls/validator`

Owns semantic validation passes and diagnostic aggregation.

Public API:

```text
validateSemantics(document, registries, options) -> ValidationReport
assertNormalizable(report) -> Result<ValidatedDocument>
```

Validation passes are pure, ordered, individually testable, and identified by diagnostic code families.

### `@mnls/patterns`

Owns pattern definition/instance contracts, registries, parameter validation, expansion, composition-cycle detection, override application, and vocabulary accounting.

Public API:

```text
resolvePatternDefinition(ref, registries)
validatePatternInstance(instance, context)
expandPattern(instance, context) -> Result<ExpandedPattern>
reportPatternVocabulary(documents)
```

### `@mnls/normalizer`

Owns deterministic reference resolution, repetition placement, variation operations, alternate endings, pattern materialization, role/hand resolution, timeline sorting, and provenance chains.

Public API:

```text
normalizeArrangement(document, arrangementId, options, registries)
  -> Result<NormalizedArrangement>
```

The package never writes canonical files.

### `@mnls/transposition`

Owns graph traversal for semantic transposition and invariance checks. Pitch math is delegated to `@mnls/pitch`.

Public API:

```text
transposeCanonical(document, operation, registries)
transposeNormalized(arrangement, operation, registries)
```

String replacement of rendered note/chord labels is prohibited.

### `@mnls/projection`

Owns view specifications and semantic filtering while retaining temporal/structural context.

Public API:

```text
projectView(normalized, viewSpec) -> Result<ProjectedView>
```

### `@mnls/layout`

Owns renderer-neutral layout planning: lanes, beat cells, structural groups, content priority, break opportunities, and responsive constraints.

Public API:

```text
prepareLayout(projected, layoutOptions) -> Result<LayoutPlan>
```

It may assign derived coordinates in `LayoutPlan`; these never return to canonical data.

### `@mnls/renderer-html`

Owns safe semantic HTML/SVG output, accessible labels, CSS tokens, and deterministic serialization.

Public API:

```text
renderHtml(layoutPlan, renderOptions) -> Result<RenderedBundle>
```

### `@mnls/corpus-tools`

Owns corpus manifest validation, source-policy checks, expected assertion execution, coverage reports, and vocabulary reports.

### `@mnls/cli`

Owns the executable `music`, argument parsing, file access, formatting, and exit codes.

### `@mnls/test-fixtures`

Owns small lawful fixture data and builders used across packages. It does not contain production behavior.

## 4. TypeScript and package configuration

- Node.js 24 LTS is pinned in `.nvmrc` and `package.json#engines`.
- npm workspaces list `packages/*`.
- All packages are private during Prototype 1 unless explicitly approved for publication.
- ESM modules are used consistently.
- `tsconfig.base.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, and declaration output.
- Each package builds to `dist/` and exposes only declared entry points.
- Internal source imports across packages are prohibited; use package exports.
- JSON Schemas and corpus fixtures are copied or referenced through explicit package exports.

## 5. Dependency policy

Required categories:

| Category | Selection requirement |
|---|---|
| JSON Schema validator | full JSON Schema 2020-12 support, deterministic diagnostics, maintained ESM support |
| TypeScript | 5.x, one version at root |
| Test runner | Vitest workspace |
| Lint/format | root-configured and workspace-wide |
| HTML/SVG serialization | safe text escaping and deterministic output |
| Music theory utility | optional; wrapped inside pitch strategy only |

A new library requires an ADR amendment when it affects canonical data, diagnostics, determinism, public APIs, or renderer security.

## 6. Repository commands

Root `package.json` must expose:

```text
npm run build           # build packages in dependency order
npm run clean           # remove derived build and test output only
npm run format          # apply formatting
npm run format:check    # verify formatting
npm run lint            # lint all workspaces
npm run typecheck       # no-emit strict typecheck
npm test                # unit and integration tests
npm run test:watch      # local test watch mode
npm run test:corpus     # lawful corpus regression suite
npm run test:a11y       # static accessibility assertions
npm run schema:check    # compile schemas and validate examples
npm run check           # format:check, lint, typecheck, schema:check, test, test:corpus
```

CLI commands:

```text
music validate <file> [--format text|json] [--strict]
music normalize <file> --arrangement <id> --out <file>
music transpose <file> --interval <semantic-interval> --out <file>
music render <file> --arrangement <id> --view <view-spec> --out <directory>
music corpus test [--filter <corpus-id>]
music vocabulary report [<file-or-corpus>] [--format text|json]
```

## 7. Exit codes

| Code | Meaning |
|---|---|
| 0 | success; warnings may exist |
| 1 | validation or semantic errors in user data |
| 2 | invalid command usage |
| 3 | unsupported schema/strategy/version |
| 4 | file or environment failure |
| 5 | internal invariant failure |

Machine-readable output is written to stdout; human diagnostics and progress go to stderr. Commands never mix rendered files with diagnostic JSON.

## 8. Fixture and expected-output policy

- `packages/test-fixtures` contains minimal requirement-isolation cases.
- `corpus/fixtures` contains permanent representative lawful material.
- Every corpus fixture has a `SOURCE_REGISTER.md` entry before merge.
- Expected normalized JSON is used only for deterministic regression and is never treated as canonical.
- Render snapshots supplement DOM/semantic assertions and must exclude unstable timestamps or paths.
- Generated output directories are disposable and normally ignored, except approved expected artifacts.

## 9. Documentation ownership

- Product meaning remains in `Agents/00_Project_Constitution` and `Agents/01_Product`.
- Architecture meaning remains in `Agents/02_Architecture` and ADRs.
- Corpus approval remains in `Agents/03_Corpus`.
- Experiments remain in `Agents/04_Experiments`.
- Sprint work and acceptance remain in `Agents/05_Implementation`.
- Code comments link to requirement and ADR IDs but do not restate or redefine product rules.

## 10. Rejected structures

- Single package: rejected because experimental boundaries and dependency rules would be unenforceable.
- Package per canonical type: rejected as excessive fragmentation.
- Renderer inside model: rejected because presentation would control semantics.
- Schema generated from handwritten TypeScript as sole authority: rejected because JSON Schema 2020-12 is approved as structural source of truth.
- Corpus mixed into unit-test directories: rejected because source policy and permanent regression status require separate governance.
- Implementation under `Agents/`: rejected because governance documents and executable source have different lifecycles.

## 11. Requirement links

R-004, R-048: schema/model ownership.  
R-005–R-025: model, pitch, validator, patterns, normalizer.  
R-026–R-041: projection, layout, renderer-html.  
R-043–R-046: corpus-tools and corpus layout.  
R-047, R-050: package boundaries preserve experiments and future adapters.
