import { referenceCategories } from './index';

// Material category for rich text editors - documents only
// Pure data export - no TipTap dependency
export const materialCategory = {
  id: 'documents',
  name: 'Documents',
  children: referenceCategories.find(cat => cat.id === 'documents')?.children || []
};
