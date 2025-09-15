import { FilterType, Status, Assignee, Labels, Priority, DueDate, FilterOption } from "./filter-types";
import { FilterIcon } from "./filter-options-icons";
import { filterOperators } from "./filter-operator-logic";
import {
  users,
  filterStatuses,
  filterLabels,
  filterPriorities,
  filterDates
} from "../../stories/data";

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

export const statusFilterOptions: FilterOption[] = filterStatuses.map(item => ({
  name: item.value as Status,
  icon: <FilterIcon type={item.value as Status} />,
}));

export const assigneeFilterOptions: FilterOption[] = [
  ...users.map(user => ({
    name: user.name as Assignee,
    icon: <FilterIcon type={user.name as Assignee} />,
  })),
  {
    name: Assignee.NO_ASSIGNEE,
    icon: <FilterIcon type={Assignee.NO_ASSIGNEE} />,
  }
];

export const labelFilterOptions: FilterOption[] = filterLabels.map(item => ({
  name: item.value as Labels,
  icon: <FilterIcon type={item.value as Labels} />,
}));

export const priorityFilterOptions: FilterOption[] = filterPriorities.map(item => ({
  name: item.value as Priority,
  icon: <FilterIcon type={item.value as Priority} />,
}));

export const dateFilterOptions: FilterOption[] = filterDates.map(item => ({
  name: item.value as DueDate,
  icon: undefined,
}));

export const filterViewToFilterOptions: Record<FilterType, FilterOption[]> = {
  [FilterType.STATUS]: statusFilterOptions,
  [FilterType.ASSIGNEE]: assigneeFilterOptions,
  [FilterType.LABELS]: labelFilterOptions,
  [FilterType.PRIORITY]: priorityFilterOptions,
  [FilterType.DUE_DATE]: dateFilterOptions,
  [FilterType.CREATED_DATE]: dateFilterOptions,
  [FilterType.UPDATED_DATE]: dateFilterOptions,
};

export { filterOperators };

export type SearchableFilterItem = {
  type: FilterType;
  value: string;
  icon: React.ReactNode;
  typeIcon: React.ReactNode;
  searchableText: string;
};

export const createGlobalFilterItems = (): SearchableFilterItem[] => {
  const items: SearchableFilterItem[] = [];

  Object.entries(filterViewToFilterOptions).forEach(([filterType, options]) => {
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

  const specificFilterType = findSpecificFilterType(searchWords);

  const matchesSearch = (text: string, exactMatch: boolean = false): boolean => {
    const lowerText = text.toLowerCase();

    if (exactMatch) {
      return lowerText.includes(lowerSearchTerm);
    }

    return searchWords.every(word => lowerText.includes(word));
  };

  const matchesTypeAndValue = (item: SearchableFilterItem): boolean => {
    if (specificFilterType && item.type !== specificFilterType) {
      return false;
    }

    const typeWords = item.type.toLowerCase().split(/\s+/);
    const valueWords = item.value.toLowerCase().split(/\s+/);

    if (specificFilterType) {
      const nonTypeWords = searchWords.filter(word => {
        const isTypeWord = typeWords.some(typeWord =>
          typeWord.includes(word) || word.includes(typeWord)
        );
        return !isTypeWord;
      });

      if (nonTypeWords.length === 0) {
        return true;
      }

      return nonTypeWords.every(word =>
        valueWords.some(valueWord =>
          valueWord.includes(word) || word.includes(valueWord)
        )
      );
    }

    const allItemWords = [...typeWords, ...valueWords];
    const matchingWords = searchWords.filter(searchWord =>
      allItemWords.some(itemWord =>
        itemWord.includes(searchWord) || searchWord.includes(itemWord)
      )
    );

    if (searchWords.length > 1) {
      return matchingWords.length >= Math.ceil(searchWords.length / 2);
    }

    return matchingWords.length > 0;
  };

  const filteredFilterTypes = filterViewOptions.map(group =>
    group.filter(filter =>
      matchesSearch(filter.name as string, true)
    )
  ).filter(group => group.length > 0);

  const filteredFilterValues = globalFilterItems.filter(item => {
    if (specificFilterType) {
      return item.type === specificFilterType && matchesTypeAndValue(item);
    }

    if (matchesSearch(item.value) || matchesSearch(item.searchableText)) {
      return true;
    }

    return matchesTypeAndValue(item);
  });

  if (searchWords.length > 1 && filteredFilterValues.length > 0) {
    filteredFilterValues.sort((a, b) => {
      const aScore = getRelevanceScore(a, searchWords, specificFilterType);
      const bScore = getRelevanceScore(b, searchWords, specificFilterType);
      return bScore - aScore;
    });
  }

  return {
    filterTypes: filteredFilterTypes,
    filterValues: filteredFilterValues
  };
};

const getRelevanceScore = (item: SearchableFilterItem, searchWords: string[], specificFilterType?: FilterType | null): number => {
  let score = 0;
  const typeWords = item.type.toLowerCase().split(/\s+/);
  const valueWords = item.value.toLowerCase().split(/\s+/);

  searchWords.forEach(searchWord => {
    if (specificFilterType) {
      if (valueWords.some(word => word === searchWord)) {
        score += 15;
      }
      else if (valueWords.some(word => word.includes(searchWord))) {
        score += 8;
      }
      else if (item.value.toLowerCase().includes(searchWord)) {
        score += 3;
      }
      return;
    }

    if (typeWords.some(word => word === searchWord)) {
      score += 10;
    }
    else if (typeWords.some(word => word.includes(searchWord))) {
      score += 5;
    }

    if (valueWords.some(word => word === searchWord)) {
      score += 8;
    }
    else if (valueWords.some(word => word.includes(searchWord))) {
      score += 4;
    }

    if (item.searchableText.includes(searchWord)) {
      score += 2;
    }
  });

  return score;
};