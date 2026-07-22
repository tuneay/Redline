"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { WordReveal } from "@/components/motion/WordReveal";
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

interface AIMessageProps {
  cancelled?: boolean;
  isGreeting?: boolean;
  messageId: string;
  observation?: string;
  onRevealComplete?: () => void;
  question: string;
  questionNumber?: 1 | 2 | 3 | 4 | 5;
  revealed?: boolean;
  supportingText?: string;
}

export function AIMessage({
  cancelled = false,
  isGreeting = false,
  messageId,
  observation,
  onRevealComplete,
  question,
  questionNumber,
  revealed = false,
  supportingText,
}: AIMessageProps) {
  const { shouldReduceMotion } = useMotionEnvironment();
  const { hasRevealed } = useRevealRegistry();
  const [shouldSkipEntrance] = useState(
    () => revealed || hasRevealed(`${messageId}:question`),
  );
  const [hasEntered, setHasEntered] = useState(false);
  const label = questionNumber
    ? `Redline question ${questionNumber}`
    : "Redline message";

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const shouldShowMessage =
    shouldReduceMotion || shouldSkipEntrance || hasEntered;

  return (
    <motion.article
      animate={
        shouldShowMessage ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }
      }
      aria-label={label}
      className={
        isGreeting
          ? "max-w-[43rem] text-left text-pretty"
          : "max-w-[42.5rem] text-left text-pretty"
      }
      initial={false}
      layout={!shouldReduceMotion}
      transition={
        shouldReduceMotion
          ? reducedMotionTransition
          : {
              duration: duration.standard,
              ease: ease.out,
              layout: spring.layout,
            }
      }
    >
      {observation ? (
        <p className="mb-4 max-w-[38rem] text-[0.9375rem] leading-6 text-text-secondary sm:text-base sm:leading-7">
          <WordReveal
            cancelled={cancelled}
            maxStaggerDelay={0.36}
            messageId={`${messageId}:observation`}
            preferredStagger={0.018}
            revealed={revealed}
            text={observation}
          />
        </p>
      ) : null}

      <p
        className={
          isGreeting
            ? "max-w-[40rem] text-[clamp(1.5rem,3.8vw,2rem)] leading-[1.24] font-normal tracking-[-0.034em] text-text-primary"
            : "text-[clamp(1.35rem,3.4vw,1.875rem)] leading-[1.32] font-normal tracking-[-0.025em] text-text-primary"
        }
      >
        <WordReveal
          cancelled={cancelled}
          maxStaggerDelay={0.74}
          messageId={`${messageId}:question`}
          preferredStagger={0.026}
          revealed={revealed}
          startDelay={observation && !revealed ? 0.08 : 0}
          text={question}
          onRevealComplete={supportingText ? undefined : onRevealComplete}
        />
      </p>

      {supportingText ? (
        <p className="mt-4 max-w-[34rem] text-[0.8125rem] leading-5 text-text-secondary sm:text-sm sm:leading-6">
          <WordReveal
            cancelled={cancelled}
            maxStaggerDelay={0.38}
            messageId={`${messageId}:supporting`}
            preferredStagger={0.018}
            revealed={revealed}
            startDelay={revealed ? 0 : 0.28}
            text={supportingText}
            onRevealComplete={onRevealComplete}
          />
        </p>
      ) : null}
    </motion.article>
  );
}
