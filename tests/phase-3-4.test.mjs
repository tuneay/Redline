import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const fs = require("node:fs");
const Module = require("node:module");
const ts = require("typescript");
const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testDirectory, "..");
const sourceRoot = path.join(projectRoot, "src");
const originalResolveFilename = Module._resolveFilename;
const originalLoad = Module._load;

Module._extensions[".ts"] = function loadTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

Module._resolveFilename = function resolveFilename(
  request,
  parent,
  isMain,
  options,
) {
  if (request.startsWith("@/")) {
    request = path.join(sourceRoot, request.slice(2));
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

Module._load = function loadModule(request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }

  return originalLoad.call(this, request, parent, isMain);
};

const {
  createInterrogateModelOutputSchema,
  interrogateRequestSchema,
} = require("../src/lib/schemas/api.ts");
const {
  requestInterrogation,
} = require("../src/lib/api/interrogate-client.ts");
const {
  emptyRunningAnalysis,
} = require("../src/lib/schemas/conversation.ts");
const {
  validateInterrogateConversation,
} = require("../src/lib/schemas/conversation-order.ts");
const {
  conversationReducer,
} = require("../src/lib/state/conversation-reducer.ts");
const {
  createFreshConversationState,
  createInitialConversationState,
} = require("../src/lib/state/initial-state.ts");
const {
  hydrateStoredSession,
  serializeConversationState,
} = require("../src/lib/state/session-storage.ts");
const {
  createVerdictMarkdown,
} = require("../src/lib/utils/markdown-report.ts");
const {
  withOneRepairAttempt,
} = require("../src/lib/ai/repair.ts");
const {
  mapAIError,
} = require("../src/lib/ai/errors.ts");
const {
  AIConfigurationError,
} = require("../src/lib/ai/groq.ts");
const { APICallError } = require("ai");

const timestamp = "2026-07-21T12:00:00.000Z";

function createQuestion(number) {
  return {
    id: `question-${number}`,
    role: "assistant",
    kind: "question",
    content: `Observation ${number}.\n\nQuestion ${number}?`,
    observation: `Observation ${number}.`,
    question: `Question ${number}?`,
    questionNumber: number,
    createdAt: timestamp,
    revealed: false,
  };
}

function createAnswer(number) {
  return {
    id: `answer-${number}`,
    role: "user",
    kind: "answer",
    content: `Answer ${number}.`,
    questionNumber: number,
    createdAt: timestamp,
    revealed: false,
  };
}

function createIdea() {
  return {
    id: "idea-1",
    role: "user",
    kind: "idea",
    content: "A narrow workflow tool for a specific team.",
    createdAt: timestamp,
    revealed: false,
  };
}

function createVerdictFixture() {
  const dimension = {
    score: 45,
    confidence: "medium",
    reason: "The conversation supports only a partial conclusion.",
    evidenceRefs: ["evidence-1"],
  };

  return {
    verdict: "VALIDATE",
    score: 45,
    confidence: "medium",
    diagnosis: "The problem is plausible, but the first-user path is unproven.",
    strongestSignal: {
      title: "A specific workflow",
      explanation: "The idea names one repeated workflow.",
      evidenceRefs: ["evidence-1"],
    },
    criticalFailure: {
      title: "No reachable first users",
      explanation: "The conversation does not establish a concrete path.",
      evidenceRefs: ["evidence-1"],
    },
    avoidancePattern: null,
    contradictions: [],
    dimensions: {
      problemReality: dimension,
      userSpecificity: dimension,
      behaviorChange: dimension,
      distribution: dimension,
      commitment: dimension,
      retentionOrRepeatValue: dimension,
    },
    assumptions: [
      {
        statement: "The team will replace its current workflow.",
        risk: "high",
        reason: "No observed switch was supplied.",
        evidenceRefs: ["evidence-1"],
      },
    ],
    reconstructedIdea: "A narrow workflow tool for one reachable team.",
    validationOrder: {
      action: "Run the workflow manually with five teams.",
      targetUser: "Operations leads at five-person agencies",
      sampleSize: "5 teams",
      evidenceToCollect: "Repeated use without reminders",
      passCondition: "At least 3 teams repeat the workflow within 14 days.",
      failCondition: "Fewer than 2 teams repeat it within 14 days.",
    },
    doNotBuildYet: ["Automation dashboard"],
    evidence: [
      {
        id: "evidence-1",
        turn: 2,
        quote: "A narrow workflow tool",
        classification: "claim",
      },
    ],
  };
}

function buildCompleteConversationState() {
  let state = conversationReducer(createInitialConversationState(), {
    type: "START_FRESH",
    state: createFreshConversationState(),
  });
  const idea = createIdea();

  state = conversationReducer(state, {
    type: "SUBMIT_USER",
    message: idea,
    requestId: "request-1",
    requestPhase: "interrogating",
  });
  state = conversationReducer(state, {
    type: "INTERROGATE_SUCCEEDED",
    requestId: "request-1",
    message: createQuestion(1),
    analysis: emptyRunningAnalysis,
  });

  for (let nextQuestion = 2; nextQuestion <= 5; nextQuestion += 1) {
    const requestId = `request-${nextQuestion}`;
    state = conversationReducer(state, {
      type: "SUBMIT_USER",
      message: createAnswer(nextQuestion - 1),
      requestId,
      requestPhase: "interrogating",
    });
    state = conversationReducer(state, {
      type: "INTERROGATE_SUCCEEDED",
      requestId,
      message: createQuestion(nextQuestion),
      analysis: emptyRunningAnalysis,
    });
  }

  return state;
}

test("the reducer blocks duplicates, ignores stale responses, and reaches five questions once", () => {
  let state = conversationReducer(createInitialConversationState(), {
    type: "START_FRESH",
    state: createFreshConversationState(),
  });
  const idea = createIdea();
  state = conversationReducer(state, {
    type: "SUBMIT_USER",
    message: idea,
    requestId: "request-1",
    requestPhase: "interrogating",
  });

  const duplicateState = conversationReducer(state, {
    type: "SUBMIT_USER",
    message: idea,
    requestId: "duplicate-request",
    requestPhase: "interrogating",
  });
  assert.equal(duplicateState, state);

  const staleState = conversationReducer(state, {
    type: "INTERROGATE_SUCCEEDED",
    requestId: "stale-request",
    message: createQuestion(1),
    analysis: emptyRunningAnalysis,
  });
  assert.equal(staleState, state);

  state = buildCompleteConversationState();
  assert.equal(state.questionIndex, 5);
  assert.equal(
    state.messages.filter((message) => message.kind === "question").length,
    5,
  );

  const answerFive = createAnswer(5);
  state = conversationReducer(state, {
    type: "SUBMIT_USER",
    message: answerFive,
    requestId: "verdict-request",
    requestPhase: "generating_verdict",
  });
  assert.equal(state.phase, "generating_verdict");

  const verdict = createVerdictFixture();
  state = conversationReducer(state, {
    type: "VERDICT_SUCCEEDED",
    requestId: "verdict-request",
    verdict,
  });
  assert.equal(state.phase, "verdict");
  assert.equal(state.messages.length, 12);

  const repeatedVerdictState = conversationReducer(state, {
    type: "VERDICT_SUCCEEDED",
    requestId: "verdict-request",
    verdict,
  });
  assert.equal(repeatedVerdictState, state);
});

test("valid storage hydrates, active requests recover, and invalid storage is rejected", () => {
  let state = buildCompleteConversationState();
  state = conversationReducer(state, {
    type: "MESSAGE_REVEALED",
    messageId: "question-5",
  });
  const stored = serializeConversationState(state);
  assert.ok(stored);

  const hydrated = hydrateStoredSession(JSON.stringify(stored));
  assert.equal(hydrated.wasInvalid, false);
  assert.equal(hydrated.interruptedError, null);
  assert.deepEqual(hydrated.session.revealedMessageIds, ["question-5"]);

  const pendingState = conversationReducer(state, {
    type: "SUBMIT_USER",
    message: createAnswer(5),
    requestId: "pending-verdict",
    requestPhase: "generating_verdict",
  });
  const pendingStored = serializeConversationState(pendingState);
  const recovered = hydrateStoredSession(JSON.stringify(pendingStored));
  assert.equal(recovered.interruptedError.code, "NETWORK_ERROR");
  assert.equal(recovered.interruptedError.retryable, true);

  assert.equal(hydrateStoredSession("not-json").wasInvalid, true);
  assert.equal(
    hydrateStoredSession(
      JSON.stringify({ ...stored, questionIndex: 3 }),
    ).wasInvalid,
    true,
  );
});

test("retry preserves the submitted answer and does not advance twice", () => {
  let state = buildCompleteConversationState();
  const answerFive = createAnswer(5);
  state = conversationReducer(state, {
    type: "SUBMIT_USER",
    message: answerFive,
    requestId: "failed-verdict",
    requestPhase: "generating_verdict",
  });
  const messageCount = state.messages.length;

  state = conversationReducer(state, {
    type: "REQUEST_FAILED",
    requestId: "failed-verdict",
    error: {
      code: "MODEL_TIMEOUT",
      message: "Timed out.",
      retryable: true,
      requestId: "server-timeout",
    },
  });
  assert.equal(state.phase, "error");

  state = conversationReducer(state, {
    type: "RETRY_STARTED",
    requestId: "retry-verdict",
    requestPhase: "generating_verdict",
  });
  assert.equal(state.messages.length, messageCount);
  assert.equal(state.questionIndex, 5);

  state = conversationReducer(state, {
    type: "VERDICT_SUCCEEDED",
    requestId: "retry-verdict",
    verdict: createVerdictFixture(),
  });
  assert.equal(state.phase, "verdict");
  assert.equal(state.messages.length, messageCount);
});

test("interrogate requests enforce order and reject a sixth question index", () => {
  const validRequest = interrogateRequestSchema.parse({
    sessionId: "session-1",
    questionIndex: 0,
    messages: [
      { role: "assistant", content: "What are you building?" },
      { role: "user", content: "A focused product idea." },
    ],
  });
  assert.equal(validateInterrogateConversation(validRequest).success, true);

  const invalidOrder = interrogateRequestSchema.parse({
    sessionId: "session-1",
    questionIndex: 1,
    messages: [
      { role: "user", content: "A focused product idea." },
      { role: "user", content: "Question one?", questionNumber: 1 },
      { role: "assistant", content: "Answer one.", questionNumber: 1 },
    ],
  });
  assert.equal(validateInterrogateConversation(invalidOrder).success, false);

  assert.equal(
    interrogateRequestSchema.safeParse({
      sessionId: "session-1",
      questionIndex: 5,
      messages: [{ role: "user", content: "No sixth question." }],
    }).success,
    false,
  );
});

test("contextual model schema requires the expected question number", () => {
  const baseOutput = {
    observation: "The evidence is incomplete.",
    question: "What happened the last time?",
    questionNumber: 1,
    pressurePoint: "problem",
    detectedIssue: "unsupported_claim",
    severity: 3,
    analysis: emptyRunningAnalysis,
  };
  const schema = createInterrogateModelOutputSchema(2);
  assert.equal(schema.safeParse(baseOutput).success, false);
  assert.equal(
    schema.safeParse({ ...baseOutput, questionNumber: 2 }).success,
    true,
  );
});

test("the client accepts validated responses and types malformed or failed responses", async () => {
  const payload = interrogateRequestSchema.parse({
    sessionId: "session-client",
    questionIndex: 0,
    messages: [{ role: "user", content: "A focused product idea." }],
  });
  const validResponse = {
    requestId: "server-request-1",
    observation: "The problem is still unsupported.",
    question: "What happened the last time?",
    questionNumber: 1,
    pressurePoint: "problem",
    detectedIssue: "unsupported_claim",
    severity: 3,
    analysis: emptyRunningAnalysis,
  };

  const result = await requestInterrogation(payload, {
    requestId: "client-request-1",
    fetcher: async () =>
      new Response(JSON.stringify(validResponse), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
  });
  assert.equal(result.questionNumber, 1);

  await assert.rejects(
    requestInterrogation(payload, {
      requestId: "client-request-2",
      fetcher: async () =>
        new Response("not-json", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
    }),
    (error) => error.code === "MODEL_OUTPUT_INVALID",
  );

  await assert.rejects(
    requestInterrogation(payload, {
      requestId: "client-request-3",
      fetcher: async () =>
        new Response(
          JSON.stringify({
            error: {
              code: "MODEL_RATE_LIMIT",
              message: "Wait, then retry.",
              retryable: true,
              requestId: "server-request-3",
            },
          }),
          { status: 429 },
        ),
    }),
    (error) => error.code === "MODEL_RATE_LIMIT" && error.retryable,
  );

  await assert.rejects(
    requestInterrogation(payload, {
      requestId: "client-request-4",
      fetcher: async () =>
        new Response(
          JSON.stringify({ ...validResponse, questionNumber: 2 }),
          { status: 200 },
        ),
    }),
    (error) => error.code === "MODEL_OUTPUT_INVALID",
  );
});

test("repair orchestration makes at most one repair call", async () => {
  let calls = 0;
  const repaired = await withOneRepairAttempt({
    generate: async (repair) => {
      calls += 1;
      if (!repair) {
        throw new Error("invalid output");
      }
      return "valid output";
    },
    isRepairable: () => true,
  });
  assert.equal(repaired, "valid output");
  assert.equal(calls, 2);

  calls = 0;
  await assert.rejects(
    withOneRepairAttempt({
      generate: async () => {
        calls += 1;
        throw new Error("still invalid");
      },
      isRepairable: () => true,
    }),
  );
  assert.equal(calls, 2);

  calls = 0;
  await assert.rejects(
    withOneRepairAttempt({
      generate: async () => {
        calls += 1;
        throw new Error("not repairable");
      },
      isRepairable: () => false,
    }),
  );
  assert.equal(calls, 1);
});

test("AI provider failures map to typed rate-limit errors", () => {
  const mapped = mapAIError(
    new APICallError({
      message: "rate limited",
      url: "https://api.groq.test/openai/v1/chat/completions",
      requestBodyValues: {},
      statusCode: 429,
      isRetryable: true,
    }),
  );

  assert.equal(mapped.code, "MODEL_RATE_LIMIT");
  assert.equal(mapped.retryable, true);
  assert.equal(mapped.status, 429);
});

test("missing server configuration maps to a clear non-retryable model error", () => {
  const mapped = mapAIError(
    new AIConfigurationError("GROQ_API_KEY is not configured."),
  );

  assert.equal(mapped.code, "MODEL_UNAVAILABLE");
  assert.equal(mapped.retryable, false);
  assert.equal(mapped.status, 503);
});

test("the verdict Markdown contains the decision contract without internal metadata", () => {
  const markdown = createVerdictMarkdown(createVerdictFixture());

  assert.match(markdown, /^# Redline Verdict: VALIDATE/m);
  assert.match(markdown, /^## Validation order/m);
  assert.match(markdown, /Pass condition/);
  assert.doesNotMatch(markdown, /requestId|system prompt/i);
});
