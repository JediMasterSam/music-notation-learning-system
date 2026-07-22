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
import {
  addRational,
  canonicalStringify,
  compareRational,
  contentHash,
  multiplyRational,
  rational,
  type CanonicalDocument,
} from "@mnls/model";
import { normalize } from "@mnls/normalizer";
import { projectView } from "@mnls/projection";
import { loadFixture } from "@mnls/test-fixtures";
import { resolveRecipe, type RepresentationRecipe } from "@mnls/workbench";

import {
  defaultLayoutEnvironment,
  layoutProjectedView,
  proportionalExtentV1,
  proportionalTimeV1,
} from "./index.js";

const repositoryFile = (path: string): URL => new URL(`../../../${path}`, import.meta.url);

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(repositoryFile(path), "utf8")) as unknown;
}

function treatment(recipeName: "explicit-grid" | "proportional-spatial-melody") {
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
      "renderer.overlay.time-reference",
      "renderer.overlay.learning-chunks",
    ],
  });
  const authored = readJson(
    `experiments/recipes/${recipeName}.recipe.json`,
  ) as RepresentationRecipe;
  const recipe = resolveRecipe(authored, {
    arrangement: analyzeArrangementCapabilities(document, normalized.value),
    learningPlan: analyzeLearningPlanCapabilities(verified.value),
    renderer,
  });
  if (!recipe.ok) throw new Error(JSON.stringify(recipe.diagnostics));
  const projection = projectView({
    arrangement: normalized.value,
    recipe: recipe.value,
    learningPlan: verified.value,
  });
  if (!projection.ok) throw new Error(JSON.stringify(projection.diagnostics));
  const layout = layoutProjectedView({ view: projection.value, recipe: recipe.value });
  if (!layout.ok) throw new Error(JSON.stringify(layout.diagnostics));
  return {
    document,
    normalized: normalized.value,
    recipe: recipe.value,
    view: projection.value,
    layout: layout.value,
  };
}

describe("proportional horizontal onset and duration", () => {
  it("maps exact onset and semantic duration linearly for every M-A event", () => {
    const result = treatment("proportional-spatial-melody");
    const events = result.layout.nodes.filter(({ kind }) => kind === "event");
    expect(events).toHaveLength(result.view.events.length);
    for (const [index, node] of events.entries()) {
      const event = result.view.events[index]!;
      const expectedStart = addRational(rational(48), multiplyRational(event.start, rational(96)));
      const expectedWidth = multiplyRational(event.duration, rational(96));
      expect(node.bounds?.x.exact).toEqual(expectedStart);
      expect(node.semanticEndX?.exact).toEqual(addRational(expectedStart, expectedWidth));
      expect(node.bounds?.width.exact).toEqual(expectedWidth);
    }
    expect(
      events.slice(1).every((node, index) => {
        const previous = events[index]!;
        return compareRational(node.bounds!.x.exact, previous.bounds!.x.exact) > 0;
      }),
    ).toBe(true);
  });

  it("preserves absolute pitch geometry and accessible exact semantics", () => {
    const result = treatment("proportional-spatial-melody");
    const events = result.layout.nodes.filter(({ kind }) => kind === "event");
    const y = events.map(({ bounds }) => bounds!.y.exact);
    expect(y[0]).toEqual(y[1]);
    expect(y[0]).toEqual(y[5]);
    expect(compareRational(y[3]!, y[0]!)).toBeLessThan(0);
    const cToD = Math.abs(Number(y[2]!.numerator) - Number(y[0]!.numerator));
    const dToG = Math.abs(Number(y[3]!.numerator) - Number(y[2]!.numerator));
    expect(dToG).toBeGreaterThan(cToD);
    expect(result.layout.accessibility.events.map(({ exactPitch }) => exactPitch)).toEqual([
      "C4",
      "C4",
      "D4",
      "G4",
      "E4",
      "C4",
    ]);
    expect(
      result.layout.accessibility.events.every(
        ({ exactOnset, exactDuration }) => exactOnset.includes("/") && exactDuration.includes("/"),
      ),
    ).toBe(true);
    expect(canonicalStringify(result.layout)).not.toMatch(/stem|flag|traditional-note-value/);
  });

  it("uses time-reference markers rather than subdivision cells", () => {
    const result = treatment("proportional-spatial-melody");
    const markers = result.layout.nodes.filter(({ kind }) => kind === "time-marker");
    expect(markers).toHaveLength(6);
    expect(markers.every(({ classes }) => classes.includes("time-reference-marker"))).toBe(true);
    expect(markers.every(({ classes }) => !classes.includes("subdivision-marker"))).toBe(true);
  });

  it("keeps a minimum hit area distinct from the exact semantic duration edge", () => {
    const mappedStart = proportionalTimeV1.mapTime({
      extentStart: rational(0),
      time: rational(0),
      environment: defaultLayoutEnvironment,
      options: { originX: 48, unitsPerBeat: 96 },
    });
    expect(mappedStart.ok).toBe(true);
    if (!mappedStart.ok) return;
    const geometry = proportionalExtentV1.encodeDuration({
      extentStart: rational(0),
      start: rational(0),
      duration: rational(1, 96),
      mappedStart: mappedStart.value,
      timeMapper: proportionalTimeV1,
      environment: defaultLayoutEnvironment,
      timeOptions: { originX: 48, unitsPerBeat: 96 },
      options: { minimumHitWidth: 20 },
    });
    expect(geometry.ok).toBe(true);
    if (!geometry.ok) return;
    expect(geometry.value.semanticEndX.decimal).toBe("49");
    expect(geometry.value.visibleEndX.decimal).toBe("68");
  });
});

describe("controlled treatment comparison", () => {
  it("changes only declared time, duration, and temporal-reference strategies", () => {
    const grid = treatment("explicit-grid");
    const proportional = treatment("proportional-spatial-melody");
    expect(canonicalStringify(grid.view)).toBe(canonicalStringify(proportional.view));
    expect(contentHash(grid.document)).toBe(contentHash(proportional.document));
    expect(grid.normalized.inputHash).toBe(proportional.normalized.inputHash);
    const selection = (kind: string, source: typeof grid) =>
      source.recipe.selections.find((candidate) => candidate.kind === kind);
    expect(selection("pitch-mapping", grid)).toEqual(selection("pitch-mapping", proportional));
    expect(selection("pitch-labels", grid)).toEqual(selection("pitch-labels", proportional));
    const gridEvents = grid.layout.nodes.filter(({ kind }) => kind === "event");
    const proportionalEvents = proportional.layout.nodes.filter(({ kind }) => kind === "event");
    expect(gridEvents.map(({ bounds }) => bounds?.y)).toEqual(
      proportionalEvents.map(({ bounds }) => bounds?.y),
    );
    expect(grid.layout.accessibility.events).toEqual(proportional.layout.accessibility.events);
    expect(grid.layout.layoutHash).not.toBe(proportional.layout.layoutHash);
    expect(selection("time-mapping", grid)?.strategyId).toBe("mnls.time.fixed-beat-grid");
    expect(selection("time-mapping", proportional)?.strategyId).toBe("mnls.time.proportional");
    expect(selection("duration-encoding", grid)?.strategyId).toBe("mnls.duration.grid-span");
    expect(selection("duration-encoding", proportional)?.strategyId).toBe(
      "mnls.duration.proportional-extent",
    );
  });
});
