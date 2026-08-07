# Testing strategy

## Development commands

### Frontend (root directory)
- `npm run lint` — run ESLint (plus the seed-staleness check)
- `npm run lint:styles` — run Stylelint
- `npm run test` — full gate: lint, Stylelint, and a one-shot run of every Vitest project (needs Chromium)
- `npm run storybook` — start Storybook on port 6006
- `npm run test-storybook` — the `storybook` project alone: CSF stories in headless Chromium
- `npm run test-unit` — the `unit` project alone: framework-agnostic logic in node
- `npm run build-storybook` — build static Storybook

### Backend (`apps/server`)
- `npm run dev -w apps/server` — start Express server with hot reload
- `npm run build -w apps/server` — compile TypeScript
- `npm run start -w apps/server` — run production server
- `npm run typecheck -w apps/server` — TypeScript type checking

## Visual verification

When writing or modifying Storybook stories, verify component rendering and interaction behaviour against the running Storybook instance on `:6006` with the available browser tooling (chrome-devtools MCP, claude-in-chrome, or Playwright).

## Storybook accessibility tests

Storybook uses `@storybook/addon-a11y` with `@storybook/addon-vitest`. The global accessibility test behavior lives in `packages/components/.storybook/preview.ts`.

Default to `error` for all stories — violations should fail Storybook Vitest tests. Deviations require explicit justification:

- `todo` only with a linked issue tracking the fix.
- `off` only with an inline comment explaining the intentional non-accessible usage.

A passing axe run is a regression floor, not accessibility sign-off — interaction behaviour, contrast in hover/focus/dark-mode states, and focus management still need whatever verification the implementation plan specifies.

If Chromium is missing after installing or updating Playwright, run `npx playwright install chromium`.

## The two Vitest projects

`packages/components/vitest.config.ts` declares both.

- `storybook` — every CSF story, in headless Chromium, with the a11y addon at
  `error`. This is where anything touching the DOM belongs.
- `unit` — node environment, `src/**/*.test.ts`. For logic that needs no
  browser: type guards, pure services, parsers. Import `describe`/`it`/`expect`
  from `vitest` rather than relying on globals.

Aliases (`@shared`, `@utils`) are declared at the top of `vitest.config.ts` so
both projects resolve them; Storybook additionally sets them in
`.storybook/main.ts` for the dev server. A target that imports `@shared/*` and
fails to resolve is a sign the two have drifted apart.

## What a play function owes

Every `play` function ends in at least one assertion. An interaction that
asserts nothing passes even when the component swallows it.

- *Assert structure, never rendered text.* Stories are faker-seeded, so the
  strings change per run. Roles, counts, `aria-*` and `checked` are stable;
  the one exception is text the play function itself supplies.
- *Wait for anything a render or an animation produces.* Elena's `updated()`
  and CSS entry animations both land after the event that caused them — use
  `waitFor` for state changes and `findBy*` for things that appear.
- *Keyboard and focus behaviour gets its own story*, named for what it pins
  (`Keyboard operation`, `Keyboard navigation`), so the coverage is visible in
  the sidebar rather than only in code.
- *The browser's own dismissal cannot be tested here.* Escape and light
  dismiss for `popover` and native `<dialog>` run off the close watcher, which
  only trusted input reaches; synthetic events do not. Say so in the story
  rather than leaving the gap looking accidental.
- *Modal surfaces are cleared between stories.* They mount on `document.body`
  and outlive the story that opened them, and an open one makes every later
  canvas inert. `preview.ts` calls `modalService.closeAll()` in `beforeEach`
  so play functions need not tidy up after themselves.

## Quality baseline

- TypeScript strict mode enabled
- Components should extend native HTML elements when possible
- ESLint enforces: no `any`, no `console.log` (warn/error allowed), no inline `style` props, centralised `customElements.define()`, no ARIA selectors as JS hooks
- Stylelint enforces CSS conventions (see `.claude/rules/styling.md`). `.stylelintrc.json` encodes the naming conventions rather than the stock defaults: classes are BEM in kebab-case, custom properties are kebab-case with camelCase segments and an optional `_` prefix for component-local tokens, colours come from OKLCH inside the sRGB gamut. The files that style tldraw and ProseMirror take an override, because those class names are not this project's to rename.
