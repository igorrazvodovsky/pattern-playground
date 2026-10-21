import { readdirSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// `focusNext` and `returnFocus` name a control by its `focusKey`, and a key
// that is renamed or missing fails silently, so each name is checked against
// the keys in the same spec. A key may be an expression, such as an item's id;
// it then matches a name with the same expression.

interface Element {
  type: string;
  props?: Record<string, unknown>;
}

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
        .map((key) => JSON.stringify(key)),
    );
    const named = elements
      .flatMap((element) => [element.props?.focusNext, element.props?.returnFocus])
      .filter((name) => name != null)
      .map((name) => JSON.stringify(name));
    expect(named.filter((name) => !keys.has(name))).toEqual([]);
  });

  // Rows a `repeat` stamps out share one element, so they are not counted.
  it.each(specs)('%s gives each control its own key', (file) => {
    const literal = read(file)
      .map((element) => element.props?.focusKey)
      .filter((key) => typeof key === 'string');
    expect(literal.filter((key, index) => literal.indexOf(key) !== index)).toEqual([]);
  });
});
