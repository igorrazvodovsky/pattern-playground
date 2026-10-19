import { defineCatalog, ValidationCheckSchema } from '@json-render/core';
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

export const tones = ['neutral', 'accent', 'success', 'danger'] as const;
const tone = z.enum(tones);

// What a message is for, as the notification pattern names it. Separate from
// `tone`, which only sets a label or control apart: a purpose also gives the
// message its icon, and every registry maps each purpose to one.
export const purposes = ['info', 'success', 'warning', 'danger'] as const;
const purpose = z.enum(purposes);

// What a field must hold, as data: json-render's checks ({ type, args,
// message }), run against the field's bound value. Every registry runs them
// when the form is submitted and again as the actor corrects the field.
const checks = z.array(ValidationCheckSchema).nullable();
const fieldValidation =
  'List `checks` ({ type: required | email | minLength | …, message }) to validate the bound value: they run when validateForm is dispatched, usually from a Form\'s `submit`, and again on each change once the field has been checked, so the message goes as soon as the value is fixed. The first failing check\'s message shows beneath the field, as `error` does, and `error` wins when both are set.';
const options = z.array(z.object({ value: z.string(), label: z.string() }));

// Icons are named by meaning; each registry maps a name to its own icon set.
// A spec that named Phosphor glyphs would be tied to the library that ships them.
export const iconNames = [
  'archive',
  'attach',
  'back',
  'cancel',
  'confirm',
  'decrease',
  'delete',
  'delete-confirm',
  'external',
  'generated',
  'guide',
  'history',
  'increase',
  'link',
  'more',
  'notifications',
  'open',
  'publish',
  'reasoning',
  'remove-person',
  'restore',
  'search',
  'transfer',
  'unchanged',
  'web',
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
        opens: z.boolean().nullable(),
        focusOnShow: z.boolean().nullable(),
      }),
      slots: ['default', 'suffix', 'actions'],
      description:
        'A bounded surface that groups related content. The `suffix` slot sits beside the title, for a short status such as a Badge, or a control that acts on the card. The `actions` slot holds the buttons that act on what the card shows, below its content. With `opens` the card stands for something the actor can open, such as the items behind a summary: its title is a button, pressing anywhere on the card presses it, and it emits `open`. A card that opens needs a `title`. Controls in `suffix` and `actions` stay separate presses. `focusOnShow` works as on a Button, for the title: set it on the card the actor opened, so that it takes focus when they come back to it.',
    },
    Text: {
      props: z.object({
        text: z.string(),
        size: z.enum(['small', 'body', 'large']).nullable(),
        muted: z.boolean().nullable(),
        highlight: z.boolean().nullable(),
        status: z.boolean().nullable(),
        purpose: purpose.nullable(),
      }),
      slots: ['default'],
      description:
        'A run of text. `highlight` marks it as changed or notable. With `status` the text is announced to assistive technology when it changes; keep such a Text rendered and empty rather than hidden. `purpose` makes it a short message in place, such as a result beside the control that caused it: it takes the purpose\'s colour, which replaces `muted`, and is led by its icon. Children render inline after the text.',
    },
    Callout: {
      props: z.object({
        title: z.string().nullable(),
        text: z.string(),
        purpose: purpose.nullable(),
      }),
      slots: ['actions'],
      description:
        'A message set apart in a box, inside the content it concerns, for information the actor should notice there. It stays while it applies and is not announced. `title` names what the message is about and leads it, set apart from `text`. `purpose` gives it its colour and icon; without one it is neutral. The `actions` slot holds a control that acts on what the message says, such as a plain Button that takes the next step; it follows the text.',
    },
    EmptyState: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        icon: z.enum(iconNames).nullable(),
      }),
      slots: ['actions'],
      description:
        'Stands in for content that is not there, in the place the content would be: `title` says what is missing or why, `description` what happens next or what the actor can do. `icon` names, by meaning, what would be here. The `actions` slot holds the buttons that would put something here or lead the actor on, the main one first, as `primary`.',
    },
    Sections: {
      props: z.object({
        affordance: z.enum(['tab-bar', 'details']),
      }),
      slots: ['default'],
      description:
        'Named parts of one piece of content, of which the actor sees some at a time. Its children are Section elements, in reading order. `affordance` is how the actor moves between them: a `tab-bar` shows one part at a time under a row of their names; `details` lists every name, each opening and closing its own part. The parts are the same under either affordance; pick the one the space and reading mode call for. The parts and the affordance are fixed once rendered: do not bind a title, show or hide a Section, or change `affordance` afterwards.',
    },
    Section: {
      props: z.object({
        title: z.string(),
      }),
      slots: ['default'],
      description: 'One named part inside Sections: `title` names it, and its children are its content.',
    },
    BulletList: {
      props: z.object({
        items: z.array(z.string()),
      }),
      description: 'A list of short pieces of text, read as content. Not interactive: rows that act are a List.',
    },
    DescriptionList: {
      props: z.object({
        items: z.array(z.object({ label: z.string(), value: z.string() })),
      }),
      description:
        'Labels paired with their values, one pair to a row, read as content: the attributes of one item in its full view, or a spec sheet. For a few attributes on a summary, use labelled Badges instead.',
    },
    Messages: {
      props: z.object({}),
      slots: ['default'],
      description:
        'A conversation, read top to bottom. Its children are Message elements, oldest first, and a Composer last when the actor can write the next message.',
    },
    Message: {
      props: z.object({
        from: z.enum(['actor', 'other']),
        parts: z.array(z.union([z.string(), z.object({ text: z.string(), note: z.string().nullable(), link: z.string().nullable() })])),
      }),
      slots: ['default'],
      description:
        'One message in Messages. `from` says who sent it: the actor, or the other side (a person or the system). `parts` is its text in order: plain runs as strings, and marked runs as { text, note, link } for a part the actor should notice. A marked run\'s `note` says why it is marked; it shows when the actor points at or focuses the run, and the run is underlined to say a note is there. A marked run\'s `link` ties it to the runs in other messages that stand for the same thing, such as a passage in a prompt and its summary in the answer; one link can join several runs. Pointing at or focusing a linked run keeps the runs on its link highlighted and drops the highlight from the other linked runs. With `note` and `link` both null the run is only highlighted. Keep the spaces between runs in the strings. Children render inside the message, after its text: controls the actor answers with in place, such as SelectableTags or a Slider, for a message that is a piece of interface rather than words. A message of controls alone has empty `parts`, and sits on the plain surface rather than in a bubble, so the controls read as interface rather than as text the actor sent.',
    },
    Composer: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
      }),
      slots: ['actions'],
      description:
        'Where the actor writes the next message in Messages: a text field, read by assistive technology as `label`, with the `actions` slot beneath it for plain Buttons that change what the message carries, such as attaching a file. Bind `value` with $bindState.',
    },
    Timeline: {
      props: z.object({
        density: z.enum(['normal', 'compact']).nullable(),
      }),
      slots: ['default'],
      description:
        'Events or steps in the order they happened, each with its own marker on a rail. Its children are TimelineEntry elements in reading order: newest first for a history, oldest first for work as it unfolds. `compact` draws smaller markers, for a dense trace. A Timeline inside a TimelineEntry is that entry\'s own steps: it drops the rail and reads as part of the entry.',
    },
    TimelineEntry: {
      props: z.object({
        title: z.string(),
        by: z.union([z.string(), z.object({ name: z.string(), href: z.string() })]).nullable(),
        time: z.string().nullable(),
        from: z.enum(['actor', 'other']).nullable(),
        pending: z.boolean().nullable(),
        expandable: z.boolean().nullable(),
        open: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'One event or step in a Timeline. `title` says what happened. `by` names who did it and leads the title, set apart: a string for a name with nowhere to go, such as the system, or { name, href } to make the name a link to that actor. `time` says when, beneath the entry. `from: actor` sets apart an entry the actor made themselves, such as the request the rest of a trace works on. `pending` marks a step still under way: the title says so, and the entry shows it is busy. Children are the entry\'s content beneath the title. With `expandable` they sit behind a disclosure that the title opens and closes, for detail the actor asks for, such as why the event happened; `open` says whether it is open. Bind `open` with $bindState, or $bindItem inside a repeat, so the entry keeps its state when the library switches.',
    },
    List: {
      props: z.object({
        borderless: z.boolean().nullable(),
      }),
      slots: ['default'],
      description: 'A vertical list of ListItem children, on a surface of its own. `borderless` drops the outline and keeps the surface.',
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
        'One row in a List, with optional secondary text in `description`. `checkbox` makes the row a checkbox, and `checked` says whether it is ticked. Bind `checked` with $bindItem inside a repeat, or $bindState, so that ticking the row writes to state; a checkbox row with a plain `checked` is for display: the library may still tick it on a press, but state does not change. `struck` strikes the label through, for a row that is still shown but no longer counts. The `suffix` slot holds trailing controls or indicators.',
    },
    Stat: {
      props: z.object({
        value: z.string(),
        unit: z.string().nullable(),
        verdict: z.string().nullable(),
        detail: z.string().nullable(),
        alert: z.boolean().nullable(),
      }),
      description:
        'One figure read at a glance, such as a count or an average, set larger than the text around it. `unit` follows the figure, smaller. `verdict` is a one-line reading of what the figure means (Up from 46 last cycle), `detail` the context beneath it. `alert` marks a figure that says something is wrong. Put it in a Card whose `title` names the figure, with a Badge for its trend in the card\'s `suffix`.',
    },
    Badge: {
      props: z.object({
        label: z.string().nullable(),
        text: z.string(),
        icon: z.enum(iconNames).nullable(),
        tone: tone.nullable(),
        pill: z.boolean().nullable(),
        pulse: z.boolean().nullable(),
      }),
      description:
        'A short count or status label, or one attribute of an item. With `label` it is an attribute: `label` names it (Category) and `text` is its value (Chairs); lay several out in a horizontal Stack. `icon` leads the text, named by meaning, such as `increase` for a trend. `tone` sets it apart: `success` and `danger` say whether what it shows is good or bad, which the spec decides, since the same direction can be either. `pulse` draws attention to a change.',
    },
    Tag: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        pending: z.boolean().nullable(),
        opens: z.boolean().nullable(),
        focusOnShow: z.boolean().nullable(),
        removeLabel: z.string().nullable(),
        focusNext: z.string().nullable(),
      }),
      description:
        'A value applied to something, such as an active filter or a classification, or a value a trace names, such as a query that was run or a source that was read, shown as a short label. A count or status read in place is a Badge; one the actor presses to reach what it counts is a Tag that opens. `icon` names, by meaning, where the value came from or what kind it is. `pending` marks a value that is still being worked out: the label says so, and the tag shows it is busy. With `opens` the tag stands for something the actor can open, such as a short summary that leads to what it summarises: the tag is a button and emits `open`, and `focusOnShow` works as on a Button. A tag that opens has no remove button. With `removeLabel` the tag carries a button, named by that label, that emits `remove`; `focusNext` works as on a Button, for when removing the tag takes the button away while it has focus. Lay several out in a horizontal Stack.',
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
        focusOnShow: z.boolean().nullable(),
        focusNext: z.string().nullable(),
        submit: z.boolean().nullable(),
      }),
      description:
        'A button. `danger` marks an action that destroys something. `icon` names the icon by meaning. With `hideLabel` only the icon shows and the label is read by assistive technology. `disabled` is for an action that is unavailable or already in progress; a button whose input is not yet valid stays enabled and reports what is wrong when pressed. `expanded` marks a button that shows and hides another part of the interface. `initialFocus` makes it take focus when its Dialog opens. `focusOnShow` makes it take focus when it appears because of what the actor did, such as the Back button of a view they just opened; it does not take focus when the demo first renders, or from elsewhere on the page. `focusNext` names the label of the Button that takes focus if this one disappears while it has focus, because a press or a timer hid it or removed what it sits in: the first Button with that label after where this one was, else the last one before it. Name the control that replaces it (Cancel for an armed Delete) or its counterpart in the next row. Without `focusNext`, or with no match, focus moves to the demo. `submit` makes it the button that submits the Form it sits in. Emits `press`.',
    },
    Input: {
      props: z.object({
        label: z.string(),
        hideLabel: z.boolean().nullable(),
        type: z.enum(['text', 'email']).nullable(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
        error: z.string().nullable(),
        checks,
        initialFocus: z.boolean().nullable(),
      }),
      description:
        `A single-line text field. With \`hideLabel\` the label is read by assistive technology only. \`type\` "email" asks for an email address (and the keyboard for one); it does not check the value, a check does. \`error\` marks the value as wrong and shows the message beneath the field; it is announced when it appears. Set it when the actor submits, not while they type, and say how to fix the value. ${fieldValidation} \`initialFocus\` makes it take focus when its Dialog opens. Bind \`value\` with $bindState.`,
    },
    Textarea: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
      }),
      description: 'A multi-line text field that grows with its text. Bind `value` with $bindState.',
    },
    Select: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        options,
        value: z.string().nullable(),
        error: z.string().nullable(),
        checks,
      }),
      description:
        `Choose one value from a short list that does not need to be seen all at once. \`placeholder\` shows while nothing is chosen (an empty value) and cannot be chosen itself. ${fieldValidation} Bind \`value\` with $bindState.`,
    },
    RadioGroup: {
      props: z.object({
        label: z.string(),
        options,
        value: z.string().nullable(),
      }),
      description:
        'Choose one value from a few options, all shown. `label` names the question the options answer. Bind `value` with $bindState.',
    },
    Combobox: {
      props: z.object({
        label: z.string(),
        hideLabel: z.boolean().nullable(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
        groups: z.array(z.object({ heading: z.string().nullable(), options })),
      }),
      description:
        'A text field with a list of candidates beneath it, which the actor can pick from instead of typing the rest. The list shows `groups` exactly as given, in order, each under its `heading` if it has one, and filters nothing itself: which candidates show for what has been typed is the spec\'s decision, usually a $computed over the bound value. A group with no options is left out, and with none to show the list stays closed. The list opens when the field takes focus or the actor types, and closes on Escape, when focus leaves, or when a candidate is picked; nothing is highlighted until the actor moves to a candidate with the arrow keys or the pointer, so Enter picks the highlighted candidate and otherwise leaves what was typed. Picking writes the candidate\'s `value` to `value`, then emits `select`. With `hideLabel` the label is read by assistive technology only. Bind `value` with $bindState.',
    },
    SelectableTags: {
      props: z.object({
        label: z.string(),
        hideLabel: z.boolean().nullable(),
        options,
        value: z.array(z.string()).nullable(),
      }),
      description:
        'Choose any number of values from a few short options, each a tag the actor selects and clears, laid out in a row. `label` names the question the options answer; with `hideLabel` it is read by assistive technology only, for when the question is already on screen. Bind `value`, the selected options\' values, with $bindState.',
    },
    Slider: {
      props: z.object({
        label: z.string(),
        hideLabel: z.boolean().nullable(),
        min: z.number(),
        max: z.number(),
        step: z.number().nullable(),
        value: z.number().nullable(),
        showBounds: z.boolean().nullable(),
      }),
      description:
        'Choose a number between `min` and `max` by dragging or with the arrow keys, for an amount where the rough position matters more than the exact figure. The current value shows beside the track. `step` is the smallest change (1 by default). `showBounds` shows `min` and `max` at the ends of the track. With `hideLabel` the label is read by assistive technology only. Bind `value` with $bindState.',
    },
    Checkbox: {
      props: z.object({
        label: z.string(),
        checked: z.boolean().nullable(),
      }),
      description: 'A single yes-or-no choice beside its label. Bind `checked` with $bindState.',
    },
    Form: {
      props: z.object({
        label: z.string().nullable(),
      }),
      slots: ['default'],
      description:
        'Fields that are sent together. Pressing Enter in a single-line field, or the Button marked `submit`, emits `submit`; the browser\'s own validation is off, so bind validateForm (with a `statePath`) to `submit` and read `valid` from there before acting. `label` names the form for assistive technology when the page around it does not.',
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
