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

Storybook uses `@storybook/addon-a11y` with `@storybook/addon-vitest`. The global accessibility test behavior lives in `.storybook/preview.ts`.

Default to `error` for all stories — violations should fail Storybook Vitest tests. Deviations require explicit justification:

- `todo` only with a linked issue tracking the fix.
- `off` only with an inline comment explaining the intentional non-accessible usage.

A passing axe run is a regression floor, not accessibility sign-off — interaction behaviour, contrast in hover/focus/dark-mode states, and focus management still need whatever verification the implementation plan specifies.

Use `npm run test-storybook -- --run` for a one-shot local run. If Chromium is missing after installing or updating Playwright, run `npx playwright install chromium`.

## Quality baseline

- TypeScript strict mode enabled
- Components should extend native HTML elements when possible
- ESLint enforces: no `any`, no `console.log` (warn/error allowed), no inline `style` props, centralised `customElements.define()`, no ARIA selectors as JS hooks
- Stylelint enforces CSS conventions (see `.claude/rules/styling.md`)
