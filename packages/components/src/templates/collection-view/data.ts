import productsData from '@shared/data/products.json' with { type: 'json' };
import type { Product } from '@shared/data/types';
import type { MapLocation } from '../../components/map/map.js';
import type { ScatterPlotDataPoint } from '../../components/charts/base/chart-types';
import { getAttributeValue } from './AttributeUtils';
import type { AttributePath } from './spec';

/**
 * The canonical collection the template and every view-family demo draw
 * from: one model, many framings. The reader should recognise the same
 * products reframed as they move between pattern pages.
 */
export const products = productsData as unknown as Product[];

export function findProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

/** The glyph rung on a map: each item reduced to a located dot. */
export function toMapLocations(items: Product[]): MapLocation[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    lat: item.metadata.location.lat,
    lng: item.metadata.location.lng,
    description: item.metadata.location.site,
  }));
}

/** A point that remembers which item it stands for. */
export interface ProductPlotPoint extends ScatterPlotDataPoint {
  id: string;
}

/** The glyph rung on a plot: two numeric attributes carried on position. */
export function toPlotPoints(
  items: Product[],
  xPath: AttributePath,
  yPath: AttributePath
): ProductPlotPoint[] {
  const points: ProductPlotPoint[] = [];
  for (const item of items) {
    const x = getAttributeValue(item, xPath);
    const y = getAttributeValue(item, yPath);
    if (typeof x !== 'number' || typeof y !== 'number') continue;
    points.push({
      id: item.id,
      x,
      y,
      label: item.name,
      category: item.metadata.category,
    });
  }
  return points;
}
