/**
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
 * Map (choropleth) data structure
 *
 * Geometry-agnostic: the component draws whatever GeoJSON regions it is given
 * and joins them to values by a shared key. Supply `geometry` (a GeoJSON
 * FeatureCollection) and `values` (one datum per region). The join key is read
 * from each feature's `id` by default, or from a properties path via `featureKey`.
 */
export interface MapChartDataPoint extends ChartDataPoint {
  /** Region key; must match a feature's id (or the `featureKey` property). */
  id: string | number;
  /** Quantity that colours the region. */
  value: number;
  /** Human-readable region name; falls back to the feature name or the id. */
  label?: string;
}

export interface MapChartData {
  /** GeoJSON FeatureCollection describing the region boundaries. */
  geometry: GeoJSON.FeatureCollection;
  /** One value per region, joined to geometry by key. */
  values: MapChartDataPoint[];
  /**
   * Where to read a region's join key from each feature. `'id'` (default) uses
   * `feature.id`; any other string reads `feature.properties[featureKey]`.
   */
  featureKey?: string;
  /** Label for the quantity, shown in the legend and tooltip. */
  valueLabel?: string;
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

export function isMapChartData(data: unknown): data is MapChartData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'geometry' in data &&
    'values' in data &&
    Array.isArray((data as MapChartData).values) &&
    typeof (data as MapChartData).geometry === 'object' &&
    Array.isArray((data as MapChartData).geometry?.features)
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