import { FilterType, FilterOperator, Status, Assignee, Labels, Priority, DueDate, FilterOption } from "./filter-types";
import { FilterIcon } from "./filter-options-icons";
import { filterOperators } from "./filter-operator-logic";

// Generic helper function to create filter options from enum values
const createFilterOptionsFromEnum = <T extends string>(
  enumObject: Record<string, T>,
  hasIcon: boolean = true
): FilterOption[] => {
  return Object.values(enumObject).map((value) => ({
    name: value as FilterType | Status | Assignee | Labels | Priority | DueDate,
    icon: hasIcon ? <FilterIcon type={value as any} /> : undefined,
  }));
};

export const filterViewOptions: FilterOption[][] = [
  [
    {
      name: FilterType.STATUS,
      icon: <FilterIcon type={FilterType.STATUS} />,
    },
    {
      name: FilterType.ASSIGNEE,
      icon: <FilterIcon type={FilterType.ASSIGNEE} />,
    },
    {
      name: FilterType.LABELS,
      icon: <FilterIcon type={FilterType.LABELS} />,
    },
    {
      name: FilterType.PRIORITY,
      icon: <FilterIcon type={FilterType.PRIORITY} />,
    },
  ],
  [
    {
      name: FilterType.DUE_DATE,
      icon: <FilterIcon type={FilterType.DUE_DATE} />,
    },
    {
      name: FilterType.CREATED_DATE,
      icon: <FilterIcon type={FilterType.CREATED_DATE} />,
    },
    {
      name: FilterType.UPDATED_DATE,
      icon: <FilterIcon type={FilterType.UPDATED_DATE} />,
    },
  ],
];

export const statusFilterOptions: FilterOption[] = createFilterOptionsFromEnum(Status);
export const assigneeFilterOptions: FilterOption[] = createFilterOptionsFromEnum(Assignee);
export const labelFilterOptions: FilterOption[] = createFilterOptionsFromEnum(Labels);
export const priorityFilterOptions: FilterOption[] = createFilterOptionsFromEnum(Priority);
export const dateFilterOptions: FilterOption[] = createFilterOptionsFromEnum(DueDate, false);

export const filterViewToFilterOptions: Record<FilterType, FilterOption[]> = {
  [FilterType.STATUS]: statusFilterOptions,
  [FilterType.ASSIGNEE]: assigneeFilterOptions,
  [FilterType.LABELS]: labelFilterOptions,
  [FilterType.PRIORITY]: priorityFilterOptions,
  [FilterType.DUE_DATE]: dateFilterOptions,
  [FilterType.CREATED_DATE]: dateFilterOptions,
  [FilterType.UPDATED_DATE]: dateFilterOptions,
};

// Re-export the filterOperators function for backward compatibility
export { filterOperators };

// Utility type for searchable filter items
export type SearchableFilterItem = {
  type: FilterType;
  value: string;
  icon: React.ReactNode;
  typeIcon: React.ReactNode;
  searchableText: string;
};

// Create a flat list of all searchable filter values
export const createGlobalFilterItems = (): SearchableFilterItem[] => {
  const items: SearchableFilterItem[] = [];

  Object.entries(filterViewToFilterOptions).forEach(([filterType, options]) => {
    // Get the filter type icon
    const filterTypeOption = filterViewOptions.flat().find(option => option.name === filterType);
    const typeIcon = filterTypeOption?.icon;

    options.forEach(option => {
      items.push({
        type: filterType as FilterType,
        value: option.name as string,
        icon: option.icon,
        typeIcon: typeIcon,
        searchableText: `${filterType.toLowerCase()} ${option.name.toLowerCase()}`
      });
    });
  });

  return items;
};

// Enhanced search function that searches across both filter types and values
export const getFilteredResults = (
  searchTerm: string,
  globalFilterItems: SearchableFilterItem[]
): {
  filterTypes: FilterOption[][];
  filterValues: SearchableFilterItem[];
  viewOptions?: FilterOption[];
} => {
  if (!searchTerm.trim()) {
    return {
      filterTypes: filterViewOptions,
      filterValues: []
    };
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  const searchWords = lowerSearchTerm.split(/\s+/).filter(word => word.length > 0);

  // Helper function to find specific filter type from search words
  const findSpecificFilterType = (words: string[]): FilterType | null => {
    const filterTypeKeywords: Record<string, FilterType> = {
      'status': FilterType.STATUS,
      'assignee': FilterType.ASSIGNEE,
      'assigned': FilterType.ASSIGNEE,
      'label': FilterType.LABELS,
      'labels': FilterType.LABELS,
      'tag': FilterType.LABELS,
      'tags': FilterType.LABELS,
      'priority': FilterType.PRIORITY,
      'due': FilterType.DUE_DATE,
      'deadline': FilterType.DUE_DATE,
      'created': FilterType.CREATED_DATE,
      'updated': FilterType.UPDATED_DATE,
      'modified': FilterType.UPDATED_DATE,
    };

    for (const word of words) {
      if (filterTypeKeywords[word]) {
        return filterTypeKeywords[word];
      }
    }
    return null;
  };

  // Check if search indicates a specific filter type
  const specificFilterType = findSpecificFilterType(searchWords);

  // Helper function to check if text matches search terms
  const matchesSearch = (text: string, exactMatch: boolean = false): boolean => {
    const lowerText = text.toLowerCase();

    if (exactMatch) {
      // For exact matching (used for filter types)
      return lowerText.includes(lowerSearchTerm);
    }

    // For flexible matching (used for filter values)
    // Check if all search words are present in the text
    return searchWords.every(word => lowerText.includes(word));
  };

  // Helper function for advanced matching that considers type + value combinations
  const matchesTypeAndValue = (item: SearchableFilterItem): boolean => {
    // If we have a specific filter type, only match items from that type
    if (specificFilterType && item.type !== specificFilterType) {
      return false;
    }

    const typeWords = item.type.toLowerCase().split(/\s+/);
    const valueWords = item.value.toLowerCase().split(/\s+/);

    // For specific filter type searches, focus on value matching
    if (specificFilterType) {
      const nonTypeWords = searchWords.filter(word => {
        const isTypeWord = typeWords.some(typeWord =>
          typeWord.includes(word) || word.includes(typeWord)
        );
        return !isTypeWord;
      });

      if (nonTypeWords.length === 0) {
        return true; // Just searching for the type itself
      }

      // Match against value words only
      return nonTypeWords.every(word =>
        valueWords.some(valueWord =>
          valueWord.includes(word) || word.includes(valueWord)
        )
      );
    }

    // Original broad matching for non-specific searches
    const allItemWords = [...typeWords, ...valueWords];
    const matchingWords = searchWords.filter(searchWord =>
      allItemWords.some(itemWord =>
        itemWord.includes(searchWord) || searchWord.includes(itemWord)
      )
    );

    // Require at least half of the search words to match for multi-word queries
    if (searchWords.length > 1) {
      return matchingWords.length >= Math.ceil(searchWords.length / 2);
    }

    // For single word queries, use the existing logic
    return matchingWords.length > 0;
  };

  // Filter filter types (exact matching for better precision)
  const filteredFilterTypes = filterViewOptions.map(group =>
    group.filter(filter =>
      matchesSearch(filter.name as string, true)
    )
  ).filter(group => group.length > 0);

  // Filter filter values with enhanced matching
  const filteredFilterValues = globalFilterItems.filter(item => {
    // If we found a specific filter type, only show results from that type
    if (specificFilterType) {
      return item.type === specificFilterType && matchesTypeAndValue(item);
    }

    // For non-specific searches, use broader matching
    // First try simple matching (backward compatibility)
    if (matchesSearch(item.value) || matchesSearch(item.searchableText)) {
      return true;
    }

    // Then try advanced type + value matching
    return matchesTypeAndValue(item);
  });

  // Sort results by relevance for multi-word queries
  if (searchWords.length > 1 && filteredFilterValues.length > 0) {
    filteredFilterValues.sort((a, b) => {
      const aScore = getRelevanceScore(a, searchWords, specificFilterType);
      const bScore = getRelevanceScore(b, searchWords, specificFilterType);
      return bScore - aScore; // Higher scores first
    });
  }

  return {
    filterTypes: filteredFilterTypes,
    filterValues: filteredFilterValues
  };
};

// Helper function to calculate relevance score for sorting
const getRelevanceScore = (item: SearchableFilterItem, searchWords: string[], specificFilterType?: FilterType | null): number => {
  let score = 0;
  const typeWords = item.type.toLowerCase().split(/\s+/);
  const valueWords = item.value.toLowerCase().split(/\s+/);

  searchWords.forEach(searchWord => {
    // For specific filter type searches, prioritize value matches
    if (specificFilterType) {
      // Exact match in value gets high score
      if (valueWords.some(word => word === searchWord)) {
        score += 15;
      }
      // Partial match in value gets medium score
      else if (valueWords.some(word => word.includes(searchWord))) {
        score += 8;
      }
      // Substring match gets lower score
      else if (item.value.toLowerCase().includes(searchWord)) {
        score += 3;
      }
      return;
    }

    // Original scoring for broad searches
    // Exact match in type gets high score
    if (typeWords.some(word => word === searchWord)) {
      score += 10;
    }
    // Partial match in type gets medium score
    else if (typeWords.some(word => word.includes(searchWord))) {
      score += 5;
    }

    // Exact match in value gets high score
    if (valueWords.some(word => word === searchWord)) {
      score += 8;
    }
    // Partial match in value gets medium score
    else if (valueWords.some(word => word.includes(searchWord))) {
      score += 4;
    }

    // Substring match gets lower score
    if (item.searchableText.includes(searchWord)) {
      score += 2;
    }
  });

  return score;
};