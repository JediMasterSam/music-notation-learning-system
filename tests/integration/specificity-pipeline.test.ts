import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { analyzeArrangementCapabilities } from "@mnls/capability-analysis";
import { executeTreatment, prepareCanonical } from "@mnls/cli";
import { generateLearningPlan, type LearningTransformationDefinition } from "@mnls/learning";
import {
  canonicalStringify,
  contentHash,
  type CanonicalDocument,
  type JSONValue,
  type SpecificityState,
} from "@mnls/model";
import { loadFixture } from "@mnls/test-fixtures";
import { transposeCanonicalDocument } from "@mnls/transposition";
import type { RepresentationRecipe } from "@mnls/workbench";

const repositoryFile = (path: string): URL => new URL(`../../${path}`, import.meta.url);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(repositoryFile(path), "utf8")) as unknown;
}

const states = [
  "required",
  "suggested",
  "optional",
  "intentionally-unspecified",
  "unknown",
] as const satisfies readonly SpecificityState[];

function sourceWithFiveStates(): CanonicalDocument {
  const document = structuredClone(loadFixture("melody-spatial-a")) as CanonicalDocument;
  const arrangement = document.arrangements[0]!;
  return {
    ...document,
    arrangements: [
      {
        ...arrangement,
        events: arrangement.events.map((event, index) => ({
          ...event,
          specificity: states[index % states.length]!,
        })),
      },
    ],
  };
}

describe("five-state specificity full pipeline", () => {
  it("survives normalization, transposition, projection, both layouts, and HTML", () => {
    const document = sourceWithFiveStates();
    const prepared = prepareCanonical(document);
    expect(prepared.ok, JSON.stringify(prepared.diagnostics)).toBe(true);
    if (!prepared.ok) return;
    const profile = analyzeArrangementCapabilities(
      prepared.value.document,
      prepared.value.normalized,
    );
    const definition = readJson(
      "learning/transformations/idea-boundary.learning-transform.json",
    ) as LearningTransformationDefinition;
    const parameters = readJson(
      "learning/transformations/idea-boundary.parameters.json",
    ) as JSONValue;
    const plan = generateLearningPlan(
      prepared.value.document,
      prepared.value.normalized,
      profile,
      definition,
      parameters,
    );
    expect(plan.ok, JSON.stringify(plan.diagnostics)).toBe(true);
    if (!plan.ok) return;
    const transposed = transposeCanonicalDocument(document, { semitones: 2 });
    expect(transposed.ok).toBe(true);
    if (!transposed.ok) return;
    expect(
      transposed.value.document.arrangements[0]!.events.slice(0, 5).map(
        ({ specificity }) => specificity,
      ),
    ).toEqual(states);

    const semanticViews: string[] = [];
    for (const recipeName of ["explicit-grid", "proportional-spatial-melody"] as const) {
      const recipe = readJson(
        `experiments/recipes/${recipeName}.recipe.json`,
      ) as RepresentationRecipe;
      const result = executeTreatment({
        prepared: prepared.value,
        recipeInput: recipe,
        planInput: plan.value,
        definitionInput: definition,
      });
      expect(result.ok, JSON.stringify(result.diagnostics)).toBe(true);
      if (!result.ok) return;
      expect(
        result.value.normalized.events
          .slice(0, 5)
          .map(({ semanticEvent }) => semanticEvent.specificity),
      ).toEqual(states);
      expect(
        result.value.projection.events.slice(0, 5).map(({ eventSpecificity }) => eventSpecificity),
      ).toEqual(states);
      const eventNodes = result.value.layout.nodes.filter(({ kind }) => kind === "event");
      expect(eventNodes.slice(0, 5).map(({ classes }) => classes.at(-1))).toEqual(
        states.map((state) => `specificity-${state}`),
      );
      const renderedStates = [
        ...result.value.rendered.html.matchAll(/data-specificity="([^"]+)"/gu),
      ]
        .map((match) => match[1])
        .filter((value) => value !== "")
        .slice(0, 5);
      expect(renderedStates).toEqual(states);
      for (const state of states) expect(result.value.rendered.html).toContain(state);
      semanticViews.push(canonicalStringify(result.value.projection.events));
    }
    expect(semanticViews[1]).toBe(semanticViews[0]);
    expect(contentHash(document)).toBe(contentHash(sourceWithFiveStates()));
  });
});
