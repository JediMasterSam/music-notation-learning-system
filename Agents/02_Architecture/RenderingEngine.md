# Rendering Engine

Status: Architecture Sprint 0 complete — proposed for review

## 1. Purpose

The rendering engine presents normalized musical meaning as accessible static HTML/SVG learning views. It may select, group, prioritize, and lay out information, but it cannot create, repair, or reinterpret musical semantics.

Linked requirements: R-011–R-012, R-020–R-041, R-049. Linked experiments: E-003, E-004, E-006.

## 2. Boundaries

The renderer is split into three packages:

1. `@mnls/projection` selects semantic content for a requested view.
2. `@mnls/layout` creates a renderer-neutral layout plan with derived geometry.
3. `@mnls/renderer-html` serializes safe accessible HTML/SVG.

This separation allows later renderers to reuse projection and possibly layout without importing HTML concerns. Canonical and normalized packages never import rendering packages.

## 3. Input contracts

### `ProjectedView`

Contains:

- selected arrangement, section, idea, event, learning-chunk, and lyric nodes;
- exact rational temporal coordinates;
- visible specificity states;
- role and hand dimensions as separate fields;
- repeated-family and variation relationships;
- canonical harmony and subordinate hints;
- provenance chains;
- diagnostics safe for user display.

### `LayoutOptions`

```text
LayoutOptions {
  viewportWidth: positive number;
  density: "compact" | "balanced" | "expanded";
  beatPresentation: strategy ID;
  preferredBreaks?: StableId[];
  showMeasureCoordinates: boolean;
  locale: string;
  fontScale: positive number
}
```

Options are presentation-only. They may not determine chord analysis, voicing, hand assignment, or specificity.

### `RenderOptions`

```text
RenderOptions {
  documentTitle?: string;
  includeStandaloneCss: boolean;
  includeProvenanceManifest: boolean;
  theme: "system" | "light" | "dark";
  includeDiagnostics: boolean
}
```

Theme changes appearance only. Required distinctions remain visible in every theme.

## 4. Supported views

### 4.1 Full arrangement

Shows all selected structural context and musical roles at the requested disclosure level. Harmony, bass, voicing, inversion, exact notes, patterns, lyrics, and learning annotations appear only when present and requested.

### 4.2 Harmonic roadmap

Emphasizes section/idea form, beat-aligned canonical harmony, repetitions, alternate endings, and major variations. It may suppress exact-note and voicing detail but cannot replace intentionally unspecified or unknown values with generic chords.

### 4.3 Role-isolated view

Filters to one or more musical roles while retaining section labels, idea boundaries, time coordinates, repetitions, transitions, and relevant lyrics. Unrelated roles are hidden, not deleted from the source.

### 4.4 Hand-separated and combined views

Filters by resolved hand assignments while retaining original musical-role labels. Events with `both`, `either`, unknown, or intentionally unspecified assignment are represented according to explicit view policy; they are never silently assigned to a hand.

### 4.5 Learning-chunk view

Projects content referenced by selected chunks and displays prerequisite/transition context. Chunk boundaries may cross measures or sections. The view does not make chunk copies authoritative.

### 4.6 Arbitrary excerpt

Selects a rational time span and includes clipped structural/time context. Sounding events crossing the excerpt boundary remain visible with continuation indicators in derived layout metadata.

## 5. Semantic scene model

`@mnls/layout` produces:

```text
LayoutPlan {
  formatVersion: string;
  view: LayoutViewMetadata;
  groups: LayoutGroup[];
  lanes: LayoutLane[];
  nodes: LayoutNode[];
  relationships: LayoutRelationship[];
  readingOrder: string[];
  manifest: LayoutManifest
}
```

Node kinds include section heading, idea heading, measure coordinate, beat cell, chord, inversion, slash bass, voicing, note, pattern label, repetition marker, ending, transition, lyric, specificity marker, hint, diagnostic, and continuation.

Node content is semantic display data derived from normalized values. Node geometry is derived and disposable. Relationships connect repeated families, variations, source/instance pairs, lyric anchors, and grouped harmony components.

## 6. Temporal layout

- Beat and subdivision positions are computed from rational time.
- Multiple chords in one measure occupy distinct temporal cells.
- Syncopated events align to subdivision boundaries without inserted spaces.
- Measures provide coordinate bands but do not force line, phrase, idea, or chunk breaks.
- Events spanning cells use derived spans or continuation nodes.
- Lyrics attach to event/time anchors and participate in collision handling.

### Beat presentation strategy

```text
BeatPresentationStrategy {
  id;
  prepareTemporalGrid(projectedTime, options) -> TemporalGrid;
}
```

Sprint 1 implements `explicit-grid@1`. A second test strategy proves replaceability but need not be learner-ready. Choosing final marks or punctuation remains outside Sprint 0.

## 7. Adaptive density

Density is based on visible semantic complexity, not uniform spacing. The layout engine uses priority tiers:

1. canonical structure, time, and required musical events;
2. required bass/inversion/voicing and major variations;
3. suggested information;
4. optional exact detail and annotations;
5. pedagogical hints and diagnostics.

Lower-tier content may move to an auxiliary row, collapse behind a textual summary in static output, or be omitted by an explicit view configuration. Required content and unknown/intentionally-unspecified states may not disappear due only to space pressure.

## 8. Rendering musical distinctions

### Harmony, inversion, slash bass, and voicing

They render as separate semantic nodes grouped under one chord event. The canonical harmony label is first in accessible reading order. Inversion has its own labeled relation. Slash bass is explicitly labeled as bass. Voicing appears as exact pitches or constraints when valued, or as explicit unspecified/unknown state text when relevant.

The renderer never creates a combined opaque symbol that makes these fields indistinguishable.

### Specificity

Each state has:

- an explicit text label available to assistive technology;
- a noncolor visual treatment such as border, icon shape, pattern, label, or typography;
- a stable CSS/data token;
- no conversion to another state when hidden by a view.

### Repetition and variation

Repeated-family nodes share a stable relationship ID and visual treatment. Variations identify the common source and the changed material. Alternate endings render as distinct branches tied to the repeated source.

### Familiar-shape hints

- canonical harmony remains primary in DOM order and visual hierarchy;
- hint is labeled as a learning hint, not an alternate analysis;
- bass and equivalence class are available in accessible text;
- suppressed hints do not render as active hints;
- hiding hints changes no other node, timing, or layout meaning beyond reclaimed space;
- generated hints require explicit render input and are never generated by the renderer itself.

## 9. HTML/SVG structure

Recommended structure:

```text
<main>
  <header>document and arrangement identity</header>
  <nav aria-label="Arrangement structure">...</nav> (when useful)
  <section data-section-id="...">
    <h2>...</h2>
    <div role="group" aria-label="Musical idea ...">
      semantic HTML labels and an SVG temporal canvas
    </div>
  </section>
</main>
```

SVG is used for temporal geometry and connecting relationships. Essential text remains selectable/searchable and receives accessible labels. Purely decorative SVG elements use `aria-hidden="true"`.

No script is required for Prototype 1 output.

## 10. Safe serialization

- User text is inserted through text nodes or escaped serializer APIs.
- Canonical text never becomes raw HTML, CSS, URL, element name, or attribute name.
- Data attributes use sanitized deterministic IDs.
- SVG `href`, external images, foreign objects, event-handler attributes, and embedded scripts are prohibited.
- CSS values are selected from renderer-owned tokens, not user input.
- A content-security-policy-compatible output is required.

## 11. Accessibility requirements

- Logical reading order matches musical/structural order.
- Each view has a descriptive title and summary.
- Section, idea, chunk, and ending boundaries use headings/groups.
- Beat/subdivision location is available as text, not position alone.
- Required distinctions do not rely on color.
- Canonical chord, bass, inversion, voicing, hint, and specificity labels are exposed.
- Repeated relationships and variations are described textually.
- SVG has a title/description when not redundant with adjacent HTML.
- Minimum target sizing and focus styles are preserved for any future controls, though Sprint 1 output is static.
- Automated checks are supplemented by keyboard/screen-reader review before learner evaluation.

## 12. Determinism and output bundle

Output bundle:

```text
out/
  index.html
  styles.css            # optional embedded equivalent
  render-manifest.json
  diagnostics.json      # when requested
```

Byte stability requires fixed attribute ordering, line endings, number formatting, CSS token order, and derived node IDs. No timestamps are included unless explicitly passed as nonsemantic build metadata excluded from snapshots.

## 13. Failure behavior

- Unknown view kind: error.
- Unsupported beat strategy: error.
- Missing layout source node: internal invariant error with provenance.
- Content overflow: warning plus deterministic fallback; never silent clipping of required content.
- Missing formatter capability: error identifying pitch strategy and canonical ID.
- Unsafe text: safely escaped; not an error unless forbidden control characters are present.
- Accessibility invariant failure in test mode: test error.

The renderer does not recover from invalid music by guessing.

## 14. Sprint 1 rendering slice

Implement:

- full arrangement;
- harmonic roadmap;
- isolated primary line;
- isolated harmony;
- explicit beat grid;
- sections, ideas, repetitions, alternate ending;
- note events;
- canonical chord plus separate slash bass, inversion, and voicing nodes;
- all five specificity states;
- authored exact `Am7` → `C/A` hint shown/hidden;
- HTML escaping and provenance manifest.

Defer:

- hand views beyond contract-level tests unless Fixture C requires them;
- polished adaptive-density variants;
- generated hints;
- automatic pagination;
- final visual vocabulary.

## 15. Tests

- DOM semantic assertions for every visible construct;
- canonical-first order for hint fixture;
- show/hide hint output comparison proving no music changes;
- role filter retains structural/time context;
- hand filter does not relabel roles;
- multi-chord and syncopated beat positions;
- repeated-source data relationships;
- unknown versus intentionally unspecified text and CSS tokens;
- malicious lyric/title escaping;
- deterministic output snapshots with semantic assertions;
- accessible-name and duplicate-ID checks;
- no color-only distinction audit.

## 16. Rejected alternatives

- Canvas-only output: rejected for accessibility and inspectability.
- SVG-only document: rejected because headings, navigation, and text structure are better expressed in HTML.
- CSS whitespace chord alignment: rejected as semantically ambiguous.
- Renderer-generated harmony or voicing: rejected because renderer cannot own semantics.
- One combined chord label for harmony/bass/inversion/voicing: rejected because distinctions would collapse.
- Color-only specificity: rejected for accessibility.
- Hidden hints implemented by deleting/replacing canonical harmony: rejected because visibility must be removable without musical change.
