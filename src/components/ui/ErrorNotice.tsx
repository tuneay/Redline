"use client";

import { motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import { duration, ease } from "@/components/motion/motion-tokens";
import type { APIError } from "@/lib/schemas/api";

interface ErrorNoticeProps {
  error: APIError;
  onRetry: () => void;
}

export function ErrorNotice({ error, onRetry }: ErrorNoticeProps) {
  const { shouldReduceMotion } = useMotionEnvironment();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-3 flex min-h-14 items-center justify-between gap-4 border-l border-signal-red px-4 py-2 text-sm text-text-secondary"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
      role="alert"
      transition={{ duration: duration.fast, ease: ease.out }}
    >
      <p>{error.message}</p>
      {error.retryable ? (
        <motion.button
          className="group/retry relative min-h-11 shrink-0 px-2 text-xs font-medium tracking-[0.04em] text-text-primary transition-colors duration-150 hover:text-signal-red"
          onClick={onRetry}
          type="button"
          whileHover={shouldReduceMotion ? undefined : { x: 1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.99, x: 0 }}
        >
          <span className="relative">
            Retry
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-signal-red transition-transform duration-150 group-hover/retry:scale-x-100"
            />
          </span>
        </motion.button>
      ) : null}
    </motion.div>
  );
}
