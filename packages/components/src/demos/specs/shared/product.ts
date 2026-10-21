// Product presets for the specs that list items with a few labelled
// attributes. A spec that shows one item reads it through an ItemView.

import {
  attributeLabel,
  formatBoundValue,
  getValueAtPath,
  productBinding,
  resolveAttributeSelection,
  type AttributeBinding,
  type EntityBinding,
} from '@shared/data/bindings';
import type { Product } from '@shared/data/types';
import { toMapLocations } from '../../../templates/collection-view/data';

const read = (item: object, attribute: AttributeBinding) => getValueAtPath(item, attribute.path);
const present = (item: object, attributes: AttributeBinding[]) =>
  attributes.filter((attribute) => read(item, attribute) != null);
const format = (item: object, attribute: AttributeBinding) =>
  formatBoundValue(read(item, attribute), attribute);

export const cardAttributes = (paths: string[], binding: EntityBinding = productBinding) => {
  const selection = resolveAttributeSelection(binding, paths);
  return (item: object) =>
    present(item, selection).map((attribute) => ({
      path: attribute.path,
      label: attributeLabel(attribute),
      value: format(item, attribute),
    }));
};

// What an overview shows of each item beside its name.
export const overviewAttributes = cardAttributes(['category', 'pricing.msrp']);

// What a flag's slice shows of each item it flags.
export const sliceAttributes = cardAttributes(['category', 'pricing.msrp', 'listedAt']);

export const productAttributeLabel = (path: string) =>
  attributeLabel(resolveAttributeSelection(productBinding, [path])[0]);

export const attributeValue = (path: string) => {
  const [attribute] = resolveAttributeSelection(productBinding, [path]);
  return (item: Product) => (read(item, attribute) == null ? '' : format(item, attribute));
};

export const mapLocations = (items: Product[]) =>
  toMapLocations(items, productBinding).map((location) => ({
    id: String(location.id),
    name: location.name,
    lat: location.lat,
    lng: location.lng,
    description: location.description ?? null,
  }));
