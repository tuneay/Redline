"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import { ReturnToLatest } from "@/components/motion/ReturnToLatest";
import {
  duration,
  ease,
  reducedMotionTransition,
  spring,
} from "@/components/motion/motion-tokens";
import { ErrorNotice } from "@/components/ui/ErrorNotice";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { useConversationMachine } from "@/hooks/useConversationMachine";

import { ChatInput, type ChatInputStatus } from "./ChatInput";
import { Conversation } from "./Conversation";
import { ProcessingState } from "./ProcessingState";
import { ProgressMarker } from "./ProgressMarker";

function getProcessingLabel(questionIndex: number, isVerdict: boolean) {
  if (isVerdict) {
    return "assembling the evidence record";
  }

  if (questionIndex === 0) {
    return "isolating assumptions";
  }

  if (questionIndex >= 3) {
    return "checking contradictions";
  }

  return "selecting the next pressure point";
}

export function ChatShell() {
  const {
    hasHydrated,
    markMessageRevealed,
    restart,
    retry,
    state,
    submit,
  } = useConversationMachine();
  const [cancelledMessageIds, setCancelledMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [restartFocusSignal, setRestartFocusSignal] = useState(0);
  const [restartConfirmation, setRestartConfirmation] = useState(false);
  const cancelRestartRef = useRef<HTMLButtonElement>(null);
  const restartButtonRef = useRef<HTMLButtonElement>(null);
  const { shouldReduceMotion } = useMotionEnvironment();
  const isProcessing = state.pendingRequestId !== null;
  const isVerdictTransition = state.phase === "generating_verdict";
  const isVerdict = state.phase === "verdict";
  const hasMeaningfulSession = state.messages.some(
    (message) => message.role === "user",
  );
  const latestAssistantMessage = useMemo(
    () => state.messages.findLast((message) => message.role === "assistant"),
    [state.messages],
  );
  const focusSignal = latestAssistantMessage?.revealed
    ? latestAssistantMessage.id
    : undefined;
  const activeRevealMessageId = latestAssistantMessage?.revealed
    ? undefined
    : latestAssistantMessage?.id;
  const inputStatus: ChatInputStatus =
    state.phase === "boot" || isVerdict
      ? "disabled"
      : state.phase === "error"
        ? "error"
        : isProcessing || isVerdictTransition
          ? "processing"
          : "idle";
  const inputPlaceholder =
    state.phase === "awaiting_idea"
      ? "Describe the idea without pitching it."
      : "Answer the question directly.";
  const verdictRevealId = `verdict:${state.sessionId}`;
  const verdictRevealed = state.revealedMessageIds.includes(verdictRevealId);
  const {
    revealContent,
    scrollContainerRef,
    scrollToLatest,
    showReturnToLatest,
  } = useAutoScroll({
    contentKey: `${state.messages.length}:${state.phase}:${isProcessing}`,
  });

  function cancelActiveReveal() {
    if (!activeRevealMessageId) {
      return;
    }

    setCancelledMessageIds((current) => {
      if (current.has(activeRevealMessageId)) {
        return current;
      }

      const next = new Set(current);
      next.add(activeRevealMessageId);
      return next;
    });
  }

  function performRestart() {
    if (restart()) {
      setRestartConfirmation(false);
      setCancelledMessageIds(new Set());
      setRestartFocusSignal((current) => current + 1);
    }
  }

  function cancelRestart() {
    setRestartConfirmation(false);
    requestAnimationFrame(() => restartButtonRef.current?.focus());
  }

  function handleRestartRequest() {
    if (hasMeaningfulSession) {
      setRestartConfirmation(true);
      return;
    }

    performRestart();
  }

  useEffect(() => {
    if (!restartConfirmation) {
      return;
    }

    const frame = requestAnimationFrame(() => cancelRestartRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [restartConfirmation]);

  return (
    <main
      aria-busy={!hasHydrated}
      aria-label="Redline"
      className="grid h-dvh min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden bg-background text-text-primary"
    >
      <header className="relative z-10 bg-background">
        <div className="mx-auto flex h-[4.25rem] w-full max-w-[var(--content-max-width)] items-center justify-between px-[var(--page-padding-mobile)] sm:h-[4.75rem] sm:px-[var(--page-padding-desktop)]">
          <h1 className="text-[0.75rem] font-medium tracking-[0.14em] text-text-primary">
            Redline
          </h1>
          <div className="flex items-center gap-4 sm:gap-6">
            <ProgressMarker current={state.questionIndex} total={5} />
            <AnimatePresence initial={false} mode="wait">
              {restartConfirmation ? (
                <motion.div
                  animate={{ opacity: 1, x: 0 }}
                  aria-label="Restart confirmation"
                  className="flex items-center gap-3"
                  initial={
                    shouldReduceMotion ? false : { opacity: 0, x: 3 }
                  }
                  key="restart-confirmation"
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      cancelRestart();
                    }
                  }}
                  role="group"
                  transition={{ duration: duration.instant, ease: ease.out }}
                >
                  <motion.button
                    className="group/cancel relative min-h-11 px-1 text-[0.6875rem] tracking-[0.04em] text-text-tertiary transition-colors duration-150 hover:text-text-primary"
                    onClick={cancelRestart}
                    ref={cancelRestartRef}
                    type="button"
                    whileHover={shouldReduceMotion ? undefined : { x: -1 }}
                    whileTap={
                      shouldReduceMotion ? undefined : { scale: 0.99, x: 0 }
                    }
                  >
                    <span className="relative">
                      Cancel
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-text-tertiary transition-transform duration-150 group-hover/cancel:origin-left group-hover/cancel:scale-x-100"
                      />
                    </span>
                  </motion.button>
                  <motion.button
                    className="group/clear relative min-h-11 px-1 text-[0.6875rem] font-medium tracking-[0.04em] text-signal-red transition-opacity duration-150 hover:opacity-80"
                    onClick={performRestart}
                    type="button"
                    whileHover={shouldReduceMotion ? undefined : { x: 1 }}
                    whileTap={
                      shouldReduceMotion ? undefined : { scale: 0.99, x: 0 }
                    }
                  >
                    <span className="relative">
                      Clear session
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-signal-red transition-transform duration-150 group-hover/clear:scale-x-100"
                      />
                    </span>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.button
                  animate={{ opacity: 1, x: 0 }}
                  className="group/restart relative min-h-11 px-1 text-[0.6875rem] tracking-[0.04em] text-text-tertiary transition-colors duration-150 hover:text-text-primary disabled:cursor-default disabled:opacity-40"
                  disabled={state.phase === "boot"}
                  initial={false}
                  key="restart"
                  onClick={handleRestartRequest}
                  ref={restartButtonRef}
                  type="button"
                  whileHover={shouldReduceMotion ? undefined : { x: -1 }}
                  whileTap={
                    shouldReduceMotion ? undefined : { scale: 0.99, x: 0 }
                  }
                >
                  <span className="relative">
                    Restart
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-text-tertiary transition-transform duration-150 group-hover/restart:origin-left group-hover/restart:scale-x-100"
                    />
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="relative min-h-0">
        <div
          className="conversation-scroll absolute inset-0 overflow-y-auto overscroll-y-contain"
          ref={scrollContainerRef}
        >
          <Conversation
            cancelledMessageId={
              activeRevealMessageId &&
              cancelledMessageIds.has(activeRevealMessageId)
                ? activeRevealMessageId
                : undefined
            }
            dimmed={isVerdictTransition || isVerdict}
            messages={state.messages}
            onMessageRevealed={markMessageRevealed}
            onVerdictEnter={revealContent}
            verdict={state.verdict}
            verdictRevealId={verdictRevealId}
            verdictRevealed={verdictRevealed}
          />
        </div>
        <ReturnToLatest
          onActivate={scrollToLatest}
          visible={showReturnToLatest}
        />
      </div>

      <motion.footer
        className="relative z-10 bg-background pb-[max(0.75rem,var(--safe-area-bottom))] sm:pb-5"
        layout={!shouldReduceMotion}
        transition={
          shouldReduceMotion
            ? reducedMotionTransition
            : { layout: spring.layout }
        }
      >
        <motion.div
          className="mx-auto w-full max-w-[var(--content-max-width)] px-[var(--page-padding-mobile)] sm:px-[var(--page-padding-desktop)]"
          layout={!shouldReduceMotion}
          transition={
            shouldReduceMotion
              ? reducedMotionTransition
              : { layout: spring.layout }
          }
        >
          <ProcessingState
            active={isProcessing}
            label={getProcessingLabel(
              state.questionIndex,
              isVerdictTransition,
            )}
          />
          <AnimatePresence initial={false} mode="popLayout">
            {state.error ? (
              <ErrorNotice error={state.error} key="error" onRetry={retry} />
            ) : null}
            {!isVerdict ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                initial={false}
                key={`input-${state.sessionId}`}
                layout={!shouldReduceMotion}
                transition={{ duration: duration.fast, ease: ease.out }}
              >
                <ChatInput
                  focusSignal={focusSignal}
                  forceFocusSignal={restartFocusSignal || undefined}
                  onInteract={cancelActiveReveal}
                  onSubmit={submit}
                  placeholder={inputPlaceholder}
                  status={inputStatus}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      </motion.footer>
    </main>
  );
}
