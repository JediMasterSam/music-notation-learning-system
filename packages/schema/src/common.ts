export type JsonSchema = Record<string, unknown>;

export const stableIdPattern = "^[a-z][a-z0-9]*(?:[._:-][a-z0-9]+)*$";
export const versionPattern = "^(?:0|[1-9][0-9]*)(?:\\.(?:0|[1-9][0-9]*)){0,2}$";

const safePropertyName = {
  not: {
    enum: [
      "__proto__",
      "prototype",
      "constructor",
      "script",
      "callback",
      "executable",
      "code",
      "html",
      "markup",
      "css",
      "events",
      "notes",
      "chords",
      "coordinates",
      "capabilities",
      "capabilityEvidence",
      "x",
      "y",
    ],
  },
};

export const commonDefs = {
  stableId: { type: "string", pattern: stableIdPattern },
  version: { type: "string", pattern: versionPattern },
  rational: {
    type: "object",
    required: ["numerator", "denominator"],
    properties: {
      numerator: { type: "integer" },
      denominator: { type: "integer", minimum: 1 },
    },
    additionalProperties: false,
  },
  timePosition: {
    type: "object",
    required: ["beat"],
    properties: { beat: { $ref: "#/$defs/rational" } },
    additionalProperties: false,
  },
  duration: {
    type: "object",
    required: ["beats"],
    properties: { beats: { $ref: "#/$defs/rational" } },
    additionalProperties: false,
  },
  timeSpan: {
    type: "object",
    required: ["start", "duration"],
    properties: {
      start: { $ref: "#/$defs/timePosition" },
      duration: { $ref: "#/$defs/duration" },
    },
    additionalProperties: false,
  },
  safeJson: {
    oneOf: [
      { type: ["string", "number", "boolean", "null"] },
      { type: "array", items: { $ref: "#/$defs/safeJson" } },
      {
        type: "object",
        propertyNames: safePropertyName,
        additionalProperties: { $ref: "#/$defs/safeJson" },
      },
    ],
  },
  contentRef: {
    type: "object",
    required: ["id", "version", "contentHash"],
    properties: {
      id: { type: "string", minLength: 1 },
      version: { $ref: "#/$defs/version" },
      contentHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
    },
    additionalProperties: false,
  },
  strategySelection: {
    type: "object",
    required: ["strategyId", "strategyVersion", "options"],
    properties: {
      strategyId: { type: "string", pattern: "^[a-z][a-z0-9.-]+$" },
      strategyVersion: { $ref: "#/$defs/version" },
      options: { $ref: "#/$defs/safeJson" },
    },
    additionalProperties: false,
  },
  valueSpecificity: {
    oneOf: [
      {
        type: "object",
        required: ["state", "value"],
        properties: {
          state: { enum: ["required", "suggested", "optional"] },
          value: {},
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
} as const satisfies Record<string, JsonSchema>;
