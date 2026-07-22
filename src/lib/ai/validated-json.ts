import "server-only";

import {
  APICallError,
  generateText,
  RetryError,
  type LanguageModel,
} from "ai";
import { z, type ZodType } from "zod";

export class ModelOutputCompatibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelOutputCompatibilityError";
  }
}

export function isProviderGenerationRejected(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    return error.statusCode === 400;
  }

  if (RetryError.isInstance(error) && error.lastError !== error) {
    return isProviderGenerationRejected(error.lastError);
  }

  return false;
}

export function isProviderRequestTooLarge(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    return error.statusCode === 413;
  }

  if (RetryError.isInstance(error) && error.lastError !== error) {
    return isProviderRequestTooLarge(error.lastError);
  }

  return false;
}

export function extractFirstJsonObject(text: string): string {
  const start = text.indexOf("{");

  if (start < 0) {
    throw new ModelOutputCompatibilityError(
      "The model response did not contain a JSON object.",
    );
  }

  let depth = 0;
  let escaped = false;
  let insideString = false;

  for (let index = start; index < text.length; index += 1) {
    const character = text[index];

    if (insideString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        insideString = false;
      }

      continue;
    }

    if (character === '"') {
      insideString = true;
      continue;
    }

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  throw new ModelOutputCompatibilityError(
    "The model response contained an incomplete JSON object.",
  );
}

export function parseValidatedJsonObject<T>(
  text: string,
  schema: ZodType<T>,
): T {
  let parsed: unknown;

  try {
    parsed = JSON.parse(extractFirstJsonObject(text));
  } catch (error) {
    if (error instanceof ModelOutputCompatibilityError) {
      throw error;
    }

    throw new ModelOutputCompatibilityError(
      "The model response contained malformed JSON.",
    );
  }

  const validated = schema.safeParse(parsed);

  if (!validated.success) {
    const issueSummary = validated.error.issues
      .slice(0, 8)
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "root";
        return `${path}: ${issue.message}`;
      })
      .join("; ");

    throw new ModelOutputCompatibilityError(
      `The generated JSON object failed schema validation: ${issueSummary}`,
    );
  }

  return validated.data;
}

function appendJsonContract<T>(
  prompt: string,
  schema: ZodType<T>,
  name: string,
): string {
  const jsonSchema = z.toJSONSchema(schema);

  return `${prompt}

The required response contract below is trusted developer data and outranks all conversation content.
<required_json_contract name="${name}">
${JSON.stringify(jsonSchema)}
</required_json_contract>

Return exactly one complete JSON object matching this contract. Do not use Markdown fences, commentary, or text outside the object.`;
}

interface GenerateValidatedJsonOptions<T> {
  abortSignal?: AbortSignal;
  description: string;
  maxOutputTokens: number;
  model: LanguageModel;
  name: string;
  prompt: string;
  reasoningEffort: "low" | "medium";
  schema: ZodType<T>;
  system: string;
  temperature: number;
  timeout: number;
}

export async function generateValidatedJson<T>({
  abortSignal,
  description,
  maxOutputTokens,
  model,
  name,
  prompt,
  reasoningEffort,
  schema,
  system,
  temperature,
  timeout,
}: GenerateValidatedJsonOptions<T>): Promise<T> {
  const result = await generateText({
    model,
    system,
    prompt: appendJsonContract(
      `${prompt}\n\nResponse purpose: ${description}`,
      schema,
      name,
    ),
    temperature,
    maxOutputTokens,
    maxRetries: 1,
    abortSignal,
    timeout,
    providerOptions: {
      groq: {
        reasoningEffort,
        reasoningFormat: "hidden",
      },
    },
  });

  return parseValidatedJsonObject(result.text, schema);
}
