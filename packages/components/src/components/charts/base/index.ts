/**
 * Chart Base Components and Utilities
 * This module exports all the foundational components and utilities
 * needed to build D3.js chart components within the design system.
 */

// Base component classes
export { D3Component } from './d3-component.js';
export { ChartComponent } from './chart-component.js';

// Type definitions and interfaces
export type {
  ChartDataPoint,
  LineChartData,
  LineChartDataPoint,
  LineChartSeries,
  BarChartData,
  BarChartDataPoint,
  ScatterPlotData,
  ScatterPlotDataPoint,
  AreaChartData,
  AreaChartDataPoint,
  AreaChartSeries,
  TreeData,
  TreeNode,
  ChartMargin,
  ChartDimensions,
  AxisConfig,
  LegendConfig,
  TooltipConfig,
  ChartConfig
} from './chart-types.js';

// Type guards
export {
  isLineChartData,
  isBarChartData,
  isScatterPlotData,
  isAreaChartData,
  isTreeData
} from './chart-types.js';

// Data conversion utilities
export {
  isChartDataPoint,
  parseChartData,
  convertToLineChartData,
  convertToBarChartData,
  convertToScatterPlotData,
  convertToAreaChartData,
  convertToTreeData,
  validateChartData,
  mergeChartData,
  transformBarChartData,
  getDataExtent,
  getCategories
} from './data-converters.js';

// Interaction layer system
export type {
  ChartInteraction,
  InteractionConfig,
  HoverConfig,
  ClickConfig,
  ZoomConfig,
  BrushConfig,
  ChartInteractionEvent
} from './interaction-layers.js';

export {
  HoverInteraction,
  ClickInteraction,
  InteractionLayer,
  createStandardInteractions,
  createChartInteractionLayer
} from './interaction-layers.js';