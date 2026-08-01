// JSX type definitions for web components.
// The only home for React JSX augmentation: React 19 resolves JSX from the
// react module, so `declare global { namespace JSX }` blocks are ignored —
// augment here via `declare module 'react'` instead.

import type { MapComponent } from './components/map/map.js';
import type { Choropleth } from './components/charts/choropleth.js';
import type { BarChart } from './components/charts/bar-chart.js';
import type { ScatterPlot } from './components/charts/scatter-plot.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      /* Rung-2 field box: compose a native <input> (and data-slot adornments) inside */
      'pp-input': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
        clearable?: boolean;
      };
      'pp-range': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string;
        value?: number | string;
        min?: number | string;
        max?: number | string;
        step?: number | string;
        disabled?: boolean;
        size?: 'small' | 'medium' | 'large';
        label?: string;
        labelledby?: string;
        describedby?: string;
        marks?: boolean;
        'hide-value'?: boolean;
        'value-text'?: string;
      };
      /* Rung-2 field box: compose a native <select> (and data-slot hint/error) inside */
      'pp-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        invalid?: boolean;
        size?: 'small' | 'medium' | 'large';
      };
      /* CSS-only styled tag (no custom element definition) — sizes with font-size */
      'pp-spinner': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-avatar': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        size?: 'small' | 'medium' | 'large';
      };
      'pp-table': React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
      'pp-timestamp': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        /** ISO 8601. `isoDateTime` from `@shared/format` for a `Date`. */
        value?: string;
        locale?: string;
      };
      'pp-tab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        panel?: string | number;
        active?: boolean;
        disabled?: boolean;
      };
      'pp-tab-panel': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        name?: string | number;
        active?: boolean;
      };
      'pp-tab-group': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        activation?: 'auto' | 'manual';
        'no-scroll-controls'?: boolean;
      };
      'pp-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        multiselectable?: boolean;
      };
      'pp-list-label': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'checkbox' | 'radio' | string;
        disabled?: boolean;
        defaultChecked?: boolean;
        checked?: boolean;
        value?: string;
        onClick?: () => void;
      };
      'pp-dropdown': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
        open?: boolean;
        disabled?: boolean;
        placement?: string;
        hoist?: boolean;
        'stay-open-on-select'?: boolean;
        'onPp-show'?: () => void;
        'onPp-hide'?: () => void;
      };
      'pp-popup': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: React.Ref<HTMLElement>;
        /** Element, element id, or Floating UI VirtualElement. */
        anchor?: Element | string | { getBoundingClientRect: () => DOMRect };
        active?: boolean;
        open?: boolean;
        placement?: string;
        strategy?: 'absolute' | 'fixed';
        distance?: number;
        skidding?: number;
        flip?: boolean;
        shift?: boolean;
        sync?: 'width' | 'height' | 'both';
        'auto-size'?: 'horizontal' | 'vertical' | 'both';
        /** Promote into the browser's top layer (native popover). */
        'top-layer'?: string;
        /** With `top-layer`: outside click and Escape close it, then `pp-hide` fires. */
        'light-dismiss'?: string;
      };
      'pp-p-plus': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-breadcrumbs': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        role?: string;
      };
      'pp-tooltip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        content?: string;
        placement?: string;
        disabled?: boolean;
      };
      'pp-toast': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'success' | 'error' | 'warning' | 'info';
        duration?: number;
        closable?: boolean;
      };
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        width?: string | number;
        height?: string | number;
        slot?: string;
      };
      'pp-h': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'pp-sections': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        affordance?: 'tab-bar' | 'details';
      };
      'pp-map': React.DetailedHTMLProps<React.HTMLAttributes<MapComponent>, MapComponent>;
      'pp-choropleth': React.DetailedHTMLProps<React.HTMLAttributes<Choropleth>, Choropleth>;
      'pp-bar-chart': React.DetailedHTMLProps<React.HTMLAttributes<BarChart>, BarChart>;
      'pp-scatter-plot': React.DetailedHTMLProps<React.HTMLAttributes<ScatterPlot>, ScatterPlot>;
    }
  }
}

export {};