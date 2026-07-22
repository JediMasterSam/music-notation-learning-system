import type { Rational } from "./types.js";

function gcd(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

export function rational(numerator: number, denominator = 1): Rational {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
    throw new TypeError("Rational values must be safe integers.");
  }
  if (denominator === 0) throw new RangeError("Rational denominator must be positive.");
  const sign = denominator < 0 ? -1 : 1;
  const divisor = gcd(numerator, denominator);
  return Object.freeze({
    numerator: (sign * numerator) / divisor,
    denominator: Math.abs(denominator) / divisor,
  });
}

export function isNormalizedRational(value: Rational): boolean {
  return (
    Number.isSafeInteger(value.numerator) &&
    Number.isSafeInteger(value.denominator) &&
    value.denominator > 0 &&
    gcd(value.numerator, value.denominator) === 1
  );
}

export function addRational(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function subtractRational(left: Rational, right: Rational): Rational {
  return rational(
    left.numerator * right.denominator - right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function multiplyRational(left: Rational, right: Rational): Rational {
  return rational(left.numerator * right.numerator, left.denominator * right.denominator);
}

export function compareRational(left: Rational, right: Rational): number {
  return Math.sign(left.numerator * right.denominator - right.numerator * left.denominator);
}

export function rationalToNumber(value: Rational): number {
  return value.numerator / value.denominator;
}

export function rationalKey(value: Rational): string {
  return `${value.numerator}/${value.denominator}`;
}
