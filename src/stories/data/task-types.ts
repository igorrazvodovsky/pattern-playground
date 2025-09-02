// Unified Task Types for Data Layer
// This replaces both the component task types and data task types

export interface TaskHistoryEntry {
  id: string;
  timestamp: Date;
  actor: 'User' | 'System';
  action: string;
  details?: string;
}

export interface TaskStatus {
  id: string;
  label: string;
  value: 'submitted' | 'planning' | 'executing' | 'asking' | 'completed' | 'failed';
  color: string;
}

export interface TaskPriority {
  id: string;
  label: string;
  value: 'low' | 'medium' | 'high' | 'critical';
  color: string;
}

export interface TaskLabel {
  id: string;
  label: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

// Unified Task interface that works with both data and components
export interface Task {
  // Core identification
  id: string;
  
  // Content - supporting both old patterns
  title: string;           // Primary display name
  specification: string;   // Detailed specification (can be same as title for simple tasks)
  description?: string;    // Optional longer description
  
  // Status and workflow
  status: TaskStatus;      // Rich status object with display properties
  history: TaskHistoryEntry[];  // Execution history for TaskView
  
  // Assignment and organization  
  assignee?: User;
  priority?: TaskPriority;
  labels?: TaskLabel[];
  project?: Project;
  
  // Progress tracking
  progress?: number;       // 0-100 percentage
  
  // Temporal
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;
  
  // Updated by tracking
  updatedBy?: User;
  
  // ItemView metadata
  metadata?: {
    tags?: string[];
    [key: string]: any;
  };
}

// Helper type for creating new tasks (minimal required fields)
export interface CreateTaskInput {
  specification: string;
  title?: string;  // Falls back to specification if not provided
  assignee?: string; // User ID
  priority?: string; // Priority ID  
  project?: string;  // Project ID
  dueDate?: Date;
}

// Type guards and utilities
export const isTask = (obj: any): obj is Task => {
  return typeof obj === 'object' && 
         typeof obj.id === 'string' &&
         typeof obj.title === 'string' &&
         typeof obj.specification === 'string' &&
         typeof obj.status === 'object' &&
         Array.isArray(obj.history);
};

// Simple status values for backward compatibility
export const getStatusValue = (task: Task): Task['status']['value'] => {
  return task.status.value;
};

// Convert unified Task to ItemView TaskObject
export const taskToItemObject = (task: Task) => ({
  id: task.id,
  specification: task.specification,
  status: task.status.value,
  history: task.history,
  assignee: task.assignee?.name,
  progress: task.progress,
  createdAt: task.createdAt,
  metadata: {
    title: task.title,
    description: task.description,
    priority: task.priority?.value,
    tags: task.labels?.map(l => l.label) || [],
    dueDate: task.dueDate,
    project: task.project?.name,
    ...task.metadata
  }
});