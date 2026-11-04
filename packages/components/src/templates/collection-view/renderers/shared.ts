import type { AttributeBinding, BoundEntity, EntityBinding } from '@shared/data/bindings';
import { IDENTITY_ROLES } from '@shared/data/bindings';
import type { ViewSpec } from '../spec';

export interface ItemCoupling<T extends BoundEntity = BoundEntity> {
  selectedId?: string | null;
  onItemSelect?: (item: T) => void;
  focusedId?: string | null;
  onItemFocus?: (item: T | null) => void;
}

export interface RendererProps<T extends BoundEntity = BoundEntity> extends ItemCoupling<T> {
  items: T[];
  spec: ViewSpec;
  binding: EntityBinding;
}

export const firstOfRole = (
  attributes: AttributeBinding[],
  role: AttributeBinding['role'],
): AttributeBinding | undefined => attributes.find((attribute) => attribute.role === role);

export const isIdentity = (attribute: AttributeBinding): boolean =>
  IDENTITY_ROLES.includes(attribute.role);
