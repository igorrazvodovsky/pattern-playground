/**
 * Choropleth Web Component
 *
 * An Elena host that shades geographic regions by a quantity — the spatial
 * branch of the chart territory, the geographic sibling of the bar chart. It is
 * geometry-agnostic: give it any GeoJSON FeatureCollection plus one value per
 * region and it projects, colours, and makes the regions interactive.
 *
 * Rendering stays inside the shared 600×300 viewBox that {@link D3Component}
 * sets up, so the projection is fit to the viewBox — not to pixel size — which
 * keeps it aligned with the rest of the chart family.
 *
 * @example
 * ```html
 * <pp-choropleth projection="naturalEarth" show-legend></pp-choropleth>
 * ```
 */

import { select } from 'd3-selection';
import { scaleQuantize } from 'd3-scale';
import { extent } from 'd3-array';
import {
  geoPath,
  geoNaturalEarth1,
  geoMercator,
  geoEquirectangular,
  geoEqualEarth,
  type GeoProjection,
} from 'd3-geo';
import { ChartComponent } from './base/chart-component.js';
import type { ElenaProp } from './base/d3-component.js';
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT } from './base/d3-component.js';
import type { ChoroplethData, ChoroplethDataPoint } from './base/chart-types.js';
import { isChoroplethData } from './base/chart-types.js';

/** Named projections, mapped to their d3-geo constructors. */
const PROJECTIONS = {
  naturalEarth: geoNaturalEarth1,
  equalEarth: geoEqualEarth,
  equirectangular: geoEquirectangular,
  mercator: geoMercator,
} as const;

export type MapProjectionName = keyof typeof PROJECTIONS;

/**
 * Sequential colour ramp expressed as design-token references. d3 cannot
 * interpolate `var(--…)` strings, so the choropleth uses discrete bins
 * (`scaleQuantize`) sampled from this ramp — which reads more clearly as a
 * choropleth anyway.
 */
const ACCENT_RAMP = [
  'var(--c-accent-100)',
  'var(--c-accent-200)',
  'var(--c-accent-300)',
  'var(--c-accent-400)',
  'var(--c-accent-500)',
  'var(--c-accent-600)',
  'var(--c-accent-700)',
  'var(--c-accent-800)',
  'var(--c-accent-900)',
] as const;

const NO_DATA_FILL = 'var(--c-neutral-100)';

export class Choropleth extends ChartComponent {
  static tagName = 'pp-choropleth';

  static props: ElenaProp[] = [
    ...ChartComponent.props,
    'projection',
    'color-steps',
    'show-legend',
  ];

  data: ChoroplethData = { geometry: { type: 'FeatureCollection', features: [] }, values: [] };
  projection: MapProjectionName = 'naturalEarth';
  'color-steps' = 5;
  'show-legend' = false;

  /** A choropleth has generous margins by default so coastlines aren't clipped. */
  margin = { top: 8, right: 8, bottom: 8, left: 8 };

  /** Index into `data.values` for keyboard navigation. */
  private focusIndex = 0;

  connectedCallback() {
    super.connectedCallback();
    if (document.readyState !== 'loading') {
      this.initMap();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.initMap());
  }

  private initMap() {
    this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'img');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', this.title || 'Choropleth');
    }
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
  }

  protected validateData(): boolean {
    return isChoroplethData(this.data) && this.data.geometry.features.length > 0;
  }

  /** Scales are built inline in renderChart; nothing to precompute here. */
  protected setupScales(): void {}

  /** Read a region's join key from a feature (`id` by default). */
  private featureKeyOf(feature: GeoJSON.Feature): string | undefined {
    const key = this.data.featureKey ?? 'id';
    const raw = key === 'id' ? feature.id : feature.properties?.[key];
    return raw == null ? undefined : String(raw);
  }

  /** The colour range: `color-steps` swatches sampled evenly from the accent ramp. */
  private colorRange(): string[] {
    const steps = Math.max(2, Math.min(this['color-steps'], ACCENT_RAMP.length));
    return Array.from({ length: steps }, (_, i) => {
      const t = steps === 1 ? 0 : i / (steps - 1);
      return ACCENT_RAMP[Math.round(t * (ACCENT_RAMP.length - 1))];
    });
  }

  protected renderChart(): void {
    if (!this.contentGroup || !this.validateData()) return;

    const { geometry, values } = this.data;

    // Join values to regions by key.
    const valueByKey = new Map<string, ChoroplethDataPoint>();
    for (const v of values) valueByKey.set(String(v.id), v);

    // Fit the projection to the viewBox, not to pixel size — the content group
    // is already translated by the margins, so we fit the inner extent.
    const innerWidth = VIEWBOX_WIDTH - this.margin.left - this.margin.right;
    const innerHeight = VIEWBOX_HEIGHT - this.margin.top - this.margin.bottom;
    const projection: GeoProjection = PROJECTIONS[this.projection]()
      .fitSize([innerWidth, innerHeight], geometry);
    const path = geoPath(projection);

    // Colour scale over the value domain.
    const [min, max] = extent(values, (d) => d.value) as [number, number];
    const range = this.colorRange();
    const color = scaleQuantize<string>()
      .domain([min ?? 0, max ?? 1])
      .range(range);

    const container = select(this.contentGroup);
    container.selectAll('*').remove();

    // Regions.
    const regions = container
      .append('g')
      .attr('class', 'map-regions')
      .selectAll<SVGPathElement, GeoJSON.Feature>('path')
      .data(geometry.features)
      .join('path')
      .attr('class', 'map-region')
      .attr('d', (f) => path(f) ?? '')
      .attr('fill', (f) => {
        const key = this.featureKeyOf(f);
        const datum = key != null ? valueByKey.get(key) : undefined;
        return datum ? color(datum.value) : NO_DATA_FILL;
      })
      .attr('stroke', 'var(--c-background)')
      .attr('stroke-width', 0.5);

    // Native browser tooltip per region — works on hover with no extra markup.
    regions.append('title').text((f) => this.regionTooltip(f));

    // Interactions dispatch typed events for consumers.
    regions
      .on('mouseenter', (event: MouseEvent, f) => this.emitForFeature('pp-choropleth-hover', f, event))
      .on('mouseleave', () => this.dispatchEvent(
        new CustomEvent('pp-choropleth-hover-end', { bubbles: true, composed: true }),
      ))
      .on('click', (event: MouseEvent, f) => this.emitForFeature('pp-choropleth-click', f, event));

    if (this['show-legend']) this.renderLegend(container, range, min, max);

    // Accessibility: title + aria summary.
    const regionCount = values.length;
    this.setChartLabel(this.title || `Choropleth with ${regionCount} region${regionCount === 1 ? '' : 's'}`);
    this.syncDataTable(values.map((item) => [this.regionLabel(item), item.value]), 'Map data');
  }

  private datumForFeature(feature: GeoJSON.Feature): ChoroplethDataPoint | undefined {
    const key = this.featureKeyOf(feature);
    if (key == null) return undefined;
    return this.data.values.find((v) => String(v.id) === key);
  }

  private regionLabel(datum: ChoroplethDataPoint): string {
    if (datum.label) return datum.label;
    const feature = this.data.geometry.features.find(
      (f) => this.featureKeyOf(f) === String(datum.id),
    );
    const name = feature?.properties?.name;
    return typeof name === 'string' ? name : String(datum.id);
  }

  /** Tooltip text for any region — value if it has data, otherwise just its name. */
  private regionTooltip(feature: GeoJSON.Feature): string {
    const datum = this.datumForFeature(feature);
    if (datum) {
      const unit = this.data.valueLabel ? ` ${this.data.valueLabel}` : '';
      return `${this.regionLabel(datum)}: ${datum.value}${unit}`;
    }
    const name = feature.properties?.name;
    return typeof name === 'string' ? name : '';
  }

  private emitForFeature(name: string, feature: GeoJSON.Feature, originalEvent: Event): void {
    const datum = this.datumForFeature(feature);
    if (datum) this.emitRegionEvent(name, datum, originalEvent);
  }

  private emitRegionEvent(name: string, data: ChoroplethDataPoint, originalEvent: Event): void {
    this.dispatchEvent(new CustomEvent(name, {
      detail: { data, originalEvent },
      bubbles: true,
      composed: true,
    }));
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (!this.validateData()) return;
    const values = this.data.values;
    if (values.length === 0) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusRegion(Math.min(this.focusIndex + 1, values.length - 1));
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusRegion(Math.max(this.focusIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        this.focusRegion(0);
        break;
      case 'End':
        event.preventDefault();
        this.focusRegion(values.length - 1);
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const datum = values[this.focusIndex];
        if (datum) this.emitRegionEvent('pp-choropleth-click', datum, event);
        break;
      }
    }
  };

  private focusRegion(index: number): void {
    const values = this.data.values;
    if (index < 0 || index >= values.length) return;
    this.focusIndex = index;
    const datum = values[index];
    const unit = this.data.valueLabel ? ` ${this.data.valueLabel}` : '';
    const summary = `${this.regionLabel(datum)}: ${datum.value}${unit}`;
    this.setAttribute('aria-live', 'polite');
    this.setAttribute('aria-label', `Map. Current: ${summary}. Use arrow keys to navigate.`);
    this.emitRegionEvent('pp-choropleth-focus', datum, new Event('focus'));
  }

  private renderLegend(
    container: ReturnType<typeof select<SVGGElement, unknown>>,
    range: string[],
    min: number,
    max: number,
  ): void {
    const swatch = 14;
    const legendHeight = 10;
    const legendWidth = range.length * swatch;
    const x = 0;
    const y = VIEWBOX_HEIGHT - this.margin.top - this.margin.bottom - legendHeight;

    const legend = container.append('g').attr('class', 'map-legend').attr('transform', `translate(${x}, ${y})`);

    legend
      .selectAll('rect')
      .data(range)
      .join('rect')
      .attr('x', (_, i) => i * swatch)
      .attr('width', swatch)
      .attr('height', legendHeight)
      .attr('fill', (d) => d);

    const format = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
    legend
      .append('text')
      .attr('class', 'map-legend-label')
      .attr('x', -4)
      .attr('y', legendHeight / 2)
      .attr('text-anchor', 'end')
      .attr('dominant-baseline', 'middle')
      .text(format(min ?? 0));
    legend
      .append('text')
      .attr('class', 'map-legend-label')
      .attr('x', legendWidth + 4)
      .attr('y', legendHeight / 2)
      .attr('dominant-baseline', 'middle')
      .text(format(max ?? 0));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-choropleth': Choropleth;
  }
}
