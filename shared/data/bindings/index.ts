import type { EntityBinding } from './types';
import { componentBinding } from './component';
import { materialBinding } from './material';
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
  AttributeIcon,
} from './types';

export { attributeIcons } from './types';

export {
  getValueAtPath,
  deriveAttributeLabel,
  attributeLabel,
  attributeLabelFromBinding,
  findAttribute,
  resolveAttributeSelection,
  IDENTITY_ROLES,
  isNumericValueType,
  formatBoundValue,
  resolveEntityTitle,
} from './access';

export type { ItemLayout, LaidOutBadge, LaidOutPair, LaidOutText } from './layout';

export { layoutByRole } from './layout';

export type { AttributeFilter, FilterOperator } from './filtering';

export {
  filterOperatorsFor,
  defaultFilterOperator,
  resolveDatePhrase,
  matchesFilter,
  applyFilters,
} from './filtering';

export {
  componentBinding,
  materialBinding,
  productBinding,
  projectBinding,
  taskBinding,
  quoteBinding,
  referenceBinding,
  userBinding,
};

/** Every entity binding, keyed by entity type. */
export const bindings: Record<string, EntityBinding> = {
  component: componentBinding,
  material: materialBinding,
  product: productBinding,
  project: projectBinding,
  task: taskBinding,
  quote: quoteBinding,
  reference: referenceBinding,
  user: userBinding,
};
