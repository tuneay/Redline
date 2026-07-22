import type { APIError } from "@/lib/schemas/api";
import { validateStoredConversation } from "@/lib/schemas/conversation-order";
import {
  SESSION_STORAGE_KEY,
  storedSessionSchema,
  type StoredSession,
} from "@/lib/schemas/storage";
import { createId } from "@/lib/utils/ids";

import type { ConversationState } from "./conversation-reducer";

export interface SessionHydrationResult {
  session: StoredSession | null;
  interruptedError: APIError | null;
  wasInvalid: boolean;
}

function createInterruptedError(): APIError {
  return {
    code: "NETWORK_ERROR",
    message: "The previous request was interrupted. Retry to continue.",
    retryable: true,
    requestId: createId("recovery"),
  };
}

function needsRecovery(session: StoredSession): boolean {
  const lastMessage = session.messages.at(-1);

  return (
    session.phase === "error" ||
    session.phase === "generating_verdict" ||
    (session.phase === "interrogating" && lastMessage?.role === "user")
  );
}

export function hydrateStoredSession(
  rawSession: string | null,
): SessionHydrationResult {
  if (!rawSession) {
    return { session: null, interruptedError: null, wasInvalid: false };
  }

  try {
    const parsedJson: unknown = JSON.parse(rawSession);
    const parsedSession = storedSessionSchema.safeParse(parsedJson);

    if (!parsedSession.success) {
      return { session: null, interruptedError: null, wasInvalid: true };
    }

    const sequence = validateStoredConversation(parsedSession.data);

    if (!sequence.success) {
      return { session: null, interruptedError: null, wasInvalid: true };
    }

    return {
      session: parsedSession.data,
      interruptedError: needsRecovery(parsedSession.data)
        ? createInterruptedError()
        : null,
      wasInvalid: false,
    };
  } catch {
    return { session: null, interruptedError: null, wasInvalid: true };
  }
}

export function serializeConversationState(
  state: ConversationState,
): StoredSession | null {
  if (state.phase === "boot") {
    return null;
  }

  const candidate = {
    version: state.version,
    sessionId: state.sessionId,
    phase: state.phase,
    questionIndex: state.questionIndex,
    messages: state.messages,
    analysis: state.analysis,
    verdict: state.verdict,
    lastStablePhase: state.lastStablePhase,
    revealedMessageIds: state.revealedMessageIds,
  };
  const parsed = storedSessionSchema.safeParse(candidate);

  return parsed.success ? parsed.data : null;
}

export function readLocalSession(): SessionHydrationResult {
  try {
    return hydrateStoredSession(
      window.localStorage.getItem(SESSION_STORAGE_KEY),
    );
  } catch {
    return { session: null, interruptedError: null, wasInvalid: false };
  }
}

export function writeLocalSession(state: ConversationState): void {
  const storedSession = serializeConversationState(state);

  if (!storedSession) {
    return;
  }

  try {
    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(storedSession),
    );
  } catch {
    // The conversation remains usable if browser storage is unavailable.
  }
}

export function clearLocalSession(): void {
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // There is no recoverable local entry to clear when storage is blocked.
  }
}
