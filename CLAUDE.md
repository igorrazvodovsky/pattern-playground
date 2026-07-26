# CLAUDE.md

A design research project first, code repository second. A "garden" for cultivating interaction design patterns, with a focus on human↔AI collaboration. Full framing in docs/project/core-beliefs.md.

## Read first
- [docs/project/core-beliefs.md](docs/project/core-beliefs.md) — project philosophy, voice, scope
- [ARCHITECTURE.md](ARCHITECTURE.md) — domain layering and directory map
- [docs/index.md](docs/index.md) — sectioned docs map; route into it on demand

## Read by task
- Structural or cross-workspace changes → [docs/specs/workspace-layout.md](docs/specs/workspace-layout.md) (package boundaries) and [docs/specs/index.md](docs/specs/index.md) (settled specs)
- Pattern-site content → [docs/specs/pattern-site.md](docs/specs/pattern-site.md); the authoring contract attaches automatically from `.claude/rules/pattern-content.md`
- Questions about repository altitude/legibility → [docs/levels-of-scale.md](docs/levels-of-scale.md)

## Domain vocabulary (read when working on patterns, edges, or taxonomy)
- [docs/language/pattern-definition.md](docs/language/pattern-definition.md) — what counts as a pattern, mechanism, observation, anti-pattern, or umbrella
- [docs/language/pattern-and-form.md](docs/language/pattern-and-form.md) — pattern language vs form language; the move/mechanism boundary
- [docs/language/conceptual-glossary.md](docs/language/conceptual-glossary.md) — terms used across the project
- [docs/language/design-theory.md](docs/language/design-theory.md) — Alexander's two phases, centres, qualities, theoretical arc
- [docs/project/vision.md](docs/project/vision.md) — where the artifact as a whole is heading
- [docs/project/operative-image.md](docs/project/operative-image.md) — current working picture of the artifact
- [docs/language/vision.md](docs/language/vision.md) — where the pattern language is heading (Nature of Order, agent-usable tracks)
- [docs/language/operative-image.md](docs/language/operative-image.md) — current working picture of the language
- [docs/language/relationship-vocabulary.md](docs/language/relationship-vocabulary.md) — edge types, generative-moves framing, epistemic stance

## Rules that auto-activate by file path
`.claude/rules/` — do not read eagerly; each attaches via path match:
- web-components.md   → packages/components/src/components/**/*.ts
- styling.md          → packages/components/src/styles/**/*.css
- documentation.md    → packages/components/src/stories/**/*.{mdx,stories.tsx}
- pattern-content.md  → apps/patterns/src/content/**/*.{md,mdx}
- mock-data.md        → packages/components/src/stories/**/*.{tsx,json}
- typescript.md       → all *.ts, *.tsx
- server.md           → apps/server/**/*.ts
- state-management.md → all *.ts, *.tsx

## Common commands
```bash
npm run test               # ESLint (workspace root)
npm run test styles        # Stylelint
npm run storybook          # Storybook on :6006
npm run dev                # Pattern site on :4321
npm run dev -w apps/server # Express backend on :3000
npm run extract-graph      # Regenerate pattern-graph.json
```
Full list and conventions: [docs/quality/testing-strategy.md](docs/quality/testing-strategy.md)

## Executable specs and tech debt
- [plans/README.md](plans/README.md) — how executable specifications work
- [plans/index.md](plans/index.md) — active, completed, paused, superseded, and archived plans
- [plans/tech-debt-tracker.md](plans/tech-debt-tracker.md) — known rough edges

## Research inputs (read on demand, not eagerly)
- [docs/research/references.md](docs/research/references.md) — index of references/

## Quality gates
- [docs/quality/testing-strategy.md](docs/quality/testing-strategy.md)
- [docs/quality/code-review.md](docs/quality/code-review.md)
- [docs/quality/commenting-style.md](docs/quality/commenting-style.md)
- [docs/quality/dev-environment.md](docs/quality/dev-environment.md) — read when the dev server, Storybook, or a deploy misbehaves

## When in doubt
Ask the user. This project is research-driven; many decisions are aesthetic or philosophical and do not have a "correct" technical answer.
