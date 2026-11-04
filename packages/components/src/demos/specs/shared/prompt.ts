import type { ComputedFunction, Spec } from '@json-render/core';
import { materialCategory } from '@shared/data/reference-utils';
import type { SpecSetup } from '../../../catalog/SpecDemo';
import type { MentionPart, Paragraph } from '../../../catalog/behaviour/mention-editor';
import { matchesQuery, maxMentionMatches, mentionQuery, toMention } from './mentions';
import spec from './prompt.json' with { type: 'json' };

export const materials: MentionPart[] = materialCategory.children.map(toMention);

export const material = (id: string): MentionPart => {
  const found = materials.find((item) => item.id === id);
  if (!found) throw new Error(`No document ${id}`);
  return found;
};

export const candidates: ComputedFunction = (args) => {
  const query = mentionQuery(args.query);
  const all = Array.isArray(args.materials) ? (args.materials as MentionPart[]) : [];
  const options = all
    .filter(matchesQuery(query))
    .slice(0, maxMentionMatches)
    .map((item) => ({ ...item, icon: 'document' }));
  return [{ heading: 'Documents', options }];
};

export const promptDemo = ({
  content,
  placeholder,
}: {
  content: Paragraph[];
  placeholder: string;
}) => ({
  spec: spec as Spec,
  setup: {
    initialState: { content, placeholder, query: null, materials },
    functions: { candidates },
  } satisfies SpecSetup,
});
