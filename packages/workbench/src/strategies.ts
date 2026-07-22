import type { CapabilityRequirement } from "@mnls/capabilities";
import type { JSONValue } from "@mnls/model";

import { StrategyCatalog, type StrategyDescriptor, type StrategyKind } from "./catalog.js";
import type { StrategyOptionSchema } from "./options.js";

export interface RepresentationStrategyImplementation {
  readonly id: string;
  readonly version: string;
  readonly kind: StrategyKind;
  readonly optionSchema: StrategyOptionSchema;
  additionalRequirements?(
    options: Readonly<Record<string, JSONValue>>,
  ): readonly CapabilityRequirement[];
}

function implementation(
  descriptor: StrategyDescriptor,
  fields: StrategyOptionSchema["fields"],
  additionalRequirements?: RepresentationStrategyImplementation["additionalRequirements"],
): RepresentationStrategyImplementation {
  return {
    id: descriptor.id,
    version: descriptor.version,
    kind: descriptor.kind,
    optionSchema: { id: descriptor.optionSchemaRef, fields },
    ...(additionalRequirements ? { additionalRequirements } : {}),
  };
}

function descriptor(
  id: string,
  kind: StrategyKind,
  displayName: string,
  requiresCapabilities: StrategyDescriptor["requiresCapabilities"],
  providesCapabilities: StrategyDescriptor["providesCapabilities"],
): StrategyDescriptor {
  return {
    id,
    version: "1",
    kind,
    displayName,
    status: "comparison",
    optionSchemaRef: `${id}.options@1`,
    requiresCapabilities,
    providesCapabilities,
    deterministic: true,
  };
}

const exactOnset = {
  source: "arrangement",
  capability: "time.exact-onset",
  acceptedStates: ["present"],
} as const;
const exactDuration = {
  source: "arrangement",
  capability: "time.exact-duration",
  acceptedStates: ["present"],
} as const;
const exactRegister = {
  source: "arrangement",
  capability: "pitch.exact-register",
  acceptedStates: ["present"],
} as const;

const definitions: readonly {
  readonly descriptor: StrategyDescriptor;
  readonly implementation: RepresentationStrategyImplementation;
}[] = (() => {
  const fixedGrid = descriptor(
    "mnls.time.fixed-beat-grid",
    "time-mapping",
    "Fixed beat grid",
    [exactOnset],
    [{ capability: "strategy.time.fixed-grid", state: "present" }],
  );
  const gridSpan = descriptor(
    "mnls.duration.grid-span",
    "duration-encoding",
    "Exact grid span",
    [
      exactDuration,
      {
        source: "selected-strategy",
        capability: "strategy.time.fixed-grid",
        acceptedStates: ["present"],
      },
    ],
    [],
  );
  const proportional = descriptor(
    "mnls.time.proportional",
    "time-mapping",
    "Proportional horizontal time",
    [exactOnset],
    [{ capability: "strategy.time.proportional", state: "present" }],
  );
  const proportionalExtent = descriptor(
    "mnls.duration.proportional-extent",
    "duration-encoding",
    "Proportional duration extent",
    [
      exactDuration,
      {
        source: "selected-strategy",
        capability: "strategy.time.proportional",
        acceptedStates: ["present"],
      },
    ],
    [],
  );
  const absolutePitch = descriptor(
    "mnls.pitch.absolute-chromatic-y",
    "pitch-mapping",
    "Absolute chromatic vertical pitch",
    [exactRegister],
    [{ capability: "strategy.pitch.exact-access", state: "present" }],
  );
  const exactLabels = descriptor(
    "mnls.labels.exact-pitch",
    "pitch-labels",
    "Exact pitch labels",
    [
      exactRegister,
      {
        source: "selected-strategy",
        capability: "strategy.pitch.exact-access",
        acceptedStates: ["present"],
      },
    ],
    [],
  );
  const beatOverlay = descriptor(
    "mnls.overlay.beat-subdivision",
    "structural-overlay",
    "Beat and subdivision reference",
    [
      {
        source: "selected-strategy",
        capability: "strategy.time.fixed-grid",
        acceptedStates: ["present"],
      },
      {
        source: "renderer",
        capability: "renderer.overlay.beat-subdivision",
        acceptedStates: ["present"],
      },
    ],
    [],
  );
  const timeOverlay = descriptor(
    "mnls.overlay.time-reference",
    "structural-overlay",
    "Proportional time reference",
    [
      {
        source: "selected-strategy",
        capability: "strategy.time.proportional",
        acceptedStates: ["present"],
      },
      {
        source: "renderer",
        capability: "renderer.overlay.time-reference",
        acceptedStates: ["present"],
      },
    ],
    [],
  );
  const learningOverlay = descriptor(
    "mnls.overlay.learning-chunks",
    "structural-overlay",
    "Verified learning-plan chunks",
    [
      {
        source: "learning-plan",
        capability: "learning-plan.valid",
        acceptedStates: ["present"],
      },
      {
        source: "learning-plan",
        capability: "learning-plan.matches-arrangement",
        acceptedStates: ["present"],
      },
      {
        source: "learning-plan",
        capability: "learning-plan.has-chunks",
        acceptedStates: ["present"],
      },
      {
        source: "renderer",
        capability: "renderer.overlay.learning-chunks",
        acceptedStates: ["present"],
      },
    ],
    [],
  );
  const renderer = descriptor(
    "mnls.renderer.html-svg",
    "renderer",
    "Accessible HTML and SVG",
    [
      { source: "renderer", capability: "renderer.svg", acceptedStates: ["present"] },
      {
        source: "renderer",
        capability: "renderer.accessible-event-list",
        acceptedStates: ["present"],
      },
    ],
    [],
  );
  return [
    {
      descriptor: fixedGrid,
      implementation: implementation(
        fixedGrid,
        {
          subdivisionsPerBeat: { type: "integer", minimum: 1, maximum: 16, default: 2 },
          unitsPerCell: { type: "integer", minimum: 1, default: 48 },
          originX: { type: "integer", minimum: 0, default: 48 },
        },
        (options) => [
          {
            source: "arrangement",
            capability: `time.grid-subdivision.${String(options.subdivisionsPerBeat)}`,
            acceptedStates: ["present"],
          },
        ],
      ),
    },
    {
      descriptor: gridSpan,
      implementation: implementation(gridSpan, {
        minimumHitWidth: { type: "integer", minimum: 1, default: 8 },
      }),
    },
    {
      descriptor: proportional,
      implementation: implementation(proportional, {
        unitsPerBeat: { type: "integer", minimum: 1, default: 96 },
        originX: { type: "integer", minimum: 0, default: 48 },
      }),
    },
    {
      descriptor: proportionalExtent,
      implementation: implementation(proportionalExtent, {
        minimumHitWidth: { type: "integer", minimum: 1, default: 8 },
      }),
    },
    {
      descriptor: absolutePitch,
      implementation: implementation(absolutePitch, {
        unitsPerSemitone: { type: "integer", minimum: 1, default: 12 },
        pitchOrigin: { type: "integer", default: 900 },
      }),
    },
    {
      descriptor: exactLabels,
      implementation: implementation(exactLabels, {
        visible: { type: "boolean", default: true },
      }),
    },
    {
      descriptor: beatOverlay,
      implementation: implementation(beatOverlay, {
        showBeats: { type: "boolean", default: true },
        showSubdivisions: { type: "boolean", default: true },
      }),
    },
    {
      descriptor: timeOverlay,
      implementation: implementation(timeOverlay, {
        showBeatGuides: { type: "boolean", default: true },
      }),
    },
    {
      descriptor: learningOverlay,
      implementation: implementation(learningOverlay, {
        showChunkLabels: { type: "boolean", default: true },
      }),
    },
    {
      descriptor: renderer,
      implementation: implementation(renderer, {
        includeEventTable: { type: "boolean", default: true },
        titleLevel: { type: "integer", minimum: 1, maximum: 6, default: 2 },
      }),
    },
  ];
})();

export function createBuiltInStrategyCatalog(): StrategyCatalog<RepresentationStrategyImplementation> {
  const catalog = new StrategyCatalog<RepresentationStrategyImplementation>();
  for (const entry of definitions) catalog.register(entry.descriptor, entry.implementation);
  return catalog;
}

export function listBuiltInStrategies(): readonly StrategyDescriptor[] {
  return createBuiltInStrategyCatalog().list();
}

export function describeBuiltInStrategy(id: string, version: string) {
  const resolution = createBuiltInStrategyCatalog().resolve(id, version);
  return resolution.ok
    ? {
        ok: true as const,
        descriptor: resolution.descriptor,
        optionSchema: resolution.implementation.optionSchema,
      }
    : resolution;
}
