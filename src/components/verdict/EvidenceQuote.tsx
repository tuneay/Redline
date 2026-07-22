"use client";

import { motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import { duration, ease } from "@/components/motion/motion-tokens";
import type { EvidenceRecord } from "@/lib/schemas/verdict";

const CLASSIFICATION_LABELS: Record<EvidenceRecord["classification"], string> = {
  reported_fact: "reported fact",
  claim: "claim",
  assumption: "assumption",
  unknown: "unknown",
};

interface EvidenceLinksProps {
  evidence: EvidenceRecord[];
  evidenceRefs: string[];
}

export function EvidenceLinks({
  evidence,
  evidenceRefs,
}: EvidenceLinksProps) {
  const { shouldReduceMotion } = useMotionEnvironment();
  const byId = new Map(evidence.map((item) => [item.id, item]));

  function revealEvidence(reference: string) {
    document.getElementById(`verdict-evidence-${reference}`)?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2" aria-label="Evidence references">
      {evidenceRefs.map((reference) => {
        const item = byId.get(reference);

        return (
          <motion.button
            className="group/evidence min-h-11 py-2 text-left font-mono text-[0.625rem] tracking-[0.08em] text-text-tertiary transition-colors duration-150 hover:text-text-primary"
            key={reference}
            onClick={() => revealEvidence(reference)}
            type="button"
            whileHover={shouldReduceMotion ? undefined : { x: 1 }}
            whileTap={
              shouldReduceMotion ? undefined : { scale: 0.99, x: 0 }
            }
          >
            <span className="relative inline-block">
              {item ? `turn ${item.turn}` : reference}
              <span
                aria-hidden="true"
                className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-signal-red transition-transform duration-150 group-hover/evidence:scale-x-100"
              />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

interface EvidenceQuoteProps {
  evidence: EvidenceRecord;
}

export function EvidenceQuote({ evidence }: EvidenceQuoteProps) {
  return (
    <motion.blockquote
      className="scroll-mt-8 rounded-[1.25rem] border border-line-subtle bg-surface-1 px-5 py-4 sm:px-6"
      id={`verdict-evidence-${evidence.id}`}
      layout
      transition={{ duration: duration.fast, ease: ease.out }}
    >
      <p className="text-sm leading-6 break-words text-text-primary sm:text-base sm:leading-7">
        {"\u201c"}{evidence.quote}{"\u201d"}
      </p>
      <footer className="mt-3 font-mono text-[0.625rem] tracking-[0.09em] text-text-tertiary">
        turn {evidence.turn} {"\u00b7"}{" "}
        {CLASSIFICATION_LABELS[evidence.classification]}
      </footer>
    </motion.blockquote>
  );
}
