# MVP Scope

## Product surface

The entire MVP is one responsive screen.

There is no pre-chat landing page. There is no separate report route. The conversation transitions into the verdict inside the same visual surface.

## Included

### Conversation

- Initial AI greeting
- Idea input
- Exactly five adaptive primary questions
- One user answer per question
- Brief challenge or observation before the next question
- Progress marker
- Final verdict generation
- Restart action
- Copy report as Markdown

### Intelligence

- Full conversation context
- Question adaptation
- Vague-answer detection
- Contradiction detection
- Claim-versus-evidence separation
- Confidence calculation
- Verdict classification
- Reconstructed idea
- Validation action
- Do-not-build list

### Interface

- Responsive desktop and mobile layout
- Keyboard submission
- Multiline input
- AI processing state
- Word-level message reveal
- Smooth message layout changes
- Intelligent auto-scroll
- Error and retry states
- Reduced-motion mode
- Local unfinished-session restore

### Engineering

- Server-side Groq calls
- Zod validation
- Safe retries
- Request size limits
- Environment-configured models
- Lint and production build
- Minimal accessibility support
- No secret logging

## Excluded

- Landing or marketing page
- Authentication
- User accounts
- Cloud conversation history
- Database
- Team collaboration
- Payments
- Public profiles
- Shareable hosted reports
- Voice conversation
- File uploads
- URL analysis
- GitHub integration
- Web browsing or market research
- Real investor personas
- Multiple AI personalities
- Gamification
- Leaderboards
- Email capture
- Product analytics
- Admin tooling
- Native mobile application
- Internationalization framework

## Exact question rule

After the user's initial idea, Redline asks exactly five primary questions.

A response may contain:

1. a short diagnosis or challenge;
2. one primary question.

It must not contain multiple questions disguised as bullets.

If an answer is vague, Redline records the vagueness and proceeds. It does not create a sixth question. The final report lowers its confidence accordingly.

## Data retention

- Store the active session in `localStorage`.
- Do not send data anywhere except the Groq-backed server endpoint.
- Do not persist conversations server-side.
- Restart must clear local session state.
- Local state should be versioned so schema changes can invalidate old sessions safely.

## Performance boundaries

- Keep the initial client bundle disciplined.
- Do not preload large visual assets.
- Use no video or canvas animation.
- Avoid continuous background effects.
- Prevent one long AI message from creating an excessive stagger duration.
- The input must remain responsive while messages animate.

## Completion criteria

The MVP is not complete because the happy path works once. It is complete when:

- the fifth answer always leads to a verdict;
- invalid model output produces a recoverable state;
- animations do not replay on unrelated renders;
- the same conversation can be refreshed and continued;
- no API secret is present in client code;
- keyboard and reduced-motion use remain functional.
