import { describe, expect, test } from 'vitest';
import { createStateStore, validateSpec, type Spec } from '@json-render/core';
import type { z } from 'zod';
import { catalog } from './catalog';
import { directives } from './directives';
import type { ActionDefinition, SpecSetup } from './SpecDemo';
import { notify, notifyHandler } from '../demos/specs/shared/notify';
import { settle, settleHandler } from '../demos/specs/shared/settle';

// Specs are cast `as Spec`, and json-render renders an unknown prop, action
// or function without complaint, so this is where those mistakes surface. Per
// module rather than per JSON file, since one file can serve several modules;
// a JSON spec with no module beside it is checked with nothing set up, as the
// site renders it.

interface SpecModule {
  spec: Spec;
  setup: SpecSetup;
}

const slugOf = (file: string) => file.replace(/^.*\//, '').replace(/\.(json|ts)$/, '');
const modules = import.meta.glob<{ default?: Partial<SpecModule> }>(
  ['../demos/specs/*.ts', '!../demos/specs/*.test.ts'],
  { eager: true },
);
const json = import.meta.glob<Spec>('../demos/specs/*.json', { eager: true, import: 'default' });
// The site takes every module directly in demos/specs/ for a spec, so one
// without a default spec breaks its slug there; shared code goes in shared/.
const notSpecs = Object.entries(modules)
  .filter(([, module]) => !module.default?.spec)
  .map(([file]) => file.replace(/^.*\//, ''));
const specModules = Object.entries({
  ...Object.fromEntries(
    Object.entries(json).map(([file, spec]) => [slugOf(file), { spec, setup: {} }]),
  ),
  ...Object.fromEntries(
    Object.entries(modules)
      .filter((entry): entry is [string, { default: SpecModule }] =>
        Boolean(entry[1].default?.spec),
      )
      .map(([file, module]) => [slugOf(file), module.default]),
  ),
});

const builtInKeys = new Set([
  '$state',
  '$item',
  '$index',
  '$bindState',
  '$bindItem',
  '$cond',
  '$then',
  '$else',
  '$computed',
  '$template',
  '$and',
  '$or',
]);
// The renderer resolves nothing else in a condition or a repeat's state path,
// so a directive or `$computed` there is never evaluated.
const conditionKeys = new Set(['$state', '$item', '$index', '$and', '$or']);
const directiveByKey = new Map(directives.map((directive) => [directive.name, directive]));
const builtInActions = new Set((catalog.schema.builtInActions ?? []).map((action) => action.name));

interface ComponentEntry {
  props: z.ZodObject;
  slots?: string[];
}
const components = catalog.data.components as unknown as Record<string, ComponentEntry>;

interface Binding {
  action: string;
  params?: Record<string, unknown>;
}
const bindingsOf = (map: Record<string, Binding | Binding[]> | undefined) =>
  Object.values(map ?? {}).flatMap((binding) => (Array.isArray(binding) ? binding : [binding]));

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExpression = (value: unknown): boolean =>
  Array.isArray(value)
    ? value.some(hasExpression)
    : isObject(value) &&
      Object.entries(value).some(([key, each]) => key.startsWith('$') || hasExpression(each));

interface Found {
  keys: Set<string>;
  computed: Set<string>;
  directives: Record<string, unknown>[];
}

// The renderer does not check a directive against its schema; a directive
// missing a field resolves to something wrong.
const walk = (value: unknown, found: Found) => {
  if (Array.isArray(value)) value.forEach((each) => walk(each, found));
  if (!isObject(value)) return;
  if (Object.keys(value).some((key) => directiveByKey.has(key))) found.directives.push(value);
  for (const [key, each] of Object.entries(value)) {
    if (key.startsWith('$')) found.keys.add(key);
    if (key === '$computed' && typeof each === 'string') found.computed.add(each);
    walk(each, found);
  }
};

// Each key is one the shape names, and a literal value fits it. A value
// holding an expression resolves only at render time, so it is not parsed.
const shapeProblems = (
  shape: Record<string, z.ZodType>,
  values: Record<string, unknown>,
  unknownKey: (key: string) => string,
  prefix = '',
): string[] =>
  Object.entries(values).flatMap(([key, value]) => {
    const schema = shape[key];
    if (!schema) return [unknownKey(key)];
    if (hasExpression(value)) return [];
    const parsed = schema.safeParse(value);
    return parsed.success
      ? []
      : [`${prefix}${key}: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`];
  });

// A param the binding leaves out must be one the action declares optional.
// Asking the schema whether it accepts undefined is not enough: z.unknown()
// does, and a handler would then write undefined.
const isOptional = (schema: z.ZodType) =>
  schema.def.type === 'optional' || schema.def.type === 'default';

const paramProblems = (
  name: string,
  definition: ActionDefinition,
  params: Record<string, unknown> = {},
): string[] => {
  const shape = definition.params.shape as Record<string, z.ZodType>;
  const missing = Object.entries(shape)
    .filter(([param, schema]) => !(param in params) && !isOptional(schema))
    .map(([param]) => `action ${name} needs param ${param}`);
  return [
    ...missing,
    ...shapeProblems(shape, params, (param) => `action ${name} has no param ${param}`, `${name} `),
  ];
};

const lintSpec = (spec: Spec, setup: SpecSetup = {}): string[] => {
  const problems = validateSpec(spec).issues.map(
    (issue) => `${issue.elementKey ?? 'spec'}: ${issue.message}`,
  );
  const actions = setup.actions ?? {};
  const handlers = setup.handlers?.(createStateStore(setup.initialState ?? {}), () => false) ?? {};
  const functions = setup.functions ?? {};

  for (const name of Object.keys(actions)) {
    if (!handlers[name]) problems.push(`setup: action ${name} has no handler`);
  }
  for (const name of Object.keys(handlers)) {
    if (!actions[name]) problems.push(`setup: handler ${name} is not a declared action`);
  }

  for (const [key, element] of Object.entries(spec.elements)) {
    const at = (message: string) => problems.push(`${key}: ${message}`);
    const entry = components[element.type];
    if (!entry) {
      at(`type ${element.type} is not in the catalog`);
      continue;
    }
    const found: Found = { keys: new Set(), computed: new Set(), directives: [] };

    const props = element.props ?? {};
    Object.values(props).forEach((value) => walk(value, found));
    shapeProblems(
      entry.props.shape as Record<string, z.ZodType>,
      props,
      (name) => `${element.type} has no prop ${name}`,
    ).forEach(at);

    const where = { keys: new Set<string>(), computed: new Set<string>(), directives: [] } as Found;
    walk(element.visible, where);
    walk((element.repeat as { statePath?: unknown } | undefined)?.statePath, where);
    for (const name of where.keys) {
      if (!conditionKeys.has(name)) at(`${name} cannot be read in visible or repeat`);
    }

    for (const slot of Object.keys(element.slots ?? {})) {
      if (slot === 'default' || !entry.slots?.includes(slot))
        at(`${element.type} has no slot ${slot}`);
    }

    const element_ = element as typeof element & { watch?: Record<string, Binding | Binding[]> };
    for (const binding of [...bindingsOf(element.on as never), ...bindingsOf(element_.watch)]) {
      walk(binding.params, found);
      if (builtInActions.has(binding.action)) continue;
      const action = actions[binding.action];
      if (!action) at(`action ${binding.action} is not declared in the module`);
      else paramProblems(binding.action, action, binding.params).forEach(at);
    }

    for (const name of found.computed) {
      if (!functions[name]) at(`$computed ${name} is not a function in the module`);
    }
    for (const name of found.keys) {
      if (!builtInKeys.has(name) && !directiveByKey.has(name))
        at(`${name} is neither a built-in expression nor a directive`);
    }
    for (const directive of found.directives) {
      const name = Object.keys(directive).find((key) => directiveByKey.has(key))!;
      const parsed = directiveByKey.get(name)!.schema.safeParse(directive);
      if (!parsed.success)
        at(
          `${name}: ${parsed.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('; ')}`,
        );
    }
  }
  return problems;
};

describe('specs', () => {
  test('every spec module is found', () => {
    expect(specModules.length).toBeGreaterThanOrEqual(50);
  });

  test('every module in the folder exports a spec', () => {
    expect(notSpecs).toEqual([]);
  });

  test.each(specModules)('%s', (_, { spec, setup }) => {
    expect(lintSpec(spec, setup)).toEqual([]);
  });
});

describe('the lint', () => {
  const specWith = (elements: Spec['elements']): Spec => ({ root: 'root', elements });
  const button = (extra: Record<string, unknown> = {}) => ({
    type: 'Button',
    props: { label: 'Go' },
    children: [],
    ...extra,
  });

  test.each<[string, Spec, string, SpecSetup?]>([
    ['structure', specWith({ root: { ...button(), children: ['missing'] } }), 'missing'],
    [
      'type',
      specWith({ root: { type: 'Carousel', props: {}, children: [] } }),
      'type Carousel is not in the catalog',
    ],
    [
      'prop name',
      specWith({ root: button({ props: { label: 'Go', colour: 'red' } }) }),
      'Button has no prop colour',
    ],
    [
      'prop value',
      specWith({ root: button({ props: { label: 'Go', icon: 'not-an-icon' } }) }),
      'icon:',
    ],
    [
      'slot',
      specWith({
        root: { type: 'Card', props: { title: 'A' }, slots: { footer: ['b'] }, children: [] },
        b: button(),
      }),
      'Card has no slot footer',
    ],
    [
      'action',
      specWith({ root: button({ on: { press: { action: 'launch' } } }) }),
      'action launch is not declared',
    ],
    [
      'watch action',
      specWith({ root: button({ watch: { '/a': { action: 'launch' } } }) }),
      'action launch is not declared',
    ],
    [
      'handler',
      specWith({ root: button() }),
      'setup: action notify has no handler',
      { actions: { notify } },
    ],
    [
      'declaration',
      specWith({ root: button() }),
      'setup: handler notify is not a declared action',
      { handlers: notifyHandler },
    ],
    [
      'param name',
      specWith({
        root: button({
          on: {
            press: { action: 'notify', params: { statePath: '/n', message: 'Hi', tone: 'calm' } },
          },
        }),
      }),
      'action notify has no param tone',
      { actions: { notify }, handlers: notifyHandler },
    ],
    [
      'missing param',
      specWith({
        root: button({ on: { press: { action: 'notify', params: { message: 'Hi' } } } }),
      }),
      'action notify needs param statePath',
      { actions: { notify }, handlers: notifyHandler },
    ],
    [
      'missing unknown param',
      specWith({
        root: button({ on: { press: { action: 'settle', params: { statePath: '/n' } } } }),
      }),
      'action settle needs param value',
      { actions: { settle }, handlers: settleHandler },
    ],
    [
      'param value',
      specWith({
        root: button({
          on: { press: { action: 'notify', params: { statePath: 3, message: 'Hi' } } },
        }),
      }),
      'notify statePath:',
      { actions: { notify }, handlers: notifyHandler },
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
      specWith({
        root: button({ visible: { $state: '/n', eq: { $count: { $state: '/items' } } } }),
      }),
      '$count cannot be read in visible or repeat',
    ],
    [
      'currency',
      specWith({ root: button({ props: { label: { $format: 'currency', value: 75 } } }) }),
      '$format: currency Name the currency',
    ],
    [
      'directive argument',
      specWith({
        root: button({ props: { label: { $pluralize: { $state: '/n' }, one: 'item' } } }),
      }),
      '$pluralize: other',
    ],
  ])('rejects a wrong %s', (_, spec, problem, setup) => {
    const problems = lintSpec(spec, setup);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain(problem);
  });

  test('passes a value with an expression without parsing it', () => {
    const spec = specWith({
      root: button({ props: { label: { $state: '/label' }, icon: { $state: '/icon' } } }),
    });
    expect(lintSpec(spec)).toEqual([]);
  });
});
