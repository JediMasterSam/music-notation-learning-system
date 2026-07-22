import type { LayoutPlan, SceneNode } from "@mnls/layout";

export interface RenderDiagnostic {
  readonly code: string;
  readonly severity: "error";
  readonly stage: "render";
  readonly message: string;
}

export interface RenderedTreatment {
  readonly html: string;
  readonly title: string;
  readonly status: LayoutPlan["treatment"]["status"];
  readonly limitations: LayoutPlan["limitations"];
  readonly layoutHash: string;
  readonly recipeRef: LayoutPlan["recipeRef"];
  readonly rendererRef: LayoutPlan["rendererRef"];
}

export type RenderResult<T> =
  | { readonly ok: true; readonly value: T; readonly diagnostics: readonly [] }
  | { readonly ok: false; readonly diagnostics: readonly RenderDiagnostic[] };

export interface ComparisonTreatment {
  readonly href: string;
  readonly rendered: RenderedTreatment;
}

const allowedClasses = new Set([
  "scene-event",
  "pitch-label",
  "time-marker",
  "beat-marker",
  "subdivision-marker",
  "time-reference-marker",
  "learning-chunk",
  "specificity-required",
  "specificity-suggested",
  "specificity-optional",
  "specificity-intentionally-unspecified",
  "specificity-unknown",
]);

const fixedStyles = `
:root { color-scheme: light; font-family: system-ui, sans-serif; }
body { margin: 0; color: #172033; background: #f7f8fb; }
main { max-width: 76rem; margin: 0 auto; padding: 1.25rem; }
header, section, details { margin-block: 1rem; }
.treatment-status { font-weight: 700; text-transform: capitalize; }
.visual-wrap { overflow-x: auto; background: white; border: 1px solid #aeb7c7; }
svg { display: block; min-width: 100%; height: auto; }
.time-marker { stroke: #b8bfcc; stroke-width: 1; }
.beat-marker { stroke: #70798a; }
.scene-event { fill: #d9e7ff; stroke: #1c4d8c; stroke-width: 1.5; }
.learning-chunk { fill: #f7d98a; stroke: #7b5a00; stroke-width: 1; opacity: .7; }
.pitch-label { fill: #111827; font-size: 12px; text-anchor: middle; dominant-baseline: central; }
.specificity-suggested { stroke-dasharray: 5 3; }
.specificity-optional { stroke-dasharray: 2 3; }
.specificity-intentionally-unspecified, .specificity-unknown { stroke-dasharray: 1 4; }
table { width: 100%; border-collapse: collapse; background: white; }
th, td { padding: .5rem; border: 1px solid #c8ced9; text-align: left; }
.limitations { border-left: .25rem solid #8a5b00; padding-left: .75rem; }
.comparison-list { display: grid; gap: 1rem; padding: 0; list-style: none; }
.comparison-list li { background: white; border: 1px solid #c8ced9; padding: 1rem; }
`.trim();

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function deterministicDomId(value: string): string {
  const codePoints = [...value].map((character) => character.codePointAt(0)!.toString(16));
  return `mnls-${codePoints.length > 0 ? codePoints.join("-") : "empty"}`;
}

function diagnostic(code: string, message: string): RenderDiagnostic {
  return { code, severity: "error", stage: "render", message };
}

function decimal(value: string): string | undefined {
  return /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(value) ? value : undefined;
}

function safeClasses(classes: readonly string[]): string {
  return classes.filter((value) => allowedClasses.has(value)).join(" ");
}

function dataAttributes(node: SceneNode, plan: LayoutPlan): string {
  const accessible = plan.accessibility.events.find(({ nodeId }) => nodeId === node.id);
  return [
    `data-source-id="${escapeHtml(node.sourceRefs.join(" "))}"`,
    `data-role="${escapeHtml(accessible?.roleIds.join(" ") ?? "")}"`,
    `data-specificity="${escapeHtml(accessible?.specificity ?? "")}"`,
    `data-strategy="${escapeHtml(node.strategyRef)}"`,
    `data-provenance="${escapeHtml(node.provenanceRefs.join(" "))}"`,
    ...(node.semanticEndX
      ? [`data-semantic-end-x="${escapeHtml(node.semanticEndX.decimal)}"`]
      : []),
  ].join(" ");
}

function renderNode(node: SceneNode, plan: LayoutPlan): RenderResult<string> {
  const id = deterministicDomId(node.id);
  const classes = safeClasses(node.classes);
  const aria = escapeHtml(`${node.aria.label}. ${node.aria.description}`);
  const data = dataAttributes(node, plan);
  if (!node.bounds) {
    return {
      ok: true,
      value: `<g id="${id}" class="${classes}" ${data} role="group" aria-label="${aria}"></g>`,
      diagnostics: [],
    };
  }
  const x = decimal(node.bounds.x.decimal);
  const y = decimal(node.bounds.y.decimal);
  const width = decimal(node.bounds.width.decimal);
  const height = decimal(node.bounds.height.decimal);
  if (!x || !y || !width || !height) {
    return {
      ok: false,
      diagnostics: [
        diagnostic("RENDER_COORDINATE_INVALID", `Scene node ${node.id} has an invalid scalar.`),
      ],
    };
  }
  let shape: string;
  if (node.kind === "time-marker") {
    shape = `<line x1="${x}" y1="${y}" x2="${x}" y2="${height}" />`;
  } else if (node.kind === "label") {
    shape = `<text x="${x}" y="${y}">${escapeHtml(node.text ?? "")}</text>`;
  } else {
    shape = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${node.kind === "event" ? "3" : "0"}" />`;
  }
  const focusable = node.kind === "event" || node.kind === "learning-chunk" ? ' tabindex="0"' : "";
  return {
    ok: true,
    value: `<g id="${id}" class="${classes}" ${data} role="group" aria-label="${aria}"${focusable}>${shape}</g>`,
    diagnostics: [],
  };
}

function renderLimitations(plan: LayoutPlan): string {
  if (plan.limitations.length === 0) {
    return '<section class="limitations" aria-labelledby="limitations-heading"><h2 id="limitations-heading">Treatment limitations</h2><p>No acknowledged compatibility limitations for this run.</p></section>';
  }
  const items = plan.limitations
    .map(
      ({ class: limitationClass, message }) =>
        `<li><strong>${escapeHtml(limitationClass)}</strong>: ${escapeHtml(message)}</li>`,
    )
    .join("");
  return `<section class="limitations" aria-labelledby="limitations-heading"><h2 id="limitations-heading">Treatment limitations</h2><ul>${items}</ul></section>`;
}

function renderEventTable(plan: LayoutPlan): string {
  const rows = plan.accessibility.events
    .map(
      (event) =>
        `<tr id="${deterministicDomId(`event-row.${event.nodeId}`)}"><td>${escapeHtml(event.sourceId)}</td><td>${escapeHtml(event.exactPitch)}</td><td>${escapeHtml(event.exactOnset)}</td><td>${escapeHtml(event.exactDuration)}</td><td>${escapeHtml(event.specificity)}</td><td>${escapeHtml(event.text)}</td></tr>`,
    )
    .join("");
  return `<section aria-labelledby="event-list-heading"><h2 id="event-list-heading">Source-order accessible event list</h2><div role="region" aria-label="Scrollable event table" tabindex="0"><table><thead><tr><th scope="col">Source event</th><th scope="col">Exact pitch</th><th scope="col">Exact onset (beats)</th><th scope="col">Exact duration (beats)</th><th scope="col">Specificity</th><th scope="col">Description</th></tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

function renderDetails(plan: LayoutPlan): string {
  const strategies = plan.strategyRefs.map((value) => `<li>${escapeHtml(value)}</li>`).join("");
  const provenanceCount = plan.nodes.reduce((count, node) => count + node.provenanceRefs.length, 0);
  return `<details><summary>Treatment configuration and provenance</summary><dl><dt>Recipe</dt><dd>${escapeHtml(plan.recipeRef.id)}@${escapeHtml(plan.recipeRef.version)}</dd><dt>Recipe hash</dt><dd>${escapeHtml(plan.recipeRef.contentHash)}</dd><dt>Layout hash</dt><dd>${escapeHtml(plan.layoutHash)}</dd><dt>Input projection hash</dt><dd>${escapeHtml(plan.inputHash)}</dd><dt>Provenance references</dt><dd>${provenanceCount}</dd></dl><h3>Resolved strategies</h3><ul>${strategies}</ul><h3>Diagnostics</h3><p>${plan.diagnostics.length === 0 ? "No layout diagnostics." : `${plan.diagnostics.length} layout diagnostic(s).`}</p></details>`;
}

export function renderLayoutPlan(plan: LayoutPlan): RenderResult<RenderedTreatment> {
  if (plan.rendererRef.id !== "mnls.renderer.html-svg" || plan.rendererRef.version !== "1") {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "RENDERER_NOT_FOUND",
          `Renderer ${plan.rendererRef.id}@${plan.rendererRef.version} is unavailable.`,
        ),
      ],
    };
  }
  if (plan.rendererOptions.includeEventTable !== true) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "RENDER_ACCESSIBILITY_REQUIRED",
          "Sprint 1 HTML/SVG output requires the source-order accessible event table.",
        ),
      ],
    };
  }
  const titleLevel = plan.rendererOptions.titleLevel;
  if (
    typeof titleLevel !== "number" ||
    !Number.isInteger(titleLevel) ||
    titleLevel < 1 ||
    titleLevel > 6
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic("RENDER_OPTION_INVALID", "Renderer titleLevel must be 1 through 6."),
      ],
    };
  }
  const extentWidth = decimal(plan.extent.width.decimal);
  const extentHeight = decimal(plan.extent.height.decimal);
  if (!extentWidth || !extentHeight) {
    return {
      ok: false,
      diagnostics: [
        diagnostic("RENDER_COORDINATE_INVALID", "Layout extent contains an invalid scalar."),
      ],
    };
  }
  const renderedNodes: string[] = [];
  for (const node of plan.nodes) {
    const rendered = renderNode(node, plan);
    if (!rendered.ok) return rendered;
    renderedNodes.push(rendered.value);
  }
  const title = plan.treatment.name;
  const description =
    plan.treatment.description ??
    `${plan.treatment.status} representation treatment for ${plan.viewId}.`;
  const svgTitleId = deterministicDomId(`${plan.viewId}.svg-title`);
  const svgDescriptionId = deterministicDomId(`${plan.viewId}.svg-description`);
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — MNLS comparison</title>
<style>${fixedStyles}</style>
</head>
<body>
<main>
<header>
<h1>${escapeHtml(title)}</h1>
<p class="treatment-status">Status: ${escapeHtml(plan.treatment.status)}</p>
<p>${escapeHtml(description)}</p>
<p>Recipe <code>${escapeHtml(plan.recipeRef.id)}@${escapeHtml(plan.recipeRef.version)}</code>; canonical source <code>${escapeHtml(plan.source.canonicalDocumentId)}</code>; arrangement <code>${escapeHtml(plan.source.arrangementId)}</code>.</p>
<p>Canonical hash <code>${escapeHtml(plan.source.canonicalHash)}</code>; normalized hash <code>${escapeHtml(plan.source.normalizedHash)}</code>; arrangement view <code>${escapeHtml(plan.viewId)}</code>.</p>
</header>
${renderLimitations(plan)}
<section aria-labelledby="visual-heading">
<h2 id="visual-heading">Visual treatment</h2>
<div class="visual-wrap">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${extentWidth} ${extentHeight}" role="img" aria-labelledby="${svgTitleId} ${svgDescriptionId}">
<title id="${svgTitleId}">${escapeHtml(title)}</title>
<desc id="${svgDescriptionId}">${escapeHtml(plan.accessibility.description)}</desc>
${renderedNodes.join("\n")}
</svg>
</div>
</section>
${renderEventTable(plan)}
${plan.accessibility.overlays.length > 0 ? `<section aria-labelledby="overlay-heading"><h2 id="overlay-heading">Learning overlays</h2><ul>${plan.accessibility.overlays.map(({ nodeId, text }) => `<li data-node-id="${escapeHtml(nodeId)}">${escapeHtml(text)}</li>`).join("")}</ul></section>` : ""}
${renderDetails(plan)}
</main>
</body>
</html>
`;
  return {
    ok: true,
    value: {
      html,
      title,
      status: plan.treatment.status,
      limitations: plan.limitations,
      layoutHash: plan.layoutHash,
      recipeRef: plan.recipeRef,
      rendererRef: plan.rendererRef,
    },
    diagnostics: [],
  };
}

export function renderComparisonPage(
  title: string,
  treatments: readonly ComparisonTreatment[],
): RenderResult<string> {
  if (
    treatments.length < 2 ||
    treatments.some(({ href }) => !/^[a-z0-9]+(?:-[a-z0-9]+)*\/index\.html$/.test(href))
  ) {
    return {
      ok: false,
      diagnostics: [
        diagnostic(
          "RENDER_COMPARISON_INPUT_INVALID",
          "Comparison output requires at least two safe relative treatment links.",
        ),
      ],
    };
  }
  const items = treatments
    .map(({ href, rendered }) => {
      const limitations =
        rendered.limitations.length === 0
          ? "No acknowledged compatibility limitations."
          : rendered.limitations.map(({ message }) => message).join("; ");
      return `<li><h2>${escapeHtml(rendered.title)}</h2><p>Status: ${escapeHtml(rendered.status)}</p><p>Recipe <code>${escapeHtml(rendered.recipeRef.id)}@${escapeHtml(rendered.recipeRef.version)}</code></p><p>${escapeHtml(limitations)}</p><a href="${escapeHtml(href)}">Open treatment</a></li>`;
    })
    .join("");
  return {
    ok: true,
    value: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} — MNLS comparison</title>
<style>${fixedStyles}</style>
</head>
<body>
<main>
<header><h1>${escapeHtml(title)}</h1><p>Side-by-side experiment treatments generated from one canonical and normalized source. These are comparison artifacts, not a notation-system conclusion.</p></header>
<nav aria-label="Treatment comparison"><ul class="comparison-list">${items}</ul></nav>
</main>
</body>
</html>
`,
    diagnostics: [],
  };
}
