# CLAUDE.md

A design research project first, code repository second: a garden for cultivating interaction design patterns, with a focus on human↔AI collaboration.

## Voice

Use plain, design-practitioner language in everything written here — pattern content, docs, and plans. Use ordinary words and direct statements; avoid dramatic staging, compressed aphorisms, and literary borrowings. Write "actor" when both humans and AI agents can do the task. Use "artifact" for the designed thing a person interacts with, at whatever scale the pattern works at.

- Banned phrases: "load-bearing", "worth stating plainly", "full stop", "carry the argument", "the trap", "isn't just X — it's Y".
- Write complete sentences; no punchy fragments for drama.
- State claims directly instead of building to a turn of phrase.
- Keep sentences concise: each should add new information without restating or over-explaining implications.
- Use British spelling (behaviour, organisation, colour) and sentence case for headings and titles.

## Map

- [docs/project/core-beliefs.md](docs/project/core-beliefs.md) — project philosophy, framing, and scope
- [ARCHITECTURE.md](ARCHITECTURE.md) — tech stack, workspaces, and directory map
- [docs/index.md](docs/index.md) — full docs map: project vision, pattern-language vocabulary and theory, and quality guides (read on demand)
- [docs/specs/index.md](docs/specs/index.md) — settled specifications for workspace layout, pattern site, sequences, and agent harness
- [plans/index.md](plans/index.md) — active and completed plans ([plans/README.md](plans/README.md) for conventions; [plans/tech-debt-tracker.md](plans/tech-debt-tracker.md) for known rough edges)
- `.claude/rules/` — path-scoped coding and authoring rules; do not read eagerly (each attaches via `paths:` frontmatter)
- `$PARA/Areas/IxD patterns/` — external research vault; read on demand, not eagerly

## Commands

```bash
npm run dev                # Pattern site on :4321
npm run storybook          # Storybook on :6006
npm run dev -w apps/server # Express backend on :3000
npm run extract-graph      # Regenerate pattern-graph.json
npm run lint               # Repo checks + ESLint
npm run lint:styles        # Stylelint
npm run format             # Prettier (format:check to list differences)
npm run test               # Full gate: lint, Stylelint, Prettier check, all Vitest projects
npm run test-unit          # Unit Vitest project only (node)
npm run test-storybook     # Storybook Vitest project only (headless Chromium)
```

Full command list, testing conventions, and dev-server troubleshooting live in [docs/quality/testing-strategy.md](docs/quality/testing-strategy.md) and [docs/quality/dev-environment.md](docs/quality/dev-environment.md).

## When in doubt

Ask the user. This project is research-driven; many decisions are aesthetic or philosophical and do not have a "correct" technical answer.
