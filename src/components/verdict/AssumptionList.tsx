import type { Verdict } from "@/lib/schemas/verdict";

import { EvidenceLinks } from "./EvidenceQuote";

interface AssumptionListProps {
  assumptions: Verdict["assumptions"];
  evidence: Verdict["evidence"];
}

export function AssumptionList({
  assumptions,
  evidence,
}: AssumptionListProps) {
  if (assumptions.length === 0) {
    return (
      <p className="text-sm leading-6 text-text-tertiary">
        No additional assumption was isolated from the conversation.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-line-subtle">
      {assumptions.map((assumption, index) => (
        <li className="grid gap-4 py-6 sm:grid-cols-[5rem_1fr]" key={`${assumption.statement}-${index}`}>
          <span
            className={
              assumption.risk === "fatal" || assumption.risk === "high"
                ? "font-mono text-[0.625rem] tracking-[0.12em] text-signal-red"
                : "font-mono text-[0.625rem] tracking-[0.12em] text-text-tertiary"
            }
          >
            {assumption.risk}
          </span>
          <div>
            <p className="text-base leading-7 text-text-primary">
              {assumption.statement}
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {assumption.reason}
            </p>
            <EvidenceLinks
              evidence={evidence}
              evidenceRefs={assumption.evidenceRefs}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
