import { JSONUIProvider, Renderer, type ComponentRegistry, type ComponentRenderer } from '@json-render/react';
import type { ComputedFunction, Spec, StateStore } from '@json-render/core';

// Renders a demo spec (demos/specs/<slug>.json) through one registry. The
// state store is created by the caller and outlives this component, so
// switching registries re-renders the same demo state in another library.

export type ActionHandler = (params: Record<string, unknown>) => unknown;

/** What the module beside a spec contributes: everything a JSON spec cannot carry. */
export interface SpecSetup {
  /** State the spec reads. Fixtures enter the demo here, never through the spec. */
  initialState?: Record<string, unknown>;
  /** Handlers for the catalog actions the spec binds, given the demo's store. */
  handlers?: (store: StateStore) => Record<string, ActionHandler>;
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
  return (
    <div data-registry={registryName}>
      <JSONUIProvider registry={registry} store={store} handlers={handlers} functions={functions}>
        <Renderer spec={spec} registry={registry} fallback={Unsupported} />
      </JSONUIProvider>
    </div>
  );
}
