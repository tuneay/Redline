import "server-only";

import {
  APICallError,
  JSONParseError,
  LoadAPIKeyError,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  RetryError,
  TypeValidationError,
} from "ai";

import type { APIErrorCode } from "@/lib/schemas/api";

import { AIConfigurationError } from "./groq";
import {
  isProviderGenerationRejected,
  ModelOutputCompatibilityError,
} from "./validated-json";

export interface MappedAIError {
  code: APIErrorCode;
  message: string;
  retryable: boolean;
  status: number;
}

export function isRepairableModelOutput(error: unknown): boolean {
  return (
    NoObjectGeneratedError.isInstance(error) ||
    NoOutputGeneratedError.isInstance(error) ||
    JSONParseError.isInstance(error) ||
    TypeValidationError.isInstance(error) ||
    error instanceof ModelOutputCompatibilityError ||
    isProviderGenerationRejected(error)
  );
}

export function isConfiguredModelUnavailable(error: unknown): boolean {
  if (APICallError.isInstance(error)) {
    return error.statusCode === 404;
  }

  if (RetryError.isInstance(error) && error.lastError !== error) {
    return isConfiguredModelUnavailable(error.lastError);
  }

  return false;
}

export function getValidationSummary(error: unknown): string {
  if (TypeValidationError.isInstance(error)) {
    return "The generated object failed schema validation.";
  }

  if (error instanceof ModelOutputCompatibilityError) {
    return error.message;
  }

  if (isProviderGenerationRejected(error)) {
    return "The provider rejected the previous generation attempt before returning a valid object.";
  }

  if (
    NoObjectGeneratedError.isInstance(error) ||
    NoOutputGeneratedError.isInstance(error) ||
    JSONParseError.isInstance(error)
  ) {
    return "The response was not a complete object matching the required schema.";
  }

  return "The generated output was invalid.";
}

function mapApiCallError(error: APICallError): MappedAIError {
  if (error.statusCode === 429) {
    return {
      code: "MODEL_RATE_LIMIT",
      message: "The model is rate-limited. Wait briefly, then retry.",
      retryable: true,
      status: 429,
    };
  }

  if (error.statusCode === 408 || error.statusCode === 504) {
    return {
      code: "MODEL_TIMEOUT",
      message: "The model did not respond in time. Retry the request.",
      retryable: true,
      status: 504,
    };
  }

  if (error.statusCode === 400) {
    return {
      code: "MODEL_OUTPUT_INVALID",
      message:
        "Groq could not produce a valid response after automatic recovery. Retry the request.",
      retryable: true,
      status: 502,
    };
  }

  if (error.statusCode === 401) {
    return {
      code: "MODEL_UNAVAILABLE",
      message:
        process.env.NODE_ENV === "development"
          ? "GROQ_API_KEY was rejected. Check .env.local and restart the local server."
          : "The model provider rejected the server credentials.",
      retryable: false,
      status: 503,
    };
  }

  if (error.statusCode === 403) {
    return {
      code: "MODEL_UNAVAILABLE",
      message: "The configured Groq project cannot access this model.",
      retryable: false,
      status: 503,
    };
  }

  if (error.statusCode === 404) {
    return {
      code: "MODEL_UNAVAILABLE",
      message: "The configured Groq model is unavailable.",
      retryable: false,
      status: 503,
    };
  }

  if (error.statusCode === 413) {
    return {
      code: "MODEL_OUTPUT_INVALID",
      message:
        "The model request exceeded the provider token allowance after automatic fallback.",
      retryable: false,
      status: 502,
    };
  }

  return {
    code: "NETWORK_ERROR",
    message:
      process.env.NODE_ENV === "development"
        ? `Groq request failed with HTTP ${error.statusCode ?? "unknown"}. Retry the preserved request.`
        : "Groq could not complete the request. Retry shortly.",
    retryable: true,
    status: 503,
  };
}

export function mapAIError(error: unknown): MappedAIError {
  if (
    error instanceof AIConfigurationError ||
    LoadAPIKeyError.isInstance(error)
  ) {
    return {
      code: "MODEL_UNAVAILABLE",
      message:
        process.env.NODE_ENV === "development"
          ? "GROQ_API_KEY is not configured. Add it to .env.local and restart the local server."
          : "The model is unavailable because server configuration is incomplete.",
      retryable: false,
      status: 503,
    };
  }

  if (APICallError.isInstance(error)) {
    return mapApiCallError(error);
  }

  if (isRepairableModelOutput(error)) {
    return {
      code: "MODEL_OUTPUT_INVALID",
      message:
        process.env.NODE_ENV === "development" &&
        error instanceof ModelOutputCompatibilityError
          ? error.message
          : "The model returned invalid structured output. Retry the request.",
      retryable: true,
      status: 502,
    };
  }

  if (RetryError.isInstance(error)) {
    if (error.lastError !== error) {
      return mapAIError(error.lastError);
    }

    return {
      code: "NETWORK_ERROR",
      message: "The model request could not be completed. Retry shortly.",
      retryable: true,
      status: 503,
    };
  }

  if (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return {
      code: "MODEL_TIMEOUT",
      message: "The model did not respond in time. Retry the request.",
      retryable: true,
      status: 504,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Redline could not complete the request. Retry shortly.",
    retryable: true,
    status: 500,
  };
}
