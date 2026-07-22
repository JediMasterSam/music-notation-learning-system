import { commonDefs } from "./common.js";

const capabilityEvidence = {
  type: "object",
  required: ["capability", "state", "source"],
  properties: {
    capability: { type: "string", pattern: "^[a-z][a-z0-9.-]+$" },
    state: { enum: ["present", "partial", "absent", "unknown"] },
    source: {
      type: "object",
      required: ["authority", "artifactId", "contentHash"],
      properties: {
        authority: {
          enum: ["canonical-arrangement", "verified-learning-plan", "renderer", "environment"],
        },
        artifactId: { type: "string", minLength: 1 },
        contentHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
      },
      additionalProperties: false,
    },
    evidenceRefs: { type: "array", items: { type: "string" } },
    detail: { type: "string" },
  },
  additionalProperties: false,
};

export const representationRecipeSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/representation-recipe/0.1.0",
  title: "MNLS Representation Recipe",
  type: "object",
  required: [
    "formatVersion",
    "id",
    "version",
    "name",
    "status",
    "strategies",
    "visibility",
    "accessibility",
    "renderer",
  ],
  properties: {
    formatVersion: { const: "0.1.0" },
    id: { type: "string", pattern: "^[a-z][a-z0-9.-]+$" },
    version: { $ref: "#/$defs/version" },
    name: { type: "string", minLength: 1 },
    description: { type: "string" },
    status: { enum: ["experimental", "comparison", "internal"] },
    strategies: {
      type: "object",
      required: ["timeMapping", "pitchMapping", "durationEncoding", "pitchLabels"],
      properties: {
        timeMapping: { $ref: "#/$defs/strategySelection" },
        pitchMapping: { $ref: "#/$defs/strategySelection" },
        durationEncoding: { $ref: "#/$defs/strategySelection" },
        pitchLabels: { $ref: "#/$defs/strategySelection" },
        structuralOverlays: {
          type: "array",
          items: { $ref: "#/$defs/strategySelection" },
        },
        harmonicOverlays: { type: "array", items: { $ref: "#/$defs/strategySelection" } },
        disclosure: { $ref: "#/$defs/strategySelection" },
      },
      additionalProperties: false,
    },
    visibility: {
      type: "object",
      properties: {
        roleIds: { type: "array", items: { type: "string" } },
        roleKinds: {
          type: "array",
          items: { enum: ["harmony", "bass", "accompaniment", "primary-line", "rhythm"] },
        },
        hands: { type: "array", items: { enum: ["left", "right", "both", "either"] } },
        includeLearningPlan: { type: "boolean" },
        includeHints: { type: "boolean" },
      },
      additionalProperties: false,
    },
    accessibility: {
      type: "object",
      required: ["includeExactPitch", "includeExactTime", "includeSourceOrderEvents"],
      properties: {
        includeExactPitch: { const: true },
        includeExactTime: { const: true },
        includeSourceOrderEvents: { const: true },
      },
      additionalProperties: false,
    },
    renderer: { $ref: "#/$defs/strategySelection" },
    limitationPolicy: {
      type: "object",
      properties: {
        acceptedClasses: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
    metadata: { $ref: "#/$defs/safeJson" },
  },
  additionalProperties: false,
  $defs: { ...commonDefs },
} as const;

export const learningTransformationSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/learning-transformation/0.1.0",
  title: "MNLS Learning Transformation Definition",
  type: "object",
  required: [
    "formatVersion",
    "id",
    "version",
    "name",
    "status",
    "supportedArrangementCapabilities",
    "parameterSchemaRef",
    "implementationRef",
    "outputContractVersion",
  ],
  properties: {
    formatVersion: { const: "0.1.0" },
    id: { type: "string", pattern: "^[a-z][a-z0-9.-]+$" },
    version: { $ref: "#/$defs/version" },
    name: { type: "string", minLength: 1 },
    status: { enum: ["experimental", "comparison", "internal"] },
    supportedArrangementCapabilities: {
      type: "array",
      items: { $ref: "#/$defs/arrangementRequirement" },
    },
    parameterSchemaRef: { type: "string", minLength: 1 },
    implementationRef: {
      type: "object",
      required: ["transformationId", "transformationVersion"],
      properties: {
        transformationId: { type: "string", pattern: "^[a-z][a-z0-9.-]+$" },
        transformationVersion: { $ref: "#/$defs/version" },
      },
      additionalProperties: false,
    },
    ruleConfiguration: { $ref: "#/$defs/safeJson" },
    outputContractVersion: { $ref: "#/$defs/version" },
    metadata: { $ref: "#/$defs/safeJson" },
  },
  additionalProperties: false,
  $defs: {
    ...commonDefs,
    arrangementRequirement: {
      type: "object",
      required: ["source", "capability", "acceptedStates"],
      properties: {
        source: { const: "arrangement" },
        capability: { type: "string", pattern: "^[a-z][a-z0-9.-]+$" },
        acceptedStates: {
          type: "array",
          minItems: 1,
          items: { enum: ["present", "partial"] },
        },
      },
      additionalProperties: false,
    },
  },
} as const;

export const learningPlanSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/learning-plan/0.1.0",
  title: "MNLS Learning Plan",
  type: "object",
  required: [
    "formatVersion",
    "id",
    "arrangementRef",
    "normalizedArrangementHash",
    "transformationRef",
    "transformationParameters",
    "chunks",
    "relationships",
    "provenance",
    "diagnostics",
    "planHash",
  ],
  properties: {
    formatVersion: { const: "0.1.0" },
    id: { type: "string", minLength: 1 },
    arrangementRef: { $ref: "#/$defs/contentRef" },
    normalizedArrangementHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
    transformationRef: { $ref: "#/$defs/contentRef" },
    transformationParameters: { $ref: "#/$defs/safeJson" },
    chunks: { type: "array", items: { $ref: "#/$defs/chunk" } },
    relationships: { type: "array", items: { $ref: "#/$defs/relationship" } },
    overrides: { type: "array", items: { $ref: "#/$defs/safeJson" } },
    provenance: { $ref: "#/$defs/safeJson" },
    diagnostics: { type: "array", items: { $ref: "#/$defs/safeJson" } },
    planHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
  },
  additionalProperties: false,
  $defs: {
    ...commonDefs,
    chunk: {
      type: "object",
      required: ["id", "selectors", "provenance"],
      properties: {
        id: { type: "string", minLength: 1 },
        label: { type: "string" },
        selectors: { type: "array", minItems: 1, items: { $ref: "#/$defs/selector" } },
        roleFilter: { type: "array", items: { $ref: "#/$defs/stableId" } },
        handFilter: { $ref: "#/$defs/valueSpecificity" },
        practiceIntent: { type: "array", items: { type: "string" } },
        provenance: { $ref: "#/$defs/safeJson" },
      },
      additionalProperties: false,
    },
    selector: {
      oneOf: [
        {
          type: "object",
          required: ["type", "ref"],
          properties: {
            type: { const: "canonical-ref" },
            ref: { $ref: "#/$defs/stableId" },
          },
          additionalProperties: false,
        },
        {
          type: "object",
          required: ["type", "span"],
          properties: {
            type: { const: "time-span" },
            span: { $ref: "#/$defs/timeSpan" },
          },
          additionalProperties: false,
        },
      ],
    },
    relationship: {
      type: "object",
      required: ["type", "fromChunkId", "toChunkId"],
      properties: {
        type: { enum: ["precedes", "prerequisite"] },
        fromChunkId: { type: "string" },
        toChunkId: { type: "string" },
      },
      additionalProperties: false,
    },
  },
} as const;

export const experimentDefinitionSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/experiment-definition/0.1.0",
  title: "MNLS Experiment Definition",
  type: "object",
  required: [
    "formatVersion",
    "id",
    "version",
    "fixtureRefs",
    "treatmentRefs",
    "researchQuestion",
    "controlledVariables",
    "changedVariables",
    "tasks",
    "observations",
    "status",
  ],
  properties: {
    formatVersion: { const: "0.1.0" },
    id: { type: "string", pattern: "^[a-z][a-z0-9.-]+$" },
    version: { $ref: "#/$defs/version" },
    fixtureRefs: { type: "array", minItems: 1, items: { $ref: "#/$defs/contentRef" } },
    treatmentRefs: { type: "array", minItems: 2, items: { $ref: "#/$defs/contentRef" } },
    learningTransformationRefs: {
      type: "array",
      items: { $ref: "#/$defs/contentRef" },
    },
    researchQuestion: { type: "string", minLength: 1 },
    controlledVariables: { type: "array", minItems: 1, items: { $ref: "#/$defs/variable" } },
    changedVariables: { type: "array", minItems: 1, items: { $ref: "#/$defs/variable" } },
    tasks: { type: "array", minItems: 1, items: { $ref: "#/$defs/namedText" } },
    observations: { type: "array", minItems: 1, items: { $ref: "#/$defs/namedText" } },
    status: { enum: ["draft", "ready", "completed", "archived"] },
  },
  additionalProperties: false,
  $defs: {
    ...commonDefs,
    variable: {
      type: "object",
      required: ["id", "description"],
      properties: { id: { type: "string" }, description: { type: "string" } },
      additionalProperties: false,
    },
    namedText: {
      type: "object",
      required: ["id", "description"],
      properties: { id: { type: "string" }, description: { type: "string" } },
      additionalProperties: false,
    },
  },
} as const;

export const runManifestSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/run-manifest/0.1.0",
  title: "MNLS Resolved Recipe and Run Manifest",
  type: "object",
  required: [
    "formatVersion",
    "artifactType",
    "id",
    "inputRefs",
    "toolVersions",
    "outputArtifacts",
    "runHash",
  ],
  properties: {
    formatVersion: { const: "0.1.0" },
    artifactType: {
      enum: ["resolved-recipe", "treatment-manifest", "experiment-run-manifest"],
    },
    id: { type: "string", minLength: 1 },
    inputRefs: { type: "array", items: { $ref: "#/$defs/contentRef" } },
    toolVersions: {
      type: "object",
      propertyNames: { pattern: "^[a-z][a-z0-9.-]+$" },
      additionalProperties: { type: "string" },
    },
    resolvedOptions: { $ref: "#/$defs/safeJson" },
    diagnostics: { type: "array", items: { $ref: "#/$defs/safeJson" } },
    outputArtifacts: { type: "array", items: { $ref: "#/$defs/contentRef" } },
    runHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
  },
  additionalProperties: false,
  $defs: { ...commonDefs },
} as const;

export const capabilityProfileSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://mnls.dev/schema/capability-profile/0.1.0",
  title: "MNLS Artifact-scoped Capability Profile",
  oneOf: [
    {
      type: "object",
      required: [
        "formatVersion",
        "profileType",
        "arrangementId",
        "canonicalHash",
        "normalizedHash",
        "capabilities",
      ],
      properties: {
        formatVersion: { const: "0.1.0" },
        profileType: { const: "arrangement" },
        arrangementId: { type: "string" },
        canonicalHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        normalizedHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        capabilities: {
          type: "array",
          items: {
            allOf: [
              { $ref: "#/$defs/capabilityEvidence" },
              {
                type: "object",
                required: ["source"],
                properties: {
                  source: {
                    type: "object",
                    required: ["authority"],
                    properties: { authority: { const: "canonical-arrangement" } },
                  },
                },
              },
            ],
          },
        },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      required: ["formatVersion", "profileType", "artifactId", "contentHash", "capabilities"],
      properties: {
        formatVersion: { const: "0.1.0" },
        profileType: { enum: ["learning-plan", "renderer", "environment"] },
        artifactId: { type: "string" },
        contentHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        arrangementId: { type: "string" },
        arrangementHash: { type: "string", pattern: "^sha256:[a-f0-9]{64}$" },
        capabilities: { type: "array", items: { $ref: "#/$defs/capabilityEvidence" } },
      },
      additionalProperties: false,
    },
  ],
  $defs: { ...commonDefs, capabilityEvidence },
} as const;
