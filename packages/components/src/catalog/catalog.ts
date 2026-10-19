import { defineCatalog, ValidationCheckSchema } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';
import { attributeIcons } from '@shared/data/bindings';

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
// An item named in text: what it is called, and what kind of item it is.
const mention = z.object({ id: z.string(), label: z.string(), type: z.string() });
// A blank in a template's text: what goes in it, and what the actor wrote there.
const slot = z.object({ slot: z.string(), label: z.string(), required: z.boolean().nullable(), value: z.string() });

// Icons are named by meaning; each registry maps a name to its own icon set.
// A spec that named Phosphor glyphs would be tied to the library that ships them.
// The names that stand for a kind of attribute (category, price, regions) are
// the ones entity bindings give their attributes (attributeIcons), so a spec
// can pass a binding's icon straight through.
const interfaceIcons = [
  'archive',
  'ascending',
  'attach',
  'back',
  'cancel',
  'cards',
  'clear',
  'columns',
  'confirm',
  'decrease',
  'delete',
  'delete-confirm',
  'descending',
  'detail',
  'example',
  'external',
  'filter',
  'full',
  'generated',
  'group',
  'guide',
  'history',
  'in-place',
  'increase',
  'link',
  'material',
  'mention',
  'more',
  'move',
  'next',
  'notifications',
  'open',
  'part',
  'popover',
  'previous',
  'product',
  'publish',
  'reasoning',
  'remove-person',
  'restore',
  'rows',
  'saved',
  'search',
  'send',
  'settings',
  'show',
  'side-by-side',
  'sort',
  'suggest',
  'summary',
  'table',
  'transfer',
  'unchanged',
  'web',
] as const;

export const iconNames = [...interfaceIcons, ...attributeIcons] as const;

// How long a toast stays. The window is part of the transient-feedback
// pattern, not a library default: a toast that offers an action has to stay
// long enough for the actor to notice it, decide and act. Every registry
// dismisses its toasts on this schedule, paused while the pointer or focus is
// on a toast.
export const toastDuration = { plain: 4000, withAction: 8000 } as const;

// How long something dragged has to be held over a closed group before the
// group opens, so the drop can be aimed rather than guessed at. Atlassian's
// figure for the same gesture in their tree components, and the one the
// Finder's spring-loaded folders trained everyone on.
export const springOpen = 500;

// How long an armed inline confirmation waits before it reverts. Like the
// toast window, it belongs to the pattern: long enough to confirm on purpose,
// short enough that an armed control left alone does not stay armed.
export const confirmationWindow = 4000;

// How a reference's preview follows the pointer and focus. Like the toast
// window, it belongs to the pattern; ItemInteraction keeps it.
export { previewTiming } from '../components/item-view/preview-timing';

export const catalog = defineCatalog(schema, {
  components: {
    Stack: {
      props: z.object({
        direction: z.enum(['vertical', 'horizontal']).nullable(),
        gap: z.enum(['none', 's', 'm', 'l']).nullable(),
        align: z.enum(['start', 'center', 'baseline']).nullable(),
        label: z.string().nullable(),
        dropTarget: z.boolean().nullable(),
        dropped: z.string().nullable(),
      }),
      slots: ['default'],
      description:
        'Lays children out in a column (default) or a row. `label` names what the children are a group of, such as one of several lists in a detail: the Stack becomes a region of that name for assistive technology. A visible caption for the group is a separate Text. With `dropTarget` the Stack takes what is dragged in the same demo, rows of a draggable DescriptionList or Cards with a `dragId`: it is marked while a row is over it, and a drop writes the `id` it carries to `dropped`, then emits `drop`. Bind `dropped` with $bindState. Dragging needs a pointer, so give the actor another way to do what a drop does, such as a Menu.',
    },
    Grid: {
      props: z.object({
        minColumnWidth: z.enum(['s', 'm', 'l']).nullable(),
      }),
      slots: ['default'],
      description: 'Lays children out in as many equal columns as fit.',
    },
    Split: {
      props: z.object({
        split: z.boolean().nullable(),
        room: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'Lays its first two shown children side by side, a wider main view and a narrower pane beside it, when `split` is true and the Split is wide enough for both (about 40rem); otherwise it lays its children out in one column. Show only the children that belong to the layout in force. Bind `room` with $bindState: the Split writes whether it is wide enough, whether or not it is split, and again whenever its width crosses the line, so a spec can offer the split only while it fits.',
    },
    Card: {
      props: z.object({
        title: z.string().nullable(),
        icon: z.enum(iconNames).nullable(),
        opens: z.boolean().nullable(),
        selected: z.boolean().nullable(),
        focusOnShow: z.boolean().nullable(),
        expanded: z.boolean().nullable(),
        dragId: z.string().nullable(),
      }),
      slots: ['default', 'attributes', 'suffix', 'actions', 'detail'],
      description:
        'A bounded surface that groups related content. `icon` leads the title, named by meaning, such as the kind of item the card stands for. The `attributes` slot follows the title, for a few of the item\'s attributes as labelled Badges, laid out in a row; Badges there that are `pressable` stay separate presses. The `suffix` slot sits beside the title, for a short status such as a Badge, or a control that acts on the card. The `actions` slot holds the buttons that act on what the card shows, below its content. With `opens` the card stands for something the actor can open, such as the items behind a summary: its title is a button, pressing anywhere on the card presses it, and it emits `open`. A card that opens needs a `title`. Controls in `suffix` and `actions`, and pressable Badges in `attributes`, stay separate presses; anything else in the card is covered by the press, so put controls in those slots. The `detail` slot holds what the card opens into, such as the item\'s full readout under its summary, and shows while `expanded` is true: it sits last in the card, set off by a rule, and is not covered by the press, so the actor can read and select its text and use the controls in it, other cards among them. On a card that opens, `expanded` makes the title read as expanded or collapsed rather than pressed; set `selected` with it to set the card apart while it is expanded. `selected` marks the one card among its peers that the actor picked, such as the item another view is showing: the card is set apart, and on a card that opens the title reads as pressed. `focusOnShow` works as on a Button, for the title: set it on the card the actor opened, so that it takes focus when they come back to it. With `dragId` the card can be dragged, carrying that id, onto a Stack or Disclosure that is a `dropTarget`; give the actor another way to do what the drop does, such as a Menu in the card\'s `actions`.',
    },
    Text: {
      props: z.object({
        text: z.string(),
        size: z.enum(['small', 'body', 'large']).nullable(),
        muted: z.boolean().nullable(),
        highlight: z.boolean().nullable(),
        status: z.boolean().nullable(),
        purpose: purpose.nullable(),
        pending: z.boolean().nullable(),
        inline: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'A run of text. `highlight` marks it as changed or notable. With `status` the text is announced to assistive technology when it changes; keep such a Text rendered and empty rather than hidden. `purpose` makes it a short message in place, such as a result beside the control that caused it: it takes the purpose\'s colour, which replaces `muted`, and is led by its icon. `pending` says the text reports work still under way, such as a check that has not finished: it is led by a busy indicator instead, and takes no purpose. Children render inline after the text. With `inline` it is a run inside the Text it is a child of, not a paragraph of its own: use it to go on with a sentence after an inline control such as a Reference, keeping the space at the start of its `text`. An inline run takes `highlight` and `muted`; `size`, `status`, `purpose` and `pending` belong to the paragraph.',
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
    Disclosure: {
      props: z.object({
        title: z.string(),
        count: z.string().nullable(),
        open: z.boolean().nullable(),
        dropTarget: z.boolean().nullable(),
        dropped: z.string().nullable(),
      }),
      slots: ['default'],
      description:
        'A titled part the actor can close to a single line and open again, one of several peers that come and go with the content, such as the items that share a value when a collection is grouped. `title` names it and `count`, beside the title, says how many items it holds. It is open unless `open` is false. The actor opening or closing it emits `toggle`. Bind `open` with $bindState; when the parts are repeated over a list the spec rewrites, compute `open` from a list in state, such as the titles of the closed parts, and update that list on `toggle`, so that each part keeps its state through the rewrite and when the library switches. For fixed parts of one piece of content, use Sections. `dropTarget` and `dropped` work as on a Stack, and the whole part, its title included, takes the drop, so a closed part still does: something held over a closed part for a moment opens it, so the drop can be aimed, and a drop opens it, so what was dropped shows where it went. Either opening emits `toggle` first. Several of these side by side or stacked are a Board.',
    },
    Board: {
      props: z.object({
        axis: z.enum(['lanes', 'sections']),
      }),
      slots: ['default'],
      description:
        'Disclosure children laid out as the groups of a collection along one axis: `lanes` side by side, one column per group, scrolling sideways when they do not fit, with a closed lane turned to a narrow strip; `sections` stacked down the page, each spreading its cards across the width. The children are the same on either axis, so what they hold and the drop targets on them stay when the axis changes. Each Disclosure holds the group\'s Cards, laid out by the board, and an empty one keeps room to drop into.',
    },
    BulletList: {
      props: z.object({
        items: z.array(z.string()),
      }),
      description: 'A list of short pieces of text, read as content. Not interactive: rows that act are a List.',
    },
    DescriptionList: {
      props: z.object({
        items: z.array(z.object({ id: z.string().nullable(), label: z.string(), value: z.string() })),
        draggable: z.boolean().nullable(),
      }),
      description:
        'Labels paired with their values, one pair to a row, read as content: the attributes of one item in its full view, or a spec sheet. For a few attributes on a summary, use labelled Badges instead. With `draggable` each row that has an `id` can be dragged, carrying that id, onto a Stack that is a `dropTarget`.',
    },
    Table: {
      props: z.object({
        label: z.string(),
        columns: z.array(z.object({ label: z.string(), align: z.enum(['start', 'end']).nullable() })),
      }),
      slots: ['default'],
      description:
        'Items as rows and their attributes as columns, so that rows can be compared down a column. `label` names the table for assistive technology. `columns` heads the columns in order; `align: end` sets a column\'s header on the right, for a column of figures such as prices. Its children are TableRow elements, usually one repeated over a list in state. A table wider than its container scrolls sideways.',
    },
    TableRow: {
      props: z.object({}),
      slots: ['default'],
      description: 'One item in a Table. Its children are TableCell elements, one for each column, in column order.',
    },
    TableCell: {
      props: z.object({
        text: z.string().nullable(),
        align: z.enum(['start', 'end']).nullable(),
      }),
      slots: ['default'],
      description:
        'One value in a TableRow. `text` is the value as text. Children render after it, for a value shown as a component, such as a status as a Badge. `align: end` sets the value on the right; give it to every cell in a column whose header is set to `end`.',
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
        label: z.string().nullable(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
      }),
      slots: ['field', 'actions', 'send'],
      description:
        'Where the actor writes the next message in Messages, or a request on its own: a text field, read by assistive technology as `label`, with the `actions` slot beneath it for plain Buttons that change what the message carries, such as attaching a file. Bind `value` with $bindState. The `field` slot takes the place of the text field, for a message that needs more than plain text, such as a MentionEditor that names items; that field\'s own label names it, and `label`, `placeholder` and `value` go unused. Give `label` unless `field` holds a field. The `send` slot holds the Button that sends the message, set apart at the end of the actions row.',
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
        pressable: z.boolean().nullable(),
      }),
      description:
        'A short count or status label, or one attribute of an item. With `pressable` the badge is a button and emits `press`, for a value the actor acts on in place, such as an attribute value pressed to filter by it. With `label` it is an attribute: `label` names it (Category) and `text` is its value (Chairs); lay several out in a horizontal Stack. `icon` leads the text, named by meaning, such as `increase` for a trend. `tone` sets it apart: `success` and `danger` say whether what it shows is good or bad, which the spec decides, since the same direction can be either. `pulse` draws attention to a change.',
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
        'A value applied to something, such as a classification or a filter the actor cannot edit in place (an editable condition is a FilterTag), or a value a trace names, such as a query that was run or a source that was read, shown as a short label. A count or status read in place is a Badge; one the actor presses to reach what it counts is a Tag that opens. `icon` names, by meaning, where the value came from or what kind it is. `pending` marks a value that is still being worked out: the label says so, and the tag shows it is busy. With `opens` the tag stands for something the actor can open, such as a short summary that leads to what it summarises: the tag is a button and emits `open`, and `focusOnShow` works as on a Button. A tag that opens has no remove button. With `removeLabel` the tag carries a button, named by that label, that emits `remove`; `focusNext` works as on a Button, for when removing the tag takes the button away while it has focus. Lay several out in a horizontal Stack.',
    },
    Reference: {
      props: z.object({
        label: z.string(),
        preview: z.boolean().nullable(),
        expanded: z.boolean().nullable(),
      }),
      slots: ['default', 'suffix'],
      description:
        'An item named inline in running text, such as a product a sentence mentions; it sits as a child of a Text, with an inline Text after it for the rest of the sentence. `label` is the item\'s name. Pointing at the reference or focusing it shows a preview of the item after a short pause, and the preview stays while the pointer moves into it, so that the actor can use the controls there; Tab from the reference moves into an open preview. Leaving both, or Escape, closes it. The preview is headed by `label`, and the children follow as its body, such as the item\'s key figure as a Text and its attributes as Badges. The `suffix` slot sits beside the heading, for controls that show the item in another way. Bind `preview` with $bindState: the reference writes whether the preview shows, and setting it false closes the preview. Pressing the reference emits `open`, for a fuller view of the item. `expanded` says that view is showing: the reference is marked expanded, and pointing at it shows no preview meanwhile.',
    },
    Map: {
      props: z.object({
        label: z.string(),
        locations: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            lat: z.number(),
            lng: z.number(),
            description: z.string().nullable(),
          }),
        ),
        selected: z.string().nullable(),
      }),
      description:
        'Places on a map the actor can pan and zoom, each a pin at its `lat` and `lng`, read by assistive technology as `label`. The map first frames every pin. A pin is named by its `name` and `description`; pressing it, or Enter or Space when it has focus, selects it, marks it apart from the others and shows its name and description beside it. `selected` is the selected place\'s `id`. Bind it with $bindState: the map writes it when the actor selects a pin, then emits `select`, and setting it moves the map to that place.',
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
        scope: z.string().nullable(),
        groups: z.array(
          z.object({
            heading: z.string().nullable(),
            options: z.array(z.object({ value: z.string(), label: z.string(), narrows: z.boolean().nullable() })),
          }),
        ),
      }),
      description:
        'A text field with a list of candidates beneath it, which the actor can pick from instead of typing the rest. The list shows `groups` exactly as given, in order, each under its `heading` if it has one, and filters nothing itself: which candidates show for what has been typed is the spec\'s decision, usually a $computed over the bound value. A group with no options is left out, and with none to show the list stays closed. The list opens when the field takes focus or the actor types, and closes on Escape, when focus leaves, or when a candidate is picked; nothing is highlighted until the actor moves to a candidate with the arrow keys or the pointer, so Enter picks the highlighted candidate and otherwise leaves what was typed. Picking writes the candidate\'s `value` to `value`, then emits `select`. With `hideLabel` the label is read by assistive technology only. Bind `value` with $bindState. A candidate with `narrows` is a kind of value rather than a value, such as an attribute whose values the actor picks from next: picking it writes its `value` to `scope` instead (bind it with $bindState), empties the field and keeps the list open, so the actor goes on within that kind. Backspace in the empty field sets `scope` back to null, and so does closing the list. Which candidates show within a scope is the spec\'s decision, as before.',
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
        returnFocus: z.string().nullable(),
      }),
      slots: ['default', 'suffix', 'actions'],
      description:
        'A window over the page that blocks it until closed, for a decision the actor has to make before going on. The `actions` slot holds its buttons. Bind `open` with $bindState; closing the dialog (Escape, the close button) writes false back. `description` is the message the decision turns on, shown first and read out with the title when the dialog opens. `alert` marks a confirmation of something hard to undo: it is announced as an alert and a click outside does not close it. Focus starts on the element marked `initialFocus` (for an alert, the least destructive action, such as Cancel), otherwise on the first control. The `suffix` slot sits beside the title, for controls that change how the dialog shows what it holds. When it closes, focus goes back to the control that had it when the dialog opened; `returnFocus` names the label of a Button or Reference to go to instead, for a dialog opened from inside a window that is gone by the time it closes.',
    },
    Drawer: {
      props: z.object({
        title: z.string(),
        open: z.boolean().nullable(),
        returnFocus: z.string().nullable(),
      }),
      slots: ['default', 'suffix'],
      description:
        'A panel at the side of the screen that does not block the page behind it. Bind `open` with $bindState; closing the drawer writes false back. The `suffix` slot sits beside the title, for controls that change how the drawer shows what it holds. `returnFocus` works as on a Dialog.',
    },
    Popover: {
      props: z.object({
        title: z.string(),
        open: z.boolean().nullable(),
      }),
      slots: ['default', 'suffix'],
      description:
        'A panel over the page next to the element it belongs to, which does not block the page: put it inside that element, such as a Card, and it opens beside it. `title` heads it and names it for assistive technology; the children are its body. The `suffix` slot sits beside the title, for controls that change how the panel shows what it holds. Bind `open` with $bindState: a click outside the panel or Escape closes it and writes false back. When it opens because of what the actor did, focus moves to its first control; when it closes with focus inside it, focus goes back to the control that had it when it opened.',
    },
    Menu: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        multiple: z.boolean().nullable(),
        focusNext: z.string().nullable(),
      }),
      slots: ['default'],
      description:
        'A button that opens a short list of choices, for a setting that is changed now and then rather than kept in view. `label` names the button for assistive technology; `icon` is what it shows, named by meaning. Its children are MenuItem elements, in order. One choice is in force at a time, and the list closes when a choice is made. With `multiple` any number are, each ticked or cleared on its own, and the list stays open while the actor goes through it. Either way it closes on Escape, or when focus leaves it. `focusNext` works as on a Button, for when a choice removes the menu, or what it sits in, while focus is on it or in its list.',
    },
    MenuItem: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        checked: z.boolean().nullable(),
        disabled: z.boolean().nullable(),
      }),
      description:
        'One choice in a Menu: `checked` marks the one in force, or each that is ticked in a Menu with `multiple`. `icon` leads the label, named by meaning. `disabled` is for a choice that is not available now; it stays in the list so the actor can see it exists. Choosing it emits `press`.',
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
    // A composite, like RuleBuilder: the library draws the whole chip. Its
    // input is data (one condition and what it can become), so a spec holds
    // it, but its joined parts and the searchable value list are the
    // library's own.
    FilterTag: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        operator: z.string(),
        operators: z.array(z.string()),
        values: z.array(z.string()),
        options: z.array(z.string()),
        removeLabel: z.string().nullable(),
        focusNext: z.string().nullable(),
        edit: z.unknown().nullable(),
      }),
      description:
        'One condition of a filter, shown as a chip the actor edits in place: `label` names the attribute, led by `icon` when the attribute has one, named by meaning, then come the `operator`, the chosen `values` (the value itself, or how many are chosen), and a button that removes the condition. Pressing the operator opens `operators`, the current one ticked. Pressing the values opens a list the actor can search, with the chosen values first and ticked, then the rest of `options`; picking one adds it or takes it away, and the list closes. Bind `edit` with $bindState: before emitting `change`, the chip writes { kind: operator | add | remove, value } there, and the spec applies it. The remove button, named by `removeLabel` (Clear filter by default), emits `remove`; `focusNext` works as on a Button. Lay several out in a horizontal Stack.',
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
    // A composite, like RuleBuilder: each library supplies the whole editor.
    // Its content and its candidates are data, so a spec can hold both.
    MentionEditor: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        content: z.array(z.array(z.union([z.string(), mention, slot]))),
        query: z.string().nullable(),
        scope: z.string().nullable(),
        candidates: z.array(
          z.object({
            heading: z.string().nullable(),
            options: z.array(z.union([mention, z.object({ id: z.string(), label: z.string(), narrows: z.literal(true) })])),
          }),
        ),
        opened: z.string().nullable(),
      }),
      description:
        'A text the actor writes in, read by assistive technology as `label`, that can name items inline as mentions. `content` is its paragraphs, in order, each a list of plain runs (strings) and mentions ({ id, label, type }); a mention shows its `label`. Bind `content` with $bindState: the editor writes it as the actor types. Content can also hold slots ({ slot, label, required, value }), blanks in a template whose wording is already written: each is a field inside the text that shows its `label` until it holds a `value`, and the actor fills it in place. Tab moves through the slots and mentions in reading order, and Enter in a slot goes to the next slot. What the actor writes goes to the slot\'s `value`. `required` marks a slot the request cannot go without; the editor does not check it, and the actor can delete a slot like any other part of the text, so a spec that needs it checks against the template it started from and says what is missing when the actor sends. To fill or empty every slot at once, set `content`. Typing @ starts a mention: the editor writes what follows the @ to `query` (bind it with $bindState; it is null when no mention is being typed), and shows `candidates` in a list beneath the caret, in order, each group under its `heading`. The list filters nothing itself: which candidates show for the query is the spec\'s decision, usually a $computed over `query` and `scope`. A candidate is either an item ({ id, label, type }) or a kind of item ({ id, label, narrows: true }). The first candidate is highlighted; the arrow keys move the highlight, Enter or Tab picks it, and Escape closes the list and leaves the text. Picking an item puts the mention in place of what was typed. Picking a kind writes its `id` to `scope` (bind it with $bindState) and clears what was typed after the @, so the actor goes on typing within that kind; Backspace with nothing typed sets `scope` back to null, and so does closing the list. Pressing a mention writes its `id` to `opened` (bind it with $bindState), then emits `open`, for a fuller view of the item.',
    },
  },
  actions: {
    arm: {
      params: z.object({ item: z.string() }),
      description:
        'Arm a confirmation on one item: sets its `armed` field and clears it again after a few seconds. `item` is the item\'s state path ({ "$item": "" } inside a repeat). Cancel and confirm need no custom action: setState on `armed`, removeState on the item.',
    },
    toggle: {
      params: z.object({ item: z.string() }),
      description:
        'Open one item among its peers, or close it if it is open: sets its `open` field and clears `open` on the other items in the same list, so each list keeps one current item. An item that closes also closes every item open inside it, so it opens again on its summary. `item` is the item\'s state path ({ "$item": "" } inside a repeat).',
    },
    editRule: {
      params: z.object({ edit: z.unknown() }),
      description: 'Apply an edit written by a RuleBuilder ({ kind, slotId, value }) to the draft rule.',
    },
    settle: {
      params: z.object({ statePath: z.string(), value: z.unknown() }),
      description:
        'Write `value` to `statePath` once the actor pauses: each dispatch for the same path restarts the wait. Dispatch it from a `watch` on what the actor is changing, to act on their input when they stop rather than on every keystroke.',
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
  toggle: async () => {},
  editRule: async () => {},
  settle: async () => {},
  notify: async () => {},
};
