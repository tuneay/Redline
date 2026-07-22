import type { Verdict } from "@/lib/schemas/verdict";

const DIMENSION_LABELS: Record<keyof Verdict["dimensions"], string> = {
  problemReality: "Problem reality",
  userSpecificity: "User specificity",
  behaviorChange: "Behavior change",
  distribution: "Distribution",
  commitment: "Commitment",
  retentionOrRepeatValue: "Retention or repeat value",
};

function list(items: string[]): string {
  return items.length > 0
    ? items.map((item) => `- ${item}`).join("\n")
    : "- None identified from the conversation.";
}

function evidenceRefs(refs: string[]): string {
  return refs.map((reference) => `\`${reference}\``).join(", ");
}

export function createVerdictMarkdown(verdict: Verdict): string {
  const sections = [
    `# Redline Verdict: ${verdict.verdict}`,
    "",
    "## Diagnosis",
    "",
    verdict.diagnosis,
    "",
    "## Score",
    "",
    `${verdict.score} / 100 \u2014 ${verdict.confidence} confidence`,
    "",
    "## Critical failure",
    "",
    `**${verdict.criticalFailure.title}**`,
    "",
    verdict.criticalFailure.explanation,
    "",
    `Evidence: ${evidenceRefs(verdict.criticalFailure.evidenceRefs)}`,
    "",
    "## Strongest signal",
    "",
    `**${verdict.strongestSignal.title}**`,
    "",
    verdict.strongestSignal.explanation,
    "",
    `Evidence: ${evidenceRefs(verdict.strongestSignal.evidenceRefs)}`,
  ];

  if (verdict.avoidancePattern) {
    sections.push(
      "",
      "## What you avoided",
      "",
      `**${verdict.avoidancePattern.title}**`,
      "",
      verdict.avoidancePattern.explanation,
      "",
      `Evidence: ${evidenceRefs(verdict.avoidancePattern.evidenceRefs)}`,
    );
  }

  sections.push("", "## Contradictions", "");
  sections.push(
    verdict.contradictions.length > 0
      ? verdict.contradictions
          .map(
            (item, index) =>
              `${index + 1}. \u201c${item.firstClaim}\u201d / \u201c${item.secondClaim}\u201d \u2014 ${item.consequence} (${evidenceRefs(item.evidenceRefs)})`,
          )
          .join("\n")
      : "No direct contradiction was established from the conversation.",
  );

  sections.push("", "## Dimensions", "");
  sections.push(
    Object.entries(verdict.dimensions)
      .map(([key, dimension]) => {
        const label = DIMENSION_LABELS[key as keyof Verdict["dimensions"]];
        return `- **${label}: ${dimension.score} / 100 (${dimension.confidence})** \u2014 ${dimension.reason} [${evidenceRefs(dimension.evidenceRefs)}]`;
      })
      .join("\n"),
  );

  sections.push("", "## Assumptions", "");
  sections.push(
    verdict.assumptions.length > 0
      ? verdict.assumptions
          .map(
            (assumption) =>
              `- **${assumption.risk.toUpperCase()}** \u2014 ${assumption.statement}: ${assumption.reason} [${evidenceRefs(assumption.evidenceRefs)}]`,
          )
          .join("\n")
      : "- No additional assumption was identified.",
  );

  sections.push(
    "",
    "## Reconstructed idea",
    "",
    verdict.reconstructedIdea,
    "",
    "## Validation order",
    "",
    `- **Action:** ${verdict.validationOrder.action}`,
    `- **Target user:** ${verdict.validationOrder.targetUser}`,
    `- **Sample size:** ${verdict.validationOrder.sampleSize}`,
    `- **Evidence to collect:** ${verdict.validationOrder.evidenceToCollect}`,
    `- **Pass condition:** ${verdict.validationOrder.passCondition}`,
    `- **Fail condition:** ${verdict.validationOrder.failCondition}`,
    "",
    "## Do not build yet",
    "",
    list(verdict.doNotBuildYet),
    "",
    "## Evidence",
    "",
    verdict.evidence
      .map(
        (item) =>
          `- **${item.id} \u2014 turn ${item.turn} \u2014 ${item.classification}:** \u201c${item.quote}\u201d`,
      )
      .join("\n"),
  );

  return sections.join("\n");
}
