"use client";

import { AnimatePresence, motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import { duration, ease } from "@/components/motion/motion-tokens";

interface ProgressMarkerProps {
  current: 0 | 1 | 2 | 3 | 4 | 5;
  total: 5;
}

export function ProgressMarker({ current, total }: ProgressMarkerProps) {
  const { shouldReduceMotion } = useMotionEnvironment();
  const currentLabel = String(current).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <p
      aria-label={`Question ${current} of ${total}`}
      className="font-mono text-[0.6875rem] leading-none tracking-[0.12em] text-text-tertiary tabular-nums"
    >
      <span className="relative inline-grid min-w-[1.5rem] overflow-hidden text-text-secondary">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            className="col-start-1 row-start-1"
            exit={{ filter: "blur(2px)", opacity: 0, y: -3 }}
            initial={
              shouldReduceMotion
                ? false
                : { filter: "blur(2px)", opacity: 0, y: 3 }
            }
            key={currentLabel}
            transition={{ duration: duration.fast, ease: ease.out }}
          >
            {currentLabel}
          </motion.span>
        </AnimatePresence>
      </span>
      <span aria-hidden="true" className="mx-2 text-text-tertiary">
        /
      </span>
      <span aria-hidden="true">{totalLabel}</span>
    </p>
  );
}
