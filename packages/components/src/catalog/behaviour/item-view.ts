import {
  bindings,
  layoutByRole,
  resolveAttributeSelection,
  type AttributeSelection,
  type ItemLayout,
  type ItemScope,
} from '@shared/data/bindings';

// What both registries show for an ItemView. The host names the item, so
// above micro the title is left out of the selection, and with it the
// thumbnail that only shows beside the title.
export const specItemSelection = (
  type: string,
  scope: ItemScope,
  shownAttributes: AttributeSelection | null | undefined,
): AttributeSelection | undefined => {
  if (!Object.hasOwn(bindings, type)) return undefined;
  const binding = bindings[type];
  const chosen = shownAttributes ?? binding.scopes[scope];
  if (scope === 'micro') return chosen;
  return resolveAttributeSelection(binding, chosen)
    .filter((attribute) => attribute.role !== 'title')
    .map((attribute) => attribute.path);
};

export const specItemLayout = (
  type: string,
  item: object | null | undefined,
  scope: ItemScope,
  shownAttributes: AttributeSelection | null | undefined,
): ItemLayout | null => {
  // A spec can name the item before it arrives, such as a detail whose item
  // is picked later; nothing renders until both are there.
  if (!item || !Object.hasOwn(bindings, type)) return null;
  return layoutByRole(bindings[type], scope, item, specItemSelection(type, scope, shownAttributes));
};
