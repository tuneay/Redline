import {
  apiErrorResponseSchema,
  apiErrorSchema,
  interrogateResponseSchema,
  type APIError,
  type InterrogateRequest,
  type InterrogateResponse,
} from "@/lib/schemas/api";

export type Fetcher = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export function createClientError(
  code: APIError["code"],
  message: string,
  requestId: string,
  retryable = true,
): APIError {
  return { code, message, retryable, requestId };
}

export function isAPIError(error: unknown): error is APIError {
  return apiErrorSchema.safeParse(error).success;
}

export async function readApiError(
  response: Response,
  fallbackRequestId: string,
): Promise<APIError> {
  try {
    const body: unknown = await response.json();
    const parsed = apiErrorResponseSchema.safeParse(body);

    if (parsed.success) {
      return parsed.data.error;
    }
  } catch {
    // The typed fallback keeps malformed server output away from the UI.
  }

  return createClientError(
    "UNKNOWN_ERROR",
    "Redline received an invalid server response. Retry the request.",
    fallbackRequestId,
  );
}

export async function requestInterrogation(
  payload: InterrogateRequest,
  options: {
    fetcher?: Fetcher;
    requestId: string;
    signal?: AbortSignal;
  },
): Promise<InterrogateResponse> {
  const fetcher = options.fetcher ?? fetch;
  const response = await fetcher("/api/interrogate", {
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
      "Redline returned malformed server output. Retry without resubmitting your answer.",
      options.requestId,
    );
  }

  const parsed = interrogateResponseSchema.safeParse(responseBody);
  const expectedQuestionNumber = payload.questionIndex + 1;

  if (
    !parsed.success ||
    parsed.data.questionNumber !== expectedQuestionNumber
  ) {
    throw createClientError(
      "MODEL_OUTPUT_INVALID",
      "Redline returned an invalid question. Retry without resubmitting your answer.",
      options.requestId,
    );
  }

  return parsed.data;
}
