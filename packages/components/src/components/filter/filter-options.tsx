import { attributeLabelFromBinding, findAttribute, taskBinding } from '@shared/data/bindings';
import {
  users,
  filterStatuses,
  filterLabels,
  filterPriorities,
  filterDates
} from "@shared/data";

/**
 * The task filter facets, keyed by attribute path over the task binding.
 * The binding supplies each facet's label, icon and operators; the shared
 * data registries supply its curated values — icons included, so nothing
 * here re-declares presentation the data already carries.
 */

export type FilterOption = {
  name: string;
  icon?: string;
  avatar?: string;
  label?: string;
};

/** Which facets the pill UI offers — a view decision, a plain list of paths. */
export const TASK_FILTER_PATHS: string[] = [
  'status.label',
  'assignee.name',
  'tags',
  'priority.label',
  'dueDate',
  'createdAt',
  'updatedAt',
];

interface ValueRecord {
  id: string;
  name: string;
  value: string;
  icon?: string;
  avatar?: string;
  searchableText?: string;
}

const assigneeRecords: ValueRecord[] = [
  ...users.map((user) => ({
    id: `assignee-${user.id}`,
    name: user.name,
    value: user.name,
    icon: 'ph:user',
    avatar: user.metadata.photoUrl,
    searchableText: user.name.toLowerCase(),
  })),
  {
    id: 'assignee-none',
    name: 'No assignee',
    value: 'No assignee',
    icon: 'ph:user-minus',
    searchableText: 'no assignee unassigned',
  },
];

const valueRecords: Record<string, ValueRecord[]> = {
  'status.label': filterStatuses,
  'assignee.name': assigneeRecords,
  'tags': filterLabels,
  'priority.label': filterPriorities,
  'dueDate': filterDates,
  'createdAt': filterDates,
  'updatedAt': filterDates,
};

const toOption = ({ value, icon, avatar }: ValueRecord): FilterOption => ({ name: value, icon, avatar });

/** Each facet's value options, as the data records them. */
export const filterValueOptions: Record<string, FilterOption[]> = Object.fromEntries(
  Object.entries(valueRecords).map(([path, records]) => [path, records.map(toOption)])
);

/**
 * The facet tree the hierarchical picker (demos/filtering.tsx) navigates:
 * one parent per offered path, children stamped with the path they filter.
 */
export const taskFilterCategories = TASK_FILTER_PATHS.map((path) => {
  const label = attributeLabelFromBinding(taskBinding, path);
  return {
    id: path,
    name: label,
    icon: findAttribute(taskBinding, path)?.icon,
    searchableText: `${label} ${path}`.toLowerCase(),
    children: (valueRecords[path] ?? []).map((record) => ({
      id: `${path}-${record.id}`,
      name: record.name,
      icon: record.icon,
      avatar: record.avatar,
      value: record.value,
      path,
      searchableText: record.searchableText ?? record.name.toLowerCase(),
    })),
  };
});
