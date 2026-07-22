"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";

import {
  createClientError,
  isAPIError,
  requestInterrogation,
} from "@/lib/api/interrogate-client";
import { requestVerdict } from "@/lib/api/verdict-client";
import {
  type APIConversationMessage,
  type InterrogateRequest,
} from "@/lib/schemas/api";
import type {
  ConversationMessage,
  QuestionNumber,
} from "@/lib/schemas/conversation";
import type { VerdictRequest } from "@/lib/schemas/verdict";
import {
  conversationReducer,
  type ConversationState,
} from "@/lib/state/conversation-reducer";
import {
  createFreshConversationState,
  createInitialConversationState,
} from "@/lib/state/initial-state";
import { createId } from "@/lib/utils/ids";

import { useLocalSession } from "./useLocalSession";

const REQUEST_TIMEOUT_MS = 90_000;
const VERDICT_TIMEOUT_MS = 145_000;

function toApiMessages(
  messages: ConversationMessage[],
): APIConversationMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content,
    ...(message.kind === "question" || message.kind === "answer"
      ? { questionNumber: message.questionNumber }
      : {}),
  }));
}

function createUserMessage(
  state: ConversationState,
  content: string,
): ConversationMessage | null {
  const base = {
    id: createId("message"),
    content,
    createdAt: new Date().toISOString(),
    revealed: false,
  };

  if (state.phase === "awaiting_idea") {
    return { ...base, role: "user", kind: "idea" };
  }

  if (
    state.phase === "interrogating" &&
    state.questionIndex >= 1 &&
    state.questionIndex <= 5 &&
    state.messages.at(-1)?.kind === "question"
  ) {
    return {
      ...base,
      role: "user",
      kind: "answer",
      questionNumber: state.questionIndex as QuestionNumber,
    };
  }

  return null;
}

export function useConversationMachine() {
  const [state, dispatch] = useReducer(
    conversationReducer,
    undefined,
    createInitialConversationState,
  );
  const abortControllerRef = useRef<AbortController | null>(null);
  const { clearLocalSession, hasHydrated } = useLocalSession(state, dispatch);

  useEffect(() => {
    return () => abortControllerRef.current?.abort();
  }, []);

  const runInterrogation = useCallback(
    async (
      requestId: string,
      snapshot: ConversationState,
      messages: ConversationMessage[],
    ) => {
      const controller = new AbortController();
      const timeout = window.setTimeout(
        () => controller.abort("timeout"),
        REQUEST_TIMEOUT_MS,
      );
      abortControllerRef.current = controller;

      const payload: InterrogateRequest = {
        sessionId: snapshot.sessionId,
        questionIndex: snapshot.questionIndex as 0 | 1 | 2 | 3 | 4,
        messages: toApiMessages(messages),
      };

      try {
        const result = await requestInterrogation(payload, {
          requestId,
          signal: controller.signal,
        });
        const content = `${result.observation}\n\n${result.question}`;
        const assistantMessage: ConversationMessage = {
          id: createId("message"),
          role: "assistant",
          kind: "question",
          content,
          observation: result.observation,
          question: result.question,
          questionNumber: result.questionNumber,
          createdAt: new Date().toISOString(),
          revealed: false,
        };

        dispatch({
          type: "INTERROGATE_SUCCEEDED",
          requestId,
          message: assistantMessage,
          analysis: result.analysis,
        });
      } catch (error) {
        const apiError =
          isAPIError(error)
            ? error
            : controller.signal.aborted
              ? createClientError(
                  "MODEL_TIMEOUT",
                  "The model did not respond in time. Retry without resubmitting your answer.",
                  requestId,
                )
              : createClientError(
                  "NETWORK_ERROR",
                  "Redline could not reach the server. Check the local connection and retry.",
                  requestId,
                );

        dispatch({ type: "REQUEST_FAILED", requestId, error: apiError });
      } finally {
        window.clearTimeout(timeout);

        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [],
  );

  const runVerdict = useCallback(
    async (
      requestId: string,
      snapshot: ConversationState,
      messages: ConversationMessage[],
    ) => {
      const controller = new AbortController();
      const timeout = window.setTimeout(
        () => controller.abort("timeout"),
        VERDICT_TIMEOUT_MS,
      );
      abortControllerRef.current = controller;
      const payload: VerdictRequest = {
        sessionId: snapshot.sessionId,
        messages: toApiMessages(messages),
      };

      try {
        const result = await requestVerdict(payload, {
          requestId,
          signal: controller.signal,
        });
        const { requestId: serverRequestId, ...verdict } = result;
        void serverRequestId;
        dispatch({
          type: "VERDICT_SUCCEEDED",
          requestId,
          verdict,
        });
      } catch (error) {
        const apiError =
          isAPIError(error)
            ? error
            : controller.signal.aborted
              ? createClientError(
                  "MODEL_TIMEOUT",
                  "The verdict did not complete in time. Retry without resubmitting your answer.",
                  requestId,
                )
              : createClientError(
                  "NETWORK_ERROR",
                  "Redline could not reach the verdict endpoint. Check the local connection and retry.",
                  requestId,
                );

        dispatch({ type: "REQUEST_FAILED", requestId, error: apiError });
      } finally {
        window.clearTimeout(timeout);

        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [],
  );

  const submit = useCallback(
    (rawContent: string) => {
      const current = state;

      if (current.pendingRequestId || current.phase === "boot") {
        return;
      }

      const content = rawContent.trim();
      const message = createUserMessage(current, content);

      if (!message) {
        return;
      }

      const requestId = createId("client-request");
      const messages = [...current.messages, message];
      const isFinalAnswer =
        message.kind === "answer" && message.questionNumber === 5;
      const requestPhase = isFinalAnswer
        ? "generating_verdict"
        : "interrogating";

      dispatch({
        type: "SUBMIT_USER",
        message,
        requestId,
        requestPhase,
      });

      if (isFinalAnswer) {
        void runVerdict(requestId, current, messages);
      } else {
        void runInterrogation(requestId, current, messages);
      }
    },
    [runInterrogation, runVerdict, state],
  );

  const retry = useCallback(() => {
    const current = state;

    if (
      current.phase !== "error" ||
      current.pendingRequestId ||
      !current.error?.retryable ||
      current.messages.at(-1)?.role !== "user"
    ) {
      return;
    }

    const requestId = createId("client-request");
    const isVerdictRequest =
      current.questionIndex === 5 &&
      current.messages.at(-1)?.kind === "answer";
    const requestPhase = isVerdictRequest
      ? "generating_verdict"
      : "interrogating";

    dispatch({ type: "RETRY_STARTED", requestId, requestPhase });

    if (isVerdictRequest) {
      void runVerdict(requestId, current, current.messages);
    } else {
      void runInterrogation(requestId, current, current.messages);
    }
  }, [runInterrogation, runVerdict, state]);

  const restart = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    clearLocalSession();
    const nextState = createFreshConversationState();
    dispatch({
      type: "RESTART",
      state: nextState,
    });
    return true;
  }, [clearLocalSession]);

  const markMessageRevealed = useCallback((messageId: string) => {
    dispatch({ type: "MESSAGE_REVEALED", messageId });
  }, []);

  return {
    hasHydrated,
    markMessageRevealed,
    restart,
    retry,
    state,
    submit,
  };
}
