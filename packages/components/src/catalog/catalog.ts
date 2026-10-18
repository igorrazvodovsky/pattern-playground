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
export const iconNames = [
  'archive',
  'cancel',
  'delete',
  'delete-confirm',
  'history',
  'publish',
  'remove-person',
  'restore',
  'transfer',
] as const;

// How long a toast stays. The window is part of the transient-feedback
// pattern, not a library default: a toast that offers an action has to stay
// long enough for the actor to notice it, decide and act. Every registry
// dismisses its toasts on this schedule, paused while the pointer or focus is
// on a toast.
export const toastDuration = { plain: 4000, withAction: 8000 } as const;

// How long an armed inline confirmation waits before it reverts. Like the
// toast window, it belongs to the pattern: long enough to confirm on purpose,
// short enough that an armed control left alone does not stay armed.
export const confirmationWindow = 4000;

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
      slots: ['default', 'suffix', 'actions'],
      description:
        'A bounded surface that groups related content. The `suffix` slot sits beside the title, for a short status such as a Badge. The `actions` slot holds the buttons that act on what the card shows, below its content.',
    },
    Text: {
      props: z.object({
        text: z.string(),
        size: z.enum(['small', 'body', 'large']).nullable(),
        muted: z.boolean().nullable(),
        highlight: z.boolean().nullable(),
        status: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'A run of text. `highlight` marks it as changed or notable. With `status` the text is announced to assistive technology when it changes; keep such a Text rendered and empty rather than hidden. Children render inline after the text.',
    },
    BulletList: {
      props: z.object({
        items: z.array(z.string()),
      }),
      description: 'A list of short pieces of text, read as content. Not interactive: rows that act are a List.',
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
        struck: z.boolean().nullable(),
      }),
      slots: ['default', 'suffix'],
      description:
        'One row in a List, with optional secondary text in `description`. `checkbox` makes the row a checkbox. `struck` strikes the label through, for a row that is still shown but no longer counts. The `suffix` slot holds trailing controls or indicators.',
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
        variant: z.enum(['default', 'primary', 'plain', 'danger']).nullable(),
        disabled: z.boolean().nullable(),
        expanded: z.boolean().nullable(),
        initialFocus: z.boolean().nullable(),
      }),
      description:
        'A button. `danger` marks an action that destroys something. `icon` names the icon by meaning. With `hideLabel` only the icon shows and the label is read by assistive technology. `expanded` marks a button that shows and hides another part of the interface. `initialFocus` makes it take focus when its Dialog opens. Emits `press`.',
    },
    Input: {
      props: z.object({
        label: z.string(),
        hideLabel: z.boolean().nullable(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
        initialFocus: z.boolean().nullable(),
      }),
      description:
        'A single-line text field. With `hideLabel` the label is read by assistive technology only. `initialFocus` makes it take focus when its Dialog opens. Bind `value` with $bindState.',
    },
    Dialog: {
      props: z.object({
        title: z.string(),
        open: z.boolean().nullable(),
        alert: z.boolean().nullable(),
        description: z.string().nullable(),
      }),
      slots: ['default', 'actions'],
      description:
        'A window over the page that blocks it until closed, for a decision the actor has to make before going on. The `actions` slot holds its buttons. Bind `open` with $bindState; closing the dialog (Escape, the close button) writes false back. `description` is the message the decision turns on, shown first and read out with the title when the dialog opens. `alert` marks a confirmation of something hard to undo: it is announced as an alert and a click outside does not close it. Focus starts on the element marked `initialFocus` (for an alert, the least destructive action, such as Cancel), otherwise on the first control.',
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
    Toasts: {
      props: z.object({
        toasts: z.array(
          z.looseObject({
            id: z.string(),
            message: z.string(),
            actionLabel: z.string().nullable(),
          }),
        ),
        pressed: z.unknown().nullable(),
      }),
      description:
        'Short messages over the page that leave by themselves, the newest nearest the actor. A toast without an action stays about 4 seconds; one with `actionLabel` offers that single action and stays at least 8. The timer pauses while the pointer or focus is on a toast. Bind `toasts` with $bindState and add a toast with pushState ({ id: "$id", message, actionLabel }); a toast the actor closes or that times out is removed from the list. Pressing a toast\'s action writes the whole toast to `pressed` (bind with $bindState), emits `action`, and closes it. A toast may carry fields of its own for the action to read.',
    },
    // A composite: the library has to supply the whole thing. Its input is
    // already data (a tree of sentence parts), so it can be named here, but a
    // catalog cannot build it out of the types above.
    RuleBuilder: {
      props: z.object({
        label: z.string(),
        tree: z.object({
          lead: z.array(z.unknown()),
          where: z.unknown(),
          tail: z.array(z.unknown()).nullable(),
        }),
        edit: z.unknown().nullable(),
      }),
      description:
        'A rule shown as one statement whose condition may hold groups. `lead` (the words before the condition) and `tail` (what follows it, if anything) are sentence parts: fixed words (strings) and slots ({ id, kind: choice | add | remove, name, label, options, value, multiple }). `where` is a group ({ id, head, items, addCondition, addGroup, remove }): `head` is a choice slot between all and any, `items` are lines ({ id, parts, remove }) or nested groups, `addCondition` is an add slot over fields and `addGroup` an add slot with one option. A flat group of all reads inline, without its head, so switching it to any goes through adding a group; any other group breaks into indented lines under its head. Bind `edit` with $bindState: before emitting `change`, `add` or `remove`, the component writes { kind, slotId, value } there.',
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
      description: 'Apply an edit written by a RuleBuilder ({ kind, slotId, value }) to the draft rule.',
    },
    notify: {
      params: z.object({ statePath: z.string(), message: z.string() }),
      description:
        'Write a short message to `statePath` and clear it again after a few seconds. Pair with a Text that has `status` and reads that path.',
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
  notify: async () => {},
};
