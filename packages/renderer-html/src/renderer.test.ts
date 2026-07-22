import { readFileSync } from "node:fs";

import fc from "fast-check";
import { DomUtils, parseDocument } from "htmlparser2";
import { describe, expect, it } from "vitest";

import {
  analyzeArrangementCapabilities,
  analyzeRendererCapabilities,
} from "@mnls/capability-analysis";
import type { LayoutPlan } from "@mnls/layout";
import { layoutProjectedView } from "@mnls/layout";
import {
  analyzeLearningPlanCapabilities,
  verifyLearningPlan,
  type LearningPlan,
  type LearningTransformationDefinition,
} from "@mnls/learning";
import { contentHash, type CanonicalDocument } from "@mnls/model";
import { normalize } from "@mnls/normalizer";
import { projectView } from "@mnls/projection";
import { loadFixture } from "@mnls/test-fixtures";
import { resolveRecipe, type RepresentationRecipe } from "@mnls/workbench";

import {
  deterministicDomId,
  renderComparisonPage,
  renderLayoutPlan,
  type RenderedTreatment,
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
  const recipe = resolveRecipe(
    readJson(`experiments/recipes/${recipeName}.recipe.json`) as RepresentationRecipe,
    {
      arrangement: analyzeArrangementCapabilities(document, normalized.value),
      learningPlan: analyzeLearningPlanCapabilities(verified.value),
      renderer,
    },
  );
  if (!recipe.ok) throw new Error(JSON.stringify(recipe.diagnostics));
  const projection = projectView({
    arrangement: normalized.value,
    recipe: recipe.value,
    learningPlan: verified.value,
  });
  if (!projection.ok) throw new Error(JSON.stringify(projection.diagnostics));
  const layout = layoutProjectedView({ view: projection.value, recipe: recipe.value });
  if (!layout.ok) throw new Error(JSON.stringify(layout.diagnostics));
  const rendered = renderLayoutPlan(layout.value);
  if (!rendered.ok) throw new Error(JSON.stringify(rendered.diagnostics));
  return { layout: layout.value, rendered: rendered.value };
}

type ParsedDocument = ReturnType<typeof parseDocument>;
type ParsedElement = ReturnType<typeof DomUtils.findAll>[number];

function elements(
  root: ParsedDocument | ParsedElement,
  predicate: (element: ParsedElement) => boolean,
): readonly ParsedElement[] {
  return DomUtils.findAll(predicate, root);
}

function tags(root: ParsedDocument | ParsedElement, name: string): readonly ParsedElement[] {
  return elements(root, (element) => element.name === name);
}

function first(
  root: ParsedDocument | ParsedElement,
  predicate: (element: ParsedElement) => boolean,
): ParsedElement | null {
  return DomUtils.findOne(predicate, root);
}

function firstTag(root: ParsedDocument | ParsedElement, name: string): ParsedElement | null {
  return first(root, (element) => element.name === name);
}

function attribute(element: ParsedElement | null, name: string): string | undefined {
  return element ? DomUtils.getAttributeValue(element, name) : undefined;
}

function textContent(element: ParsedElement | null): string | undefined {
  return element ? DomUtils.textContent(element) : undefined;
}

function hasClass(element: ParsedElement, className: string): boolean {
  return (attribute(element, "class") ?? "").split(/\s+/u).includes(className);
}

function elementsWithAttribute(
  root: ParsedDocument | ParsedElement,
  name: string,
): readonly ParsedElement[] {
  return elements(root, (element) => DomUtils.hasAttrib(element, name));
}

describe("deterministic semantic HTML/SVG", () => {
  it.each(["explicit-grid", "proportional-spatial-melody"] as const)(
    "renders %s with semantic landmarks and source-order exact event data",
    (recipeName) => {
      const result = treatment(recipeName);
      const document = parseDocument(result.rendered.html);
      expect(attribute(firstTag(document, "html"), "lang")).toBe("en");
      expect(firstTag(document, "main")).not.toBeNull();
      expect(textContent(firstTag(firstTag(document, "header")!, "h1"))).toBe(
        result.layout.treatment.name,
      );
      expect(
        textContent(first(document, (element) => hasClass(element, "treatment-status"))),
      ).toContain("comparison");
      const svg = first(
        document,
        (element) => element.name === "svg" && attribute(element, "role") === "img",
      );
      expect(textContent(firstTag(svg!, "title"))).toBe(result.layout.treatment.name);
      expect(textContent(firstTag(svg!, "desc"))).toContain("exact pitch");
      expect(textContent(firstTag(document, "header"))).toContain(
        result.layout.source.canonicalDocumentId,
      );
      expect(textContent(firstTag(document, "header"))).toContain(
        result.layout.source.canonicalHash,
      );
      const tableBody = firstTag(document, "tbody");
      const rows = tags(tableBody!, "tr");
      expect(rows).toHaveLength(6);
      expect(textContent(rows[0] ?? null)).toContain("event.melody-spatial-a.1");
      expect(textContent(rows[0] ?? null)).toContain("C4");
      expect(textContent(rows[0] ?? null)).toContain("1/2");
      expect(
        first(
          document,
          (element) => attribute(element, "data-source-id") === "event.melody-spatial-a.1",
        ),
      ).not.toBeNull();
      expect(
        first(document, (element) =>
          (attribute(element, "data-provenance") ?? "").includes(
            "canonical:event.melody-spatial-a.1",
          ),
        ),
      ).not.toBeNull();
      expect(
        elements(
          document,
          (element) => element.name === "g" && attribute(element, "tabindex") === "0",
        ).length,
      ).toBeGreaterThanOrEqual(8);
      expect(textContent(firstTag(document, "details"))).toContain(result.layout.layoutHash);
      expect(textContent(first(document, (element) => hasClass(element, "limitations")))).toContain(
        "No acknowledged compatibility limitations",
      );
      expect(tags(document, "script")).toHaveLength(0);
      expect(
        elements(document, (element) => ["link", "img", "iframe", "object"].includes(element.name)),
      ).toHaveLength(0);
      expect(elementsWithAttribute(document, "onclick")).toHaveLength(0);
      expect(elementsWithAttribute(document, "onload")).toHaveLength(0);
      expect(renderLayoutPlan(result.layout)).toEqual({
        ok: true,
        value: result.rendered,
        diagnostics: [],
      });
      expect(result.rendered.html.toLowerCase()).not.toMatch(
        /final notation|approved notation|preferred treatment|winning treatment/,
      );
    },
  );

  it("uses unique deterministic DOM IDs and source-order focus hooks", () => {
    const result = treatment("explicit-grid");
    const document = parseDocument(result.rendered.html);
    const ids = elementsWithAttribute(document, "id").map((element) => attribute(element, "id"));
    expect(new Set(ids).size).toBe(ids.length);
    for (const node of result.layout.nodes) {
      expect(
        first(document, (element) => attribute(element, "id") === deterministicDomId(node.id)),
      ).not.toBeNull();
    }
    const focusedSources = elements(
      document,
      (element) =>
        element.name === "g" &&
        hasClass(element, "scene-event") &&
        attribute(element, "tabindex") === "0",
    ).map((element) => attribute(element, "data-source-id"));
    expect(focusedSources).toEqual(
      result.layout.accessibility.events.map(({ sourceId }) => sourceId),
    );
    expect(deterministicDomId(" ")).not.toBe(deterministicDomId("_x20_"));
    expect(deterministicDomId("source/😀")).toMatch(/^mnls-[a-f0-9-]+$/u);
  });
});

describe("safe text and option handling", () => {
  it("escapes property-generated hostile text without creating executable DOM", () => {
    const baseline = treatment("explicit-grid").layout;
    const hostileCharacter = fc.constantFrom("<", ">", "&", '"', "'", "/", "=", "script", "onload");
    fc.assert(
      fc.property(fc.array(hostileCharacter, { minLength: 1, maxLength: 20 }), (parts) => {
        const hostile = parts.join("");
        const cloned = structuredClone(baseline) as LayoutPlan;
        const plan = {
          ...cloned,
          treatment: { ...cloned.treatment, name: hostile, description: hostile },
          nodes: cloned.nodes.map((node, index) =>
            index === 0
              ? {
                  ...node,
                  text: hostile,
                  aria: { label: hostile, description: hostile },
                  classes: [...node.classes, hostile],
                }
              : node,
          ),
        } satisfies LayoutPlan;
        const rendered = renderLayoutPlan(plan);
        expect(rendered.ok).toBe(true);
        if (!rendered.ok) return;
        const document = parseDocument(rendered.value.html);
        expect(textContent(firstTag(document, "h1"))).toBe(hostile);
        expect(
          elements(document, (element) =>
            ["script", "iframe", "object", "embed"].includes(element.name),
          ),
        ).toHaveLength(0);
        expect(elementsWithAttribute(document, "onload")).toHaveLength(0);
        expect(elementsWithAttribute(document, "onclick")).toHaveLength(0);
      }),
      { numRuns: 75 },
    );
  });

  it("refuses to omit the required accessible event table", () => {
    const baseline = treatment("explicit-grid").layout;
    const plan: LayoutPlan = {
      ...baseline,
      rendererOptions: { ...baseline.rendererOptions, includeEventTable: false },
    };
    expect(renderLayoutPlan(plan)).toMatchObject({
      ok: false,
      diagnostics: [{ code: "RENDER_ACCESSIBILITY_REQUIRED", stage: "render" }],
    });
  });
});

describe("comparison page", () => {
  it("links both deterministic treatment pages with neutral comparison language", () => {
    const grid = treatment("explicit-grid").rendered;
    const proportional = treatment("proportional-spatial-melody").rendered;
    const page = renderComparisonPage("Spatial melody comparison", [
      { href: "explicit-grid/index.html", rendered: grid },
      { href: "proportional-spatial-melody/index.html", rendered: proportional },
    ]);
    expect(page.ok).toBe(true);
    if (!page.ok) return;
    const document = parseDocument(page.value);
    expect(textContent(firstTag(firstTag(document, "main")!, "h1"))).toBe(
      "Spatial melody comparison",
    );
    const anchors = tags(firstTag(document, "nav")!, "a");
    expect(anchors).toHaveLength(2);
    expect(anchors.map((anchor) => attribute(anchor, "href"))).toEqual([
      "explicit-grid/index.html",
      "proportional-spatial-melody/index.html",
    ]);
    expect(tags(document, "script")).toHaveLength(0);
    expect(
      renderComparisonPage("Spatial melody comparison", [
        { href: "explicit-grid/index.html", rendered: grid },
        { href: "proportional-spatial-melody/index.html", rendered: proportional },
      ]),
    ).toEqual(page);
  });

  it("rejects path traversal in treatment links", () => {
    const rendered = treatment("explicit-grid").rendered;
    const second: RenderedTreatment = { ...rendered, title: "Second treatment" };
    expect(
      renderComparisonPage("Unsafe comparison", [
        { href: "../explicit-grid/index.html", rendered },
        { href: "second/index.html", rendered: second },
      ]),
    ).toMatchObject({
      ok: false,
      diagnostics: [{ code: "RENDER_COMPARISON_INPUT_INVALID" }],
    });
  });
});
