import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { canonicalStringify } from "@mnls/model";

import { runCli, type CliIO } from "./index.js";

const repositoryRoot = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const outputRoot = join(repositoryRoot, "output");
  await mkdir(outputRoot, { recursive: true });
  const directory = await mkdtemp(join(outputRoot, "cli-integration-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })),
  );
});

function harness(): {
  readonly io: CliIO;
  readonly stdout: string[];
  readonly stderr: string[];
} {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    io: {
      cwd: repositoryRoot,
      stdout: (text) => stdout.push(text),
      stderr: (text) => stderr.push(text),
    },
    stdout,
    stderr,
  };
}

async function fileBytes(directory: string): Promise<Readonly<Record<string, string>>> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const files: Record<string, string> = {};
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const parent = entry.parentPath;
    const absolute = join(parent, entry.name);
    const relative = absolute.slice(directory.length + 1);
    files[relative] = await readFile(absolute, "utf8");
  }
  return Object.fromEntries(
    Object.entries(files).sort(([left], [right]) => left.localeCompare(right, "en")),
  );
}

const canonicalPath = "corpus/fixtures/melody-spatial-a/canonical.json";
const definitionPath = "learning/transformations/idea-boundary.learning-transform.json";
const parametersPath = "learning/transformations/idea-boundary.parameters.json";
const planPath = "learning/expected/melody-spatial-a.learning-plan.json";
const gridRecipePath = "experiments/recipes/explicit-grid.recipe.json";
const proportionalRecipePath = "experiments/recipes/proportional-spatial-melody.recipe.json";
const experimentPath = "experiments/definitions/spatial-melody-comparison.experiment.json";

describe("music CLI command surface", () => {
  it("validates, transforms, discovers, plans, and verifies through public commands", async () => {
    const temp = await temporaryDirectory();
    const normalizedPath = join(temp, "normalized.json");
    const transposedPath = join(temp, "transposed.json");
    const generatedPlanPath = join(temp, "plan.json");
    const commands: readonly (readonly string[])[] = [
      ["validate", canonicalPath],
      ["normalize", canonicalPath, "--out", normalizedPath],
      ["transpose", canonicalPath, "--semitones", "2", "--out", transposedPath],
      ["strategy", "list"],
      ["strategy", "describe", "mnls.time.proportional@1"],
      ["recipe", "validate", gridRecipePath],
      [
        "recipe",
        "resolve",
        gridRecipePath,
        "--arrangement",
        canonicalPath,
        "--plan",
        planPath,
        "--definition",
        definitionPath,
      ],
      ["learning", "strategy", "list"],
      ["learning", "validate", definitionPath],
      ["learning", "validate", planPath],
      [
        "learning",
        "plan",
        canonicalPath,
        "--definition",
        definitionPath,
        "--parameters",
        parametersPath,
        "--out",
        generatedPlanPath,
      ],
      [
        "learning",
        "verify",
        generatedPlanPath,
        "--arrangement",
        canonicalPath,
        "--definition",
        definitionPath,
      ],
      ["corpus", "test"],
      ["vocabulary", "report"],
    ];
    for (const command of commands) {
      const { io, stderr } = harness();
      expect(await runCli(command, io), command.join(" ")).toBe(0);
      expect(stderr).toEqual([]);
    }
    expect(JSON.parse(await readFile(normalizedPath, "utf8"))).toMatchObject({
      arrangementId: "arrangement.melody-spatial-a",
      formatVersion: "0.1.0",
    });
    expect(JSON.parse(await readFile(transposedPath, "utf8"))).toMatchObject({
      id: "document.melody-spatial-a",
    });
    expect(canonicalStringify(JSON.parse(await readFile(generatedPlanPath, "utf8")))).toBe(
      canonicalStringify(JSON.parse(await readFile(planPath, "utf8"))),
    );
  });

  it("renders one treatment and compares two through the same pipeline", async () => {
    const temp = await temporaryDirectory();
    const renderDirectory = join(temp, "render");
    const compareDirectory = join(temp, "compare");
    const shared = ["--plan", planPath, "--definition", definitionPath] as const;
    const renderHarness = harness();
    expect(
      await runCli(
        ["render", canonicalPath, "--recipe", gridRecipePath, ...shared, "--out", renderDirectory],
        renderHarness.io,
      ),
    ).toBe(0);
    const compareHarness = harness();
    expect(
      await runCli(
        [
          "compare",
          canonicalPath,
          "--recipes",
          gridRecipePath,
          proportionalRecipePath,
          ...shared,
          "--out",
          compareDirectory,
        ],
        compareHarness.io,
      ),
    ).toBe(0);
    expect(await readFile(join(renderDirectory, "manifest.json"), "utf8")).toContain(
      '"artifactType": "treatment-manifest"',
    );
    const comparison = await readFile(join(compareDirectory, "index.html"), "utf8");
    expect(comparison).toContain("explicit-grid/index.html");
    expect(comparison).toContain("proportional-spatial-melody/index.html");
    expect(comparison).toContain("Status: comparison");
    expect(comparison.toLowerCase()).not.toMatch(
      /final notation|approved notation|preferred treatment|winning treatment/u,
    );
  });

  it("reproduces the committed experiment byte-for-byte from clean directories", async () => {
    const first = join(await temporaryDirectory(), "first");
    const second = join(await temporaryDirectory(), "second");
    const firstHarness = harness();
    const secondHarness = harness();
    expect(
      await runCli(["experiment", "run", experimentPath, "--out", first], firstHarness.io),
    ).toBe(0);
    expect(
      await runCli(["experiment", "run", experimentPath, "--out", second], secondHarness.io),
    ).toBe(0);
    expect(await fileBytes(second)).toEqual(await fileBytes(first));
    expect(secondHarness.stdout).toEqual(firstHarness.stdout);
    const run = JSON.parse(await readFile(join(first, "experiment-run.json"), "utf8")) as {
      readonly runHash: string;
      readonly resolvedOptions: {
        readonly experiment: { readonly humanObservationResultsGenerated: boolean };
        readonly treatments: readonly unknown[];
      };
    };
    expect(run.runHash).toMatch(/^sha256:[a-f0-9]{64}$/u);
    expect(run.resolvedOptions.treatments).toHaveLength(2);
    expect(run.resolvedOptions.experiment.humanObservationResultsGenerated).toBe(false);
    expect(await readFile(join(first, "diagnostics.json"), "utf8")).toBe("[]\n");
  });

  it("fails a stale pinned hash without producing experiment output", async () => {
    const temp = await temporaryDirectory();
    const definition = JSON.parse(await readFile(join(repositoryRoot, experimentPath), "utf8")) as {
      treatmentRefs: { contentHash: string }[];
    };
    definition.treatmentRefs[0]!.contentHash = `sha256:${"0".repeat(64)}`;
    const stalePath = join(temp, "stale.experiment.json");
    await writeFile(stalePath, canonicalStringify(definition), "utf8");
    const output = join(temp, "should-not-exist");
    const { io, stderr } = harness();
    expect(await runCli(["experiment", "run", stalePath, "--out", output], io)).toBe(1);
    expect(stderr.join("")).toContain("REPRODUCIBILITY_HASH_MISMATCH");
    await expect(readdir(output)).rejects.toThrow();
  });
});
