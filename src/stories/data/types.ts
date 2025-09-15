// Shared type definitions for data layer

export interface User {
  id: string;
  name: string;
  icon: string;
  type: string;
  description: string;
  searchableText: string;
  metadata: Record<string, unknown>;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  type: string;
  description: string;
  searchableText: string;
  metadata: Record<string, unknown>;
}