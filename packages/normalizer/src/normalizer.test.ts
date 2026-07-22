import { describe, expect, it } from "vitest";

import {
  canonicalStringify,
  contentHash,
  type CanonicalDocument,
  type ChordEvent,
} from "@mnls/model";
import { fixtureNames, loadFixture } from "@mnls/test-fixtures";

import { normalize, normalizedHash, serializeNormalized } from "./index.js";

function fixture(name: (typeof fixtureNames)[number]): CanonicalDocument {
  return loadFixture(name) as CanonicalDocument;
}

describe("deterministic normalization", () => {
  for (const name of fixtureNames) {
    it(`normalizes ${name} byte-identically without canonical mutation`, () => {
      const document = fixture(name);
      const arrangementId = document.arrangements[0]!.id;
      const sourceHash = contentHash(document);
      const first = normalize(document, arrangementId);
      const second = normalize(document, arrangementId);
      expect(first.ok, JSON.stringify(first.diagnostics)).toBe(true);
      expect(second.ok, JSON.stringify(second.diagnostics)).toBe(true);
      expect(contentHash(document)).toBe(sourceHash);
      if (!first.ok || !second.ok) return;
      expect(serializeNormalized(first.value)).toBe(serializeNormalized(second.value));
      expect(normalizedHash(first.value)).toBe(normalizedHash(second.value));
      expect(first.value.inputHash).toBe(sourceHash);
      expect(
        first.value.events.every(({ provenance }) => provenance.steps[0]?.kind === "canonical"),
      ).toBe(true);
    });
  }

  it("keeps normalized output free of learning, recipe, and layout authority", () => {
    const document = fixture("melody-spatial-a");
    const result = normalize(document, document.arrangements[0]!.id);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const serialized = canonicalStringify(result.value);
    for (const prohibited of ["learningChunks", "recipe", "pixel", "lineBreak", '"x"', '"y"']) {
      expect(serialized).not.toContain(prohibited);
    }
  });

  it("materializes H-C repetition and alternate-ending provenance", () => {
    const document = fixture("harmony-grid-c");
    const result = normalize(document, document.arrangements[0]!.id);
    expect(result.ok, JSON.stringify(result.diagnostics)).toBe(true);
    if (!result.ok) return;
    expect(result.value.events).toHaveLength(4);
    expect(
      result.value.events.map(({ start }) => `${start.numerator}/${start.denominator}`),
    ).toEqual(["0/1", "2/1", "4/1", "6/1"]);

    const repeatedTonic = result.value.events[2]!;
    expect(repeatedTonic.sourceEventId).toBe("event.harmony-grid-c.tonic");
    expect(repeatedTonic.provenance.steps.map(({ kind }) => kind)).toEqual([
      "canonical",
      "reference",
      "repetition",
    ]);

    const changedEnding = result.value.events[3]!;
    expect(changedEnding.sourceEventId).toBe("event.harmony-grid-c.dominant");
    expect(changedEnding.provenance.steps.map(({ kind }) => kind)).toEqual([
      "canonical",
      "reference",
      "repetition",
      "variation",
    ]);
    expect((changedEnding.semanticEvent as ChordEvent).harmony.quality.qualityId).toBe("minor");
    expect(changedEnding.provenance.steps.at(-1)?.detail).toContain(
      "event.harmony-grid-c.alternate-ending",
    );
  });

  it("preserves unknown hand specificity without inventing an assignment", () => {
    const document = structuredClone(fixture("melody-spatial-a"));
    const arrangement = document.arrangements[0]!;
    const withAssignment: CanonicalDocument = {
      ...document,
      arrangements: [
        {
          ...arrangement,
          handAssignments: [
            {
              id: "assignment.melody-spatial-a.unknown",
              targetRef: arrangement.events[0]!.id,
              assignment: { state: "unknown", note: "not entered" },
            },
          ],
        },
      ],
    };
    const result = normalize(withAssignment, arrangement.id);
    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.value.events[0]!.handAssignments).toEqual([
        { state: "unknown", note: "not entered" },
      ]);
  });

  it("fails unknown arrangements and technical expansion limits with structured diagnostics", () => {
    const document = fixture("harmony-grid-c");
    expect(normalize(document, "arrangement.missing").diagnostics[0]?.code).toBe(
      "NORMALIZE_ARRANGEMENT_NOT_FOUND",
    );
    const limited = normalize(document, document.arrangements[0]!.id, {
      strictRationals: true,
      maxExpandedEvents: 3,
    });
    expect(limited.ok).toBe(false);
    expect(limited.diagnostics[0]?.code).toBe("NORMALIZE_EXPANSION_LIMIT");
  });
});
