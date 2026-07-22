import type { Diagnostic, JSONValue, StageResult } from "@mnls/model";

export type OptionFieldSchema =
  | {
      readonly type: "boolean";
      readonly default?: boolean;
      readonly required?: boolean;
    }
  | {
      readonly type: "integer";
      readonly minimum?: number;
      readonly maximum?: number;
      readonly default?: number;
      readonly required?: boolean;
    }
  | {
      readonly type: "number";
      readonly minimum?: number;
      readonly maximum?: number;
      readonly default?: number;
      readonly required?: boolean;
    }
  | {
      readonly type: "string";
      readonly enum?: readonly string[];
      readonly default?: string;
      readonly required?: boolean;
    };

export interface StrategyOptionSchema {
  readonly id: string;
  readonly fields: Readonly<Record<string, OptionFieldSchema>>;
}

function diagnostic(schemaId: string, message: string): Diagnostic {
  return {
    code: "STRATEGY_OPTION_INVALID",
    severity: "error",
    stage: "recipe",
    message,
    relatedIds: [schemaId],
    requirementIds: ["R-047", "R-048", "R-050"],
  };
}

function isRecord(value: JSONValue): value is Readonly<Record<string, JSONValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function fieldValid(value: JSONValue, field: OptionFieldSchema): boolean {
  switch (field.type) {
    case "boolean":
      return typeof value === "boolean";
    case "integer":
      return (
        typeof value === "number" &&
        Number.isInteger(value) &&
        (field.minimum === undefined || value >= field.minimum) &&
        (field.maximum === undefined || value <= field.maximum)
      );
    case "number":
      return (
        typeof value === "number" &&
        Number.isFinite(value) &&
        (field.minimum === undefined || value >= field.minimum) &&
        (field.maximum === undefined || value <= field.maximum)
      );
    case "string":
      return typeof value === "string" && (field.enum === undefined || field.enum.includes(value));
  }
}

export function materializeStrategyOptions(
  schema: StrategyOptionSchema,
  input: JSONValue,
): StageResult<Readonly<Record<string, JSONValue>>> {
  if (!isRecord(input)) {
    return {
      ok: false,
      diagnostics: [diagnostic(schema.id, `Options for ${schema.id} must be a JSON object.`)],
    };
  }
  const unknown = Object.keys(input).filter((key) => !(key in schema.fields));
  if (unknown.length > 0) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          schema.id,
          `Options for ${schema.id} contain unknown field(s): ${unknown.sort().join(", ")}.`,
        ),
      ],
    };
  }
  const materialized: Record<string, JSONValue> = {};
  const diagnostics: Diagnostic[] = [];
  for (const [key, field] of Object.entries(schema.fields).sort(([left], [right]) =>
    left.localeCompare(right, "en"),
  )) {
    const supplied = input[key];
    if (supplied !== undefined) {
      if (fieldValid(supplied, field)) materialized[key] = supplied;
      else diagnostics.push(diagnostic(schema.id, `Option ${key} is invalid for ${schema.id}.`));
    } else if (field.default !== undefined) {
      materialized[key] = field.default;
    } else if (field.required) {
      diagnostics.push(diagnostic(schema.id, `Option ${key} is required for ${schema.id}.`));
    }
  }
  return diagnostics.length > 0
    ? { ok: false, diagnostics }
    : { ok: true, value: materialized, diagnostics: [] };
}
