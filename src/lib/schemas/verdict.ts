import { z } from "zod";

import {
  isLikelyTurkishText,
  type TargetLanguage,
} from "@/lib/utils/language";

import {
  apiConversationMessageSchema,
  type APIConversationMessage,
} from "./api";
import { MAX_TOTAL_CONVERSATION_CHARS } from "./conversation";

const MAX_EVIDENCE_REFERENCES = 5;

export const verdictLabelSchema = z.enum([
  "BUILD",
  "VALIDATE",
  "RESHAPE",
  "KILL",
]);

export const confidenceSchema = z.enum(["low", "medium", "high"]);

const evidenceReferenceSchema = z
  .array(z.string().trim().min(1).max(64))
  .min(1)
  .max(MAX_EVIDENCE_REFERENCES);

export const dimensionScoreSchema = z
  .object({
    score: z.number().min(0).max(100),
    confidence: confidenceSchema,
    reason: z.string().trim().min(1).max(800),
    evidenceRefs: evidenceReferenceSchema,
  })
  .strict();

export const evidenceRecordSchema = z
  .object({
    id: z.string().trim().min(1).max(64),
    turn: z.number().int().min(1).max(12),
    quote: z.string().trim().min(1).max(240),
    classification: z.enum([
      "reported_fact",
      "claim",
      "assumption",
      "unknown",
    ]),
  })
  .strict();

const evidenceLinkedSectionSchema = z
  .object({
    title: z.string().trim().min(1).max(180),
    explanation: z.string().trim().min(1).max(1_000),
    evidenceRefs: evidenceReferenceSchema,
  })
  .strict();

const contradictionVerdictSchema = z
  .object({
    firstClaim: z.string().trim().min(1).max(500),
    secondClaim: z.string().trim().min(1).max(500),
    consequence: z.string().trim().min(1).max(800),
    evidenceRefs: evidenceReferenceSchema,
  })
  .strict();

const assumptionVerdictSchema = z
  .object({
    statement: z.string().trim().min(1).max(500),
    risk: z.enum(["low", "medium", "high", "fatal"]),
    reason: z.string().trim().min(1).max(800),
    evidenceRefs: evidenceReferenceSchema,
  })
  .strict();

const verdictShape = {
  verdict: verdictLabelSchema,
  score: z.number().min(0).max(100),
  confidence: confidenceSchema,
  diagnosis: z.string().trim().min(1).max(1_000),
  strongestSignal: evidenceLinkedSectionSchema,
  criticalFailure: evidenceLinkedSectionSchema,
  avoidancePattern: evidenceLinkedSectionSchema.nullable(),
  contradictions: z.array(contradictionVerdictSchema).max(3),
  dimensions: z
    .object({
      problemReality: dimensionScoreSchema,
      userSpecificity: dimensionScoreSchema,
      behaviorChange: dimensionScoreSchema,
      distribution: dimensionScoreSchema,
      commitment: dimensionScoreSchema,
      retentionOrRepeatValue: dimensionScoreSchema,
    })
    .strict(),
  assumptions: z.array(assumptionVerdictSchema).max(6),
  reconstructedIdea: z.string().trim().min(1).max(1_500),
  validationOrder: z
    .object({
      action: z.string().trim().min(1).max(800),
      targetUser: z.string().trim().min(1).max(400),
      sampleSize: z.string().trim().min(1).max(200),
      evidenceToCollect: z.string().trim().min(1).max(600),
      passCondition: z.string().trim().min(1).max(600),
      failCondition: z.string().trim().min(1).max(600),
    })
    .strict(),
  doNotBuildYet: z.array(z.string().trim().min(1).max(400)).max(5),
  evidence: z.array(evidenceRecordSchema).min(1).max(18),
} as const;

type VerdictLike = z.infer<z.ZodObject<typeof verdictShape>>;

function collectVerdictEvidenceRefs(verdict: VerdictLike): string[] {
  const dimensions = Object.values(verdict.dimensions);

  return [
    ...verdict.strongestSignal.evidenceRefs,
    ...verdict.criticalFailure.evidenceRefs,
    ...(verdict.avoidancePattern?.evidenceRefs ?? []),
    ...verdict.contradictions.flatMap((item) => item.evidenceRefs),
    ...dimensions.flatMap((item) => item.evidenceRefs),
    ...verdict.assumptions.flatMap((item) => item.evidenceRefs),
  ];
}

function validateEvidenceGraph(
  verdict: VerdictLike,
  context: z.RefinementCtx,
) {
  const evidenceIds = verdict.evidence.map((item) => item.id);
  const uniqueIds = new Set(evidenceIds);

  if (uniqueIds.size !== evidenceIds.length) {
    context.addIssue({
      code: "custom",
      path: ["evidence"],
      message: "Evidence IDs must be unique.",
    });
  }

  const unresolvedReference = collectVerdictEvidenceRefs(verdict).find(
    (reference) => !uniqueIds.has(reference),
  );

  if (unresolvedReference) {
    context.addIssue({
      code: "custom",
      path: ["evidence"],
      message: `Evidence reference ${unresolvedReference} does not resolve.`,
    });
  }
}

const verdictBaseSchema = z.object(verdictShape).strict();

export const verdictSchema = verdictBaseSchema.superRefine(
  validateEvidenceGraph,
);

export const verdictResponseSchema = z
  .object({
    requestId: z.string().min(1).max(128),
    ...verdictShape,
  })
  .strict()
  .superRefine(validateEvidenceGraph);

export const verdictRequestSchema = z
  .object({
    sessionId: z.string().min(1).max(128),
    messages: z.array(apiConversationMessageSchema).min(11).max(12),
  })
  .strict()
  .superRefine((request, context) => {
    const totalCharacters = request.messages.reduce(
      (total, message) => total + message.content.length,
      0,
    );

    if (totalCharacters > MAX_TOTAL_CONVERSATION_CHARS) {
      context.addIssue({
        code: "too_big",
        maximum: MAX_TOTAL_CONVERSATION_CHARS,
        origin: "array",
        inclusive: true,
        path: ["messages"],
        message: "Conversation exceeds the total character limit.",
      });
    }
  });

function normalizeExcerpt(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/gu, " ").trim();
}

export function createVerdictModelOutputSchema(
  messages: readonly APIConversationMessage[],
  targetLanguage: TargetLanguage = "auto",
) {
  return verdictSchema.superRefine((verdict, context) => {
    if (targetLanguage === "Turkish") {
      const visibleVerdictText = [
        verdict.diagnosis,
        verdict.strongestSignal.title,
        verdict.strongestSignal.explanation,
        verdict.criticalFailure.title,
        verdict.criticalFailure.explanation,
        verdict.avoidancePattern?.title ?? "",
        verdict.avoidancePattern?.explanation ?? "",
        verdict.reconstructedIdea,
        verdict.validationOrder.action,
        verdict.validationOrder.passCondition,
        verdict.validationOrder.failCondition,
      ].join(" ");

      if (!isLikelyTurkishText(visibleVerdictText)) {
        context.addIssue({
          code: "custom",
          path: ["diagnosis"],
          message:
            "The user wrote in Turkish, so every user-visible verdict field must be Turkish.",
        });
      }
    }

    verdict.evidence.forEach((evidence, index) => {
      const source = messages[evidence.turn - 1];

      if (!source || source.role !== "user") {
        context.addIssue({
          code: "custom",
          path: ["evidence", index, "turn"],
          message: "Evidence must point to an existing user turn.",
        });
        return;
      }

      if (
        !normalizeExcerpt(source.content).includes(
          normalizeExcerpt(evidence.quote),
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["evidence", index, "quote"],
          message: "Evidence quotes must be exact excerpts from the cited user turn.",
        });
      }
    });
  });
}

export type Confidence = z.infer<typeof confidenceSchema>;
export type DimensionScore = z.infer<typeof dimensionScoreSchema>;
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;
export type Verdict = z.infer<typeof verdictSchema>;
export type VerdictLabel = z.infer<typeof verdictLabelSchema>;
export type VerdictRequest = z.infer<typeof verdictRequestSchema>;
export type VerdictResponse = z.infer<typeof verdictResponseSchema>;
