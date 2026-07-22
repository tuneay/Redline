import type { Verdict } from "@/lib/schemas/verdict";

interface ValidationOrderProps {
  validation: Verdict["validationOrder"];
}

const FIELDS: Array<{
  key: keyof Verdict["validationOrder"];
  label: string;
}> = [
  { key: "action", label: "Action" },
  { key: "targetUser", label: "Target user" },
  { key: "sampleSize", label: "Sample" },
  { key: "evidenceToCollect", label: "Collect" },
  { key: "passCondition", label: "Pass if" },
  { key: "failCondition", label: "Fail if" },
];

export function ValidationOrder({ validation }: ValidationOrderProps) {
  return (
    <div className="rounded-[1.5rem] border border-line-strong bg-surface-1 px-5 py-2 sm:px-7">
      <dl className="divide-y divide-line-subtle">
        {FIELDS.map((field) => (
          <div
            className="grid gap-2 py-5 sm:grid-cols-[6.25rem_1fr] sm:gap-5"
            key={field.key}
          >
            <dt className="font-mono text-[0.625rem] tracking-[0.1em] text-text-tertiary">
              {field.label}
            </dt>
            <dd
              className={
                field.key === "failCondition"
                  ? "text-sm leading-6 text-signal-red sm:text-base sm:leading-7"
                  : "text-sm leading-6 text-text-primary sm:text-base sm:leading-7"
              }
            >
              {validation[field.key]}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
