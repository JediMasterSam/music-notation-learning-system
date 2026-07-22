import type {
  CapabilityDeclaration,
  CapabilityDiagnostic,
  CapabilityRequirement,
} from "@mnls/capabilities";

export interface LearningTransformationDescriptor {
  readonly id: string;
  readonly version: string;
  readonly optionSchemaRef: string;
  readonly requiresCapabilities: readonly CapabilityRequirement[];
  readonly providesPlanCapabilities: readonly CapabilityDeclaration[];
  readonly deterministic: true;
}

export type LearningTransformationResolution<TImplementation> =
  | {
      readonly ok: true;
      readonly descriptor: LearningTransformationDescriptor;
      readonly implementation: TImplementation;
    }
  | {
      readonly ok: false;
      readonly status: "unavailable";
      readonly diagnostics: readonly CapabilityDiagnostic[];
    };

export class LearningTransformationRegistry<TImplementation = unknown> {
  readonly #entries = new Map<
    string,
    {
      readonly descriptor: LearningTransformationDescriptor;
      readonly implementation: TImplementation;
    }
  >();

  register(descriptor: LearningTransformationDescriptor, implementation: TImplementation): void {
    const key = `${descriptor.id}@${descriptor.version}`;
    if (this.#entries.has(key))
      throw new Error(`Learning transformation ${key} is already registered.`);
    this.#entries.set(key, { descriptor, implementation });
  }

  resolve(id: string, version: string): LearningTransformationResolution<TImplementation> {
    const entry = this.#entries.get(`${id}@${version}`);
    if (entry) return { ok: true, ...entry };
    return {
      ok: false,
      status: "unavailable",
      diagnostics: [
        {
          code: "LEARN_TRANSFORM_NOT_FOUND",
          severity: "error",
          stage: "capability",
          message: `Pinned learning transformation ${id}@${version} is unavailable.`,
          requirementSource: "selected-strategy",
          capability: `learning-transformation:${id}@${version}`,
        },
      ],
    };
  }

  list(): readonly LearningTransformationDescriptor[] {
    return [...this.#entries.values()]
      .map(({ descriptor }) => descriptor)
      .sort((left, right) =>
        `${left.id}@${left.version}`.localeCompare(`${right.id}@${right.version}`, "en"),
      );
  }
}
