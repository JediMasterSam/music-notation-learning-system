import { commonDefs } from "./common.js";

const pitchEnvelope = {
  type: "object",
  required: ["strategy", "version", "value"],
  properties: {
    strategy: { type: "string", minLength: 1 },
    version: { $ref: "#/$defs/version" },
    value: { $ref: "#/$defs/safeJson" },
  },
  additionalProperties: false,
};

const pitchSpecificity = {
  oneOf: [
    {
      type: "object",
      required: ["state", "value"],
      properties: {
        state: { enum: ["required", "suggested", "optional"] },
        value: { $ref: "#/$defs/pitchEnvelope" },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      required: ["state"],
      properties: {
        state: { enum: ["intentionally-unspecified", "unknown"] },
        reason: { type: "string" },
        note: { type: "string" },
      },
      additionalProperties: false,
    },
  ],
};

const eventBaseProperties = {
  id: { $ref: "#/$defs/stableId" },
  start: { $ref: "#/$defs/timePosition" },
  duration: { $ref: "#/$defs/duration" },
  roleRefs: {
    type: "array",
    minItems: 1,
    items: { $ref: "#/$defs/stableId" },
  },
  specificity: {
    enum: ["required", "suggested", "optional", "intentionally-unspecified", "unknown"],
  },
  handAssignmentRefs: { type: "array", items: { $ref: "#/$defs/stableId" } },
};

export const canonicalDocumentSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/canonical/0.1.0",
  title: "MNLS Canonical Document",
  type: "object",
  required: ["documentType", "schemaVersion", "id", "song", "arrangements"],
  properties: {
    documentType: { const: "music-notation-learning-system" },
    schemaVersion: { const: "0.1.0" },
    id: { $ref: "#/$defs/stableId" },
    song: { $ref: "#/$defs/song" },
    arrangements: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/$defs/arrangement" },
    },
    sourceRegister: { type: "array", items: { $ref: "#/$defs/sourceRecord" } },
    metadata: { $ref: "#/$defs/safeJson" },
  },
  additionalProperties: false,
  $defs: {
    ...commonDefs,
    pitchEnvelope,
    pitchSpecificity,
    song: {
      type: "object",
      required: ["id", "title"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        title: { type: "string", minLength: 1 },
        metadata: { $ref: "#/$defs/safeJson" },
      },
      additionalProperties: false,
    },
    sourceRecord: {
      type: "object",
      required: ["id", "status", "repositoryUsePermitted", "behaviors", "limitations"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        status: {
          enum: ["public-domain", "licensed", "user-supplied", "synthetic", "analytical-fixture"],
        },
        repositoryUsePermitted: { const: true },
        sourceReference: { type: "string" },
        behaviors: { type: "array", items: { type: "string" } },
        limitations: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
    arrangement: {
      type: "object",
      required: ["id", "songRef", "meterMap", "measures", "roles", "sections", "ideas", "events"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        songRef: { $ref: "#/$defs/stableId" },
        title: { type: "string" },
        keyContext: { $ref: "#/$defs/safeJson" },
        meterMap: { type: "array", items: { $ref: "#/$defs/meterChange" } },
        measures: { type: "array", items: { $ref: "#/$defs/measure" } },
        roles: { type: "array", items: { $ref: "#/$defs/role" } },
        sections: { type: "array", items: { $ref: "#/$defs/section" } },
        ideas: { type: "array", items: { $ref: "#/$defs/idea" } },
        events: { type: "array", items: { $ref: "#/$defs/event" } },
        repetitions: { type: "array", items: { $ref: "#/$defs/repetition" } },
        variations: { type: "array", items: { $ref: "#/$defs/variation" } },
        transitions: { type: "array", items: { $ref: "#/$defs/transition" } },
        handAssignments: { type: "array", items: { $ref: "#/$defs/handAssignment" } },
        duration: { $ref: "#/$defs/duration" },
        metadata: { $ref: "#/$defs/safeJson" },
      },
      additionalProperties: false,
    },
    meterChange: {
      type: "object",
      required: ["start", "numerator", "denominator"],
      properties: {
        start: { $ref: "#/$defs/timePosition" },
        numerator: { type: "integer", minimum: 1 },
        denominator: { type: "integer", minimum: 1 },
      },
      additionalProperties: false,
    },
    measure: {
      type: "object",
      required: ["id", "ordinal", "start", "duration"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        ordinal: { type: "integer", minimum: 0 },
        start: { $ref: "#/$defs/timePosition" },
        duration: { $ref: "#/$defs/duration" },
        displayNumber: { type: "string" },
        pickup: { type: "boolean" },
      },
      additionalProperties: false,
    },
    role: {
      type: "object",
      required: ["id", "kind"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        kind: { enum: ["harmony", "bass", "accompaniment", "primary-line", "rhythm"] },
        label: { type: "string" },
      },
      additionalProperties: false,
    },
    section: {
      type: "object",
      required: ["id", "span", "order", "ideaRefs"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        label: { type: "string" },
        type: { type: "string" },
        span: { $ref: "#/$defs/timeSpan" },
        order: { type: "integer" },
        ideaRefs: { type: "array", items: { $ref: "#/$defs/stableId" } },
        transitionRefs: { type: "array", items: { $ref: "#/$defs/stableId" } },
      },
      additionalProperties: false,
    },
    idea: {
      type: "object",
      required: ["id", "span", "roleRefs", "eventRefs"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        span: { $ref: "#/$defs/timeSpan" },
        roleRefs: { type: "array", items: { $ref: "#/$defs/stableId" } },
        eventRefs: { type: "array", items: { $ref: "#/$defs/stableId" } },
        sourceIdeaRef: { $ref: "#/$defs/stableId" },
        variationRef: { $ref: "#/$defs/stableId" },
      },
      additionalProperties: false,
    },
    transition: {
      type: "object",
      required: ["id", "fromRef", "toRef"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        fromRef: { $ref: "#/$defs/stableId" },
        toRef: { $ref: "#/$defs/stableId" },
        span: { $ref: "#/$defs/timeSpan" },
        eventRefs: { type: "array", items: { $ref: "#/$defs/stableId" } },
      },
      additionalProperties: false,
    },
    handAssignment: {
      type: "object",
      required: ["id", "targetRef", "assignment"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        targetRef: { $ref: "#/$defs/stableId" },
        assignment: { $ref: "#/$defs/handSpecificity" },
        span: { $ref: "#/$defs/timeSpan" },
        priority: { type: "integer" },
      },
      additionalProperties: false,
    },
    handSpecificity: {
      oneOf: [
        {
          type: "object",
          required: ["state", "value"],
          properties: {
            state: { enum: ["required", "suggested", "optional"] },
            value: { enum: ["left", "right", "both", "either"] },
          },
          additionalProperties: false,
        },
        {
          type: "object",
          required: ["state"],
          properties: {
            state: { enum: ["intentionally-unspecified", "unknown"] },
            reason: { type: "string" },
            note: { type: "string" },
          },
          additionalProperties: false,
        },
      ],
    },
    event: { oneOf: [{ $ref: "#/$defs/noteEvent" }, { $ref: "#/$defs/chordEvent" }] },
    noteEvent: {
      type: "object",
      required: ["id", "type", "start", "duration", "roleRefs", "pitch"],
      properties: {
        ...eventBaseProperties,
        type: { const: "note" },
        pitch: { $ref: "#/$defs/pitchSpecificity" },
      },
      additionalProperties: false,
    },
    chordEvent: {
      type: "object",
      required: ["id", "type", "start", "duration", "roleRefs", "harmony", "voicing"],
      properties: {
        ...eventBaseProperties,
        type: { const: "chord" },
        harmony: { $ref: "#/$defs/chordAnalysis" },
        inversion: { $ref: "#/$defs/valueSpecificity" },
        slashBass: { $ref: "#/$defs/pitchSpecificity" },
        voicing: { $ref: "#/$defs/valueSpecificity" },
        hints: { type: "array", items: { $ref: "#/$defs/familiarShapeHint" } },
        analysisAnnotations: { type: "array", items: { $ref: "#/$defs/analysisAnnotation" } },
      },
      additionalProperties: false,
    },
    chordAnalysis: {
      type: "object",
      required: ["root", "quality"],
      properties: {
        root: { $ref: "#/$defs/pitchEnvelope" },
        quality: { $ref: "#/$defs/chordQualityRef" },
        extensions: { type: "array", items: { type: "integer", minimum: 1, maximum: 15 } },
        alterations: { type: "array", items: { $ref: "#/$defs/safeJson" } },
        omissions: { $ref: "#/$defs/valueSpecificity" },
        addedTones: { type: "array", items: { type: "integer", minimum: 1, maximum: 15 } },
      },
      additionalProperties: false,
    },
    chordQualityRef: {
      type: "object",
      required: ["vocabularyId", "vocabularyVersion", "qualityId"],
      properties: {
        vocabularyId: { type: "string", minLength: 1 },
        vocabularyVersion: { $ref: "#/$defs/version" },
        qualityId: { type: "string", pattern: "^[a-z][a-z0-9-]*$" },
      },
      additionalProperties: false,
    },
    analysisAnnotation: {
      type: "object",
      required: ["id", "text", "authority"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        text: { type: "string" },
        system: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        authority: { const: "annotation" },
      },
      additionalProperties: false,
    },
    familiarShapeHint: {
      type: "object",
      required: ["id", "type", "source", "upperStructure", "bass", "equivalence"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        type: { const: "familiar-shape" },
        source: { enum: ["authored", "generated"] },
        upperStructure: { $ref: "#/$defs/chordAnalysis" },
        bass: { $ref: "#/$defs/pitchEnvelope" },
        equivalence: { enum: ["exact-pitch-class-set", "voicing-subset", "approximation"] },
        status: { enum: ["active", "suppressed"] },
        suppressionReasons: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
    repetition: {
      type: "object",
      required: ["id", "sourceRef", "start"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        sourceRef: { $ref: "#/$defs/stableId" },
        start: { $ref: "#/$defs/timePosition" },
        duration: { $ref: "#/$defs/duration" },
        count: { type: "integer", minimum: 1 },
        variationRefs: { type: "array", items: { $ref: "#/$defs/stableId" } },
      },
      additionalProperties: false,
    },
    variation: {
      type: "object",
      required: ["id", "sourceRef", "operations"],
      properties: {
        id: { $ref: "#/$defs/stableId" },
        sourceRef: { $ref: "#/$defs/stableId" },
        label: { type: "string" },
        operations: { type: "array", items: { $ref: "#/$defs/variationOperation" } },
      },
      additionalProperties: false,
    },
    variationOperation: {
      type: "object",
      required: ["type", "targetEventRef", "event"],
      properties: {
        type: { const: "replace-event" },
        targetEventRef: { $ref: "#/$defs/stableId" },
        event: { $ref: "#/$defs/event" },
      },
      additionalProperties: false,
    },
  },
} as const;

export const chordQualityVocabularySchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/chord-quality-vocabulary/0.1.0",
  title: "MNLS Chord Quality Vocabulary",
  type: "object",
  required: ["formatVersion", "vocabularyId", "vocabularyVersion", "qualities"],
  properties: {
    formatVersion: { const: "0.1.0" },
    vocabularyId: { const: "mnls.chord-quality" },
    vocabularyVersion: { const: "1.0.0" },
    qualities: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["qualityId", "displayLabel", "pitchClassIntervals"],
        properties: {
          qualityId: { type: "string", pattern: "^[a-z][a-z0-9-]*$" },
          displayLabel: { type: "string" },
          aliases: { type: "array", items: { type: "string" } },
          pitchClassIntervals: {
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: { type: "integer", minimum: 0, maximum: 11 },
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;
