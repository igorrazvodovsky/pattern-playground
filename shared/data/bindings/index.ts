import type { EntityBinding } from './types';
import { productBinding } from './product';
import { projectBinding } from './project';
import { taskBinding } from './task';
import { quoteBinding } from './quote';
import { referenceBinding } from './reference';
import { userBinding } from './user';

export type {
  ItemScope,
  AttributeRole,
  AttributeValueType,
  AttributeBinding,
  AttributeSelection,
  BoundEntity,
  EntityBinding,
} from './types';

export {
  getValueAtPath,
  deriveAttributeLabel,
  attributeLabelFromBinding,
  findAttribute,
  resolveAttributeSelection,
  IDENTITY_ROLES,
  isNumericValueType,
  formatBoundValue,
  resolveEntityTitle,
} from './access';

export {
  productBinding,
  projectBinding,
  taskBinding,
  quoteBinding,
  referenceBinding,
  userBinding,
};

/** Every entity binding, keyed by entity type. */
export const bindings: Record<string, EntityBinding> = {
  product: productBinding,
  project: projectBinding,
  task: taskBinding,
  quote: quoteBinding,
  reference: referenceBinding,
  user: userBinding,
};
