import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, describe, expect, it } from "vitest";

import { executeTreatment, prepareCanonical, runCli, type CliIO } from "@mnls/cli";
import type { LearningPlan, LearningTransformationDefinition } from "@mnls/learning";
import type { CanonicalDocument } from "@mnls/model";
import type { RepresentationRecipe } from "@mnls/workbench";

const repositoryRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const experimentPath = "experiments/definitions/spatial-melody-comparison.experiment.json";
const temporaryDirectories: string[] = [];

async function json(path: string): Promise<unknown> {
  return JSON.parse(await readFile(join(repositoryRoot, path), "utf8")) as unknown;
}

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "mnls-reproducibility-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterAll(async () => {
  await Promise.all(temporaryDirectories.map((directory) => rm(directory, { recursive: true })));
});

function io(stdout: string[], stderr: string[]): CliIO {
  return {
    cwd: repositoryRoot,
    stdout: (text) => stdout.push(text),
    stderr: (text) => stderr.push(text),
  };
}

async function fileBytes(directory: string): Promise<Readonly<Record<string, string>>> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const files: Record<string, string> = {};
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    files[path.slice(directory.length + 1)] = await readFile(path, "utf8");
  }
  return Object.fromEntries(
    Object.entries(files).sort(([left], [right]) => left.localeCompare(right, "en")),
  );
}

describe("E-007 reproducibility authority", () => {
  it("reproduces clean output bytes and holds source and vertical pitch mapping constant", async () => {
    const first = await temporaryDirectory();
    const second = await temporaryDirectory();
    const firstOut: string[] = [];
    const secondOut: string[] = [];
    const firstErrors: string[] = [];
    const secondErrors: string[] = [];
    expect(
      await runCli(
        ["experiment", "run", experimentPath, "--out", first],
        io(firstOut, firstErrors),
      ),
    ).toBe(0);
    expect(
      await runCli(
        ["experiment", "run", experimentPath, "--out", second],
        io(secondOut, secondErrors),
      ),
    ).toBe(0);
    expect(firstErrors).toEqual([]);
    expect(secondErrors).toEqual([]);
    expect(secondOut).toEqual(firstOut);
    expect(await fileBytes(second)).toEqual(await fileBytes(first));

    const grid = JSON.parse(
      await readFile(join(first, "explicit-grid", "manifest.json"), "utf8"),
    ) as {
      resolvedOptions: {
        identity: { canonicalHash: string; normalizedHash: string };
        strategies: {
          kind: string;
          strategyId: string;
          strategyVersion: string;
          options: unknown;
        }[];
      };
    };
    const proportional = JSON.parse(
      await readFile(join(first, "proportional-spatial-melody", "manifest.json"), "utf8"),
    ) as typeof grid;
    expect(proportional.resolvedOptions.identity.canonicalHash).toBe(
      grid.resolvedOptions.identity.canonicalHash,
    );
    expect(proportional.resolvedOptions.identity.normalizedHash).toBe(
      grid.resolvedOptions.identity.normalizedHash,
    );
    const pitch = (manifest: typeof grid) =>
      manifest.resolvedOptions.strategies.find(({ kind }) => kind === "pitch-mapping");
    expect(pitch(proportional)).toEqual(pitch(grid));
    expect(pitch(grid)).toMatchObject({
      strategyId: "mnls.pitch.absolute-chromatic-y",
      strategyVersion: "1",
    });

    const files = await fileBytes(first);
    expect(Object.keys(files)).not.toContain("observations.json");
    expect(files["experiment-run.json"]).toContain('"humanObservationResultsGenerated": false');
    expect(Object.values(files).join("\n").toLowerCase()).not.toMatch(
      /final notation|approved notation|preferred treatment|winning treatment|treatment is effective/u,
    );
  });

  it("changes resolution and treatment evidence when a declared time variable changes", async () => {
    const document = (await json(
      "corpus/fixtures/melody-spatial-a/canonical.json",
    )) as CanonicalDocument;
    const prepared = prepareCanonical(document);
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    const plan = (await json(
      "learning/expected/melody-spatial-a.learning-plan.json",
    )) as LearningPlan;
    const definition = (await json(
      "learning/transformations/idea-boundary.learning-transform.json",
    )) as LearningTransformationDefinition;
    const recipe = (await json(
      "experiments/recipes/proportional-spatial-melody.recipe.json",
    )) as RepresentationRecipe;
    const baseline = executeTreatment({
      prepared: prepared.value,
      recipeInput: recipe,
      planInput: plan,
      definitionInput: definition,
    });
    const changedRecipe: RepresentationRecipe = {
      ...recipe,
      strategies: {
        ...recipe.strategies,
        timeMapping: {
          ...recipe.strategies.timeMapping,
          options: { unitsPerBeat: 120 },
        },
      },
    };
    const changed = executeTreatment({
      prepared: prepared.value,
      recipeInput: changedRecipe,
      planInput: plan,
      definitionInput: definition,
    });
    expect(baseline.ok && changed.ok).toBe(true);
    if (!baseline.ok || !changed.ok) return;
    expect(changed.value.recipe.resolutionHash).not.toBe(baseline.value.recipe.resolutionHash);
    expect(changed.value.bundle.manifest.runHash).not.toBe(baseline.value.bundle.manifest.runHash);
    expect(changed.value.layout.source).toEqual(baseline.value.layout.source);
    expect(changed.value.recipe.selections.find(({ kind }) => kind === "pitch-mapping")).toEqual(
      baseline.value.recipe.selections.find(({ kind }) => kind === "pitch-mapping"),
    );
  });
});
