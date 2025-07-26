/**
 * Chart Primitive Components
 * 
 * This module exports all the reusable chart building blocks
 * that can be composed together to create complex chart layouts.
 */

// Chart primitive components
export { PpChartAxis } from './pp-chart-axis.js';
export { PpChartLegend, type LegendItem } from './pp-chart-legend.js';
export { PpChartGrid, type GridConfig } from './pp-chart-grid.js';

// Re-export existing tooltip component for chart use
export { PpTooltip as PpChartTooltip } from '../../tooltip/tooltip.js';

// Component registration helper (for manual registration if needed)
export function registerChartPrimitives() {
  // Components are auto-registered when imported, but this function
  // can be used to ensure all primitives are registered
  if (!customElements.get('pp-chart-axis')) {
    import('./pp-chart-axis.js');
  }
  if (!customElements.get('pp-chart-legend')) {
    import('./pp-chart-legend.js');
  }
  if (!customElements.get('pp-tooltip')) {
    import('../../tooltip/tooltip.js');
  }
  if (!customElements.get('pp-chart-grid')) {
    import('./pp-chart-grid.js');
  }
}