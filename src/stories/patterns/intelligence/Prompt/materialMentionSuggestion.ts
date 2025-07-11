import { createReferenceSuggestion } from '../../../../components/reference-picker/Reference';
import rawMaterials from './mockMaterials.json' with { type: 'json' };
import type { ReferenceCategory } from '../../../../components/reference-picker/reference-picker-types';

// Transform raw JSON data to reference category format
const materialCategory: ReferenceCategory = {
  id: 'materials',
  name: 'Materials',
  type: 'document',
  icon: 'ph:files-fill',
  description: 'Available materials and documents',
  searchableText: 'materials documents files',
  children: rawMaterials.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type as any,
    icon: item.icon,
    description: item.description,
    searchableText: `${item.name} ${item.type} ${item.description} ${item.tags?.join(' ') || ''}`,
    metadata: {
      lastModified: item.lastModified,
      tags: item.tags,
      url: item.url
    }
  }))
};

export const materialMentionSuggestion = createReferenceSuggestion([materialCategory], (reference) => {
  console.log('Material reference selected:', reference);
});