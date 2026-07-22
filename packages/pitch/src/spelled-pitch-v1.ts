import type { Diagnostic, JSONValue, PitchEnvelope, StageResult } from "@mnls/model";

import { PitchStrategyRegistry } from "./contracts.js";
import type { PitchStrategy, PitchValueKind } from "./contracts.js";

export type SpelledStep = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface SpelledPitchValue {
  readonly step: SpelledStep;
  readonly alter: number;
  readonly octave?: number;
}

const naturalPitchClass: Readonly<Record<SpelledStep, number>> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const sharpSpellings = [
  { step: "C", alter: 0 },
  { step: "C", alter: 1 },
  { step: "D", alter: 0 },
  { step: "D", alter: 1 },
  { step: "E", alter: 0 },
  { step: "F", alter: 0 },
  { step: "F", alter: 1 },
  { step: "G", alter: 0 },
  { step: "G", alter: 1 },
  { step: "A", alter: 0 },
  { step: "A", alter: 1 },
  { step: "B", alter: 0 },
] as const satisfies readonly { readonly step: SpelledStep; readonly alter: number }[];

function pitchDiagnostic(code: string, message: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "semantic",
    message,
    requirementIds: ["R-006", "R-014", "R-050"],
  };
}

function payload(envelope: PitchEnvelope): StageResult<SpelledPitchValue> {
  if (envelope.strategy !== "spelled-pitch" || envelope.version !== "1") {
    return {
      ok: false,
      diagnostics: [
        pitchDiagnostic(
          "PITCH_STRATEGY_MISMATCH",
          `Expected spelled-pitch@1, received ${envelope.strategy}@${envelope.version}.`,
        ),
      ],
    };
  }
  if (
    envelope.value === null ||
    Array.isArray(envelope.value) ||
    typeof envelope.value !== "object"
  ) {
    return {
      ok: false,
      diagnostics: [
        pitchDiagnostic("PITCH_PAYLOAD_INVALID", "Spelled pitch payload must be an object."),
      ],
    };
  }
  const record = envelope.value as Readonly<Record<string, JSONValue>>;
  const keys = Object.keys(record).sort();
  const allowed = record.octave === undefined ? ["alter", "step"] : ["alter", "octave", "step"];
  if (
    !allowed.every((key, index) => keys[index] === key) ||
    keys.length !== allowed.length ||
    !Object.hasOwn(naturalPitchClass, String(record.step)) ||
    !Number.isInteger(record.alter) ||
    Number(record.alter) < -2 ||
    Number(record.alter) > 2 ||
    (record.octave !== undefined &&
      (!Number.isInteger(record.octave) || Number(record.octave) < -1 || Number(record.octave) > 9))
  ) {
    return {
      ok: false,
      diagnostics: [
        pitchDiagnostic(
          "PITCH_PAYLOAD_INVALID",
          "Spelled pitch requires step A-G, alteration -2..2, and optional integer octave -1..9.",
        ),
      ],
    };
  }
  return {
    ok: true,
    value: {
      step: record.step as SpelledStep,
      alter: Number(record.alter),
      ...(record.octave === undefined ? {} : { octave: Number(record.octave) }),
    },
    diagnostics: [],
  };
}

function pitchClassOf(value: SpelledPitchValue): number {
  return (((naturalPitchClass[value.step] + value.alter) % 12) + 12) % 12;
}

function accidental(alter: number): string {
  if (alter === 0) return "";
  return alter > 0 ? "#".repeat(alter) : "b".repeat(Math.abs(alter));
}

export const spelledPitchV1: PitchStrategy = {
  id: "spelled-pitch",
  version: "1",

  validate(envelope, expectedKind) {
    const parsed = payload(envelope);
    if (!parsed.ok) return parsed.diagnostics;
    const actualKind: PitchValueKind = parsed.value.octave === undefined ? "pitch-class" : "pitch";
    return actualKind === expectedKind
      ? []
      : [
          pitchDiagnostic(
            "PITCH_KIND_MISMATCH",
            `Expected ${expectedKind}, received ${actualKind} spelled-pitch payload.`,
          ),
        ];
  },

  kind(envelope) {
    const parsed = payload(envelope);
    if (!parsed.ok) return parsed;
    return {
      ok: true,
      value: parsed.value.octave === undefined ? "pitch-class" : "pitch",
      diagnostics: [],
    };
  },

  semitoneIndex(envelope) {
    const parsed = payload(envelope);
    if (!parsed.ok) return parsed;
    if (parsed.value.octave === undefined) {
      return {
        ok: false,
        diagnostics: [
          pitchDiagnostic(
            "PITCH_REGISTER_REQUIRED",
            "Register-bearing semitone index requires a spelled pitch octave.",
          ),
        ],
      };
    }
    return {
      ok: true,
      value: (parsed.value.octave + 1) * 12 + pitchClassOf(parsed.value),
      diagnostics: [],
    };
  },

  pitchClass(envelope) {
    const parsed = payload(envelope);
    return parsed.ok ? { ok: true, value: pitchClassOf(parsed.value), diagnostics: [] } : parsed;
  },

  transpose(envelope, interval) {
    const parsed = payload(envelope);
    if (!parsed.ok) return parsed;
    if (!Number.isSafeInteger(interval.semitones)) {
      return {
        ok: false,
        diagnostics: [
          pitchDiagnostic(
            "PITCH_INTERVAL_INVALID",
            "Semantic interval semitones must be a safe integer.",
          ),
        ],
      };
    }
    if (interval.semitones === 0) return { ok: true, value: envelope, diagnostics: [] };

    const sourceIndex =
      parsed.value.octave === undefined
        ? pitchClassOf(parsed.value)
        : (parsed.value.octave + 1) * 12 + pitchClassOf(parsed.value);
    const targetIndex = sourceIndex + interval.semitones;
    const targetClass = ((targetIndex % 12) + 12) % 12;
    const spelling = sharpSpellings[targetClass]!;
    const value: SpelledPitchValue =
      parsed.value.octave === undefined
        ? spelling
        : { ...spelling, octave: Math.floor(targetIndex / 12) - 1 };
    return {
      ok: true,
      value: { strategy: this.id, version: this.version, value: value as unknown as JSONValue },
      diagnostics: [],
    };
  },

  format(envelope) {
    const parsed = payload(envelope);
    if (!parsed.ok) return parsed;
    return {
      ok: true,
      value: `${parsed.value.step}${accidental(parsed.value.alter)}${parsed.value.octave ?? ""}`,
      diagnostics: [],
    };
  },

  equals(left, right) {
    const leftKind = this.kind(left);
    const rightKind = this.kind(right);
    if (!leftKind.ok) return leftKind;
    if (!rightKind.ok) return rightKind;
    if (leftKind.value !== rightKind.value) return { ok: true, value: false, diagnostics: [] };
    const leftIndex = leftKind.value === "pitch" ? this.semitoneIndex(left) : this.pitchClass(left);
    const rightIndex =
      rightKind.value === "pitch" ? this.semitoneIndex(right) : this.pitchClass(right);
    if (!leftIndex.ok) return leftIndex;
    if (!rightIndex.ok) return rightIndex;
    return { ok: true, value: leftIndex.value === rightIndex.value, diagnostics: [] };
  },
};

export function createBuiltInPitchRegistry(): PitchStrategyRegistry {
  const registry = new PitchStrategyRegistry();
  registry.register(spelledPitchV1);
  return registry;
}
