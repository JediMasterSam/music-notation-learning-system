# Experiment Workbench

Status: Architecture Sprint 0.1 Product Owner amendments complete — proposed for approval
Architecture baseline: 0.2  
Applies to: Prototype 1

## 1. Purpose

The experiment workbench is the non-musical orchestration layer that lets the Product Owner construct, validate, save, load, render, and compare multiple representational treatments from the same canonical arrangement without changing TypeScript source code.

It owns configuration and reproducibility. It does not own musical semantics, learner-facing defaults, canonical events, or claims about learning effectiveness.

Source obligations: Architecture Sprint 0.1 handoff §§2–10 and Product Owner review §§4–9. Related requirements: R-004, R-011–R-014, R-026–R-034, R-039, R-042–R-058. Related decisions: D-025, D-027–D-029.

## 2. Boundary

```text
canonical arrangement
  -> validated normalized arrangement
  -> arrangement capability analysis
  + representation recipe
  + installed strategy catalog
  -> recipe resolution and compatibility report
  -> projected semantic scene
  -> strategy-driven layout
  -> accessible HTML/SVG bundle
  -> reproducibility manifest
```

The workbench may select, combine, hide, emphasize, or spatially arrange canonical information. It may not:

- mutate canonical JSON;
- invent pitch, harmony, timing, form, role, hand assignment, voicing, or specificity;
- reinterpret a canonical chord through a pedagogical hint;
- silently replace an unsupported request with a convenient default;
- execute arbitrary code embedded in a recipe;
- treat one recipe as the final notation system.

## 3. Artifact model

### 3.1 `RepresentationRecipe`

```text
RepresentationRecipe {
  formatVersion: string;
  id: string;
  version: string;
  name: string;
  description?: string;
  strategies: {
    timeMapping: StrategySelection;
    pitchMapping: StrategySelection;
    durationEncoding: StrategySelection;
    pitchLabels?: StrategySelection;
    structuralOverlays?: StrategySelection[];
    harmonicOverlays?: StrategySelection[];
    disclosure?: StrategySelection;
  };
  visibility: {
    roleIds?: string[];
    roleKinds?: MusicalRoleKind[];
    hands?: HandName[];
    includeLearningPlan?: boolean;
    includeHints?: boolean;
  };
  accessibility: AccessibilityRecipeOptions;
  renderer: StrategySelection;
  metadata?: RecipeMetadata;
}

StrategySelection {
  strategyId: string;
  strategyVersion: string;
  options: JSONValue;
}
```

A recipe contains no musical events, note labels copied from a fixture, canonical IDs other than optional visibility selectors, executable callbacks, CSS fragments, SVG markup, or final pixel coordinates.

**Identity:** `id + version` identifies the authored recipe. The resolved recipe manifest additionally pins every strategy implementation and validated option value.

**Versioning:** semantic versioning. A change that may alter output increments the recipe version. Recipe migration is explicit and separate from canonical migration.

**Determinism:** identical canonical input, recipe, installed strategy versions, workbench version, and render environment produce byte-identical normalized JSON, scene JSON, manifest JSON, and HTML/SVG after canonical serialization.

### 3.2 `StrategyDescriptor`

```text
StrategyDescriptor {
  id: string;
  version: string;
  kind: StrategyKind;
  displayName: string;
  status: "experimental" | "comparison" | "internal";
  optionSchemaRef: string;
  requiresCapabilities: CapabilityRequirement[];
  providesCapabilities: CapabilityDeclaration[];
  conflictsWith?: CompatibilityRule[];
  limitations?: LimitationDeclaration[];
  deterministic: true;
}

StrategyKind =
  | "time-mapping"
  | "pitch-mapping"
  | "duration-encoding"
  | "pitch-labels"
  | "structural-overlay"
  | "harmonic-overlay"
  | "disclosure"
  | "renderer"
```

A descriptor is discoverable data. The implementation remains compiled TypeScript registered at the composition root. Recipes select descriptors by ID and pinned version; they never name source files or import modules.

### 3.3 Artifact-scoped capability profiles

Capability contracts are owned by neutral `@mnls/capabilities`, not by the workbench or learning engine.

```text
CapabilityEvidence {
  capability: string;
  state: "present" | "partial" | "absent" | "unknown";
  source: {
    authority: "canonical-arrangement" | "verified-learning-plan" | "renderer" | "environment";
    artifactId: string;
    contentHash: string;
  };
  evidenceRefs?: string[];
  detail?: string;
}

ArrangementCapabilityProfile {
  arrangementId: StableId;
  canonicalHash: string;
  normalizedHash: string;
  capabilities: CapabilityEvidence[];
}

LearningPlanCapabilityProfile {
  planId: string;
  planHash: string;
  arrangementId: StableId;
  arrangementHash: string;
  capabilities: CapabilityEvidence[];
}

RendererCapabilityProfile {
  rendererRef: VersionedRef;
  implementationHash: string;
  capabilities: CapabilityEvidence[];
}

EnvironmentCapabilityProfile {
  environmentId: string;
  environmentHash: string;
  capabilities: CapabilityEvidence[];
}

TreatmentInputProfile {
  arrangement: ArrangementCapabilityProfile;
  learningPlan?: LearningPlanCapabilityProfile;
  renderer: RendererCapabilityProfile;
  environment?: EnvironmentCapabilityProfile;
}

CapabilityRequirement {
  source: "arrangement" | "learning-plan" | "renderer" | "environment" | "selected-strategy";
  capability: string;
  acceptedStates: ("present" | "partial")[];
}
```

Arrangement capabilities may include exact onset/duration, subdivision resolution, exact register-bearing pitch, pitch spelling, harmony, musical ideas, sections, roles, hand-assignment completeness, and pitch-class-set comparison support. They must not claim that a learning plan, renderer overlay, experiment definition, or environment feature exists.

A verified learning plan may provide `learning-plan.valid`, `learning-plan.matches-arrangement`, `learning-plan.has-chunks`, role/hand filters, prerequisites, and transition-practice evidence. Its arrangement ID/hash must match the treatment arrangement. A stale or unverified plan produces no plan profile.

Renderer/environment capabilities include SVG output, requested overlay support, accessible parallel event-list support, and comparison-wide environment availability. Deleting all plans does not change arrangement capability output. Recipes cannot supply or override any capability evidence.

### 3.4 Composite compatibility input

```text
CompatibilityInput {
  inputProfile: TreatmentInputProfile;
  selectedStrategyDescriptors: StrategyDescriptor[];
  limitationPolicy: LimitationPolicy;
}
```

A learning overlay request requires a verified matching `LearningPlanCapabilityProfile`. Without it the result is `incompatible`; it is not reported as a missing arrangement capability. Every diagnostic names the requirement source and authoritative evidence artifact.

### 3.5 `ResolvedRecipe`

```text
ResolvedRecipe {
  formatVersion: string;
  recipeRef: { id: string; version: string; contentHash: string };
  selections: ResolvedStrategySelection[];
  compatibility: CompatibilityReport;
  canonicalOptions: JSONValue;
  resolutionHash: string;
}
```

Option schemas apply defaults only when the recipe schema explicitly defines a non-musical presentation default. Defaults may not create musical meaning. Resolved options are written to the manifest so reproduction does not depend on future schema defaults.

### 3.6 `CompatibilityReport`

```text
CompatibilityReport {
  status: "supported" | "supported-with-limitations" | "incompatible" | "unavailable";
  diagnostics: Diagnostic[];
  limitations: CompatibilityLimitation[];
}
```

- `supported`: all required capabilities are proven.
- `supported-with-limitations`: output remains truthful, but explicitly requested optional information is unavailable or incomplete.
- `incompatible`: producing the treatment would misrepresent or invent meaning.
- `unavailable`: a pinned strategy/version is not installed.

Errors stop rendering. Limitations require visible manifest and comparison-page disclosure and may render only when the recipe explicitly permits that limitation class.

## 4. Strategy discovery and registration

The composition root creates a `StrategyCatalog` from built-in implementations:

```text
StrategyCatalog.register(descriptor, implementation)
StrategyCatalog.list(kind?) -> StrategyDescriptor[]
StrategyCatalog.resolve(id, version) -> StrategyImplementation | Diagnostic
```

Registration rules:

1. IDs are globally unique and reverse-domain or project namespaced.
2. Versions are immutable once released.
3. Descriptor and implementation versions must match.
4. Every implementation passes its kind-specific conformance suite.
5. Registration order cannot affect resolution or output ordering.
6. Third-party runtime loading is outside Prototype 1; adding a new primitive requires a code change and architecture/product review as appropriate.

The CLI exposes discovery without exposing implementation internals:

```text
music strategy list [--kind <kind>] [--format text|json]
music strategy describe <strategy-id>@<version>
```

## 5. Compatibility algorithm

Recipe validation proceeds in this order:

1. Validate recipe JSON against its schema.
2. Resolve every pinned strategy ID/version.
3. Validate each selection's options against the strategy option schema.
4. Compute the arrangement capability profile from validated canonical/normalized data.
5. Verify any supplied plan and compute a separate learning-plan profile; reject stale arrangement hashes.
6. Resolve renderer and environment profiles.
7. Build `CompatibilityInput` and aggregate source-qualified requirements/provided strategy capabilities.
8. Evaluate cross-artifact and cross-strategy rules in stable lexical rule order.
9. Classify unsupported requests as limitation, incompatibility, or unavailable.
10. Produce a canonicalized `ResolvedRecipe` and compatibility report.
9. Continue only when status is `supported`, or `supported-with-limitations` and every limitation is explicitly permitted by the recipe/run command.

No strategy may self-declare that missing canonical information exists. A hand view with unknown assignments is incompatible when the recipe requires exact hand isolation; it may be supported with limitation only for a view that explicitly displays unknown assignment state.

## 6. Built-in Sprint 1 treatments

The following are experiment implementations, not approved defaults.

### 6.1 `explicit-grid@1`

```text
timeMapping:      mnls.time.fixed-beat-grid@1
durationEncoding: mnls.duration.grid-span@1
pitchMapping:     mnls.pitch.absolute-chromatic-y@1
pitchLabels:      mnls.labels.exact-pitch@1
structuralOverlay: mnls.overlay.beat-subdivision@1
renderer:         mnls.renderer.html-svg@1
```

Required behavior:

- beats and configured subdivisions have explicit cells;
- onset is computed from rational canonical time;
- event span covers the exact number of cells represented by duration;
- exact pitch is readable and present in accessible text;
- whitespace is never a timing source.

### 6.2 `proportional-spatial-melody@1`

```text
timeMapping:      mnls.time.proportional@1
durationEncoding: mnls.duration.proportional-extent@1
pitchMapping:     mnls.pitch.absolute-chromatic-y@1
pitchLabels:      mnls.labels.exact-pitch@1
structuralOverlay: mnls.overlay.time-reference@1
renderer:         mnls.renderer.html-svg@1
```

Required behavior:

- `x = origin + rationalOnset * pixelsPerBeat` after deterministic scaling;
- `width = rationalDuration * pixelsPerBeat`, subject only to declared minimum accessible hit-area treatment that does not alter the duration edge;
- equal semantic pitches map to equal y coordinates;
- semitone distance maps monotonically and linearly to vertical displacement for this strategy;
- earlier/later events map left/right;
- exact pitch remains available through visible labels or accessible text;
- flags, stems, and conventional duration symbols are not required to determine basic duration.

The shared `mnls.pitch.absolute-chromatic-y@1` strategy is a controlled variable. E-007 therefore compares horizontal time mapping, duration encoding, and temporal reference treatment; it is not a complete test of spatial pitch notation. E-008 later holds time/duration constant while comparing diatonic, key-relative, contour-only, interval-relative, absolute-chromatic, or staff-like pitch mappings.

## 7. Experiment definitions and runs

```text
ExperimentDefinition {
  formatVersion: string;
  id: string;
  version: string;
  fixtureRefs: FixtureRef[];
  treatmentRefs: RecipeRef[];
  learningTransformationRefs?: LearningTransformationRef[];
  researchQuestion: string;
  controlledVariables: VariableDeclaration[];
  changedVariables: VariableDeclaration[];
  tasks: ExperimentTask[];
  observations: ObservationDefinition[];
  status: "draft" | "ready" | "completed" | "archived";
}

ExperimentRunManifest {
  formatVersion: string;
  experimentRef: VersionedContentRef;
  canonicalInputs: VersionedContentRef[];
  recipes: ResolvedRecipeRef[];
  learningPlans?: VersionedContentRef[];
  toolVersions: Record<string,string>;
  outputArtifacts: OutputArtifactRef[];
  diagnostics: Diagnostic[];
  runHash: string;
}
```

An experiment definition records intent and controlled comparison. An experiment run manifest records reproducible software execution. Human observations are separate records referencing the run hash; automated output must never be reported as evidence of learning effectiveness.

CLI:

```text
music recipe validate <recipe.json> --arrangement <fixture.json>
music recipe resolve <recipe.json> --arrangement <fixture.json> --out <resolved.json>
music experiment run <experiment.json> --out <directory>
music compare <arrangement.json> --recipes <a.json> <b.json> --out <directory>
```

`music experiment run` creates one directory containing treatment outputs, resolved recipes, diagnostics, per-output manifests, and a deterministic `index.html` comparison page.

## 8. Save/load and reproducibility

Repository locations:

```text
experiments/
  recipes/*.recipe.json
  definitions/*.experiment.json
  expected/*.manifest.json
  observations/              # human-study records; not Sprint 1 automation
```

Every reference is by ID/version plus content hash in a run manifest. Relative file paths are input conveniences, not authority. The manifest includes canonical input hash, canonical schema version, normalized format version, recipe hash, selected strategies, all resolved options, workbench version, renderer/layout versions, and output hashes.

A reproduction command fails if a pinned component is unavailable or a content hash differs. It never silently upgrades a strategy or recipe.

## 9. Interaction recommendation

### Decision

Sprint 1 uses a headless workbench core, declarative JSON recipe/experiment files, CLI discovery/validation/run commands, and a generated static comparison page. Live browser controls are deferred subject to A-011. The Sprint report must record recipe-edit time, discovery/diagnostic comprehension, rerun/reproduction friction, implementation changes required for recipe-only experiments, and whether live preview is necessary.

This is the smallest sound interaction model because the Product Owner can change selections and options without editing TypeScript, outputs are reviewable in a browser, and the implementation proves configuration/reproducibility before introducing UI state.

### Prototype 1 boundary

The architecture reserves an optional `workbench-web` adapter that consumes the same schemas and workbench-core APIs. It may later provide form-generated controls, live preview, and save/load. It cannot import canonical internals or define musical semantics. Static-only sufficiency is therefore narrowed to Sprint 1 output, not asserted for the full Prototype 1 workbench.

## 10. Diagnostics

New diagnostic families:

- `RECIPE_SCHEMA_*` — malformed recipe;
- `STRATEGY_NOT_FOUND` — pinned implementation unavailable;
- `STRATEGY_OPTION_INVALID` — option schema failure;
- `CAPABILITY_MISSING` — arrangement lacks required semantics;
- `STRATEGY_CONFLICT` — selected strategies contradict;
- `LIMITATION_UNACKNOWLEDGED` — truthful but incomplete treatment not explicitly permitted;
- `EXPERIMENT_REF_INVALID` — unresolved fixture/recipe/transformation;
- `REPRODUCIBILITY_HASH_MISMATCH` — referenced content differs;
- `WORKBENCH_NONDETERMINISTIC` — conformance output changed under identical inputs.

Every diagnostic includes recipe/strategy IDs, JSON pointer, canonical evidence references where relevant, and linked requirement/handoff obligations.

## 11. Security and accessibility

- Recipe and experiment JSON are data only; no expressions, templates, scripts, CSS, HTML, or URLs are executed.
- Options are schema validated and passed as immutable values.
- Output paths are confined to the requested directory.
- Comparison pages escape all user text and include treatment identity, versions, limitations, and semantic text equivalents.
- Color cannot be the sole carrier of pitch, timing, specificity, selection, or comparison differences.
- Spatial treatments expose source-order event lists or equivalent accessible descriptions synchronized to the visual scene.

## 12. Tests

Required automated coverage:

- recipe schema valid/invalid examples;
- strategy registry duplicate and missing-version tests;
- option validation and canonical default materialization;
- capability profile evidence tests;
- all four compatibility statuses;
- unsupported combinations produce diagnostics without fallback;
- same canonical fixture renders through both Sprint 1 recipes without mutation;
- repeated pitch has identical y in proportional spatial treatment;
- larger intervals have larger absolute y displacement;
- onset and duration scale linearly from exact rational time;
- exact pitch remains in DOM/accessibility tree;
- experiment rerun produces byte-identical manifests and outputs;
- changed recipe version or option changes run hash;
- comparison page labels every treatment as experimental/comparison, never final.

## 13. Rejected alternatives

- one renderer with hard-coded treatment branches selected by source edits;
- recipes containing canonical musical events;
- implicit strategy upgrades to latest version;
- arbitrary plugin loading in Prototype 1;
- silent fallback from incompatible to approximate output;
- a polished browser editor before the headless contracts are proven;
- treating rendered comparison output as proof of learning benefit.
