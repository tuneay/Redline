"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion } from "motion/react";

import { useMotionEnvironment } from "@/components/motion/motion-context";
import { duration, ease } from "@/components/motion/motion-tokens";
import type { Verdict } from "@/lib/schemas/verdict";
import { copyTextToClipboard } from "@/lib/utils/clipboard";
import { createVerdictMarkdown } from "@/lib/utils/markdown-report";

import { AssumptionList } from "./AssumptionList";
import { EvidenceLinks, EvidenceQuote } from "./EvidenceQuote";
import { ValidationOrder } from "./ValidationOrder";
import { VerdictHeader } from "./VerdictHeader";

type CopyStatus = "idle" | "copied" | "error";

const DIMENSION_LABELS: Record<keyof Verdict["dimensions"], string> = {
  problemReality: "Problem reality",
  userSpecificity: "User specificity",
  behaviorChange: "Behavior change",
  distribution: "Distribution",
  commitment: "Commitment",
  retentionOrRepeatValue: "Retention or repeat value",
};

interface VerdictSectionProps {
  children: ReactNode;
  index: number;
  label: string;
  revealed: boolean;
}

function VerdictSection({
  children,
  index,
  label,
  revealed,
}: VerdictSectionProps) {
  const { shouldReduceMotion } = useMotionEnvironment();

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-line-subtle pt-8 sm:pt-10"
      initial={
        shouldReduceMotion || revealed ? false : { opacity: 0, y: 8 }
      }
      transition={{
        delay: revealed ? 0 : Math.min(0.08 + index * 0.045, 0.35),
        duration: duration.standard,
        ease: ease.out,
      }}
    >
      <h3 className="mb-5 font-mono text-[0.6875rem] tracking-[0.13em] text-text-tertiary">
        {label}
      </h3>
      {children}
    </motion.section>
  );
}

interface VerdictViewProps {
  onEnter?: (element: HTMLElement) => void;
  onRevealComplete?: () => void;
  revealId: string;
  revealed: boolean;
  verdict: Verdict;
}

export function VerdictView({
  onEnter,
  onRevealComplete,
  revealId,
  revealed,
  verdict,
}: VerdictViewProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const rootRef = useRef<HTMLElement>(null);
  const enteredRef = useRef(false);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { shouldReduceMotion } = useMotionEnvironment();

  useLayoutEffect(() => {
    if (!enteredRef.current && rootRef.current) {
      enteredRef.current = true;
      onEnter?.(rootRef.current);
    }
  }, [onEnter]);

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  async function copyMarkdown() {
    try {
      await copyTextToClipboard(createVerdictMarkdown(verdict));
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }

    resetTimeoutRef.current = setTimeout(() => setCopyStatus("idle"), 2_000);
  }

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      aria-label={`Redline verdict: ${verdict.verdict}`}
      className="mt-20 space-y-12 border-t border-line-strong pt-12 pb-16 sm:mt-24 sm:space-y-16 sm:pt-16 sm:pb-24"
      initial={
        shouldReduceMotion || revealed ? false : { opacity: 0, y: 10 }
      }
      ref={rootRef}
      transition={{ duration: duration.slow, ease: ease.out }}
    >
      <VerdictHeader
        onRevealComplete={onRevealComplete}
        revealId={revealId}
        revealed={revealed}
        verdict={verdict}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <motion.button
          className="group/copy relative min-h-11 rounded-[1.125rem] border border-line-strong px-5 text-xs font-medium tracking-[0.04em] text-text-primary transition-[border-color,background-color,color] duration-150 hover:border-text-tertiary hover:bg-surface-2"
          onClick={copyMarkdown}
          type="button"
          whileHover={shouldReduceMotion ? undefined : { y: -1 }}
          whileTap={
            shouldReduceMotion ? undefined : { scale: 0.99, y: 0 }
          }
        >
          <span className="relative">
            {copyStatus === "copied"
              ? "Copied"
              : copyStatus === "error"
                ? "Copy failed"
                : "Copy Markdown"}
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-signal-red transition-transform duration-150 group-hover/copy:scale-x-100"
            />
          </span>
        </motion.button>
        <span aria-live="polite" className="text-xs text-text-tertiary">
          {copyStatus === "error"
            ? "Clipboard permission was unavailable."
            : ""}
        </span>
      </div>

      <VerdictSection index={0} label="Critical failure" revealed={revealed}>
        <h4 className="max-w-[40rem] text-xl leading-7 tracking-[-0.02em] text-signal-red sm:text-2xl sm:leading-8">
          {verdict.criticalFailure.title}
        </h4>
        <p className="mt-3 max-w-[40rem] text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
          {verdict.criticalFailure.explanation}
        </p>
        <EvidenceLinks
          evidence={verdict.evidence}
          evidenceRefs={verdict.criticalFailure.evidenceRefs}
        />
      </VerdictSection>

      <VerdictSection index={1} label="Strongest signal" revealed={revealed}>
        <h4 className="max-w-[40rem] text-xl leading-7 tracking-[-0.02em] text-text-primary sm:text-2xl sm:leading-8">
          {verdict.strongestSignal.title}
        </h4>
        <p className="mt-3 max-w-[40rem] text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
          {verdict.strongestSignal.explanation}
        </p>
        <EvidenceLinks
          evidence={verdict.evidence}
          evidenceRefs={verdict.strongestSignal.evidenceRefs}
        />
      </VerdictSection>

      {verdict.avoidancePattern ? (
        <VerdictSection index={2} label="What you avoided" revealed={revealed}>
          <h4 className="max-w-[40rem] text-xl leading-7 tracking-[-0.02em] text-text-primary sm:text-2xl sm:leading-8">
            {verdict.avoidancePattern.title}
          </h4>
          <p className="mt-3 max-w-[40rem] text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
            {verdict.avoidancePattern.explanation}
          </p>
          <EvidenceLinks
            evidence={verdict.evidence}
            evidenceRefs={verdict.avoidancePattern.evidenceRefs}
          />
        </VerdictSection>
      ) : null}

      <VerdictSection index={3} label="Contradictions" revealed={revealed}>
        {verdict.contradictions.length > 0 ? (
          <div className="space-y-9">
            {verdict.contradictions.map((contradiction, index) => (
              <div key={`${contradiction.firstClaim}-${index}`}>
                <div className="relative space-y-3 pl-5">
                  <motion.span
                    aria-hidden="true"
                    className="absolute top-1 bottom-1 left-0 w-px origin-top bg-signal-red"
                    initial={
                      shouldReduceMotion || revealed ? false : { scaleY: 0 }
                    }
                    animate={{ scaleY: 1 }}
                    transition={{
                      delay: revealed ? 0 : 0.2,
                      duration: duration.slow,
                      ease: ease.inOut,
                    }}
                  />
                  <p className="text-base leading-7 text-text-primary">
                    {"\u201c"}{contradiction.firstClaim}{"\u201d"}
                  </p>
                  <p className="text-base leading-7 text-text-primary">
                    {"\u201c"}{contradiction.secondClaim}{"\u201d"}
                  </p>
                </div>
                <p className="mt-4 max-w-[40rem] text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">
                  {contradiction.consequence}
                </p>
                <EvidenceLinks
                  evidence={verdict.evidence}
                  evidenceRefs={contradiction.evidenceRefs}
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-text-tertiary">
            No direct contradiction was established from the conversation.
          </p>
        )}
      </VerdictSection>

      <VerdictSection index={4} label="Dimensions" revealed={revealed}>
        <dl className="divide-y divide-line-subtle">
          {Object.entries(verdict.dimensions).map(([key, dimension]) => (
            <div
              className="grid gap-3 py-6 sm:grid-cols-[9rem_4rem_1fr] sm:gap-5"
              key={key}
            >
              <dt className="text-sm text-text-primary">
                {DIMENSION_LABELS[key as keyof Verdict["dimensions"]]}
              </dt>
              <dd className="font-mono text-xs text-text-tertiary tabular-nums">
                {dimension.score} / 100
              </dd>
              <dd>
                <p className="text-sm leading-6 text-text-secondary">
                  {dimension.reason}
                </p>
                <p className="mt-2 font-mono text-[0.625rem] tracking-[0.08em] text-text-tertiary">
                  {dimension.confidence} confidence
                </p>
                <EvidenceLinks
                  evidence={verdict.evidence}
                  evidenceRefs={dimension.evidenceRefs}
                />
              </dd>
            </div>
          ))}
        </dl>
      </VerdictSection>

      <VerdictSection index={5} label="Assumptions" revealed={revealed}>
        <AssumptionList
          assumptions={verdict.assumptions}
          evidence={verdict.evidence}
        />
      </VerdictSection>

      <VerdictSection index={6} label="Reconstructed idea" revealed={revealed}>
        <p className="max-w-[42rem] text-xl leading-8 tracking-[-0.02em] text-text-primary sm:text-2xl sm:leading-9">
          {verdict.reconstructedIdea}
        </p>
      </VerdictSection>

      <VerdictSection index={7} label="Validation order" revealed={revealed}>
        <ValidationOrder validation={verdict.validationOrder} />
      </VerdictSection>

      <VerdictSection index={8} label="Do not build yet" revealed={revealed}>
        {verdict.doNotBuildYet.length > 0 ? (
          <ul className="divide-y divide-line-subtle">
            {verdict.doNotBuildYet.map((item, index) => (
              <li
                className="grid grid-cols-[1.5rem_1fr] gap-3 py-4 text-base leading-7 text-text-secondary"
                key={`${item}-${index}`}
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.85rem] h-px w-2 bg-signal-red"
                />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-text-tertiary">
            No additional build restriction was identified.
          </p>
        )}
      </VerdictSection>

      <VerdictSection index={9} label="Evidence record" revealed={revealed}>
        <div className="space-y-3">
          {verdict.evidence.map((evidence) => (
            <EvidenceQuote evidence={evidence} key={evidence.id} />
          ))}
        </div>
      </VerdictSection>
    </motion.article>
  );
}
