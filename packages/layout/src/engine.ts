import {
  addRational,
  compareRational,
  contentHash,
  deepFreeze,
  multiplyRational,
  rational,
  rationalKey,
  subtractRational,
  type Diagnostic,
  type Rational,
  type StageResult,
} from "@mnls/model";
import { createBuiltInPitchRegistry } from "@mnls/pitch";
import type { ProjectedEvent, ProjectedNoteEvent } from "@mnls/projection";
import type { ResolvedStrategySelection } from "@mnls/workbench";

import type {
  AccessibilityPlan,
  AccessibleEventDescription,
  DurationEncodingStrategy,
  LayoutEnvironment,
  LayoutInput,
  LayoutPlan,
  LayoutStrategyRegistry,
  PitchMappingStrategy,
  ResolvedLayoutSelections,
  SceneNode,
  SceneRelationship,
  TimeMappingStrategy,
} from "./contracts.js";
import { fixedBeatGridV1, gridSpanV1, integerOption } from "./fixed-grid.js";
import { absoluteChromaticYV1 } from "./pitch.js";
import { proportionalExtentV1, proportionalTimeV1 } from "./proportional.js";
import { layoutScalar } from "./scalar.js";

export const defaultLayoutEnvironment: LayoutEnvironment = Object.freeze({
  viewportClass: "comparison-wide",
  scale: rational(1),
  locale: "en",
  deterministicRoundingVersion: "mnls.decimal@1",
});

function key(id: string, version: string): string {
  return `${id}@${version}`;
}

export function createSprint1LayoutRegistry(): LayoutStrategyRegistry {
  return {
    time: new Map([
      [key(fixedBeatGridV1.id, fixedBeatGridV1.version), fixedBeatGridV1],
      [key(proportionalTimeV1.id, proportionalTimeV1.version), proportionalTimeV1],
    ]),
    duration: new Map([
      [key(gridSpanV1.id, gridSpanV1.version), gridSpanV1],
      [key(proportionalExtentV1.id, proportionalExtentV1.version), proportionalExtentV1],
    ]),
    pitch: new Map([
      [key(absoluteChromaticYV1.id, absoluteChromaticYV1.version), absoluteChromaticYV1],
    ]),
  };
}

function diagnostic(code: string, message: string, relatedIds?: readonly string[]): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "layout",
    message,
    ...(relatedIds ? { relatedIds } : {}),
    requirementIds: ["R-001", "R-002", "R-031", "R-053"],
  };
}

function selection(
  input: LayoutInput,
  slot: "timeMapping" | "durationEncoding" | "pitchMapping" | "pitchLabels",
): ResolvedStrategySelection | undefined {
  return input.recipe.selections.find((candidate) => candidate.slot === slot);
}

function layoutSelections(input: LayoutInput): StageResult<ResolvedLayoutSelections> {
  const time = selection(input, "timeMapping");
  const duration = selection(input, "durationEncoding");
  const pitch = selection(input, "pitchMapping");
  const labels = selection(input, "pitchLabels");
  if (!time || !duration || !pitch || !labels) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LAYOUT_SELECTION_MISSING",
          "Resolved recipe is missing a required layout strategy selection.",
        ),
      ],
    };
  }
  return {
    ok: true,
    value: {
      time,
      duration,
      pitch,
      labels,
      overlays: input.recipe.selections.filter(({ kind }) => kind === "structural-overlay"),
    },
    diagnostics: [],
  };
}

function resolveStrategy<T>(
  map: ReadonlyMap<string, T>,
  selected: ResolvedStrategySelection,
): StageResult<T> {
  const strategy = map.get(key(selected.strategyId, selected.strategyVersion));
  return strategy
    ? { ok: true, value: strategy, diagnostics: [] }
    : {
        ok: false,
        diagnostics: [
          diagnostic(
            "LAYOUT_STRATEGY_NOT_FOUND",
            `Layout strategy ${selected.strategyId}@${selected.strategyVersion} is unavailable.`,
            [selected.strategyId],
          ),
        ],
      };
}

function exactPitchLabel(event: ProjectedNoteEvent): StageResult<string> {
  if (!event.exactPitchLabelSource) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LAYOUT_EXACT_PITCH_REQUIRED",
          `Projected event ${event.sourceId} has no exact pitch label source.`,
          [event.sourceId],
        ),
      ],
    };
  }
  const strategy = createBuiltInPitchRegistry().resolve(
    event.exactPitchLabelSource.strategy,
    event.exactPitchLabelSource.version,
  );
  if (!strategy) {
    return {
      ok: false,
      diagnostics: [
        diagnostic("PITCH_STRATEGY_NOT_FOUND", "Pitch formatter is unavailable.", [event.sourceId]),
      ],
    };
  }
  const label = strategy.format(event.exactPitchLabelSource);
  return label.ok
    ? label
    : {
        ok: false,
        diagnostics: label.diagnostics.map((item) => ({ ...item, stage: "layout" as const })),
      };
}

function specificity(event: ProjectedEvent): string {
  if (event.eventSpecificity) return event.eventSpecificity;
  return event.type === "note" ? event.pitch.state : event.voicing.state;
}

function provenanceRefs(event: ProjectedEvent): readonly string[] {
  return event.provenance.steps.map(
    ({ kind: stepKind, sourceId, operationIndex }) =>
      `${stepKind}:${sourceId}${operationIndex === undefined ? "" : `:${operationIndex}`}`,
  );
}

function pitchRelation(previous: number | undefined, current: number): string {
  if (previous === undefined) return "First selected pitch.";
  const difference = current - previous;
  if (difference === 0) return "Same pitch as the previous selected event.";
  return `${difference > 0 ? "Higher" : "Lower"} than the previous selected event by ${Math.abs(difference)} semitone${Math.abs(difference) === 1 ? "" : "s"}.`;
}

interface EventLayoutResult {
  readonly nodes: readonly SceneNode[];
  readonly relationships: readonly SceneRelationship[];
  readonly accessible: AccessibleEventDescription;
  readonly semitoneIndex: number;
}

function layoutEvent(
  event: ProjectedEvent,
  extentStart: Rational,
  time: TimeMappingStrategy,
  duration: DurationEncodingStrategy,
  pitch: PitchMappingStrategy,
  selected: ResolvedLayoutSelections,
  environment: LayoutEnvironment,
  previousPitch: number | undefined,
): StageResult<EventLayoutResult> {
  if (event.type !== "note") {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LAYOUT_EVENT_UNSUPPORTED",
          "Sprint 1 functional layout supports projected melody note events only.",
          [event.sourceId],
        ),
      ],
    };
  }
  const mappedStart = time.mapTime({
    extentStart,
    time: event.start,
    environment,
    options: selected.time.options,
  });
  if (!mappedStart.ok) return mappedStart;
  const geometry = duration.encodeDuration({
    extentStart,
    start: event.start,
    duration: event.duration,
    mappedStart: mappedStart.value,
    timeMapper: time,
    environment,
    timeOptions: selected.time.options,
    options: selected.duration.options,
  });
  if (!geometry.ok) return geometry;
  const mappedPitch = pitch.mapPitch({ event, environment, options: selected.pitch.options });
  if (!mappedPitch.ok) return mappedPitch;
  if (
    selected.labels.strategyId !== "mnls.labels.exact-pitch" ||
    selected.labels.strategyVersion !== "1"
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LAYOUT_LABEL_STRATEGY_UNAVAILABLE",
          `Pitch label strategy ${selected.labels.strategyId}@${selected.labels.strategyVersion} is unavailable.`,
        ),
      ],
    };
  }
  const label = exactPitchLabel(event);
  if (!label.ok) return label;
  const state = specificity(event);
  const eventHeight = multiplyRational(rational(18), environment.scale);
  const visibleWidth = subtractRational(
    geometry.value.visibleEndX.exact,
    geometry.value.visibleStartX.exact,
  );
  const relation = pitchRelation(previousPitch, mappedPitch.value.semitoneIndex);
  const eventNodeId = `scene.event.${event.id}`;
  const labelNodeId = `scene.label.${event.id}`;
  const exactOnset = rationalKey(event.start);
  const exactDuration = rationalKey(event.duration);
  const accessibleText = `${label.value}; onset ${exactOnset} beats; duration ${exactDuration} beats; ${state}; ${relation}`;
  const eventNode: SceneNode = {
    id: eventNodeId,
    kind: "event",
    semanticTime: event.start,
    bounds: {
      x: geometry.value.visibleStartX,
      y: mappedPitch.value.y,
      width: layoutScalar(visibleWidth),
      height: layoutScalar(eventHeight),
    },
    semanticEndX: geometry.value.semanticEndX,
    text: label.value,
    classes: ["scene-event", `specificity-${state}`],
    sourceRefs: [event.sourceId],
    provenanceRefs: provenanceRefs(event),
    strategyRef: `${selected.time.strategyId}@${selected.time.strategyVersion}+${selected.duration.strategyId}@${selected.duration.strategyVersion}+${selected.pitch.strategyId}@${selected.pitch.strategyVersion}`,
    aria: { label: label.value, description: accessibleText },
  };
  const labelY = addRational(
    mappedPitch.value.y.exact,
    multiplyRational(rational(4), environment.scale),
  );
  const labelNode: SceneNode = {
    id: labelNodeId,
    kind: "label",
    semanticTime: event.start,
    bounds: {
      x: geometry.value.visibleStartX,
      y: layoutScalar(labelY),
      width: layoutScalar(visibleWidth),
      height: layoutScalar(multiplyRational(rational(12), environment.scale)),
    },
    text: label.value,
    classes: ["pitch-label", `specificity-${state}`],
    sourceRefs: [event.sourceId],
    provenanceRefs: provenanceRefs(event),
    strategyRef: `${selected.labels.strategyId}@${selected.labels.strategyVersion}`,
    aria: { label: `${label.value} pitch label`, description: accessibleText },
  };
  return {
    ok: true,
    value: {
      nodes: [eventNode, labelNode],
      relationships: [{ type: "labels", fromNodeId: labelNodeId, toNodeId: eventNodeId }],
      accessible: {
        nodeId: eventNodeId,
        sourceId: event.sourceId,
        exactPitch: label.value,
        exactOnset,
        exactDuration,
        specificity: state,
        roleIds: event.roleIds,
        text: accessibleText,
      },
      semitoneIndex: mappedPitch.value.semitoneIndex,
    },
    diagnostics: [],
  };
}

function gridMarkers(
  view: LayoutInput["view"],
  selection: ResolvedStrategySelection,
  time: TimeMappingStrategy,
  environment: LayoutEnvironment,
  sceneHeight: Rational,
): StageResult<readonly SceneNode[]> {
  const subdivisions = integerOption(selection.options, "subdivisionsPerBeat");
  if (!subdivisions.ok) return subdivisions;
  const cellCount = multiplyRational(view.extent.duration.beats, rational(subdivisions.value));
  if (cellCount.denominator !== 1) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "TIME_GRID_RESOLUTION_INSUFFICIENT",
          "Projected extent cannot be represented by the selected grid subdivision.",
        ),
      ],
    };
  }
  const nodes: SceneNode[] = [];
  for (let index = 0; index <= cellCount.numerator; index += 1) {
    const beatOffset = rational(index, subdivisions.value);
    const semanticTime = addRational(view.extent.start.beat, beatOffset);
    const mapped = time.mapTime({
      extentStart: view.extent.start.beat,
      time: semanticTime,
      environment,
      options: selection.options,
    });
    if (!mapped.ok) return mapped;
    const isBeat = index % subdivisions.value === 0;
    const text = isBeat
      ? `Beat ${rationalKey(semanticTime)}`
      : `Subdivision ${index % subdivisions.value} of beat ${Math.floor(index / subdivisions.value)}`;
    nodes.push({
      id: `scene.time.${index}`,
      kind: "time-marker",
      semanticTime,
      bounds: {
        x: mapped.value.x,
        y: layoutScalar(rational(0)),
        width: layoutScalar(multiplyRational(rational(1), environment.scale)),
        height: layoutScalar(sceneHeight),
      },
      text,
      classes: ["time-marker", isBeat ? "beat-marker" : "subdivision-marker"],
      sourceRefs: [],
      provenanceRefs: [mapped.value.referenceCellId ?? `grid-cell.${index}`],
      strategyRef: `${selection.strategyId}@${selection.strategyVersion}`,
      aria: { label: text, description: `${text}; explicit temporal reference.` },
    });
  }
  return { ok: true, value: nodes, diagnostics: [] };
}

function proportionalTimeMarkers(
  view: LayoutInput["view"],
  selection: ResolvedStrategySelection,
  time: TimeMappingStrategy,
  environment: LayoutEnvironment,
  sceneHeight: Rational,
): StageResult<readonly SceneNode[]> {
  const wholeBeats = Math.floor(
    view.extent.duration.beats.numerator / view.extent.duration.beats.denominator,
  );
  const nodes: SceneNode[] = [];
  for (let index = 0; index <= wholeBeats; index += 1) {
    const semanticTime = addRational(view.extent.start.beat, rational(index));
    const mapped = time.mapTime({
      extentStart: view.extent.start.beat,
      time: semanticTime,
      environment,
      options: selection.options,
    });
    if (!mapped.ok) return mapped;
    const text = `Time reference ${rationalKey(semanticTime)} beats`;
    nodes.push({
      id: `scene.time-reference.${index}`,
      kind: "time-marker",
      semanticTime,
      bounds: {
        x: mapped.value.x,
        y: layoutScalar(rational(0)),
        width: layoutScalar(multiplyRational(rational(1), environment.scale)),
        height: layoutScalar(sceneHeight),
      },
      text,
      classes: ["time-marker", "time-reference-marker"],
      sourceRefs: [],
      provenanceRefs: [`time:${rationalKey(semanticTime)}`],
      strategyRef: "mnls.overlay.time-reference@1",
      aria: { label: text, description: `${text}; proportional temporal reference.` },
    });
  }
  return { ok: true, value: nodes, diagnostics: [] };
}

function learningChunkNodes(
  input: LayoutInput,
  eventNodes: readonly SceneNode[],
  environment: LayoutEnvironment,
): {
  readonly nodes: readonly SceneNode[];
  readonly relationships: readonly SceneRelationship[];
  readonly accessible: readonly { readonly nodeId: string; readonly text: string }[];
} {
  const bySource = new Map(
    eventNodes
      .filter(({ kind, bounds }) => kind === "event" && bounds)
      .flatMap((node) => node.sourceRefs.map((sourceRef) => [sourceRef, node] as const)),
  );
  const nodes: SceneNode[] = [];
  const relationships: SceneRelationship[] = [];
  const accessible: { nodeId: string; text: string }[] = [];
  for (const overlay of input.view.semanticOverlays) {
    const contained = overlay.sourceCanonicalRefs
      .map((sourceRef) => bySource.get(sourceRef))
      .filter((node): node is SceneNode & { bounds: NonNullable<SceneNode["bounds"]> } =>
        Boolean(node?.bounds),
      );
    if (contained.length === 0) continue;
    let start = contained[0]!.bounds.x.exact;
    let end =
      contained[0]!.semanticEndX?.exact ??
      addRational(contained[0]!.bounds.x.exact, contained[0]!.bounds.width.exact);
    for (const node of contained.slice(1)) {
      if (compareRational(node.bounds.x.exact, start) < 0) start = node.bounds.x.exact;
      const nodeEnd =
        node.semanticEndX?.exact ?? addRational(node.bounds.x.exact, node.bounds.width.exact);
      if (compareRational(nodeEnd, end) > 0) end = nodeEnd;
    }
    const nodeId = `scene.learning.${overlay.chunkId}`;
    const text = overlay.label ?? `Learning chunk ${overlay.chunkId}`;
    nodes.push({
      id: nodeId,
      kind: "learning-chunk",
      semanticTime: overlay.spans[0]?.start.beat ?? input.view.extent.start.beat,
      bounds: {
        x: layoutScalar(start),
        y: layoutScalar(multiplyRational(rational(12), environment.scale)),
        width: layoutScalar(subtractRational(end, start)),
        height: layoutScalar(multiplyRational(rational(8), environment.scale)),
      },
      text,
      classes: ["learning-chunk"],
      sourceRefs: overlay.sourceCanonicalRefs,
      provenanceRefs: [`plan:${overlay.planId}`, `chunk:${overlay.chunkId}`],
      strategyRef: "mnls.overlay.learning-chunks@1",
      aria: {
        label: text,
        description: `${text}; references ${overlay.selectedEventIds.length} selected event${overlay.selectedEventIds.length === 1 ? "" : "s"}.`,
      },
    });
    for (const containedNode of contained) {
      relationships.push({ type: "contains", fromNodeId: nodeId, toNodeId: containedNode.id });
    }
    accessible.push({ nodeId, text });
  }
  return { nodes, relationships, accessible };
}

function sortNodes(nodes: readonly SceneNode[]): readonly SceneNode[] {
  const kindOrder: Readonly<Record<SceneNode["kind"], number>> = {
    "time-marker": 0,
    structure: 1,
    "learning-chunk": 2,
    event: 3,
    label: 4,
    specificity: 5,
    harmony: 6,
    hint: 7,
    decoration: 8,
  };
  return [...nodes].sort(
    (left, right) =>
      compareRational(left.semanticTime, right.semanticTime) ||
      kindOrder[left.kind] - kindOrder[right.kind] ||
      left.id.localeCompare(right.id, "en"),
  );
}

export function layoutProjectedView(
  input: LayoutInput,
  registry: LayoutStrategyRegistry = createSprint1LayoutRegistry(),
): StageResult<LayoutPlan> {
  const selectedResult = layoutSelections(input);
  if (!selectedResult.ok) return selectedResult;
  const selected = selectedResult.value;
  const time = resolveStrategy<TimeMappingStrategy>(registry.time, selected.time);
  const duration = resolveStrategy<DurationEncodingStrategy>(registry.duration, selected.duration);
  const pitch = resolveStrategy<PitchMappingStrategy>(registry.pitch, selected.pitch);
  if (!time.ok) return time;
  if (!duration.ok) return duration;
  if (!pitch.ok) return pitch;
  const environment = input.environment ?? defaultLayoutEnvironment;
  if (
    environment.deterministicRoundingVersion !== "mnls.decimal@1" ||
    environment.locale !== "en" ||
    environment.scale.denominator <= 0 ||
    compareRational(environment.scale, rational(0)) <= 0
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LAYOUT_ENVIRONMENT_UNSUPPORTED",
          "Sprint 1 layout requires positive scale, the pinned en locale, and mnls.decimal@1 rounding.",
        ),
      ],
    };
  }

  const eventNodes: SceneNode[] = [];
  const relationships: SceneRelationship[] = [];
  const accessibleEvents: AccessibleEventDescription[] = [];
  let previousPitch: number | undefined;
  for (const event of input.view.events) {
    const result = layoutEvent(
      event,
      input.view.extent.start.beat,
      time.value,
      duration.value,
      pitch.value,
      selected,
      environment,
      previousPitch,
    );
    if (!result.ok) return result;
    eventNodes.push(...result.value.nodes);
    relationships.push(...result.value.relationships);
    accessibleEvents.push(result.value.accessible);
    previousPitch = result.value.semitoneIndex;
  }
  const boundedEvents = eventNodes.filter(
    (node): node is SceneNode & { bounds: NonNullable<SceneNode["bounds"]> } =>
      Boolean(node.bounds),
  );
  let maxY = rational(0);
  let maxX = rational(0);
  for (const node of boundedEvents) {
    const endY = addRational(node.bounds.y.exact, node.bounds.height.exact);
    const endX =
      node.semanticEndX?.exact ?? addRational(node.bounds.x.exact, node.bounds.width.exact);
    if (compareRational(endY, maxY) > 0) maxY = endY;
    if (compareRational(endX, maxX) > 0) maxX = endX;
  }
  const sceneHeight = addRational(maxY, multiplyRational(rational(48), environment.scale));
  const sceneWidth = addRational(maxX, multiplyRational(rational(48), environment.scale));
  const overlayIds = new Set(selected.overlays.map(({ strategyId }) => strategyId));
  const supportedOverlayIds = new Set([
    "mnls.overlay.beat-subdivision",
    "mnls.overlay.time-reference",
    "mnls.overlay.learning-chunks",
  ]);
  const unsupportedOverlay = [...overlayIds].find((id) => !supportedOverlayIds.has(id));
  if (unsupportedOverlay) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LAYOUT_OVERLAY_STRATEGY_NOT_FOUND",
          `Overlay layout strategy ${unsupportedOverlay}@1 is unavailable.`,
          [unsupportedOverlay],
        ),
      ],
    };
  }
  const markerNodes = overlayIds.has("mnls.overlay.beat-subdivision")
    ? gridMarkers(input.view, selected.time, time.value, environment, sceneHeight)
    : overlayIds.has("mnls.overlay.time-reference")
      ? proportionalTimeMarkers(input.view, selected.time, time.value, environment, sceneHeight)
      : { ok: true as const, value: [] as readonly SceneNode[], diagnostics: [] };
  if (!markerNodes.ok) return markerNodes;
  const learning = overlayIds.has("mnls.overlay.learning-chunks")
    ? learningChunkNodes(input, eventNodes, environment)
    : { nodes: [], relationships: [], accessible: [] };
  relationships.push(...learning.relationships);
  const nodes = sortNodes([...markerNodes.value, ...learning.nodes, ...eventNodes]);
  const accessibility: AccessibilityPlan = {
    title: input.recipe.authoredIdentity.name,
    description: `${input.recipe.authoredIdentity.status} treatment for arrangement ${input.view.arrangementId}; exact pitch, onset, and duration are available in source order.`,
    eventOrder: accessibleEvents.map(({ nodeId }) => nodeId),
    events: accessibleEvents,
    overlays: learning.accessible,
  };
  const optionsHash = contentHash({
    recipeResolutionHash: input.recipe.resolutionHash,
    selections: input.recipe.selections,
    environment,
  });
  const strategyRefs = input.recipe.selections
    .map(({ strategyId, strategyVersion }) => `${strategyId}@${strategyVersion}`)
    .sort((left, right) => left.localeCompare(right, "en"));
  const withoutHash: Omit<LayoutPlan, "layoutHash"> = {
    formatVersion: "0.1.0",
    viewId: input.view.viewId,
    recipeRef: input.recipe.recipeRef,
    treatment: input.recipe.authoredIdentity,
    strategyRefs,
    extent: { width: layoutScalar(sceneWidth), height: layoutScalar(sceneHeight) },
    nodes,
    relationships: [...relationships].sort((left, right) =>
      `${left.fromNodeId}:${left.toNodeId}`.localeCompare(
        `${right.fromNodeId}:${right.toNodeId}`,
        "en",
      ),
    ),
    accessibility,
    limitations: input.view.limitations,
    diagnostics: [],
    inputHash: input.view.projectionHash,
    optionsHash,
    environment,
  };
  return {
    ok: true,
    value: deepFreeze({ ...withoutHash, layoutHash: contentHash(withoutHash) }),
    diagnostics: [],
  };
}
