import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  analyzeArrangementCapabilities,
  analyzeRendererCapabilities,
} from "@mnls/capability-analysis";
import {
  analyzeLearningPlanCapabilities,
  verifyLearningPlan,
  type LearningPlan,
  type LearningTransformationDefinition,
} from "@mnls/learning";
import { canonicalStringify, contentHash, rational, type CanonicalDocument } from "@mnls/model";
import { normalize } from "@mnls/normalizer";
import { projectView } from "@mnls/projection";
import { loadFixture } from "@mnls/test-fixtures";
import { resolveRecipe, type RepresentationRecipe } from "@mnls/workbench";

import {
  canonicalDecimal,
  defaultLayoutEnvironment,
  fixedBeatGridV1,
  layoutProjectedView,
} from "./index.js";

const repositoryFile = (path: string): URL => new URL(`../../../${path}`, import.meta.url);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(repositoryFile(path), "utf8")) as unknown;
}

function gridPipeline() {
  const document = loadFixture("melody-spatial-a") as CanonicalDocument;
  const normalized = normalize(document, document.arrangements[0]!.id);
  if (!normalized.ok) throw new Error(JSON.stringify(normalized.diagnostics));
  const definition = readJson(
    "learning/transformations/idea-boundary.learning-transform.json",
  ) as LearningTransformationDefinition;
  const plan = readJson("learning/expected/melody-spatial-a.learning-plan.json") as LearningPlan;
  const verified = verifyLearningPlan(plan, document, normalized.value, definition);
  if (!verified.ok) throw new Error(JSON.stringify(verified.diagnostics));
  const renderer = analyzeRendererCapabilities({
    id: "mnls.renderer.html-svg",
    version: "1",
    implementationHash: contentHash({ id: "mnls.renderer.html-svg", version: "1" }),
    capabilities: [
      "renderer.svg",
      "renderer.accessible-event-list",
      "renderer.overlay.beat-subdivision",
      "renderer.overlay.learning-chunks",
    ],
  });
  const recipe = readJson("experiments/recipes/explicit-grid.recipe.json") as RepresentationRecipe;
  const resolved = resolveRecipe(recipe, {
    arrangement: analyzeArrangementCapabilities(document, normalized.value),
    learningPlan: analyzeLearningPlanCapabilities(verified.value),
    renderer,
  });
  if (!resolved.ok) throw new Error(JSON.stringify(resolved.diagnostics));
  const projection = projectView({
    arrangement: normalized.value,
    recipe: resolved.value,
    learningPlan: verified.value,
  });
  if (!projection.ok) throw new Error(JSON.stringify(projection.diagnostics));
  return { document, normalized: normalized.value, recipe: resolved.value, view: projection.value };
}

describe("layout scalar contract", () => {
  it("serializes terminating and repeating rationals deterministically", () => {
    expect(canonicalDecimal(rational(1, 2))).toBe("0.5");
    expect(canonicalDecimal(rational(3, 1))).toBe("3");
    expect(canonicalDecimal(rational(-5, 4))).toBe("-1.25");
    expect(canonicalDecimal(rational(1, 3))).toBe("0.333333");
    expect(canonicalDecimal(rational(2, 3))).toBe("0.666667");
  });
});

describe("explicit beat/subdivision grid", () => {
  it("maps M-A exact onsets and durations to the expected cells without rounding", () => {
    const pipeline = gridPipeline();
    const before = canonicalStringify(pipeline.view);
    const result = layoutProjectedView({ view: pipeline.view, recipe: pipeline.recipe });
    expect(result.ok, JSON.stringify(result.diagnostics)).toBe(true);
    if (!result.ok) return;
    const events = result.value.nodes.filter(({ kind }) => kind === "event");
    expect(events.map(({ bounds }) => bounds?.x.decimal)).toEqual([
      "48",
      "96",
      "144",
      "240",
      "384",
      "432",
    ]);
    expect(events.map(({ bounds }) => bounds?.width.decimal)).toEqual([
      "48",
      "48",
      "96",
      "144",
      "48",
      "96",
    ]);
    expect(events.map(({ semanticEndX }) => semanticEndX?.decimal)).toEqual([
      "96",
      "144",
      "240",
      "384",
      "432",
      "528",
    ]);
    expect(events.map(({ bounds }) => bounds?.y.decimal)).toEqual([
      "180",
      "180",
      "156",
      "96",
      "132",
      "180",
    ]);
    expect(canonicalStringify(pipeline.view)).toBe(before);
    expect(layoutProjectedView({ view: pipeline.view, recipe: pipeline.recipe })).toEqual(result);
  });

  it("emits exact beat/subdivision markers, labels, chunks, provenance, and accessibility", () => {
    const pipeline = gridPipeline();
    const result = layoutProjectedView({ view: pipeline.view, recipe: pipeline.recipe });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const markers = result.value.nodes.filter(({ kind }) => kind === "time-marker");
    expect(markers).toHaveLength(11);
    expect(markers.filter(({ classes }) => classes.includes("beat-marker"))).toHaveLength(6);
    expect(markers.filter(({ classes }) => classes.includes("subdivision-marker"))).toHaveLength(5);
    expect(markers.map(({ bounds }) => bounds?.x.decimal)).toEqual([
      "48",
      "96",
      "144",
      "192",
      "240",
      "288",
      "336",
      "384",
      "432",
      "480",
      "528",
    ]);
    expect(result.value.nodes.filter(({ kind }) => kind === "label")).toHaveLength(6);
    expect(result.value.nodes.filter(({ kind }) => kind === "learning-chunk")).toHaveLength(2);
    expect(result.value.accessibility.eventOrder).toHaveLength(6);
    expect(result.value.accessibility.events.map(({ exactPitch }) => exactPitch)).toEqual([
      "C4",
      "C4",
      "D4",
      "G4",
      "E4",
      "C4",
    ]);
    expect(result.value.accessibility.events[1]?.text).toContain("Same pitch");
    expect(result.value.accessibility.events[0]).toMatchObject({
      exactOnset: "0/1",
      exactDuration: "1/2",
      specificity: "required",
      sourceId: "event.melody-spatial-a.1",
    });
    const event = result.value.nodes.find(({ kind }) => kind === "event");
    expect(event?.sourceRefs).toEqual(["event.melody-spatial-a.1"]);
    expect(event?.provenanceRefs[0]).toBe("canonical:event.melody-spatial-a.1");
    expect(event?.classes).toContain("specificity-required");
    expect(result.value.relationships.some(({ type }) => type === "contains")).toBe(true);
  });

  it("returns TIME_GRID_RESOLUTION_INSUFFICIENT for a nonrepresentable onset", () => {
    const result = fixedBeatGridV1.mapTime({
      extentStart: rational(0),
      time: rational(1, 3),
      environment: defaultLayoutEnvironment,
      options: { subdivisionsPerBeat: 2, unitsPerCell: 48, originX: 48 },
    });
    expect(result).toMatchObject({
      ok: false,
      diagnostics: [{ code: "TIME_GRID_RESOLUTION_INSUFFICIENT", stage: "layout" }],
    });
  });
});
