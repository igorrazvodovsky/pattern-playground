// What a FilterTag writes to its bound `edit` before it emits `change`.
export interface FilterEdit {
  kind: 'operator' | 'add' | 'remove';
  value: string;
}
