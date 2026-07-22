# Technical Architecture

## Stack

### Framework

Next.js App Router with TypeScript.

Use one root page and two route handlers.

### Styling

Tailwind CSS plus CSS custom properties in `globals.css`.

Do not install a large component library. Small primitives should be authored locally.

### Motion

Motion for React.

Use:

- `motion`;
- `AnimatePresence`;
- layout animations;
- `useReducedMotion`;
- controlled variants;
- limited manual timelines when required.

### AI

Vercel AI SDK with the Groq provider:

```bash
npm install ai @ai-sdk/groq
```

Use structured generation for interrogation and verdict objects.

### Validation

Zod for:

- client request validation;
- route request validation;
- model response validation;
- local storage hydration.

## Why not raw token streaming in the MVP

The interface requires precise word-level blur and opacity transitions. Raw token streaming introduces:

- partial words;
- punctuation fragments;
- inconsistent chunk size;
- schema exposure;
- difficult replay behavior;
- layout jitter.

The selected architecture waits for a compact structured response, then reveals its visible text locally.

This is still perceived as real-time because Groq inference is fast and the application uses a deliberate processing transition.

Post-MVP, the internal analysis and visible answer can be separated so visible prose streams while metadata resolves independently.

## Request flow

```text
User submits answer
  ↓
Client validates length and state
  ↓
POST /api/interrogate
  ↓
Server validates body
  ↓
Server builds protected prompt
  ↓
Groq structured generation
  ↓
Zod parse
  ↓
Optional repair attempt
  ↓
Typed response
  ↓
Client appends AI message
  ↓
WordReveal animates visible text
```

Final turn:

```text
Fifth user answer
  ↓
POST /api/verdict
  ↓
Full conversation evaluation
  ↓
Validated verdict object
  ↓
Verdict transition
```

## Suggested folder structure

```text
src/
  app/
    api/
      interrogate/
        route.ts
      verdict/
        route.ts
    globals.css
    layout.tsx
    page.tsx

  components/
    chat/
      ChatShell.tsx
      Conversation.tsx
      MessageList.tsx
      AIMessage.tsx
      UserMessage.tsx
      ChatInput.tsx
      ProgressMarker.tsx
      ProcessingState.tsx
      ReturnToLatest.tsx
    motion/
      WordReveal.tsx
      MotionProvider.tsx
      motion-tokens.ts
    verdict/
      VerdictView.tsx
      VerdictHeader.tsx
      EvidenceQuote.tsx
      AssumptionList.tsx
      ValidationOrder.tsx
    ui/
      IconButton.tsx
      VisuallyHidden.tsx
      ErrorNotice.tsx

  hooks/
    useAutoScroll.ts
    useLocalSession.ts
    useConversationMachine.ts

  lib/
    ai/
      groq.ts
      prompts.ts
      interrogate.ts
      verdict.ts
      repair.ts
    schemas/
      conversation.ts
      api.ts
      verdict.ts
      storage.ts
    state/
      conversation-reducer.ts
      initial-state.ts
    utils/
      cn.ts
      language.ts
      markdown-report.ts
      text-tokens.ts

  types/
    index.ts
```

## State model

Use a reducer or explicit state-machine hook.

```ts
type ConversationPhase =
  | "boot"
  | "awaiting_idea"
  | "interrogating"
  | "generating_verdict"
  | "verdict"
  | "error";
```

Core state:

```ts
interface ConversationState {
  version: 1;
  sessionId: string;
  phase: ConversationPhase;
  questionIndex: number;
  messages: Message[];
  analysis: RunningAnalysis;
  verdict: Verdict | null;
  pendingRequestId: string | null;
  lastStablePhase: ConversationPhase;
  error: AppError | null;
}
```

`questionIndex` represents the number of primary questions already asked.

## Race-condition prevention

- Generate a request ID for each submission.
- Ignore responses that do not match the active request ID.
- Disable duplicate submission while a request is active.
- Abort active fetch on restart.
- Do not increment question count until a validated server response is received.
- The fifth answer triggers verdict exactly once.

## Local persistence

Key:

```text
redline.session.v1
```

Persist:

- messages;
- question index;
- stable phase;
- verdict;
- revealed-message IDs.

Do not persist:

- API keys;
- raw system prompts;
- server diagnostics;
- active AbortController state.

Hydration must validate the stored object. Invalid data should be cleared safely.

## API security

- Read `GROQ_API_KEY` only in server code.
- Add `server-only` to AI modules where appropriate.
- Reject oversized request bodies.
- Limit message count and per-message character length.
- Strip control characters where useful.
- Do not trust a client-supplied question index without verifying conversation structure.
- Avoid logging complete request bodies.
- Return generic production errors and detailed development diagnostics only when safe.

## Rate limiting

For a local MVP, prevent accidental duplicate requests in the client and server.

If deployed publicly, add a real external rate limiter before public distribution. In-memory serverless rate limiting is not reliable across instances.

## Error categories

```text
INVALID_INPUT
INVALID_STATE
MODEL_UNAVAILABLE
MODEL_RATE_LIMIT
MODEL_TIMEOUT
MODEL_OUTPUT_INVALID
NETWORK_ERROR
UNKNOWN_ERROR
```

Each maps to a concise user-facing message and a retry policy.

## Environment configuration

```text
GROQ_API_KEY
GROQ_CHAT_MODEL
GROQ_FINAL_MODEL
```

Optional:

```text
AI_TEMPERATURE_INTERROGATE
AI_TEMPERATURE_VERDICT
MAX_USER_MESSAGE_CHARS
```

## Build scripts

Expected `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

## Deployment assumption

The MVP should work as a standard Next.js Node deployment. Do not design around a vendor-specific feature that prevents local `npm run dev`.
