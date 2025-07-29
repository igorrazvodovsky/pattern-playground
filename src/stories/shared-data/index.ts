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

// Reference picker data structure (ReferenceCategory interface format)
export const referenceCategories = [
  {
    id: 'users',
    label: 'Users',
    items: users.map(item => ({
      id: item.id,
      label: item.name,
      type: 'user' as const,
      metadata: item.metadata
    }))
  },
  {
    id: 'documents',
    label: 'Documents',
    items: documents.map(item => ({
      id: item.id,
      label: item.name,
      type: 'document' as const,
      metadata: item.metadata
    }))
  },
  {
    id: 'projects',
    label: 'Projects', 
    items: projects.map(item => ({
      id: item.id,
      label: item.name,
      type: 'project' as const,
      metadata: item.metadata
    }))
  }
];

// Basic reference data (users only) for simple examples
export const basicReferenceCategories = [
  {
    id: 'users',
    label: 'Users',
    items: users.map(item => ({
      id: item.id,
      label: item.name,
      type: 'user' as const,
      metadata: item.metadata
    }))
  }
];