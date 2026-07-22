import { describe, expect, it } from "vitest";

import type { JSONValue, PitchEnvelope } from "@mnls/model";

import {
  createBuiltInPitchRegistry,
  PitchStrategyRegistry,
  spelledPitchV1,
  type PitchStrategy,
} from "./index.js";

function pitch(step: string, alter: number, octave?: number): PitchEnvelope {
  return {
    strategy: "spelled-pitch",
    version: "1",
    value: { step, alter, ...(octave === undefined ? {} : { octave }) } as JSONValue,
  };
}

describe("spelled-pitch@1 conformance", () => {
  it("validates pitch and pitch-class kinds independently", () => {
    expect(spelledPitchV1.validate(pitch("C", 0, 4), "pitch")).toEqual([]);
    expect(spelledPitchV1.validate(pitch("C", 0), "pitch-class")).toEqual([]);
    expect(spelledPitchV1.validate(pitch("C", 0), "pitch")[0]?.code).toBe("PITCH_KIND_MISMATCH");
    expect(spelledPitchV1.validate(pitch("H", 0, 4), "pitch")[0]?.code).toBe(
      "PITCH_PAYLOAD_INVALID",
    );
  });

  it("calculates deterministic semantic indexes and labels", () => {
    expect(spelledPitchV1.semitoneIndex(pitch("C", 0, 4))).toMatchObject({ ok: true, value: 60 });
    expect(spelledPitchV1.pitchClass(pitch("A", 0))).toMatchObject({ ok: true, value: 9 });
    expect(spelledPitchV1.format(pitch("F", 1, 4))).toMatchObject({ ok: true, value: "F#4" });
  });

  it("supports identity, inverse, equality, and interval composition", () => {
    const source = pitch("C", 0, 4);
    const identity = spelledPitchV1.transpose(source, { semitones: 0 });
    expect(identity).toMatchObject({ ok: true, value: source });

    const up = spelledPitchV1.transpose(source, { semitones: 2 });
    expect(up).toMatchObject({ ok: true });
    if (!up.ok) return;
    expect(spelledPitchV1.format(up.value)).toMatchObject({ ok: true, value: "D4" });
    const restored = spelledPitchV1.transpose(up.value, { semitones: -2 });
    expect(restored).toMatchObject({ ok: true });
    if (restored.ok)
      expect(spelledPitchV1.equals(source, restored.value)).toMatchObject({
        ok: true,
        value: true,
      });

    const twice = spelledPitchV1.transpose(source, { semitones: 4 });
    const firstStep = spelledPitchV1.transpose(source, { semitones: 2 });
    expect(firstStep.ok).toBe(true);
    if (firstStep.ok) {
      const secondStep = spelledPitchV1.transpose(firstStep.value, { semitones: 2 });
      expect(
        twice.ok && secondStep.ok && spelledPitchV1.equals(twice.value, secondStep.value),
      ).toMatchObject({
        ok: true,
        value: true,
      });
    }
  });

  it("keeps registry replacement explicit and deterministic", () => {
    const registry = createBuiltInPitchRegistry();
    const testStrategy: PitchStrategy = { ...spelledPitchV1, id: "test-pitch", version: "1" };
    registry.register(testStrategy);
    expect(registry.list().map(({ id }) => id)).toEqual(["spelled-pitch", "test-pitch"]);
    expect(registry.resolve("spelled-pitch", "2")).toBeUndefined();
    expect(() => registry.register(spelledPitchV1)).toThrow(/already registered/);
    expect(new PitchStrategyRegistry().list()).toEqual([]);
  });
});
