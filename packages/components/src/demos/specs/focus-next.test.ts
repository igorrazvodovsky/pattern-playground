import { readdirSync, readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

// `focusNext` names a button by its label, and a renamed label fails silently,
// so each name is checked against the labels in the same spec.

interface Element { type: string; props?: { label?: unknown; removeLabel?: unknown; focusNext?: unknown } }

const dir = new URL('./', import.meta.url);
const specs = readdirSync(dir).filter(file => file.endsWith('.json'));

describe('focusNext', () => {
  it.each(specs)('%s names only button labels it has', file => {
    const { elements } = JSON.parse(readFileSync(new URL(file, dir), 'utf8')) as { elements: Record<string, Element> };
    const buttons = Object.values(elements).filter(element => element.type === 'Button');
    const tags = Object.values(elements).filter(element => element.type === 'Tag');
    const labels = new Set([...buttons.map(button => button.props?.label), ...tags.map(tag => tag.props?.removeLabel)]);
    const named = [...buttons, ...tags].map(element => element.props?.focusNext).filter(name => typeof name === 'string');
    expect(named.filter(name => !labels.has(name))).toEqual([]);
  });
});
