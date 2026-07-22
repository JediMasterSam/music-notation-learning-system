import type { Diagnostic, JSONValue, Rational, StageResult } from "@mnls/model";
import type { ProjectedEvent, ProjectedView } from "@mnls/projection";
import type { ResolvedRecipe, ResolvedStrategySelection } from "@mnls/workbench";

import type { LayoutScalar } from "./scalar.js";

export interface LayoutEnvironment {
  readonly viewportClass: "comparison-wide" | "print-preview";
  readonly scale: Rational;
  readonly locale: "en";
  readonly deterministicRoundingVersion: "mnls.decimal@1";
}

export interface MappedTime {
  readonly x: LayoutScalar;
  readonly referenceCellId?: string;
}

export interface DurationGeometry {
  readonly semanticEndX: LayoutScalar;
  readonly visibleStartX: LayoutScalar;
  readonly visibleEndX: LayoutScalar;
}

export interface MappedPitch {
  readonly y: LayoutScalar;
  readonly semitoneIndex: number;
}

export interface TimeMappingStrategy {
  readonly id: string;
  readonly version: string;
  mapTime(input: {
    readonly extentStart: Rational;
    readonly time: Rational;
    readonly environment: LayoutEnvironment;
    readonly options: Readonly<Record<string, JSONValue>>;
  }): StageResult<MappedTime>;
}

export interface DurationEncodingStrategy {
  readonly id: string;
  readonly version: string;
  encodeDuration(input: {
    readonly extentStart: Rational;
    readonly start: Rational;
    readonly duration: Rational;
    readonly mappedStart: MappedTime;
    readonly timeMapper: TimeMappingStrategy;
    readonly environment: LayoutEnvironment;
    readonly timeOptions: Readonly<Record<string, JSONValue>>;
    readonly options: Readonly<Record<string, JSONValue>>;
  }): StageResult<DurationGeometry>;
}

export interface PitchMappingStrategy {
  readonly id: string;
  readonly version: string;
  mapPitch(input: {
    readonly event: ProjectedEvent;
    readonly environment: LayoutEnvironment;
    readonly options: Readonly<Record<string, JSONValue>>;
  }): StageResult<MappedPitch>;
}

export interface SceneBounds {
  readonly x: LayoutScalar;
  readonly y: LayoutScalar;
  readonly width: LayoutScalar;
  readonly height: LayoutScalar;
}

export interface AriaDescription {
  readonly label: string;
  readonly description: string;
}

export type SceneNodeKind =
  | "event"
  | "label"
  | "time-marker"
  | "structure"
  | "harmony"
  | "specificity"
  | "learning-chunk"
  | "hint"
  | "decoration";

export interface SceneNode {
  readonly id: string;
  readonly kind: SceneNodeKind;
  readonly semanticTime: Rational;
  readonly bounds?: SceneBounds;
  readonly semanticEndX?: LayoutScalar;
  readonly text?: string;
  readonly classes: readonly string[];
  readonly sourceRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
  readonly strategyRef: string;
  readonly aria: AriaDescription;
}

export interface SceneRelationship {
  readonly type: "labels" | "contains";
  readonly fromNodeId: string;
  readonly toNodeId: string;
}

export interface AccessibleEventDescription {
  readonly nodeId: string;
  readonly sourceId: string;
  readonly exactPitch: string;
  readonly exactOnset: string;
  readonly exactDuration: string;
  readonly specificity: string;
  readonly roleIds: readonly string[];
  readonly text: string;
}

export interface AccessibilityPlan {
  readonly title: string;
  readonly description: string;
  readonly eventOrder: readonly string[];
  readonly events: readonly AccessibleEventDescription[];
  readonly overlays: readonly { readonly nodeId: string; readonly text: string }[];
}

export interface LayoutPlan {
  readonly formatVersion: "0.1.0";
  readonly viewId: string;
  readonly recipeRef: ResolvedRecipe["recipeRef"];
  readonly treatment: ResolvedRecipe["authoredIdentity"];
  readonly strategyRefs: readonly string[];
  readonly extent: { readonly width: LayoutScalar; readonly height: LayoutScalar };
  readonly nodes: readonly SceneNode[];
  readonly relationships: readonly SceneRelationship[];
  readonly accessibility: AccessibilityPlan;
  readonly limitations: ResolvedRecipe["compatibility"]["limitations"];
  readonly diagnostics: readonly Diagnostic[];
  readonly inputHash: string;
  readonly optionsHash: string;
  readonly environment: LayoutEnvironment;
  readonly layoutHash: string;
}

export interface LayoutInput {
  readonly view: ProjectedView;
  readonly recipe: ResolvedRecipe;
  readonly environment?: LayoutEnvironment;
}

export interface LayoutStrategyRegistry {
  readonly time: ReadonlyMap<string, TimeMappingStrategy>;
  readonly duration: ReadonlyMap<string, DurationEncodingStrategy>;
  readonly pitch: ReadonlyMap<string, PitchMappingStrategy>;
}

export interface ResolvedLayoutSelections {
  readonly time: ResolvedStrategySelection;
  readonly duration: ResolvedStrategySelection;
  readonly pitch: ResolvedStrategySelection;
  readonly labels: ResolvedStrategySelection;
  readonly overlays: readonly ResolvedStrategySelection[];
}
