import { z } from "zod";

import {
  isLikelyTurkishText,
  type TargetLanguage,
} from "@/lib/utils/language";

import {
  MAX_ASSISTANT_MESSAGE_CHARS,
  MAX_TOTAL_CONVERSATION_CHARS,
  MAX_USER_MESSAGE_CHARS,
  questionNumberSchema,
  runningAnalysisSchema,
  type QuestionNumber,
} from "./conversation";

export const apiErrorCodeSchema = z.enum([
  "INVALID_INPUT",
  "INVALID_STATE",
  "MODEL_UNAVAILABLE",
  "MODEL_RATE_LIMIT",
  "MODEL_TIMEOUT",
  "MODEL_OUTPUT_INVALID",
  "NETWORK_ERROR",
  "UNKNOWN_ERROR",
]);

export const apiErrorSchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string().trim().min(1).max(500),
  retryable: z.boolean(),
  requestId: z.string().min(1).max(128),
}).strict();

export const apiErrorResponseSchema = z.object({
  error: apiErrorSchema,
}).strict();

export const apiConversationMessageSchema = z
  .object({
    role: z.enum(["assistant", "user"]),
    content: z.string().trim().min(1),
    questionNumber: questionNumberSchema.optional(),
  })
  .strict()
  .superRefine((message, context) => {
    const maximum =
      message.role === "user"
        ? MAX_USER_MESSAGE_CHARS
        : MAX_ASSISTANT_MESSAGE_CHARS;

    if (message.content.length > maximum) {
      context.addIssue({
        code: "too_big",
        maximum,
        origin: "string",
        inclusive: true,
        message: `Message exceeds the ${maximum}-character limit.`,
      });
    }
  });

export const interrogateRequestSchema = z
  .object({
    sessionId: z.string().min(1).max(128),
    questionIndex: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
    ]),
    messages: z.array(apiConversationMessageSchema).min(1).max(12),
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

export const pressurePointSchema = z.enum([
  "problem",
  "user",
  "behavior",
  "alternative",
  "distribution",
  "commitment",
  "retention",
  "trust",
  "business_model",
  "fatal_assumption",
]);

export const detectedIssueSchema = z.enum([
  "none",
  "vague_answer",
  "unsupported_claim",
  "contradiction",
  "evasion",
  "solution_first",
  "broad_user",
  "weak_distribution",
  "unclear_frequency",
]);

export const interrogateModelOutputSchema = z.object({
  observation: z.string().trim().min(1).max(1_200),
  question: z.string().trim().min(1).max(600),
  questionNumber: questionNumberSchema,
  pressurePoint: pressurePointSchema,
  detectedIssue: detectedIssueSchema,
  severity: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  analysis: runningAnalysisSchema,
}).strict();

const QUESTION_MARK_PATTERN = /[?？؟]/gu;
const GENERIC_PRAISE_PATTERNS = [
  /\bgreat (?:idea|answer)\b/iu,
  /\b(?:amazing|excellent answer)\b/iu,
  /\bthis (?:is|sounds) exciting\b/iu,
  /\bi love the vision\b/iu,
  /\byou(?:'|\u2019)?re definitely onto something\b/iu,
  /\b(?:harika fikir|harika cevap|m\u00fckemmel cevap)\b/iu,
] as const;
const PERSONAL_ATTACK_PATTERNS = [
  /\byou (?:are|seem) (?:delusional|pathetic|an idiot)\b/iu,
  /\byou (?:clearly )?know nothing\b/iu,
  /\b(?:aptals\u0131n|salaks\u0131n|hi\u00e7bir \u015fey bilmiyorsun)\b/iu,
] as const;
const FAKE_RESEARCH_PATTERNS = [
  /\bthe market is growing rapidly\b/iu,
  /\bcompetitors (?:typically )?charge\b/iu,
  /\busers typically (?:want|need|prefer|behave)\b/iu,
  /\bthere is no competition\b/iu,
  /\binvestors are looking for\b/iu,
  /\bpazar h\u0131zla b\u00fcy\u00fcyor\b/iu,
  /\brakipler (?:genellikle )?.*(?:\u00fccret|fiyat)\b/iu,
] as const;

function addPatternIssue(
  text: string,
  patterns: readonly RegExp[],
  message: string,
  context: z.RefinementCtx,
) {
  if (patterns.some((pattern) => pattern.test(text))) {
    context.addIssue({ code: "custom", message });
  }
}

function collectAnalysisEvidenceRefs(
  analysis: z.infer<typeof runningAnalysisSchema>,
): string[] {
  return [
    ...analysis.facts,
    ...analysis.claims,
    ...analysis.assumptions,
    ...analysis.unknowns,
    ...analysis.contradictions,
    ...analysis.avoidanceSignals,
  ].flatMap((entry) => entry.evidenceRefs);
}

export function createInterrogateModelOutputSchema(
  expectedQuestionNumber: QuestionNumber,
  validEvidenceRefs?: readonly string[],
  targetLanguage: TargetLanguage = "auto",
) {
  return interrogateModelOutputSchema.superRefine((output, context) => {
    if (output.questionNumber !== expectedQuestionNumber) {
      context.addIssue({
        code: "custom",
        path: ["questionNumber"],
        message: `Expected question ${expectedQuestionNumber}.`,
      });
    }

    if ((output.observation.match(QUESTION_MARK_PATTERN) ?? []).length > 0) {
      context.addIssue({
        code: "custom",
        path: ["observation"],
        message: "The observation must not contain a question.",
      });
    }

    if ((output.question.match(QUESTION_MARK_PATTERN) ?? []).length !== 1) {
      context.addIssue({
        code: "custom",
        path: ["question"],
        message: "The response must contain exactly one primary question.",
      });
    }

    const visibleText = `${output.observation}\n${output.question}`;

    if (
      targetLanguage === "Turkish" &&
      (!isLikelyTurkishText(visibleText) ||
        !/^(?:Turkish|Türkçe)$/iu.test(output.analysis.language))
    ) {
      context.addIssue({
        code: "custom",
        path: ["analysis", "language"],
        message:
          "The user wrote in Turkish, so every visible natural-language field and analysis.language must be Turkish.",
      });
    }
    addPatternIssue(
      visibleText,
      GENERIC_PRAISE_PATTERNS,
      "Generic praise is not allowed.",
      context,
    );
    addPatternIssue(
      visibleText,
      PERSONAL_ATTACK_PATTERNS,
      "Personal attacks are not allowed.",
      context,
    );
    addPatternIssue(
      output.observation,
      FAKE_RESEARCH_PATTERNS,
      "Unsupported external research claims are not allowed.",
      context,
    );

    if (validEvidenceRefs) {
      const allowed = new Set(validEvidenceRefs);
      const unsupportedAnalysisEntry = [
        ...output.analysis.facts,
        ...output.analysis.claims,
        ...output.analysis.assumptions,
        ...output.analysis.avoidanceSignals,
      ].find((entry) => entry.evidenceRefs.length === 0);

      if (unsupportedAnalysisEntry) {
        context.addIssue({
          code: "custom",
          path: ["analysis"],
          message:
            "Facts, claims, assumptions, and avoidance signals must cite a conversation turn.",
        });
      }

      const invalidRef = collectAnalysisEvidenceRefs(output.analysis).find(
        (reference) => !allowed.has(reference),
      );

      if (invalidRef) {
        context.addIssue({
          code: "custom",
          path: ["analysis"],
          message: `Analysis evidence reference ${invalidRef} does not resolve to a conversation turn.`,
        });
      }
    }
  });
}

export const interrogateResponseSchema = interrogateModelOutputSchema.extend({
  requestId: z.string().min(1).max(128),
});

export type APIError = z.infer<typeof apiErrorSchema>;
export type APIErrorCode = z.infer<typeof apiErrorCodeSchema>;
export type APIErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type APIConversationMessage = z.infer<
  typeof apiConversationMessageSchema
>;
export type InterrogateRequest = z.infer<typeof interrogateRequestSchema>;
export type InterrogateModelOutput = z.infer<
  typeof interrogateModelOutputSchema
>;
export type InterrogateResponse = z.infer<typeof interrogateResponseSchema>;
