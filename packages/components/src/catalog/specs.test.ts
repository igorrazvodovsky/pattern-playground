import { describe, expect, test } from 'vitest';
import { createStateStore, validateSpec, type Spec } from '@json-render/core';
import type { z } from 'zod';
import { catalog } from './catalog';
import { directives } from './directives';
import type { SpecSetup } from './SpecDemo';

// Checks every switchable demo's spec against the catalog and against the
// module beside it. Specs are cast `as Spec`, and json-render renders an
// unknown prop, action or function without complaint, so this is where those
// mistakes surface. Per module rather than per JSON file: one file can serve
// several modules with different setups.

interface SpecModule { spec: Spec; setup: SpecSetup }

const modules = import.meta.glob<{ default?: Partial<SpecModule> }>(
  ['../demos/specs/*.ts', '!../demos/specs/*.test.ts'],
  { eager: true },
);
const specModules = Object.entries(modules)
  .filter((entry): entry is [string, { default: SpecModule }] => Boolean(entry[1].default?.spec))
  .map(([path, module]) => [path.replace(/^.*\//, '').replace(/\.ts$/, ''), module.default] as const);

// The expressions json-render resolves itself, and the keys that only appear
// inside one of them (a condition's `$and`, `$cond`'s branches).
const builtInKeys = new Set([
  '$state', '$item', '$index', '$bindState', '$bindItem', '$cond', '$then', '$else', '$computed', '$template', '$and', '$or',
]);
// What a condition (`visible`) or a repeat's state path can read: the
// renderer resolves nothing else there, so a directive or `$computed` in one
// is never evaluated.
const conditionKeys = new Set(['$state', '$item', '$index', '$and', '$or']);
const directiveByKey = new Map(directives.map(directive => [directive.name, directive]));
const builtInActions = new Set((catalog.schema.builtInActions ?? []).map(action => action.name));
const catalogActions = new Set(catalog.actionNames);

interface ComponentEntry { props: z.ZodObject; slots?: string[] }
const components = catalog.data.components as unknown as Record<string, ComponentEntry>;

interface Binding { action: string; params?: Record<string, unknown> }
const bindingsOf = (map: Record<string, Binding | Binding[]> | undefined) =>
  Object.values(map ?? {}).flatMap(binding => (Array.isArray(binding) ? binding : [binding]));

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExpression = (value: unknown): boolean =>
  Array.isArray(value)
    ? value.some(hasExpression)
    : isObject(value) && Object.entries(value).some(([key, each]) => key.startsWith('$') || hasExpression(each));

interface Found { keys: Set<string>; computed: Set<string>; directives: Record<string, unknown>[] }

// Every `$` key under a value, the names its `$computed` calls use, and the
// directive objects in it. The renderer does not check a directive against its
// schema; a directive missing a field resolves to something wrong.
const walk = (value: unknown, found: Found) => {
  if (Array.isArray(value)) value.forEach(each => walk(each, found));
  if (!isObject(value)) return;
  if (Object.keys(value).some(key => directiveByKey.has(key))) found.directives.push(value);
  for (const [key, each] of Object.entries(value)) {
    if (key.startsWith('$')) found.keys.add(key);
    if (key === '$computed' && typeof each === 'string') found.computed.add(each);
    walk(each, found);
  }
};

const lintSpec = (spec: Spec, setup: SpecSetup = {}): string[] => {
  const problems = validateSpec(spec).issues.map(issue => `${issue.elementKey ?? 'spec'}: ${issue.message}`);
  const handlers = setup.handlers?.(createStateStore(setup.initialState ?? {}), () => false) ?? {};
  const functions = setup.functions ?? {};

  for (const [key, element] of Object.entries(spec.elements)) {
    const at = (message: string) => problems.push(`${key}: ${message}`);
    const entry = components[element.type];
    if (!entry) {
      at(`type ${element.type} is not in the catalog`);
      continue;
    }
    const found: Found = { keys: new Set(), computed: new Set(), directives: [] };

    const shape = entry.props.shape as Record<string, z.ZodType>;
    for (const [name, value] of Object.entries(element.props ?? {})) {
      walk(value, found);
      const schema = shape[name];
      if (!schema) at(`${element.type} has no prop ${name}`);
      else if (!hasExpression(value)) {
        const parsed = schema.safeParse(value);
        if (!parsed.success) at(`${name}: ${parsed.error.issues.map(issue => issue.message).join('; ')}`);
      }
    }

    const where = { keys: new Set<string>(), computed: new Set<string>(), directives: [] } as Found;
    walk(element.visible, where);
    walk((element.repeat as { statePath?: unknown } | undefined)?.statePath, where);
    for (const name of where.keys) {
      if (!conditionKeys.has(name)) at(`${name} cannot be read in visible or repeat`);
    }

    for (const slot of Object.keys(element.slots ?? {})) {
      if (slot === 'default' || !entry.slots?.includes(slot)) at(`${element.type} has no slot ${slot}`);
    }

    const element_ = element as typeof element & { watch?: Record<string, Binding | Binding[]> };
    for (const binding of [...bindingsOf(element.on as never), ...bindingsOf(element_.watch)]) {
      walk(binding.params, found);
      if (builtInActions.has(binding.action)) continue;
      if (!catalogActions.has(binding.action)) at(`action ${binding.action} is not in the catalog`);
      else if (!handlers[binding.action]) at(`action ${binding.action} has no handler in the module`);
    }

    for (const name of found.computed) {
      if (!functions[name]) at(`$computed ${name} is not a function in the module`);
    }
    for (const name of found.keys) {
      if (!builtInKeys.has(name) && !directiveByKey.has(name)) at(`${name} is neither a built-in expression nor a directive`);
    }
    for (const directive of found.directives) {
      const name = Object.keys(directive).find(key => directiveByKey.has(key))!;
      const parsed = directiveByKey.get(name)!.schema.safeParse(directive);
      if (!parsed.success) at(`${name}: ${parsed.error.issues.map(issue => `${issue.path.join('.')} ${issue.message}`).join('; ')}`);
    }
  }
  return problems;
};

describe('specs', () => {
  test('every spec module is found', () => {
    expect(specModules.length).toBeGreaterThanOrEqual(50);
  });

  test.each(specModules)('%s', (_, { spec, setup }) => {
    expect(lintSpec(spec, setup)).toEqual([]);
  });
});

// Each check shown to fail when it should.
describe('the lint', () => {
  const specWith = (elements: Spec['elements']): Spec => ({ root: 'root', elements });
  const button = (extra: Record<string, unknown> = {}) => ({ type: 'Button', props: { label: 'Go' }, children: [], ...extra });

  test.each<[string, Spec, string, SpecSetup?]>([
    ['structure', specWith({ root: { ...button(), children: ['missing'] } }), 'missing'],
    ['type', specWith({ root: { type: 'Carousel', props: {}, children: [] } }), 'type Carousel is not in the catalog'],
    ['prop name', specWith({ root: button({ props: { label: 'Go', colour: 'red' } }) }), 'Button has no prop colour'],
    ['prop value', specWith({ root: button({ props: { label: 'Go', icon: 'not-an-icon' } }) }), 'icon:'],
    [
      'slot',
      specWith({ root: { type: 'Card', props: { title: 'A' }, slots: { footer: ['b'] }, children: [] }, b: button() }),
      'Card has no slot footer',
    ],
    ['action', specWith({ root: button({ on: { press: { action: 'launch' } } }) }), 'action launch is not in the catalog'],
    ['watch action', specWith({ root: button({ watch: { '/a': { action: 'launch' } } }) }), 'action launch is not in the catalog'],
    [
      'handler',
      specWith({ root: button({ on: { press: { action: 'notify', params: { statePath: '/n', message: 'Hi' } } } }) }),
      'action notify has no handler',
    ],
    [
      'function',
      specWith({ root: button({ props: { label: { $computed: 'missing' } } }) }),
      '$computed missing is not a function',
      { functions: { other: () => '' } },
    ],
    [
      'directive',
      specWith({ root: button({ props: { label: { $concatenate: ['a', 'b'] } } }) }),
      '$concatenate is neither',
    ],
    [
      'condition',
      specWith({ root: button({ visible: { $state: '/n', eq: { $count: { $state: '/items' } } } }) }),
      '$count cannot be read in visible or repeat',
    ],
    [
      'currency',
      specWith({ root: button({ props: { label: { $format: 'currency', value: 75 } } }) }),
      '$format: currency Name the currency',
    ],
    [
      'directive argument',
      specWith({ root: button({ props: { label: { $pluralize: { $state: '/n' }, one: 'item' } } }) }),
      '$pluralize: other',
    ],
  ])('rejects a wrong %s', (_, spec, problem, setup) => {
    const problems = lintSpec(spec, setup);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(problem);
  });

  test('passes a value with an expression without parsing it', () => {
    const spec = specWith({ root: button({ props: { label: { $state: '/label' }, icon: { $state: '/icon' } } }) });
    expect(lintSpec(spec)).toEqual([]);
  });
});
