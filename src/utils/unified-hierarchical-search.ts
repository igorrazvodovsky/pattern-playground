import type { SearchableParent, SearchableItem, HierarchicalSearchResults } from '../hooks/useHierarchicalNavigation';

/**
 * Generic hierarchical search utility that works for Commands, Filters, and References
 * Provides consistent search behavior across all systems
 */
export function searchHierarchy<TParent extends SearchableParent, TChild extends SearchableItem>(
  query: string,
  data: TParent[]
): HierarchicalSearchResults<TParent, TChild> {
  const processedQuery = query.toLowerCase().trim();

  if (!processedQuery) {
    // No query: return all parents for browsing
    return {
      parents: data,
      children: []
    };
  }

  const parentMatches: TParent[] = [];
  const childMatches: Array<{ parent: TParent; child: TChild }> = [];

  data.forEach(parent => {
    // Check if parent matches
    const parentSearchText = parent.searchableText || parent.name;
    if (parentSearchText.toLowerCase().includes(processedQuery)) {
      parentMatches.push(parent);
    }

    // Check children for matches
    if (parent.children) {
      parent.children.forEach(child => {
        const childSearchText = child.searchableText || child.name;
        if (childSearchText.toLowerCase().includes(processedQuery)) {
          childMatches.push({ parent, child: child as TChild });
        }
      });
    }
  });

  return {
    parents: parentMatches,
    children: childMatches
  };
}

/**
 * Search within a specific parent context (for contextual mode)
 */
export function searchWithinParent<TParent extends SearchableParent, TChild extends SearchableItem>(
  query: string,
  parent: TParent
): TChild[] {
  const processedQuery = query.toLowerCase().trim();

  if (!parent.children) {
    return [];
  }

  if (!processedQuery) {
    // No query: return all children
    return parent.children as TChild[];
  }

  // Filter children based on query
  return parent.children.filter(child => {
    const searchText = child.searchableText || child.name;
    return searchText.toLowerCase().includes(processedQuery);
  }) as TChild[];
}

/**
 * Unified search function that handles both global and contextual search
 */
export function createUnifiedSearchFunction<TParent extends SearchableParent, TChild extends SearchableItem>() {
  return (
    input: string,
    data: TParent[],
    context?: TParent
  ): HierarchicalSearchResults<TParent, TChild> => {
    if (context) {
      // Contextual search
      const contextualItems = searchWithinParent<TParent, TChild>(input, context);
      return {
        parents: [],
        children: [],
        contextualItems
      };
    } else {
      // Global search
      return searchHierarchy<TParent, TChild>(input, data);
    }
  };
}

/**
 * Sort search results by relevance
 */
export function sortByRelevance<T extends { name: string }>(
  items: T[],
  query: string
): T[] {
  if (!query) return items;

  const processedQuery = query.toLowerCase();

  return items.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    // Exact matches first
    const aExact = aName === processedQuery;
    const bExact = bName === processedQuery;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Starts with query next
    const aStarts = aName.startsWith(processedQuery);
    const bStarts = bName.startsWith(processedQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // Alphabetical for everything else
    return aName.localeCompare(bName);
  });
}

/**
 * Create a search function with custom sorting logic
 */
export function createSortedSearchFunction<TParent extends SearchableParent, TChild extends SearchableItem>(
  sortParents?: (parents: TParent[], query: string) => TParent[],
  sortChildren?: (children: TChild[], query: string) => TChild[]
) {
  return (
    input: string,
    data: TParent[],
    context?: TParent
  ): HierarchicalSearchResults<TParent, TChild> => {
    const baseResults = createUnifiedSearchFunction<TParent, TChild>()(input, data, context);

    if (context && baseResults.contextualItems) {
      // Sort contextual items
      const sorted = sortChildren 
        ? sortChildren(baseResults.contextualItems, input)
        : sortByRelevance(baseResults.contextualItems, input);
      
      return {
        ...baseResults,
        contextualItems: sorted
      };
    } else {
      // Sort global results
      const sortedParents = sortParents 
        ? sortParents(baseResults.parents, input)
        : sortByRelevance(baseResults.parents, input);

      const sortedChildren = sortChildren
        ? sortChildren(baseResults.children.map(c => c.child), input).map(child => {
            const match = baseResults.children.find(c => c.child.id === child.id);
            return match!;
          })
        : baseResults.children.sort((a, b) => {
            return sortByRelevance([a.child, b.child], input).indexOf(a.child) - 
                   sortByRelevance([a.child, b.child], input).indexOf(b.child);
          });

      return {
        parents: sortedParents,
        children: sortedChildren
      };
    }
  };
}