# Repository Structure

Status: TEMPLATE with approved minimum.

The architect may refine names while preserving responsibilities.

```text
/
  README.md
  package.json
  tsconfig.base.json
  docs/
    decisions/
    experiments/
    reports/
    TRACEABILITY.md
    ASSUMPTIONS.md
  packages/
    schema/
    model/
    normalizer/
    renderer-html/
    cli/
    test-fixtures/
  corpus/
    fixtures/
    sources/
    expected/
    SOURCE_REGISTER.md
  scripts/
```

## Required package responsibilities

### schema

Owns JSON Schema, schema versioning, examples, structural validation, and diagnostics.

### model

Owns TypeScript domain types and semantic helpers. Contains no layout rules.

### normalizer

Resolves references, repetitions, variations, and patterns into a deterministic timeline while preserving provenance.

### renderer-html

Produces accessible HTML/SVG from canonical or normalized data. It is not a semantic source of truth.

### cli

Required command intentions:

```text
music validate <file>
music normalize <file> --out <file>
music render <file> --view <view> --out <directory>
music corpus test
music vocabulary report
```

### test-fixtures

Owns small requirement-focused fixtures. Larger golden-corpus items belong under `corpus`.
