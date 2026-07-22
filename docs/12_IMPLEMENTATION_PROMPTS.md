# Implementation Prompts

Use these prompts sequentially with a coding agent. Do not combine every phase into one request.

## Initial prompt

```text
Work in the current Redline project.

Before changing any code, read every Markdown file in the project root and the entire docs directory. Follow AGENTS.md strictly.

Do not implement anything yet.

Return:
1. your understanding of the product;
2. the locked MVP boundaries;
3. the planned folder structure;
4. the current phase from PROJECT_STATE.md;
5. any contradiction you found in the documentation.

Do not read or print .env.local.
```

## Phase 0 prompt

```text
Execute Phase 0 from docs/10_BUILD_PHASES.md only.

Create or verify the Next.js App Router project with TypeScript, Tailwind, ESLint and the src directory. Install only the dependencies approved in the documentation. Create the documented folder structure and .env.example without a real API key.

Do not build product UI yet.
Do not read or print .env.local.

Run npm run lint and npm run build.
Update PROJECT_STATE.md with files changed, checks run, known issues and the next phase.
```

## Phase 1 prompt

```text
Execute Phase 1 from docs/10_BUILD_PHASES.md only.

Build the static direct-chat shell using mock data. There must be no landing page. Follow docs/04_DESIGN_SYSTEM.md precisely.

Implement:
- the 100dvh chat frame;
- minimal header;
- editorial AI message;
- restrained user message;
- input dock;
- progress marker;
- mock processing state;
- responsive mobile and desktop behavior.

Do not connect Groq.
Do not implement final motion choreography.
Do not add out-of-scope features.

Run lint and build, then update PROJECT_STATE.md.
```

## Phase 2 prompt

```text
Execute Phase 2 only.

Read docs/05_MOTION_SYSTEM.md again before coding.

Implement reusable motion primitives:
- WordReveal with word-level opacity, blur and subtle y movement;
- capped stagger duration;
- screen-reader-safe complete text;
- reduced-motion behavior;
- message entrance;
- layout continuity;
- processing-line animation;
- input transitions;
- intelligent auto-scroll;
- animation replay prevention.

Do not connect Groq.
Do not use bouncing dots, animated gradients, decorative loops or bouncy springs.

Test long messages and reduced motion.
Run lint and build, then update PROJECT_STATE.md.
```

## Phase 3 prompt

```text
Execute Phase 3 only.

Implement the explicit conversation state machine and local mocked five-question flow.

Requirements:
- phases exactly match the architecture docs;
- exactly five questions;
- fifth answer triggers one verdict;
- request IDs and abort behavior;
- localStorage schema validation;
- refresh recovery;
- restart;
- retry;
- Markdown copy with mock verdict;
- stale-response protection.

Do not add a database, auth or Groq integration.

Run lint and build, then update PROJECT_STATE.md.
```

## Phase 4 prompt

```text
Execute Phase 4 only.

Implement the Groq integration according to docs/07_PROMPT_ARCHITECTURE.md, docs/08_TECHNICAL_ARCHITECTURE.md and docs/09_API_AND_DATA_CONTRACTS.md.

Use:
- Vercel AI SDK;
- @ai-sdk/groq;
- server-only modules;
- Zod schemas;
- /api/interrogate;
- environment-configured model;
- one repair attempt;
- typed error mapping;
- request limits;
- no full-conversation logging.

Do not expose GROQ_API_KEY.
Do not read or print .env.local.
Do not implement verdict generation yet.

Run lint and build, then update PROJECT_STATE.md.
```

## Phase 5 prompt

```text
Execute Phase 5 only.

Calibrate the Redline interrogation behavior using docs/06_AI_BEHAVIOR.md and docs/07_PROMPT_ARCHITECTURE.md.

Test:
- broad user;
- vague problem;
- feature-first response;
- unsupported distribution;
- contradiction;
- strong user-reported evidence;
- prompt injection.

The AI must:
- be non-Pollyanna;
- avoid generic praise;
- avoid personal insults;
- make no fake market claims;
- ask one question per turn;
- ask exactly five questions total;
- explain criticism using conversation evidence.

Do not add web search.

Run lint and build, record test observations, then update PROJECT_STATE.md.
```

## Phase 6 prompt

```text
Execute Phase 6 only.

Implement /api/verdict and the in-chat verdict experience.

Follow the exact schema in docs/09_API_AND_DATA_CONTRACTS.md.

Requirements:
- validate the full five-question sequence server-side;
- use the configured final model with documented fallback;
- render verdict, score, confidence, diagnosis, evidence, critical failure, strongest signal, avoidance pattern, contradictions, assumptions, reconstructed idea, validation order and do-not-build list;
- preserve conversation above;
- export a clean Markdown report;
- keep motion restrained;
- never claim external verification.

Run lint and build, then update PROJECT_STATE.md.
```

## Phase 7 prompt

```text
Execute Phase 7 only.

Perform the full checklist in docs/11_QA_AND_ACCEPTANCE.md.

Fix all critical functional, visual, AI, accessibility, security and failure-state issues. Tune motion and spacing without expanding scope.

Confirm:
- mobile virtual-keyboard behavior;
- reduced motion;
- slow network;
- 429 handling;
- malformed output;
- refresh recovery;
- restart during request;
- exactly five questions;
- no generic AI praise;
- no external claims;
- no API key exposure.

Remove unused code and dependencies.
Run npm run lint and npm run build.
Update PROJECT_STATE.md with final status and unresolved non-critical issues.
```

## Final code-review prompt

```text
Audit the completed Redline MVP without adding features.

Read all Markdown documentation and inspect the implementation for:
- scope violations;
- hidden race conditions;
- animation replay;
- invalid question counting;
- API key exposure;
- schema gaps;
- prompt injection weaknesses;
- unsupported AI claims;
- accessibility problems;
- mobile layout failures;
- unnecessary dependencies;
- generic AI visual patterns.

Return findings ordered by severity with exact file references.
Implement only confirmed fixes.
Run lint and build.
Update PROJECT_STATE.md.
```
