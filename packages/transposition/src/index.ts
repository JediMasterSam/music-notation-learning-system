import {
  contentHash,
  deepFreeze,
  type Arrangement,
  type CanonicalDocument,
  type ChordAnalysis,
  type ChordEvent,
  type Diagnostic,
  type FamiliarShapeHint,
  type MusicalEvent,
  type PitchEnvelope,
  type SpecificValue,
  type StageResult,
  type Voicing,
} from "@mnls/model";
import {
  createBuiltInPitchRegistry,
  type PitchStrategyRegistry,
  type SemanticInterval,
} from "@mnls/pitch";

export interface TranspositionResult {
  readonly document: Readonly<CanonicalDocument>;
  readonly interval: SemanticInterval;
  readonly sourceHash: string;
  readonly outputHash: string;
}

function mapSpecific<T, U>(value: SpecificValue<T>, map: (child: T) => U): SpecificValue<U> {
  return "value" in value ? { state: value.state, value: map(value.value) } : value;
}

function transposeCanonicalPitch(
  pitch: PitchEnvelope,
  interval: SemanticInterval,
  registry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
  canonicalId: string,
): PitchEnvelope {
  const strategy = registry.resolve(pitch.strategy, pitch.version);
  if (!strategy) {
    diagnostics.push({
      code: "PITCH_STRATEGY_NOT_FOUND",
      severity: "error",
      stage: "transpose",
      message: `Pitch strategy ${pitch.strategy}@${pitch.version} is not registered.`,
      canonicalId,
      requirementIds: ["R-014", "R-048", "R-050"],
    });
    return pitch;
  }
  const result = strategy.transpose(pitch, interval);
  if (result.ok) return result.value;
  diagnostics.push(
    ...result.diagnostics.map((item) => ({ ...item, stage: "transpose" as const, canonicalId })),
  );
  return pitch;
}

function transposeAnalysis(
  analysis: ChordAnalysis,
  interval: SemanticInterval,
  registry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
  canonicalId: string,
): ChordAnalysis {
  return {
    ...analysis,
    root: transposeCanonicalPitch(analysis.root, interval, registry, diagnostics, canonicalId),
  };
}

function transposeVoicing(
  voicing: Voicing,
  interval: SemanticInterval,
  registry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
  canonicalId: string,
): Voicing {
  return {
    ...voicing,
    ...(voicing.pitches
      ? {
          pitches: mapSpecific(voicing.pitches, (pitches) =>
            pitches.map((pitch) =>
              transposeCanonicalPitch(pitch, interval, registry, diagnostics, canonicalId),
            ),
          ),
        }
      : {}),
    ...(voicing.pitchClasses
      ? {
          pitchClasses: mapSpecific(voicing.pitchClasses, (pitches) =>
            pitches.map((pitch) =>
              transposeCanonicalPitch(pitch, interval, registry, diagnostics, canonicalId),
            ),
          ),
        }
      : {}),
  };
}

function transposeHint(
  hint: FamiliarShapeHint,
  interval: SemanticInterval,
  registry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
): FamiliarShapeHint {
  return {
    ...hint,
    upperStructure: transposeAnalysis(
      hint.upperStructure,
      interval,
      registry,
      diagnostics,
      hint.id,
    ),
    bass: transposeCanonicalPitch(hint.bass, interval, registry, diagnostics, hint.id),
  };
}

function transposeEvent(
  event: MusicalEvent,
  interval: SemanticInterval,
  registry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
): MusicalEvent {
  if (event.type === "note") {
    return {
      ...event,
      pitch: mapSpecific(event.pitch, (pitch) =>
        transposeCanonicalPitch(pitch, interval, registry, diagnostics, event.id),
      ),
    };
  }

  const chord: ChordEvent = {
    ...event,
    harmony: transposeAnalysis(event.harmony, interval, registry, diagnostics, event.id),
    voicing: mapSpecific(event.voicing, (voicing) =>
      transposeVoicing(voicing, interval, registry, diagnostics, event.id),
    ),
    ...(event.slashBass
      ? {
          slashBass: mapSpecific(event.slashBass, (bass) =>
            transposeCanonicalPitch(bass, interval, registry, diagnostics, event.id),
          ),
        }
      : {}),
    ...(event.hints
      ? {
          hints: event.hints.map((hint) => transposeHint(hint, interval, registry, diagnostics)),
        }
      : {}),
    ...(event.analysisAnnotations ? { analysisAnnotations: event.analysisAnnotations } : {}),
  };
  return chord;
}

function transposeArrangement(
  arrangement: Arrangement,
  interval: SemanticInterval,
  registry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
): Arrangement {
  return {
    ...arrangement,
    events: arrangement.events.map((event) =>
      transposeEvent(event, interval, registry, diagnostics),
    ),
    ...(arrangement.variations
      ? {
          variations: arrangement.variations.map((variation) => ({
            ...variation,
            operations: variation.operations.map((operation) => ({
              ...operation,
              event: transposeEvent(operation.event, interval, registry, diagnostics),
            })),
          })),
        }
      : {}),
  };
}

export function transposeCanonicalDocument(
  document: CanonicalDocument,
  interval: SemanticInterval,
  registry: PitchStrategyRegistry = createBuiltInPitchRegistry(),
): StageResult<TranspositionResult> {
  const diagnostics: Diagnostic[] = [];
  const sourceHash = contentHash(document);
  const transposed: CanonicalDocument = {
    ...document,
    arrangements: document.arrangements.map((arrangement) =>
      transposeArrangement(arrangement, interval, registry, diagnostics),
    ),
  };
  if (diagnostics.length > 0) return { ok: false, diagnostics };
  const frozen = deepFreeze(transposed);
  return {
    ok: true,
    value: {
      document: frozen,
      interval,
      sourceHash,
      outputHash: contentHash(frozen),
    },
    diagnostics: [],
  };
}
