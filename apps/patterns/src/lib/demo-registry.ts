// Registry of client-mounted demo widgets. <Demo name="…"> (components/Demo.astro)
// and <MermaidDiagram> (components/MermaidDiagram.astro) render a
// <div data-demo="…"> mount point; mountDemos() resolves the name here and mounts
// the React component with createRoot. Dynamic imports keep per-demo
// code-splitting. Runs on initial page load (layout script) and on each stacked
// pane that turns ready (StackManager) — the same code path everywhere, so
// injected panes need no island revival and demo modules stay out of the
// prerender graph entirely.
import { createElement, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';

type DemoComponent = ComponentType<Record<string, unknown>>;
type Loader = () => Promise<DemoComponent>;

const demos: Record<string, Loader> = {
  'consequence-ladder': () => import('@pkg/demos/action-consequences').then(m => m.ConsequenceLadderDemo),
  'activity-log-basic': () => import('@pkg/demos/activity-log').then(m => m.ActivityLogBasicDemo),
  'activity-log-llm-reasoning': () => import('@pkg/demos/activity-log').then(m => m.ActivityLogLLMReasoningDemo),
  'fluid-attributes': () => import('@pkg/demos/attribute-visibility').then(m => m.FluidAttributesDemo),
  'autocomplete': () => import('@pkg/demos/autocomplete').then(m => m.AutocompleteDemo),
  'block-based-editor': () => import('@pkg/demos/block-based-editor').then(m => m.BlockBasedEditorDemo),
  'commenting': () => import('@pkg/demos/bubble-menu').then(m => m.CommentingDemo),
  'dynamic-explanation': () => import('@pkg/demos/bubble-menu').then(m => m.DynamicExplanationDemo),
  'text-lens': () => import('@pkg/demos/bubble-menu').then(m => m.TextLensDemo),
  'conversational-form': () => import('@pkg/demos/conversational-form').then(m => m.ConversationalFormDemo),
  'linked-trio': () => import('@pkg/demos/coordinated-views').then(m => m.LinkedTrioDemo),
  'cross-filtering': () => import('@pkg/demos/coordinated-views').then(m => m.CrossFilteringDemo),
  'data-view': () => import('@pkg/demos/data-view').then(m => m.DataViewDemo),
  'saved-views': () => import('@pkg/demos/data-view').then(m => m.SavedViewsDemo),
  'writable-board': () => import('@pkg/demos/data-view').then(m => m.WritableBoardDemo),
  'data-view-grouping-slice': () => import('@pkg/demos/data-view').then(m => m.DataViewGroupingSlice),
  'data-view-sorting-slice': () => import('@pkg/demos/data-view').then(m => m.DataViewSortingSlice),
  'dialog-deletion': () => import('@pkg/demos/deletion').then(m => m.DialogDeletionDemo),
  'typed-confirmation': () => import('@pkg/demos/deletion').then(m => m.TypedConfirmationDemo),
  'staged-deletion': () => import('@pkg/demos/deletion').then(m => m.StagedDeletionDemo),
  'dynamic-hyperlinks': () => import('@pkg/demos/dynamic-hyperlinks/DynamicHyperlinksDemo').then(m => m.DynamicHyperlinksDemo),
  'filtering': () => import('@pkg/demos/filtering').then(m => m.FilteringDemo),
  'contextual-navigation': () => import('@pkg/demos/focus-and-context').then(m => m.ContextualNavigationDemo),
  'fisheye-timeline': () => import('@pkg/demos/focus-and-context').then(m => m.FisheyeTimelineDemo),
  'form': () => import('@pkg/demos/form').then(m => m.FormDemo),
  'inline-confirmation': () => import('@pkg/demos/inline-confirmation').then(m => m.InlineConfirmationDemo),
  'item-view-full': () => import('@pkg/demos/item-view').then(m => m.ItemViewFullDemo),
  'item-view-row': () => import('@pkg/demos/item-view').then(m => m.ItemViewRowDemo),
  'item-view-glyph': () => import('@pkg/demos/item-view').then(m => m.ItemViewGlyphDemo),
  'item-view-transitions': () => import('@pkg/demos/item-view').then(m => m.ItemViewTransitionsDemo),
  'disruptive-notification': () => import('@pkg/demos/notification').then(m => m.DisruptiveNotificationDemo),
  'overview-detail': () => import('@pkg/demos/overview-detail').then(m => m.OverviewDetailDemo),
  'nested-pairs': () => import('@pkg/demos/overview-detail').then(m => m.NestedPairsDemo),
  'problem-checklist': () => import('@pkg/demos/problem-curated-view').then(m => m.ProblemChecklistDemo),
  'prompt-basic': () => import('@pkg/demos/prompt').then(m => m.PromptBasicDemo),
  'prompt-template': () => import('@pkg/demos/prompt').then(m => m.PromptTemplateDemo),
  'prompt-with-material-references': () => import('@pkg/demos/prompt').then(m => m.PromptWithMaterialReferencesDemo),
  'prompt-quality-feedback': () => import('@pkg/demos/prompt').then(m => m.PromptQualityFeedbackDemo),
  'monitor': () => import('@pkg/demos/purpose-keyed-view').then(m => m.MonitorDemo),
  'investigate': () => import('@pkg/demos/purpose-keyed-view').then(m => m.InvestigateDemo),
  'watch-to-chase-tiers': () => import('@pkg/demos/purpose-keyed-view').then(m => m.WatchToChaseTiersDemo),
  'reference': () => import('@pkg/demos/reference').then(m => m.ReferenceDemo),
  'mode-based-reveal': () => import('@pkg/demos/selection').then(m => m.ModeBasedRevealDemo),
  'select-all-affordance': () => import('@pkg/demos/selection').then(m => m.SelectAllAffordanceDemo),
  'semantic-zoom': () => import('@pkg/demos/semantic-zoom').then(m => m.SemanticZoomDemo),
  'semantic-zoom-timeline': () => import('@pkg/demos/semantic-zoom').then(m => m.SemanticZoomTimelineDemo),
  'population-rung': () => import('@pkg/demos/semantic-zoom').then(m => m.PopulationRungDemo),
  'indicators': () => import('@pkg/demos/status-feedback').then(m => m.IndicatorsDemo),
  'toast': () => import('@pkg/demos/transient-feedback').then(m => m.ToastDemo),
  'toast-with-undo': () => import('@pkg/demos/transient-feedback').then(m => m.ToastWithUndoDemo),
  'mermaid': () => import('@components/MermaidDiagram').then(m => m.MermaidDiagram as DemoComponent),
};

// Names the verification script checks MDX content against.
export const demoNames: ReadonlySet<string> = new Set(Object.keys(demos));

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
}
