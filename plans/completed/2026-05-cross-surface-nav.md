---
title: "Cross-surface nav links between Storybook and the Pattern site"
status: "active"
kind: "exec-spec"
created: "2026-05-17"
area: "nav"
---

# Cross-surface nav links between Storybook and the Pattern site

## Context

The workspace split (`plans/completed/2026-05-workspace-split.md`) put components in Storybook (`packages/components/`, port 6006) and patterns in an Astro site (`apps/patterns/`, port 4321). Today the two surfaces are siblings with no in-product way to jump between them — anyone reading a pattern page who wants to look at the component substrate has to know about Storybook and navigate to it manually, and vice versa.

This plan adds reciprocal nav links: a "Components" entry in the Pattern site's sidebar that points to Storybook, and a "Pattern site" entry in Storybook's sidebar that points back. Both open in the same tab (user choice). Both URLs are env-driven so the production deployment can point at non-localhost hosts.

The Pattern site already plans to introduce a `PUBLIC_STORYBOOK_URL` env var for the `<ComponentRef>` work in `plans/active/2026-05-embed-components.md`. This plan reuses that variable for the nav link rather than introducing a second one. A symmetric `STORYBOOK_PATTERN_SITE_URL` is added on the Storybook side (the `STORYBOOK_` prefix is how Storybook exposes env vars to its manager bundle).

## Pattern site → Storybook

### `apps/patterns/src/components/AppShell.tsx`

The component already imports `SidebarHeader` but never renders it; `SidebarFooter` is the natural slot for an "off-tree" link that is structurally distinct from the content-collection-generated groups. The current `<Sidebar collapsible="icon">` means the footer entry needs to read sensibly in both expanded and icon-only modes.

Changes:

- Import `SidebarFooter` from `@components/sidebar` (already exports it — `packages/components/src/components/sidebar/Sidebar.tsx:288`).
- Add a `storybookUrl: string` prop to `AppShellProps`.
- After `<SidebarContent>`, render a `<SidebarFooter>` containing a single `SidebarMenu` / `SidebarMenuItem` / `SidebarMenuButton`. The button uses `render={<a href={storybookUrl} />}` (no `target` — same-tab per user choice), an iconify icon (`ph:squares-four` or `ph:cube`) to read in collapsed mode, the label "Components", and `tooltip="Components (Storybook)"` to mirror the existing nav-item idiom (`AppShell.tsx:55`).
- Do not add `isActive` logic — this link is never the current route.

### `apps/patterns/src/layouts/Base.astro`

- Read `const storybookUrl = import.meta.env.PUBLIC_STORYBOOK_URL ?? 'http://localhost:6006';` alongside the existing nav build (`Base.astro:18-36`).
- Pass `storybookUrl={storybookUrl}` to `<AppShell ...>` (`Base.astro:51`).

### `apps/patterns/.env.example` (new)

```
PUBLIC_STORYBOOK_URL=http://localhost:6006
```

(`.env*` is not currently ignored in the repo `.gitignore` — only `*.local` is. Add `apps/patterns/.env` to `.gitignore` so a future real `.env` doesn't get committed. The committed `.env.example` is the discoverable template.)

If `plans/active/2026-05-embed-components.md` lands first, the env var and `.env.example` already exist — this plan reuses them and does not duplicate. If this plan lands first, the embed-components plan picks up the same files.

### Styling

No new CSS needed. The `SidebarMenuButton` inherits the existing sidebar typography and spacing. If a visual separator between the dynamic groups and the footer link reads as needed during verification, add a `border-top` rule scoped to `[data-slot="sidebar-footer"]` in `apps/patterns/src/styles/app.css` — judge by eye, do not pre-emptively style.

## Storybook → Pattern site

The user picked "custom sidebar entry" over the lighter `brandUrl` approach. Storybook 10.3.6 (verified locally in `node_modules/storybook/dist/types/index.d.ts:3488-3508` and against `https://storybook.js.org/docs/configure/user-interface/sidebar-and-urls` + `/docs/addons/addon-types`) does *not* expose any public addon API for adding arbitrary entries, links, headers, or footers to the sidebar tree. The addon types in `Addon_TypesEnum` are `TAB | PANEL | TOOL | TOOLEXTRA | PREVIEW | experimental_PAGE | experimental_TEST_PROVIDER`; the only sidebar-side config keys are `renderLabel` (per-item label transform) and `collapsedRoots` / `showRoots`. `experimental_PAGE` would route to an in-Storybook page, not an external URL, and would visibly flicker on click. So a "real" sidebar entry requires DOM injection — there is no public-API path.

Mechanism: a small TypeScript side-effect in `manager.ts` that uses `MutationObserver` to wait for the sidebar to mount, then appends a single styled `<a>` element. `manager.ts` (not `manager-head.html`) is the right host because Storybook bundles it with `process.env.STORYBOOK_*` substitution, so the URL stays env-driven.

### `packages/components/.storybook/manager.ts`

Extend the existing file (`manager.ts:1-10`) with the injection block. Stays `.ts` — no JSX, no React import, raw DOM only.

```ts
import { addons } from 'storybook/manager-api';
import theme from './theme';

addons.setConfig({
  theme,
  showToolbar: false,
  sidebar: {
    collapsedRoots: ['foundations', 'operations', 'data-visualization', 'concepts'],
  },
});

// Storybook 10 has no public API for custom sidebar entries (verified against
// Addon_TypesEnum and storybook.js.org/docs/configure/user-interface/sidebar-and-urls).
// DOM-injecting a single anchor is the practical workaround; revisit when an
// addon slot is exposed.
const PATTERN_SITE_URL =
  (typeof process !== 'undefined' && process.env.STORYBOOK_PATTERN_SITE_URL) ||
  'http://localhost:4321';
const LINK_ID = 'pattern-plgrnd-pattern-site-link';

function injectLink() {
  if (document.getElementById(LINK_ID)) return;
  // #sidebar-bottom-wrapper is a stable id used by Storybook's notification
  // area (see node_modules/storybook/dist/manager/runtime.js — SIDEBAR_BOTTOM_WRAPPER_ID).
  // Insert just before it so the link sits at the bottom of the tree but above
  // notifications. Fall back to appending to the sidebar container if the id
  // is not yet present.
  const anchorTarget =
    document.getElementById('sidebar-bottom-wrapper') ??
    document.querySelector('[class*="sidebar-container"]');
  if (!anchorTarget) return;
  const a = document.createElement('a');
  a.id = LINK_ID;
  a.href = PATTERN_SITE_URL;
  a.textContent = '↗ Pattern site';
  a.style.cssText = [
    'display:flex',
    'align-items:center',
    'gap:8px',
    'padding:10px 20px',
    'color:inherit',
    'text-decoration:none',
    'font:inherit',
    'border-top:1px solid rgba(38,85,115,0.15)',
  ].join(';');
  if (anchorTarget.id === 'sidebar-bottom-wrapper') {
    anchorTarget.parentElement?.insertBefore(a, anchorTarget);
  } else {
    anchorTarget.appendChild(a);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') injectLink();
  else document.addEventListener('DOMContentLoaded', injectLink);
  // Re-inject on Storybook's internal re-renders (route changes, theme reloads).
  new MutationObserver(injectLink).observe(document.body, { childList: true, subtree: true });
}
```

Risks and what to verify when running:

- DOM selectors. `#sidebar-bottom-wrapper` was located in Storybook 10.3.6's bundled runtime. If a future Storybook update removes the id, the fallback `[class*="sidebar-container"]` keeps the link rendering (just appended to the bottom of the container rather than ordered above notifications).
- Border colour. The `rgba(38,85,115,0.15)` literal mirrors `appBorderColor` in `theme.js:18`. Keep them in sync by hand — Storybook's theme tokens are not available as CSS custom properties on the manager DOM.
- ASCII `↗` rather than an iconify icon. The Pattern-site footer uses iconify-icon (`ph:squares-four`) because the components workspace already loads it; the Storybook manager bundle does not, and registering iconify just for one glyph is not worth the bundle weight. Asymmetric but deliberate — do not "fix" by adding iconify to the manager.
- Same-tab navigation. The anchor has no `target` attribute. Per user choice — do not add `target="_blank"`.

### `packages/components/.env.example` (new)

```
STORYBOOK_PATTERN_SITE_URL=http://localhost:4321
```

Storybook auto-exposes `STORYBOOK_*` env vars to the manager bundle at build time, so `process.env.STORYBOOK_PATTERN_SITE_URL` in `manager.ts` resolves correctly. The default in the injection code keeps the file optional for local dev.

### `packages/components/.env.example` (new)

```
STORYBOOK_PATTERN_SITE_URL=http://localhost:4321
```

Storybook auto-exposes `STORYBOOK_*` env vars to the manager and preview bundles. The default in `sidebar-footer.tsx` makes the file optional for local dev.

## Files modified

- `apps/patterns/src/components/AppShell.tsx` — add `SidebarFooter` with Storybook link, accept `storybookUrl` prop
- `apps/patterns/src/layouts/Base.astro` — read env var, pass `storybookUrl` to `AppShell`
- `apps/patterns/.env.example` (new) — declares `PUBLIC_STORYBOOK_URL`
- `apps/patterns/.gitignore` or root `.gitignore` — add `apps/patterns/.env`
- `packages/components/.storybook/sidebar-footer.tsx` (new) — React component for the link
- `packages/components/.storybook/manager.ts` — register sidebar-bottom slot
- `packages/components/.env.example` (new) — declares `STORYBOOK_PATTERN_SITE_URL`

## Out of scope

- Linking to specific Storybook stories from specific pattern pages (that is the `<ComponentRef>` work in `plans/active/2026-05-embed-components.md`).
- Production deployment URLs — the env vars accept them, but choosing the hosts is a deploy-time concern.
- A shared header/topbar across both surfaces.
- Replacing the Pattern site's `{/* TODO: logo */}` placeholder in `AppShell.tsx:33` — that is a separate authoring task.

## Verification

1. `cd apps/patterns && npm run dev` — site starts on 4321. Sidebar shows the existing groups, plus a "Components" entry at the bottom. Clicking it loads Storybook in the same tab. Collapsing the sidebar (icon mode) keeps the entry visible with the tooltip "Components (Storybook)".
2. In a separate terminal: `cd packages/components && npm run storybook` — Storybook starts on 6006. The sidebar now has a "↗ Pattern site" link below the story tree. Clicking it loads the Pattern site in the same tab.
3. Set `PUBLIC_STORYBOOK_URL=https://example.invalid` in `apps/patterns/.env` and rebuild — the Pattern site link now points at `https://example.invalid`. Remove the override; confirm fallback to `http://localhost:6006`.
4. Set `STORYBOOK_PATTERN_SITE_URL=https://example.invalid` and restart Storybook — the sidebar link now points at `https://example.invalid`. Remove; confirm fallback to `http://localhost:4321`.
5. `cd apps/patterns && npm run build` — exits cleanly.
6. `cd packages/components && npm run build-storybook` — exits cleanly; the bundled manager loads without console errors when opening `storybook-static/index.html`.
