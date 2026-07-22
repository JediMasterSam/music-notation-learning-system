import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const allowed = {
  schema: [],
  model: [],
  capabilities: [],
  pitch: ["model"],
  harmony: ["model", "pitch"],
  validator: ["harmony", "model", "patterns", "pitch"],
  patterns: ["model", "pitch"],
  normalizer: ["model", "patterns", "validator"],
  transposition: ["model", "normalizer", "pitch"],
  "capability-analysis": ["capabilities", "model", "normalizer"],
  learning: ["capabilities", "model", "normalizer"],
  workbench: ["capabilities", "model", "schema"],
  projection: ["learning", "model", "normalizer", "workbench"],
  layout: ["model", "pitch", "projection", "workbench"],
  "renderer-html": ["layout"],
  "corpus-tools": [
    "capabilities",
    "capability-analysis",
    "harmony",
    "learning",
    "model",
    "normalizer",
    "renderer-html",
    "schema",
    "validator",
    "workbench",
  ],
  cli: [
    "capabilities",
    "capability-analysis",
    "corpus-tools",
    "harmony",
    "layout",
    "learning",
    "model",
    "normalizer",
    "patterns",
    "pitch",
    "projection",
    "renderer-html",
    "schema",
    "transposition",
    "validator",
    "workbench",
  ],
  "test-fixtures": ["harmony", "model"],
  "workbench-web": ["learning", "workbench"],
};

const packageNames = new Set(Object.keys(allowed));
const importPattern = /(?:from\s+|import\s*\()["']@mnls\/([^"'/)]+)[^"')]*["']/g;
const violations = [];

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) files.push(path);
  }
  return files;
}

for (const packageName of packageNames) {
  const files = await sourceFiles(join("packages", packageName, "src"));
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const imported = match[1];
      if (imported && imported !== packageName && !allowed[packageName].includes(imported)) {
        violations.push(`${packageName} may not import @mnls/${imported} (${file})`);
      }
    }
  }
}

if (violations.length > 0) {
  console.error(violations.sort().join("\n"));
  process.exitCode = 1;
} else {
  console.log("Package dependency directions are valid.");
}
