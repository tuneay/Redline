import type { Fetcher } from "./interrogate-client";
import {
  createClientError,
  readApiError,
} from "./interrogate-client";
import {
  verdictResponseSchema,
  type VerdictRequest,
  type VerdictResponse,
} from "@/lib/schemas/verdict";

export async function requestVerdict(
  payload: VerdictRequest,
  options: {
    fetcher?: Fetcher;
    requestId: string;
    signal?: AbortSignal;
  },
): Promise<VerdictResponse> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher("/api/verdict", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    signal: options.signal,
  });

  if (!response.ok) {
    throw await readApiError(response, options.requestId);
  }

  let responseBody: unknown;

  try {
    responseBody = await response.json();
  } catch {
    throw createClientError(
      "MODEL_OUTPUT_INVALID",
      "Redline returned a malformed verdict. Retry without resubmitting your answer.",
      options.requestId,
    );
  }

  const parsed = verdictResponseSchema.safeParse(responseBody);

  if (!parsed.success) {
    throw createClientError(
      "MODEL_OUTPUT_INVALID",
      "Redline returned an invalid evidence record. Retry without resubmitting your answer.",
      options.requestId,
    );
  }

  return parsed.data;
}
