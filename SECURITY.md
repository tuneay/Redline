# Security policy

## Supported versions

Redline is currently pre-1.0. Security fixes are applied to the latest commit on the `main` branch.

## Reporting a vulnerability

Do not disclose vulnerabilities, leaked credentials, prompt contents, full conversations, or sensitive logs in public issues, discussions, or pull requests.

Use GitHub's private vulnerability reporting flow:

1. Open the repository's **Security** tab.
2. Select **Advisories**.
3. Choose **Report a vulnerability**.
4. Include reproduction steps, impact, affected files or routes, and any suggested mitigation.

Use redacted examples. Never include real API keys, personal data, or unnecessary conversation content.

Relevant reports include:

- server-side secret exposure;
- client-bundle leakage of protected prompts or credentials;
- prompt-injection paths that override system rules;
- stored or reflected script injection;
- local-session corruption with a security impact;
- denial-of-service or request-limit bypasses;
- dependency vulnerabilities with demonstrated impact on Redline.

Maintainers will investigate valid reports privately and coordinate disclosure after a fix is available. Response times are best-effort because this is a community-maintained project.

## Security model

- Groq credentials remain server-only.
- User messages are treated as untrusted prompt data.
- API input, model output, evidence, and local storage are schema-validated.
- Production code does not log full conversations.
- There is no database, account system, analytics collector, or web-search integration.

## Credential exposure

If a secret is exposed, revoke or rotate it immediately. Removing it from the latest commit is not sufficient because Git history and external caches may retain it.
