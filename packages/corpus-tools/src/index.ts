import { contentHash, type CanonicalDocument, type Diagnostic } from "@mnls/model";
import { normalize, normalizedHash } from "@mnls/normalizer";
import { schemaIds, validateArtifact } from "@mnls/schema";
import { validateCanonicalSemantics } from "@mnls/validator";

export interface CorpusFixtureInput {
  readonly path: string;
  readonly value: unknown;
}

export interface CorpusFixtureEvidence {
  readonly path: string;
  readonly documentId: string;
  readonly canonicalHash: string;
  readonly normalizedHashes: readonly string[];
  readonly lawfulSourceRecords: number;
}

export interface CorpusCategoryEvidence {
  readonly id: `C-G${string}`;
  readonly status: "covered" | "contract-only" | "deferred";
  readonly evidence: readonly string[];
}

export interface CorpusTestReport {
  readonly formatVersion: "0.1.0";
  readonly status: "pass" | "fail";
  readonly fixtures: readonly CorpusFixtureEvidence[];
  readonly categoryCoverage: readonly CorpusCategoryEvidence[];
  readonly diagnostics: readonly Diagnostic[];
}

export interface VocabularyReport {
  readonly formatVersion: "0.1.0";
  readonly canonicalPatternVocabulary: readonly string[];
  readonly experimentStrategyIds: readonly string[];
  readonly learningTransformationIds: readonly string[];
  readonly note: string;
}

function diagnostic(code: string, message: string, canonicalId?: string): Diagnostic {
  return {
    code,
    severity: "error",
    stage: "corpus",
    message,
    ...(canonicalId ? { canonicalId } : {}),
    requirementIds: ["R-043", "R-044", "R-045"],
  };
}

const categoryCoverage: readonly CorpusCategoryEvidence[] = [
  {
    id: "C-G01",
    status: "covered",
    evidence: ["melody-spatial-a", "melody-learning-b", "E-007"],
  },
  {
    id: "C-G02",
    status: "contract-only",
    evidence: ["harmony-grid-c exact chord timing"],
  },
  { id: "C-G03", status: "deferred", evidence: ["Sprint 2 functional breadth"] },
  {
    id: "C-G04",
    status: "contract-only",
    evidence: ["contract-voicing-hints hand/role contracts"],
  },
  {
    id: "C-G05",
    status: "covered",
    evidence: ["contract-voicing-hints inversion/slash-bass/voicing regression"],
  },
  {
    id: "C-G06",
    status: "covered",
    evidence: ["harmony-grid-c repetition/variation normalization"],
  },
  { id: "C-G07", status: "deferred", evidence: ["Sprint 2 lawful style expansion"] },
  { id: "C-G08", status: "deferred", evidence: ["Sprint 2 lawful style expansion"] },
  {
    id: "C-G09",
    status: "covered",
    evidence: ["contract-voicing-hints exact familiar-shape hint"],
  },
  {
    id: "C-G10",
    status: "covered",
    evidence: ["idea-boundary@1 plans for melody-spatial-a and melody-learning-b"],
  },
  {
    id: "C-G11",
    status: "covered",
    evidence: ["four compatibility statuses and structured negative cases"],
  },
];

export function runCorpusTest(inputs: readonly CorpusFixtureInput[]): CorpusTestReport {
  const diagnostics: Diagnostic[] = [];
  const fixtures: CorpusFixtureEvidence[] = [];
  for (const input of [...inputs].sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  )) {
    const structural = validateArtifact(schemaIds.canonical, input.value);
    if (!structural.ok) {
      diagnostics.push(
        ...structural.diagnostics.map((item) =>
          diagnostic("CORPUS_SCHEMA_INVALID", `${input.path}: ${item.message}`),
        ),
      );
      continue;
    }
    const document = input.value as CanonicalDocument;
    const semantic = validateCanonicalSemantics(document);
    if (!semantic.ok) {
      diagnostics.push(
        ...semantic.diagnostics.map((item) =>
          diagnostic(item.code, `${input.path}: ${item.message}`, item.canonicalId),
        ),
      );
      continue;
    }
    const normalizedHashes: string[] = [];
    for (const arrangement of document.arrangements) {
      const normalized = normalize(document, arrangement.id);
      if (normalized.ok) normalizedHashes.push(normalizedHash(normalized.value));
      else {
        diagnostics.push(
          ...normalized.diagnostics.map((item) =>
            diagnostic(item.code, `${input.path}: ${item.message}`, item.canonicalId),
          ),
        );
      }
    }
    const lawfulSourceRecords = (document.sourceRegister ?? []).filter(
      ({ repositoryUsePermitted }) => repositoryUsePermitted,
    ).length;
    if (
      lawfulSourceRecords === 0 ||
      lawfulSourceRecords !== (document.sourceRegister ?? []).length
    ) {
      diagnostics.push(
        diagnostic(
          "CORPUS_SOURCE_POLICY_INVALID",
          `${input.path} lacks complete permitted source evidence.`,
          document.id,
        ),
      );
    }
    fixtures.push({
      path: input.path,
      documentId: document.id,
      canonicalHash: contentHash(document),
      normalizedHashes,
      lawfulSourceRecords,
    });
  }
  diagnostics.sort((left, right) =>
    `${left.code}:${left.message}`.localeCompare(`${right.code}:${right.message}`, "en"),
  );
  return {
    formatVersion: "0.1.0",
    status: diagnostics.length === 0 && fixtures.length === inputs.length ? "pass" : "fail",
    fixtures,
    categoryCoverage,
    diagnostics,
  };
}

export function createVocabularyReport(input: {
  readonly experimentStrategyIds: readonly string[];
  readonly learningTransformationIds: readonly string[];
}): VocabularyReport {
  return {
    formatVersion: "0.1.0",
    canonicalPatternVocabulary: [],
    experimentStrategyIds: [...new Set(input.experimentStrategyIds)].sort((left, right) =>
      left.localeCompare(right, "en"),
    ),
    learningTransformationIds: [...new Set(input.learningTransformationIds)].sort((left, right) =>
      left.localeCompare(right, "en"),
    ),
    note: "Experiment strategy IDs are reported separately and are not canonical learner vocabulary.",
  };
}
