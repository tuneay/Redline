# Motion System

## Motion objective

Motion gives Redline intelligence, pacing, and continuity. It is not decoration.

The interface should feel like one continuous surface changing its state rather than components appearing independently.

## Core principles

1. **Continuity** — elements move from where they were, not from arbitrary off-screen positions.
2. **Restraint** — serious states do not bounce.
3. **Causality** — every animation visibly follows an action.
4. **Readability** — text motion must never harm comprehension.
5. **Interruptibility** — the user can submit, scroll, restart, or reduce motion without waiting for choreography.
6. **Finite duration** — no permanent ambient animation except a processing indicator while a request is active.

## Motion tokens

```ts
export const duration = {
  instant: 0.12,
  fast: 0.2,
  standard: 0.34,
  slow: 0.52,
  emphasis: 0.72,
};

export const ease = {
  out: [0.16, 1, 0.3, 1],
  standard: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
};

export const spring = {
  soft: { type: "spring", stiffness: 260, damping: 30, mass: 0.9 },
  layout: { type: "spring", stiffness: 300, damping: 34, mass: 0.8 },
};
```

Avoid low-damping springs and visible overshoot.

## AI word reveal

### Why client-orchestrated reveal

Raw streamed model chunks do not reliably align to words. They can split punctuation, produce uneven batches, and make blur animation jitter.

For the MVP:

1. request a validated structured response;
2. receive the complete AI message;
3. split visible text into stable word and whitespace tokens;
4. animate words in sequence;
5. keep the original complete text available to screen readers.

This gives deterministic motion and protects the UI from malformed partial JSON.

### Word animation

Initial state:

```text
opacity: 0
filter: blur(8px)
transform: translateY(4px)
```

Final state:

```text
opacity: 1
filter: blur(0px)
transform: translateY(0px)
```

Recommended stagger:

- normal response: 20–28ms per word;
- short critical statement: 32–42ms per word;
- long verdict paragraph: 10–16ms per word.

Cap total stagger delay. A long message should not take several seconds merely because it contains many words.

### Punctuation rhythm

Optional: add slightly more delay after:

- full stop;
- question mark;
- colon;
- paragraph break.

Do not create theatrical pauses after every sentence.

### Re-render safety

Each message requires a stable ID and a `hasRevealed` flag. Completed messages must render immediately on refresh or unrelated state changes.

## Processing state

Do not use three bouncing dots.

Recommended behavior:

- a small red point appears;
- it expands horizontally into a thin line;
- the line travels once through a muted track;
- microcopy changes between grounded states:
  - `isolating assumptions`
  - `checking contradictions`
  - `selecting the next pressure point`

Use one or two phrases per request, not an endless carousel.

## Message entrance

User message:

```text
opacity: 0 → 1
y: 8 → 0
scale: 0.992 → 1
duration: fast
```

AI message container:

```text
layout animation
opacity: 0 → 1
y: 6 → 0
duration: standard
```

The word reveal handles the internal text.

## Input transitions

On submit:

1. text opacity reduces;
2. input height compresses slightly;
3. send control morphs into processing state;
4. submitted content appears in conversation;
5. input returns empty but disabled until response.

Do not physically fly the text from input to message. It is likely to feel gimmicky and introduces layout complexity.

## Auto-scroll

Rules:

- follow new content while the user is already near the bottom;
- stop following if the user scrolls upward;
- show a subtle “return to latest” control only when needed;
- account for input height and mobile safe area;
- scroll after layout measurement, not before.

Use smooth scrolling carefully. Reduced-motion mode uses immediate positioning.

## Contradiction effect

When the AI references two conflicting user claims:

- display the quoted fragments in separate evidence rows;
- reveal a thin red connector or underline;
- use one controlled draw animation;
- keep the contradiction readable without motion.

Do not shake the interface or flash red.

## Verdict sequence

1. processing state resolves;
2. background and previous conversation reduce slightly in contrast;
3. verdict label reveals through a short masked vertical movement;
4. diagnosis appears word by word;
5. score and confidence fade in;
6. critical failure appears;
7. remaining sections enter as the user scrolls or immediately in a measured sequence.

Do not animate every report row with a long stagger.

## Hover and press

- Hover transitions: 120–180ms.
- Press scale: no lower than `0.98`.
- Input and controls should feel firm, not elastic.
- Use red only when the interaction has significance.

## Reduced motion

When `prefers-reduced-motion: reduce`:

- disable word staggering;
- remove blur transitions;
- replace layout springs with short opacity changes;
- disable smooth scrolling;
- show complete text immediately;
- retain all state information.

## Performance

Prefer:

- `opacity`;
- `transform`;
- limited `filter`;
- Motion layout animations.

Avoid:

- large animated box shadows;
- animated gradients;
- backdrop-filter;
- full-screen blur;
- continuous canvas effects;
- animating width/height when a transform or layout animation works.

Test motion on a mid-range mobile device, not only a desktop browser.
