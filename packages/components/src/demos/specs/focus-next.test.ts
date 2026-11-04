import { readdirSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// `focusNext` and `returnFocus` name a control by its `focusKey`, and a key
// that is renamed or missing fails silently, so each name is checked against
// the keys in the same spec. A key may be an expression, such as an item's id;
// it then matches a name with the same expression. A key holding several
// names, as a template, answers to each literal name in it. A toast names a
// key in the toast an action pushes; one a spec module builds is not checked.

interface Element {
  type: string;
  props?: Record<string, unknown>;
  on?: unknown;
}

const textOf = (key: unknown) =>
  typeof key === 'string'
    ? key
    : typeof key === 'object' && key !== null && '$template' in key
      ? String(key.$template)
      : '';
const literalNames = (key: unknown) =>
  textOf(key)
    .split(/\s+/)
    .filter((name) => name && !name.includes('${'));

// The names in an element's props, and in what its actions push.
const namesIn = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value.flatMap(namesIn);
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([field, inner]) =>
    field === 'focusNext' || field === 'returnFocus' ? [inner] : namesIn(inner),
  );
};

// A key counts only where the registries render it: some types take the prop
// but draw no control for it without another prop. A prop bound to an
// expression may be true, so it counts as set.
const set = (value: unknown) => value != null && value !== false;
const rendersKey = ({ type, props = {} }: Element) => {
  switch (type) {
    case 'Button':
    case 'FilterTag':
    case 'Menu':
    case 'Reference':
      return true;
    case 'Tag':
      return set(props.opens) || set(props.removeLabel);
    case 'Combobox':
      return set(props.popup);
    case 'Card':
    case 'Item':
      return set(props.opens);
    default:
      return false;
  }
};

const dir = new URL('./', import.meta.url);
const specs = readdirSync(dir).filter((file) => file.endsWith('.json'));

const read = (file: string) =>
  Object.values(
    (JSON.parse(readFileSync(new URL(file, dir), 'utf8')) as { elements: Record<string, Element> })
      .elements,
  );

describe('focus keys', () => {
  it.each(specs)('%s names only keys it has', (file) => {
    const elements = read(file);
    const keys = new Set(
      elements
        .filter(rendersKey)
        .map((element) => element.props?.focusKey)
        .flatMap((key) =>
          typeof key === 'string' ? literalNames(key) : [key, ...literalNames(key)],
        )
        .map((key) => JSON.stringify(key)),
    );
    const named = elements
      .flatMap((element) => namesIn([element.props, element.on]))
      .filter((name) => name != null)
      .map((name) => JSON.stringify(name));
    expect(named.filter((name) => !keys.has(name))).toEqual([]);
  });

  // A key answers to each of its names, never to several at once.
  it.each(specs)('%s names one key at a time', (file) => {
    const spaced = read(file)
      .flatMap((element) => namesIn([element.props, element.on]))
      .filter((name) => /\s/.test(textOf(name)));
    expect(spaced).toEqual([]);
  });

  // Rows a `repeat` stamps out share one element, so they are not counted.
  // Names built from data, such as an item's id, are not checked.
  it.each(specs)('%s gives each control its own key', (file) => {
    const literal = read(file).flatMap((element) => [
      ...new Set(literalNames(element.props?.focusKey)),
    ]);
    expect(literal.filter((name, index) => literal.indexOf(name) !== index)).toEqual([]);
  });
});
