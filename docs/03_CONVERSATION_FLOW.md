# Conversation Flow

## Experience structure

Redline opens inside the conversation. The first frame should already feel active, not like an empty form.

Initial message:

> What are you building?

A secondary line may appear after a short beat:

> Be specific. I will ask five questions and challenge the assumptions behind it.

Do not show feature cards, sample prompts, testimonials, or a hero headline.

## State machine

```text
boot
  ↓
awaiting_idea
  ↓
interrogating: question 1
  ↓
interrogating: question 2
  ↓
interrogating: question 3
  ↓
interrogating: question 4
  ↓
interrogating: question 5
  ↓
generating_verdict
  ↓
verdict
```

Any request may enter `error`. Retry returns to the prior stable state.

## Conversation stages

### Stage 0 — Idea

The user describes the concept.

The server extracts:

- proposed user;
- stated problem;
- proposed solution;
- claimed value;
- business assumptions;
- unclear terms;
- initial risk hypotheses.

No verdict is shown.

### Question 1 — Problem reality

Goal: determine whether the problem is concrete, painful, frequent, and currently handled somehow.

Question examples:

- “Tell me about the last time this user experienced the problem.”
- “What does the user lose when they do nothing?”
- “Which existing workaround are they already tolerating?”

Avoid abstract questions such as “What problem do you solve?”

### Question 2 — User specificity

Goal: identify the first reachable user, not a broad market category.

Question examples:

- “Describe the first 20 users so narrowly that you could find them tonight.”
- “Which subgroup feels this problem more severely than the rest?”

### Question 3 — Behavior and alternative

Goal: expose what the user must stop, replace, or learn.

Question examples:

- “What behavior must change for this product to work?”
- “Why would they abandon the current workaround after the first week?”

### Question 4 — Distribution and willingness

Goal: determine how the first users are reached and what meaningful commitment they will make.

Question examples:

- “Where exactly will the first ten users come from?”
- “What will you ask them to pay, share, upload, or change?”

### Question 5 — Fatal assumption

Goal: target the most dangerous unresolved assumption from all previous answers.

Possible focuses:

- problem frequency;
- buyer/user mismatch;
- habit change;
- distribution;
- retention;
- willingness to pay;
- trust;
- regulatory dependency;
- supply-side dependency;
- easily copied advantage.

The fifth question must be specific to the conversation.

## Per-turn AI message shape

A standard AI turn contains:

```text
[Observation: one or two sentences]
[Question: one sentence]
```

Example:

> You described a feature advantage, not a reason to switch. The existing tool may be ugly, but it already owns the workflow.
>
> What recurring event would make the user open your product again next week?

Do not add headings to every chat turn. The conversation should feel natural.

## Progress

Show progress subtly as `02 / 05`.

Do not use:

- progress bars;
- achievement language;
- confetti;
- “Great answer” confirmations.

## Input behavior

- `Enter` submits.
- `Shift + Enter` inserts a new line.
- While the server is processing, input remains visible but temporarily disabled.
- The send control morphs into a restrained processing indicator.
- After the AI message finishes revealing, focus returns to the input unless the user moved focus elsewhere.

## Answer length

Soft recommendation: 1–6 sentences.

Do not aggressively block longer input. Enforce a server-side character maximum and show a live warning near the limit.

## Verdict transition

After the fifth user answer:

1. user answer settles into position;
2. input collapses or becomes inactive;
3. a quiet analysis state appears;
4. existing messages reduce slightly in contrast;
5. verdict label enters;
6. supporting sections reveal progressively;
7. the conversation remains accessible above.

The verdict is not a modal and does not navigate to another page.

## Restart

Restart must:

- ask for confirmation only if a meaningful session exists;
- clear local state;
- cancel active animations and requests;
- return to the initial message;
- restore input focus.
