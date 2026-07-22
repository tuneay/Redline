import { NextResponse } from "next/server";

import { mapAIError } from "@/lib/ai/errors";
import { generateVerdict } from "@/lib/ai/verdict";
import type { APIErrorCode } from "@/lib/schemas/api";
import { validateVerdictConversation } from "@/lib/schemas/conversation-order";
import {
  verdictRequestSchema,
  verdictResponseSchema,
  type VerdictRequest,
} from "@/lib/schemas/verdict";

export const runtime = "nodejs";

const MAX_REQUEST_BYTES = 128_000;
const activeRequests = new Set<string>();
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/gu;

function createRequestId(): string {
  return `server-request-${crypto.randomUUID()}`;
}

function errorResponse(options: {
  code: APIErrorCode;
  message: string;
  requestId: string;
  retryable: boolean;
  status: number;
}) {
  return NextResponse.json(
    {
      error: {
        code: options.code,
        message: options.message,
        retryable: options.retryable,
        requestId: options.requestId,
      },
    },
    { status: options.status },
  );
}

function sanitizeRequest(request: VerdictRequest): VerdictRequest | null {
  const sanitized = verdictRequestSchema.safeParse({
    ...request,
    messages: request.messages.map((message) => ({
      ...message,
      content: message.content.replace(CONTROL_CHARACTERS, "").trim(),
    })),
  });

  return sanitized.success ? sanitized.data : null;
}

async function parseRequestBody(
  request: Request,
): Promise<VerdictRequest | null> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
    return null;
  }

  const rawBody = await request.text();

  if (new TextEncoder().encode(rawBody).byteLength > MAX_REQUEST_BYTES) {
    return null;
  }

  try {
    const body: unknown = JSON.parse(rawBody);
    const parsed = verdictRequestSchema.safeParse(body);

    return parsed.success ? sanitizeRequest(parsed.data) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const requestId = createRequestId();
  const body = await parseRequestBody(request);

  if (!body) {
    return errorResponse({
      code: "INVALID_INPUT",
      message: "The verdict request is invalid or exceeds the allowed size.",
      retryable: false,
      requestId,
      status: 400,
    });
  }

  const sequence = validateVerdictConversation(body);

  if (!sequence.success) {
    return errorResponse({
      code: "INVALID_STATE",
      message: sequence.message ?? "The completed conversation is invalid.",
      retryable: false,
      requestId,
      status: 409,
    });
  }

  const activeRequestKey = `${body.sessionId}:verdict`;

  if (activeRequests.has(activeRequestKey)) {
    return errorResponse({
      code: "INVALID_STATE",
      message: "A verdict request for this session is already active.",
      retryable: true,
      requestId,
      status: 409,
    });
  }

  activeRequests.add(activeRequestKey);

  try {
    const verdict = await generateVerdict(body, request.signal);
    const response = verdictResponseSchema.parse({ requestId, ...verdict });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const mappedError = mapAIError(error);

    return errorResponse({ ...mappedError, requestId });
  } finally {
    activeRequests.delete(activeRequestKey);
  }
}
