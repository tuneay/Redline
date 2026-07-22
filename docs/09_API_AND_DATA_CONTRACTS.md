# API and Data Contracts

## Conversation message

```ts
type MessageRole = "assistant" | "user";

interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  kind:
    | "greeting"
    | "idea"
    | "question"
    | "answer"
    | "observation";
  questionNumber?: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  revealed: boolean;
}
```

The visible AI observation and question may be rendered in one message but should remain separate fields in the server response.

## Running analysis

```ts
interface RunningAnalysis {
  language: string;
  facts: EvidenceItem[];
  claims: EvidenceItem[];
  assumptions: EvidenceItem[];
  unknowns: EvidenceItem[];
  contradictions: Contradiction[];
  avoidanceSignals: AvoidanceSignal[];
}
```

This may be returned by the API for internal client state but should not be rendered directly before the verdict.

## POST `/api/interrogate`

### Request

```ts
interface InterrogateRequest {
  sessionId: string;
  questionIndex: 0 | 1 | 2 | 3 | 4;
  messages: Array<{
    role: "assistant" | "user";
    content: string;
    questionNumber?: number;
  }>;
}
```

Rules:

- `questionIndex: 0` means no primary question has been asked yet.
- The server returns question `questionIndex + 1`.
- The server rejects `questionIndex: 5`.
- The final message must be from the user.
- The server independently validates conversation order.

### Response

```ts
interface InterrogateResponse {
  requestId: string;
  observation: string;
  question: string;
  questionNumber: 1 | 2 | 3 | 4 | 5;
  pressurePoint:
    | "problem"
    | "user"
    | "behavior"
    | "alternative"
    | "distribution"
    | "commitment"
    | "retention"
    | "trust"
    | "business_model"
    | "fatal_assumption";
  detectedIssue:
    | "none"
    | "vague_answer"
    | "unsupported_claim"
    | "contradiction"
    | "evasion"
    | "solution_first"
    | "broad_user"
    | "weak_distribution"
    | "unclear_frequency";
  severity: 1 | 2 | 3 | 4 | 5;
  analysis: RunningAnalysis;
}
```

## POST `/api/verdict`

### Request

```ts
interface VerdictRequest {
  sessionId: string;
  messages: Array<{
    role: "assistant" | "user";
    content: string;
    questionNumber?: number;
  }>;
}
```

Server validation must confirm:

- one initial idea;
- five assistant primary questions;
- five user answers;
- valid sequence;
- reasonable input size.

### Response

```ts
type VerdictLabel = "BUILD" | "VALIDATE" | "RESHAPE" | "KILL";
type Confidence = "low" | "medium" | "high";

interface VerdictResponse {
  requestId: string;
  verdict: VerdictLabel;
  score: number;
  confidence: Confidence;
  diagnosis: string;
  strongestSignal: {
    title: string;
    explanation: string;
    evidenceRefs: string[];
  };
  criticalFailure: {
    title: string;
    explanation: string;
    evidenceRefs: string[];
  };
  avoidancePattern: {
    title: string;
    explanation: string;
    evidenceRefs: string[];
  } | null;
  contradictions: Array<{
    firstClaim: string;
    secondClaim: string;
    consequence: string;
    evidenceRefs: string[];
  }>;
  dimensions: {
    problemReality: DimensionScore;
    userSpecificity: DimensionScore;
    behaviorChange: DimensionScore;
    distribution: DimensionScore;
    commitment: DimensionScore;
    retentionOrRepeatValue: DimensionScore;
  };
  assumptions: Array<{
    statement: string;
    risk: "low" | "medium" | "high" | "fatal";
    reason: string;
    evidenceRefs: string[];
  }>;
  reconstructedIdea: string;
  validationOrder: {
    action: string;
    targetUser: string;
    sampleSize: string;
    evidenceToCollect: string;
    passCondition: string;
    failCondition: string;
  };
  doNotBuildYet: string[];
  evidence: EvidenceRecord[];
}
```

### Dimension score

```ts
interface DimensionScore {
  score: number;
  confidence: Confidence;
  reason: string;
  evidenceRefs: string[];
}
```

All numeric scores must be clamped from 0 to 100.

### Evidence record

```ts
interface EvidenceRecord {
  id: string;
  turn: number;
  quote: string;
  classification: "reported_fact" | "claim" | "assumption" | "unknown";
}
```

Quotes should be short excerpts, not full user messages.

## Error response

```ts
interface APIErrorResponse {
  error: {
    code:
      | "INVALID_INPUT"
      | "INVALID_STATE"
      | "MODEL_UNAVAILABLE"
      | "MODEL_RATE_LIMIT"
      | "MODEL_TIMEOUT"
      | "MODEL_OUTPUT_INVALID"
      | "NETWORK_ERROR"
      | "UNKNOWN_ERROR";
    message: string;
    retryable: boolean;
    requestId: string;
  };
}
```

Do not send stack traces to the browser in production.

## Validation constraints

Suggested initial limits:

```text
Maximum user message: 4,000 characters
Maximum assistant message: 3,000 characters
Maximum total conversation: 30,000 characters
Maximum do-not-build items: 5
Maximum assumptions: 6
Maximum contradictions: 3
Maximum evidence quote: 240 characters
```

## Markdown export

The copied report should contain:

```markdown
# Redline Verdict: RESHAPE

## Diagnosis
...

## Score
...

## Critical failure
...

## Strongest signal
...

## Reconstructed idea
...

## Validation order
...

## Do not build yet
...

## Evidence
...
```

Do not include hidden analysis fields, prompts, request IDs, or internal model metadata.
