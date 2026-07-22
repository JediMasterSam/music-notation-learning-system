import {
  multiplyRational,
  rational,
  subtractRational,
  type Diagnostic,
  type StageResult,
} from "@mnls/model";
import { createBuiltInPitchRegistry } from "@mnls/pitch";

import type { MappedPitch, PitchMappingStrategy } from "./contracts.js";
import { integerOption } from "./fixed-grid.js";
import { layoutScalar } from "./scalar.js";

function diagnostic(code: string, message: string, canonicalId: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "layout",
    message,
    canonicalId,
    requirementIds: ["R-001", "R-014", "R-031"],
  };
}

export const absoluteChromaticYV1: PitchMappingStrategy = {
  id: "mnls.pitch.absolute-chromatic-y",
  version: "1",
  mapPitch({ event, environment, options }): StageResult<MappedPitch> {
    if (event.type !== "note" || !event.exactPitchLabelSource) {
      return {
        ok: false,
        diagnostics: [
          diagnostic(
            "LAYOUT_EXACT_PITCH_REQUIRED",
            "Absolute chromatic y mapping requires exact register-bearing note pitch.",
            event.sourceId,
          ),
        ],
      };
    }
    const strategy = createBuiltInPitchRegistry().resolve(
      event.exactPitchLabelSource.strategy,
      event.exactPitchLabelSource.version,
    );
    if (!strategy) {
      return {
        ok: false,
        diagnostics: [
          diagnostic(
            "PITCH_STRATEGY_NOT_FOUND",
            "Projected pitch strategy is unavailable to layout.",
            event.sourceId,
          ),
        ],
      };
    }
    const index = strategy.semitoneIndex(event.exactPitchLabelSource);
    if (!index.ok) {
      return {
        ok: false,
        diagnostics: index.diagnostics.map((item) => ({ ...item, stage: "layout" as const })),
      };
    }
    const units = integerOption(options, "unitsPerSemitone");
    const origin = integerOption(options, "pitchOrigin");
    if (!units.ok) return units;
    if (!origin.ok) return origin;
    const y = multiplyRational(
      subtractRational(
        rational(origin.value),
        multiplyRational(rational(index.value), rational(units.value)),
      ),
      environment.scale,
    );
    return {
      ok: true,
      value: { y: layoutScalar(y), semitoneIndex: index.value },
      diagnostics: [],
    };
  },
};
