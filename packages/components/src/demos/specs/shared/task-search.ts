import {
  filterDates,
  filterLabels,
  filterPriorities,
  filterStatuses,
  nameOf,
  users,
} from '@shared/data';
import type { RuleSlotOption } from '../../../catalog/rule-parts';

// The saved task search that rule-composition's demos write in two notations:
// the fields a condition can be about, the comparisons each field takes, the
// values on offer, and the search both demos start from.

export const ME = 'user-1';

export type Match = 'all' | 'any';

export type Field = 'status' | 'assignee' | 'priority' | 'label' | 'due';

// A condition holds one value, or a set of them when its operator ranges over
// a set ("is any of"). A set is the one place "or" (or "and", for "all of")
// may join parts inside a line: the operator names the quantifier, and a
// list of values is read as a list.
export interface Condition {
  id: string;
  field: Field;
  op: string;
  value: string | string[];
}

export interface Group {
  id: string;
  match: Match;
  items: (Condition | Group)[];
}

export interface Rule {
  where: Group;
}

export const isGroup = (item: Condition | Group): item is Group => 'items' in item;

const toOptions = (records: { id: string; name: string }[]): RuleSlotOption[] =>
  records.map((record) => ({ value: record.id, label: record.name }));

export const options: Record<Field, RuleSlotOption[]> = {
  status: toOptions(filterStatuses),
  assignee: [
    { value: ME, label: 'me' },
    ...users
      .filter((user) => user.id !== ME)
      .map((user) => ({ value: user.id, label: nameOf(user.id) })),
  ],
  priority: toOptions(filterPriorities),
  label: toOptions(filterLabels),
  due: toOptions(filterDates),
};

export const fields = Object.keys(options) as Field[];

export const fieldLabels: Record<Field, string> = {
  status: 'status',
  assignee: 'assignee',
  priority: 'priority',
  label: 'label',
  due: 'due date',
};

export interface Operator extends RuleSlotOption {
  /** The operator ranges over a set of values, joined by this word in the sentence. */
  join?: 'or' | 'and';
}

const oneOf: Operator[] = [
  { value: 'is', label: 'is' },
  { value: 'is-not', label: 'is not' },
  { value: 'any-of', label: 'is any of', join: 'or' },
  { value: 'none-of', label: 'is none of', join: 'or' },
];

export const operators: Record<Field, Operator[]> = {
  status: oneOf,
  assignee: oneOf,
  priority: [
    { value: 'is', label: 'is' },
    { value: 'at-least', label: 'is at least' },
    { value: 'at-most', label: 'is at most' },
  ],
  label: [
    { value: 'has', label: 'includes' },
    { value: 'lacks', label: 'does not include' },
    { value: 'has-any', label: 'includes any of', join: 'or' },
    { value: 'has-all', label: 'includes all of', join: 'and' },
    { value: 'has-none', label: 'includes none of', join: 'or' },
  ],
  due: [
    { value: 'before', label: 'is before' },
    { value: 'after', label: 'is after' },
  ],
};

export const operatorOf = (condition: Condition) =>
  operators[condition.field].find((op) => op.value === condition.op) ??
  operators[condition.field][0];

export const initialRule: Rule = {
  where: {
    id: 'g0',
    match: 'all',
    items: [
      { id: 'c0', field: 'status', op: 'none-of', value: ['status-done', 'status-cancelled'] },
      {
        id: 'g1',
        match: 'any',
        items: [
          { id: 'c1', field: 'assignee', op: 'is', value: ME },
          { id: 'c2', field: 'priority', op: 'at-least', value: 'priority-high' },
          { id: 'c3', field: 'label', op: 'has-any', value: ['label-audit', 'label-assessment'] },
        ],
      },
      { id: 'c4', field: 'due', op: 'before', value: 'date-1m' },
    ],
  },
};
