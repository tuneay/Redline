# AGENTS.md

This file defines the operating rules for any coding agent working on Redline.

## Before making changes

Read all Markdown files in the repository root and `docs` directory. Do not begin implementation after reading only this file.

Update `PROJECT_STATE.md` at the end of every completed phase. Record:

- what was implemented;
- which files changed;
- decisions made;
- known issues;
- tests run;
- the exact next phase.

## Product boundaries

Redline is a direct chat application. Do not add:

- a landing page;
- onboarding slides;
- authentication;
- accounts;
- payments;
- dashboards;
- analytics;
- a database;
- social sharing infrastructure;
- multiple AI modes;
- voice features;
- web search;
- external integrations;
- theme switching;
- admin panels.

A restart control and Markdown copy action are allowed.

## Technical constraints

- Use Next.js App Router.
- Use TypeScript with strict typing.
- Use Tailwind CSS for layout and visual styling.
- Use Motion for React for composed animations.
- Keep the Groq API key server-side.
- Use route handlers under `src/app/api`.
- Validate API input and model output with Zod.
- Store only the current local session in `localStorage`.
- Do not introduce Redux, Zustand, Supabase, Prisma, or another state/database system.
- Keep dependencies minimal.
- Do not read, print, commit, or expose `.env.local`.
- Do not log full user conversations in production code.
- Never ship a fallback that silently invents AI analysis.

## Architecture rules

Prefer this separation:

```text
src/
  app/
    api/
      interrogate/route.ts
      verdict/route.ts
    page.tsx
    layout.tsx
    globals.css
  components/
    chat/
    motion/
    verdict/
    ui/
  lib/
    ai/
    schemas/
    state/
    utils/
  hooks/
  types/
```

UI components must not call Groq directly. All model access belongs in `src/lib/ai` and server route handlers.

The conversation flow must be modeled as an explicit state machine, not inferred from scattered booleans.

Allowed phases:

```text
boot
awaiting_idea
interrogating
generating_verdict
verdict
error
```

## Design rules

- The canvas is black, not dark gray.
- Red is reserved for active intelligence, risk, contradiction, and verdict.
- Do not place every message inside a rounded bubble.
- User messages may be restrained right-aligned blocks.
- AI messages are left-aligned editorial text.
- Use one primary content column.
- Preserve generous negative space.
- Avoid borders unless they communicate structure.
- Avoid excessive shadows.
- Avoid fixed decorative animation loops.
- Do not use emoji.
- Do not use stock illustrations.
- Do not use generic icons where text is clearer.

## Motion rules

- Animate opacity, transform, and blur whenever possible.
- Do not animate layout with arbitrary CSS transitions.
- Use Motion layout animations for changing message geometry.
- Word reveal must be cancellable.
- Auto-scroll must not fight manual user scrolling.
- The interface must honor `prefers-reduced-motion`.
- No animation may block typing or submission.
- Never replay completed AI-message animations on re-render.
- Do not stagger long responses indefinitely; cap the total reveal delay.
- Do not use bouncy springs for serious states.

## AI behavior rules

The AI must:

- ask exactly five primary questions after the initial idea;
- ask one primary question per turn;
- use previous answers to adapt the next question;
- challenge vagueness and contradiction;
- separate facts, claims, assumptions, and unknowns;
- state when evidence is unavailable;
- avoid generic encouragement;
- avoid praise without evidence;
- avoid insults, humiliation, or attacks on the user;
- avoid fake certainty;
- avoid pretending it conducted market research;
- produce actionable next steps.

The AI may be severe. It may not be careless.

## Quality bar

Before marking a phase complete:

```bash
npm run lint
npm run build
```

Also test:

- keyboard-only interaction;
- narrow mobile viewport;
- desktop viewport;
- slow network;
- Groq error;
- malformed model output;
- reduced motion;
- long user input;
- refresh during an unfinished session.

Do not declare the project finished if lint or build fails.
