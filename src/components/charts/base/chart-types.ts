/**
 * TypeScript interfaces for chart data structures
 * 
 * These interfaces define the public API contracts for each chart type,
 * ensuring type safety across renderers and components.
 */

/**
 * Base interface for all chart data points
 */
export interface ChartDataPoint {
  [key: string]: unknown;
}

/**
 * Line chart data structure
 */
export interface LineChartDataPoint extends ChartDataPoint {
  x: number | string | Date;
  y: number;
}

export interface LineChartSeries {
  name: string;
  data: LineChartDataPoint[];
  color?: string;
  strokeWidth?: number;
  curve?: 'linear' | 'smooth' | 'step';
}

export interface LineChartData {
  series: LineChartSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Bar chart data structure
 */
export interface BarChartDataPoint extends ChartDataPoint {
  category: string;
  value: number;
  color?: string;
}

export interface BarChartData {
  data: BarChartDataPoint[];
  orientation?: 'vertical' | 'horizontal';
  grouped?: boolean;
  stacked?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Area chart data structure
 */
export interface AreaChartDataPoint extends ChartDataPoint {
  x: number | string | Date;
  y: number;
  y0?: number; // For stacked areas
}

export interface AreaChartSeries {
  name: string;
  data: AreaChartDataPoint[];
  color?: string;
  fillOpacity?: number;
}

export interface AreaChartData {
  series: AreaChartSeries[];
  stacked?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

/**
 * Tree diagram data structure
 */
export interface TreeNode extends ChartDataPoint {
  id: string;
  name: string;
  value?: number;
  children?: TreeNode[];
  parent?: TreeNode;
  color?: string;
  size?: number;
}

export interface TreeData {
  root: TreeNode;
  layout?: 'tree' | 'cluster';
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Common chart configuration options
 */
export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: ChartMargin;
}

/**
 * Axis configuration
 */
export interface AxisConfig {
  show?: boolean;
  label?: string;
  tickCount?: number;
  tickFormat?: string;
  grid?: boolean;
}

/**
 * Legend configuration
 */
export interface LegendConfig {
  show?: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  show?: boolean;
  format?: (data: ChartDataPoint) => string;
  template?: string;
}

/**
 * Common chart configuration
 */
export interface ChartConfig {
  dimensions?: Partial<ChartDimensions>;
  xAxis?: AxisConfig;
  yAxis?: AxisConfig;
  legend?: LegendConfig;
  tooltip?: TooltipConfig;
  theme?: 'light' | 'dark' | 'auto';
  animate?: boolean;
  responsive?: boolean;
}

/**
 * Type guards for runtime type checking
 */
export function isLineChartData(data: unknown): data is LineChartData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'series' in data &&
    Array.isArray((data as LineChartData).series)
  );
}

export function isBarChartData(data: unknown): data is BarChartData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    Array.isArray((data as BarChartData).data)
  );
}

export function isAreaChartData(data: unknown): data is AreaChartData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'series' in data &&
    Array.isArray((data as AreaChartData).series)
  );
}

export function isTreeData(data: unknown): data is TreeData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'root' in data &&
    typeof (data as TreeData).root === 'object'
  );
}