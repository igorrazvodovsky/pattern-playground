# AGENTS.md — pattern-plgrnd

A design research project first, code repository second. A "garden" for cultivating interaction design patterns, with a focus on human↔AI collaboration. Full framing in docs/design-docs/core-beliefs.md.

## Read first
- [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) — project philosophy, voice, scope
- [ARCHITECTURE.md](ARCHITECTURE.md) — domain layering and directory map
- [docs/specs/storybook-taxonomy.md](docs/specs/storybook-taxonomy.md) — where stories live (Activity Theory)

## Rules that auto-activate by file path
`.claude/rules/` — do not read eagerly; each attaches via path match:
- web-components.md   → src/components/**/*.ts
- styling.md          → src/styles/**/*.css
- documentation.md    → src/stories/**/*.{mdx,stories.tsx}
- mock-data.md        → src/stories/**/*.{tsx,json}
- typescript.md       → all *.ts, *.tsx
- server.md           → server/**/*.ts
- state-management.md → all *.ts, *.tsx

## Common commands
```bash
npm run test               # ESLint
npm run test styles        # Stylelint
npm run storybook          # Storybook on :6006
cd server && npm run dev   # Express backend
```
Full list and conventions: [docs/quality/testing-strategy.md](docs/quality/testing-strategy.md)

## Plans and tech debt
- [plans/index.md](plans/index.md) — active, recent, and archived plans
- [plans/tech-debt-tracker.md](plans/tech-debt-tracker.md) — known rough edges

## Research inputs (read on demand, not eagerly)
- [docs/references/README.md](docs/references/README.md) — index of references/

## Quality gates
- [docs/quality/testing-strategy.md](docs/quality/testing-strategy.md)
- [docs/quality/code-review.md](docs/quality/code-review.md)
- [docs/quality/commenting-style.md](docs/quality/commenting-style.md)

## When in doubt
Ask the user. This project is research-driven; many decisions are aesthetic or philosophical and do not have a "correct" technical answer.
