import {
  emptyRunningAnalysis,
  type ConversationMessage,
} from "@/lib/schemas/conversation";
import { SESSION_VERSION } from "@/lib/schemas/storage";
import { createId } from "@/lib/utils/ids";

import type { ConversationState } from "./conversation-reducer";

const INITIAL_QUESTION = "What are you building?";
const INITIAL_SUPPORTING_TEXT =
  "Be specific. I will ask five questions and challenge the assumptions behind it.";

function createGreetingMessage(options?: {
  createdAt?: string;
  id?: string;
}): ConversationMessage {
  return {
    id: options?.id ?? createId("message"),
    role: "assistant",
    kind: "greeting",
    content: INITIAL_QUESTION,
    supportingText: INITIAL_SUPPORTING_TEXT,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    revealed: false,
  };
}

export function createInitialConversationState(): ConversationState {
  return {
    version: SESSION_VERSION,
    sessionId: "session-boot",
    phase: "boot",
    questionIndex: 0,
    messages: [
      createGreetingMessage({
        id: "message-greeting-boot",
        createdAt: "1970-01-01T00:00:00.000Z",
      }),
    ],
    analysis: emptyRunningAnalysis,
    verdict: null,
    pendingRequestId: null,
    lastStablePhase: "awaiting_idea",
    error: null,
    revealedMessageIds: [],
  };
}

export function createFreshConversationState(): ConversationState {
  return {
    ...createInitialConversationState(),
    sessionId: createId("session"),
    phase: "awaiting_idea",
    messages: [createGreetingMessage()],
  };
}
