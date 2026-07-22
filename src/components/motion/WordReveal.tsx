"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";

import {
  getWordRevealTiming,
  shouldShowWordRevealImmediately,
  tokenizeText,
} from "@/lib/utils/text-tokens";

import { duration, ease } from "./motion-tokens";
import { useMotionEnvironment } from "./motion-context";

interface WordRevealProps {
  cancelled?: boolean;
  className?: string;
  maxStaggerDelay?: number;
  messageId: string;
  onRevealComplete?: () => void;
  preferredStagger?: number;
  revealed?: boolean;
  startDelay?: number;
  text: string;
}

export function WordReveal({
  cancelled = false,
  className,
  maxStaggerDelay = 0.8,
  messageId,
  onRevealComplete,
  preferredStagger = 0.024,
  revealed = false,
  startDelay = 0,
  text,
}: WordRevealProps) {
  const {
    registry: { hasRevealed, markRevealed },
    shouldReduceMotion,
  } = useMotionEnvironment();
  const [wasRevealedBeforeMount] = useState(
    () => revealed || hasRevealed(messageId),
  );
  const [hasStarted, setHasStarted] = useState(false);
  const completionNotified = useRef(false);
  const tokens = useMemo(() => tokenizeText(text), [text]);
  const wordCount = useMemo(
    () => tokens.filter((token) => token.kind === "word").length,
    [tokens],
  );
  const timing = useMemo(
    () =>
      getWordRevealTiming(wordCount, {
        maxStaggerDelay,
        preferredStagger,
        startDelay,
      }),
    [maxStaggerDelay, preferredStagger, startDelay, wordCount],
  );
  const showImmediately = shouldShowWordRevealImmediately({
    cancelled,
    reducedMotion: shouldReduceMotion === true,
    revealed,
    revealedBeforeMount: wasRevealedBeforeMount,
  });

  const completeReveal = useCallback(() => {
    if (completionNotified.current) {
      return;
    }

    completionNotified.current = true;
    markRevealed(messageId);
    onRevealComplete?.();
  }, [markRevealed, messageId, onRevealComplete]);

  useEffect(() => {
    if (showImmediately || wordCount === 0) {
      completeReveal();
    }
  }, [completeReveal, showImmediately, wordCount]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasStarted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const shouldShowTokens = showImmediately || hasStarted;

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="whitespace-pre-wrap">
        {showImmediately
          ? text
          : tokens.map((token, tokenIndex) => {
              if (token.kind === "whitespace") {
                return <span key={`${messageId}-space-${tokenIndex}`}>{token.value}</span>;
              }

              const isFinalWord = token.wordIndex === wordCount - 1;

              return (
                <motion.span
                  animate={
                    shouldShowTokens
                      ? { filter: "blur(0px)", opacity: 1, y: 0 }
                      : { filter: "blur(8px)", opacity: 0, y: 4 }
                  }
                  className="inline-block"
                  initial={false}
                  key={`${messageId}-word-${tokenIndex}`}
                  onAnimationComplete={
                    hasStarted && isFinalWord ? completeReveal : undefined
                  }
                  transition={{
                    delay:
                      timing.startDelay + token.wordIndex * timing.stagger,
                    duration: duration.standard,
                    ease: ease.out,
                  }}
                >
                  {token.value}
                </motion.span>
              );
            })}
      </span>
    </span>
  );
}
