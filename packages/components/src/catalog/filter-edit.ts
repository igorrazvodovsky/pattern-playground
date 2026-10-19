// What a FilterTag writes to its bound `edit` before it emits `change`: a new
// operator, or a value added to the condition or taken out of it. Shared by
// the registries that draw the chip and the specs that apply the edit.
export interface FilterEdit {
  kind: 'operator' | 'add' | 'remove';
  value: string;
}
