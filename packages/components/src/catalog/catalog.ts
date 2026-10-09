import { defineCatalog } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';

// The component vocabulary switchable demos are written in. Types are named at
// component altitude (Card, List, Button), not after what a pattern uses them
// for: one component means different things in different patterns, and that
// meaning lives in the spec (props, structure, bound actions), not in the type
// name. Each registry in ./registries maps these types onto one library.
//
// Cut to what the specs in demos/specs/ need. A type joins when a spec needs
// it and every registry can render it, or says plainly that it cannot.

const tone = z.enum(['neutral', 'accent', 'danger']);

// Icons are named by meaning; each registry maps a name to its own icon set.
// A spec that named Phosphor glyphs would be tied to the library that ships them.
export const iconNames = ['cancel', 'delete', 'delete-confirm', 'history'] as const;

export const catalog = defineCatalog(schema, {
  components: {
    Stack: {
      props: z.object({
        direction: z.enum(['vertical', 'horizontal']).nullable(),
        gap: z.enum(['none', 's', 'm', 'l']).nullable(),
        align: z.enum(['start', 'center', 'baseline']).nullable(),
      }),
      slots: ['default'],
      description: 'Lays children out in a column (default) or a row.',
    },
    Grid: {
      props: z.object({
        minColumnWidth: z.enum(['s', 'm', 'l']).nullable(),
      }),
      slots: ['default'],
      description: 'Lays children out in as many equal columns as fit.',
    },
    Card: {
      props: z.object({
        title: z.string().nullable(),
      }),
      slots: ['default'],
      description: 'A bounded surface that groups related content.',
    },
    Text: {
      props: z.object({
        text: z.string(),
        size: z.enum(['small', 'body', 'large']).nullable(),
        muted: z.boolean().nullable(),
        highlight: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'A run of text. `highlight` marks it as changed or notable. Children render inline after the text.',
    },
    List: {
      props: z.object({
        borderless: z.boolean().nullable(),
      }),
      slots: ['default'],
      description: 'A vertical list of ListItem children.',
    },
    ListItem: {
      props: z.object({
        label: z.string(),
        description: z.string().nullable(),
        checkbox: z.boolean().nullable(),
        checked: z.boolean().nullable(),
      }),
      slots: ['default', 'suffix'],
      description:
        'One row in a List, with optional secondary text in `description`. `checkbox` makes the row a checkbox. The `suffix` slot holds trailing controls or indicators.',
    },
    Badge: {
      props: z.object({
        text: z.string(),
        tone: tone.nullable(),
        pill: z.boolean().nullable(),
        pulse: z.boolean().nullable(),
      }),
      description: 'A short count or status label. `pulse` draws attention to a change.',
    },
    Button: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        hideLabel: z.boolean().nullable(),
        variant: z.enum(['default', 'primary', 'plain']).nullable(),
        disabled: z.boolean().nullable(),
        expanded: z.boolean().nullable(),
      }),
      description:
        'A button. `icon` names the icon by meaning. With `hideLabel` only the icon shows and the label is read by assistive technology. `expanded` marks a button that shows and hides another part of the interface. Emits `press`.',
    },
    Drawer: {
      props: z.object({
        title: z.string(),
        open: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'A panel at the side of the screen that does not block the page behind it. Bind `open` with $bindState; closing the drawer writes false back.',
    },
    // A composite: the library has to supply the whole thing. Its input is
    // already data (the sentence as parts), so it can be named here, but a
    // catalog cannot build it out of the types above.
    RuleSentence: {
      props: z.object({
        label: z.string(),
        parts: z.array(z.unknown()),
        edit: z.unknown().nullable(),
      }),
      description:
        'A rule shown as one sentence: `parts` are fixed words (strings) and slots ({ id, kind: choice | add | remove, name, label, options, value, multiple }). Each slot opens a list of what can go there. Bind `edit` with $bindState: before emitting `change`, `add` or `remove`, the component writes { kind, slotId, value } there.',
    },
  },
  actions: {
    arm: {
      params: z.object({ item: z.string() }),
      description:
        'Arm a confirmation on one item: sets its `armed` field and clears it again after a few seconds. `item` is the item\'s state path ({ "$item": "" } inside a repeat). Cancel and confirm need no custom action: setState on `armed`, removeState on the item.',
    },
    editRule: {
      params: z.object({ edit: z.unknown() }),
      description: 'Apply an edit written by a RuleSentence ({ kind, slotId, value }) to the draft rule.',
    },
    updatePreview: {
      params: z.object({}),
      description: 'Recompute the preview of a draft rule against past events. Bind it to a watch on the rule.',
    },
  },
});

export type Catalog = typeof catalog;

// Actions are demo behaviour, not library behaviour: the module beside each
// spec supplies the handlers (SpecDemo passes them to the provider). Registries
// still have to name every catalog action, so they share these no-ops.
export const actionsSuppliedBySpecs = {
  arm: async () => {},
  editRule: async () => {},
  updatePreview: async () => {},
};
