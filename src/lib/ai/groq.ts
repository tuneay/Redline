import "server-only";

import { createGroq } from "@ai-sdk/groq";

const DEFAULT_CHAT_MODEL = "openai/gpt-oss-20b";
const DEFAULT_FINAL_MODEL = "openai/gpt-oss-120b";
const DEFAULT_INTERROGATION_TEMPERATURE = 0.35;
const DEFAULT_VERDICT_TEMPERATURE = 0.2;

export class AIConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIConfigurationError";
  }
}

function readTemperature(
  rawValue: string | undefined,
  fallback: number,
): number {

  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);

  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : fallback;
}

export function getInterrogationModel() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new AIConfigurationError("GROQ_API_KEY is not configured.");
  }

  const modelId = process.env.GROQ_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
  const provider = createGroq({ apiKey });

  return {
    model: provider(modelId),
    modelId,
    temperature: readTemperature(
      process.env.AI_TEMPERATURE_INTERROGATE,
      DEFAULT_INTERROGATION_TEMPERATURE,
    ),
  };
}

export function getVerdictModelCandidates() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new AIConfigurationError("GROQ_API_KEY is not configured.");
  }

  const chatModelId =
    process.env.GROQ_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL;
  const finalModelId =
    process.env.GROQ_FINAL_MODEL?.trim() || DEFAULT_FINAL_MODEL;
  const provider = createGroq({ apiKey });
  const temperature = readTemperature(
    process.env.AI_TEMPERATURE_VERDICT,
    DEFAULT_VERDICT_TEMPERATURE,
  );
  const modelIds =
    finalModelId === chatModelId
      ? [finalModelId]
      : [finalModelId, chatModelId];

  return modelIds.map((modelId, index) => ({
    fallback: index > 0,
    model: provider(modelId),
    modelId,
    temperature,
  }));
}
