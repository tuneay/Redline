# Build Phases

Complete phases in order. Do not begin a later phase while the current phase fails lint or build.

## Phase 0 — Bootstrap and document lock

### Objective

Create the Next.js project and place all documentation in the repository.

### Tasks

- Bootstrap Next.js with App Router, TypeScript, Tailwind, ESLint, and `src`.
- Install `ai`, `@ai-sdk/groq`, `zod`, `motion`, `clsx`, and `tailwind-merge`.
- Add `.env.example` without a real secret.
- Configure strict TypeScript.
- Create the target folder structure.
- Confirm `npm run dev`, `npm run lint`, and `npm run build`.

### Exit criteria

- Blank project runs.
- No secrets committed.
- Documentation is present.
- `PROJECT_STATE.md` is updated to `PHASE_0_COMPLETE`.

## Phase 1 — Static chat shell

### Objective

Build the entire visual structure using local mock messages.

### Tasks

- Implement full-height direct chat screen.
- Add minimal header.
- Add conversation column.
- Add AI and user message styles.
- Add input dock and keyboard behavior.
- Add progress marker.
- Add mock processing state.
- Add mobile safe-area behavior.
- Implement design tokens.

### Restrictions

- No Groq call.
- No complex motion yet.
- No verdict logic.

### Exit criteria

- Interface matches `04_DESIGN_SYSTEM.md`.
- Mobile and desktop layout are stable.
- Input remains usable with the virtual keyboard.
- `PROJECT_STATE.md` updated.

## Phase 2 — Motion primitives

### Objective

Create reusable motion behavior before connecting AI.

### Tasks

- Implement `WordReveal`.
- Implement reduced-motion behavior.
- Add message entrance and layout motion.
- Add processing-line animation.
- Add input-state transitions.
- Add controlled auto-scroll.
- Prevent animation replay.
- Test long text and rapid state changes.

### Exit criteria

- Motion follows `05_MOTION_SYSTEM.md`.
- No continuous decorative loops.
- Long messages reveal within a capped duration.
- Reduced motion displays content immediately.
- `PROJECT_STATE.md` updated.

## Phase 3 — Conversation state machine

### Objective

Make the five-question local flow deterministic with mocks.

### Tasks

- Implement conversation reducer.
- Define all phases.
- Add request IDs and abort behavior.
- Add local storage hydration and validation.
- Enforce exactly five questions.
- Trigger verdict after fifth answer.
- Add restart and retry states.
- Add Markdown copy utility using a mock verdict.

### Exit criteria

- Refresh preserves a valid session.
- Restart clears it.
- Duplicate submissions are blocked.
- Fifth answer triggers verdict once.
- Invalid local state is safely cleared.
- `PROJECT_STATE.md` updated.

## Phase 4 — Groq integration and schemas

### Objective

Replace mock question generation with validated server responses.

### Tasks

- Create server-only Groq client.
- Create Zod schemas.
- Implement `/api/interrogate`.
- Build protected prompts.
- Parse and validate model output.
- Add one repair attempt.
- Map Groq and network errors to typed errors.
- Add configured model fallback.
- Avoid logging full conversations.

### Exit criteria

- Every successful response matches the schema.
- API key never enters client output.
- Invalid model output produces a retryable UI state.
- Question numbering remains correct.
- `PROJECT_STATE.md` updated.

## Phase 5 — AI behavior calibration

### Objective

Make Redline precise, severe, and grounded.

### Tasks

- Add behavior system prompt.
- Add question-stage guidance.
- Add claim/fact/assumption classification.
- Add contradiction and evasion detection.
- Add no-fake-research rule.
- Test weak, vague, contradictory, and detailed answers.
- Remove generic praise and filler.
- Confirm one question per turn.

### Exit criteria

- No default encouragement.
- Criticism references actual user content.
- No personal insults.
- No invented external claims.
- Exact five-question contract holds.
- `PROJECT_STATE.md` updated.

## Phase 6 — Verdict engine

### Objective

Generate and render the structured final report.

### Tasks

- Implement `/api/verdict`.
- Validate conversation sequence server-side.
- Build verdict prompt and schema.
- Add final-model fallback.
- Render verdict inside the same screen.
- Add evidence references.
- Add score confidence.
- Add validation order and do-not-build list.
- Export Markdown.

### Exit criteria

- All verdict fields are populated or intentionally nullable.
- Evidence references resolve.
- Score is accompanied by confidence and reasons.
- Validation order has explicit pass and fail conditions.
- `PROJECT_STATE.md` updated.

## Phase 7 — Final polish and QA

### Objective

Remove the difference between “working prototype” and “finished MVP.”

### Tasks

- Execute all checks in `11_QA_AND_ACCEPTANCE.md`.
- Tune spacing, line lengths, and motion pacing.
- Fix focus management.
- Verify mobile keyboard behavior.
- Verify slow network and failed request states.
- Verify production build.
- Remove unused dependencies and code.
- Review copy for generic AI language.
- Record remaining known issues.

### Exit criteria

- `npm run lint` passes.
- `npm run build` passes.
- All critical acceptance tests pass.
- No out-of-scope feature was added.
- `PROJECT_STATE.md` is marked `MVP_COMPLETE`.
