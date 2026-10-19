import type { AttributeIcon } from '@shared/data/bindings';

// The library's glyph for each icon a binding gives its attributes. Bindings
// name the meaning (shared/data/bindings/types.ts); the library's components
// show it through this table, so a binding never names a glyph from one icon
// set. The pp registry of the switchable demos draws from the same table.

export const attributeGlyphs: Record<AttributeIcon, string> = {
  assignee: 'ph:user',
  availability: 'ph:circle',
  category: 'ph:tag',
  certifications: 'ph:certificate',
  channels: 'ph:storefront',
  created: 'ph:calendar-plus',
  due: 'ph:calendar',
  labels: 'ph:tag',
  price: 'ph:currency-dollar',
  priority: 'ph:cell-signal-high',
  regions: 'ph:globe',
  repairability: 'ph:wrench',
  status: 'ph:circle-dashed',
  updated: 'ph:calendar-check',
  upgradeability: 'ph:arrow-up',
};

/** The glyph for an attribute's icon, or undefined when it has none. */
export const attributeGlyph = (icon: AttributeIcon | undefined): string | undefined =>
  icon ? attributeGlyphs[icon] : undefined;
