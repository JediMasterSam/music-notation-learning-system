import {
  chordPitchClassSet,
  coreChordQualityVocabulary,
  isChordQualityAlias,
  resolveChordQuality,
} from "@mnls/harmony";
import {
  addRational,
  compareRational,
  deepFreeze,
  isNormalizedRational,
  type Arrangement,
  type CanonicalDocument,
  type ChordAnalysis,
  type Diagnostic,
  type MusicalEvent,
  type PitchEnvelope,
  type Rational,
  type StageResult,
  type TimeSpan,
} from "@mnls/model";
import {
  createBuiltInPitchRegistry,
  type PitchStrategyRegistry,
  type PitchValueKind,
} from "@mnls/pitch";

function diagnostic(
  code: string,
  message: string,
  jsonPointer: string,
  requirementIds: readonly string[],
  canonicalId?: string,
): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "semantic",
    message,
    jsonPointer,
    requirementIds,
    ...(canonicalId ? { canonicalId } : {}),
  };
}

function spanEnd(span: TimeSpan): Rational {
  return addRational(span.start.beat, span.duration.beats);
}

function validateRational(
  value: Rational,
  pointer: string,
  diagnostics: Diagnostic[],
  options: { readonly positive?: boolean; readonly nonnegative?: boolean } = {},
): void {
  if (!isNormalizedRational(value)) {
    diagnostics.push(
      diagnostic(
        "TIME_RATIONAL_NOT_NORMALIZED",
        "Rational values must use a positive denominator and lowest terms.",
        pointer,
        ["R-011"],
      ),
    );
    return;
  }
  if (options.positive && compareRational(value, { numerator: 0, denominator: 1 }) <= 0) {
    diagnostics.push(
      diagnostic("TIME_DURATION_NONPOSITIVE", "Sounding duration must be positive.", pointer, [
        "R-011",
      ]),
    );
  }
  if (options.nonnegative && compareRational(value, { numerator: 0, denominator: 1 }) < 0) {
    diagnostics.push(
      diagnostic("TIME_POSITION_NEGATIVE", "Time position cannot be negative.", pointer, ["R-011"]),
    );
  }
}

function validateChordAnalysis(
  analysis: ChordAnalysis,
  pointer: string,
  canonicalId: string,
  diagnostics: Diagnostic[],
): void {
  const quality = resolveChordQuality(analysis.quality);
  if (!quality) {
    const sameVocabulary =
      analysis.quality.vocabularyId === coreChordQualityVocabulary.vocabularyId &&
      analysis.quality.vocabularyVersion === coreChordQualityVocabulary.vocabularyVersion;
    const alias = sameVocabulary && isChordQualityAlias(analysis.quality.qualityId);
    diagnostics.push(
      diagnostic(
        alias
          ? "HARMONY_VOCAB_ALIAS_AS_ID"
          : sameVocabulary
            ? "HARMONY_VOCAB_QUALITY_UNKNOWN"
            : "HARMONY_VOCAB_NOT_FOUND",
        alias
          ? `Chord-quality alias ${analysis.quality.qualityId} cannot be canonical semantic identity.`
          : `Unknown chord-quality reference ${analysis.quality.vocabularyId}@${analysis.quality.vocabularyVersion}/${analysis.quality.qualityId}.`,
        `${pointer}/quality`,
        ["R-015", "R-018"],
        canonicalId,
      ),
    );
  }

  const extensions = new Set(analysis.extensions ?? []);
  const addedTones = new Set(analysis.addedTones ?? []);
  if (analysis.omissions && "value" in analysis.omissions) {
    for (const omitted of analysis.omissions.value) {
      if (extensions.has(omitted) || addedTones.has(omitted)) {
        diagnostics.push(
          diagnostic(
            "HARMONY_DEGREE_ADD_OMIT_CONFLICT",
            `Chord degree ${omitted} cannot be both present and omitted.`,
            pointer,
            ["R-015"],
            canonicalId,
          ),
        );
      }
    }
  }
}

function validatePitch(
  registry: PitchStrategyRegistry,
  envelope: PitchEnvelope,
  expectedKind: PitchValueKind,
  pointer: string,
  canonicalId: string,
  diagnostics: Diagnostic[],
): void {
  const strategy = registry.resolve(envelope.strategy, envelope.version);
  if (!strategy) {
    diagnostics.push(
      diagnostic(
        "PITCH_STRATEGY_NOT_FOUND",
        `Pitch strategy ${envelope.strategy}@${envelope.version} is not registered.`,
        pointer,
        ["R-006", "R-048", "R-050"],
        canonicalId,
      ),
    );
    return;
  }
  for (const pitchError of strategy.validate(envelope, expectedKind)) {
    diagnostics.push({ ...pitchError, jsonPointer: pointer, canonicalId });
  }
}

function validateEvent(
  event: MusicalEvent,
  pointer: string,
  roles: ReadonlySet<string>,
  arrangementEnd: Rational | undefined,
  pitchRegistry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
): void {
  validateRational(event.start.beat, `${pointer}/start/beat`, diagnostics, { nonnegative: true });
  validateRational(event.duration.beats, `${pointer}/duration/beats`, diagnostics, {
    positive: true,
  });

  for (const roleRef of event.roleRefs) {
    if (!roles.has(roleRef)) {
      diagnostics.push(
        diagnostic(
          "REF_ROLE_NOT_FOUND",
          `Event role reference ${roleRef} does not resolve in this arrangement.`,
          `${pointer}/roleRefs`,
          ["R-009"],
          event.id,
        ),
      );
    }
  }

  if (arrangementEnd) {
    const end = addRational(event.start.beat, event.duration.beats);
    if (compareRational(end, arrangementEnd) > 0) {
      diagnostics.push(
        diagnostic(
          "TIME_EVENT_OUTSIDE_ARRANGEMENT",
          "Event extends beyond the declared arrangement duration.",
          pointer,
          ["R-011"],
          event.id,
        ),
      );
    }
  }

  if (event.type === "note") {
    if ("value" in event.pitch) {
      validatePitch(
        pitchRegistry,
        event.pitch.value,
        "pitch",
        `${pointer}/pitch/value`,
        event.id,
        diagnostics,
      );
    }
    return;
  }
  validateChordAnalysis(event.harmony, `${pointer}/harmony`, event.id, diagnostics);
  validatePitch(
    pitchRegistry,
    event.harmony.root,
    "pitch-class",
    `${pointer}/harmony/root`,
    event.id,
    diagnostics,
  );

  if (event.inversion && "value" in event.inversion && event.inversion.value.chordDegree < 1) {
    diagnostics.push(
      diagnostic(
        "HARMONY_INVERSION_DEGREE_INVALID",
        "Inversion chord degree must be a positive controlled degree.",
        `${pointer}/inversion/value/chordDegree`,
        ["R-016"],
        event.id,
      ),
    );
  }

  if ("value" in event.voicing && Object.keys(event.voicing.value).length === 0) {
    diagnostics.push(
      diagnostic(
        "VOICING_EMPTY_VALUE",
        "A value-bearing voicing must specify at least one voicing dimension.",
        `${pointer}/voicing/value`,
        ["R-018", "R-019"],
        event.id,
      ),
    );
  }

  if (event.slashBass && "value" in event.slashBass) {
    validatePitch(
      pitchRegistry,
      event.slashBass.value,
      "pitch-class",
      `${pointer}/slashBass/value`,
      event.id,
      diagnostics,
    );
  }

  if ("value" in event.voicing) {
    const pitches = event.voicing.value.pitches;
    if (pitches && "value" in pitches) {
      for (const [pitchIndex, pitch] of pitches.value.entries()) {
        validatePitch(
          pitchRegistry,
          pitch,
          "pitch",
          `${pointer}/voicing/value/pitches/value/${pitchIndex}`,
          event.id,
          diagnostics,
        );
      }
    }
    const pitchClasses = event.voicing.value.pitchClasses;
    if (pitchClasses && "value" in pitchClasses) {
      for (const [pitchIndex, pitch] of pitchClasses.value.entries()) {
        validatePitch(
          pitchRegistry,
          pitch,
          "pitch-class",
          `${pointer}/voicing/value/pitchClasses/value/${pitchIndex}`,
          event.id,
          diagnostics,
        );
      }
    }
  }

  for (const [hintIndex, hint] of (event.hints ?? []).entries()) {
    validateChordAnalysis(
      hint.upperStructure,
      `${pointer}/hints/${hintIndex}/upperStructure`,
      hint.id,
      diagnostics,
    );
    validatePitch(
      pitchRegistry,
      hint.upperStructure.root,
      "pitch-class",
      `${pointer}/hints/${hintIndex}/upperStructure/root`,
      hint.id,
      diagnostics,
    );
    validatePitch(
      pitchRegistry,
      hint.bass,
      "pitch-class",
      `${pointer}/hints/${hintIndex}/bass`,
      hint.id,
      diagnostics,
    );
    if (hint.equivalence === "exact-pitch-class-set") {
      const parentSet = chordPitchClassSet(event.harmony, pitchRegistry);
      const upperSet = chordPitchClassSet(hint.upperStructure, pitchRegistry);
      const bassStrategy = pitchRegistry.resolve(hint.bass.strategy, hint.bass.version);
      const bass = bassStrategy?.pitchClass(hint.bass);
      if (parentSet.ok && upperSet.ok && bass?.ok) {
        const hintedSet = [...new Set([...upperSet.value, bass.value])].sort((a, b) => a - b);
        if (JSON.stringify(parentSet.value) !== JSON.stringify(hintedSet)) {
          diagnostics.push(
            diagnostic(
              "HINT_EQUIVALENCE_FALSE_EXACT",
              "Familiar-shape hint labeled exact does not match the canonical chord pitch-class set.",
              `${pointer}/hints/${hintIndex}/equivalence`,
              ["R-036", "R-037", "R-040"],
              hint.id,
            ),
          );
        }
      }
    }
    if (hint.status === "suppressed" && (hint.suppressionReasons?.length ?? 0) === 0) {
      diagnostics.push(
        diagnostic(
          "HINT_SUPPRESSION_REASON_MISSING",
          "A suppressed familiar-shape hint must record at least one reason.",
          `${pointer}/hints/${hintIndex}`,
          ["R-040"],
          hint.id,
        ),
      );
    }
  }
}

function validateArrangement(
  arrangement: Arrangement,
  pointer: string,
  songId: string,
  pitchRegistry: PitchStrategyRegistry,
  diagnostics: Diagnostic[],
): void {
  if (arrangement.songRef !== songId) {
    diagnostics.push(
      diagnostic(
        "REF_SONG_MISMATCH",
        `Arrangement ${arrangement.id} must reference the document song ${songId}.`,
        `${pointer}/songRef`,
        ["R-008"],
        arrangement.id,
      ),
    );
  }

  const roles = new Set(arrangement.roles.map(({ id }) => id));
  const events = new Map(arrangement.events.map((event) => [event.id, event] as const));
  const ideas = new Map(arrangement.ideas.map((idea) => [idea.id, idea] as const));
  const variations = new Set((arrangement.variations ?? []).map(({ id }) => id));
  const arrangementEnd = arrangement.duration?.beats;
  if (arrangementEnd)
    validateRational(arrangementEnd, `${pointer}/duration/beats`, diagnostics, { positive: true });

  for (const [index, event] of arrangement.events.entries()) {
    validateEvent(
      event,
      `${pointer}/events/${index}`,
      roles,
      arrangementEnd,
      pitchRegistry,
      diagnostics,
    );
  }

  const sortedMeasures = arrangement.measures
    .map((measure, index) => ({ measure, index }))
    .sort((left, right) => compareRational(left.measure.start.beat, right.measure.start.beat));
  for (const [order, { measure, index }] of sortedMeasures.entries()) {
    validateRational(measure.start.beat, `${pointer}/measures/${index}/start/beat`, diagnostics, {
      nonnegative: true,
    });
    validateRational(
      measure.duration.beats,
      `${pointer}/measures/${index}/duration/beats`,
      diagnostics,
      {
        positive: true,
      },
    );
    const previous = sortedMeasures[order - 1]?.measure;
    if (
      previous &&
      compareRational(
        measure.start.beat,
        addRational(previous.start.beat, previous.duration.beats),
      ) < 0
    ) {
      diagnostics.push(
        diagnostic(
          "TIME_MEASURE_OVERLAP",
          "Measure coordinate spans cannot overlap.",
          `${pointer}/measures/${index}`,
          ["R-012"],
          measure.id,
        ),
      );
    }
  }

  for (const [ideaIndex, idea] of arrangement.ideas.entries()) {
    for (const roleRef of idea.roleRefs) {
      if (!roles.has(roleRef)) {
        diagnostics.push(
          diagnostic(
            "REF_ROLE_NOT_FOUND",
            `Idea role reference ${roleRef} does not resolve.`,
            `${pointer}/ideas/${ideaIndex}/roleRefs`,
            ["R-009", "R-021"],
            idea.id,
          ),
        );
      }
    }
    for (const eventRef of idea.eventRefs) {
      const event = events.get(eventRef);
      if (!event) {
        diagnostics.push(
          diagnostic(
            "REF_EVENT_NOT_FOUND",
            `Idea event reference ${eventRef} does not resolve.`,
            `${pointer}/ideas/${ideaIndex}/eventRefs`,
            ["R-021"],
            idea.id,
          ),
        );
      } else if (
        compareRational(event.start.beat, idea.span.start.beat) < 0 ||
        compareRational(addRational(event.start.beat, event.duration.beats), spanEnd(idea.span)) > 0
      ) {
        diagnostics.push(
          diagnostic(
            "IDEA_EVENT_OUTSIDE_SPAN",
            `Event ${eventRef} lies outside idea ${idea.id}.`,
            `${pointer}/ideas/${ideaIndex}`,
            ["R-021"],
            idea.id,
          ),
        );
      }
    }
    if (idea.sourceIdeaRef && !ideas.has(idea.sourceIdeaRef)) {
      diagnostics.push(
        diagnostic(
          "REF_SOURCE_IDEA_NOT_FOUND",
          `Source idea ${idea.sourceIdeaRef} does not resolve.`,
          `${pointer}/ideas/${ideaIndex}/sourceIdeaRef`,
          ["R-013", "R-021"],
          idea.id,
        ),
      );
    }
  }

  for (const [sectionIndex, section] of arrangement.sections.entries()) {
    for (const ideaRef of section.ideaRefs) {
      if (!ideas.has(ideaRef)) {
        diagnostics.push(
          diagnostic(
            "REF_IDEA_NOT_FOUND",
            `Section idea reference ${ideaRef} does not resolve.`,
            `${pointer}/sections/${sectionIndex}/ideaRefs`,
            ["R-020"],
            section.id,
          ),
        );
      }
    }
  }

  for (const [repetitionIndex, repetition] of (arrangement.repetitions ?? []).entries()) {
    if (!ideas.has(repetition.sourceRef) && !events.has(repetition.sourceRef)) {
      diagnostics.push(
        diagnostic(
          "REPETITION_SOURCE_NOT_FOUND",
          `Repeated source ${repetition.sourceRef} does not resolve.`,
          `${pointer}/repetitions/${repetitionIndex}/sourceRef`,
          ["R-013"],
          repetition.id,
        ),
      );
    }
    for (const variationRef of repetition.variationRefs ?? []) {
      if (!variations.has(variationRef)) {
        diagnostics.push(
          diagnostic(
            "REF_VARIATION_NOT_FOUND",
            `Repetition variation ${variationRef} does not resolve.`,
            `${pointer}/repetitions/${repetitionIndex}/variationRefs`,
            ["R-013"],
            repetition.id,
          ),
        );
      }
    }
  }

  for (const [variationIndex, variation] of (arrangement.variations ?? []).entries()) {
    if (!ideas.has(variation.sourceRef) && !events.has(variation.sourceRef)) {
      diagnostics.push(
        diagnostic(
          "VARIATION_SOURCE_NOT_FOUND",
          `Variation source ${variation.sourceRef} does not resolve.`,
          `${pointer}/variations/${variationIndex}/sourceRef`,
          ["R-013"],
          variation.id,
        ),
      );
    }
    for (const [operationIndex, operation] of variation.operations.entries()) {
      if (!events.has(operation.targetEventRef)) {
        diagnostics.push(
          diagnostic(
            "VARIATION_TARGET_NOT_FOUND",
            `Variation target event ${operation.targetEventRef} does not resolve.`,
            `${pointer}/variations/${variationIndex}/operations/${operationIndex}/targetEventRef`,
            ["R-013"],
            variation.id,
          ),
        );
      }
      validateEvent(
        operation.event,
        `${pointer}/variations/${variationIndex}/operations/${operationIndex}/event`,
        roles,
        undefined,
        pitchRegistry,
        diagnostics,
      );
    }
  }
}

function collectIds(
  document: CanonicalDocument,
): readonly { readonly id: string; readonly pointer: string }[] {
  const values: { id: string; pointer: string }[] = [
    { id: document.id, pointer: "/id" },
    { id: document.song.id, pointer: "/song/id" },
  ];
  for (const [arrangementIndex, arrangement] of document.arrangements.entries()) {
    const prefix = `/arrangements/${arrangementIndex}`;
    values.push({ id: arrangement.id, pointer: `${prefix}/id` });
    for (const [collection, items] of Object.entries({
      measures: arrangement.measures,
      roles: arrangement.roles,
      sections: arrangement.sections,
      ideas: arrangement.ideas,
      events: arrangement.events,
      repetitions: arrangement.repetitions ?? [],
      variations: arrangement.variations ?? [],
      transitions: arrangement.transitions ?? [],
      handAssignments: arrangement.handAssignments ?? [],
    })) {
      for (const [index, item] of items.entries()) {
        values.push({ id: item.id, pointer: `${prefix}/${collection}/${index}/id` });
      }
    }
    for (const [variationIndex, variation] of (arrangement.variations ?? []).entries()) {
      for (const [operationIndex, operation] of variation.operations.entries()) {
        values.push({
          id: operation.event.id,
          pointer: `${prefix}/variations/${variationIndex}/operations/${operationIndex}/event/id`,
        });
      }
    }
    for (const [eventIndex, event] of arrangement.events.entries()) {
      if (event.type !== "chord") continue;
      for (const [hintIndex, hint] of (event.hints ?? []).entries()) {
        values.push({
          id: hint.id,
          pointer: `${prefix}/events/${eventIndex}/hints/${hintIndex}/id`,
        });
      }
      for (const [annotationIndex, annotation] of (event.analysisAnnotations ?? []).entries()) {
        values.push({
          id: annotation.id,
          pointer: `${prefix}/events/${eventIndex}/analysisAnnotations/${annotationIndex}/id`,
        });
      }
    }
  }
  for (const [sourceIndex, source] of (document.sourceRegister ?? []).entries()) {
    values.push({ id: source.id, pointer: `/sourceRegister/${sourceIndex}/id` });
  }
  return values;
}

export function validateCanonicalSemantics(
  document: CanonicalDocument,
  pitchRegistry: PitchStrategyRegistry = createBuiltInPitchRegistry(),
): StageResult<Readonly<CanonicalDocument>> {
  const diagnostics: Diagnostic[] = [];
  const ids = new Map<string, string>();
  for (const entry of collectIds(document)) {
    const prior = ids.get(entry.id);
    if (prior) {
      diagnostics.push(
        diagnostic(
          "ID_DUPLICATE",
          `Stable ID ${entry.id} is already declared at ${prior}.`,
          entry.pointer,
          ["R-013", "R-020", "R-021"],
          entry.id,
        ),
      );
    } else ids.set(entry.id, entry.pointer);
  }

  for (const [index, arrangement] of document.arrangements.entries()) {
    validateArrangement(
      arrangement,
      `/arrangements/${index}`,
      document.song.id,
      pitchRegistry,
      diagnostics,
    );
  }

  for (const [sourceIndex, source] of (document.sourceRegister ?? []).entries()) {
    if (!source.repositoryUsePermitted) {
      diagnostics.push(
        diagnostic(
          "SOURCE_REPOSITORY_USE_FORBIDDEN",
          "A corpus fixture must record a lawful basis for repository use.",
          `/sourceRegister/${sourceIndex}`,
          ["R-045"],
          source.id,
        ),
      );
    }
  }

  diagnostics.sort((left, right) =>
    `${left.jsonPointer ?? ""}:${left.code}`.localeCompare(
      `${right.jsonPointer ?? ""}:${right.code}`,
      "en",
    ),
  );
  if (diagnostics.length > 0) return { ok: false, diagnostics };
  return { ok: true, value: deepFreeze(document), diagnostics: [] };
}
