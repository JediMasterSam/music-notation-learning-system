import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

import { analyzeArrangementCapabilities } from "@mnls/capability-analysis";
import { createVocabularyReport, runCorpusTest } from "@mnls/corpus-tools";
import {
  generateLearningPlan,
  listLearningStrategies,
  verifyLearningPlan,
  type LearningPlan,
} from "@mnls/learning";
import {
  canonicalStringify,
  contentHash,
  type CanonicalDocument,
  type Diagnostic,
  type JSONValue,
} from "@mnls/model";
import { renderComparisonPage } from "@mnls/renderer-html";
import { schemaIds, validateArtifact } from "@mnls/schema";
import { transposeCanonicalDocument } from "@mnls/transposition";
import { validateCanonicalSemantics } from "@mnls/validator";
import {
  createExperimentRunManifest,
  listBuiltInStrategies,
  validateExperimentDefinition,
  validateRepresentationRecipe,
  type ExperimentDefinition,
  type VersionedContentRef,
} from "@mnls/workbench";

import {
  executeTreatment,
  prepareCanonical,
  toolVersions,
  type ExecutedTreatment,
  type PreparedCanonical,
} from "./pipeline.js";

export type { ExecutedTreatment, PreparedCanonical } from "./pipeline.js";
export { executeTreatment, prepareCanonical } from "./pipeline.js";

export interface CliIO {
  readonly cwd: string;
  readonly stdout: (text: string) => void;
  readonly stderr: (text: string) => void;
}

const defaultIO: CliIO = {
  cwd: process.cwd(),
  stdout: (text) => process.stdout.write(text),
  stderr: (text) => process.stderr.write(text),
};

class CliFailure extends Error {
  constructor(readonly diagnostics: readonly Diagnostic[]) {
    super(diagnostics.map(({ message }) => message).join("; "));
  }
}

function diagnostic(code: string, message: string, jsonPointer?: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "experiment",
    message,
    ...(jsonPointer ? { jsonPointer } : {}),
    requirementIds: ["R-048", "R-049", "R-057"],
  };
}

function reject<T>(
  result:
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly diagnostics: readonly Diagnostic[] },
): T {
  if (!result.ok) throw new CliFailure(result.diagnostics);
  return result.value;
}

function required(value: string | undefined, usage: string): string {
  if (value === undefined) {
    throw new CliFailure([
      diagnostic("CLI_ARGUMENT_REQUIRED", `Missing argument. Usage: ${usage}`),
    ]);
  }
  return value;
}

function flag(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function flagValues(args: readonly string[], name: string): readonly string[] {
  const index = args.indexOf(name);
  if (index < 0) return [];
  const values: string[] = [];
  for (const value of args.slice(index + 1)) {
    if (value.startsWith("--")) break;
    values.push(value);
  }
  return values;
}

async function readJson(path: string, io: CliIO): Promise<unknown> {
  const absolute = resolve(io.cwd, path);
  try {
    return JSON.parse(await readFile(absolute, "utf8")) as unknown;
  } catch (error) {
    throw new CliFailure([
      diagnostic(
        "CLI_INPUT_READ_FAILED",
        `Could not read JSON input ${path}: ${error instanceof Error ? error.message : "unknown error"}`,
      ),
    ]);
  }
}

async function writeText(path: string, text: string, io: CliIO): Promise<void> {
  const absolute = resolve(io.cwd, path);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, text, "utf8");
}

async function emit(value: unknown, outPath: string | undefined, io: CliIO): Promise<void> {
  const serialized = canonicalStringify(value);
  if (outPath) await writeText(outPath, serialized, io);
  else io.stdout(serialized);
}

function safeBundlePath(path: string): boolean {
  return (
    !isAbsolute(path) &&
    !path.includes("\\") &&
    path.split("/").every((part) => part.length > 0 && part !== "." && part !== "..")
  );
}

async function writeBundle(
  outputDirectory: string,
  files: Readonly<Record<string, string>>,
  io: CliIO,
): Promise<void> {
  const root = resolve(io.cwd, outputDirectory);
  for (const [path, contents] of Object.entries(files).sort(([left], [right]) =>
    left.localeCompare(right, "en"),
  )) {
    if (!safeBundlePath(path)) {
      throw new CliFailure([
        diagnostic("CLI_OUTPUT_PATH_INVALID", `Generated output path ${path} is unsafe.`),
      ]);
    }
    const target = resolve(root, path);
    if (relative(root, target).startsWith("..")) {
      throw new CliFailure([
        diagnostic("CLI_OUTPUT_PATH_INVALID", `Generated output path ${path} escapes its root.`),
      ]);
    }
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, "utf8");
  }
}

async function optionalPlanInputs(
  args: readonly string[],
  io: CliIO,
): Promise<{ readonly planInput?: unknown; readonly definitionInput?: unknown }> {
  const planPath = flag(args, "--plan");
  const definitionPath = flag(args, "--definition");
  return {
    ...(planPath ? { planInput: await readJson(planPath, io) } : {}),
    ...(definitionPath ? { definitionInput: await readJson(definitionPath, io) } : {}),
  };
}

async function preparedFromArgs(
  canonicalPath: string,
  args: readonly string[],
  io: CliIO,
): Promise<PreparedCanonical> {
  return reject(
    prepareCanonical(await readJson(canonicalPath, io), flag(args, "--arrangement-id")),
  );
}

async function renderCommand(args: readonly string[], io: CliIO): Promise<void> {
  const canonicalPath = required(
    args[0],
    "music render <canonical.json> --recipe <recipe.json> --out <dir>",
  );
  const recipePath = required(
    flag(args, "--recipe"),
    "music render <canonical.json> --recipe <recipe.json> --out <dir>",
  );
  const outputDirectory = required(
    flag(args, "--out"),
    "music render <canonical.json> --recipe <recipe.json> --out <dir>",
  );
  const prepared = await preparedFromArgs(canonicalPath, args, io);
  const treatment = reject(
    executeTreatment({
      prepared,
      recipeInput: await readJson(recipePath, io),
      ...(await optionalPlanInputs(args, io)),
    }),
  );
  await writeBundle(outputDirectory, treatment.bundle.files, io);
  io.stdout(`${treatment.bundle.manifest.runHash}\n`);
}

async function compareCommand(args: readonly string[], io: CliIO): Promise<void> {
  const canonicalPath = required(
    args[0],
    "music compare <canonical.json> --recipes <a.json> <b.json> --out <dir>",
  );
  const recipePaths = flagValues(args, "--recipes");
  if (recipePaths.length < 2) {
    throw new CliFailure([
      diagnostic("CLI_ARGUMENT_REQUIRED", "Comparison requires at least two recipe paths."),
    ]);
  }
  const outputDirectory = required(
    flag(args, "--out"),
    "music compare <canonical.json> --recipes <a.json> <b.json> --out <dir>",
  );
  const prepared = await preparedFromArgs(canonicalPath, args, io);
  const planInputs = await optionalPlanInputs(args, io);
  const treatments: ExecutedTreatment[] = [];
  for (const recipePath of recipePaths) {
    treatments.push(
      reject(
        executeTreatment({
          prepared,
          recipeInput: await readJson(recipePath, io),
          ...planInputs,
        }),
      ),
    );
  }
  if (new Set(treatments.map(({ slug }) => slug)).size !== treatments.length) {
    throw new CliFailure([
      diagnostic("CLI_TREATMENT_PATH_COLLISION", "Resolved recipe IDs produce duplicate paths."),
    ]);
  }
  const comparison = reject(
    renderComparisonPage(
      "Music notation treatment comparison",
      treatments.map((treatment) => ({
        href: `${treatment.slug}/index.html`,
        rendered: treatment.rendered,
      })),
    ),
  );
  const files: Record<string, string> = {
    "index.html": comparison,
    "diagnostics.json": canonicalStringify([]),
  };
  for (const treatment of treatments) {
    for (const [path, contents] of Object.entries(treatment.bundle.files)) {
      files[`${treatment.slug}/${path}`] = contents;
    }
  }
  await writeBundle(outputDirectory, files, io);
  io.stdout(`${contentHash(files)}\n`);
}

async function repositoryRoot(start: string): Promise<string> {
  let current = resolve(start);
  for (;;) {
    try {
      const packageValue = JSON.parse(await readFile(join(current, "package.json"), "utf8")) as {
        readonly name?: string;
      };
      if (packageValue.name === "@mnls/root") return current;
    } catch {
      // Continue toward the filesystem root.
    }
    const parent = dirname(current);
    if (parent === current) {
      throw new CliFailure([
        diagnostic("CLI_REPOSITORY_NOT_FOUND", "Could not locate the MNLS repository root."),
      ]);
    }
    current = parent;
  }
}

interface LocatedArtifact {
  readonly path: string;
  readonly value: unknown;
}

async function jsonArtifacts(directory: string): Promise<readonly LocatedArtifact[]> {
  let names: readonly string[];
  try {
    names = await readdir(directory);
  } catch {
    return [];
  }
  const values: LocatedArtifact[] = [];
  for (const name of [...names].sort((left, right) => left.localeCompare(right, "en"))) {
    const path = join(directory, name);
    if (!name.endsWith(".json")) continue;
    values.push({ path, value: JSON.parse(await readFile(path, "utf8")) as unknown });
  }
  return values;
}

async function fixtureArtifacts(root: string): Promise<readonly LocatedArtifact[]> {
  const fixtureRoot = join(root, "corpus", "fixtures");
  const directories = await readdir(fixtureRoot, { withFileTypes: true });
  const artifacts: LocatedArtifact[] = [];
  for (const directory of directories
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name, "en"))) {
    const path = join(fixtureRoot, directory.name, "canonical.json");
    artifacts.push({ path, value: JSON.parse(await readFile(path, "utf8")) as unknown });
  }
  return artifacts;
}

function artifactIdentity(value: unknown): { readonly id?: string; readonly version?: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  return {
    ...(typeof record.id === "string" ? { id: record.id } : {}),
    ...(typeof record.version === "string"
      ? { version: record.version }
      : typeof record.schemaVersion === "string"
        ? { version: record.schemaVersion }
        : {}),
  };
}

function resolveArtifact(
  ref: VersionedContentRef,
  artifacts: readonly LocatedArtifact[],
): LocatedArtifact {
  const candidate = artifacts.find(({ value }) => {
    const identity = artifactIdentity(value);
    return identity.id === ref.id && identity.version === ref.version;
  });
  if (!candidate) {
    throw new CliFailure([
      diagnostic(
        "EXPERIMENT_REF_INVALID",
        `Pinned artifact ${ref.id}@${ref.version} is unavailable.`,
      ),
    ]);
  }
  const actualHash = contentHash(candidate.value);
  if (actualHash !== ref.contentHash) {
    throw new CliFailure([
      diagnostic(
        "REPRODUCIBILITY_HASH_MISMATCH",
        `Pinned artifact ${ref.id}@${ref.version} expected ${ref.contentHash} but found ${actualHash}.`,
      ),
    ]);
  }
  return candidate;
}

function experimentTitle(definition: ExperimentDefinition): string {
  const leaf = definition.id.split(".").at(-1) ?? definition.id;
  return leaf
    .split("-")
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

async function experimentCommand(
  definitionPath: string,
  args: readonly string[],
  io: CliIO,
): Promise<void> {
  const outputDirectory = required(
    flag(args, "--out"),
    "music experiment run <experiment.json> --out <dir>",
  );
  const definitionValue = await readJson(definitionPath, io);
  const definition = reject(validateExperimentDefinition(definitionValue));
  if (definition.fixtureRefs.length !== 1) {
    throw new CliFailure([
      diagnostic(
        "EXPERIMENT_SCOPE_UNSUPPORTED",
        "Sprint 1 comparison execution requires exactly one pinned canonical fixture.",
      ),
    ]);
  }
  const root = await repositoryRoot(dirname(resolve(io.cwd, definitionPath)));
  const fixtures = await fixtureArtifacts(root);
  const recipes = await jsonArtifacts(join(root, "experiments", "recipes"));
  const transformations = await jsonArtifacts(join(root, "learning", "transformations"));
  const fixture = resolveArtifact(definition.fixtureRefs[0]!, fixtures);
  const resolvedRecipes = definition.treatmentRefs.map((ref) => resolveArtifact(ref, recipes));
  const transformationRefs = definition.learningTransformationRefs ?? [];
  if (transformationRefs.length > 1) {
    throw new CliFailure([
      diagnostic(
        "EXPERIMENT_SCOPE_UNSUPPORTED",
        "Sprint 1 comparison execution supports at most one learning transformation.",
      ),
    ]);
  }
  const transformation = transformationRefs[0]
    ? resolveArtifact(transformationRefs[0], transformations)
    : undefined;
  const prepared = reject(prepareCanonical(fixture.value));
  let generatedPlan: LearningPlan | undefined;
  let parameters: JSONValue | undefined;
  let parameterRef: VersionedContentRef | undefined;
  if (transformation) {
    const parameterPath = transformation.path.replace(
      /\.learning-transform\.json$/u,
      ".parameters.json",
    );
    parameters = JSON.parse(await readFile(parameterPath, "utf8")) as JSONValue;
    parameterRef = {
      id: `${artifactIdentity(transformation.value).id}.parameters`,
      version: "1",
      contentHash: contentHash(parameters),
    };
    const profile = analyzeArrangementCapabilities(prepared.document, prepared.normalized);
    generatedPlan = reject(
      generateLearningPlan(
        prepared.document,
        prepared.normalized,
        profile,
        transformation.value,
        parameters,
      ),
    );
  }
  const treatments = resolvedRecipes.map(({ value }) =>
    reject(
      executeTreatment({
        prepared,
        recipeInput: value,
        ...(generatedPlan && transformation
          ? { planInput: generatedPlan, definitionInput: transformation.value }
          : {}),
      }),
    ),
  );
  if (new Set(treatments.map(({ slug }) => slug)).size !== treatments.length) {
    throw new CliFailure([
      diagnostic("CLI_TREATMENT_PATH_COLLISION", "Resolved recipe IDs produce duplicate paths."),
    ]);
  }
  const comparison = reject(
    renderComparisonPage(
      experimentTitle(definition),
      treatments.map((treatment) => ({
        href: `${treatment.slug}/index.html`,
        rendered: treatment.rendered,
      })),
    ),
  );
  const outputFiles: Record<string, string> = {
    "index.html": comparison,
    "diagnostics.json": canonicalStringify([]),
  };
  for (const treatment of treatments) {
    for (const [path, contents] of Object.entries(treatment.bundle.files)) {
      outputFiles[`${treatment.slug}/${path}`] = contents;
    }
  }
  const inputRefs: VersionedContentRef[] = [
    {
      id: definition.id,
      version: definition.version,
      contentHash: contentHash(definition),
    },
    ...definition.fixtureRefs,
    ...definition.treatmentRefs,
    ...transformationRefs,
    ...(parameterRef ? [parameterRef] : []),
  ];
  const runManifest = reject(
    createExperimentRunManifest({
      id: `run.${definition.id}`,
      definition,
      definitionHash: contentHash(definition),
      inputRefs,
      toolVersions,
      treatments: treatments.map((treatment) => ({
        id: treatment.slug,
        recipeRef: treatment.recipe.recipeRef,
        resolutionHash: treatment.recipe.resolutionHash,
        treatmentRunHash: treatment.bundle.manifest.runHash,
        status: treatment.recipe.authoredIdentity.status,
      })),
      outputFiles,
      diagnostics: [],
    }),
  );
  outputFiles["experiment-run.json"] = canonicalStringify(runManifest);
  await writeBundle(outputDirectory, outputFiles, io);
  io.stdout(`${runManifest.runHash}\n`);
}

async function validateCommand(path: string, io: CliIO): Promise<void> {
  const value = await readJson(path, io);
  const structural = validateArtifact(schemaIds.canonical, value);
  if (!structural.ok) throw new CliFailure(structural.diagnostics);
  const semantic = validateCanonicalSemantics(value as CanonicalDocument);
  if (!semantic.ok) throw new CliFailure(semantic.diagnostics);
  await emit({ ok: true, canonicalHash: contentHash(semantic.value) }, undefined, io);
}

async function normalizeCommand(path: string, args: readonly string[], io: CliIO): Promise<void> {
  const prepared = await preparedFromArgs(path, args, io);
  await emit(prepared.normalized, flag(args, "--out"), io);
}

async function transposeCommand(path: string, args: readonly string[], io: CliIO): Promise<void> {
  const semitoneText = required(
    flag(args, "--semitones"),
    "music transpose <canonical.json> --semitones <integer> [--out <file>]",
  );
  const semitones = Number(semitoneText);
  if (!Number.isSafeInteger(semitones)) {
    throw new CliFailure([
      diagnostic("CLI_ARGUMENT_INVALID", "--semitones must be a safe integer."),
    ]);
  }
  const prepared = await preparedFromArgs(path, args, io);
  const result = reject(transposeCanonicalDocument(prepared.document, { semitones }));
  await emit(result.document, flag(args, "--out"), io);
}

async function recipeCommand(args: readonly string[], io: CliIO): Promise<void> {
  const operation = required(args[0], "music recipe validate|resolve ...");
  const recipePath = required(args[1], `music recipe ${operation} <recipe.json>`);
  const recipeValue = await readJson(recipePath, io);
  if (operation === "validate") {
    const recipe = reject(validateRepresentationRecipe(recipeValue));
    await emit(
      {
        ok: true,
        recipeRef: { id: recipe.id, version: recipe.version, contentHash: contentHash(recipe) },
      },
      flag(args, "--out"),
      io,
    );
    return;
  }
  if (operation !== "resolve") {
    throw new CliFailure([
      diagnostic("CLI_COMMAND_UNKNOWN", `Unknown recipe command ${operation}.`),
    ]);
  }
  const arrangementPath = required(
    flag(args, "--arrangement"),
    "music recipe resolve <recipe.json> --arrangement <canonical.json>",
  );
  const prepared = await preparedFromArgs(arrangementPath, args, io);
  const planInputs = await optionalPlanInputs(args, io);
  const executed = reject(executeTreatment({ prepared, recipeInput: recipeValue, ...planInputs }));
  await emit(executed.recipe, flag(args, "--out"), io);
}

async function learningCommand(args: readonly string[], io: CliIO): Promise<void> {
  const operation = required(args[0], "music learning strategy|validate|plan|verify ...");
  if (operation === "strategy") {
    if (args[1] !== "list") {
      throw new CliFailure([
        diagnostic("CLI_COMMAND_UNKNOWN", "Use music learning strategy list."),
      ]);
    }
    await emit(listLearningStrategies(), undefined, io);
    return;
  }
  if (operation === "validate") {
    const path = required(args[1], "music learning validate <definition-or-plan.json>");
    const value = await readJson(path, io);
    const isPlan = typeof value === "object" && value !== null && "planHash" in (value as object);
    const validation = validateArtifact(
      isPlan ? schemaIds.learningPlan : schemaIds.learningTransformation,
      value,
    );
    if (!validation.ok) throw new CliFailure(validation.diagnostics);
    await emit({ ok: true, contentHash: contentHash(value) }, flag(args, "--out"), io);
    return;
  }
  if (operation === "plan") {
    const canonicalPath = required(
      args[1],
      "music learning plan <canonical.json> --definition <file> --parameters <file>",
    );
    const definitionPath = required(
      flag(args, "--definition"),
      "music learning plan <canonical.json> --definition <file> --parameters <file>",
    );
    const parametersPath = required(
      flag(args, "--parameters"),
      "music learning plan <canonical.json> --definition <file> --parameters <file>",
    );
    const prepared = await preparedFromArgs(canonicalPath, args, io);
    const profile = analyzeArrangementCapabilities(prepared.document, prepared.normalized);
    const plan = reject(
      generateLearningPlan(
        prepared.document,
        prepared.normalized,
        profile,
        await readJson(definitionPath, io),
        (await readJson(parametersPath, io)) as JSONValue,
      ),
    );
    await emit(plan, flag(args, "--out"), io);
    return;
  }
  if (operation === "verify") {
    const planPath = required(
      args[1],
      "music learning verify <plan.json> --arrangement <canonical.json> --definition <file>",
    );
    const arrangementPath = required(
      flag(args, "--arrangement"),
      "music learning verify <plan.json> --arrangement <canonical.json> --definition <file>",
    );
    const definitionPath = required(
      flag(args, "--definition"),
      "music learning verify <plan.json> --arrangement <canonical.json> --definition <file>",
    );
    const prepared = await preparedFromArgs(arrangementPath, args, io);
    const plan = await readJson(planPath, io);
    const executedPlanSchema = validateArtifact(schemaIds.learningPlan, plan);
    if (!executedPlanSchema.ok) throw new CliFailure(executedPlanSchema.diagnostics);
    const verified = reject(
      verifyLearningPlan(
        plan as LearningPlan,
        prepared.document,
        prepared.normalized,
        await readJson(definitionPath, io),
      ),
    );
    await emit(verified, flag(args, "--out"), io);
    return;
  }
  throw new CliFailure([
    diagnostic("CLI_COMMAND_UNKNOWN", `Unknown learning command ${operation}.`),
  ]);
}

async function strategyCommand(args: readonly string[], io: CliIO): Promise<void> {
  const operation = required(args[0], "music strategy list|describe ...");
  const strategies = listBuiltInStrategies();
  if (operation === "list") {
    const kind = flag(args, "--kind");
    await emit(
      kind ? strategies.filter((strategy) => strategy.kind === kind) : strategies,
      undefined,
      io,
    );
    return;
  }
  if (operation === "describe") {
    const reference = required(args[1], "music strategy describe <strategy-id>@<version>");
    const strategy = strategies.find(({ id, version }) => `${id}@${version}` === reference);
    if (!strategy) {
      throw new CliFailure([
        diagnostic("STRATEGY_NOT_FOUND", `Pinned strategy ${reference} is unavailable.`),
      ]);
    }
    await emit(strategy, undefined, io);
    return;
  }
  throw new CliFailure([
    diagnostic("CLI_COMMAND_UNKNOWN", `Unknown strategy command ${operation}.`),
  ]);
}

const help = `music validate <canonical.json>
music normalize <canonical.json> [--out <file>]
music transpose <canonical.json> --semitones <integer> [--out <file>]
music strategy list|describe
music recipe validate|resolve
music learning strategy list|validate|plan|verify
music render <canonical.json> --recipe <recipe.json> --out <dir>
music compare <canonical.json> --recipes <a.json> <b.json> --out <dir>
music experiment run <experiment.json> --out <dir>
music corpus test
music vocabulary report
`;

export async function runCli(argv: readonly string[], io: CliIO = defaultIO): Promise<number> {
  try {
    const command = argv[0];
    if (!command || command === "help" || command === "--help") {
      io.stdout(help);
      return 0;
    }
    if (command === "validate") await validateCommand(required(argv[1], help), io);
    else if (command === "normalize")
      await normalizeCommand(required(argv[1], help), argv.slice(2), io);
    else if (command === "transpose")
      await transposeCommand(required(argv[1], help), argv.slice(2), io);
    else if (command === "strategy") await strategyCommand(argv.slice(1), io);
    else if (command === "recipe") await recipeCommand(argv.slice(1), io);
    else if (command === "learning") await learningCommand(argv.slice(1), io);
    else if (command === "render") await renderCommand(argv.slice(1), io);
    else if (command === "compare") await compareCommand(argv.slice(1), io);
    else if (command === "experiment") {
      if (argv[1] !== "run") {
        throw new CliFailure([diagnostic("CLI_COMMAND_UNKNOWN", "Use music experiment run.")]);
      }
      await experimentCommand(required(argv[2], help), argv.slice(3), io);
    } else if (command === "corpus" && argv[1] === "test") {
      const root = await repositoryRoot(io.cwd);
      const report = runCorpusTest(
        (await fixtureArtifacts(root)).map(({ path, value }) => ({
          path: relative(root, path),
          value,
        })),
      );
      await emit(report, flag(argv, "--out"), io);
      if (report.status !== "pass") throw new CliFailure(report.diagnostics);
    } else if (command === "vocabulary" && argv[1] === "report") {
      await emit(
        createVocabularyReport({
          experimentStrategyIds: listBuiltInStrategies().map(({ id }) => id),
          learningTransformationIds: listLearningStrategies().map(({ id }) => id),
        }),
        flag(argv, "--out"),
        io,
      );
    } else {
      throw new CliFailure([
        diagnostic("CLI_COMMAND_UNKNOWN", `Unknown command ${argv.join(" ")}.`),
      ]);
    }
    return 0;
  } catch (error) {
    const diagnostics =
      error instanceof CliFailure
        ? error.diagnostics
        : [
            diagnostic(
              "CLI_UNEXPECTED_ERROR",
              error instanceof Error ? error.message : "Unexpected CLI error.",
            ),
          ];
    io.stderr(canonicalStringify({ ok: false, diagnostics }));
    return 1;
  }
}

export function currentExecutableName(): string {
  return basename(process.argv[1] ?? "music");
}
