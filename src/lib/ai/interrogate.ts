import "server-only";

import {
  createInterrogateModelOutputSchema,
  type InterrogateModelOutput,
  type InterrogateRequest,
} from "@/lib/schemas/api";
import type { QuestionNumber } from "@/lib/schemas/conversation";
import { detectTargetLanguage } from "@/lib/utils/language";

import {
  getValidationSummary,
  isRepairableModelOutput,
} from "./errors";
import { getInterrogationModel } from "./groq";
import {
  buildInterrogationPrompt,
  buildRepairPrompt,
  INTERROGATION_SYSTEM_PROMPT,
} from "./prompts";
import { withOneRepairAttempt } from "./repair";
import { generateValidatedJson } from "./validated-json";

const MODEL_TIMEOUT_MS = 38_000;

function getExpectedQuestionNumber(questionIndex: number): QuestionNumber {
  return (questionIndex + 1) as QuestionNumber;
}

async function generateStructuredInterrogation(
  request: InterrogateRequest,
  repair: boolean,
  failure: unknown,
  abortSignal?: AbortSignal,
): Promise<InterrogateModelOutput> {
  const expectedQuestionNumber = getExpectedQuestionNumber(
    request.questionIndex,
  );
  const schema = createInterrogateModelOutputSchema(
    expectedQuestionNumber,
    request.messages.map((_, index) => `turn-${index + 1}`),
    detectTargetLanguage(request.messages),
  );
  const { model, temperature } = getInterrogationModel();
  const prompt = repair
    ? buildRepairPrompt(
        request,
        expectedQuestionNumber,
        getValidationSummary(failure),
      )
    : buildInterrogationPrompt(request, expectedQuestionNumber);
  return generateValidatedJson({
    model,
    system: INTERROGATION_SYSTEM_PROMPT,
    prompt,
    reasoningEffort: "low",
    schema,
    name: "redline_interrogation_turn",
    description:
      "One evidence-linked observation, one primary question, and the running analysis.",
    temperature,
    maxOutputTokens: 1_800,
    abortSignal,
    timeout: MODEL_TIMEOUT_MS,
  });
}

export async function generateInterrogation(
  request: InterrogateRequest,
  abortSignal?: AbortSignal,
): Promise<InterrogateModelOutput> {
  return withOneRepairAttempt({
    generate: (repair, failure) =>
      generateStructuredInterrogation(
        request,
        repair,
        failure,
        abortSignal,
      ),
    isRepairable: isRepairableModelOutput,
  });
}
