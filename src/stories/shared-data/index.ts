// Centralized data exports for consistency across components
import usersData from './users.json' with { type: 'json' };
import projectsData from './projects.json' with { type: 'json' };
import documentsData from './documents.json' with { type: 'json' };
import commandsData from './commands.json' with { type: 'json' };
import recentItemsData from './recent-items.json' with { type: 'json' };
import tasksData from './tasks.json' with { type: 'json' };
import transactionsData from './transactions.json' with { type: 'json' };

export const users = usersData;
export const projects = projectsData;
export const documents = documentsData;
export const commands = commandsData;
export const recentItems = recentItemsData;
export const tasks = tasksData;
export const transactions = transactionsData;

// Filter-specific data
import filterStatusesData from './filter-statuses.json' with { type: 'json' };
import filterLabelsData from './filter-labels.json' with { type: 'json' };
import filterPrioritiesData from './filter-priorities.json' with { type: 'json' };
import filterDatesData from './filter-dates.json' with { type: 'json' };

// Re-export for external use
export { default as filterStatuses } from './filter-statuses.json' with { type: 'json' };
export { default as filterLabels } from './filter-labels.json' with { type: 'json' };
export { default as filterPriorities } from './filter-priorities.json' with { type: 'json' };
export { default as filterDates } from './filter-dates.json' with { type: 'json' };

// Utility functions
export const getUserByName = (name: string) => {
  return users.find(user => user.name === name);
};

export const getUserById = (id: string) => {
  return users.find(user => user.id === id);
};

export const getProjectById = (id: string) => {
  return projects.find(project => project.id === id);
};

export const getDocumentById = (id: string) => {
  return documents.find(doc => doc.id === id);
};

// Type exports for better type safety
export type User = typeof users[0];
export type Project = typeof projects[0];
export type Document = typeof documents[0];
export type Command = typeof commands[0];
export type RecentItem = typeof recentItems[0];
export type Task = typeof tasks[0];
export type Transaction = typeof transactions[0];

// Reference data using unified SearchableParent format (same as commands)
export const referenceCategories = [
  {
    id: 'users',
    name: 'Users',
    icon: 'ph:users',
    searchableText: 'users people team members',
    children: users.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:user',
      searchableText: item.name.toLowerCase(),
      type: 'user' as const,
      metadata: item.metadata
    }))
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'ph:file-text',
    searchableText: 'documents files content',
    children: documents.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:file-text',
      searchableText: item.name.toLowerCase(),
      type: 'document' as const,
      metadata: item.metadata
    }))
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: 'ph:folder',
    searchableText: 'projects workspaces',
    children: projects.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:folder',
      searchableText: item.name.toLowerCase(),
      type: 'project' as const,
      metadata: item.metadata
    }))
  }
];

// Basic reference data (users only) for simple examples
export const basicReferenceCategories = [
  {
    id: 'users',
    name: 'Users',
    icon: 'ph:users',
    searchableText: 'users people team members',
    children: users.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:user',
      searchableText: item.name.toLowerCase(),
      type: 'user' as const,
      metadata: item.metadata
    }))
  }
];

// Filter data using unified SearchableParent format (same as commands)
export const filterCategories = [
  {
    id: 'Status',
    name: 'Status',
    icon: 'ph:flag',
    searchableText: 'status state condition',
    children: filterStatusesData
  },
  {
    id: 'Priority',
    name: 'Priority',
    icon: 'ph:cell-signal-high',
    searchableText: 'priority importance urgency',
    children: filterPrioritiesData
  },
  {
    id: 'Labels',
    name: 'Labels',
    icon: 'ph:tag',
    searchableText: 'labels tags categories',
    children: filterLabelsData
  },
  {
    id: 'Assignee',
    name: 'Assignee',
    icon: 'ph:user',
    searchableText: 'assignee assigned person owner',
    children: [
      ...users.map(user => ({
        id: `assignee-${user.id}`,
        name: user.name,
        icon: 'ph:user',
        searchableText: user.name.toLowerCase(),
        filterType: 'Assignee',
        value: user.name,
        metadata: user.metadata
      })),
      {
        id: 'assignee-none',
        name: 'No assignee',
        icon: 'ph:user-minus',
        searchableText: 'no assignee unassigned',
        filterType: 'Assignee',
        value: 'No assignee'
      }
    ]
  },
  {
    id: 'Due date',
    name: 'Due date',
    icon: 'ph:calendar',
    searchableText: 'due date deadline schedule',
    children: filterDatesData
  },
  {
    id: 'Created date',
    name: 'Created date',
    icon: 'ph:calendar-plus',
    searchableText: 'created date when made',
    children: filterDatesData
  },
  {
    id: 'Updated date',
    name: 'Updated date',
    icon: 'ph:calendar-check',
    searchableText: 'updated date last modified',
    children: filterDatesData
  },
];