# Testing strategy

## Development commands

### Frontend (root directory)
- `npm run test` — run ESLint
- `npm run test styles` — run Stylelint
- `npm run storybook` — start Storybook on port 6006
- `npm run test-storybook` — run Storybook's Vitest project for CSF stories
- `npm run build-storybook` — build static Storybook

### Backend (server directory)
- `cd server && npm run dev` — start Express server with hot reload
- `cd server && npm run build` — compile TypeScript
- `cd server && npm run start` — run production server
- `cd server && npm run typecheck` — TypeScript type checking

## Visual verification

When writing or modifying Storybook stories, use `/example-skills:webapp-testing` (Playwright) to verify component rendering and interaction behaviour against the running Storybook instance on `:6006`.

## Storybook accessibility tests

Storybook uses `@storybook/addon-a11y` with `@storybook/addon-vitest`.
The global accessibility test behavior lives in `.storybook/preview.ts`:

- `todo` keeps violations visible in Storybook's test UI without failing CI.
- `error` turns violations into failing Storybook Vitest tests.
- `off` should be reserved for stories that intentionally demonstrate non-accessible usage.

Use `npm run test-storybook -- --run` for a one-shot local run. If Chromium is missing after installing or updating Playwright, run `npx playwright install chromium`.

## Quality baseline

- TypeScript strict mode enabled
- Components should extend native HTML elements when possible
- ESLint enforces: no `any`, no `console.log` (warn/error allowed), no inline `style` props, centralised `customElements.define()`, no ARIA selectors as JS hooks
- Stylelint enforces CSS conventions (see `.claude/rules/styling.md`)
