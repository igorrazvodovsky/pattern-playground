/**
 * D3.js Chart Components
 *
 * A comprehensive chart library built on D3.js and Lit Web Components
 * following the design system patterns and progressive enhancement principles.
 *
 * Phase 1 Implementation includes:
 * - Base D3 component abstractions
 * - TypeScript interfaces for chart data
 * - Data converters and validation
 * - Interaction layers framework
 * - Chart primitive components (axis, legend, tooltip, grid)
 * - CSS styling framework with custom properties
 *
 * Phase 2 Implementation includes:
 * - Bar chart renderer and component
 * - Real-time data update capabilities
 * - Responsive design and accessibility features
 *
 * Usage:
 * ```typescript
 * import { ChartComponent, BarChartData } from './src/components/charts';
 * import './src/components/charts/bar-chart.js';
 *
 * // Additional chart components will be available in future phases:
 * // import './src/components/charts/line-chart.js';
 * ```
 */

// Base components and utilities
export * from './base/index.js';

// Chart primitive components
export * from './primitives/index.js';

// Renderers (Phase 2+)
export * from './renderers/index.js';

// Chart components (Phase 2+)
export * from './bar-chart.js';
// export * from './line-chart.js';
// export * from './area-chart.js';
// export * from './tree-diagram.js';

/**
 * Initialize the chart library
 * This function can be called to ensure all components are registered
 */
export function initializeCharts() {
  // Import and register chart primitives
  import('./primitives/index.js').then(({ registerChartPrimitives }) => {
    registerChartPrimitives();
  });

  // Register chart components (Phase 2+)
  import('./bar-chart.js');
  // import('./line-chart.js');
  // import('./area-chart.js');
  // import('./tree-diagram.js');
}

/**
 * Chart library metadata
 */
export const CHART_LIBRARY_INFO = {
  name: 'Pattern Playground Charts',
  version: '0.2.0',
  phase: 2,
  description: 'D3.js chart components for the Pattern Playground design system',
  features: {
    phase1: [
      'Base D3 component abstractions',
      'TypeScript interfaces and type guards',
      'Data converters and validation',
      'Interaction layers framework',
      'Chart primitives (axis, legend, tooltip, grid)',
      'CSS styling framework'
    ],
    phase2: [
      'Bar chart renderer and component',
      'Real-time data update capabilities',
      'Responsive design and accessibility features',
      'Template-based composition with chart primitives'
    ],
    planned: [
      'Line chart implementation (Phase 3)',
      'Area chart implementation (Phase 3)',
      'Tree diagram implementation (Phase 3)',
      'Advanced interactions (Phase 4)',
      'Animation and transitions (Phase 4)',
      'Export capabilities (Phase 4)'
    ]
  }
} as const;