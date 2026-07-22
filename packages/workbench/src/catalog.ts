import type {
  CapabilityDeclaration,
  CapabilityDiagnostic,
  CapabilityRequirement,
} from "@mnls/capabilities";

export type StrategyKind =
  | "time-mapping"
  | "pitch-mapping"
  | "duration-encoding"
  | "pitch-labels"
  | "structural-overlay"
  | "harmonic-overlay"
  | "disclosure"
  | "renderer";

export interface LimitationDeclaration {
  readonly class: string;
  readonly message: string;
}

export interface StrategyDescriptor {
  readonly id: string;
  readonly version: string;
  readonly kind: StrategyKind;
  readonly displayName: string;
  readonly status: "experimental" | "comparison" | "internal";
  readonly optionSchemaRef: string;
  readonly requiresCapabilities: readonly CapabilityRequirement[];
  readonly providesCapabilities: readonly CapabilityDeclaration[];
  readonly conflictsWith?: readonly string[];
  readonly limitations?: readonly LimitationDeclaration[];
  readonly deterministic: true;
}

export type CatalogResolution<TImplementation> =
  | {
      readonly ok: true;
      readonly descriptor: StrategyDescriptor;
      readonly implementation: TImplementation;
    }
  | {
      readonly ok: false;
      readonly status: "unavailable";
      readonly diagnostics: readonly CapabilityDiagnostic[];
    };

export class StrategyCatalog<TImplementation = unknown> {
  readonly #entries = new Map<
    string,
    { readonly descriptor: StrategyDescriptor; readonly implementation: TImplementation }
  >();

  register(descriptor: StrategyDescriptor, implementation: TImplementation): void {
    const key = `${descriptor.id}@${descriptor.version}`;
    if (this.#entries.has(key)) throw new Error(`Strategy ${key} is already registered.`);
    this.#entries.set(key, { descriptor, implementation });
  }

  resolve(id: string, version: string): CatalogResolution<TImplementation> {
    const entry = this.#entries.get(`${id}@${version}`);
    if (entry) return { ok: true, ...entry };
    return {
      ok: false,
      status: "unavailable",
      diagnostics: [
        {
          code: "STRATEGY_NOT_FOUND",
          severity: "error",
          stage: "capability",
          message: `Pinned strategy ${id}@${version} is unavailable.`,
          requirementSource: "selected-strategy",
          capability: `strategy:${id}@${version}`,
        },
      ],
    };
  }

  list(kind?: StrategyKind): readonly StrategyDescriptor[] {
    return [...this.#entries.values()]
      .map(({ descriptor }) => descriptor)
      .filter((descriptor) => kind === undefined || descriptor.kind === kind)
      .sort((left, right) =>
        `${left.id}@${left.version}`.localeCompare(`${right.id}@${right.version}`, "en"),
      );
  }
}
