# Hydrate islands in fetched panes

Make interactive demos run in stacked panes beyond position 0.
Follow-up from the split-project move review (episode 05, move 1 of
`plans/reviews/split-project/05-site-surfaces.md`).

## Context

The stacked-notes reading model renders pane 0 from the server slot and
builds panes 1+ by fetching the target page and injecting
`article.innerHTML` (`stack-store.ts` `fetchPane`, `StackManager.tsx`).
Verified live 2026-07-11: prose, Lit components (globally registered,
self-upgrading), and the static RelatedPatterns block all survive the
fetch. What breaks is demos: they are `client:only="react"` islands —
their modules register custom elements at import time (Lit components,
`iconify-icon`) and cannot run in Node, so the build emits an empty
island shell — and `innerHTML` injection never triggers hydration. The
result in a fetched pane is a visible hole: the demo frame and label
render around an empty `<astro-island>`.

## Approach

1. _Investigate why the island doesn't self-hydrate._ `astro-island` is
   a custom element; once defined, injected instances should upgrade on
   connect. Empirically they stay empty. Find the gate in Astro's island
   runtime (the `ssr` attribute handshake, directive scheduling, or the
   bootstrap script's timing) before writing anything.
2. _Prefer Astro's own mechanism._ If the runtime can be nudged —
   triggering its existing start path on injected islands — do that.
   Manual mounting (reading `component-url` / `renderer-url` / `props`
   attributes and rendering directly) duplicates Astro's private
   hydration contract, including its props serialisation format, and
   breaks silently on Astro upgrades. Treat it as the fallback, not the
   plan.
3. _Scope the surfaces._ Fetched panes should hydrate. The link-preview
   popover shares the same fetch-the-article contract
   (`link-preview.ts` `fetchContent`) — decide explicitly whether an
   ephemeral hover preview should run demos (likely not; an inert
   preview is fine) and record the choice.

## Definition of done

A demo-carrying pattern (e.g. autocomplete) pushed as pane 1+ shows a
running demo, not an empty frame; behaviour at pane 0 unchanged; the
choice for link previews recorded; site build green.

## Resolution

The gate: a `client:only="react"` demo is emitted as an empty
`<astro-island>` plus two inert Astro bootstrap scripts (the
`astro-island` definition and the `only` client-directive registration)
that Astro places _inside_ `<article>`. On injection the island upgrades
(the element is defined globally by pane 0's `client:load` islands),
runs `start()`, finds `Astro.only` undefined, and parks on an
`astro:only` event — but the script that would register the directive
and fire that event is inert, because `<script>` tags inserted via
`innerHTML` never execute. Lit components and prose survive because Lit
elements self-upgrade with no Astro-directive dependency.

The fix (`StackManager.tsx` `reviveAstroScripts`, run in an effect when a
pane turns ready): recreate those inert bootstrap `<script>` nodes in
place so the browser runs them. This registers `Astro.only` and
dispatches `astro:only`, and the parked island finishes hydrating
through Astro's own start path — no manual mounting, no duplication of
Astro's props format. The filter matches only Astro's own scripts (they
assign `self.Astro`), never author scripts, and marks each so re-renders
don't rerun it.

Link previews stay inert: a hover popover is ephemeral and should not
run demos. `link-preview.ts` `extractContent` now drops `.demo-block`
elements so a preview shows no empty island frame rather than a hole.

Verified live 2026-07-11: `/patterns/a11y?stackedNotes=autocomplete`
(pane 0 has no demo, so `Astro.only` starts undefined) hydrates a live,
interactive autocomplete in pane 1; pane 0 unchanged; build green; no
console errors.
