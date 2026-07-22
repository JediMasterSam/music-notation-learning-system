import type {
  LearningContentSelector,
  VerifiedLearningPlan,
  VersionedContentRef,
} from "@mnls/learning";
import {
  addRational,
  canonicalStringify,
  compareRational,
  contentHash,
  deepFreeze,
  type ChordAnalysis,
  type Diagnostic,
  type FamiliarShapeHint,
  type Inversion,
  type JSONValue,
  type PitchEnvelope,
  type ProvenanceChain,
  type Rational,
  type SpecificityState,
  type SpecificValue,
  type StageResult,
  type TimeSpan,
  type Voicing,
} from "@mnls/model";
import { normalizedHash, type NormalizedArrangement, type NormalizedEvent } from "@mnls/normalizer";
import type { ResolvedRecipe } from "@mnls/workbench";

export interface ProjectedSection {
  readonly id: string;
  readonly label?: string;
  readonly type?: string;
  readonly span: TimeSpan;
  readonly order: number;
}

interface ProjectedEventBase {
  readonly id: string;
  readonly sourceId: string;
  readonly start: Rational;
  readonly duration: Rational;
  readonly roleIds: readonly string[];
  readonly handAssignments: NormalizedEvent["handAssignments"];
  readonly eventSpecificity?: SpecificityState;
  readonly provenance: ProvenanceChain;
}

export interface ProjectedNoteEvent extends ProjectedEventBase {
  readonly type: "note";
  readonly pitch: SpecificValue<PitchEnvelope>;
  readonly exactPitchLabelSource?: PitchEnvelope;
}

export interface ProjectedChordEvent extends ProjectedEventBase {
  readonly type: "chord";
  readonly canonicalHarmony: ChordAnalysis;
  readonly inversion?: SpecificValue<Inversion>;
  readonly slashBass?: SpecificValue<PitchEnvelope>;
  readonly voicing: SpecificValue<Voicing>;
  readonly familiarShapeHints: readonly FamiliarShapeHint[];
}

export type ProjectedEvent = ProjectedNoteEvent | ProjectedChordEvent;

export interface ProjectedLearningChunkOverlay {
  readonly type: "learning-chunk";
  readonly id: string;
  readonly planId: string;
  readonly chunkId: string;
  readonly sourceCanonicalRefs: readonly string[];
  readonly selectors: readonly LearningContentSelector[];
  readonly selectedEventIds: readonly string[];
  readonly spans: readonly TimeSpan[];
  readonly label?: string;
}

export type ProjectedOverlay = ProjectedLearningChunkOverlay;

export interface ProjectedView {
  readonly formatVersion: "0.1.0";
  readonly arrangementId: string;
  readonly normalizedArrangementHash: string;
  readonly viewId: string;
  readonly extent: TimeSpan;
  readonly sections: readonly ProjectedSection[];
  readonly events: readonly ProjectedEvent[];
  readonly semanticContentHash: string;
  readonly semanticOverlays: readonly ProjectedOverlay[];
  readonly learningPlanRef?: VersionedContentRef;
  readonly limitations: ResolvedRecipe["compatibility"]["limitations"];
  readonly diagnostics: readonly Diagnostic[];
  readonly provenanceIndex: Readonly<Record<string, ProvenanceChain>>;
  readonly projectionHash: string;
}

export interface ProjectionInput {
  readonly arrangement: NormalizedArrangement;
  readonly recipe: ResolvedRecipe;
  readonly learningPlan?: VerifiedLearningPlan;
  readonly excerpt?: TimeSpan;
}

interface ProjectionVisibility {
  readonly roleIds: readonly string[];
  readonly roleKinds: readonly string[];
  readonly hands: readonly string[];
  readonly includeLearningPlan: boolean;
  readonly includeHints: boolean;
}

function diagnostic(code: string, message: string, relatedIds?: readonly string[]): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "project",
    message,
    ...(relatedIds ? { relatedIds } : {}),
    requirementIds: ["R-003", "R-030", "R-040", "R-055"],
  };
}

function isRecord(value: JSONValue): value is Readonly<Record<string, JSONValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: JSONValue | undefined): readonly string[] {
  return Array.isArray(value) && value.every((child) => typeof child === "string") ? value : [];
}

function visibility(recipe: ResolvedRecipe): ProjectionVisibility {
  if (!isRecord(recipe.canonicalOptions)) {
    return {
      roleIds: [],
      roleKinds: [],
      hands: [],
      includeLearningPlan: false,
      includeHints: false,
    };
  }
  const value = recipe.canonicalOptions.visibility;
  if (!value || !isRecord(value)) {
    return {
      roleIds: [],
      roleKinds: [],
      hands: [],
      includeLearningPlan: false,
      includeHints: false,
    };
  }
  return {
    roleIds: stringArray(value.roleIds),
    roleKinds: stringArray(value.roleKinds),
    hands: stringArray(value.hands),
    includeLearningPlan: value.includeLearningPlan === true,
    includeHints: value.includeHints === true,
  };
}

function overlaps(start: Rational, duration: Rational, span: TimeSpan): boolean {
  const end = addRational(start, duration);
  const spanEnd = addRational(span.start.beat, span.duration.beats);
  return compareRational(start, spanEnd) < 0 && compareRational(end, span.start.beat) > 0;
}

function spansOverlap(left: TimeSpan, right: TimeSpan): boolean {
  return overlaps(left.start.beat, left.duration.beats, right);
}

function selectedRoleIds(
  arrangement: NormalizedArrangement,
  selected: ProjectionVisibility,
): ReadonlySet<string> | undefined {
  const ids = new Set(selected.roleIds);
  for (const role of arrangement.roles) {
    if (selected.roleKinds.includes(role.kind)) ids.add(role.id);
  }
  return ids.size > 0 ? ids : undefined;
}

function matchesHands(event: NormalizedEvent, hands: readonly string[]): boolean {
  if (hands.length === 0) return true;
  return event.handAssignments.some(
    (assignment) => "value" in assignment && hands.includes(assignment.value),
  );
}

function projectEvent(event: NormalizedEvent, includeHints: boolean): ProjectedEvent {
  const base: ProjectedEventBase = {
    id: event.derivedId,
    sourceId: event.sourceEventId,
    start: event.start,
    duration: event.duration,
    roleIds: event.roleIds,
    handAssignments: event.handAssignments,
    ...(event.semanticEvent.specificity
      ? { eventSpecificity: event.semanticEvent.specificity }
      : {}),
    provenance: event.provenance,
  };
  if (event.semanticEvent.type === "note") {
    return {
      ...base,
      type: "note",
      pitch: event.semanticEvent.pitch,
      ...(event.semanticEvent.pitch.state === "required" ||
      event.semanticEvent.pitch.state === "suggested" ||
      event.semanticEvent.pitch.state === "optional"
        ? { exactPitchLabelSource: event.semanticEvent.pitch.value }
        : {}),
    };
  }
  return {
    ...base,
    type: "chord",
    canonicalHarmony: event.semanticEvent.harmony,
    ...(event.semanticEvent.inversion ? { inversion: event.semanticEvent.inversion } : {}),
    ...(event.semanticEvent.slashBass ? { slashBass: event.semanticEvent.slashBass } : {}),
    voicing: event.semanticEvent.voicing,
    familiarShapeHints: includeHints ? (event.semanticEvent.hints ?? []) : [],
  };
}

function learningPlanRef(verified: VerifiedLearningPlan): VersionedContentRef {
  return {
    id: verified.plan.id,
    version: verified.plan.formatVersion,
    contentHash: verified.planHash,
  };
}

function selectorEventIds(
  selector: LearningContentSelector,
  arrangement: NormalizedArrangement,
  selectedIds: ReadonlySet<string>,
): readonly string[] {
  if (selector.type === "time-span") {
    return arrangement.events
      .filter(
        (event) =>
          selectedIds.has(event.derivedId) && overlaps(event.start, event.duration, selector.span),
      )
      .map(({ derivedId }) => derivedId);
  }
  const idea = arrangement.ideas.find(({ id }) => id === selector.ref);
  const sourceIds = new Set(idea?.eventRefs ?? [selector.ref]);
  return arrangement.events
    .filter(
      ({ derivedId, sourceEventId }) => selectedIds.has(derivedId) && sourceIds.has(sourceEventId),
    )
    .map(({ derivedId }) => derivedId);
}

function learningOverlays(
  verified: VerifiedLearningPlan,
  arrangement: NormalizedArrangement,
  selectedEvents: readonly ProjectedEvent[],
): readonly ProjectedLearningChunkOverlay[] {
  const selectedIds = new Set(selectedEvents.map(({ id }) => id));
  return verified.plan.chunks
    .map((chunk): ProjectedLearningChunkOverlay | undefined => {
      const eventIds = new Set(
        chunk.selectors.flatMap((selector) => selectorEventIds(selector, arrangement, selectedIds)),
      );
      if (eventIds.size === 0) return undefined;
      return {
        type: "learning-chunk",
        id: `overlay.${chunk.id}`,
        planId: verified.plan.id,
        chunkId: chunk.id,
        sourceCanonicalRefs: chunk.provenance.sourceRefs,
        selectors: chunk.selectors,
        selectedEventIds: selectedEvents
          .map(({ id }) => id)
          .filter((eventId) => eventIds.has(eventId)),
        spans: chunk.provenance.sourceSpans,
        ...(chunk.label ? { label: chunk.label } : {}),
      };
    })
    .filter((overlay): overlay is ProjectedLearningChunkOverlay => overlay !== undefined)
    .sort((left, right) => {
      const leftSpan = left.spans[0];
      const rightSpan = right.spans[0];
      return leftSpan && rightSpan
        ? compareRational(leftSpan.start.beat, rightSpan.start.beat) ||
            left.chunkId.localeCompare(right.chunkId, "en")
        : left.chunkId.localeCompare(right.chunkId, "en");
    });
}

function verifiedPlanDiagnostics(
  arrangement: NormalizedArrangement,
  verified: VerifiedLearningPlan | undefined,
): readonly Diagnostic[] {
  if (!verified) {
    return [
      diagnostic(
        "PROJECT_LEARNING_PLAN_MISSING",
        "Resolved recipe requests a verified learning-plan overlay, but none was supplied.",
      ),
    ];
  }
  if (
    verified.arrangementId !== arrangement.arrangementId ||
    verified.arrangementHash !== arrangement.inputHash ||
    verified.normalizedHash !== normalizedHash(arrangement)
  ) {
    return [
      diagnostic(
        "PROJECT_LEARNING_PLAN_STALE",
        "Verified learning plan does not match the projected arrangement ID/hash.",
        [verified.plan.id, arrangement.arrangementId],
      ),
    ];
  }
  return [];
}

export function projectView(input: ProjectionInput): StageResult<ProjectedView> {
  const inputHash = contentHash(input.arrangement);
  if (
    input.recipe.compatibility.status !== "supported" &&
    input.recipe.compatibility.status !== "supported-with-limitations"
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "PROJECT_RECIPE_UNSUPPORTED",
          "Projection requires a recipe that passed compatibility validation.",
        ),
      ],
    };
  }
  const selected = visibility(input.recipe);
  if (selected.includeLearningPlan) {
    const planDiagnostics = verifiedPlanDiagnostics(input.arrangement, input.learningPlan);
    if (planDiagnostics.length > 0) return { ok: false, diagnostics: planDiagnostics };
  }
  const roleIds = selectedRoleIds(input.arrangement, selected);
  const extent = input.excerpt ?? input.arrangement.extent;
  const events = input.arrangement.events
    .filter(
      (event) =>
        overlaps(event.start, event.duration, extent) &&
        (roleIds === undefined || event.roleIds.some((roleId) => roleIds.has(roleId))) &&
        matchesHands(event, selected.hands),
    )
    .map((event) => projectEvent(event, selected.includeHints));
  if (events.length === 0) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "PROJECT_EMPTY_SELECTION",
          "Recipe visibility and excerpt selected no semantic events.",
          [input.arrangement.arrangementId],
        ),
      ],
    };
  }
  const sections = input.arrangement.sections
    .filter(({ span }) => spansOverlap(span, extent))
    .map(({ id, label, type, span, order }) => ({
      id,
      ...(label ? { label } : {}),
      ...(type ? { type } : {}),
      span,
      order,
    }));
  const semanticContentHash = contentHash({ extent, sections, events });
  const overlays =
    selected.includeLearningPlan && input.learningPlan
      ? learningOverlays(input.learningPlan, input.arrangement, events)
      : [];
  const viewId = `view.${contentHash({
    arrangementId: input.arrangement.arrangementId,
    normalizedHash: normalizedHash(input.arrangement),
    extent,
    roleIds: [...(roleIds ?? [])].sort((left, right) => left.localeCompare(right, "en")),
    hands: [...selected.hands].sort((left, right) => left.localeCompare(right, "en")),
    learningPlanHash: input.learningPlan?.planHash ?? null,
    includeHints: selected.includeHints,
  }).slice("sha256:".length, "sha256:".length + 24)}`;
  const provenanceIndex = Object.fromEntries(events.map(({ id, provenance }) => [id, provenance]));
  const withoutHash: Omit<ProjectedView, "projectionHash"> = {
    formatVersion: "0.1.0",
    arrangementId: input.arrangement.arrangementId,
    normalizedArrangementHash: normalizedHash(input.arrangement),
    viewId,
    extent,
    sections,
    events,
    semanticContentHash,
    semanticOverlays: overlays,
    ...(input.learningPlan && selected.includeLearningPlan
      ? { learningPlanRef: learningPlanRef(input.learningPlan) }
      : {}),
    limitations: input.recipe.compatibility.limitations,
    diagnostics: [],
    provenanceIndex,
  };
  if (contentHash(input.arrangement) !== inputHash) {
    return {
      ok: false,
      diagnostics: [
        diagnostic("PROJECT_INPUT_MUTATION", "Projection mutated the normalized arrangement."),
      ],
    };
  }
  return {
    ok: true,
    value: deepFreeze({ ...withoutHash, projectionHash: contentHash(withoutHash) }),
    diagnostics: [],
  };
}

export function projectedSemanticBytes(view: ProjectedView): string {
  return canonicalStringify({
    arrangementId: view.arrangementId,
    extent: view.extent,
    sections: view.sections,
    events: view.events,
  });
}
