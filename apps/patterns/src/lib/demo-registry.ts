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

type DemoComponent = ComponentType<Record<string, unknown>>;
type Loader = () => Promise<DemoComponent>;

const demos: Record<string, Loader> = {
  'block-based-editor': () =>
    import('@pkg/demos/block-based-editor').then((m) => m.BlockBasedEditorDemo),
  'commenting': () => import('@pkg/demos/bubble-menu').then((m) => m.CommentingDemo),
  'dynamic-explanation': () =>
    import('@pkg/demos/bubble-menu').then((m) => m.DynamicExplanationDemo),
  'text-lens': () => import('@pkg/demos/bubble-menu').then((m) => m.TextLensDemo),
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
    import('@pkg/catalog/registries/shadcn').then(async (m) => (await m.stylesheet, m.registry)),
};

// Panes and pages leave as plain DOM, which React does not see, so the roots
// inside them have to be unmounted by hand or their effects never clean up.
const roots = new Map<HTMLElement, Root>();

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
}

// Mount every unmounted [data-demo-spec] under root, and wire the frame's
// library switch. The state store is created once per mount and handed to each
// render, so switching libraries keeps the demo where the actor left it.
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
    const options =
      el
        .closest('.demo-block')
        ?.querySelectorAll<HTMLButtonElement>('[data-demo-registry-option]') ?? [];

    let reactRoot: Root | null = null;
    let render: ((registryName: string) => Promise<void>) | null = null;

    const ready = Promise.all([
      loadSpec(),
      import('@pkg/catalog/SpecDemo'),
      import('@json-render/core'),
    ]).then(([{ spec, setup }, { SpecDemo }, { createStateStore }]) => {
      if (!el.isConnected) {
        el.removeAttribute('data-demo-mounted');
        return;
      }
      const store = createStateStore(setup.initialState ?? {});
      const handlers = setup.handlers?.(store, () => el.isConnected);
      reactRoot = mountRoot(el);
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
        reactRoot?.render(
          createElement(SpecDemo, {
            spec,
            registry,
            registryName,
            store,
            handlers,
            functions: setup.functions,
          }),
        );
      };
      return render(el.dataset.demoRegistry ?? 'pp');
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
  }
}
