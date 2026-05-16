import type { User, Project } from '../types';

// Raw task data interface (from JSON)
interface RawTaskData {
  id: string;
  title: string;
  specification: string;
  description: string;
  statusId: string;
  priorityId?: string;
  assigneeId?: string;
  labelIds?: string[];
  projectId?: string;
  progress?: number;
  history: Array<{
    timestamp: string;
    action: string;
    user: string;
    details?: string;
  }>;
  createdDate: string;
  updatedDate?: string;
  dueDate?: string;
  updatedBy?: string;
}

// Filter data interfaces
interface FilterStatus {
  id: string;
  name: string;
  value: string;
}

interface FilterPriority {
  id: string;
  name: string;
  value: string;
}

interface FilterLabel {
  id: string;
  name: string;
}

// Transformed task interfaces
export interface TaskStatus {
  id: string;
  label: string;
  value: string;
  color: string;
}

export interface TaskPriority {
  id: string;
  label: string;
  value: string;
  color: string;
}

export interface TaskLabel {
  id: string;
  label: string;
  color: string;
}

export interface TaskHistoryEntry {
  timestamp: Date;
  action: string;
  user: string;
  details?: string;
}

export interface TransformedTask {
  id: string;
  title: string;
  specification: string;
  description: string;
  status: TaskStatus;
  priority?: TaskPriority;
  assignee?: User;
  labels?: TaskLabel[];
  project?: Project;
  progress: number;
  history: TaskHistoryEntry[];
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;
  updatedBy?: User;
  metadata: {
    tags: string[];
  };
}

/**
 * Transforms raw task data into enriched task objects with resolved references
 */
export const transformTasksData = (
  tasksData: RawTaskData[],
  users: User[],
  projects: Project[],
  filterStatusesData: FilterStatus[],
  filterPrioritiesData: FilterPriority[],
  filterLabelsData: FilterLabel[]
): TransformedTask[] => {
  return tasksData.map(task => ({
    id: task.id,
    title: task.title,
    specification: task.specification,
    description: task.description,

    // Convert to rich objects
    status: (() => {
      const status = filterStatusesData.find(s => s.id === task.statusId);
      return {
        id: task.statusId,
        label: status?.name || task.statusId,
        value: status?.value || 'submitted',
      };
    })(),

    priority: task.priorityId ? (() => {
      const priority = filterPrioritiesData.find(p => p.id === task.priorityId);
      return {
        id: task.priorityId,
        label: priority?.name || task.priorityId,
        value: priority?.value || 'medium',
      };
    })() : undefined,

    assignee: task.assigneeId ? users.find(user => user.id === task.assigneeId) : undefined,

    labels: task.labelIds ? task.labelIds.map(labelId => {
      const label = filterLabelsData.find(l => l.id === labelId);
      return label ? {
        id: labelId,
        label: label.name,  // Using 'name' field from labels.json
      } : null;
    }).filter((label): label is TaskLabel => label !== null) : undefined,

    project: task.projectId ? projects.find(project => project.id === task.projectId) : undefined,

    // Progress and history from JSON
    progress: task.progress || 0,
    history: task.history.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp)
    })),

    // Temporal fields
    createdAt: new Date(task.createdDate),
    updatedAt: task.updatedDate ? new Date(task.updatedDate) : undefined,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined,

    updatedBy: task.updatedBy ? users.find(user => user.id === task.updatedBy) : undefined,

    // Metadata for ItemView
    metadata: {
      tags: task.labelIds ? task.labelIds.map(labelId => {
        const label = filterLabelsData.find(l => l.id === labelId);
        return label?.name;
      }).filter((name): name is string => name !== undefined) : []
    }
  }));
};