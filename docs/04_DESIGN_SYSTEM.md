# Design System

## Design direction

Redline should feel like an Apple-grade editorial intelligence interface: calm, spatial, precise, and materially restrained.

It must not look like:

- a gamer dashboard;
- a cyberpunk terminal;
- an AI SaaS landing page;
- a messaging-app clone;
- a collection of floating glass cards;
- a red neon environment.

## Visual concept

The canvas is nearly absolute black. White text carries thought. Red appears only when the system identifies pressure, risk, contradiction, or final judgment.

The experience should feel as if the interface is listening and reorganizing itself around the conversation.

## Color tokens

```css
--background: #050505;
--surface-1: #0A0A0A;
--surface-2: #101010;
--text-primary: #F5F5F7;
--text-secondary: #8E8E93;
--text-tertiary: #5E5E63;
--line-subtle: rgba(255, 255, 255, 0.08);
--line-strong: rgba(255, 255, 255, 0.14);
--signal-red: #FF3B30;
--signal-red-soft: rgba(255, 59, 48, 0.14);
--signal-red-dim: #7A1E1A;
--selection: rgba(255, 59, 48, 0.28);
```

Do not add extra brand colors in the MVP.

## Typography

Preferred stack:

```css
font-family:
  Inter,
  ui-sans-serif,
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Display",
  "SF Pro Text",
  "Segoe UI",
  sans-serif;
```

Do not ship Apple font files.

Use:

- display sizing only for verdict;
- body typography for conversation;
- monospace sparingly for progress and system metadata.

Suggested scale:

```text
Verdict label      clamp(44px, 8vw, 88px)
AI message         clamp(20px, 2.4vw, 30px)
User message       16–18px
Input              16–18px
Metadata           11–12px
Report heading     12px uppercase with tracking
Report body        16–20px
```

## Layout

### Main frame

```text
Viewport: 100dvh
Header: minimal controls only
Conversation: single centered column
Input dock: bottom-aligned within same column
Default content width: 760px
Wide-desktop frame width: 1024px
Wide-desktop conversation width: 896px
Desktop side padding: 32px
Mobile side padding: 18px
```

The chat column may subtly shift upward as the conversation grows, but should never resemble a centered landing-page form.

### Header

Allowed elements:

- Redline wordmark or compact mark;
- current progress;
- restart control.

No navigation.

### Conversation hierarchy

AI messages:

- left aligned;
- larger;
- no enclosing bubble by default;
- generous line-height;
- max width around 680px.

User messages:

- right aligned;
- smaller;
- limited width;
- lower visual dominance;
- optional subtle surface, not a glossy bubble.

System states:

- centered or left-aligned metadata;
- very small;
- never visually louder than AI text.

## Input dock

The input is the primary physical object in the interface.

Characteristics:

- dark surface only slightly lighter than background;
- one-pixel subtle border;
- radius around 22–28px;
- expands vertically with content;
- no heavy shadow;
- internal send control;
- restrained red active state;
- no placeholder animation loop.

Suggested placeholder:

> Describe the idea without pitching it.

During questions:

> Answer the question directly.

## Verdict composition

Verdict content should not become a conventional dashboard.

Recommended order:

```text
VERDICT
One-sentence diagnosis
Score + confidence
Critical failure
Strongest signal
What you avoided
Assumption list
Reconstructed idea
Validation order
Do not build yet
```

Use spacing and typography, not many cards.

## Surfaces

A surface is allowed only when it groups information with a distinct function:

- user answer;
- input dock;
- evidence quote;
- validation order;
- recoverable error.

Do not wrap every report section in a card.

## Red usage rules

Use red for:

- active cursor or send state;
- AI processing pulse;
- contradiction underline;
- risk labels;
- verdict label when severe;
- key score weakness;
- destructive restart confirmation.

Do not use red for:

- every icon;
- large decorative glows;
- entire page background;
- generic hover states;
- long paragraphs.

## Texture

A very subtle static grain may be used if implemented with CSS and negligible performance cost. It must not move.

## Responsive behavior

Mobile:

- maintain editorial typography;
- reduce horizontal indentation;
- keep input above safe-area inset;
- avoid fixed heights that conflict with the virtual keyboard;
- use `100dvh`;
- preserve tap targets of at least 44px.

Desktop:

- do not stretch the conversation across the full screen;
- maintain focus around the central reading column;
- use empty space intentionally.

## Accessibility

- Body text contrast must remain readable.
- Red must never be the only indication of status.
- Focus states must be visible.
- Text selection must remain possible.
- Motion must have a reduced alternative.
- Do not hide essential content inside hover-only interactions.
