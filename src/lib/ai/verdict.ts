import "server-only";

import {
  createVerdictModelOutputSchema,
  type Verdict,
  type VerdictRequest,
} from "@/lib/schemas/verdict";
import { detectTargetLanguage } from "@/lib/utils/language";

import {
  getValidationSummary,
  isConfiguredModelUnavailable,
  isRepairableModelOutput,
} from "./errors";
import { getVerdictModelCandidates } from "./groq";
import {
  buildVerdictPrompt,
  buildVerdictRepairPrompt,
  VERDICT_SYSTEM_PROMPT,
} from "./prompts";
import { withOneRepairAttempt } from "./repair";
import {
  generateValidatedJson,
  isProviderRequestTooLarge,
} from "./validated-json";

const MODEL_TIMEOUT_MS = 60_000;

type VerdictModelCandidate = ReturnType<
  typeof getVerdictModelCandidates
>[number];

async function generateStructuredVerdict(
  request: VerdictRequest,
  candidate: VerdictModelCandidate,
  repair: boolean,
  failure: unknown,
  abortSignal?: AbortSignal,
): Promise<Verdict> {
  const schema = createVerdictModelOutputSchema(
    request.messages,
    detectTargetLanguage(request.messages),
  );
  const prompt = repair
    ? buildVerdictRepairPrompt(request, getValidationSummary(failure))
    : buildVerdictPrompt(request);
  return generateValidatedJson({
    model: candidate.model,
    system: VERDICT_SYSTEM_PROMPT,
    prompt,
    reasoningEffort: "low",
    schema,
    name: "redline_final_verdict",
    description:
      "The complete evidence-linked verdict after five questions and five answers.",
    temperature: candidate.temperature,
    maxOutputTokens: 3_200,
    abortSignal,
    timeout: MODEL_TIMEOUT_MS,
  });
}

async function generateWithCandidate(
  request: VerdictRequest,
  candidate: VerdictModelCandidate,
  abortSignal?: AbortSignal,
): Promise<Verdict> {
  return withOneRepairAttempt({
    generate: (repair, failure) =>
      generateStructuredVerdict(
        request,
        candidate,
        repair,
        failure,
        abortSignal,
      ),
    isRepairable: isRepairableModelOutput,
  });
}

export async function generateVerdict(
  request: VerdictRequest,
  abortSignal?: AbortSignal,
): Promise<Verdict> {
  const candidates = getVerdictModelCandidates();

  try {
    return await generateWithCandidate(request, candidates[0], abortSignal);
  } catch (error) {
    const fallback = candidates[1];

    if (
      !fallback ||
      (!isConfiguredModelUnavailable(error) &&
        !isProviderRequestTooLarge(error))
    ) {
      throw error;
    }

    return generateWithCandidate(request, fallback, abortSignal);
  }
}
