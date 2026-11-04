import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import type { RuleSlot, RuleSlotOption } from '../../catalog/rule-parts';
import type { RuleGroup, RuleLine, RuleTree } from '../../catalog/registries/shadcn/rule-builder';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import {
  conditionValues,
  fieldLabels,
  fields,
  initialRule,
  isGroup,
  operatorOf,
  operators,
  optionLabel,
  options,
  type Condition,
  type Field,
  type Group,
  type Match,
  type Rule,
} from './shared/task-search';
import spec from './rule-composition.json' with { type: 'json' };

// A saved search over the world's tasks, composed as one statement. The
// condition is a tree: a group of parts that all have to hold, or any of which
// may, and a group may hold another group. The logic sits in two places and
// the demo shows both: between lines, as the head of each group, and inside a
// line, as the operator on its part ("is not", "is at least", "is any of").
//
// The spec carries the layout, and shared/task-search the fields, operators,
// values and starting search. What stays here is deriving the statement tree
// from the rule ($computed) and applying an edit (editRule).

const listLabel = (labels: string[], join: string) =>
  labels.length <= 1
    ? labels.join('')
    : `${labels.slice(0, -1).join(', ')} ${join} ${labels[labels.length - 1]}`;

const matchLabels: Record<Match, string> = {
  all: 'all of the following hold',
  any: 'any of the following holds',
};

// --- Rule → statement tree ----------------------------------------------

const choice = (id: string, name: string, value: string, choices: RuleSlotOption[]): RuleSlot => ({
  id,
  kind: 'choice',
  name,
  value: [value],
  label: choices.find((option) => option.value === value)?.label ?? value,
  options: choices,
});

const toLine = (condition: Condition): RuleLine => {
  const op = operatorOf(condition);
  const values = conditionValues(condition);
  const choices = options[condition.field];
  const name = `Change the ${fieldLabels[condition.field]}`;
  const valueSlot: RuleSlot = op.join
    ? {
        id: `${condition.id}:value`,
        kind: 'choice',
        name,
        multiple: true,
        value: values,
        options: choices,
        label: listLabel(
          values.map((v) => optionLabel(condition.field, v)),
          op.join,
        ),
      }
    : choice(`${condition.id}:value`, name, values[0], choices);
  return {
    id: condition.id,
    parts: [
      `${fieldLabels[condition.field]} `,
      choice(
        `${condition.id}:op`,
        'Change the comparison',
        condition.op,
        operators[condition.field],
      ),
      ' ',
      valueSlot,
    ],
    remove: { id: condition.id, kind: 'remove', name: 'Remove this condition' },
  };
};

const toGroup = (group: Group, nested: boolean): RuleGroup => ({
  id: group.id,
  head: choice(
    `${group.id}:match`,
    'Change how the conditions combine',
    group.match,
    (Object.keys(matchLabels) as Match[]).map((m) => ({ value: m, label: matchLabels[m] })),
  ),
  items: group.items.map((item) => (isGroup(item) ? toGroup(item, true) : toLine(item))),
  addCondition: {
    id: `${group.id}:add`,
    kind: 'add',
    name: 'Add a condition',
    label: 'Condition',
    options: fields.map((field) => ({
      value: field,
      label: fieldLabels[field],
    })),
  },
  addGroup: {
    id: `${group.id}:add`,
    kind: 'add',
    label: 'Group',
    name:
      group.match === 'all' ? 'Add a group where any may hold' : 'Add a group where all must hold',
    options: [{ value: 'group', label: 'Group' }],
  },
  remove: nested ? { id: group.id, kind: 'remove', name: 'Remove this group' } : undefined,
});

const toTree = (rule: Rule): RuleTree => ({
  lead: ['Show tasks where '],
  where: toGroup(rule.where, false),
});

// --- Edits --------------------------------------------------------------

interface Edit {
  kind: 'change' | 'add' | 'remove';
  slotId: string;
  value: unknown;
}

const newCondition = (id: string, field: Field): Condition => ({
  id,
  field,
  op: operators[field][0].value,
  value: options[field][0].value,
});

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
    .filter((item) => item.id !== id)
    .map((item) => (isGroup(item) ? removeItem(item, id) : item))
    .filter((item) => !isGroup(item) || item.items.length > 0),
});

const addItem = (group: Group, groupId: string, what: string, nextId: () => string): Group => {
  if (group.id === groupId) {
    const item: Condition | Group =
      what === 'group'
        ? {
            id: nextId(),
            match: group.match === 'all' ? 'any' : 'all',
            items: [newCondition(nextId(), 'assignee'), newCondition(nextId(), 'label')],
          }
        : newCondition(nextId(), what as Field);
    return { ...group, items: [...group.items, item] };
  }
  return {
    ...group,
    items: group.items.map((item) => (isGroup(item) ? addItem(item, groupId, what, nextId) : item)),
  };
};

const changeItem = (group: Group, id: string, part: string, value: string[]): Group => ({
  ...group,
  ...(group.id === id ? { match: value[0] as Match } : {}),
  items: group.items.map((item) =>
    isGroup(item)
      ? changeItem(item, id, part, value)
      : item.id === id
        ? changeCondition(item, part, value)
        : item,
  ),
});

const applyEdit = (rule: Rule, edit: Edit, nextId: () => string): Rule => {
  if (edit.kind === 'remove') return { where: removeItem(rule.where, edit.slotId) };
  const [itemId, part] = edit.slotId.split(':');
  if (edit.kind === 'add')
    return { where: addItem(rule.where, itemId, String(edit.value), nextId) };
  return { where: changeItem(rule.where, itemId, part, edit.value as string[]) };
};

const editRule: ActionDefinition = {
  params: z.object({ edit: z.unknown() }),
  description:
    'Apply an edit written by a RuleBuilder ({ kind, slotId, value }) to the draft rule.',
};

const handlers = (store: StateStore) => {
  let next = 1;
  return {
    editRule: ({ edit }: Record<string, unknown>) => {
      if (!edit) return;
      store.set(
        '/rule',
        applyEdit(store.get('/rule') as Rule, edit as Edit, () => `n${next++}`),
      );
    },
  };
};

export default {
  spec: spec as Spec,
  setup: {
    initialState: { rule: initialRule, edit: null },
    actions: { editRule },
    handlers,
    functions: {
      ruleTree: ({ rule }) => toTree(rule as Rule),
    },
  } satisfies SpecSetup,
};
