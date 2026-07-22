import { rational, type Rational } from "@mnls/model";

export interface LayoutScalar {
  readonly exact: Rational;
  readonly decimal: string;
  readonly roundingVersion: "mnls.decimal@1";
}

function terminatingDecimal(value: Rational): string | undefined {
  let denominator = value.denominator;
  let twos = 0;
  let fives = 0;
  while (denominator % 2 === 0) {
    denominator /= 2;
    twos += 1;
  }
  while (denominator % 5 === 0) {
    denominator /= 5;
    fives += 1;
  }
  if (denominator !== 1) return undefined;
  const places = Math.max(twos, fives);
  const scaled =
    BigInt(value.numerator) * 2n ** BigInt(places - twos) * 5n ** BigInt(places - fives);
  const negative = scaled < 0n;
  const digits = (negative ? -scaled : scaled).toString().padStart(places + 1, "0");
  if (places === 0) return `${negative ? "-" : ""}${digits}`;
  const integer = digits.slice(0, -places) || "0";
  const fraction = digits.slice(-places).replace(/0+$/, "");
  return `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`;
}

function roundedDecimal(value: Rational): string {
  const places = 6;
  const scale = 10n ** BigInt(places);
  const numerator = BigInt(value.numerator);
  const denominator = BigInt(value.denominator);
  const negative = numerator < 0n;
  const absolute = negative ? -numerator : numerator;
  let quotient = (absolute * scale) / denominator;
  const remainder = (absolute * scale) % denominator;
  if (remainder * 2n >= denominator) quotient += 1n;
  const digits = quotient.toString().padStart(places + 1, "0");
  const integer = digits.slice(0, -places) || "0";
  const fraction = digits.slice(-places).replace(/0+$/, "");
  return `${negative ? "-" : ""}${integer}${fraction ? `.${fraction}` : ""}`;
}

export function canonicalDecimal(value: Rational): string {
  return terminatingDecimal(value) ?? roundedDecimal(value);
}

export function layoutScalar(value: Rational): LayoutScalar {
  const exact = rational(value.numerator, value.denominator);
  return { exact, decimal: canonicalDecimal(exact), roundingVersion: "mnls.decimal@1" };
}
