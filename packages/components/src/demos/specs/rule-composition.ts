import type { Spec, StateStore } from '@json-render/core';
import { filterLabels, filterPriorities, filterStatuses, nameOf, users } from '@shared/data';
import type { RuleSlot, RuleSlotOption } from '../../catalog/rule-parts';
import type { RuleGroup, RuleLine, RuleTree } from '../../catalog/registries/shadcn-rule-builder';
import type { SpecSetup } from '../../catalog/SpecDemo';
import spec from './rule-composition.json' with { type: 'json' };

// A saved search over the world's tasks, composed as one statement. The
// condition is a tree: a group of parts that all have to hold, or any of which
// may, and a group may hold another group. The logic sits in two places and
// the demo shows both: between lines, as the head of each group, and inside a
// line, as the operator on its part ("is not", "is at least", "is any of").
//
// The spec carries the layout. What stays here is the rule model: deriving
// the statement tree from it ($computed) and applying an edit (editRule).

const ME = 'user-1';

type Match = 'all' | 'any';

type Field = 'status' | 'assignee' | 'priority' | 'label' | 'due';

// A condition holds one value, or a set of them when its operator ranges over
// a set ("is any of"). A set is the one place "or" (or "and", for "all of")
// may join parts inside a line: the operator names the quantifier, and a
// list of values is read as a list.
interface Condition {
  id: string;
  field: Field;
  op: string;
  value: string | string[];
}

interface Group {
  id: string;
  match: Match;
  items: (Condition | Group)[];
}

interface Rule {
  where: Group;
}

const isGroup = (item: Condition | Group): item is Group => 'items' in item;

const toOptions = (records: { id: string; name: string }[]): RuleSlotOption[] =>
  records.map(record => ({ value: record.id, label: record.name }));

const options: Record<Field, RuleSlotOption[]> = {
  status: toOptions(filterStatuses),
  assignee: [
    { value: ME, label: 'me' },
    ...users.filter(user => user.id !== ME).map(user => ({ value: user.id, label: nameOf(user.id) })),
  ],
  priority: toOptions(filterPriorities),
  label: toOptions(filterLabels),
  due: [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '90', label: '90 days' },
  ],
};

const fieldLabels: Record<Field, string> = {
  status: 'status',
  assignee: 'assignee',
  priority: 'priority',
  label: 'label',
  due: 'due date',
};

interface Operator extends RuleSlotOption {
  /** The operator ranges over a set of values, joined by this word in the sentence. */
  join?: 'or' | 'and';
}

const oneOf: Operator[] = [
  { value: 'is', label: 'is' },
  { value: 'is-not', label: 'is not' },
  { value: 'any-of', label: 'is any of', join: 'or' },
  { value: 'none-of', label: 'is none of', join: 'or' },
];

const operators: Record<Field, Operator[]> = {
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
    { value: 'within', label: 'is within the next' },
    { value: 'not-within', label: 'is not within the next' },
  ],
};

const operatorOf = (condition: Condition) =>
  operators[condition.field].find(op => op.value === condition.op) ?? operators[condition.field][0];

const listLabel = (labels: string[], join: string) =>
  labels.length <= 1 ? labels.join('') : `${labels.slice(0, -1).join(', ')} ${join} ${labels[labels.length - 1]}`;

const matchLabels: Record<Match, string> = {
  all: 'all of the following hold',
  any: 'any of the following holds',
};

const initialRule: Rule = {
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
      { id: 'c4', field: 'due', op: 'within', value: '30' },
    ],
  },
};

// --- Rule → statement tree ----------------------------------------------

const choice = (id: string, name: string, value: string, choices: RuleSlotOption[]): RuleSlot => ({
  id, kind: 'choice', name, value: [value],
  label: choices.find(option => option.value === value)?.label ?? value,
  options: choices,
});

const toLine = (condition: Condition): RuleLine => {
  const op = operatorOf(condition);
  const values = Array.isArray(condition.value) ? condition.value : [condition.value];
  const choices = options[condition.field];
  const name = `Change the ${fieldLabels[condition.field]}`;
  const valueSlot: RuleSlot = op.join
    ? {
        id: `${condition.id}:value`, kind: 'choice', name, multiple: true, value: values, options: choices,
        label: listLabel(values.map(v => choices.find(c => c.value === v)?.label ?? v), op.join),
      }
    : choice(`${condition.id}:value`, name, values[0], choices);
  return {
    id: condition.id,
    parts: [
      `${fieldLabels[condition.field]} `,
      choice(`${condition.id}:op`, 'Change the comparison', condition.op, operators[condition.field]),
      ' ',
      valueSlot,
    ],
    remove: { id: condition.id, kind: 'remove', name: 'Remove this condition' },
  };
};

const toGroup = (group: Group, nested: boolean): RuleGroup => ({
  id: group.id,
  head: choice(`${group.id}:match`, 'Change how the conditions combine', group.match,
    (Object.keys(matchLabels) as Match[]).map(m => ({ value: m, label: matchLabels[m] }))),
  items: group.items.map(item => (isGroup(item) ? toGroup(item, true) : toLine(item))),
  addCondition: {
    id: `${group.id}:add`, kind: 'add', name: 'Add a condition', label: 'Condition',
    options: (Object.keys(fieldLabels) as Field[]).map(field => ({ value: field, label: fieldLabels[field] })),
  },
  addGroup: {
    id: `${group.id}:add`, kind: 'add', label: 'Group',
    name: group.match === 'all' ? 'Add a group where any may hold' : 'Add a group where all must hold',
    options: [{ value: 'group', label: 'Group' }],
  },
  remove: nested ? { id: group.id, kind: 'remove', name: 'Remove this group' } : undefined,
});

const toTree = (rule: Rule): RuleTree => ({
  lead: ['Show tasks where '],
  where: toGroup(rule.where, false),
});

// --- Edits --------------------------------------------------------------

interface Edit { kind: 'change' | 'add' | 'remove'; slotId: string; value: unknown }

const newCondition = (id: string, field: Field): Condition =>
  ({ id, field, op: operators[field][0].value, value: options[field][0].value });

/** Change one part of a condition; a value follows its operator between one and a set. */
const changeCondition = (condition: Condition, part: string, value: string[]): Condition => {
  if (part === 'value') {
    return { ...condition, value: operatorOf(condition).join ? value : value[0] };
  }
  const next = { ...condition, op: value[0] };
  const wasSet = Array.isArray(condition.value);
  const isSet = Boolean(operatorOf(next).join);
  if (isSet && !wasSet) return { ...next, value: [condition.value as string] };
  if (!isSet && wasSet) return { ...next, value: (condition.value as string[])[0] };
  return next;
};

/** Remove the item with this id anywhere in the tree; a group left empty goes with it. */
const removeItem = (group: Group, id: string): Group => ({
  ...group,
  items: group.items
    .filter(item => item.id !== id)
    .map(item => (isGroup(item) ? removeItem(item, id) : item))
    .filter(item => !isGroup(item) || item.items.length > 0),
});

const addItem = (group: Group, groupId: string, what: string, nextId: () => string): Group => {
  if (group.id === groupId) {
    const item: Condition | Group = what === 'group'
      ? {
          id: nextId(),
          match: group.match === 'all' ? 'any' : 'all',
          items: [newCondition(nextId(), 'assignee'), newCondition(nextId(), 'label')],
        }
      : newCondition(nextId(), what as Field);
    return { ...group, items: [...group.items, item] };
  }
  return { ...group, items: group.items.map(item => (isGroup(item) ? addItem(item, groupId, what, nextId) : item)) };
};

const changeItem = (group: Group, id: string, part: string, value: string[]): Group => ({
  ...group,
  ...(group.id === id ? { match: value[0] as Match } : {}),
  items: group.items.map(item =>
    isGroup(item) ? changeItem(item, id, part, value)
    : item.id === id ? changeCondition(item, part, value)
    : item),
});

const applyEdit = (rule: Rule, edit: Edit, nextId: () => string): Rule => {
  if (edit.kind === 'remove') return { where: removeItem(rule.where, edit.slotId) };
  const [itemId, part] = edit.slotId.split(':');
  if (edit.kind === 'add') return { where: addItem(rule.where, itemId, String(edit.value), nextId) };
  return { where: changeItem(rule.where, itemId, part, edit.value as string[]) };
};

const handlers = (store: StateStore) => {
  let next = 1;
  return {
    editRule: ({ edit }: Record<string, unknown>) => {
      if (!edit) return;
      store.set('/rule', applyEdit(store.get('/rule') as Rule, edit as Edit, () => `n${next++}`));
    },
  };
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { rule: initialRule, edit: null },
    handlers,
    functions: {
      ruleTree: ({ rule }) => toTree(rule as Rule),
    },
  } satisfies SpecSetup,
};
