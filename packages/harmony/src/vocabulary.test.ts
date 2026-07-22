import { describe, expect, it } from "vitest";

import type { ChordAnalysis, ChordQualityRef } from "@mnls/model";

import {
  coreChordQualityVocabulary,
  formatChordLabel,
  lookupChordQualityAlias,
  resolveChordQuality,
} from "./index.js";

const minorRef: ChordQualityRef = {
  vocabularyId: "mnls.chord-quality",
  vocabularyVersion: "1.0.0",
  qualityId: "minor",
};

describe("controlled chord-quality vocabulary", () => {
  it("resolves only pinned semantic IDs", () => {
    expect(resolveChordQuality(minorRef)?.pitchClassIntervals).toEqual([0, 3, 7]);
    expect(resolveChordQuality({ ...minorRef, qualityId: "m" })).toBeUndefined();
    expect(resolveChordQuality({ ...minorRef, vocabularyVersion: "2.0.0" })).toBeUndefined();
  });

  it("keeps aliases authoring-only and derives display labels", () => {
    expect(lookupChordQualityAlias("m")).toEqual(minorRef);
    const analysis: ChordAnalysis = {
      root: { strategy: "spelled-pitch", version: "1", value: { step: "A", alter: 0 } },
      quality: minorRef,
      extensions: [7],
    };
    expect(formatChordLabel("A", analysis)).toBe("Am7");
  });

  it("keeps the initial shared vocabulary deliberately small", () => {
    expect(coreChordQualityVocabulary.qualities.map(({ qualityId }) => qualityId)).toEqual([
      "major",
      "minor",
      "dominant-seventh",
    ]);
  });
});
