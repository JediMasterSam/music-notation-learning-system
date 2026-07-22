import {
  addRational,
  multiplyRational,
  rational,
  subtractRational,
  type StageResult,
} from "@mnls/model";

import type {
  DurationEncodingStrategy,
  DurationGeometry,
  MappedTime,
  TimeMappingStrategy,
} from "./contracts.js";
import { integerOption } from "./fixed-grid.js";
import { layoutScalar } from "./scalar.js";

export const proportionalTimeV1: TimeMappingStrategy = {
  id: "mnls.time.proportional",
  version: "1",
  mapTime({ extentStart, time, environment, options }): StageResult<MappedTime> {
    const unitsPerBeat = integerOption(options, "unitsPerBeat");
    const originX = integerOption(options, "originX");
    if (!unitsPerBeat.ok) return unitsPerBeat;
    if (!originX.ok) return originX;
    const relative = subtractRational(time, extentStart);
    const x = multiplyRational(
      addRational(
        rational(originX.value),
        multiplyRational(relative, rational(unitsPerBeat.value)),
      ),
      environment.scale,
    );
    return { ok: true, value: { x: layoutScalar(x) }, diagnostics: [] };
  },
};

export const proportionalExtentV1: DurationEncodingStrategy = {
  id: "mnls.duration.proportional-extent",
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
