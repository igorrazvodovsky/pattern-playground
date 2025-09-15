interface Identifiable {
  id: string;
}

export const createFinder = <T extends Identifiable>(collection: readonly T[]) =>
  (id: string): T | undefined => collection.find(item => item.id === id);

export const createFilter = <T>(collection: readonly T[], predicate: (item: T) => boolean) =>
  (): T[] => collection.filter(predicate);

export const createPropertyFinder = <T, K extends keyof T>(
  collection: readonly T[],
  property: K
) => (value: T[K]): T | undefined =>
  collection.find(item => item[property] === value);

export const createPropertyFilter = <T, K extends keyof T>(
  collection: readonly T[],
  property: K
) => (value: T[K]): T[] =>
  collection.filter(item => item[property] === value);

export const createSearcher = <T extends { searchableText: string }>(
  collection: readonly T[]
) => (searchText: string): T[] => {
  const lowerSearchText = searchText.toLowerCase();
  return collection.filter(item =>
    item.searchableText.includes(lowerSearchText)
  );
};

export const createMultiFieldSearcher = <T extends Record<string, unknown>>(
  collection: readonly T[],
  searchFields: (keyof T)[]
) => (searchText: string): T[] => {
  const lowerSearchText = searchText.toLowerCase();
  return collection.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return typeof value === 'string' && value.toLowerCase().includes(lowerSearchText);
    })
  );
};