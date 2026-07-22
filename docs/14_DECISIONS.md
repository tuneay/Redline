# Decision Log

## D-001 — Direct chat entry

**Decision:** The root page opens directly inside the chat.

**Reason:** The conversation is the product. A landing page would delay the primary experience and consume the one-day MVP budget.

**Status:** Locked.

## D-002 — Exactly five primary questions

**Decision:** Ask exactly five primary questions after the initial idea.

**Reason:** A fixed promise creates pacing, completion, and a testable product contract.

**Trade-off:** Weak answers cannot create unlimited follow-ups. Confidence is lowered instead.

**Status:** Locked.

## D-003 — No database or authentication

**Decision:** Store the current session locally.

**Reason:** The MVP tests whether the interrogation and verdict are valuable, not whether account infrastructure works.

**Status:** Locked.

## D-004 — Structured response before visual reveal

**Decision:** Obtain validated structured AI output, then animate visible text client-side word by word.

**Reason:** Raw model chunks split words and conflict with reliable JSON parsing. The chosen approach gives smoother motion, safer schema handling, and consistent replay.

**Trade-off:** The first word appears after model completion rather than during generation. Groq speed plus a deliberate processing state should keep perceived latency acceptable.

**Status:** Locked for MVP.

## D-005 — Groq through Vercel AI SDK

**Decision:** Use `@ai-sdk/groq` and the Vercel AI SDK inside Next.js route handlers.

**Reason:** Small integration surface, typed generation utilities, and compatibility with the selected stack.

**Status:** Locked.

## D-006 — Environment-configured models

**Decision:** Model IDs live in environment variables.

**Reason:** Groq model availability and deprecation status can change. Hard-coding a model deep in application logic creates unnecessary failure risk.

**Status:** Locked.

## D-007 — GPT-OSS structured-output default

**Decision:** Start with `openai/gpt-oss-20b` for interrogation and optionally `openai/gpt-oss-120b` for the final verdict.

**Reason:** Current Groq documentation lists structured-output support and positions these models for reasoning workflows.

**Fallback:** Use the chat model for verdict if the final model is unavailable.

**Status:** Initial default; verify availability in the user's Groq project.

## D-008 — No web access in MVP

**Decision:** The AI evaluates only the conversation.

**Reason:** A one-day MVP cannot responsibly combine retrieval quality, citations, freshness, and product reasoning without diluting the core.

**Consequence:** AI must explicitly avoid external market claims.

**Status:** Locked.

## D-009 — Severe but non-abusive persona

**Decision:** Critique ideas and reasoning without personal humiliation.

**Reason:** Insults create novelty, not trust. Precision and evidence produce the desired hardness.

**Status:** Locked.

## D-010 — Red as signal

**Decision:** Red is reserved for active pressure, contradiction, risk, and verdict.

**Reason:** Ubiquitous red becomes visual noise and cheapens the critical states.

**Status:** Locked.

## D-011 — One-screen verdict

**Decision:** Verdict appears inside the existing chat surface.

**Reason:** Preserves conversational continuity and avoids making the result feel like a generic dashboard.

**Status:** Locked.

## D-012 — Motion is functional

**Decision:** Motion must communicate state, continuity, or reading rhythm.

**Reason:** The visual ambition is high, but decorative motion would undermine the calm Apple-like direction.

**Status:** Locked.

## D-013 — Local-first development baseline

**Decision:** The MVP is developed and run as a standard local Next.js application through `npm install` and `npm run dev`.

**Reason:** Deployment accounts, cloud infrastructure, and vendor-specific deployment configuration are outside the project scope. The `ai` and `@ai-sdk/groq` packages are application libraries, not a deployment dependency.

**Status:** Locked.

## D-014 — Product-name casing

**Decision:** Use `Redline` for the product name in interface copy, metadata, prompts, documentation, and reports.

**Reason:** Consistent title-case naming is an explicit product requirement. Schema values and environment-variable names keep their contract-defined casing.

**Status:** Locked.

## D-015 — Wider desktop frame with a bounded reading column

**Decision:** Above the desktop breakpoint, widen the header and input frame to `64rem` while keeping the conversation reading column at `56rem`. Preserve the original `47.5rem` limit below that breakpoint.

**Reason:** The completed interface felt undersized on wide monitors. A wider physical frame uses desktop space more confidently, while a separately bounded conversation column prevents AI prose from becoming difficult to scan.

**Consequence:** User-answer-to-AI-response spacing receives an additional `8px` on small screens and `16px` on desktop. AI text line lengths remain capped inside their components.

**Status:** Locked by explicit post-MVP visual direction.

## D-016 — Language is a validated response contract

**Decision:** Detect the conversation language from user messages, treat short unambiguous Turkish greetings as Turkish, and require every user-visible model field to use the detected language. Keep schema keys and contract enum values in English.

**Reason:** A prompt hint alone allowed short Turkish input such as “selam” to fall through to English. Language consistency is part of response validity, not optional tone styling.

**Implementation:** Local Zod schemas, evidence checks, and the single repair attempt remain authoritative. A Turkish conversation that returns English visible prose fails validation and enters the repair path.

**Status:** Locked.

## D-017 — Provider-neutral JSON validation

**Decision:** Request a single JSON object as prompt-grounded text, extract the first balanced object, parse it locally, and validate it against the complete Zod contract. Do not depend on a provider-specific JSON Schema response format.

**Reason:** Groq model and endpoint combinations can reject provider-level structured-output parameters even when the model can reliably return JSON. Local parsing keeps the contract strict without tying correctness to one provider transport feature.

**Consequence:** Model output is still untrusted. Invalid JSON, schema failures, evidence failures, and language mismatches enter one constrained repair attempt and never become invented fallback analysis.

**Status:** Locked.

## D-018 — Narrow hydration suppression for extension attributes

**Decision:** Keep server and client markup deterministic and apply `suppressHydrationWarning` only to the root `body` element.

**Reason:** The reported mismatch showed a browser extension injecting `cz-shortcut-listen` into `body` before React hydration. Root-level attribute suppression addresses that exact external mutation while component-level hydration regressions remain visible and tested.

**Status:** Locked.

## D-019 — Open-source release policy

**Decision:** Publish Redline under AGPL-3.0-only, keep the Redline name and visual identity outside the software license, and maintain public contribution, conduct, security, issue, pull-request, and CI policies.

**Reason:** AGPL preserves source availability when modified versions are offered over a network. The separate trademark policy keeps forks free to use the code while preventing confusion about official branding.

**Status:** Locked for the first public release.
