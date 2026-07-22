# Rendering Engine

Status: Architecture Sprint 0.1 complete — proposed for review  
Architecture baseline: 0.2

## 1. Purpose

The rendering subsystem converts a semantically projected view into a deterministic renderer-neutral layout plan and then safe accessible HTML/SVG. Architecture Sprint 0.1 makes layout behavior strategy driven through declarative recipes. The renderer remains a serializer, not a source of musical meaning or experiment defaults.

Related requirements: R-011–R-012, R-025–R-041, R-047–R-050. Amendment source: Architecture Sprint 0.1 handoff §§5–9.

## 2. Boundaries

The subsystem is divided into:

1. `projection` — selects semantic content and overlays;
2. `layout` — composes time/pitch/duration/label/overlay/disclosure strategies into a scene;
3. `renderer-html` — serializes the scene to accessible HTML/SVG;
4. `workbench` — resolves recipes and compatibility before the rendering subsystem runs.

The renderer must not:

- inspect canonical JSON directly;
- choose or substitute strategies;
- infer harmony, voicing, hands, timing, pitch, or specificity;
- generate learning chunks;
- describe a treatment as final notation.

## 3. Input contracts

### 3.1 `ProjectedView`

```text
ProjectedView {
  formatVersion: string;
  arrangementId: StableId;
  viewId: string;
  extent: TimeSpan;
  sections: ProjectedSection[];
  events: ProjectedEvent[];
  semanticOverlays: ProjectedOverlay[];
  learningPlanRef?: VersionedContentRef;
  diagnostics: Diagnostic[];
  provenanceIndex: Record<string, ProvenanceChain>;
}
```

Projected events contain semantic pitch/time values and visible metadata, but no final x/y/width/line break.

### 3.2 `ResolvedRecipe`

The rendering subsystem receives only a fully resolved recipe whose strategy versions/options are pinned and whose compatibility status is supported or explicitly permitted with limitations.

### 3.3 `LayoutEnvironment`

```text
LayoutEnvironment {
  viewportClass: "comparison-wide" | "print-preview";
  scale: RationalOrCanonicalDecimal;
  locale: string;
  deterministicRoundingVersion: string;
}
```

Sprint 1 avoids text-measurement-dependent semantic placement. Environment values affecting bytes are pinned in the manifest.

## 4. Strategy interfaces

### 4.1 `TimeMappingStrategy`

```text
mapTime(input: {
  extent: TimeSpan;
  time: Rational;
  environment: LayoutEnvironment;
  options: JSONValue;
}): MappedTime

MappedTime {
  x: LayoutScalar;
  referenceCellId?: string;
}
```

It maps onset only. It cannot alter event duration or order.

### 4.2 `DurationEncodingStrategy`

```text
encodeDuration(input: {
  start: Rational;
  duration: Rational;
  mappedStart: MappedTime;
  timeMapper: TimeMappingStrategy;
  options: JSONValue;
}): DurationGeometry

DurationGeometry {
  semanticEndX: LayoutScalar;
  visibleStartX: LayoutScalar;
  visibleEndX: LayoutScalar;
  reinforcement?: ScenePrimitive[];
}
```

`semanticEndX` must preserve the exact mapped duration endpoint. A visible minimum hit area may extend around it only when distinguishable and declared; it may not replace the semantic edge.

### 4.3 `PitchMappingStrategy`

```text
mapPitch(input: {
  pitch: ResolvedSpecificValue<PitchValue>;
  keyContext?: KeyContext;
  previousPitch?: PitchValue;
  options: JSONValue;
}): MappedPitch

MappedPitch {
  y?: LayoutScalar;
  laneId?: string;
  relation?: PitchRelationSummary;
}
```

A strategy declares whether it preserves absolute pitch, diatonic position, scale degree, interval, contour only, or a staff-like comparison. It cannot change the canonical pitch.

### 4.4 `PitchLabelStrategy`

Produces semantic text nodes from canonical pitch through registered formatters. It may display note name, scale degree, interval from prior event, chord-relative degree, or no visible label. Exact pitch must remain available in accessible text when the treatment contract requires it.

### 4.5 Overlay strategies

`StructuralOverlayStrategy` and `HarmonicOverlayStrategy` receive projected semantic overlays and produce scene nodes. Decorative options receive only already-computed scene data. Semantic overlays retain canonical IDs/provenance and may not be fabricated.

### 4.6 `DisclosureStrategy`

Chooses visibility/emphasis among information already present and allowed by the recipe. It cannot convert unknown to hidden certainty or remove required accessibility text.

## 5. Scene model

```text
LayoutPlan {
  formatVersion: string;
  viewId: string;
  recipeRef: VersionedContentRef;
  extent: LayoutExtent;
  nodes: SceneNode[];
  relationships: SceneRelationship[];
  accessibility: AccessibilityPlan;
  diagnostics: Diagnostic[];
  inputHash: string;
  optionsHash: string;
}

SceneNode {
  id: string;
  kind: "event" | "label" | "time-marker" | "structure" | "harmony" |
        "specificity" | "learning-chunk" | "hint" | "decoration";
  bounds?: { x: LayoutScalar; y: LayoutScalar; width: LayoutScalar; height: LayoutScalar };
  semanticEndX?: LayoutScalar;
  text?: string;
  classes: string[];
  sourceRefs: StableId[];
  provenanceRefs: string[];
  aria: AriaDescription;
}
```

Canonical data still contains no coordinates. Layout coordinates are disposable and recipe/version dependent.

## 6. Required views

The architecture continues to support:

- full arrangement;
- harmonic roadmap;
- role-isolated views;
- separated and combined hands;
- learning-plan chunks;
- arbitrary excerpts.

Sprint 1 implements melody treatment views and the minimal comparison page. Harmony, role, hand, repetition, voicing, and hint distinctions remain covered by model/projection contract tests and retained fixture validation; broader functional rendering may proceed in Sprint 2 as detailed in Sprint 1.

## 7. Functional Sprint 1 treatments

### 7.1 Explicit beat-grid baseline

**Time mapping:** `mnls.time.fixed-beat-grid@1`. Each beat is divided into a configured integer subdivision count. Rational onsets must land on representable cells or the strategy returns `TIME_GRID_RESOLUTION_INSUFFICIENT`; it does not round silently.

**Duration encoding:** `mnls.duration.grid-span@1`. The event spans from its onset cell boundary to the exact mapped end boundary. Sustains crossing cells are visibly continuous.

**Pitch mapping:** `mnls.pitch.absolute-chromatic-y@1`. Equal spelled/enharmonically resolved semantic pitch according to the strategy's comparison contract maps to equal y. Sprint 1 uses exact register-bearing pitch.

**Labels:** exact pitch text visible and in accessible description.

**Markers:** beats and configured subdivisions are explicit SVG/HTML nodes, not spaces in text.

### 7.2 Proportional spatial melody

**Time mapping:** `mnls.time.proportional@1`.

```text
x(t) = leftInset + canonicalDecimal(t * unitsPerBeat)
```

**Duration encoding:** `mnls.duration.proportional-extent@1`.

```text
semanticEndX = x(start + duration)
width = semanticEndX - x(start)
```

**Pitch mapping:** `mnls.pitch.absolute-chromatic-y@1`.

```text
y(p) = pitchOrigin - semitoneIndex(p) * unitsPerSemitone
```

The strategy pins spelling/comparison behavior and octave calculation through the canonical pitch interface. Equal pitch produces equal y; larger semitone intervals produce larger absolute vertical displacement. Higher pitch is visually higher.

**Labels/accessibility:** exact pitch and exact onset/duration are available in visible labels or event accessible text. Basic duration is recoverable from horizontal extent without stems, flags, or conventional duration symbols.

### 7.3 Shared-source guarantee

Both treatments consume the same `NormalizedArrangement` and `ProjectedView` content selection. Treatment differences are entirely in resolved recipes and layout strategies. Tests compare the canonical input hash before/after both runs and reject treatment-specific event payloads in recipes.

## 8. Time, pitch, and duration independence

Time mapping, pitch mapping, and duration encoding are selected separately. Compatibility rules prevent nonsensical combinations, but one strategy cannot implicitly select another.

Examples:

- proportional time + fixed-width duration labels is architecturally possible if the duration strategy remains truthful;
- contour-only pitch mapping + exact labels is possible only when the independent label strategy can access exact canonical pitch and the recipe declares that combination;
- fixed beat grid + proportional event extent is possible when extent maps to cell boundaries;
- a duration strategy requiring exact duration is incompatible with unknown duration.

## 9. Structural and semantic overlays

Supported overlay boundaries include:

- measure coordinates;
- beat/subdivision markers;
- section, phrase, and musical-idea boundaries where canonical data exists;
- repetition/variation family relationships;
- harmony and bass/inversion/voicing distinctions;
- musical roles;
- hand assignments including unknown/unspecified state;
- learning-plan chunks;
- pedagogical hints subordinate to canonical harmony.

A recipe may independently enable overlays. An overlay strategy must declare required canonical/plan capabilities.

## 10. Specificity rendering

Every visible `SpecificValue` state has a non-color textual/shape/class treatment. The exact visual vocabulary is experimental and recipe controlled, but the semantic DOM includes stable state text:

- required;
- suggested;
- optional;
- intentionally unspecified;
- unknown/not entered.

A disclosure strategy may hide optional values only when the recipe requests it; it may not hide the fact that required information is unknown if that state is relevant to the requested view.

## 11. HTML/SVG structure

A treatment bundle uses semantic HTML around SVG:

```text
main
  header: arrangement, treatment name/version, status, limitations
  nav: comparison/treatment links when applicable
  section: structural context
  section: visual treatment (SVG)
  section: accessible event table/list
  details: recipe, strategies, provenance, diagnostics
```

SVG elements use deterministic sanitized IDs and `data-source-id`, `data-role`, `data-specificity`, `data-strategy`, and provenance references where appropriate. Source order follows musical time, not visual layering order.

## 12. Safe serialization

- no untrusted `innerHTML`;
- escape all text/attributes;
- sanitize deterministic SVG IDs;
- no scripts in Sprint 1 generated output;
- no external resources or URL fetching;
- renderer options cannot inject CSS/markup;
- fixed project CSS classes only, with recipe options mapped to allowlisted tokens.

## 13. Accessibility

- exact pitch/time/duration text for melody events;
- treatment and limitation descriptions before the visualization;
- keyboard-readable source-order event list/table;
- SVG title/description and per-group accessible names as practical;
- no information carried by color alone;
- focus order matches musical/source order;
- zoom/reflow does not remove semantic information;
- repeated pitch and interval direction described textually for the spatial treatment where useful;
- learning chunks and overlays have text equivalents.

## 14. Determinism and output bundle

Coordinate serialization uses exact rational-to-decimal conversion under a pinned rounding version. Output node ordering is semantic time then stable source/derived ID. No font metrics, wall-clock time, random IDs, browser viewport measurements, or locale defaults influence hashed output.

Bundle:

```text
index.html
manifest.json
diagnostics.json
provenance.json
resolved-recipe.json
learning-plan.json        # optional
```

The workbench comparison bundle includes one subdirectory per treatment and a deterministic top-level comparison page.

## 15. Failure behavior

- missing exact onset/duration for required treatment: error;
- onset not representable in selected grid: error with required minimum subdivision evidence;
- unsupported pitch strategy/payload: error;
- unknown hand assignment for exact hand isolation: error, not inferred assignment;
- missing optional overlay capability: limitation or error according to recipe policy;
- false familiar-shape equivalence: error/suppression before renderer;
- coordinate overflow/invalid scale: error;
- missing accessible exact pitch for required melody treatment: error.

## 16. Tests

- strategy descriptor/implementation conformance;
- mathematical time/pitch/duration invariants;
- grid subdivision rejection rather than rounding;
- repeated pitch equal y;
- higher pitch smaller visual y coordinate;
- interval magnitude monotonic displacement;
- exact onset/duration proportional geometry;
- same canonical hash across treatments;
- no recipe musical payload;
- deterministic scene and HTML bytes;
- semantic DOM assertions for pitch/time/duration/status;
- accessibility tree/source-order assertions;
- escaping/property-based malicious text tests;
- specificity and harmony/hint distinction tests;
- compatibility prevents unsupported combinations before layout.

## 17. Rejected alternatives

- one `renderMode` switch with hard-coded branches;
- storing coordinates in canonical music;
- tying duration encoding to pitch mapping;
- silent grid rounding;
- relying on conventional note-value glyphs in the spatial treatment;
- canvas-only output without semantic parallel content;
- renderer fallback to an available strategy;
- screenshot snapshots as the only validation;
- labeling either Sprint 1 treatment as the final notation system.
