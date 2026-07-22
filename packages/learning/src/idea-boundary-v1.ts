import {
  addRational,
  compareRational,
  subtractRational,
  type Arrangement,
  type Diagnostic,
  type JSONValue,
  type MusicalIdea,
  type MusicalRoleKind,
  type StageResult,
  type TimeSpan,
  type Transition,
} from "@mnls/model";

import type { IdeaBoundaryParameters, LearningContentSelector } from "./contracts.js";
import type {
  GeneratedLearningChunk,
  LearningTransformationExecutionContext,
  LearningTransformationImplementation,
} from "./transformation.js";

const roleKinds = new Set<MusicalRoleKind>([
  "harmony",
  "bass",
  "accompaniment",
  "primary-line",
  "rhythm",
]);

function diagnostic(code: string, message: string, canonicalId?: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "learning",
    message,
    ...(canonicalId ? { canonicalId } : {}),
    requirementIds: ["R-010", "R-030", "R-042", "R-055"],
  };
}

function isObject(value: JSONValue): value is Readonly<Record<string, JSONValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function materializeIdeaBoundaryParameters(
  value: JSONValue,
): StageResult<IdeaBoundaryParameters> {
  if (!isObject(value)) {
    return {
      ok: false,
      diagnostics: [diagnostic("LEARN_PARAMETER_INVALID", "Parameters must be a JSON object.")],
    };
  }
  const unknownKeys = Object.keys(value).filter(
    (key) => !["includedRoleKinds", "includeTransitions", "order"].includes(key),
  );
  const included = value.includedRoleKinds ?? [];
  if (
    unknownKeys.length > 0 ||
    !Array.isArray(included) ||
    !included.every((kind) => typeof kind === "string" && roleKinds.has(kind as MusicalRoleKind)) ||
    (value.includeTransitions !== undefined && typeof value.includeTransitions !== "boolean") ||
    (value.order !== undefined && value.order !== "canonical-time")
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_PARAMETER_INVALID",
          "idea-boundary@1 accepts includedRoleKinds, includeTransitions, and canonical-time order only.",
        ),
      ],
    };
  }
  return {
    ok: true,
    value: {
      includedRoleKinds: [...new Set(included as MusicalRoleKind[])].sort((left, right) =>
        left.localeCompare(right, "en"),
      ),
      includeTransitions: (value.includeTransitions as boolean | undefined) ?? false,
      order: "canonical-time",
    },
    diagnostics: [],
  };
}

function selectedIdeas(
  arrangement: Arrangement,
  parameters: IdeaBoundaryParameters,
): readonly MusicalIdea[] {
  const selectedRoleIds = new Set(
    arrangement.roles
      .filter(({ kind }) => parameters.includedRoleKinds.includes(kind))
      .map(({ id }) => id),
  );
  const includeEveryRole = parameters.includedRoleKinds.length === 0;
  return arrangement.ideas
    .filter(
      ({ roleRefs }) =>
        includeEveryRole || roleRefs.some((roleRef) => selectedRoleIds.has(roleRef)),
    )
    .sort(
      (left, right) =>
        compareRational(left.span.start.beat, right.span.start.beat) ||
        left.id.localeCompare(right.id, "en"),
    );
}

function transitionSpan(arrangement: Arrangement, transition: Transition): TimeSpan | undefined {
  if (transition.span) return transition.span;
  const events = (transition.eventRefs ?? [])
    .map((eventRef) => arrangement.events.find(({ id }) => id === eventRef))
    .filter((event) => event !== undefined)
    .sort((left, right) => compareRational(left.start.beat, right.start.beat));
  const first = events[0];
  if (!first) return undefined;
  let end = addRational(first.start.beat, first.duration.beats);
  for (const event of events.slice(1)) {
    const eventEnd = addRational(event.start.beat, event.duration.beats);
    if (compareRational(eventEnd, end) > 0) end = eventEnd;
  }
  return {
    start: first.start,
    duration: { beats: subtractRational(end, first.start.beat) },
  };
}

function ideaChunk(idea: MusicalIdea): GeneratedLearningChunk {
  return {
    ruleId: "idea-boundary",
    selectors: [
      { type: "canonical-ref", ref: idea.id },
      { type: "time-span", span: idea.span },
    ],
    sourceRefs: [idea.id, ...idea.eventRefs],
    sourceSpans: [idea.span],
    sortSpan: idea.span,
  };
}

function transitionChunk(
  arrangement: Arrangement,
  transition: Transition,
): StageResult<GeneratedLearningChunk> {
  const span = transitionSpan(arrangement, transition);
  if (!span) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_SELECTOR_INVALID",
          `Transition ${transition.id} has neither a span nor resolvable event references.`,
          transition.id,
        ),
      ],
    };
  }
  const selectors: LearningContentSelector[] = [
    { type: "canonical-ref", ref: transition.id },
    { type: "time-span", span },
  ];
  return {
    ok: true,
    value: {
      ruleId: "idea-boundary-transition",
      selectors,
      sourceRefs: [transition.id, ...(transition.eventRefs ?? [])],
      sourceSpans: [span],
      sortSpan: span,
    },
    diagnostics: [],
  };
}

function execute(
  context: LearningTransformationExecutionContext<IdeaBoundaryParameters>,
): StageResult<readonly GeneratedLearningChunk[]> {
  const chunks = selectedIdeas(context.arrangement, context.parameters).map(ideaChunk);
  if (chunks.length === 0) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "LEARN_EMPTY_PLAN",
          "idea-boundary@1 found no musical ideas matching the selected role kinds.",
          context.arrangement.id,
        ),
      ],
    };
  }
  if (context.parameters.includeTransitions) {
    for (const transition of context.arrangement.transitions ?? []) {
      const generated = transitionChunk(context.arrangement, transition);
      if (!generated.ok) return generated;
      chunks.push(generated.value);
    }
  }
  chunks.sort(
    (left, right) =>
      compareRational(left.sortSpan.start.beat, right.sortSpan.start.beat) ||
      left.sourceRefs[0]!.localeCompare(right.sourceRefs[0]!, "en"),
  );
  return { ok: true, value: chunks, diagnostics: [] };
}

export const ideaBoundaryV1: LearningTransformationImplementation<IdeaBoundaryParameters> = {
  id: "mnls.learning.idea-boundary",
  version: "1",
  parameterSchemaRef: "mnls.learning.idea-boundary.parameters@1",
  validateParameters: materializeIdeaBoundaryParameters,
  execute,
};
