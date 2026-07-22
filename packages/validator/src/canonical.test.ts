import { describe, expect, it } from "vitest";

import { contentHash, type CanonicalDocument, type ChordEvent } from "@mnls/model";
import { schemaIds, validateArtifact } from "@mnls/schema";
import { fixtureNames, loadFixture } from "@mnls/test-fixtures";
import { transposeCanonicalDocument } from "@mnls/transposition";

import { validateCanonicalSemantics } from "./index.js";

function typedFixture(name: (typeof fixtureNames)[number]): CanonicalDocument {
  const value = loadFixture(name);
  const structural = validateArtifact(schemaIds.canonical, value);
  expect(structural.ok, JSON.stringify(structural.diagnostics)).toBe(true);
  return value as CanonicalDocument;
}

function mutatedFixture(
  name: (typeof fixtureNames)[number],
  mutate: (document: Record<string, unknown>) => void,
): CanonicalDocument {
  const value = structuredClone(loadFixture(name)) as Record<string, unknown>;
  mutate(value);
  return value as unknown as CanonicalDocument;
}

describe("Sprint 1 canonical fixtures", () => {
  for (const name of fixtureNames) {
    it(`structurally and semantically validates ${name}`, () => {
      const document = typedFixture(name);
      const before = contentHash(document);
      const result = validateCanonicalSemantics(document);
      expect(result.ok, JSON.stringify(result.diagnostics)).toBe(true);
      expect(contentHash(document)).toBe(before);
      if (result.ok) expect(Object.isFrozen(result.value)).toBe(true);
    });
  }

  it("retains one authoritative M-A melody with required experiment characteristics", () => {
    const arrangement = typedFixture("melody-spatial-a").arrangements[0]!;
    const notes = arrangement.events.filter((event) => event.type === "note");
    const pitchKeys = notes.map((event) =>
      JSON.stringify("value" in event.pitch ? event.pitch.value : null),
    );
    expect(notes).toHaveLength(6);
    expect(new Set(pitchKeys).size).toBeLessThan(notes.length);
    expect(
      new Set(notes.map((event) => JSON.stringify(event.duration.beats))).size,
    ).toBeGreaterThanOrEqual(3);
    expect(arrangement.ideas.length).toBeGreaterThanOrEqual(2);
    expect(arrangement.events.every((event) => event.type === "note")).toBe(true);
  });

  it("retains C-D chord authority boundaries", () => {
    const events = typedFixture("contract-voicing-hints").arrangements[0]!
      .events as readonly ChordEvent[];
    const am7 = events[0]!;
    const slashChord = events[1]!;
    expect(am7.harmony.quality.qualityId).toBe("minor");
    expect(am7.harmony.extensions).toEqual([7]);
    expect(am7.inversion?.state).toBe("required");
    expect(am7.slashBass?.state).toBe("required");
    expect(am7.voicing.state).toBe("required");
    expect(am7.hints?.[0]?.equivalence).toBe("exact-pitch-class-set");
    expect(slashChord.inversion?.state).toBe("intentionally-unspecified");
    expect(slashChord.voicing.state).toBe("intentionally-unspecified");
  });

  it("anchors plain untrusted lyric text without whitespace positioning", () => {
    const source = typedFixture("melody-spatial-a");
    const withLyrics: CanonicalDocument = {
      ...source,
      song: {
        ...source.song,
        lyricTracks: [
          {
            id: "lyrics.melody-spatial-a.english",
            language: "en",
            events: [
              {
                id: "lyric.melody-spatial-a.1",
                text: '<script onload="unsafe">plain text</script>',
                anchorEventRef: "event.melody-spatial-a.1",
                syllabic: "single",
                verse: 1,
              },
              {
                id: "lyric.melody-spatial-a.2",
                text: "timed",
                start: { beat: { numerator: 1, denominator: 2 } },
                duration: { beats: { numerator: 1, denominator: 2 } },
              },
            ],
          },
        ],
      },
      arrangements: source.arrangements.map((arrangement, index) =>
        index === 0
          ? {
              ...arrangement,
              sections: arrangement.sections.map((section, sectionIndex) =>
                sectionIndex === 0
                  ? { ...section, lyricTrackRefs: ["lyrics.melody-spatial-a.english"] }
                  : section,
              ),
            }
          : arrangement,
      ),
    };
    expect(validateArtifact(schemaIds.canonical, withLyrics).ok).toBe(true);
    expect(validateCanonicalSemantics(withLyrics).ok).toBe(true);
    const transposed = transposeCanonicalDocument(withLyrics, { semitones: 2 });
    expect(transposed.ok).toBe(true);
    if (transposed.ok) {
      expect(transposed.value.document.song.lyricTracks).toEqual(withLyrics.song.lyricTracks);
    }
  });
});

describe("semantic validation diagnostics", () => {
  it("rejects duplicate stable IDs", () => {
    const document = mutatedFixture("melody-spatial-a", (value) => {
      const arrangement = (value.arrangements as Record<string, unknown>[])[0]!;
      const events = arrangement.events as Record<string, unknown>[];
      events[1]!.id = events[0]!.id;
    });
    const result = validateCanonicalSemantics(document);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map(({ code }) => code)).toContain("ID_DUPLICATE");
  });

  it("rejects dangling typed references and out-of-span events", () => {
    const document = mutatedFixture("melody-spatial-a", (value) => {
      const arrangement = (value.arrangements as Record<string, unknown>[])[0]!;
      const events = arrangement.events as Record<string, unknown>[];
      events[0]!.roleRefs = ["role.missing"];
      const ideas = arrangement.ideas as Record<string, unknown>[];
      ideas[0]!.span = {
        start: { beat: { numerator: 1, denominator: 1 } },
        duration: { beats: { numerator: 1, denominator: 2 } },
      };
    });
    const result = validateCanonicalSemantics(document);
    expect(result.ok).toBe(false);
    const codes = result.diagnostics.map(({ code }) => code);
    expect(codes).toContain("REF_ROLE_NOT_FOUND");
    expect(codes).toContain("IDEA_EVENT_OUTSIDE_SPAN");
  });

  it("rejects non-normalized time and empty valued voicing", () => {
    const document = mutatedFixture("contract-voicing-hints", (value) => {
      const arrangement = (value.arrangements as Record<string, unknown>[])[0]!;
      const events = arrangement.events as Record<string, unknown>[];
      events[0]!.duration = { beats: { numerator: 2, denominator: 2 } };
      events[0]!.voicing = { state: "required", value: {} };
    });
    const result = validateCanonicalSemantics(document);
    expect(result.ok).toBe(false);
    const codes = result.diagnostics.map(({ code }) => code);
    expect(codes).toContain("TIME_RATIONAL_NOT_NORMALIZED");
    expect(codes).toContain("VOICING_EMPTY_VALUE");
  });

  it("rejects unknown qualities and aliases used as semantic IDs", () => {
    for (const qualityId of ["unknown-quality", "m"]) {
      const document = mutatedFixture("contract-voicing-hints", (value) => {
        const arrangement = (value.arrangements as Record<string, unknown>[])[0]!;
        const event = (arrangement.events as Record<string, unknown>[])[0]!;
        const harmony = event.harmony as Record<string, unknown>;
        harmony.quality = {
          vocabularyId: "mnls.chord-quality",
          vocabularyVersion: "1.0.0",
          qualityId,
        };
      });
      const result = validateCanonicalSemantics(document);
      expect(result.ok).toBe(false);
      expect(result.diagnostics.map(({ code }) => code)).toContain(
        qualityId === "m" ? "HARMONY_VOCAB_ALIAS_AS_ID" : "HARMONY_VOCAB_QUALITY_UNKNOWN",
      );
    }
  });

  it("does not branch on free-form harmonic annotation content", () => {
    const original = typedFixture("contract-voicing-hints");
    const changed = mutatedFixture("contract-voicing-hints", (value) => {
      const arrangement = (value.arrangements as Record<string, unknown>[])[0]!;
      const event = (arrangement.events as Record<string, unknown>[])[0]!;
      const annotations = event.analysisAnnotations as Record<string, unknown>[];
      annotations[0]!.text = "totally different arbitrary analysis";
      annotations[0]!.system = "another-free-form-system";
      annotations[0]!.tags = ["do-not-branch", "bVII???"];
    });
    expect(validateCanonicalSemantics(original).diagnostics).toEqual(
      validateCanonicalSemantics(changed).diagnostics,
    );
  });

  it("rejects a familiar-shape hint falsely labeled exact", () => {
    const document = mutatedFixture("contract-voicing-hints", (value) => {
      const arrangement = (value.arrangements as Record<string, unknown>[])[0]!;
      const event = (arrangement.events as Record<string, unknown>[])[0]!;
      const hint = (event.hints as Record<string, unknown>[])[0]!;
      hint.bass = {
        strategy: "spelled-pitch",
        version: "1",
        value: { step: "G", alter: 0 },
      };
    });
    const result = validateCanonicalSemantics(document);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map(({ code }) => code)).toContain("HINT_EQUIVALENCE_FALSE_EXACT");
  });

  it("rejects unanchored lyrics, bad event refs, and whitespace placement", () => {
    const source = typedFixture("melody-spatial-a");
    const invalid: CanonicalDocument = {
      ...source,
      song: {
        ...source.song,
        lyricTracks: [
          {
            id: "lyrics.invalid",
            events: [
              { id: "lyric.unanchored", text: "no anchor" },
              {
                id: "lyric.missing-ref",
                text: " bad padding",
                anchorEventRef: "event.missing",
              },
            ],
          },
        ],
      },
      arrangements: source.arrangements.map((arrangement, index) =>
        index === 0
          ? {
              ...arrangement,
              sections: arrangement.sections.map((section, sectionIndex) =>
                sectionIndex === 0 ? { ...section, lyricTrackRefs: ["lyrics.missing"] } : section,
              ),
            }
          : arrangement,
      ),
    };
    const result = validateCanonicalSemantics(invalid);
    expect(result.ok).toBe(false);
    expect(result.diagnostics.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "LYRIC_ANCHOR_REQUIRED",
        "LYRIC_EVENT_REF_NOT_FOUND",
        "LYRIC_WHITESPACE_PADDING",
        "SECTION_LYRIC_TRACK_REF_NOT_FOUND",
      ]),
    );
  });
});
