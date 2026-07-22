import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";

import {
  capabilityProfileSchema,
  experimentDefinitionSchema,
  learningPlanSchema,
  learningTransformationSchema,
  representationRecipeSchema,
  runManifestSchema,
} from "./artifacts.js";
import { canonicalDocumentSchema, chordQualityVocabularySchema } from "./canonical.js";
import type { StructuralDiagnostic, StructuralValidationResult } from "./types.js";

export const schemaIds = {
  canonical: canonicalDocumentSchema.$id,
  chordQualityVocabulary: chordQualityVocabularySchema.$id,
  representationRecipe: representationRecipeSchema.$id,
  learningTransformation: learningTransformationSchema.$id,
  learningPlan: learningPlanSchema.$id,
  experimentDefinition: experimentDefinitionSchema.$id,
  runManifest: runManifestSchema.$id,
  capabilityProfile: capabilityProfileSchema.$id,
} as const;

const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });

for (const schema of [
  canonicalDocumentSchema,
  chordQualityVocabularySchema,
  representationRecipeSchema,
  learningTransformationSchema,
  learningPlanSchema,
  experimentDefinitionSchema,
  runManifestSchema,
  capabilityProfileSchema,
]) {
  ajv.addSchema(schema);
}

const validators = new Map<string, ValidateFunction>(
  Object.values(schemaIds).map((schemaId) => [schemaId, ajv.getSchema(schemaId)!]),
);

function toDiagnostic(error: ErrorObject): StructuralDiagnostic {
  return {
    code: "SCHEMA_INVALID",
    severity: "error",
    stage: "schema",
    message: error.message ?? "Artifact does not match its declared schema.",
    jsonPointer: error.instancePath || "/",
    schemaPath: error.schemaPath,
  };
}

export function validateArtifact(schemaId: string, value: unknown): StructuralValidationResult {
  const validate = validators.get(schemaId);
  if (!validate) {
    return {
      ok: false,
      diagnostics: [
        {
          code: "SCHEMA_NOT_REGISTERED",
          severity: "error",
          stage: "schema",
          message: `No schema is registered for ${schemaId}.`,
        },
      ],
    };
  }

  if (validate(value)) return { ok: true, value, diagnostics: [] };
  return { ok: false, diagnostics: (validate.errors ?? []).map(toDiagnostic) };
}
