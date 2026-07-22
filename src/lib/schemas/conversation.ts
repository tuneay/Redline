import { z } from "zod";

export const MAX_USER_MESSAGE_CHARS = 4_000;
export const MAX_ASSISTANT_MESSAGE_CHARS = 3_000;
export const MAX_TOTAL_CONVERSATION_CHARS = 30_000;

export const questionNumberSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const questionIndexSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const conversationPhaseSchema = z.enum([
  "boot",
  "awaiting_idea",
  "interrogating",
  "generating_verdict",
  "verdict",
  "error",
]);

const messageBaseSchema = z.object({
  id: z.string().min(1).max(128),
  createdAt: z.iso.datetime(),
  revealed: z.boolean(),
}).strict();

const assistantGreetingSchema = messageBaseSchema.extend({
  role: z.literal("assistant"),
  kind: z.literal("greeting"),
  content: z.string().trim().min(1).max(MAX_ASSISTANT_MESSAGE_CHARS),
  supportingText: z.string().trim().min(1).max(600).optional(),
});

const assistantQuestionSchema = messageBaseSchema.extend({
  role: z.literal("assistant"),
  kind: z.literal("question"),
  content: z.string().trim().min(1).max(MAX_ASSISTANT_MESSAGE_CHARS),
  observation: z.string().trim().min(1).max(1_200).optional(),
  question: z.string().trim().min(1).max(600),
  questionNumber: questionNumberSchema,
});

const assistantObservationSchema = messageBaseSchema.extend({
  role: z.literal("assistant"),
  kind: z.literal("observation"),
  content: z.string().trim().min(1).max(MAX_ASSISTANT_MESSAGE_CHARS),
});

const userIdeaSchema = messageBaseSchema.extend({
  role: z.literal("user"),
  kind: z.literal("idea"),
  content: z.string().trim().min(1).max(MAX_USER_MESSAGE_CHARS),
});

const userAnswerSchema = messageBaseSchema.extend({
  role: z.literal("user"),
  kind: z.literal("answer"),
  content: z.string().trim().min(1).max(MAX_USER_MESSAGE_CHARS),
  questionNumber: questionNumberSchema,
});

export const conversationMessageSchema = z.discriminatedUnion("kind", [
  assistantGreetingSchema,
  assistantQuestionSchema,
  assistantObservationSchema,
  userIdeaSchema,
  userAnswerSchema,
]);

export const evidenceItemSchema = z.object({
  statement: z.string().trim().min(1).max(600),
  evidenceRefs: z.array(z.string().trim().min(1).max(128)).max(5),
}).strict();

export const contradictionSchema = z.object({
  firstClaim: z.string().trim().min(1).max(500),
  secondClaim: z.string().trim().min(1).max(500),
  consequence: z.string().trim().min(1).max(600),
  evidenceRefs: z.array(z.string().trim().min(1).max(128)).min(1).max(5),
}).strict();

export const avoidanceSignalSchema = z.object({
  pattern: z.string().trim().min(1).max(240),
  explanation: z.string().trim().min(1).max(600),
  evidenceRefs: z.array(z.string().trim().min(1).max(128)).max(5),
}).strict();

export const runningAnalysisSchema = z.object({
  language: z.string().trim().min(2).max(64),
  facts: z.array(evidenceItemSchema).max(12),
  claims: z.array(evidenceItemSchema).max(12),
  assumptions: z.array(evidenceItemSchema).max(12),
  unknowns: z.array(evidenceItemSchema).max(12),
  contradictions: z.array(contradictionSchema).max(3),
  avoidanceSignals: z.array(avoidanceSignalSchema).max(5),
}).strict();

export const emptyRunningAnalysis = {
  language: "undetermined",
  facts: [],
  claims: [],
  assumptions: [],
  unknowns: [],
  contradictions: [],
  avoidanceSignals: [],
} satisfies z.infer<typeof runningAnalysisSchema>;

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type ConversationPhase = z.infer<typeof conversationPhaseSchema>;
export type QuestionNumber = z.infer<typeof questionNumberSchema>;
export type QuestionIndex = z.infer<typeof questionIndexSchema>;
export type RunningAnalysis = z.infer<typeof runningAnalysisSchema>;
