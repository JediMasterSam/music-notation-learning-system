import {
  addRational,
  canonicalStringify,
  compareRational,
  contentHash,
  deepFreeze,
  multiplyRational,
  rational,
  subtractRational,
  type Arrangement,
  type CanonicalDocument,
  type Diagnostic,
  type HandName,
  type MeasureCoordinate,
  type MusicalEvent,
  type ProvenanceChain,
  type Rational,
  type Section,
  type SpecificValue,
  type StageResult,
  type TimeSpan,
  type Variation,
} from "@mnls/model";
import { validateCanonicalSemantics } from "@mnls/validator";

export interface NormalizationOptions {
  readonly strictRationals: true;
  readonly maxExpandedEvents: number;
}

export interface NormalizedEvent {
  readonly derivedId: string;
  readonly sourceEventId: string;
  readonly start: Rational;
  readonly duration: Rational;
  readonly semanticEvent: MusicalEvent;
  readonly roleIds: readonly string[];
  readonly handAssignments: readonly SpecificValue<HandName>[];
  readonly provenance: ProvenanceChain;
}

export interface NormalizedArrangement {
  readonly formatVersion: "0.1.0";
  readonly canonicalDocumentId: string;
  readonly canonicalSchemaVersion: string;
  readonly arrangementId: string;
  readonly extent: TimeSpan;
  readonly measures: readonly MeasureCoordinate[];
  readonly sections: readonly Section[];
  readonly events: readonly NormalizedEvent[];
  readonly diagnostics: readonly Diagnostic[];
  readonly inputHash: string;
  readonly optionsHash: string;
}

const defaultOptions: NormalizationOptions = Object.freeze({
  strictRationals: true,
  maxExpandedEvents: 10_000,
});

function normalizationDiagnostic(code: string, message: string, canonicalId?: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "normalize",
    message,
    ...(canonicalId ? { canonicalId } : {}),
    requirementIds: ["R-004", "R-011", "R-013"],
  };
}

function derivedId(parts: readonly string[]): string {
  return `normalized.${contentHash(parts).slice("sha256:".length, "sha256:".length + 20)}`;
}

function offsetEvent(event: MusicalEvent, offset: Rational): MusicalEvent {
  return {
    ...event,
    start: { beat: addRational(event.start.beat, offset) },
  };
}

function assignmentsFor(
  arrangement: Arrangement,
  event: MusicalEvent,
  structuralSourceIds: ReadonlySet<string>,
): readonly SpecificValue<HandName>[] {
  const referenced = new Set(event.handAssignmentRefs ?? []);
  return (arrangement.handAssignments ?? [])
    .filter(
      (assignment) =>
        referenced.has(assignment.id) ||
        assignment.targetRef === event.id ||
        structuralSourceIds.has(assignment.targetRef),
    )
    .sort(
      (left, right) =>
        (left.priority ?? 0) - (right.priority ?? 0) || left.id.localeCompare(right.id, "en"),
    )
    .map(({ assignment }) => assignment);
}

function normalizedEvent(
  arrangement: Arrangement,
  sourceEvent: MusicalEvent,
  semanticEvent: MusicalEvent,
  placementKey: readonly string[],
  structuralSourceIds: ReadonlySet<string>,
  provenance: ProvenanceChain,
): NormalizedEvent {
  return {
    derivedId: derivedId([arrangement.id, sourceEvent.id, ...placementKey]),
    sourceEventId: sourceEvent.id,
    start: semanticEvent.start.beat,
    duration: semanticEvent.duration.beats,
    semanticEvent,
    roleIds: semanticEvent.roleRefs,
    handAssignments: assignmentsFor(arrangement, sourceEvent, structuralSourceIds),
    provenance,
  };
}

function variationForEvent(
  variations: readonly Variation[],
  event: MusicalEvent,
): {
  readonly event: MusicalEvent;
  readonly variation?: Variation;
  readonly operationIndex?: number;
} {
  for (const variation of variations) {
    const operationIndex = variation.operations.findIndex(
      (operation) => operation.targetEventRef === event.id,
    );
    if (operationIndex >= 0) {
      return { event: variation.operations[operationIndex]!.event, variation, operationIndex };
    }
  }
  return { event };
}

function arrangementExtent(arrangement: Arrangement, events: readonly NormalizedEvent[]): TimeSpan {
  if (arrangement.duration) {
    return {
      start: { beat: rational(0) },
      duration: arrangement.duration,
    };
  }
  let end = rational(0);
  for (const event of events) {
    const eventEnd = addRational(event.start, event.duration);
    if (compareRational(eventEnd, end) > 0) end = eventEnd;
  }
  return { start: { beat: rational(0) }, duration: { beats: end } };
}

function expandArrangement(
  arrangement: Arrangement,
  options: NormalizationOptions,
): StageResult<readonly NormalizedEvent[]> {
  const diagnostics: Diagnostic[] = [];
  const eventsById = new Map(arrangement.events.map((event) => [event.id, event] as const));
  const ideasById = new Map(arrangement.ideas.map((idea) => [idea.id, idea] as const));
  const variationsById = new Map(
    (arrangement.variations ?? []).map((variation) => [variation.id, variation] as const),
  );
  const ideaIdsByEvent = new Map<string, string[]>();
  for (const idea of arrangement.ideas) {
    for (const eventRef of idea.eventRefs) {
      const values = ideaIdsByEvent.get(eventRef) ?? [];
      values.push(idea.id);
      ideaIdsByEvent.set(eventRef, values);
    }
  }
  const output: NormalizedEvent[] = arrangement.events.map((event, sourceIndex) =>
    normalizedEvent(
      arrangement,
      event,
      event,
      ["direct", String(sourceIndex)],
      new Set(ideaIdsByEvent.get(event.id) ?? []),
      { steps: [{ kind: "canonical", sourceId: event.id }] },
    ),
  );

  for (const repetition of arrangement.repetitions ?? []) {
    const idea = ideasById.get(repetition.sourceRef);
    const directEvent = eventsById.get(repetition.sourceRef);
    const sourceEvents = idea
      ? idea.eventRefs
          .map((eventRef) => eventsById.get(eventRef))
          .filter((event): event is MusicalEvent => Boolean(event))
      : directEvent
        ? [directEvent]
        : [];
    const sourceStart = idea?.span.start.beat ?? directEvent?.start.beat;
    if (!sourceStart || sourceEvents.length === 0) {
      diagnostics.push(
        normalizationDiagnostic(
          "NORMALIZE_REPETITION_SOURCE_EMPTY",
          `Repetition ${repetition.id} did not resolve to material.`,
          repetition.id,
        ),
      );
      continue;
    }
    const sourceDuration =
      repetition.duration?.beats ?? idea?.span.duration.beats ?? directEvent?.duration.beats;
    if (!sourceDuration) {
      diagnostics.push(
        normalizationDiagnostic(
          "NORMALIZE_REPETITION_DURATION_MISSING",
          `Repetition ${repetition.id} has no deterministic placement duration.`,
          repetition.id,
        ),
      );
      continue;
    }
    const selectedVariations = (repetition.variationRefs ?? [])
      .map((variationRef) => variationsById.get(variationRef))
      .filter((variation): variation is Variation => Boolean(variation));

    for (let iteration = 0; iteration < (repetition.count ?? 1); iteration += 1) {
      const iterationStart = addRational(
        repetition.start.beat,
        multiplyRational(sourceDuration, rational(iteration)),
      );
      const offset = subtractRational(iterationStart, sourceStart);
      for (const sourceEvent of sourceEvents) {
        const selected = variationForEvent(selectedVariations, sourceEvent);
        const placedEvent = offsetEvent(selected.event, offset);
        const steps: ProvenanceChain["steps"] = [
          { kind: "canonical", sourceId: sourceEvent.id },
          { kind: "reference", sourceId: repetition.sourceRef },
          { kind: "repetition", sourceId: repetition.id, operationIndex: iteration },
          ...(selected.variation
            ? [
                {
                  kind: "variation" as const,
                  sourceId: selected.variation.id,
                  operationIndex: selected.operationIndex ?? 0,
                  detail: `replace-event:${selected.event.id}`,
                },
              ]
            : []),
        ];
        output.push(
          normalizedEvent(
            arrangement,
            sourceEvent,
            placedEvent,
            [repetition.id, String(iteration), selected.variation?.id ?? "unvaried"],
            new Set(idea ? [idea.id] : []),
            { steps },
          ),
        );
        if (output.length > options.maxExpandedEvents) {
          return {
            ok: false,
            diagnostics: [
              normalizationDiagnostic(
                "NORMALIZE_EXPANSION_LIMIT",
                `Normalization exceeded ${options.maxExpandedEvents} events.`,
                repetition.id,
              ),
            ],
          };
        }
      }
    }
  }

  if (diagnostics.length > 0) return { ok: false, diagnostics };
  output.sort(
    (left, right) =>
      compareRational(left.start, right.start) ||
      left.sourceEventId.localeCompare(right.sourceEventId, "en") ||
      left.derivedId.localeCompare(right.derivedId, "en"),
  );
  return { ok: true, value: output, diagnostics: [] };
}

export function normalize(
  document: CanonicalDocument,
  arrangementId: string,
  options: NormalizationOptions = defaultOptions,
): StageResult<NormalizedArrangement> {
  const beforeHash = contentHash(document);
  const semantic = validateCanonicalSemantics(document);
  if (!semantic.ok) {
    return {
      ok: false,
      diagnostics: semantic.diagnostics.map((item) => ({ ...item, stage: "normalize" as const })),
    };
  }
  const arrangement = document.arrangements.find(({ id }) => id === arrangementId);
  if (!arrangement) {
    return {
      ok: false,
      diagnostics: [
        normalizationDiagnostic(
          "NORMALIZE_ARRANGEMENT_NOT_FOUND",
          `Arrangement ${arrangementId} does not exist in document ${document.id}.`,
          arrangementId,
        ),
      ],
    };
  }
  const expanded = expandArrangement(arrangement, options);
  if (!expanded.ok) return expanded;
  if (contentHash(document) !== beforeHash) {
    return {
      ok: false,
      diagnostics: [
        normalizationDiagnostic(
          "NORMALIZE_CANONICAL_MUTATION",
          "Canonical content changed during normalization.",
          arrangement.id,
        ),
      ],
    };
  }
  const normalized: NormalizedArrangement = {
    formatVersion: "0.1.0",
    canonicalDocumentId: document.id,
    canonicalSchemaVersion: document.schemaVersion,
    arrangementId,
    extent: arrangementExtent(arrangement, expanded.value),
    measures: arrangement.measures,
    sections: arrangement.sections,
    events: expanded.value,
    diagnostics: [],
    inputHash: beforeHash,
    optionsHash: contentHash(options),
  };
  return { ok: true, value: deepFreeze(normalized), diagnostics: [] };
}

export function normalizedHash(arrangement: NormalizedArrangement): string {
  return contentHash(arrangement);
}

export function serializeNormalized(arrangement: NormalizedArrangement): string {
  return canonicalStringify(arrangement);
}
