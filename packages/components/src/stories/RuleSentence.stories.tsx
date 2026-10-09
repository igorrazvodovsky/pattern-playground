import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { RuleSentence, type RulePart } from "../components/rule-sentence";
import { createStateStore } from "@json-render/core";
import { SpecDemo } from "../catalog/SpecDemo";
import { registry } from "../catalog/registries/pp";
import ruleComposition from "../demos/specs/rule-composition";

// Someone who wants the system to keep acting on their behalf reads and edits
// the rule as one sentence. Each underlined part opens the values that can go
// there; the plus adds a condition and the cross removes one.

const meta = {
  title: "Components/Rule sentence",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const genres = ['country', 'folk', 'jazz', 'ambient'];

const PlaylistRule = () => {
  const [genre, setGenre] = useState('country');
  const [played, setPlayed] = useState<string | null>('never');
  const parts = useMemo<RulePart[]>(() => [
    'Add a song to this playlist when its genre is ',
    {
      id: 'genre', kind: 'choice', name: 'Change the genre', label: genre, value: [genre],
      options: genres.map(g => ({ value: g, label: g })),
    },
    ...(played ? [
      ', and I have ',
      {
        id: 'played', kind: 'choice' as const, name: 'Change how often it was played',
        label: played === 'never' ? 'never played it' : 'played it this week', value: [played],
        options: [
          { value: 'never', label: 'never played it' },
          { value: 'week', label: 'played it this week' },
        ],
      },
      { id: 'played', kind: 'remove' as const, name: 'Remove this condition' },
    ] : [
      { id: 'add', kind: 'add' as const, name: 'Add a condition', options: [{ value: 'played', label: 'How often I played it' }] },
    ]),
    '.',
  ], [genre, played]);

  return (
    <RuleSentence
      label="Playlist rule"
      parts={parts}
      onChange={(id, value) => (id === 'genre' ? setGenre(value[0]) : setPlayed(value[0]))}
      onAdd={() => setPlayed('never')}
      onRemove={() => setPlayed(null)}
    />
  );
};

export const Basic: Story = {
  render: () => <PlaylistRule />,
};

// The pattern page's demo: the rule-composition spec rendered through this
// library's registry, with the store and handlers from the module beside it.
const RuleCompositionSpec = () => {
  const [{ store, handlers }] = useState(() => {
    const { setup } = ruleComposition;
    const store = createStateStore(setup.initialState);
    return { store, handlers: setup.handlers(store) };
  });
  return (
    <SpecDemo
      spec={ruleComposition.spec}
      registry={registry}
      registryName="pp"
      store={store}
      handlers={handlers}
      functions={ruleComposition.setup.functions}
    />
  );
};

export const WithPreview: Story = {
  render: () => <RuleCompositionSpec />,
};
