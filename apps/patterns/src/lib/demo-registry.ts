// Registry of client-mounted demo widgets. <Demo name="…"> (components/Demo.astro)
// renders a <div data-demo="…"> mount point; mountDemos() resolves the name here
// and mounts the React component with createRoot. Dynamic imports keep per-demo
// code-splitting. Runs on initial page load (layout script) and on each stacked
// pane that turns ready (StackManager) — the same code path everywhere, so
// injected panes need no island revival and demo modules stay out of the
// prerender graph entirely.
import { createElement, type ComponentType } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { Spec } from '@json-render/core';
import type { ComponentRegistry } from '@json-render/react';
import type { SpecSetup } from '@pkg/catalog/SpecDemo';
import type { Library } from './demo-libraries';
import { watchDemoHeights } from './demo-height';

type DemoComponent = ComponentType<Record<string, unknown>>;
type Loader = () => Promise<DemoComponent>;

const demos: Record<string, Loader> = {
  'block-based-editor': () =>
    import('@pkg/demos/block-based-editor').then((m) => m.BlockBasedEditorDemo),
  'contextual-actions': () =>
    import('@pkg/demos/contextual-actions').then((m) => m.ContextualActionsDemo),
  'commenting': () => import('@pkg/demos/commenting').then((m) => m.CommentingDemo),
  'dynamic-explanation': () =>
    import('@pkg/demos/explanation').then((m) => m.DynamicExplanationDemo),
  'text-lens': () => import('@pkg/demos/text-lens').then((m) => m.TextLensDemo),
  'instructed-revision': () =>
    import('@pkg/demos/instructed-revision').then((m) => m.InstructedRevisionDemo),
  'audience-lens': () => import('@pkg/demos/audience-lens').then((m) => m.AudienceLensDemo),
  'prestructured-formatting': () =>
    import('@pkg/demos/prestructured-formatting').then((m) => m.PrestructuredFormattingDemo),
  'dynamic-hyperlinks': () =>
    import('@pkg/demos/dynamic-hyperlinks/DynamicHyperlinksDemo').then(
      (m) => m.DynamicHyperlinksDemo,
    ),
  'fisheye-timeline': () =>
    import('@pkg/demos/focus-and-context/fisheye').then((m) => m.FisheyeTimelineDemo),
  'semantic-zoom': () => import('@pkg/demos/semantic-zoom').then((m) => m.SemanticZoomDemo),
  'semantic-zoom-timeline': () =>
    import('@pkg/demos/semantic-zoom').then((m) => m.SemanticZoomTimelineDemo),
  'population-rung': () => import('@pkg/demos/semantic-zoom').then((m) => m.PopulationRungDemo),
};

// Switchable demos (<Demo spec="…">): a spec in packages/components/src/demos/specs/,
// rendered through one of the catalog's registries. A slug is a JSON spec, a
// module (<slug>.ts) that supplies its setup, or both; the module wins, and a
// JSON spec without one renders with nothing set up. Each registry is its own
// chunk, and shadcn's carries its stylesheet, so a page loads a library only
// when a demo renders through it.
type SpecModule = { spec: Spec; setup: SpecSetup };

const slugOf = (file: string) => file.replace(/^.*\//, '').replace(/\.(json|ts)$/, '');
const specModules = import.meta.glob<SpecModule>(
  ['@pkg/demos/specs/*.ts', '!@pkg/demos/specs/*.test.ts'],
  { import: 'default' },
);
const specJson = import.meta.glob<Spec>('@pkg/demos/specs/*.json', { import: 'default' });
const moduleSlugs = new Set(Object.keys(specModules).map(slugOf));

const specs: Record<string, () => Promise<SpecModule>> = {
  ...Object.fromEntries(
    Object.entries(specJson)
      .filter(([file]) => !moduleSlugs.has(slugOf(file)))
      .map(([file, load]) => [slugOf(file), async () => ({ spec: await load(), setup: {} })]),
  ),
  ...Object.fromEntries(Object.entries(specModules).map(([file, load]) => [slugOf(file), load])),
};

const registries: Record<Library, () => Promise<ComponentRegistry>> = {
  pp: () => import('@pkg/catalog/registries/pp').then((m) => m.registry),
  shadcn: () =>
    import('@pkg/catalog/registries/shadcn').then(async (m) => (await m.stylesheet(), m.registry)),
};

// Panes and pages leave as plain DOM, which React does not see, so the roots
// inside them have to be unmounted by hand or their effects never clean up.
const roots = new Map<HTMLElement, Root>();
const observers = new Map<HTMLElement, IntersectionObserver>();

function mountRoot(el: HTMLElement): Root {
  const root = createRoot(el);
  roots.set(el, root);
  return root;
}

// Deferred because the caller can be inside another root's effect, where React
// cannot unmount a root synchronously.
export function unmountDetachedDemos(): void {
  queueMicrotask(() => {
    for (const [el, root] of roots) {
      if (el.isConnected) continue;
      roots.delete(el);
      root.unmount();
    }
    for (const [el, observer] of observers) {
      if (el.isConnected) continue;
      observers.delete(el);
      observer.disconnect();
    }
  });
}

// Mount every unmounted [data-demo] under root. Mounting is marked on the live
// element (data-demo-mounted), so re-runs — layout load, astro:page-load, a
// pane re-render — are no-ops for demos already mounted. Cached pane HTML is
// captured before mounting (lib strings, not live DOM), so re-injected panes
// arrive pristine and mount fresh.
export function mountDemos(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-demo]:not([data-demo-mounted])')) {
    const name = el.dataset.demo ?? '';
    const load = demos[name];
    if (!load) {
      console.warn(`[demo-registry] no entry for demo "${name}"`);
      continue;
    }
    el.setAttribute('data-demo-mounted', '');
    const props: Record<string, unknown> = el.dataset.demoProps
      ? JSON.parse(el.dataset.demoProps)
      : {};
    load().then(
      (Component) => {
        // The pane may have been truncated while the module loaded.
        if (!el.isConnected) {
          el.removeAttribute('data-demo-mounted');
          return;
        }
        mountRoot(el).render(createElement(Component, props));
      },
      (err) => {
        el.removeAttribute('data-demo-mounted');
        console.error(`[demo-registry] failed to load demo "${name}"`, err);
      },
    );
  }
  mountSpecDemos(root);
  // Every demo frame, mounted or slotted, gets its height cap watched here,
  // since this runs wherever demos appear.
  watchDemoHeights(root);
}

// Mount every unmounted [data-demo-spec] under root, and wire the frame's
// controls. The state store is created once per mount and handed to each
// render, so switching libraries keeps the demo where the actor left it.
// Replaying mounts the demo again: a new store from `initialState`, new
// handlers, and a new React tree, in the library already chosen. Each mount
// has its own `connected`, which turns false once a later mount replaces it,
// so the old mount's timers stop writing. A spec's `start` runs once the demo
// is first in view, and again on each replay.
function mountSpecDemos(root: ParentNode): void {
  for (const el of root.querySelectorAll<HTMLElement>(
    '[data-demo-spec]:not([data-demo-mounted])',
  )) {
    const slug = el.dataset.demoSpec ?? '';
    const loadSpec = specs[slug];
    if (!loadSpec) {
      console.warn(`[demo-registry] no spec "${slug}"`);
      continue;
    }
    el.setAttribute('data-demo-mounted', '');
    const frame = el.closest('.demo-block');
    const options = frame?.querySelectorAll<HTMLButtonElement>('[data-demo-registry-option]') ?? [];
    const replayButton = frame?.querySelector<HTMLButtonElement>('[data-demo-replay]');

    let render: ((registryName: string) => Promise<void>) | null = null;
    let replay: (() => Promise<void>) | null = null;

    const ready = Promise.all([
      loadSpec(),
      import('@pkg/catalog/SpecDemo'),
      import('@json-render/core'),
    ]).then(([{ spec, setup }, { SpecDemo }, { createStateStore }]) => {
      if (!el.isConnected) {
        el.removeAttribute('data-demo-mounted');
        return;
      }
      const reactRoot = mountRoot(el);
      let count = 0;
      const create = () => {
        count += 1;
        const id = count;
        const connected = () => el.isConnected && id === count;
        const store = createStateStore(setup.initialState ?? {});
        return { id, store, connected, handlers: setup.handlers?.(store, connected) };
      };
      let mount = create();
      // Start the mount that was current when the caller began, and only if it
      // still is: two replays awaiting one render would otherwise both start the
      // newest mount, and two timer chains would drive one store.
      const startIfCurrent = (m: typeof mount) => {
        if (m === mount && m.connected()) setup.start?.(m.store, m.connected);
      };

      render = async (registryName) => {
        if (!Object.hasOwn(registries, registryName)) {
          return console.warn(`[demo-registry] no registry "${registryName}"`);
        }
        const registry = await registries[registryName as Library]();
        if (!el.isConnected) return;
        el.dataset.demoRegistry = registryName;
        for (const option of options) {
          option.setAttribute(
            'aria-pressed',
            String(option.dataset.demoRegistryOption === registryName),
          );
        }
        reactRoot.render(
          createElement(SpecDemo, {
            key: mount.id,
            spec,
            registry,
            registryName,
            store: mount.store,
            handlers: mount.handlers,
            functions: setup.functions,
          }),
        );
      };

      // The actor asked for the replay beside the demo, so it starts at once.
      replay = async () => {
        observers.get(el)?.disconnect();
        observers.delete(el);
        const m = create();
        mount = m;
        await render?.(el.dataset.demoRegistry ?? 'pp');
        startIfCurrent(m);
      };

      if (replayButton && (setup.start || setup.replay)) {
        const name = setup.start ? 'Replay this demo' : 'Reset this demo';
        replayButton.setAttribute('aria-label', name);
        replayButton.title = name;
        replayButton.hidden = false;
      }

      const first = mount;
      return render(el.dataset.demoRegistry ?? 'pp').then(() => {
        if (setup.start && first === mount) startWhenSeen(el, () => startIfCurrent(first));
      });
    });

    ready.catch((err) => {
      el.removeAttribute('data-demo-mounted');
      console.error(`[demo-registry] failed to load spec "${slug}"`, err);
    });

    for (const option of options) {
      option.addEventListener('click', () => {
        const next = option.dataset.demoRegistryOption;
        if (next && next !== el.dataset.demoRegistry) void ready.then(() => render?.(next));
      });
    }
    replayButton?.addEventListener('click', () => void ready.then(() => replay?.()));
  }
}

// Seen means half the demo is on screen, or half the screen is demo when the
// demo is taller than that. The thresholds step finely so a very tall demo,
// whose visible ratio never nears 0.5, still reports as it scrolls in. The
// observer goes once it has fired, and with the demo's root when the demo
// leaves the page unseen.
const SEEN_THRESHOLDS = Array.from({ length: 51 }, (_, i) => i / 100);

function startWhenSeen(el: HTMLElement, start: () => void): void {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      const seen =
        entry.intersectionRatio >= 0.5 || entry.intersectionRect.height >= window.innerHeight / 2;
      if (!seen) return;
      observer.disconnect();
      observers.delete(el);
      start();
    },
    { threshold: SEEN_THRESHOLDS },
  );
  observer.observe(el);
  observers.set(el, observer);
}
