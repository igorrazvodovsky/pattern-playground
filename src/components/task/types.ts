export interface Task {
  id: string;
  specification: string;
  status: 'submitted' | 'planning' | 'executing' | 'asking' | 'completed' | 'failed';
  history: TaskHistoryEntry[];
  assignee?: string;
  progress?: number;
  createdAt: Date;
}

export interface TaskHistoryEntry {
  id: string;
  timestamp: Date;
  actor: 'User' | 'System';
  action: string;
  details?: string;
}

export interface TaskViewProps {
  task: Task;
}