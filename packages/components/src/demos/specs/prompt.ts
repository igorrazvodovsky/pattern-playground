import type { ComputedFunction, Spec } from '@json-render/core';
import { materialCategory } from '@shared/data/reference-utils';
import type { SpecSetup } from '../../catalog/SpecDemo';
import type { MentionPart, Paragraph } from '../../catalog/registries/mention-editor';
import spec from './prompt.json' with { type: 'json' };

export const materials: MentionPart[] = materialCategory.children.map(item => ({
  id: item.id,
  label: item.name,
  type: item.type,
}));

const maxMatches = 8;

export const material = (id: string): MentionPart => {
  const found = materials.find(item => item.id === id);
  if (!found) throw new Error(`No document ${id}`);
  return found;
};

export const candidates: ComputedFunction = args => {
  const query = typeof args.query === 'string' ? args.query.trim().toLocaleLowerCase() : '';
  const all = Array.isArray(args.materials) ? (args.materials as MentionPart[]) : [];
  const options = all.filter(item => item.label.toLocaleLowerCase().includes(query)).slice(0, maxMatches);
  return [{ heading: 'Documents', options }];
};

export const promptDemo = ({ content, placeholder }: { content: Paragraph[]; placeholder: string }) => ({
  spec: spec as Spec,
  setup: {
    initialState: { content, placeholder, query: null, materials },
    functions: { candidates },
  } satisfies SpecSetup,
});
