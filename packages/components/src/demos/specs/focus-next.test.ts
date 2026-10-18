import { readdirSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// A Button's `focusNext` names another Button by its label. If the label is
// renamed, the match fails silently and focus falls back to the demo, so each
// name is checked against the Button labels in the same spec.

interface Element { type: string; props?: { label?: unknown; focusNext?: unknown } }

const dir = new URL('./', import.meta.url);
const specs = readdirSync(dir).filter(file => file.endsWith('.json'));

describe('focusNext', () => {
  it.each(specs)('%s names only Button labels it has', file => {
    const { elements } = JSON.parse(readFileSync(new URL(file, dir), 'utf8')) as { elements: Record<string, Element> };
    const buttons = Object.values(elements).filter(element => element.type === 'Button');
    const labels = new Set(buttons.map(button => button.props?.label));
    const named = buttons.map(button => button.props?.focusNext).filter(name => typeof name === 'string');
    expect(named.filter(name => !labels.has(name))).toEqual([]);
  });
});
