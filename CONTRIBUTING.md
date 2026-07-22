# Contributing to Redline

Thanks for helping make early product reasoning more rigorous.

## Before you start

Redline intentionally has one narrow product flow:

```text
Idea → five adaptive questions → evidence-linked verdict
```

Read `AGENTS.md`, `PROJECT_STATE.md`, and the relevant files under `docs/` before changing behavior. Landing pages, authentication, accounts, dashboards, payments, analytics, databases, web search, voice, and unrelated integrations are outside the current scope.

For a substantial change, open an issue first so the problem and smallest useful solution can be discussed.

## Development setup

Requirements:

- Node.js 22 or newer
- npm
- A Groq API key for live model requests

```bash
npm install
cp .env.example .env.local
npm run dev
```

Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
npm.cmd run dev
```

Never commit `.env.local`, API keys, access tokens, full production conversations, or sensitive logs.

## Pull requests

1. Fork the repository and create a focused branch.
2. Keep changes within the documented product scope.
3. Preserve the explicit conversation state machine and the exact five-question boundary.
4. Validate external input and model output with Zod.
5. Add or update tests when behavior changes.
6. Verify keyboard access, narrow layouts, and reduced-motion behavior for UI changes.
7. Run the complete validation suite:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

8. Complete the pull request template and explain important tradeoffs.

## Commit style

Prefer concise conventional-style messages:

```text
feat: add evidence navigation
fix: preserve retry after refresh
docs: clarify model configuration
test: cover malformed verdict output
```

## Security reports

Do not report vulnerabilities or exposed credentials in a public issue. Follow `SECURITY.md` instead.

## License of contributions

By submitting a contribution, you agree that it will be licensed under the GNU Affero General Public License v3.0 only, the same license as the project.
