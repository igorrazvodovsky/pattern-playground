import productsData from '@shared/data/products.json' with { type: 'json' };
import type { Product } from '@shared/data/types';
import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import { getValueAtPath, resolveEntityTitle } from '@shared/data/bindings';
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

/**
 * The glyph rung on a map: each item reduced to a located dot. Coordinates
 * come from the binding's internal attributes (`lat`, `lng`, `locationLabel`)
 * — data a view needs but never displays. A binding without them yields no
 * locations, which is what "this collection has no map view" looks like.
 */
export function toMapLocations(
  items: BoundEntity[],
  binding: EntityBinding
): MapLocation[] {
  const paths = binding.internalAttributes;
  if (!paths?.lat || !paths?.lng) return [];
  const locations: MapLocation[] = [];
  for (const item of items) {
    const lat = getValueAtPath(item, paths.lat);
    const lng = getValueAtPath(item, paths.lng);
    if (typeof lat !== 'number' || typeof lng !== 'number') continue;
    locations.push({
      id: item.id,
      name: resolveEntityTitle(item, binding),
      lat,
      lng,
      description: paths.locationLabel
        ? String(getValueAtPath(item, paths.locationLabel) ?? '')
        : undefined,
    });
  }
  return locations;
}

/** A point that remembers which item it stands for. */
export interface ItemPlotPoint extends ScatterPlotDataPoint {
  id: string;
}

/** The glyph rung on a plot: two numeric attributes carried on position.
    Points are labelled by the binding's title role and coloured by its first
    badge-role attribute — the same categorical the board lanes on. */
export function toPlotPoints(
  items: BoundEntity[],
  binding: EntityBinding,
  xPath: AttributePath,
  yPath: AttributePath
): ItemPlotPoint[] {
  const categoryAttribute = binding.attributes.find(
    (attribute) => attribute.role === 'badge'
  );
  const points: ItemPlotPoint[] = [];
  for (const item of items) {
    const x = getAttributeValue(item, xPath);
    const y = getAttributeValue(item, yPath);
    if (typeof x !== 'number' || typeof y !== 'number') continue;
    points.push({
      id: item.id,
      x,
      y,
      label: resolveEntityTitle(item, binding),
      category: categoryAttribute
        ? String(getValueAtPath(item, categoryAttribute.path) ?? '')
        : undefined,
    });
  }
  return points;
}
