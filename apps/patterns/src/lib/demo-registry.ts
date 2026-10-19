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

type DemoComponent = ComponentType<Record<string, unknown>>;
type Loader = () => Promise<DemoComponent>;

const demos: Record<string, Loader> = {
  'block-based-editor': () => import('@pkg/demos/block-based-editor').then(m => m.BlockBasedEditorDemo),
  'commenting': () => import('@pkg/demos/bubble-menu').then(m => m.CommentingDemo),
  'dynamic-explanation': () => import('@pkg/demos/bubble-menu').then(m => m.DynamicExplanationDemo),
  'text-lens': () => import('@pkg/demos/bubble-menu').then(m => m.TextLensDemo),
  'linked-trio': () => import('@pkg/demos/coordinated-views').then(m => m.LinkedTrioDemo),
  'cross-filtering': () => import('@pkg/demos/coordinated-views').then(m => m.CrossFilteringDemo),
  'data-view': () => import('@pkg/demos/data-view').then(m => m.DataViewDemo),
  'saved-views': () => import('@pkg/demos/data-view').then(m => m.SavedViewsDemo),
  'writable-board': () => import('@pkg/demos/data-view').then(m => m.WritableBoardDemo),
  'data-view-grouping-slice': () => import('@pkg/demos/data-view').then(m => m.DataViewGroupingSlice),
  'data-view-sorting-slice': () => import('@pkg/demos/data-view').then(m => m.DataViewSortingSlice),
  'dynamic-hyperlinks': () => import('@pkg/demos/dynamic-hyperlinks/DynamicHyperlinksDemo').then(m => m.DynamicHyperlinksDemo),
  'filtering': () => import('@pkg/demos/filtering').then(m => m.FilteringDemo),
  'contextual-navigation': () => import('@pkg/demos/focus-and-context').then(m => m.ContextualNavigationDemo),
  'fisheye-timeline': () => import('@pkg/demos/focus-and-context').then(m => m.FisheyeTimelineDemo),
  'semantic-zoom': () => import('@pkg/demos/semantic-zoom').then(m => m.SemanticZoomDemo),
  'semantic-zoom-timeline': () => import('@pkg/demos/semantic-zoom').then(m => m.SemanticZoomTimelineDemo),
  'population-rung': () => import('@pkg/demos/semantic-zoom').then(m => m.PopulationRungDemo),
};

// Switchable demos (<Demo spec="…">): a JSON spec plus the module beside it,
// rendered through one of the catalog's registries. Each registry is its own
// chunk, and shadcn's carries its stylesheet, so a page loads a library only
// when a demo renders through it.
type SpecModule = { spec: Spec; setup: SpecSetup };

const specs: Record<string, () => Promise<{ default: SpecModule }>> = {
  'activity-log': () => import('@pkg/demos/specs/activity-log'),
  'autocomplete': () => import('@pkg/demos/specs/autocomplete'),
  'callout-notification': () => import('@pkg/demos/specs/callout-notification'),
  'communicating-uncertainty': () => import('@pkg/demos/specs/communicating-uncertainty'),
  'consequence-ladder': () => import('@pkg/demos/specs/consequence-ladder'),
  'conversational-form': () => import('@pkg/demos/specs/conversational-form'),
  'dialog-deletion': () => import('@pkg/demos/specs/dialog-deletion'),
  'disruptive-notification': () => import('@pkg/demos/specs/disruptive-notification'),
  'empty-state-blank-slate': () => import('@pkg/demos/specs/empty-state-blank-slate'),
  'empty-state-educational': () => import('@pkg/demos/specs/empty-state-educational'),
  'empty-state-guiding': () => import('@pkg/demos/specs/empty-state-guiding'),
  'empty-state-informational': () => import('@pkg/demos/specs/empty-state-informational'),
  'fluid-attributes': () => import('@pkg/demos/specs/fluid-attributes'),
  'form': () => import('@pkg/demos/specs/form'),
  'inline-confirmation': () => import('@pkg/demos/specs/inline-confirmation'),
  'inline-notification': () => import('@pkg/demos/specs/inline-notification'),
  'input-output-mapping': () => import('@pkg/demos/specs/input-output-mapping'),
  'investigate': () => import('@pkg/demos/specs/investigate'),
  'item-view-glyph': () => import('@pkg/demos/specs/item-view-glyph'),
  'item-view-full': () => import('@pkg/demos/specs/item-view-full'),
  'item-view-row': () => import('@pkg/demos/specs/item-view-row'),
  'item-view-transitions': () => import('@pkg/demos/specs/item-view-transitions'),
  'llm-assisted-filter': () => import('@pkg/demos/specs/llm-assisted-filter'),
  'mode-based-reveal': () => import('@pkg/demos/specs/mode-based-reveal'),
  'monitor': () => import('@pkg/demos/specs/monitor'),
  'nested-pairs': () => import('@pkg/demos/specs/nested-pairs'),
  'overview-detail': () => import('@pkg/demos/specs/overview-detail'),
  'problem-checklist': () => import('@pkg/demos/specs/problem-checklist'),
  'prompt-basic': () => import('@pkg/demos/specs/prompt-basic'),
  'prompt-quality-feedback': () => import('@pkg/demos/specs/prompt-quality-feedback'),
  'prompt-template': () => import('@pkg/demos/specs/prompt-template'),
  'prompt-with-material-references': () => import('@pkg/demos/specs/prompt-with-material-references'),
  'reasoning-trace': () => import('@pkg/demos/specs/reasoning-trace'),
  'reference': () => import('@pkg/demos/specs/reference'),
  'rule-composition': () => import('@pkg/demos/specs/rule-composition'),
  'sections': () => import('@pkg/demos/specs/sections'),
  'select-all-affordance': () => import('@pkg/demos/specs/select-all-affordance'),
  'staged-deletion': () => import('@pkg/demos/specs/staged-deletion'),
  'status-feedback': () => import('@pkg/demos/specs/status-feedback'),
  'toast': () => import('@pkg/demos/specs/toast'),
  'toast-with-undo': () => import('@pkg/demos/specs/toast-with-undo'),
  'typed-confirmation': () => import('@pkg/demos/specs/typed-confirmation'),
  'watch-to-chase-tiers': () => import('@pkg/demos/specs/watch-to-chase-tiers'),
};

const registries: Record<string, () => Promise<ComponentRegistry>> = {
  pp: () => import('@pkg/catalog/registries/pp').then(m => m.registry),
  shadcn: () => import('@pkg/catalog/registries/shadcn').then(async m => (await m.stylesheet, m.registry)),
};

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
    const props: Record<string, unknown> = el.dataset.demoProps ? JSON.parse(el.dataset.demoProps) : {};
    load().then(
      (Component) => {
        // The pane may have been truncated while the module loaded.
        if (!el.isConnected) {
          el.removeAttribute('data-demo-mounted');
          return;
        }
        createRoot(el).render(createElement(Component, props));
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
  for (const el of root.querySelectorAll<HTMLElement>('[data-demo-spec]:not([data-demo-mounted])')) {
    const slug = el.dataset.demoSpec ?? '';
    const loadSpec = specs[slug];
    if (!loadSpec) {
      console.warn(`[demo-registry] no spec "${slug}"`);
      continue;
    }
    el.setAttribute('data-demo-mounted', '');
    const options = el.closest('.demo-block')?.querySelectorAll<HTMLButtonElement>('[data-demo-registry-option]') ?? [];

    let reactRoot: Root | null = null;
    let render: ((registryName: string) => Promise<void>) | null = null;

    const ready = Promise.all([loadSpec(), import('@pkg/catalog/SpecDemo'), import('@json-render/core')]).then(
      ([{ default: { spec, setup } }, { SpecDemo }, { createStateStore }]) => {
        if (!el.isConnected) {
          el.removeAttribute('data-demo-mounted');
          return;
        }
        const store = createStateStore(setup.initialState ?? {});
        const handlers = setup.handlers?.(store, () => el.isConnected);
        reactRoot = createRoot(el);
        render = async (registryName) => {
          const loadRegistry = registries[registryName];
          if (!loadRegistry) return console.warn(`[demo-registry] no registry "${registryName}"`);
          const registry = await loadRegistry();
          if (!el.isConnected) return;
          el.dataset.demoRegistry = registryName;
          for (const option of options) {
            option.setAttribute('aria-pressed', String(option.dataset.demoRegistryOption === registryName));
          }
          reactRoot?.render(
            createElement(SpecDemo, { spec, registry, registryName, store, handlers, functions: setup.functions }),
          );
        };
        return render(el.dataset.demoRegistry ?? 'pp');
      },
    );

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
