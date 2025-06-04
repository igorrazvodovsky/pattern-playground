import { ReactNode } from 'react';

// Generic types for hierarchical search
export interface SearchableItem {
  id: string;
  name: string;
  icon?: ReactNode | string;
  searchableText?: string;
  [key: string]: any; // Allow additional properties
}

export interface SearchableParent extends SearchableItem {
  children?: SearchableItem[];
}

export interface SearchableChildMatch {
  parent: SearchableParent;
  child: SearchableItem;
}

export interface SearchResults<TParent extends SearchableParent = SearchableParent, TChild extends SearchableItem = SearchableItem> {
  parents: TParent[];
  children: SearchableChildMatch[];
  viewOptions?: TChild[];
}

// Generic search configuration
export interface SearchConfig {
  caseSensitive?: boolean;
  parentNameCleanup?: (name: string) => string;
  includeChildrenOnParentMatch?: boolean;
  enableFuzzyMatching?: boolean;
  minRelevanceScore?: number;
}

const defaultConfig: Required<SearchConfig> = {
  caseSensitive: false,
  parentNameCleanup: (name: string) => name.replace('…', ''),
  includeChildrenOnParentMatch: true,
  enableFuzzyMatching: false,
  minRelevanceScore: 0,
};

/**
 * Generic hierarchical search function that works with parent-child data structures
 */
export function searchHierarchy<TParent extends SearchableParent, TChild extends SearchableItem>(
  query: string,
  parents: TParent[],
  config: SearchConfig = {}
): SearchResults<TParent, TChild> {
  const finalConfig = { ...defaultConfig, ...config };

  if (!query.trim()) {
    return { parents, children: [] };
  }

  const processedQuery = finalConfig.caseSensitive ? query : query.toLowerCase();

  // Helper function to check if text matches query
  const matchesQuery = (text: string): boolean => {
    const processedText = finalConfig.caseSensitive ? text : text.toLowerCase();

    if (finalConfig.enableFuzzyMatching) {
      // Simple fuzzy matching - check if all characters exist in order
      let queryIndex = 0;
      for (let i = 0; i < processedText.length && queryIndex < processedQuery.length; i++) {
        if (processedText[i] === processedQuery[queryIndex]) {
          queryIndex++;
        }
      }
      return queryIndex === processedQuery.length;
    }

    return processedText.includes(processedQuery);
  };

  // Filter parents that match the query
  const matchingParents = parents.filter(parent => {
    const searchText = parent.searchableText || parent.name;
    return matchesQuery(searchText);
  });

  // Find child matches
  const childMatches: SearchableChildMatch[] = [];

  parents.forEach(parent => {
    if (!parent.children) return;

    // Direct child matches
    const directChildMatches = parent.children.filter(child => {
      const searchText = child.searchableText || child.name;
      return matchesQuery(searchText);
    });

    directChildMatches.forEach(child => {
      childMatches.push({ parent, child });
    });

    // Include all children if parent matches (and config allows)
    if (finalConfig.includeChildrenOnParentMatch) {
      const cleanParentName = finalConfig.parentNameCleanup(parent.name);
      const parentMatches = matchesQuery(cleanParentName) || matchesQuery(parent.name);

      if (parentMatches) {
        parent.children.forEach(child => {
          // Avoid duplicates
          const alreadyIncluded = childMatches.some(
            match => match.parent.id === parent.id && match.child.id === child.id
          );
          if (!alreadyIncluded) {
            childMatches.push({ parent, child });
          }
        });
      }
    }
  });

  return {
    parents: matchingParents,
    children: childMatches
  } as SearchResults<TParent, TChild>;
}

/**
 * Search within a specific parent's children
 */
export function searchWithinParent<TChild extends SearchableItem>(
  query: string,
  parent: SearchableParent,
  config: SearchConfig = {}
): TChild[] {
  const finalConfig = { ...defaultConfig, ...config };

  if (!parent.children) return [];
  if (!query.trim()) return parent.children as TChild[];

  const processedQuery = finalConfig.caseSensitive ? query : query.toLowerCase();

  const matchesQuery = (text: string): boolean => {
    const processedText = finalConfig.caseSensitive ? text : text.toLowerCase();
    return processedText.includes(processedQuery);
  };

  return parent.children.filter(child => {
    const searchText = child.searchableText || child.name;
    return matchesQuery(searchText);
  }) as TChild[];
}

/**
 * Calculate relevance score for search result ordering
 */
export function calculateRelevanceScore(
  item: SearchableItem,
  query: string,
  config: SearchConfig = {}
): number {
  const finalConfig = { ...defaultConfig, ...config };
  const processedQuery = finalConfig.caseSensitive ? query : query.toLowerCase();
  const processedName = finalConfig.caseSensitive ? item.name : item.name.toLowerCase();
  const processedSearchText = item.searchableText
    ? (finalConfig.caseSensitive ? item.searchableText : item.searchableText.toLowerCase())
    : processedName;

  let score = 0;

  // Exact match gets highest score
  if (processedName === processedQuery) {
    score += 100;
  }
  // Name starts with query gets high score
  else if (processedName.startsWith(processedQuery)) {
    score += 80;
  }
  // Name contains query gets medium score
  else if (processedName.includes(processedQuery)) {
    score += 60;
  }
  // Searchable text contains query gets lower score
  else if (processedSearchText.includes(processedQuery)) {
    score += 40;
  }

  // Boost score for shorter names (more relevant)
  const lengthPenalty = Math.max(0, item.name.length - query.length) * 0.5;
  score -= lengthPenalty;

  return Math.max(0, score);
}

/**
 * Sort search results by relevance
 */
export function sortByRelevance<T extends SearchableItem>(
  items: T[],
  query: string,
  config: SearchConfig = {}
): T[] {
  return items
    .map(item => ({
      item,
      score: calculateRelevanceScore(item, query, config)
    }))
    .filter(({ score }) => score >= config.minRelevanceScore || 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}