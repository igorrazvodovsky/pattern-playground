import { Task, TaskHistoryEntry } from './types';

export const createTask = (specification: string): Task => {
  const taskId = crypto.randomUUID();
  const createdAt = new Date();

  const historyEntries: TaskHistoryEntry[] = [
    {
      id: crypto.randomUUID(),
      timestamp: createdAt,
      actor: 'User',
      action: 'Task created',
      details: `From search: "${specification}"`
    },
    {
      id: crypto.randomUUID(),
      timestamp: new Date(createdAt.getTime() + 1000), // 1 second later
      actor: 'System',
      action: 'Thinking...',
      details: 'Analyzing task requirements and planning approach'
    }
  ];

  return {
    id: taskId,
    specification: specification.trim(),
    status: 'planning',
    history: historyEntries,
    createdAt
  };
};

export const addTaskHistoryEntry = (task: Task, entry: Omit<TaskHistoryEntry, 'id'>): Task => {
  const newEntry: TaskHistoryEntry = {
    ...entry,
    id: crypto.randomUUID()
  };

  return {
    ...task,
    history: [...task.history, newEntry]
  };
};

export const updateTaskStatus = (task: Task, status: Task['status'], details?: string): Task => {
  const historyEntry: TaskHistoryEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    actor: 'System',
    action: `Status changed to ${status}`,
    details
  };

  return {
    ...task,
    status,
    history: [...task.history, historyEntry]
  };
};