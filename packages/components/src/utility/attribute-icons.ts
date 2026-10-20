import type { AttributeIcon } from '@shared/data/bindings';

// Bindings name an attribute's icon by meaning; this maps it to the library's glyph.

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

export const attributeGlyph = (icon: AttributeIcon | undefined): string | undefined =>
  icon ? attributeGlyphs[icon] : undefined;
