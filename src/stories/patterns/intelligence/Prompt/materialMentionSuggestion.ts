import { createReferenceSuggestion } from '../../../../services/reference-suggestion-service';
import rawMaterials from './mockMaterials.json' with { type: 'json' };

// Transform raw JSON data to include Date objects
const materials = rawMaterials.map(item => ({
  ...item,
  lastModified: new Date(item.lastModified)
}));

const filterMaterials = (query: string) => {
  if (!query) return materials.slice(0, 8);

  const lowerQuery = query.toLowerCase();

  return materials
    .map(material => {
      let score = 0;

      // Name matching (highest priority)
      if (material.name.toLowerCase().includes(lowerQuery)) {
        score += material.name.toLowerCase().startsWith(lowerQuery) ? 100 : 50;
      }

      // Type matching
      if (material.type.toLowerCase().includes(lowerQuery)) {
        score += 30;
      }

      // Description matching
      if (material.description?.toLowerCase().includes(lowerQuery)) {
        score += 20;
      }

      // Tags matching
      if (material.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        score += 15;
      }

      return { material, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ material }) => material)
    .slice(0, 8);
};

export const materialMentionSuggestion = createReferenceSuggestion({
  items: ({ query }: { query: string }) => filterMaterials(query),
  renderItem: (item, listItem) => {
    listItem.className = 'material-mention-item';
    listItem.innerHTML = `
      <iconify-icon icon="${item.icon}" slot="prefix"></iconify-icon>
      ${item.name}
    `;
  },
  onCommand: (item) => ({
    id: item.id,
    label: item.name,
    type: item.type,
    icon: item.icon
  }),
  referenceType: 'material',
  ariaLabel: 'Material suggestions',
  enableKeyboardNavigation: true
});