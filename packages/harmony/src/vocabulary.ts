import type { ChordAnalysis, ChordQualityRef, Diagnostic, StageResult } from "@mnls/model";
import type { PitchStrategyRegistry } from "@mnls/pitch";

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

export function chordPitchClassSet(
  analysis: ChordAnalysis,
  pitchRegistry: PitchStrategyRegistry,
): StageResult<readonly number[]> {
  const strategy = pitchRegistry.resolve(analysis.root.strategy, analysis.root.version);
  if (!strategy) {
    return {
      ok: false,
      diagnostics: [
        {
          code: "PITCH_STRATEGY_NOT_FOUND",
          severity: "error",
          stage: "semantic",
          message: `Pitch strategy ${analysis.root.strategy}@${analysis.root.version} is not registered.`,
          requirementIds: ["R-015", "R-048"],
        },
      ],
    };
  }
  const root = strategy.pitchClass(analysis.root);
  if (!root.ok) return root;
  const quality = resolveChordQuality(analysis.quality);
  if (!quality) {
    const diagnostics: readonly Diagnostic[] = [
      {
        code: "HARMONY_VOCAB_QUALITY_UNKNOWN",
        severity: "error",
        stage: "semantic",
        message: "Chord pitch-class comparison requires a registered quality.",
        requirementIds: ["R-015"],
      },
    ];
    return { ok: false, diagnostics };
  }

  const intervals = new Set(quality.pitchClassIntervals);
  for (const extension of analysis.extensions ?? []) {
    if (extension === 7) intervals.add(10);
  }
  const addedToneIntervals: Readonly<Record<number, number>> = {
    2: 2,
    4: 5,
    6: 9,
    9: 2,
    11: 5,
    13: 9,
  };
  for (const addedTone of analysis.addedTones ?? []) {
    const semitones = addedToneIntervals[addedTone];
    if (semitones !== undefined) intervals.add(semitones);
  }
  if (analysis.omissions && "value" in analysis.omissions) {
    const degreeIntervals: Readonly<Record<number, number>> = {
      1: 0,
      3: quality.pitchClassIntervals[1] ?? 4,
      5: 7,
      7: 10,
    };
    for (const omitted of analysis.omissions.value) {
      const semitones = degreeIntervals[omitted];
      if (semitones !== undefined) intervals.delete(semitones);
    }
  }
  return {
    ok: true,
    value: [...intervals].map((interval) => (root.value + interval) % 12).sort((a, b) => a - b),
    diagnostics: [],
  };
}
