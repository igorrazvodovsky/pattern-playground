// The data a rule composite is built from: fixed words and slots. A slot is a
// part the actor may change; it opens a list of what can go there. The shape
// is what the catalog's RuleBuilder renders.

export interface RuleSlotOption {
  value: string;
  label: string;
}

export interface RuleSlot {
  id: string;
  /** `choice` picks a value, `add` appends a new clause, `remove` deletes one. */
  kind: 'choice' | 'add' | 'remove';
  /** Accessible name of the control, e.g. "Change who it is from". */
  name: string;
  /** Wording shown in the sentence. Ignored for `remove`. */
  label?: string;
  options?: RuleSlotOption[];
  /** Current values of a `choice`. */
  value?: string[];
  /** A `choice` that holds several values at once. */
  multiple?: boolean;
}

/** Fixed words, or a slot. */
export type RulePart = string | RuleSlot;
