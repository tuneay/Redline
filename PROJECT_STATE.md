# PROJECT_STATE.md

## Project

Redline - five-question AI idea interrogation interface.

## Current status

Phase 7 is complete and the local MVP is code-complete. Redline opens directly into the five-question interrogation, preserves the explicit state-machine and evidence contracts, renders the final verdict on the same surface, persists only the current local session, and exports a clean Markdown report.

The final visual and motion pass is complete. The initial “What are you building?” composition remains the primary editorial anchor. Hydration-sensitive motion now uses deterministic server and first-client states, word reveal begins only after mount, reduced motion is gated until hydration, and completed messages still bypass replay. Input, send, restart, retry, copy, evidence, and return-to-latest controls have distinct hover, press, and focus behavior without decorative loops or bouncy motion.

The first explicit post-MVP visual refinement is complete. On wide desktops, the header and input frame now expand to `64rem`, while the conversation remains bounded at `56rem`. User-answer-to-AI-response spacing is increased without changing mobile width or AI line-length limits.

The second post-MVP corrective refinement is complete. Short Turkish input now creates a hard Turkish response contract across prompts and Zod output validation. Provider-generated JSON is requested as prompt-grounded text, extracted as one balanced object, and validated locally instead of depending on Groq's provider-level JSON Schema mode. Provider HTTP errors are classified by status instead of reporting every request rejection as an unavailable model.

The first public release is complete at https://github.com/tuneay/Redline. The repository has a Shiptrace-inspired public README, real application screenshots, AGPL-3.0-only licensing, a trademark policy, contribution and security guidance, a Contributor Covenant, issue and pull-request templates, and a GitHub Actions quality workflow. Repository metadata, topic tags, squash-only merges, automatic branch cleanup, secret scanning, push protection, and private vulnerability reporting are configured.

The application remains local-first. No deployment configuration, cloud infrastructure, database, authentication, analytics, or vendor-specific hosting infrastructure was added.

## Implementation phase

`MVP_COMPLETE`

## Completed phases

### Phase 0 - Bootstrap and document lock

- Bootstrapped the strict Next.js App Router project with the approved minimal dependency set.
- Added safe environment examples, visual tokens, motion tokens, source structure, and local-only decisions.
- Established lint, build, and local development checks.

### Phase 1 - Static chat shell

- Added the direct `100dvh` chat frame, restrained header, single editorial conversation column, progress marker, input dock, responsive spacing, and safe-area behavior.
- Kept the first frame inside the conversation; no landing or marketing surface was added.

### Phase 2 - Motion primitives

- Added reduced-motion-aware word reveal, capped stagger timing, stable message entrance, Motion layout continuity, finite processing movement, auto-scroll disengagement, and return-to-latest behavior.
- Preserved complete screen-reader text and prevented completed message animation replay.

### Phase 3 - Conversation state machine

- Added the explicit six-phase reducer, deterministic five-question boundary, request IDs, cancellation, stale-response rejection, retry, restart, and versioned local session hydration.
- Preserved submitted answers across request failures and rejected invalid stored sequences safely.

### Phase 4 - Groq integration and schemas

- Added the server-only Groq interrogation route, AI SDK structured generation, strict Zod contracts, protected prompts, one model-output repair attempt, request limits, typed errors, and client response validation.
- Kept the API key and full conversation logging out of client code.

### Phase 5 - AI behavior calibration

- Expanded the interrogation system prompt with explicit fact, claim, assumption, and unknown definitions.
- Added distinct stage pressure for problem reality, user specificity, behavior/alternative, distribution/commitment, and the fatal unresolved assumption.
- Added direct calibration for broad users, vague or evasive answers, feature-first answers, generic distribution claims, contradictions, strong user-reported evidence, prompt injection, language matching, and no-fake-research behavior.
- Required running-analysis references to resolve to existing `turn-N` conversation identifiers.
- Added model-output guards that reject a question inside the observation, more or fewer than one primary question, known generic praise, personal attacks, unsupported external-research assertions, unsupported analysis entries, and unresolved evidence references. Rejected model output enters the existing single repair path rather than producing invented analysis.
- Preserved the exact five-question contract; the fifth answer never calls `/api/interrogate`.

### Phase 6 - Verdict engine and in-chat report

- Added strict verdict request, model-output, response, dimension, assumption, contradiction, validation-order, and evidence schemas.
- Added full server-side sequence validation for one initial idea followed by exactly five ordered assistant questions and five ordered user answers.
- Added `/api/verdict` with byte limits, sanitization, duplicate-request protection, typed error mapping, request cancellation, and no conversation logging.
- Added the protected verdict prompt, low-temperature structured generation, one output-repair attempt, and documented final-model fallback. The configured chat model is used only when the configured final model is unavailable; rate limits, timeouts, and invalid output do not silently switch models.
- Required unique evidence IDs, resolvable evidence references, user-turn-only citations, and short exact excerpts from the cited user turn.
- Replaced the Phase 3 placeholder with the real verdict request in the conversation machine. Retry does not resubmit or duplicate the fifth answer.
- Persisted the public verdict without the server request ID or hidden model metadata.
- Added an in-chat verdict surface for label, diagnosis, score, confidence, critical failure, strongest signal, avoidance pattern, contradictions, six scored dimensions, assumptions, reconstructed idea, validation order, do-not-build list, and evidence record.
- Added restrained verdict sequencing, reduced-motion behavior, one-time diagnosis word reveal, a single contradiction connector draw, evidence navigation, copy feedback, and intentional scroll positioning at the verdict header.
- Added clean Markdown export containing the public report only.

### Phase 7 - Final polish and QA

- Reworked the motion environment so server rendering and the first client render use identical preference and entrance states. The hydration fix does not use `suppressHydrationWarning`.
- Moved motion context hooks out of the provider component to preserve clean Fast Refresh boundaries.
- Kept the opening question's successful position and typography while refining its editorial scale, tracking, line length, and supporting-copy delay.
- Added function-specific hover, press, focus, and active behavior for the dock, send, restart confirmation, retry, copy, evidence navigation, and return-to-latest controls.
- Added an animated progress-number transition, restrained destructive confirmation treatment, and deterministic restart focus management including Escape cancellation.
- Tightened narrow-layout behavior with mobile-specific input help copy, hidden inactive character count, long-token wrapping, `100dvh` geometry, and safe-area preservation.
- Removed unused `clsx` and `tailwind-merge` runtime dependencies and removed the unused vendor-specific `.vercel` ignore entry.
- Added Phase 7 regression coverage for hydration-safe SSR, non-replaying completed reveals, capped long-answer timing, reduced-motion bypass, request size boundaries, auto-scroll thresholds, accessibility/security invariants, and dependency scope.

### Post-MVP corrective refinement - API, language, and hydration diagnosis

- Recognized short Turkish greetings and accumulated Turkish conversation signals before prompt generation.
- Converted response language from a soft prompt hint into a hard prompt and model-output validation rule.
- Required Turkish interrogation output to use Turkish visible prose and declare `analysis.language` as Turkish; invalid language output enters the existing one-repair path.
- Applied the same Turkish-language validation boundary to the final verdict's user-visible fields.
- Switched Groq structured generation to best-effort compatibility while preserving local Zod validation, evidence integrity checks, and one repair attempt.
- Separated Groq 400, 401, 403, 404, timeout, and rate-limit failures so the interface no longer disguises every provider rejection as model unavailability.
- Added a complete `ChatShell` deterministic server-render regression alongside the existing word-reveal hydration test.
- Reproduced the reported failed-request restoration path, retried the preserved “selam” request successfully, received a Turkish observation and question, reloaded the completed session, and observed no hydration warning or client error.
- Ran the complete functional, prompt, verdict, truthfulness, failure, storage, motion, accessibility, security, production, and desktop browser acceptance pass available in the local environment.

### Public-release preparation

- Rebuilt the README around the product problem, exact five-question flow, principles, screenshots, stack, local setup, architecture, trust model, repository structure, limitations, and contribution path.
- Added real production-rendered opening and processing screenshots under `docs/screenshots`.
- Licensed the code under AGPL-3.0-only and separated Redline brand rights into `TRADEMARKS.md`.
- Added `CONTRIBUTING.md`, `SECURITY.md`, and a Contributor Covenant.
- Added focused bug-report, feature-request, security-contact, and pull-request templates.
- Added a minimal GitHub Actions workflow that runs install, lint, strict typecheck, tests, and production build without deployment.
- Added public package metadata, an explicit Node.js 22 minimum, and the `npm run typecheck` command.
- Recorded provider-neutral JSON validation, narrow root hydration suppression, and the open-source release policy as decisions D-017 through D-019.

Files created:

- `LICENSE`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `TRADEMARKS.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`
- `.github/ISSUE_TEMPLATE/config.yml`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/workflows/ci.yml`
- `docs/screenshots/redline-opening.jpg`
- `docs/screenshots/redline-processing.jpg`

Files changed:

- `README.md`
- `package.json`
- `package-lock.json`
- `docs/14_DECISIONS.md`
- `PROJECT_STATE.md`

Technical decisions:

- Use AGPL-3.0-only to keep source available when modified versions are offered over a network.
- Keep CI limited to quality checks; add no hosting or deployment configuration.
- Publish real production UI captures instead of mock marketing artwork.
- Keep the public setup honest: a Groq key is required for live interrogation, and provider availability remains an external dependency.

Checks run:

- `npm run lint`: passed with no warnings or errors.
- `npm run typecheck`: passed.
- `npm test`: passed; 28 tests passed with no failures (10 state/API regressions, 11 AI/verdict contract tests, and 7 motion/hydration/acceptance tests).
- `npm run build`: passed. `/` remains static; `/api/interrogate` and `/api/verdict` remain dynamic server routes.
- Production screenshots: opening and finite processing states were captured at 1248 × 800 without the Next.js development overlay.
- Secret boundary: `.env.local` remained ignored and was not read, displayed, logged, or staged.

Known issues:

- Public repository configuration is complete. GitHub Actions remains the authoritative remote reproduction of the local quality suite after each push.
- The configured Groq request used during screenshot capture returned a retryable provider failure after the processing state. The README does not claim a successful live result, and no fallback analysis was invented.

### Post-MVP visual refinement 1 - Wider desktop rhythm

- Separated the wide desktop frame width from the editorial conversation width.
- Expanded header and input geometry from `47.5rem` to `64rem` at the `64rem` breakpoint.
- Expanded the conversation container to `56rem` while retaining the existing component-level AI text limits.
- Added `8px` mobile and `16px` desktop separation specifically when an AI response follows a user answer.
- Preserved the original `47.5rem` width below the desktop breakpoint.
- Recorded the explicit width override as decision `D-015`.

Files changed:

- `src/app/globals.css`
- `src/components/chat/Conversation.tsx`
- `src/components/chat/MessageList.tsx`
- `tests/phase-7.test.mjs`
- `docs/04_DESIGN_SYSTEM.md`
- `docs/14_DECISIONS.md`
- `PROJECT_STATE.md`

Checks run:

- In-app browser at 1280px: the expanded header/input frame and bounded conversation column were visually verified; no hydration or runtime error appeared.
- `npm run lint`: passed.
- `npm test`: passed; 25 tests passed with no failures.
- `npm run build`: passed; route shape remains unchanged.

Known issues:

- No new implementation issue was introduced. Physical-phone and configured-model smoke checks remain as previously recorded.

### Input state correction delivered with Phase 5 and Phase 6

- Removed the global textarea-shaped red focus rectangle while retaining a visible keyboard focus state.
- Moved active feedback to the dock's rounded physical geometry.
- Added distinct empty, hover, focus, typing, valid, disabled, processing, and error variants.
- Added a finite bottom signal line, a restrained 1 px hover/focus lift, controlled processing compression, and a non-bouncy send press state that never scales below `0.99`.
- Changed the send control from a disconnected dark pill into a stateful control with a small red direction line and a high-contrast valid state.

## Files created in Phase 5 and Phase 6

- `src/app/api/verdict/route.ts`
- `src/components/verdict/AssumptionList.tsx`
- `src/components/verdict/EvidenceQuote.tsx`
- `src/components/verdict/ValidationOrder.tsx`
- `src/components/verdict/VerdictHeader.tsx`
- `src/components/verdict/VerdictView.tsx`
- `src/lib/ai/verdict.ts`
- `src/lib/api/verdict-client.ts`
- `src/lib/schemas/verdict.ts`
- `tests/phase-5-6.test.mjs`

## Files changed in Phase 5 and Phase 6

- `package.json`
- `src/app/globals.css`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatShell.tsx`
- `src/components/chat/Conversation.tsx`
- `src/hooks/useAutoScroll.ts`
- `src/hooks/useConversationMachine.ts`
- `src/lib/ai/errors.ts`
- `src/lib/ai/groq.ts`
- `src/lib/ai/interrogate.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/api/interrogate-client.ts`
- `src/lib/schemas/api.ts`
- `src/lib/schemas/conversation-order.ts`
- `src/lib/schemas/conversation.ts`
- `src/lib/schemas/storage.ts`
- `src/lib/state/conversation-reducer.ts`
- `src/lib/utils/markdown-report.ts`
- `src/types/index.ts`
- `tests/phase-3-4.test.mjs`
- `PROJECT_STATE.md`

## Files removed in Phase 5 and Phase 6

- `src/app/api/verdict/.gitkeep`
- `src/components/verdict/MockVerdictView.tsx`

## Files created in Phase 7

- `src/components/motion/motion-context.ts`
- `tests/phase-7.test.mjs`

## Files changed in Phase 7

- `.gitignore`
- `package.json`
- `package-lock.json`
- `src/app/globals.css`
- `src/components/chat/AIMessage.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatShell.tsx`
- `src/components/chat/MessageList.tsx`
- `src/components/chat/ProcessingState.tsx`
- `src/components/chat/ProgressMarker.tsx`
- `src/components/chat/UserMessage.tsx`
- `src/components/motion/MotionProvider.tsx`
- `src/components/motion/ReturnToLatest.tsx`
- `src/components/motion/WordReveal.tsx`
- `src/components/ui/ErrorNotice.tsx`
- `src/components/verdict/EvidenceQuote.tsx`
- `src/components/verdict/VerdictHeader.tsx`
- `src/components/verdict/VerdictView.tsx`
- `src/hooks/useAutoScroll.ts`
- `PROJECT_STATE.md`

## Files changed in the post-MVP API and language correction

- `src/lib/ai/errors.ts`
- `src/lib/ai/interrogate.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/ai/verdict.ts`
- `src/lib/schemas/api.ts`
- `src/lib/schemas/verdict.ts`
- `src/lib/utils/language.ts`
- `tests/phase-5-6.test.mjs`
- `tests/phase-7.test.mjs`
- `docs/06_AI_BEHAVIOR.md`
- `docs/14_DECISIONS.md`
- `PROJECT_STATE.md`

## Phase 5 and Phase 6 technical decisions

- Treat prompt calibration and output validation as separate defenses: the prompt describes the required reasoning behavior, while Zod and contextual refinements reject structural or evidence-integrity failures.
- Keep user content inside explicit untrusted-data delimiters and ignore instructions inside it that attempt to change the question count, force a verdict, reveal prompts, expose secrets, or fabricate evidence.
- Use `turn-N` as the only model-facing evidence reference in interrogation analysis.
- Keep exact evidence quotes in the final verdict. A paraphrase may appear in diagnosis prose, but it cannot masquerade as a cited quote.
- Keep server request IDs out of persisted verdict state and Markdown exports.
- Reject scores outside `0-100`; invalid scores use the repair path and never reach client state.
- Use the configured final model first and the configured chat model as the only fallback. Do not switch to an unknown model ID.
- Keep the verdict on the existing chat surface and reduce prior-message contrast without hiding the conversation.
- Stop auto-follow at the verdict header for a user who was near the bottom; do not force a user who manually scrolled upward.
- Persist the verdict reveal identifier with other reveal IDs so refresh does not replay the completed verdict diagnosis.
- Keep the input's red signal attached to meaningful active intelligence, not browser-default geometry or decoration.
- Add no new runtime or development dependency.

## Phase 7 technical decisions

- Keep the SSR tree deterministic: render the hidden entrance state on both server and first client pass, then start motion in the next animation frame.
- Gate `prefers-reduced-motion` behind hydration so a client media-query result cannot change hydration attributes. Once hydrated, reduced motion removes blur, transform, staggering, and smooth scrolling as designed.
- Preserve the opening composition instead of replacing it with decorative content; polish typography, spacing, and timing around the existing editorial anchor.
- Use red only for active intelligence, processing, risk, verdict, and destructive confirmation. Keyboard focus for neutral controls uses a high-contrast neutral outline.
- Keep press scale at `0.99`, avoid bouncy springs for control feedback, and keep hover duration near 150 ms.
- Treat `100dvh`, safe-area padding, compact mobile help text, flexible textarea width, and long-token wrapping as the virtual-keyboard and narrow-layout contract.
- Do not apply `npm audit fix --force`; its proposed resolution is a breaking Next downgrade. Retain the current supported stack and record the two moderate transitive findings.
- Do not use an unknown local Groq secret for an external smoke test without explicit authorization.
- Keep the permitted `ai` package even though its internal `@ai-sdk/gateway` dependency currently brings `@vercel/oidc` transitively. Redline neither imports nor configures that package and has no direct Vercel dependency or deployment integration.

## Post-MVP API and language technical decisions

- Treat the detected response language as a prompt and validation contract. A language mismatch cannot be shown to the user as a valid model response.
- Recognize short, unambiguous Turkish greetings directly and accumulate language evidence across all user messages.
- Request one JSON object as prompt-grounded text, extract a balanced object, and enforce the complete local Zod, evidence, and language contract before client delivery.
- Keep model fallback limited to a real 404 model-unavailable response. A 400 structured-request rejection, 401 credential rejection, or 403 access denial must retain its actual failure class.
- Keep the component tree deterministic. Apply `suppressHydrationWarning` only to `body` for the confirmed `cz-shortcut-listen` browser-extension attribute; do not suppress component-subtree mismatches.

## Checks run for the post-MVP API and language correction

- `npm run lint`: passed with no warnings or errors.
- `npm test`: passed; 27 tests passed with no failures (10 Phase 3/4 regressions, 10 Phase 5/6 AI and verdict tests, and 7 Phase 7 hydration and acceptance tests).
- `npm run build`: passed. `/` remains statically generated; `/api/interrogate` and `/api/verdict` remain dynamic server routes.
- Turkish response regression: “selam” is detected as Turkish; an English observation/question fails the contextual Zod schema while Turkish output passes.
- Provider regression: only a 404 enables the configured-model fallback; 400, 403, and 429 do not silently switch models.
- Full-shell hydration regression: two complete server renders of `ChatShell` produce identical markup without `suppressHydrationWarning`.
- Live local browser smoke test: the preserved failed “selam” request succeeded through Retry and returned a Turkish observation plus a Turkish first question.
- Refresh regression: reloading the successful persisted session restored the same conversation; browser logs contained no hydration warning, runtime error, or client exception.
- The temporary browser QA tab and local development server were closed after verification; port 3000 was released.

## Checks run for Phase 7

- `npm run lint`: passed with no warnings or errors.
- `npm test`: passed; 25 tests passed with no failures (10 Phase 3/4 regressions, 9 Phase 5/6 AI and verdict tests, 6 Phase 7 polish and acceptance tests).
- `npm run build`: passed. The root page is statically generated; `/api/interrogate` and `/api/verdict` remain dynamic server routes.
- Hydration regression: repeated server render output is deterministic; initial word and message states match the client entrance state; a revealed message renders without blur/replay.
- Clean production browser load at `http://127.0.0.1:3000`: no console entries, hydration errors, runtime errors, or client exceptions.
- Desktop browser interaction: direct-chat entry, initial reveal, automatic input focus, empty-submit blocking, Shift+Enter multiline expansion, valid send state, hover response, restart reset, input remount, and focus return were checked.
- Motion and accessibility checks: complete screen-reader text, `aria-hidden` visual word fragments, finite processing movement, capped 500-word stagger, reduced-motion bypass, 44 px control targets, visible focus styles, and auto-scroll threshold behavior passed.
- Failure and state checks: typed missing-configuration and rate-limit errors, malformed responses, single repair attempt, interrupted-session recovery, stale response rejection, retry without duplicate answer, fifth-answer verdict boundary, and invalid local storage passed.
- Security checks: oversized input rejection, server-only Groq env access, no production conversation logging, protected prompts absent from the client bundle, `.env.local` ignored, and no Vercel/deployment configuration or direct Vercel dependency passed. The permitted `ai` package's transitive `@vercel/oidc` package is not imported or configured by Redline.
- `npm audit --omit=dev`: completed; zero high or critical findings and two moderate transitive PostCSS findings under Next 16.2.11.
- Temporary development/production servers and browser QA tabs were closed after acceptance testing; port 3000 was released.

## Checks run for Phase 5 and Phase 6

- `npm run test`: passed; 19 tests passed with no failures.
- `npm run test:phase34`: 10 regression tests passed.
- `npm run test:phase56`: 9 calibration and verdict tests passed.
- Calibration tests cover broad input, vague/evasive rules, feature-first answers, weak distribution, contradictions, strong reported evidence, generic praise, personal attacks, fake research, prompt injection, one-question format, and turn-reference integrity.
- Verdict tests cover exact five-turn order, malformed order, evidence graph resolution, exact user excerpts, user-turn-only evidence, score bounds, client response validation, final-model fallback selection, invalid route input, Markdown export, and no sixth question.
- `npm run lint`: passed.
- `npm run build`: passed. `/` is static; `/api/interrogate` and `/api/verdict` are dynamic Node routes.
- `npx tsc --noEmit`: passed.
- In-app desktop browser check: initial hydration, automatic textarea focus, redesigned rounded focus state, typing state, active send state, and the absence of the sharp textarea rectangle were verified.
- Source scans: no legacy mock-verdict symbol, product-name casing violation, production console logging, mojibake sequence, Vercel configuration, or deployment metadata was found.
- The temporary browser tab and local development server were closed after QA.

## Known issues and deferred work

- The reported hydration mismatch was traced to the browser extension attribute `cz-shortcut-listen="true"` injected into `body` before React hydration. Root attribute suppression is intentionally narrow, and full-shell deterministic-render tests continue to cover application markup.
- Narrow and reduced-motion contracts are covered by responsive source checks and deterministic tests. A physical-phone virtual-keyboard and operating-system reduced-motion spot check remains advisable.
- `npm audit --omit=dev` reports two moderate transitive findings caused by Next.js 16.2.11 pinning PostCSS 8.4.31. There are no known high or critical findings; npm's proposed forced fix would install a breaking Next version and was not applied.
- Live AI generation still depends on Groq model access, availability, latency, and account rate limits. During release screenshot capture, the production UI and processing state rendered correctly, while the configured Groq request returned a retryable provider failure. No synthetic answer was substituted.
- The public repository is https://github.com/tuneay/Redline. Repository metadata and security settings are applied; future product work remains explicitly post-MVP.

## Locked decisions

- Direct chat screen; no landing page.
- Exactly five adaptive primary questions.
- One final verdict on the same conversation surface.
- No authentication, database, payment, dashboard, analytics, web research, deployment setup, or cloud infrastructure in the MVP.
- Groq access remains inside server-side route handlers.
- Zod validates API, model, evidence, and local-session data.
- Motion is finite, interruptible, and reduced-motion aware.
- Auto-scroll never overrides a user who moved away from the bottom.
- The visual system uses black, white, and signal red.
- The AI remains skeptical, evidence-led, truthful, and non-abusive.
- Session persistence is local-only.
- Product naming uses `Redline`.

## Exact next phase

`POST_MVP_ONLY — user-directed improvements`

The MVP and public-release package are complete. Do not begin another product phase without an explicit user request.
