// Centralized data exports for consistency across components
import usersData from './users.json' with { type: 'json' };
import projectsData from './projects.json' with { type: 'json' };
import documentsData from './documents.json' with { type: 'json' };
import commandsData from './commands.json' with { type: 'json' };
import recentItemsData from './recent-items.json' with { type: 'json' };
import tasksData from './tasks.json' with { type: 'json' };

export const users = usersData;
export const projects = projectsData;
export const documents = documentsData;
export const commands = commandsData;
export const recentItems = recentItemsData;
export const tasks = tasksData;

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

// Reference picker data structure
export const referenceCategories = [
  {
    id: 'users',
    name: 'Users',
    type: 'user',
    icon: 'ph:users-fill',
    description: 'Team members and collaborators',
    searchableText: 'users people team members collaborators',
    children: users
  },
  {
    id: 'documents',
    name: 'Documents',
    type: 'document',
    icon: 'ph:file-text-fill',
    description: 'Documents, files, and resources',
    searchableText: 'documents documentation resources files spreadsheets code',
    children: documents
  },
  {
    id: 'projects',
    name: 'Projects',
    type: 'project',
    icon: 'ph:folder-fill',
    description: 'Active and completed projects',
    searchableText: 'projects active completed development',
    children: projects
  }
];

// Basic reference data (users only) for simple examples
export const basicReferenceCategories = [
  {
    id: 'users',
    name: 'Users',
    type: 'user',
    icon: 'ph:users-fill',
    description: 'Team members',
    searchableText: 'users people team members',
    children: users
  }
];

// Transform data for ReferenceCategory interface (label/items instead of name/children)
export const referenceCategories_transformed = referenceCategories.map(cat => ({
  id: cat.id,
  label: cat.name,
  items: cat.children.map(item => ({
    id: item.id,
    label: item.name,
    type: cat.type,
    metadata: item.metadata
  }))
}));

export const basicReferenceCategories_transformed = basicReferenceCategories.map(cat => ({
  id: cat.id,
  label: cat.name,
  items: cat.children.map(item => ({
    id: item.id,
    label: item.name,
    type: cat.type,
    metadata: item.metadata
  }))
}));