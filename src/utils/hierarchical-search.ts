import { ReactNode } from 'react';
import Fuse from 'fuse.js';

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
  score?: number;
}

export interface SearchResults<TParent extends SearchableParent = SearchableParent, TChild extends SearchableItem = SearchableItem> {
  parents: TParent[];
  children: SearchableChildMatch[];
  viewOptions?: TChild[];
  contextualItems?: TChild[];
}

export interface SearchConfig {
  threshold?: number;
  keys?: Array<string | { name: string; weight: number }>;
  minMatchCharLength?: number;
  includeScore?: boolean;
  
  caseSensitive?: boolean;
  parentNameCleanup?: (name: string) => string;
  includeChildrenOnParentMatch?: boolean;
  minRelevanceScore?: number;
}

const defaultConfig: Required<SearchConfig> = {
  threshold: 0.2,
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'searchableText', weight: 0.3 }
  ],
  minMatchCharLength: 2,
  includeScore: true,
  caseSensitive: false,
  parentNameCleanup: (name: string) => name.replace('…', ''),
  includeChildrenOnParentMatch: true,
  minRelevanceScore: 0,
};

export function searchHierarchy<TParent extends SearchableParent, TChild extends SearchableItem>(
  query: string,
  parents: TParent[],
  config: SearchConfig = {}
): SearchResults<TParent, TChild> {
  const finalConfig = { ...defaultConfig, ...config };

  if (!query.trim()) {
    return { parents, children: [] };
  }

  if (query.trim().length < finalConfig.minMatchCharLength) {
    return { parents, children: [] };
  }

  const parentFuse = new Fuse(parents, {
    threshold: finalConfig.threshold,
    keys: finalConfig.keys,
    minMatchCharLength: finalConfig.minMatchCharLength,
    includeScore: finalConfig.includeScore,
    isCaseSensitive: finalConfig.caseSensitive,
  });

  const parentResults = parentFuse.search(query);
  const matchingParents = parentResults.map(result => result.item as TParent);

  const childMatches: SearchableChildMatch[] = [];

  parents.forEach(parent => {
    if (!parent.children) return;

    const childFuse = new Fuse(parent.children, {
      threshold: finalConfig.threshold,
      keys: finalConfig.keys,
      minMatchCharLength: finalConfig.minMatchCharLength,
      includeScore: finalConfig.includeScore,
      isCaseSensitive: finalConfig.caseSensitive,
    });

    const childResults = childFuse.search(query);
    childResults.forEach(result => {
      childMatches.push({
        parent,
        child: result.item,
        score: result.score
      });
    });

    if (finalConfig.includeChildrenOnParentMatch) {
      const cleanParentName = finalConfig.parentNameCleanup(parent.name);
      
      const parentTestFuse = new Fuse([{ name: cleanParentName }, { name: parent.name }], {
        threshold: finalConfig.threshold,
        keys: ['name'],
        minMatchCharLength: finalConfig.minMatchCharLength,
        isCaseSensitive: finalConfig.caseSensitive,
      });
      
      const parentMatches = parentTestFuse.search(query).length > 0;
      
      if (parentMatches) {
        parent.children.forEach(child => {
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

  childMatches.sort((a, b) => {
    if (a.score !== undefined && b.score !== undefined) {
      return a.score - b.score;
    }
    return 0;
  });

  return {
    parents: matchingParents,
    children: childMatches
  } as SearchResults<TParent, TChild>;
}

export function searchWithinParent<TChild extends SearchableItem>(
  query: string,
  parent: SearchableParent,
  config: SearchConfig = {}
): TChild[] {
  const finalConfig = { ...defaultConfig, ...config };

  if (!parent.children) return [];
  if (!query.trim()) return parent.children as TChild[];

  if (query.trim().length < finalConfig.minMatchCharLength) {
    return [];
  }

  const childFuse = new Fuse(parent.children, {
    threshold: finalConfig.threshold,
    keys: finalConfig.keys,
    minMatchCharLength: finalConfig.minMatchCharLength,
    includeScore: finalConfig.includeScore,
    isCaseSensitive: finalConfig.caseSensitive,
  });

  const results = childFuse.search(query);
  return results.map(result => result.item as TChild);
}

export function calculateRelevanceScore(
  item: SearchableItem,
  query: string,
  config: SearchConfig = {}
): number {
  const finalConfig = { ...defaultConfig, ...config };

  if (!query.trim()) return 0;

  // Don't calculate score if query is shorter than minimum match length
  if (query.trim().length < finalConfig.minMatchCharLength) {
    return 0;
  }

  const fuse = new Fuse([item], {
    threshold: 1,
    keys: finalConfig.keys,
    minMatchCharLength: finalConfig.minMatchCharLength,
    includeScore: true,
    isCaseSensitive: finalConfig.caseSensitive,
  });

  const results = fuse.search(query);
  if (results.length === 0) return 0;

  const fuseScore = results[0].score ?? 1;
  return Math.round((1 - fuseScore) * 100);
}

export function sortByRelevance<T extends SearchableItem>(
  items: T[],
  query: string,
  config: SearchConfig = {}
): T[] {
  const finalConfig = { ...defaultConfig, ...config };

  if (!query.trim()) return items;

  if (query.trim().length < finalConfig.minMatchCharLength) {
    return [];
  }

  const fuse = new Fuse(items, {
    threshold: 1,
    keys: finalConfig.keys,
    minMatchCharLength: finalConfig.minMatchCharLength,
    includeScore: true,
    isCaseSensitive: finalConfig.caseSensitive,
  });

  const results = fuse.search(query);
  
  const minRelevanceScore = config.minRelevanceScore ?? 0;
  
  return results
    .filter(result => {
      if (minRelevanceScore > 0 && result.score !== undefined) {
        const relevanceScore = (1 - result.score) * 100;
        return relevanceScore >= minRelevanceScore;
      }
      return true;
    })
    .map(result => result.item);
}

export interface HierarchicalSearchResults<TParent extends SearchableParent, TChild extends SearchableItem> {
  parents: TParent[];
  children: Array<{ parent: TParent; child: TChild }>;
  contextualItems?: TChild[];
}

export function createUnifiedSearchFunction<TParent extends SearchableParent, TChild extends SearchableItem>() {
  return (
    input: string,
    data: TParent[],
    context?: TParent,
    config: SearchConfig = {}
  ): HierarchicalSearchResults<TParent, TChild> => {
    if (context) {
      const contextualItems = searchWithinParent<TChild>(input, context, config);
      return {
        parents: [],
        children: [],
        contextualItems
      };
    } else {
      const results = searchHierarchy<TParent, TChild>(input, data, config);
      return {
        parents: results.parents,
        children: results.children.map(match => ({
          parent: match.parent as TParent,
          child: match.child as TChild
        }))
      };
    }
  };
}

export function createSortedSearchFunction<TParent extends SearchableParent, TChild extends SearchableItem>(
  sortParents?: (parents: TParent[], query: string) => TParent[],
  sortChildren?: (children: TChild[], query: string) => TChild[],
  config: SearchConfig = {}
) {
  const searchFn = createUnifiedSearchFunction<TParent, TChild>();
  
  return (
    input: string,
    data: TParent[],
    context?: TParent
  ): HierarchicalSearchResults<TParent, TChild> => {
    const baseResults = searchFn(input, data, context, config);

    if (context && baseResults.contextualItems) {
      const sorted = sortChildren 
        ? sortChildren(baseResults.contextualItems, input)
        : sortByRelevance(baseResults.contextualItems, input, config);
      
      return {
        ...baseResults,
        contextualItems: sorted
      };
    } else {
      const sortedParents = sortParents 
        ? sortParents(baseResults.parents, input)
        : sortByRelevance(baseResults.parents, input, config);

      const sortedChildren = sortChildren
        ? sortChildren(baseResults.children.map(c => c.child), input).map(child => {
            const match = baseResults.children.find(c => c.child.id === child.id);
            return match!;
          })
        : baseResults.children.sort((a, b) => {
            const aScore = calculateRelevanceScore(a.child, input, config);
            const bScore = calculateRelevanceScore(b.child, input, config);
            return bScore - aScore;
          });

      return {
        parents: sortedParents,
        children: sortedChildren
      };
    }
  };
}