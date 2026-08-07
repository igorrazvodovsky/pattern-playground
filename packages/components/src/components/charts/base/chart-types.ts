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
 * Scatter plot data structure
 *
 * Two numeric dimensions carried on position — the strongest channel. Optional
 * `size` promotes a point to a bubble (a third quantitative variable on area),
 * and `category` groups points into series that share a colour.
 */
export interface ScatterPlotDataPoint extends ChartDataPoint {
  x: number;
  y: number;
  label?: string;
  category?: string;
  size?: number;
  color?: string;
}

export interface ScatterPlotData {
  data: ScatterPlotDataPoint[];
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
export interface ChoroplethDataPoint extends ChartDataPoint {
  /** Region key; must match a feature's id (or the `featureKey` property). */
  id: string | number;
  /** Quantity that colours the region. */
  value: number;
  /** Human-readable region name; falls back to the feature name or the id. */
  label?: string;
}

export interface ChoroplethData {
  /** GeoJSON FeatureCollection describing the region boundaries. */
  geometry: GeoJSON.FeatureCollection;
  /** One value per region, joined to geometry by key. */
  values: ChoroplethDataPoint[];
  /**
   * Where to read a region's join key from each feature. `'id'` (default) uses
   * `feature.id`; any other string reads `feature.properties[featureKey]`.
   */
  featureKey?: string;
  /** Label for the quantity, shown in the legend and tooltip. */
  valueLabel?: string;
}

/**
 * Network graph data structure
 *
 * A node-link view of an interlinked collection. Nodes are identified by `id`
 * and drawn as circles sized by how connected they are; edges connect nodes by
 * id. Everything domain-specific rides along declaratively: `category` groups
 * nodes into coloured families, `attrs` stamps extra `data-*` attributes on a
 * node's group for consumer CSS to key off, and `href` marks a node as leading
 * somewhere (the component fires an event; navigation stays with the consumer).
 */
export interface NetworkGraphNode extends ChartDataPoint {
  id: string;
  label: string;
  /** Groups nodes into colour families (categorical palette by default). */
  category?: string;
  /** Where the node leads; presence makes the node announce as a link. */
  href?: string;
  /** Extra `data-*` attributes for the node's group, keyed without the prefix. */
  attrs?: Record<string, string>;
}

export interface NetworkGraphEdge extends ChartDataPoint {
  source: string;
  target: string;
  /** Stamped as `data-edge-type` for consumer CSS. */
  type?: string;
  label?: string;
  /** Set false to draw the edge without letting it pull the layout. */
  layout?: boolean;
}

export interface NetworkGraphData {
  nodes: NetworkGraphNode[];
  edges: NetworkGraphEdge[];
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

export function isScatterPlotData(data: unknown): data is ScatterPlotData {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('data' in data) ||
    !Array.isArray((data as ScatterPlotData).data)
  ) {
    return false;
  }
  // Distinguish from bar chart data (also keyed on `data`) by point shape:
  // scatter points carry numeric x/y, bar points carry category/value.
  const points = (data as ScatterPlotData).data;
  return points.length === 0 || (typeof points[0].x === 'number' && typeof points[0].y === 'number');
}

export function isAreaChartData(data: unknown): data is AreaChartData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'series' in data &&
    Array.isArray((data as AreaChartData).series)
  );
}

export function isChoroplethData(data: unknown): data is ChoroplethData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'geometry' in data &&
    'values' in data &&
    Array.isArray((data as ChoroplethData).values) &&
    typeof (data as ChoroplethData).geometry === 'object' &&
    Array.isArray((data as ChoroplethData).geometry?.features)
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

export function isNetworkGraphData(data: unknown): data is NetworkGraphData {
  if (
    typeof data !== 'object' ||
    data === null ||
    !Array.isArray((data as NetworkGraphData).nodes) ||
    !Array.isArray((data as NetworkGraphData).edges)
  ) {
    return false;
  }
  const nodes = (data as NetworkGraphData).nodes;
  return nodes.length === 0 || (typeof nodes[0]?.id === 'string' && typeof nodes[0]?.label === 'string');
}