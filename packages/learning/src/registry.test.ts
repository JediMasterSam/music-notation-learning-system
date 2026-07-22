import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { LearningTransformationRegistry, type LearningTransformationDescriptor } from "./index.js";

function descriptor(id: string): LearningTransformationDescriptor {
  return {
    id,
    version: "1",
    optionSchemaRef: `${id}.options@1`,
    requiresCapabilities: [
      { source: "arrangement", capability: "structure.musical-ideas", acceptedStates: ["present"] },
    ],
    providesPlanCapabilities: [{ capability: "learning-plan.has-chunks", state: "present" }],
    deterministic: true,
  };
}

describe("learning transformation registry boundary", () => {
  it("resolves exact versions and orders descriptors deterministically", () => {
    const registry = new LearningTransformationRegistry<string>();
    registry.register(descriptor("mnls.learning.b"), "b");
    registry.register(descriptor("mnls.learning.a"), "a");
    expect(registry.list().map(({ id }) => id)).toEqual(["mnls.learning.a", "mnls.learning.b"]);
    expect(registry.resolve("mnls.learning.a", "1")).toMatchObject({
      ok: true,
      implementation: "a",
    });
    expect(registry.resolve("mnls.learning.a", "2")).toMatchObject({
      ok: false,
      status: "unavailable",
    });
  });

  it("has no workbench orchestration dependency", () => {
    const packageJson = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { dependencies?: Record<string, string> };
    expect(packageJson.dependencies).not.toHaveProperty("@mnls/workbench");
  });
});
