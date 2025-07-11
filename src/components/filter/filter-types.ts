export enum FilterType {
  STATUS = "Status",
  ASSIGNEE = "Assignee",
  LABELS = "Labels",
  PRIORITY = "Priority",
  DUE_DATE = "Due date",
  CREATED_DATE = "Created date",
  UPDATED_DATE = "Updated date",
}

export enum FilterOperator {
  IS = "is",
  IS_NOT = "is not",
  IS_ANY_OF = "is any of",
  INCLUDE = "include",
  DO_NOT_INCLUDE = "do not include",
  INCLUDE_ALL_OF = "include all of",
  INCLUDE_ANY_OF = "include any of",
  EXCLUDE_ALL_OF = "exclude all of",
  EXCLUDE_IF_ANY_OF = "exclude if any of",
  BEFORE = "before",
  AFTER = "after",
}

export enum Status {
  BACKLOG = "Backlog",
  TODO = "Todo",
  IN_PROGRESS = "In Progress",
  IN_REVIEW = "In Review",
  DONE = "Done",
  CANCELLED = "Cancelled",
}

export enum Assignee {
  SARAH_CHEN = "Sarah Chen",
  MARCUS_RODRIGUEZ = "Marcus Rodriguez",
  EMILY_WATSON = "Emily Watson",
  DAVID_KIM = "David Kim",
  ALEX_THOMPSON = "Alex Thompson",
  ALICE_JOHNSON = "Alice Johnson",
  BOB_SMITH = "Bob Smith",
  CHARLIE_BROWN = "Charlie Brown",
  EVE_DAVIS = "Eve Davis",
  NO_ASSIGNEE = "No assignee",
}

export enum Labels {
  BUG = "Bug",
  FEATURE = "Feature",
  HOTFIX = "Hotfix",
  RELEASE = "Release",
  DOCUMENTATION = "Documentation",
  DESIGN = "Design",
  TESTING = "Testing",
}

export enum Priority {
  URGENT = "Urgent",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}

export enum DueDate {
  IN_THE_PAST = "in the past",
  IN_24_HOURS = "24 hours from now",
  IN_3_DAYS = "3 days from now",
  IN_1_WEEK = "1 week from now",
  IN_1_MONTH = "1 month from now",
  IN_3_MONTHS = "3 months from now",
}

export type FilterOption = {
  name: FilterType | Status | Assignee | Labels | Priority | DueDate;
  icon: React.ReactNode | undefined;
  label?: string;
};

export type Filter = {
  id: string;
  type: FilterType;
  operator: FilterOperator;
  value: string[];
};