import { expect, test } from 'vitest';
import demo from './filtering';

const f = demo.setup.functions;
const result = {
  suggestedItems: [
    { id: 'a', label: 'Priority: Urgent', value: 'Urgent', metadata: { path: 'priority.label', operator: 'is', values: ['Urgent'] } },
    { id: 'b', label: 'Due: Today', value: 'Today', metadata: { path: 'dueDate', operator: 'is', values: ['Today'] } },
  ],
  confidence: 70,
  unmatchedCriteria: ['for me'],
};
const interpretation = { prompt: 'urgent things due today for me', result };

test('field offers the suggestion and a task', () => {
  const field = f.field({ query: 'urgent things due today for me', scope: null, interpretation }) as { groups: { heading: string; options: { label: string }[] }[]; note: string };
  expect(field.groups.at(-1)).toEqual({ heading: 'Suggested', options: [
    { value: 'suggested', label: 'Apply 2 suggestions (70% match)', narrows: null },
    { value: 'create-task', label: 'Create a task from this', narrows: null },
  ] });
  expect(field.note).toBe('Partly understood: could not read for me.');
});

test('pick applies suggestions and creates tasks', () => {
  const applied = f.pick({ filters: [], toasts: [], picked: 'suggested', interpretation }) as { filters: { path: string }[] };
  expect(applied.filters.map(each => each.path)).toEqual(['priority.label', 'dueDate']);
  const created = f.pick({ filters: [], toasts: [], picked: 'create-task', interpretation }) as { toasts: { message: string; task: { title: string; history: unknown[] } }[] };
  expect(created.toasts[0].message).toBe('Task created: urgent things due today for me');
  expect(created.toasts[0].task.history.length).toBe(2);
  const value = f.pick({ filters: [], toasts: [], picked: JSON.stringify(['status.label', 'Done']), interpretation: null }) as { filters: { values: string[]; operator: string }[] };
  expect(value.filters[0]).toMatchObject({ values: ['Done'], operator: 'is' });
});

test('unmatched asks only when nothing matches', () => {
  expect(f.unmatched({ query: 'urg', scope: null })).toBeNull();
  expect(f.unmatched({ query: 'zzzz', scope: null })).toBe('zzzz');
  expect(f.unmatched({ query: 'zzzz', scope: 'status.label' })).toBeNull();
});
