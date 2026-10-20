import type { AttributeIcon } from '@shared/data/bindings';

// Bindings name an attribute's icon by meaning; this maps it to the library's glyph.

export const attributeGlyphs: Record<AttributeIcon, string> = {
  assignee: 'ik:user',
  availability: 'ik:circle',
  category: 'ik:tag',
  certifications: 'ik:verified',
  channels: 'ik:shop',
  created: 'ik:calendar-add',
  due: 'ik:calendar',
  labels: 'ik:tag',
  price: 'ik:dollar',
  priority: 'ik:signal-3',
  regions: 'ik:globe',
  repairability: 'ik:wrench',
  status: 'ik:circle-dotted',
  updated: 'ik:calendar-available',
  upgradeability: 'ik:arrow-up',
};

export const attributeGlyph = (icon: AttributeIcon | undefined): string | undefined =>
  icon ? attributeGlyphs[icon] : undefined;
