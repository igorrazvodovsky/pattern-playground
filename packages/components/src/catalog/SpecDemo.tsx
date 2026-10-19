import { useEffect, useRef } from 'react';
import { JSONUIProvider, Renderer, type ComponentRegistry, type ComponentRenderer } from '@json-render/react';
import type { ComputedFunction, Spec, StateStore } from '@json-render/core';
import { DemoSettled } from './registries/focus-on-show';

// Renders a demo spec (demos/specs/<slug>.json) through one registry. The
// state store is created by the caller and outlives this component, so
// switching registries re-renders the same demo state in another library.

export type ActionHandler = (params: Record<string, unknown>) => unknown;

/** What the module beside a spec contributes: everything a JSON spec cannot carry. */
export interface SpecSetup {
  /** State the spec reads. Fixtures enter the demo here, never through the spec. */
  initialState?: Record<string, unknown>;
  /**
   * Handlers for the catalog actions the spec binds, given the demo's store
   * and whether the demo is still on the page. A handler that changes state
   * later (on a timer) checks `connected` first: a demo's root is not
   * unmounted when its pane goes, so nothing else stops the write.
   */
  handlers?: (store: StateStore, connected: () => boolean) => Record<string, ActionHandler>;
  /** Named functions for `$computed` props. */
  functions?: Record<string, ComputedFunction>;
}

export interface SpecDemoProps {
  spec: Spec;
  registry: ComponentRegistry;
  /** Registry name, written to data-registry for style scoping. */
  registryName: string;
  store: StateStore;
  handlers?: Record<string, ActionHandler>;
  functions?: Record<string, ComputedFunction>;
}

// A type the registry has no mapping for: the library cannot render this part
// of the demo. Said in the demo rather than hidden.
const Unsupported: ComponentRenderer = ({ element }) => (
  <p className="spec-demo__unsupported" role="note">
    This library has no <code>{element.type}</code>.
  </p>
);

export function SpecDemo({ spec, registry, registryName, store, handlers, functions }: SpecDemoProps) {
  // Unsettled while a render through a new registry mounts, so that controls
  // with `focusOnShow` (registries/focus-on-show.ts) take focus only when they
  // appear later. Children's layout effects run before this effect.
  const settled = useRef(false);
  const renderedWith = useRef(registry);
  if (renderedWith.current !== registry) {
    renderedWith.current = registry;
    settled.current = false;
  }
  useEffect(() => {
    settled.current = true;
  });

  return (
    // Focusable from script only: a dialog whose opener it removed hands focus
    // back here (registries/dialog-focus.ts), and so does a focused Button
    // that disappears with nowhere named to go (registries/focus-handoff.ts).
    <div data-registry={registryName} tabIndex={-1}>
      <DemoSettled value={settled}>
        <JSONUIProvider registry={registry} store={store} handlers={handlers} functions={functions}>
          <Renderer spec={spec} registry={registry} fallback={Unsupported} />
        </JSONUIProvider>
      </DemoSettled>
    </div>
  );
}
