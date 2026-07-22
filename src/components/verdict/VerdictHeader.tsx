"use client";

import { motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import { WordReveal } from "@/components/motion/WordReveal";
import { duration, ease } from "@/components/motion/motion-tokens";
import type { Verdict } from "@/lib/schemas/verdict";

interface VerdictHeaderProps {
  onRevealComplete?: () => void;
  revealed: boolean;
  revealId: string;
  verdict: Verdict;
}

export function VerdictHeader({
  onRevealComplete,
  revealed,
  revealId,
  verdict,
}: VerdictHeaderProps) {
  const { shouldReduceMotion } = useMotionEnvironment();

  return (
    <header>
      <div className="overflow-hidden">
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="text-[clamp(3.5rem,12vw,6.75rem)] leading-[0.82] font-medium tracking-[-0.075em] text-signal-red"
          initial={
            shouldReduceMotion || revealed ? false : { opacity: 0, y: 18 }
          }
          transition={{ duration: duration.slow, ease: ease.out }}
        >
          {verdict.verdict}
        </motion.p>
      </div>

      <h2 className="mt-8 max-w-[43rem] text-[clamp(1.65rem,4.5vw,2.7rem)] leading-[1.14] tracking-[-0.035em] text-text-primary">
        <WordReveal
          maxStaggerDelay={0.62}
          messageId={`${revealId}:diagnosis`}
          onRevealComplete={onRevealComplete}
          preferredStagger={0.014}
          revealed={revealed}
          startDelay={revealed ? 0 : 0.12}
          text={verdict.diagnosis}
        />
      </h2>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="mt-9 flex items-end gap-4"
        initial={
          shouldReduceMotion || revealed ? false : { opacity: 0, y: 5 }
        }
        transition={{ delay: revealed ? 0 : 0.2, duration: duration.standard, ease: ease.out }}
      >
        <span className="text-[2rem] leading-none tracking-[-0.04em] text-text-primary tabular-nums">
          {verdict.score}
        </span>
        <span className="pb-0.5 font-mono text-[0.6875rem] tracking-[0.1em] text-text-tertiary">
          / 100 {"\u00b7"} {verdict.confidence} confidence
        </span>
      </motion.div>
    </header>
  );
}
