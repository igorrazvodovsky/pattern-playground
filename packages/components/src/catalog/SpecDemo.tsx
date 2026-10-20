import { useCallback, useEffect, useRef } from 'react';
import { JSONUIProvider, Renderer, type ComponentRegistry, type ComponentRenderer } from '@json-render/react';
import type { ComputedFunction, Spec, StateStore } from '@json-render/core';
import { directives } from './directives';
import { DemoRoot } from './behaviour/dialog-focus';
import { DemoSettled } from './behaviour/focus-on-show';

// Renders a demo spec (demos/specs/<slug>.json) through one registry. The
// state store is created by the caller and outlives this component, so
// switching registries re-renders the same demo state in another library.

export type ActionHandler = (params: Record<string, unknown>) => unknown;

/** What the module beside a spec contributes: everything a JSON spec cannot carry. */
export interface SpecSetup {
  /** State the spec reads. Fixtures enter the demo here, never through the spec. */
  initialState?: Record<string, unknown>;
  /**
   * Handlers for the catalog actions the spec binds. A handler that changes
   * state later (on a timer) checks `connected` first: handlers live outside
   * the React tree, so unmounting the demo does not stop them.
   */
  handlers?: (store: StateStore, connected: () => boolean) => Record<string, ActionHandler>;
  /** Named functions for `$computed` props. Generic values belong in ./directives. */
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
  // Unsettled while a render through a new registry mounts, so `focusOnShow`
  // controls take focus only when they appear later. Recorded only after a
  // commit, so a render React throws away changes nothing.
  const settledWith = useRef<ComponentRegistry | null>(null);
  useEffect(() => {
    settledWith.current = registry;
  });
  const settled = useCallback(() => settledWith.current === registry, [registry]);
  const root = useRef<HTMLDivElement>(null);

  return (
    // Focusable from script only: a dialog whose opener is gone, or a focused
    // Button that disappears with nowhere to go, hands focus back here.
    <div ref={root} data-registry={registryName} tabIndex={-1}>
      <DemoRoot value={root}>
        <DemoSettled value={settled}>
          <JSONUIProvider registry={registry} store={store} handlers={handlers} functions={functions} directives={directives}>
            <Renderer spec={spec} registry={registry} fallback={Unsupported} />
          </JSONUIProvider>
        </DemoSettled>
      </DemoRoot>
    </div>
  );
}
