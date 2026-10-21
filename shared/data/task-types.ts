// Task types for tasks created during a session. The command menu's AI
// fallback makes one and an agent works it.
//
// This is the same kind of task as the fixture world's, assigned to an agent.
// A task does not depend on who performs it. The separate shape is left over
// from a demo of an agent at work: its statuses (submitted, planning,
// executing, asking, completed, failed) are a status sequence of their own,
// and its history is hand-written strings rather than actions from the log.
//
// The fixture world's tasks are individuals in `shared/world`, assembled by
// `transformations/tasks.ts`, with statuses from `statuses.json` and a history
// read from the action log. The agent trace fixtures plan
// (`plans/active/2026-08-agent-trace-fixtures.md`) retires this file: a session
// task becomes a task in the log like any other.

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
  title: string; // Primary display name
  specification: string; // Detailed specification (can be same as title for simple tasks)
  description?: string; // Optional longer description

  // Status and workflow
  status: TaskStatus; // Rich status object with display properties
  history: TaskHistoryEntry[]; // Execution history for TaskView

  // Assignment and organization
  assignee?: User;
  priority?: TaskPriority;
  labels?: TaskLabel[];
  project?: Project;

  // Progress tracking
  progress?: number; // 0-100 percentage

  // Temporal
  createdAt: Date;
  updatedAt?: Date;
  dueDate?: Date;

  // Updated by tracking
  updatedBy?: User;

  // ItemView metadata
  metadata?: {
    tags?: string[];
    [key: string]: string | number | boolean | null | string[] | undefined; // Serializable metadata only
  };
}

// Helper type for creating new tasks (minimal required fields)
export interface CreateTaskInput {
  specification: string;
  title?: string; // Falls back to specification if not provided
  assignee?: string; // User ID
  priority?: string; // Priority ID
  project?: string; // Project ID
  dueDate?: Date;
}
