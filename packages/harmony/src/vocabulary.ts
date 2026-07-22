import type { ChordAnalysis, ChordQualityRef } from "@mnls/model";

export interface ChordQualityDefinition {
  readonly qualityId: string;
  readonly displayLabel: string;
  readonly aliases: readonly string[];
  readonly pitchClassIntervals: readonly number[];
}

export interface ChordQualityVocabulary {
  readonly formatVersion: "0.1.0";
  readonly vocabularyId: "mnls.chord-quality";
  readonly vocabularyVersion: "1.0.0";
  readonly qualities: readonly ChordQualityDefinition[];
}

export const coreChordQualityVocabulary: ChordQualityVocabulary = Object.freeze({
  formatVersion: "0.1.0",
  vocabularyId: "mnls.chord-quality",
  vocabularyVersion: "1.0.0",
  qualities: Object.freeze([
    Object.freeze({
      qualityId: "major",
      displayLabel: "",
      aliases: Object.freeze(["maj"]),
      pitchClassIntervals: Object.freeze([0, 4, 7]),
    }),
    Object.freeze({
      qualityId: "minor",
      displayLabel: "m",
      aliases: Object.freeze(["min", "m"]),
      pitchClassIntervals: Object.freeze([0, 3, 7]),
    }),
    Object.freeze({
      qualityId: "dominant-seventh",
      displayLabel: "7",
      aliases: Object.freeze(["dom7", "7"]),
      pitchClassIntervals: Object.freeze([0, 4, 7, 10]),
    }),
  ]),
});

const qualities = new Map(
  coreChordQualityVocabulary.qualities.map((quality) => [quality.qualityId, quality] as const),
);
const aliases = new Map(
  coreChordQualityVocabulary.qualities.flatMap((quality) =>
    quality.aliases.map((alias) => [alias, quality] as const),
  ),
);

export function resolveChordQuality(ref: ChordQualityRef): ChordQualityDefinition | undefined {
  if (
    ref.vocabularyId !== coreChordQualityVocabulary.vocabularyId ||
    ref.vocabularyVersion !== coreChordQualityVocabulary.vocabularyVersion
  ) {
    return undefined;
  }
  return qualities.get(ref.qualityId);
}

export function isChordQualityAlias(value: string): boolean {
  return aliases.has(value);
}

export function lookupChordQualityAlias(alias: string): ChordQualityRef | undefined {
  const quality = aliases.get(alias);
  if (!quality) return undefined;
  return {
    vocabularyId: coreChordQualityVocabulary.vocabularyId,
    vocabularyVersion: coreChordQualityVocabulary.vocabularyVersion,
    qualityId: quality.qualityId,
  };
}

export function formatChordLabel(rootLabel: string, analysis: ChordAnalysis): string | undefined {
  const quality = resolveChordQuality(analysis.quality);
  if (!quality) return undefined;
  const extension = analysis.extensions?.map(String).join("") ?? "";
  return `${rootLabel}${quality.displayLabel}${extension}`;
}
