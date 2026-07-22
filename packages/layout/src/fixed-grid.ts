import {
  addRational,
  multiplyRational,
  rational,
  subtractRational,
  type Diagnostic,
  type JSONValue,
  type StageResult,
} from "@mnls/model";

import type {
  DurationEncodingStrategy,
  DurationGeometry,
  MappedTime,
  TimeMappingStrategy,
} from "./contracts.js";
import { layoutScalar } from "./scalar.js";

function diagnostic(code: string, message: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "layout",
    message,
    requirementIds: ["R-001", "R-002", "R-031", "R-053"],
  };
}

function integerOption(
  options: Readonly<Record<string, JSONValue>>,
  name: string,
): StageResult<number> {
  const value = options[name];
  return typeof value === "number" && Number.isSafeInteger(value)
    ? { ok: true, value, diagnostics: [] }
    : {
        ok: false,
        diagnostics: [
          diagnostic("LAYOUT_OPTION_INVALID", `Resolved option ${name} must be a safe integer.`),
        ],
      };
}

export const fixedBeatGridV1: TimeMappingStrategy = {
  id: "mnls.time.fixed-beat-grid",
  version: "1",
  mapTime({ extentStart, time, environment, options }): StageResult<MappedTime> {
    const subdivisions = integerOption(options, "subdivisionsPerBeat");
    const unitsPerCell = integerOption(options, "unitsPerCell");
    const originX = integerOption(options, "originX");
    if (!subdivisions.ok) return subdivisions;
    if (!unitsPerCell.ok) return unitsPerCell;
    if (!originX.ok) return originX;
    const relative = subtractRational(time, extentStart);
    const cell = multiplyRational(relative, rational(subdivisions.value));
    if (cell.denominator !== 1) {
      return {
        ok: false,
        diagnostics: [
          diagnostic(
            "TIME_GRID_RESOLUTION_INSUFFICIENT",
            `Time ${time.numerator}/${time.denominator} does not land on a ${subdivisions.value}-part beat grid.`,
          ),
        ],
      };
    }
    const x = multiplyRational(
      addRational(rational(originX.value), multiplyRational(cell, rational(unitsPerCell.value))),
      environment.scale,
    );
    return {
      ok: true,
      value: { x: layoutScalar(x), referenceCellId: `grid-cell.${cell.numerator}` },
      diagnostics: [],
    };
  },
};

export const gridSpanV1: DurationEncodingStrategy = {
  id: "mnls.duration.grid-span",
  version: "1",
  encodeDuration(input): StageResult<DurationGeometry> {
    const mappedEnd = input.timeMapper.mapTime({
      extentStart: input.extentStart,
      time: addRational(input.start, input.duration),
      environment: input.environment,
      options: input.timeOptions,
    });
    if (!mappedEnd.ok) return mappedEnd;
    const minimumHitWidth = integerOption(input.options, "minimumHitWidth");
    if (!minimumHitWidth.ok) return minimumHitWidth;
    const semanticWidth = subtractRational(mappedEnd.value.x.exact, input.mappedStart.x.exact);
    const minimum = multiplyRational(rational(minimumHitWidth.value), input.environment.scale);
    const visibleEnd =
      semanticWidth.numerator * minimum.denominator < minimum.numerator * semanticWidth.denominator
        ? addRational(input.mappedStart.x.exact, minimum)
        : mappedEnd.value.x.exact;
    return {
      ok: true,
      value: {
        semanticEndX: mappedEnd.value.x,
        visibleStartX: input.mappedStart.x,
        visibleEndX: layoutScalar(visibleEnd),
      },
      diagnostics: [],
    };
  },
};

export { integerOption };
