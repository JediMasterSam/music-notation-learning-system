import type { Diagnostic, PitchEnvelope, StageResult } from "@mnls/model";

export type PitchValueKind = "pitch" | "pitch-class";

export interface SemanticInterval {
  readonly semitones: number;
}

export interface PitchStrategy {
  readonly id: string;
  readonly version: string;
  validate(envelope: PitchEnvelope, expectedKind: PitchValueKind): readonly Diagnostic[];
  kind(envelope: PitchEnvelope): StageResult<PitchValueKind>;
  semitoneIndex(envelope: PitchEnvelope): StageResult<number>;
  pitchClass(envelope: PitchEnvelope): StageResult<number>;
  transpose(envelope: PitchEnvelope, interval: SemanticInterval): StageResult<PitchEnvelope>;
  format(envelope: PitchEnvelope): StageResult<string>;
  equals(left: PitchEnvelope, right: PitchEnvelope): StageResult<boolean>;
}

export class PitchStrategyRegistry {
  readonly #strategies = new Map<string, PitchStrategy>();

  register(strategy: PitchStrategy): void {
    const key = `${strategy.id}@${strategy.version}`;
    if (this.#strategies.has(key)) throw new Error(`Pitch strategy ${key} is already registered.`);
    this.#strategies.set(key, strategy);
  }

  resolve(id: string, version: string): PitchStrategy | undefined {
    return this.#strategies.get(`${id}@${version}`);
  }

  list(): readonly PitchStrategy[] {
    return [...this.#strategies.values()].sort((left, right) =>
      `${left.id}@${left.version}`.localeCompare(`${right.id}@${right.version}`, "en"),
    );
  }
}
