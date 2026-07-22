import { readFileSync } from "node:fs";

export const fixtureNames = [
  "melody-spatial-a",
  "melody-learning-b",
  "harmony-grid-c",
  "contract-voicing-hints",
] as const;

export type FixtureName = (typeof fixtureNames)[number];

export function fixtureUrl(name: FixtureName): URL {
  return new URL(`../../../corpus/fixtures/${name}/canonical.json`, import.meta.url);
}

export function loadFixture(name: FixtureName): unknown {
  return JSON.parse(readFileSync(fixtureUrl(name), "utf8")) as unknown;
}
