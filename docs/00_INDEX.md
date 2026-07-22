# Documentation Index

## Purpose

This directory is the source of truth for Redline. When code and documentation disagree, do not guess. Resolve the conflict and record the decision in `14_DECISIONS.md`.

## Reading sequence

| Order | File | Purpose |
|---:|---|---|
| 1 | `01_PRODUCT_SPEC.md` | Product identity, user promise, outcomes |
| 2 | `02_MVP_SCOPE.md` | Exact boundaries of the one-day MVP |
| 3 | `03_CONVERSATION_FLOW.md` | State machine and five-question experience |
| 4 | `04_DESIGN_SYSTEM.md` | Visual language and component hierarchy |
| 5 | `05_MOTION_SYSTEM.md` | Animation behavior and motion tokens |
| 6 | `06_AI_BEHAVIOR.md` | Personality, truthfulness, severity rules |
| 7 | `07_PROMPT_ARCHITECTURE.md` | System prompts and reasoning contracts |
| 8 | `08_TECHNICAL_ARCHITECTURE.md` | Stack, folders, data flow, failure handling |
| 9 | `09_API_AND_DATA_CONTRACTS.md` | Zod-friendly request and response shapes |
| 10 | `10_BUILD_PHASES.md` | Ordered implementation phases |
| 11 | `11_QA_AND_ACCEPTANCE.md` | Functional, visual, AI, and accessibility tests |
| 12 | `12_IMPLEMENTATION_PROMPTS.md` | Prompts for coding agents |
| 13 | `13_POST_MVP_ROADMAP.md` | Features explicitly deferred |
| 14 | `14_DECISIONS.md` | Architectural and product decision log |

## Conflict precedence

1. Security and privacy rules
2. `AGENTS.md`
3. `02_MVP_SCOPE.md`
4. `06_AI_BEHAVIOR.md`
5. `09_API_AND_DATA_CONTRACTS.md`
6. Design and motion specifications
7. Implementation prompts

## Working rule

Do not expand scope because a feature appears easy. Every addition creates more states, failure paths, and visual noise. Redline succeeds by making one conversation feel unusually intelligent and finished.
