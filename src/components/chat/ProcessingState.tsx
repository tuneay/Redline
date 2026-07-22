"use client";

import { AnimatePresence, motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import {
  duration,
  ease,
  reducedMotionTransition,
} from "@/components/motion/motion-tokens";

interface ProcessingStateProps {
  active: boolean;
  label?: string;
}

export function ProcessingState({
  active,
  label = "selecting the next pressure point",
}: ProcessingStateProps) {
  const { shouldReduceMotion } = useMotionEnvironment();

  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className="flex min-h-9 items-center"
      role="status"
    >
      <AnimatePresence initial={false} mode="wait">
        {active ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 text-[0.6875rem] tracking-[0.08em] text-text-secondary"
            exit={{ opacity: 0, y: -2 }}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
            key="processing"
            transition={
              shouldReduceMotion
                ? reducedMotionTransition
                : { duration: duration.fast, ease: ease.out }
            }
          >
            <span
              aria-hidden="true"
              className="relative h-1.5 w-11 shrink-0 overflow-hidden"
            >
              <span className="absolute top-[2.5px] left-0 h-px w-11 bg-line-subtle" />
              <motion.span
                animate={
                  shouldReduceMotion
                    ? { height: 2, width: 44, x: 0, y: 2 }
                    : { height: 1, width: 22, x: 22, y: 2.5 }
                }
                className="absolute top-0 left-0 rounded-full bg-signal-red"
                initial={
                  shouldReduceMotion
                    ? false
                    : { height: 6, width: 6, x: 0, y: 0 }
                }
                transition={{ duration: duration.emphasis, ease: ease.inOut }}
              />
            </span>
            <span>{label}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
