"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";

import {
  useMotionEnvironment,
  useRevealRegistry,
} from "@/components/motion/motion-context";
import {
  duration,
  ease,
  reducedMotionTransition,
  spring,
} from "@/components/motion/motion-tokens";

interface UserMessageProps {
  children: string;
  messageId: string;
  onRevealComplete?: () => void;
  revealed?: boolean;
}

export function UserMessage({
  children,
  messageId,
  onRevealComplete,
  revealed = false,
}: UserMessageProps) {
  const { shouldReduceMotion } = useMotionEnvironment();
  const { hasRevealed, markRevealed } = useRevealRegistry();
  const registryId = `${messageId}:container`;
  const [shouldSkipEntrance] = useState(
    () => revealed || hasRevealed(registryId),
  );
  const [hasEntered, setHasEntered] = useState(false);
  const shouldShowMessage =
    shouldReduceMotion || shouldSkipEntrance || hasEntered;
  const handleEntranceComplete = useCallback(() => {
    markRevealed(registryId);
    onRevealComplete?.();
  }, [markRevealed, onRevealComplete, registryId]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.article
      animate={
        shouldShowMessage
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.992, y: 8 }
      }
      aria-label="Your message"
      className="ml-auto max-w-[min(88%,34rem)] rounded-[1.25rem_1.25rem_0.5rem_1.25rem] border border-line-subtle bg-surface-1 px-5 py-4 text-[0.9375rem] leading-6 break-words text-text-secondary sm:max-w-[78%] sm:text-base sm:leading-7"
      initial={false}
      layout={!shouldReduceMotion}
      onAnimationComplete={
        shouldShowMessage ? handleEntranceComplete : undefined
      }
      transition={
        shouldReduceMotion
          ? reducedMotionTransition
          : {
              duration: duration.fast,
              ease: ease.out,
              layout: spring.layout,
            }
      }
    >
      <p>{children}</p>
    </motion.article>
  );
}
