import type {
  ArrangementCapabilityProfile,
  CapabilityAuthority,
  CapabilityEvidence,
  CapabilityState,
  EnvironmentCapabilityProfile,
  RendererCapabilityProfile,
} from "@mnls/capabilities";
import { addRational, contentHash, type Arrangement, type CanonicalDocument } from "@mnls/model";
import { normalizedHash, type NormalizedArrangement } from "@mnls/normalizer";
import { createBuiltInPitchRegistry, type PitchStrategyRegistry } from "@mnls/pitch";

export interface RendererCapabilityDescriptor {
  readonly id: string;
  readonly version: string;
  readonly implementationHash: string;
  readonly capabilities: readonly string[];
}

export interface EnvironmentCapabilityDescriptor {
  readonly id: string;
  readonly environmentHash: string;
  readonly capabilities: readonly string[];
}

function evidence(
  capability: string,
  state: CapabilityState,
  authority: CapabilityAuthority,
  artifactId: string,
  hash: string,
  evidenceRefs: readonly string[],
  detail?: string,
): CapabilityEvidence {
  return {
    capability,
    state,
    source: { authority, artifactId, contentHash: hash },
    evidenceRefs: [...evidenceRefs].sort((left, right) => left.localeCompare(right, "en")),
    ...(detail ? { detail } : {}),
  };
}

function arrangementById(document: CanonicalDocument, id: string): Arrangement {
  const arrangement = document.arrangements.find((candidate) => candidate.id === id);
  if (!arrangement) throw new Error(`Validated document does not contain arrangement ${id}.`);
  return arrangement;
}

function gridRepresentable(
  normalized: NormalizedArrangement,
  subdivisionsPerBeat: number,
): boolean {
  return normalized.events.every(({ start, duration }) => {
    const end = addRational(start, duration);
    return (
      (start.numerator * subdivisionsPerBeat) % start.denominator === 0 &&
      (end.numerator * subdivisionsPerBeat) % end.denominator === 0
    );
  });
}

export function analyzeArrangementCapabilities(
  document: CanonicalDocument,
  normalized: NormalizedArrangement,
  pitchRegistry: PitchStrategyRegistry = createBuiltInPitchRegistry(),
): ArrangementCapabilityProfile {
  const arrangement = arrangementById(document, normalized.arrangementId);
  const canonicalHash = contentHash(document);
  const normalizedContentHash = normalizedHash(normalized);
  if (normalized.inputHash !== canonicalHash) {
    throw new Error("Normalized arrangement hash does not match the supplied canonical document.");
  }

  const eventRefs = normalized.events.map(({ sourceEventId }) => sourceEventId);
  const noteEvents = normalized.events.filter(({ semanticEvent }) => semanticEvent.type === "note");
  const chordEvents = normalized.events.filter(
    ({ semanticEvent }) => semanticEvent.type === "chord",
  );
  const exactPitches = noteEvents.filter(({ semanticEvent }) => {
    if (semanticEvent.type !== "note" || !("value" in semanticEvent.pitch)) return false;
    const strategy = pitchRegistry.resolve(
      semanticEvent.pitch.value.strategy,
      semanticEvent.pitch.value.version,
    );
    return strategy?.validate(semanticEvent.pitch.value, "pitch").length === 0;
  });
  const assignedHands = normalized.events.filter(({ handAssignments }) =>
    handAssignments.some((assignment) => "value" in assignment),
  );
  const unknownHands = normalized.events.filter(({ handAssignments }) =>
    handAssignments.some((assignment) => assignment.state === "unknown"),
  );
  const handState: CapabilityState =
    normalized.events.length === 0
      ? "absent"
      : assignedHands.length === normalized.events.length
        ? "present"
        : assignedHands.length > 0 || unknownHands.length > 0
          ? "partial"
          : "absent";

  const pitchClassComparable = chordEvents.filter(({ semanticEvent }) => {
    if (semanticEvent.type !== "chord") return false;
    const strategy = pitchRegistry.resolve(
      semanticEvent.harmony.root.strategy,
      semanticEvent.harmony.root.version,
    );
    return strategy?.pitchClass(semanticEvent.harmony.root).ok === true;
  });

  const gridCapabilities = Array.from({ length: 16 }, (_, index) => index + 1)
    .filter((subdivision) => gridRepresentable(normalized, subdivision))
    .map((subdivision) =>
      evidence(
        `time.grid-subdivision.${subdivision}`,
        "present",
        "canonical-arrangement",
        arrangement.id,
        canonicalHash,
        eventRefs,
        `All exact event onsets and ends are representable at ${subdivision} subdivision(s) per beat.`,
      ),
    );
  const capabilities = [
    evidence(
      "time.exact-onset",
      normalized.events.length > 0 ? "present" : "absent",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      eventRefs,
    ),
    evidence(
      "time.exact-duration",
      normalized.events.length > 0 ? "present" : "absent",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      eventRefs,
    ),
    evidence(
      "pitch.exact-register",
      noteEvents.length === 0
        ? "absent"
        : exactPitches.length === noteEvents.length
          ? "present"
          : exactPitches.length > 0
            ? "partial"
            : "unknown",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      exactPitches.map(({ sourceEventId }) => sourceEventId),
    ),
    evidence(
      "structure.musical-ideas",
      arrangement.ideas.length > 0 ? "present" : "absent",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      arrangement.ideas.map(({ id }) => id),
    ),
    evidence(
      "structure.sections",
      arrangement.sections.length > 0 ? "present" : "absent",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      arrangement.sections.map(({ id }) => id),
    ),
    evidence(
      "roles.assigned",
      arrangement.roles.length > 0 ? "present" : "absent",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      arrangement.roles.map(({ id }) => id),
    ),
    evidence(
      "hands.exact-assignment",
      handState,
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      arrangement.handAssignments?.map(({ id }) => id) ?? [],
      handState === "partial" ? "Some events retain unknown or absent hand assignment." : undefined,
    ),
    evidence(
      "harmony.present",
      chordEvents.length > 0 ? "present" : "absent",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      chordEvents.map(({ sourceEventId }) => sourceEventId),
    ),
    evidence(
      "pitch.pitch-class-comparison",
      chordEvents.length === 0
        ? "absent"
        : pitchClassComparable.length === chordEvents.length
          ? "present"
          : "partial",
      "canonical-arrangement",
      arrangement.id,
      canonicalHash,
      pitchClassComparable.map(({ sourceEventId }) => sourceEventId),
    ),
    ...gridCapabilities,
  ].sort((left, right) => left.capability.localeCompare(right.capability, "en"));

  return {
    formatVersion: "0.1.0",
    profileType: "arrangement",
    arrangementId: arrangement.id,
    canonicalHash,
    normalizedHash: normalizedContentHash,
    capabilities,
  };
}

export function analyzeRendererCapabilities(
  descriptor: RendererCapabilityDescriptor,
): RendererCapabilityProfile {
  return {
    formatVersion: "0.1.0",
    profileType: "renderer",
    rendererRef: { id: descriptor.id, version: descriptor.version },
    implementationHash: descriptor.implementationHash,
    capabilities: [...descriptor.capabilities]
      .sort((left, right) => left.localeCompare(right, "en"))
      .map((capability) =>
        evidence(
          capability,
          "present",
          "renderer",
          `${descriptor.id}@${descriptor.version}`,
          descriptor.implementationHash,
          [capability],
        ),
      ),
  };
}

export function analyzeEnvironmentCapabilities(
  descriptor: EnvironmentCapabilityDescriptor,
): EnvironmentCapabilityProfile {
  return {
    formatVersion: "0.1.0",
    profileType: "environment",
    environmentId: descriptor.id,
    environmentHash: descriptor.environmentHash,
    capabilities: [...descriptor.capabilities]
      .sort((left, right) => left.localeCompare(right, "en"))
      .map((capability) =>
        evidence(capability, "present", "environment", descriptor.id, descriptor.environmentHash, [
          capability,
        ]),
      ),
  };
}
