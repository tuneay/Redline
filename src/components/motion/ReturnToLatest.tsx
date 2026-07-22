"use client";

import { AnimatePresence, motion } from "motion/react";

import { useMotionEnvironment } from "./motion-context";
import { duration, ease } from "./motion-tokens";

interface ReturnToLatestProps {
  onActivate: () => void;
  visible: boolean;
}

export function ReturnToLatest({
  onActivate,
  visible,
}: ReturnToLatestProps) {
  const { shouldReduceMotion } = useMotionEnvironment();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex justify-center px-4">
      <AnimatePresence initial={false}>
        {visible ? (
          <motion.button
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            aria-label="Return to latest message"
            className="group/latest pointer-events-auto flex h-11 items-center gap-2.5 rounded-[1.125rem] border border-line-strong bg-surface-2 px-4 text-[0.6875rem] font-medium tracking-[0.06em] text-text-secondary transition-[border-color,background-color,color] duration-150 hover:border-text-tertiary hover:bg-surface-1 hover:text-text-primary"
            exit={{ filter: "blur(2px)", opacity: 0, y: 4 }}
            initial={
              shouldReduceMotion
                ? false
                : { filter: "blur(4px)", opacity: 0, y: 6 }
            }
            onClick={onActivate}
            transition={{ duration: duration.fast, ease: ease.out }}
            type="button"
            whileHover={shouldReduceMotion ? undefined : { y: -1 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.99, y: 0 }}
          >
            <span
              aria-hidden="true"
              className="h-px w-2.5 origin-left scale-x-75 bg-signal-red transition-transform duration-150 group-hover/latest:scale-x-100"
            />
            Return to latest
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
