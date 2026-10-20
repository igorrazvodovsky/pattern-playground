import type { Spec } from '@json-render/core';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { isSlot, type Paragraph, type SlotPart } from '../../catalog/registries/mention-editor';
import { candidates, material, materials } from './shared/prompt';
import spec from './prompt-template.json' with { type: 'json' };

const slot = (id: string, label: string, required = false, value = ''): SlotPart => ({ slot: id, label, required, value });

const template = (values: Record<string, string> = {}, sources: Paragraph = []): Paragraph[] => [
  ['Help me ', slot('task', 'the task', true, values.task), ' for ', slot('audience', 'who it is for', false, values.audience), '.'],
  ['The result should ', slot('outcome', 'the outcome you want', true, values.outcome), '.'],
  ['Context: ', slot('context', 'domain, situation, goal', false, values.context)],
  ['Constraints: ', slot('constraints', 'length, tone, words to avoid', false, values.constraints)],
  ['Work from ', slot('examples', 'examples or materials', false, values.examples), ...sources, '.'],
  ['Hand back ', slot('output', 'the form of the answer', false, values.output), '.'],
];

const example = template(
  {
    task: 'write a brief for the packaging redesign',
    audience: "the supplier's design team",
    outcome: 'use a third less packaging, with no more breakage',
    context: 'flat-pack furniture shipped across Europe',
    constraints: 'two pages at most, plain language, no supplier names',
    examples: "last year's brief",
    output: 'a brief with a list of open questions',
  },
  [', ', material('doc-6'), ' and ', material('doc-5')],
);

// The joining word is part of the message, so it follows the page's
// language rather than the actor's formatting locale.
const quoted = (labels: string[]) =>
  new Intl.ListFormat(document.documentElement.lang || undefined, { type: 'conjunction' }).format(
    labels.map(label => `“${label}”`),
  );

const required = template().flat().filter(isSlot).filter(part => part.required);

export default {
  spec: spec as Spec,
  setup: {
    initialState: { content: template(), template: template(), example, query: null, materials, sent: false },
    functions: {
      candidates,
      missing: args => {
        if (args.sent !== true || !Array.isArray(args.content)) return '';
        const filled = new Set(
          (args.content as Paragraph[])
            .flat()
            .filter(isSlot)
            .filter(part => part.value.trim() !== '')
            .map(part => part.slot),
        );
        const empty = required.filter(part => !filled.has(part.slot)).map(part => part.label);
        return empty.length > 0 ? `Fill in ${quoted(empty)} before sending.` : '';
      },
    },
  } satisfies SpecSetup,
};
