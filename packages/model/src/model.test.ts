import { describe, expect, it } from "vitest";

import {
  addRational,
  canonicalStringify,
  compareRational,
  contentHash,
  deepFreeze,
  isNormalizedRational,
  multiplyRational,
  rational,
  subtractRational,
} from "./index.js";

describe("exact rational primitives", () => {
  it("normalizes and composes without floating-point drift", () => {
    expect(rational(2, 4)).toEqual({ numerator: 1, denominator: 2 });
    expect(addRational(rational(1, 3), rational(1, 6))).toEqual(rational(1, 2));
    expect(subtractRational(rational(3, 2), rational(1, 2))).toEqual(rational(1));
    expect(multiplyRational(rational(2, 3), rational(3, 4))).toEqual(rational(1, 2));
    expect(compareRational(rational(1, 2), rational(2, 3))).toBeLessThan(0);
    expect(isNormalizedRational({ numerator: 2, denominator: 4 })).toBe(false);
  });

  it("rejects invalid primitive construction", () => {
    expect(() => rational(1, 0)).toThrow(RangeError);
    expect(() => rational(Number.MAX_VALUE, 1)).toThrow(TypeError);
  });
});

describe("canonical serialization", () => {
  it("sorts object keys, preserves array order, and hashes deterministically", () => {
    const first = { z: 1, a: { y: 2, x: [3, 1] } };
    const second = { a: { x: [3, 1], y: 2 }, z: 1 };
    expect(canonicalStringify(first)).toBe(canonicalStringify(second));
    expect(contentHash(first)).toBe(contentHash(second));
    expect(contentHash(first)).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("deep-freezes canonical object graphs", () => {
    const value = deepFreeze({ nested: { values: [1, 2] } });
    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.nested)).toBe(true);
    expect(Object.isFrozen(value.nested.values)).toBe(true);
  });
});
