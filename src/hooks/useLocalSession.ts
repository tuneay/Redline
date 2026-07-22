"use client";

import { useEffect, type Dispatch } from "react";

import type {
  ConversationAction,
  ConversationState,
} from "@/lib/state/conversation-reducer";
import { createFreshConversationState } from "@/lib/state/initial-state";
import {
  clearLocalSession,
  readLocalSession,
  writeLocalSession,
} from "@/lib/state/session-storage";

export function useLocalSession(
  state: ConversationState,
  dispatch: Dispatch<ConversationAction>,
) {
  const hasHydrated = state.phase !== "boot";

  useEffect(() => {
    const hydration = readLocalSession();

    if (hydration.wasInvalid) {
      clearLocalSession();
    }

    if (hydration.session) {
      dispatch({
        type: "HYDRATE",
        session: hydration.session,
        interruptedError: hydration.interruptedError,
      });
    } else {
      dispatch({
        type: "START_FRESH",
        state: createFreshConversationState(),
      });
    }

  }, [dispatch]);

  useEffect(() => {
    if (!hasHydrated || state.phase === "boot") {
      return;
    }

    writeLocalSession(state);
  }, [hasHydrated, state]);

  return { clearLocalSession, hasHydrated };
}
