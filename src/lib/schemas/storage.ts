import { z } from "zod";

import {
  conversationMessageSchema,
  conversationPhaseSchema,
  questionIndexSchema,
  runningAnalysisSchema,
} from "./conversation";
import { verdictSchema } from "./verdict";

export const SESSION_STORAGE_KEY = "redline.session.v1";
export const SESSION_VERSION = 1 as const;

export const storedSessionSchema = z
  .object({
    version: z.literal(SESSION_VERSION),
    sessionId: z.string().min(1).max(128),
    phase: conversationPhaseSchema.exclude(["boot"]),
    questionIndex: questionIndexSchema,
    messages: z.array(conversationMessageSchema).min(1).max(12),
    analysis: runningAnalysisSchema,
    verdict: verdictSchema.nullable(),
    lastStablePhase: conversationPhaseSchema.exclude(["boot", "error"]),
    revealedMessageIds: z.array(z.string().min(1).max(128)).max(20),
  })
  .strict()
  .superRefine((session, context) => {
    const questionMessages = session.messages.filter(
      (message) => message.kind === "question",
    );

    if (questionMessages.length !== session.questionIndex) {
      context.addIssue({
        code: "custom",
        path: ["questionIndex"],
        message: "Question index does not match the stored conversation.",
      });
    }

    questionMessages.forEach((message, index) => {
      if (message.questionNumber !== index + 1) {
        context.addIssue({
          code: "custom",
          path: ["messages"],
          message: "Stored questions are not sequential.",
        });
      }
    });

    if (session.phase === "verdict" && !session.verdict) {
      context.addIssue({
        code: "custom",
        path: ["verdict"],
        message: "A completed verdict phase requires verdict data.",
      });
    }

    if (session.phase !== "verdict" && session.verdict) {
      context.addIssue({
        code: "custom",
        path: ["verdict"],
        message: "Verdict data is only valid in the verdict phase.",
      });
    }
  });

export type StoredSession = z.infer<typeof storedSessionSchema>;
