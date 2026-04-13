# AGENTS.md — pattern-plgrnd

A design research project first, code repository second. A "garden" for cultivating interaction design patterns, with a focus on human↔AI collaboration. Full framing in docs/core-beliefs.md.

## Read first
- [docs/core-beliefs.md](docs/core-beliefs.md) — project philosophy, voice, scope
- [ARCHITECTURE.md](ARCHITECTURE.md) — domain layering and directory map
- [docs/storybook-taxonomy.md](docs/storybook-taxonomy.md) — where stories live (Activity Theory)

## Domain vocabulary (read when working on patterns, edges, or taxonomy)
- [docs/conceptual-glossary.md](docs/conceptual-glossary.md) — terms used across the project
- [docs/design-theory.md](docs/design-theory.md) — Alexander's two phases, centres, qualities, theoretical arc
- [docs/levels-of-scale.md](docs/levels-of-scale.md) — structural legibility across altitudes
- [docs/relationship-vocabulary.md](docs/relationship-vocabulary.md) — edge types, generative-moves framing, epistemic stance

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
Full list and conventions: [docs/testing-strategy.md](docs/testing-strategy.md)

## Plans and tech debt
- [plans/index.md](plans/index.md) — active, recent, and archived plans
- [plans/tech-debt-tracker.md](plans/tech-debt-tracker.md) — known rough edges

## Research inputs (read on demand, not eagerly)
- [docs/references.md](docs/references.md) — index of references/

## Quality gates
- [docs/testing-strategy.md](docs/testing-strategy.md)
- [docs/code-review.md](docs/code-review.md)
- [docs/commenting-style.md](docs/commenting-style.md)

## When in doubt
Ask the user. This project is research-driven; many decisions are aesthetic or philosophical and do not have a "correct" technical answer.
