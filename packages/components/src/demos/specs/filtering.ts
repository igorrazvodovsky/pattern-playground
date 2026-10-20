import type { Spec, StateStore } from '@json-render/core';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { formatTime } from '@shared/format';
import { filterPriorities, tasks, users } from '@shared/data';
import {
  applyFilters,
  attributeLabelFromBinding,
  findAttribute,
  formatBoundValue,
  getValueAtPath,
  resolveAttributeSelection,
  taskBinding,
  type AttributeFilter,
  type FilterOperator,
} from '@shared/data/bindings';
import type { ActionDefinition, SpecSetup } from '../../catalog/SpecDemo';
import type { AICommandResult } from '../../components/command-menu';
import { generateFilterSuggestions } from '../../components/filter/adapters/ai-filter-adapter';
import {
  TASK_FILTER_PATHS,
  filterValueOptions,
  taskFilterCategories,
} from '../../components/filter/filter-options';
import { createTask } from '../../components/task/task-utils';
import { filterClauses, type ValueGlyph } from './shared/filter-clauses';
import spec from './filtering.json' with { type: 'json' };

// Watches rewrite `/derived` and `/field` because a repeat reads a list from
// state and a spec cannot filter one.

const PAUSE = 1500;
const MIN_PROMPT = 3;

// Dates are offered as phrases rather than as days.
const VALUES: Record<string, { value: string; search: string }[]> = Object.fromEntries(
  taskFilterCategories.map((category) => [
    category.id,
    category.children.map((child) => ({ value: child.value, search: child.searchableText })),
  ]),
);

// Values from fixed lists are named by meaning; an assignee shows as their
// avatar.
type ValueIcon = NonNullable<ValueGlyph['icon']>;
const DATES: Record<string, ValueIcon> = {
  'in the past': 'date-past',
  '24 hours from now': 'date-in-a-day',
  '3 days from now': 'date-in-3-days',
  '1 week from now': 'date-in-a-week',
  '1 month from now': 'date-in-a-month',
  '3 months from now': 'date-in-3-months',
};
const VALUE_ICONS: Record<string, Record<string, ValueIcon>> = {
  'status.label': {
    'Backlog': 'status-backlog',
    'Todo': 'status-todo',
    'In Progress': 'status-in-progress',
    'In Review': 'status-in-review',
    'Done': 'status-done',
    'Cancelled': 'status-cancelled',
  },
  'priority.label': {
    Urgent: 'priority-urgent',
    High: 'priority-high',
    Medium: 'priority-medium',
    Low: 'priority-low',
  },
  'tags': {
    'Waste Reduction': 'label-waste-reduction',
    'Audit': 'label-audit',
    'Sourcing': 'label-sourcing',
    'Recycling': 'label-recycling',
    'Data': 'label-data',
    'Assessment': 'label-assessment',
    'Design': 'label-design',
    'Take-back': 'label-take-back',
    'Logistics': 'label-logistics',
    'Optimization': 'label-optimization',
    'Policy': 'label-policy',
    'Advocacy': 'label-advocacy',
    'Marketing': 'label-marketing',
    'Refurbishment': 'label-refurbishment',
    'Research': 'label-research',
    'Innovation': 'label-innovation',
    'Training': 'label-training',
    'Education': 'label-education',
  },
  'dueDate': DATES,
  'createdAt': DATES,
  'updatedAt': DATES,
};

const glyphsFor = (path: string): ValueGlyph[] | null => {
  if (path === 'assignee.name')
    return (filterValueOptions[path] ?? []).map(({ name, avatar }) =>
      avatar
        ? { value: name, icon: null, avatar: { name, image: avatar } }
        : { value: name, icon: 'unassigned', avatar: null },
    );
  const icons = VALUE_ICONS[path];
  return icons
    ? Object.entries(icons).map(([value, icon]) => ({ value, icon, avatar: null }))
    : null;
};

const iconOf = (path: string, value: string) =>
  glyphsFor(path)?.find((glyph) => glyph.value === value)?.icon ?? null;

const label = (path: string) => attributeLabelFromBinding(taskBinding, path);
const { keeping, chip, applyEdit, removeFilter } = filterClauses(
  tasks,
  taskBinding,
  (path) => (VALUES[path] ?? []).map((each) => each.value),
  glyphsFor,
);

// Built from the data, so the chips name values the list actually carries.
const filters: AttributeFilter[] = [
  {
    id: 'default-status',
    path: 'status.label',
    operator: 'is any of',
    values: ['Todo', 'In Progress'],
  },
  {
    id: 'default-priority',
    path: 'priority.label',
    operator: 'is any of',
    values: filterPriorities.slice(0, 2).map((priority) => priority.value),
  },
  {
    id: 'default-assignee',
    path: 'assignee.name',
    operator: 'is any of',
    values: users.slice(1, 3).map((user) => user.name),
  },
];

const CARD = resolveAttributeSelection(taskBinding, [
  'title',
  'status.label',
  'assignee.name',
  'dueDate',
]);
const [TITLE, ...BADGES] = CARD;

const derive = ({ filters: current }: Record<string, unknown>) => {
  const conditions = current as AttributeFilter[];
  return {
    filtered: conditions.length > 0,
    clauses: conditions.map(chip),
    tasks: applyFilters(tasks, conditions, taskBinding).map((task) => ({
      id: task.id,
      title: String(getValueAtPath(task, TITLE.path) ?? ''),
      attributes: BADGES.filter((attribute) => getValueAtPath(task, attribute.path) != null).map(
        (attribute) => ({
          label: label(attribute.path),
          value: formatBoundValue(getValueAtPath(task, attribute.path), attribute),
        }),
      ),
    })),
  };
};

type Interpretation = {
  prompt: string;
  pending?: true;
  result?: AICommandResult;
  error?: string;
} | null;

const SUGGESTED = 'suggested';
const CREATE_TASK = 'create-task';

const matches = (query: string, scope: string | null) => {
  const typed = query.trim().toLowerCase();
  const has = (text: string) => text.toLowerCase().includes(typed);
  const valuesOf = (path: string) =>
    (VALUES[path] ?? []).map((each) => ({
      value: JSON.stringify([path, each.value]),
      label: each.value,
      search: each.search,
      icon: iconOf(path, each.value),
    }));
  if (scope) {
    return [
      { heading: label(scope), options: valuesOf(scope).filter((option) => has(option.search)) },
    ];
  }
  return [
    {
      heading: 'Attributes',
      options: TASK_FILTER_PATHS.filter((path) => has(label(path))).map((path) => ({
        value: path,
        label: label(path),
        narrows: true,
        icon: findAttribute(taskBinding, path)?.icon ?? null,
      })),
    },
    {
      heading: 'Values',
      options:
        typed.length < 2
          ? []
          : TASK_FILTER_PATHS.flatMap((path) =>
              valuesOf(path)
                .filter((option) => has(option.search))
                .map((option) => ({
                  value: option.value,
                  label: `${label(path)}: ${option.label}`,
                  icon: option.icon,
                })),
            ),
    },
  ];
};

const scopeOf = (scope: unknown) => (typeof scope === 'string' && scope !== '' ? scope : null);

const unmatched = ({ query, scope }: Record<string, unknown>) => {
  const typed = String(query ?? '').trim();
  if (typed.length < MIN_PROMPT || scopeOf(scope)) return null;
  const found = matches(typed, null).some((group) => group.options.length > 0);
  return found ? null : typed;
};

const confidence = (result: AICommandResult) =>
  result.confidence < 85 ? ` (${result.confidence}% match)` : '';

const field = ({ query, scope, interpretation }: Record<string, unknown>) => {
  const typed = String(query ?? '');
  const within = scopeOf(scope);
  const asked = interpretation as Interpretation;
  const groups = matches(typed, within).map((group) => ({
    heading: group.heading,
    options: group.options.map(({ value, label: text, ...rest }) => ({
      value,
      label: text,
      narrows: 'narrows' in rest ? true : null,
      icon: 'icon' in rest ? rest.icon : null,
    })),
  }));
  const result = asked?.result;
  const suggested = result?.suggestedItems ?? [];
  const unread = result?.unmatchedCriteria ?? [];
  if (result) {
    groups.push({
      heading: 'Suggested',
      options: [
        ...(suggested.length > 0
          ? [
              {
                value: SUGGESTED,
                label:
                  (suggested.length === 1
                    ? suggested[0].label
                    : `Apply ${suggested.length} suggestions`) + confidence(result),
                narrows: null,
                icon: null,
              },
            ]
          : []),
        ...(unread.length > 0
          ? [{ value: CREATE_TASK, label: 'Create a task from this', narrows: null, icon: null }]
          : []),
      ],
    });
  }
  const nothing = groups.every((group) => group.options.length === 0);
  return {
    groups,
    placeholder: within ? `${label(within)}…` : 'Filter…',
    pending: Boolean(asked?.pending),
    note: asked?.error
      ? `The model is not available. ${asked.error}`
      : suggested.length > 0 && unread.length > 0
        ? `Partly understood: could not read ${unread.join(', ')}.`
        : nothing && typed.trim() !== '' && !asked
          ? 'No immediate results found.'
          : '',
    failed: Boolean(asked?.error),
  };
};

let toastCount = 0;

const pick = ({ filters: current, toasts, picked, interpretation }: Record<string, unknown>) => {
  const conditions = current as AttributeFilter[];
  const asked = interpretation as Interpretation;
  const shown = (toasts ?? []) as unknown[];
  if (picked === SUGGESTED) {
    const added = (asked?.result?.suggestedItems ?? []).flatMap((item) => {
      const { path, operator, values } = item.metadata ?? {};
      if (typeof path !== 'string' || !Array.isArray(values)) return [];
      return [
        { id: nanoid(), path, operator: operator as FilterOperator, values: values.map(String) },
      ];
    });
    return { filters: [...conditions, ...added], toasts: shown };
  }
  if (picked === CREATE_TASK) {
    const task = createTask(asked?.prompt ?? '');
    const view = {
      title: task.title,
      specification: task.specification,
      status: task.status?.label ?? '',
      history: task.history.map((entry) => ({
        id: entry.id,
        title: entry.action,
        by: entry.actor,
        time: formatTime(entry.timestamp),
      })),
    };
    const toast = {
      id: `task-${++toastCount}`,
      message: `Task created: ${task.title}`,
      actionLabel: 'Open',
      task: view,
    };
    return { filters: conditions, toasts: [...shown, toast] };
  }
  try {
    const [path, value] = JSON.parse(String(picked)) as [string, string];
    return { filters: [...conditions, keeping(nanoid(), path, value)], toasts: shown };
  } catch {
    return { filters: conditions, toasts: shown };
  }
};

const interpret: ActionDefinition = {
  params: z.object({ statePath: z.string(), prompt: z.string().nullable() }),
  description:
    'Ask a model what `prompt`, something the actor typed, describes in the collection the demo shows, once the actor pauses. Every dispatch clears `statePath` at once; a non-empty `prompt` then writes { prompt, pending: true } there when the request goes, and { prompt, result } or { prompt, error } when it comes back. A later dispatch replaces an earlier one, whose answer is dropped. Dispatch it from a `watch` on what the actor types, with a null `prompt` when what they typed already matches something.',
};

const interpretHandler = (store: StateStore, connected: () => boolean) => {
  const available = Object.fromEntries(
    Object.entries(VALUES).map(([path, values]) => [path, values.map((each) => each.value)]),
  );
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latest = 0;
  return {
    interpret: ({ statePath, prompt }: Record<string, unknown>) => {
      const path = String(statePath);
      const ask = ++latest;
      clearTimeout(timer);
      store.set(path, null);
      if (typeof prompt !== 'string' || prompt === '') return;
      timer = setTimeout(async () => {
        if (!connected() || ask !== latest) return;
        store.set(path, { prompt, pending: true });
        try {
          const result = await generateFilterSuggestions(prompt, TASK_FILTER_PATHS, available);
          if (connected() && ask === latest) store.set(path, { prompt, result });
        } catch (error) {
          if (connected() && ask === latest)
            store.set(path, { prompt, error: (error as Error).message });
        }
      }, PAUSE);
    },
  };
};

const fieldStart = { query: '', scope: null, interpretation: null };

export default {
  spec: spec as Spec,
  setup: {
    initialState: {
      filters,
      derived: derive({ filters }),
      filterOpen: false,
      filterQuery: '',
      filterScope: null,
      filterEdit: null,
      interpretation: null,
      field: field(fieldStart),
      picked: null,
      toasts: [],
      pressed: null,
      task: null,
      taskOpen: false,
    },
    actions: { interpret },
    handlers: interpretHandler,
    functions: {
      derive,
      field,
      unmatched,
      pick,
      editFilter: ({ filters: current, id, edit }) => applyEdit({ filters: current, id, edit }),
      removeFilter: ({ filters: current, id }) => removeFilter({ filters: current, id }),
    },
  } satisfies SpecSetup,
};
