import type { APIError } from "@/lib/schemas/api";
import type {
  ConversationMessage,
  ConversationPhase,
  RunningAnalysis,
} from "@/lib/schemas/conversation";
import type { StoredSession } from "@/lib/schemas/storage";
import type { Verdict } from "@/lib/schemas/verdict";

export interface ConversationState extends Omit<StoredSession, "phase"> {
  phase: ConversationPhase;
  pendingRequestId: string | null;
  error: APIError | null;
}

export type ConversationAction =
  | { type: "HYDRATE"; session: StoredSession; interruptedError: APIError | null }
  | { type: "START_FRESH"; state: ConversationState }
  | {
      type: "SUBMIT_USER";
      message: ConversationMessage;
      requestId: string;
      requestPhase: "interrogating" | "generating_verdict";
    }
  | {
      type: "INTERROGATE_SUCCEEDED";
      requestId: string;
      message: ConversationMessage;
      analysis: RunningAnalysis;
    }
  | {
      type: "VERDICT_SUCCEEDED";
      requestId: string;
      verdict: Verdict;
    }
  | {
      type: "REQUEST_FAILED";
      requestId: string;
      error: APIError;
    }
  | {
      type: "RETRY_STARTED";
      requestId: string;
      requestPhase: "interrogating" | "generating_verdict";
    }
  | { type: "MESSAGE_REVEALED"; messageId: string }
  | { type: "RESTART"; state: ConversationState };

function isCurrentRequest(state: ConversationState, requestId: string) {
  return state.pendingRequestId === requestId;
}

export function conversationReducer(
  state: ConversationState,
  action: ConversationAction,
): ConversationState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...action.session,
        phase: action.interruptedError ? "error" : action.session.phase,
        pendingRequestId: null,
        error: action.interruptedError,
      };

    case "START_FRESH":
      if (state.phase !== "boot") {
        return state;
      }

      return action.state;

    case "SUBMIT_USER":
      if (state.pendingRequestId || state.phase === "boot") {
        return state;
      }

      return {
        ...state,
        phase: action.requestPhase,
        messages: [...state.messages, action.message],
        pendingRequestId: action.requestId,
        lastStablePhase:
          state.phase === "awaiting_idea" ||
          state.phase === "interrogating" ||
          state.phase === "generating_verdict" ||
          state.phase === "verdict"
            ? state.phase
            : state.lastStablePhase,
        error: null,
      };

    case "INTERROGATE_SUCCEEDED":
      if (!isCurrentRequest(state, action.requestId)) {
        return state;
      }

      return {
        ...state,
        phase: "interrogating",
        questionIndex: action.message.kind === "question"
          ? action.message.questionNumber
          : state.questionIndex,
        messages: [...state.messages, action.message],
        analysis: action.analysis,
        pendingRequestId: null,
        lastStablePhase: "interrogating",
        error: null,
      };

    case "VERDICT_SUCCEEDED":
      if (!isCurrentRequest(state, action.requestId)) {
        return state;
      }

      return {
        ...state,
        phase: "verdict",
        verdict: action.verdict,
        pendingRequestId: null,
        lastStablePhase: "verdict",
        error: null,
      };

    case "REQUEST_FAILED":
      if (!isCurrentRequest(state, action.requestId)) {
        return state;
      }

      return {
        ...state,
        phase: "error",
        pendingRequestId: null,
        error: action.error,
      };

    case "RETRY_STARTED":
      if (state.phase !== "error" || state.pendingRequestId) {
        return state;
      }

      return {
        ...state,
        phase: action.requestPhase,
        pendingRequestId: action.requestId,
        error: null,
      };

    case "MESSAGE_REVEALED": {
      if (state.revealedMessageIds.includes(action.messageId)) {
        return state;
      }

      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.messageId
            ? { ...message, revealed: true }
            : message,
        ),
        revealedMessageIds: [
          ...state.revealedMessageIds,
          action.messageId,
        ],
      };
    }

    case "RESTART":
      return action.state;
  }
}
