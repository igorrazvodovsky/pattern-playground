/**
 * Common type definitions for better type safety across the application
 */

// Standard TypeScript pattern for JSON types (frontend copy)
export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

// For metadata that needs to be JSON-serializable
export type MetadataRecord = Record<string, JsonValue>;

// For flexible generic arrays that need maximum flexibility
export type FlexibleArray<T = unknown> = T[];

// Common error types - more flexible for error handling
export interface ErrorDetails {
  code: string;
  message: string;
  details?: unknown; // Errors can contain complex data that doesn't need to be serialized
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  metadata?: MetadataRecord;
}