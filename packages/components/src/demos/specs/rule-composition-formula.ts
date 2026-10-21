import type { Spec } from '@json-render/core';
import type { iconNames } from '../../catalog/catalog';
import type { SpecSetup } from '../../catalog/SpecDemo';
import {
  asKeyword,
  type InsertCandidate,
  type KeywordCandidate,
  type ListContext,
  type MentionPart,
  type WrapCandidate,
  type Paragraph,
} from '../../catalog/behaviour/mention-editor';
import { matchesQuery, maxMentionMatches, mentionQuery } from './shared/mentions';
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
  type Operator,
  type Rule,
} from './shared/task-search';
import spec from './rule-composition-formula.json' with { type: 'json' };

// The same saved task search as rule-composition, written as a formula. Little
// beyond commas is typed: the fields and values are mentions, and the
// operators and the words joining conditions are keywords, each picked from
// what fits where it stands and swapped for another in place. Fields,
// operators, values and the starting search come from shared/task-search, so
// the two notations offer the same parts.

type Icon = (typeof iconNames)[number];
type Part = Paragraph[number];

const capitalise = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

// A field's name as it heads a condition or a list: "Due date".
const fieldName = (field: Field) => capitalise(fieldLabels[field]);

const fieldId = (field: Field) => `field-${field}`;
const fieldOf = (id: string | null) => fields.find((field) => fieldId(field) === id);

const fieldPart = (field: Field): MentionPart => ({
  id: fieldId(field),
  label: fieldName(field),
  type: 'field',
});

// Status, priority and label values have icons of their own; people and dates do not.
const iconed: Field[] = ['status', 'priority', 'label'];

const valuesOf = (field: Field) =>
  options[field].map((option) => ({
    id: option.value,
    label: option.label,
    type: field,
    icon: iconed.includes(field) ? (option.value as Icon) : null,
  }));

const valuePart = (field: Field, id: string): MentionPart => ({
  id,
  label: optionLabel(field, id),
  type: field,
});

// An operator reads as it does in the sentence: "is at least".
const operatorPart = (op: Operator): MentionPart => ({
  id: op.value,
  label: op.label,
  type: 'operator',
});

// The joining words share their ids with the sentence's combinators, so the
// registry gives AND and OR the colours it gives "all" and "any".
const joins: Record<Match, MentionPart> = {
  all: { id: 'all', label: 'AND', type: 'join' },
  any: { id: 'any', label: 'OR', type: 'join' },
};
const joinWords = Object.values(joins);
const not: MentionPart = { id: 'not', label: 'not', type: 'negation' };

const allOperators = [
  ...new Map(
    Object.values(operators)
      .flat()
      .map((op) => [op.value, operatorPart(op)]),
  ).values(),
];

// A picked keyword brings what follows it, such as the space after "and".
const offer = (parts: MentionPart[], then: string | null): KeywordCandidate[] =>
  parts.map((part) => ({ ...part, keyword: true, then, icon: null }));

// --- Rule → formula -----------------------------------------------------

const conditionParts = (condition: Condition): Part[] => {
  return [
    fieldPart(condition.field),
    ' ',
    asKeyword(operatorPart(operatorOf(condition))),
    ' (',
    ...conditionValues(condition).flatMap((id, i) => [
      ...(i > 0 ? [', '] : []),
      valuePart(condition.field, id),
    ]),
    ')',
  ];
};

// A nested group is a bracketed run on its parent's line.
const groupParts = (group: Group): Part[] => [
  '(',
  ...group.items.flatMap((item, i) => [
    ...(i > 0 ? [' ', asKeyword(joins[group.match]), ' '] : []),
    ...itemParts(item),
  ]),
  ')',
];

const itemParts = (item: Condition | Group): Part[] =>
  isGroup(item) ? groupParts(item) : conditionParts(item);

// The top group puts each of its items on a line of its own, and each line
// after the first starts with the word that joins it. A group within it keeps
// a line for each of its items too, indented under its opening bracket, as
// the sentence indents a group under its head.
const indent = '    ';

const toLines = (item: Condition | Group, lead: Part[]): Paragraph[] => {
  if (!isGroup(item)) return [[...lead, ...conditionParts(item)]];
  const word = asKeyword(joins[item.match]);
  return item.items.map((inner, i) => [
    ...(i === 0 ? [...lead, '('] : [indent, word, ' ']),
    ...itemParts(inner),
    ...(i === item.items.length - 1 ? [')'] : []),
  ]);
};

const toFormula = (rule: Rule): Paragraph[] =>
  rule.where.items.flatMap((item, i) =>
    toLines(item, i > 0 ? [asKeyword(joins[rule.where.match]), ' '] : []),
  );

// --- What the lists offer -----------------------------------------------

// Naming a field puts in a whole condition on it, with the field's first
// operator and the caret between its brackets, ready for values. The operator
// is swapped in place, so the actor never has to type one.
const conditionOn = (field: Field): InsertCandidate => {
  const part = fieldPart(field);
  return {
    id: part.id,
    label: part.label,
    icon: null,
    insert: {
      before: [part, ' ', asKeyword(operatorPart(operators[field][0])), ' ('],
      after: [')'],
      line: null,
    },
  };
};

// What / offers: the joining words, and edits to the structure around the caret.
const commands = (condition: string | null) => {
  const negate: WrapCandidate = {
    id: 'negate',
    label: 'Negate this condition',
    icon: null,
    wrap: { before: [asKeyword(not), ' ('], after: [')'] },
  };
  const newGroup: InsertCandidate = {
    id: 'new-group',
    label: 'Start a new group',
    icon: null,
    insert: { before: [asKeyword(joins.all), ' '], after: null, line: true },
  };
  return [
    { heading: 'Join', options: [...offer(joinWords, ' '), ...offer([not], ' (')] },
    { heading: 'Structure', options: condition ? [negate, newGroup] : [newGroup] },
  ];
};

const fieldOperators = (field: Field) => ({
  heading: `${fieldName(field)} operators`,
  options: offer(operators[field].map(operatorPart), null),
});

const isContext = (value: unknown): value is ListContext =>
  typeof value === 'object' && value !== null && 'trigger' in value;

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      content: toFormula(initialRule),
      query: null,
      context: null,
      keywords: [...allOperators, ...joinWords, not],
    },
    functions: {
      candidates: (args) => {
        if (!isContext(args.context)) return [];
        const { trigger, enclosing, preceding, condition, keyword } = args.context;
        const query = mentionQuery(args.query);
        const named = matchesQuery(query);
        const field = fieldOf(preceding);

        if (trigger === '/')
          return commands(condition).map((group) => ({
            ...group,
            options: group.options.filter(named),
          }));
        if (trigger === 'swap') {
          if (keyword !== null && keyword in joins)
            return [{ heading: 'Join', options: offer(joinWords, null) }];
          return field ? [fieldOperators(field)] : [];
        }

        const within = fieldOf(enclosing);
        if (within)
          return [
            {
              heading: `${fieldName(within)} values`,
              options: valuesOf(within).filter(named).slice(0, maxMentionMatches),
            },
          ];
        return [
          {
            heading: 'Fields',
            options: fields.map(conditionOn).filter(named),
          },
        ];
      },
    },
  } satisfies SpecSetup,
};
