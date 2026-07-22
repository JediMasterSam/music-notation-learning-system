import { describe, expect, it } from "vitest";

import { contentHash, type CanonicalDocument, type ChordEvent, type NoteEvent } from "@mnls/model";
import { spelledPitchV1 } from "@mnls/pitch";
import { loadFixture } from "@mnls/test-fixtures";
import type { FixtureName } from "@mnls/test-fixtures";
import { validateCanonicalSemantics } from "@mnls/validator";

import { transposeCanonicalDocument } from "./index.js";

function fixture(name: FixtureName): CanonicalDocument {
  return loadFixture(name) as CanonicalDocument;
}

function semanticSkeleton(document: CanonicalDocument): unknown {
  return document.arrangements.map((arrangement) => ({
    id: arrangement.id,
    measures: arrangement.measures,
    roles: arrangement.roles,
    sections: arrangement.sections,
    ideas: arrangement.ideas,
    repetitions: arrangement.repetitions,
    eventTiming: arrangement.events.map(({ id, start, duration, roleRefs }) => ({
      id,
      start,
      duration,
      roleRefs,
    })),
  }));
}

describe("canonical semantic transposition", () => {
  it("transposes M-A by a major second without mutating source structure", () => {
    const source = fixture("melody-spatial-a");
    const sourceHash = contentHash(source);
    const result = transposeCanonicalDocument(source, { semitones: 2 });
    expect(result.ok, JSON.stringify(result.diagnostics)).toBe(true);
    if (!result.ok) return;
    expect(result.value.sourceHash).toBe(sourceHash);
    expect(contentHash(source)).toBe(sourceHash);
    expect(semanticSkeleton(result.value.document)).toEqual(semanticSkeleton(source));

    const notes = result.value.document.arrangements[0]!.events as readonly NoteEvent[];
    const labels = notes.map((note) =>
      "value" in note.pitch ? spelledPitchV1.format(note.pitch.value) : undefined,
    );
    expect(labels.map((value) => (value?.ok ? value.value : undefined))).toEqual([
      "D4",
      "D4",
      "E4",
      "A4",
      "F#4",
      "D4",
    ]);
  });

  it("supports inverse and identity transposition for M-A", () => {
    const source = fixture("melody-spatial-a");
    const identity = transposeCanonicalDocument(source, { semitones: 0 });
    expect(identity.ok && contentHash(identity.value.document)).toBe(contentHash(source));
    const up = transposeCanonicalDocument(source, { semitones: 2 });
    expect(up.ok).toBe(true);
    if (!up.ok) return;
    const down = transposeCanonicalDocument(up.value.document, { semitones: -2 });
    expect(down.ok).toBe(true);
    if (down.ok) expect(contentHash(down.value.document)).toBe(contentHash(source));
  });

  it("transposes C-D semantic pitches while leaving annotations byte-identical", () => {
    const source = fixture("contract-voicing-hints");
    const sourceChord = source.arrangements[0]!.events[0] as ChordEvent;
    const result = transposeCanonicalDocument(source, { semitones: 2 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const transposedChord = result.value.document.arrangements[0]!.events[0] as ChordEvent;
    expect(transposedChord.analysisAnnotations).toEqual(sourceChord.analysisAnnotations);
    expect(transposedChord.harmony.quality).toEqual(sourceChord.harmony.quality);
    expect(transposedChord.hints?.[0]?.equivalence).toBe("exact-pitch-class-set");
    expect(spelledPitchV1.format(transposedChord.harmony.root)).toMatchObject({
      ok: true,
      value: "B",
    });
    expect(validateCanonicalSemantics(result.value.document).ok).toBe(true);
  });
});
