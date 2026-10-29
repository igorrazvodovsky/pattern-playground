import { defineCatalog, ValidationCheckSchema } from '@json-render/core';
import { schema } from '@json-render/react/schema';
import { z } from 'zod';
import { attributeIcons, bindings } from '@shared/data/bindings';

// The component vocabulary switchable demos are written in. Types are named at
// component altitude (Card, List, Button), not after what a pattern uses them
// for: one component means different things in different patterns, and that
// meaning lives in the spec (props, structure, bound actions), not in the type
// name. Each registry in ./registries maps these types onto one library.
//
// Cut to what the specs in demos/specs/ need. A type joins when a spec needs
// it and every registry can render it, or says plainly that it cannot.
//
// A type is a word specs are written in, not an entry in the Storybook
// catalogue. Map, Timeline, Reference and ItemView are generic views over
// data: ItemView lays out any bound entity, so what differs between kinds of
// item lives in the binding, not in more types.

export const tones = ['neutral', 'accent', 'success', 'danger'] as const;
const tone = z.enum(tones);

// Separate from `tone`: a purpose also gives a message its icon.
export const purposes = ['info', 'success', 'warning', 'danger'] as const;
const purpose = z.enum(purposes);

const checks = z.array(ValidationCheckSchema).nullable();
const fieldValidation =
  "List `checks` ({ type: required | email | minLength | …, message }) to validate the bound value: they run when validateForm is dispatched, usually from a Form's `submit`, and again on each change once the field has been checked, so the message goes as soon as the value is fixed. The first failing check's message shows beneath the field, as `error` does, and `error` wins when both are set. A field that is hidden, by its own `visible` or a container's, is left out of validateForm.";
const options = z.array(z.object({ value: z.string(), label: z.string() }));
const mention = z.object({ id: z.string(), label: z.string(), type: z.string() });
// The kinds of item an ItemView lays out, one for each binding.
const entityTypes = Object.keys(bindings) as [string, ...string[]];
// A person's picture; without an image, their initial stands in.
const avatar = z.object({ name: z.string(), image: z.string().nullable() });
// A blank in a template's text.
const slot = z.object({
  slot: z.string(),
  label: z.string(),
  required: z.boolean().nullable(),
  value: z.string(),
});
// A word of a formula's own vocabulary, such as an operator, held as one part.
const keyword = z.object({ keyword: z.string(), label: z.string(), type: z.string() });
const textPart = z.union([z.string(), mention, slot, keyword]);

// Icons are named by meaning; each registry maps a name to its own icon set.
// A spec that named Iconoteka glyphs would be tied to the library that ships them.
// Attribute icons share the entity bindings' names, so a spec can pass a
// binding's icon straight through.
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
  'document',
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
  'ownership',
  'part',
  'people',
  'person',
  'popover',
  'previous',
  'product',
  'project',
  'publish',
  'quote',
  'reasoning',
  'remove-person',
  'restore',
  'rows',
  'saved',
  'search',
  'send',
  'service',
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

// A value an attribute takes from a fixed list, such as a task's status or
// one of its labels, so that each value has a name of its own.
const valueIcons = [
  'date-in-3-days',
  'date-in-3-months',
  'date-in-a-day',
  'date-in-a-month',
  'date-in-a-week',
  'date-past',
  'label-advocacy',
  'label-assessment',
  'label-audit',
  'label-data',
  'label-design',
  'label-education',
  'label-innovation',
  'label-logistics',
  'label-marketing',
  'label-optimization',
  'label-policy',
  'label-recycling',
  'label-refurbishment',
  'label-research',
  'label-sourcing',
  'label-take-back',
  'label-training',
  'label-waste-reduction',
  'priority-high',
  'priority-low',
  'priority-medium',
  'priority-urgent',
  'status-backlog',
  'status-cancelled',
  'status-done',
  'status-in-progress',
  'status-in-review',
  'status-todo',
  'unassigned',
] as const;

export const iconNames = [...interfaceIcons, ...attributeIcons, ...valueIcons] as const;

// What a MentionEditor's list offers: each candidate has a label, led by an
// icon, and an item candidate is a mention.
const candidate = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.enum(iconNames).nullable(),
});
const mentionCandidate = mention.extend({ icon: z.enum(iconNames).nullable() });

/** Where a MentionEditor's list was opened, so the spec can offer what fits there. */
export const listContext = z.object({
  trigger: z.enum(['@', '/', 'swap']),
  /** The mention heading the innermost bracket still open, in a formula. */
  enclosing: z.string().nullable(),
  /** The mention straight before the list's place, past spaces between them. */
  preceding: z.string().nullable(),
  /** The mention heading the condition at the list's place, in a formula. */
  condition: z.string().nullable(),
  /** The keyword being swapped. */
  keyword: z.string().nullable(),
});

// Set by the pattern, not a library default: a toast that offers an action
// has to stay long enough for the actor to notice it, decide and act.
export const toastDuration = { plain: 4000, withAction: 8000 } as const;

// How long a drag hovers over a closed group before the group opens. The
// same delay as Atlassian's tree components and Finder's spring-loaded folders.
export const springOpen = 500;

// How long an armed inline confirmation waits before it reverts.
export const confirmationWindow = 4000;

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
        'Lays children out in a column (default) or a row. Children of a column take its full width; `align: start` keeps them at their own width, as for a lone Button. `label` names what the children are a group of, such as one of several lists in a detail: the Stack becomes a region of that name for assistive technology. A visible caption for the group is a separate Text. With `dropTarget` the Stack takes what is dragged in the same demo, rows of a draggable DescriptionList or Cards with a `dragId`: it is marked while a row is over it, and a drop writes the `id` it carries to `dropped`, then emits `drop`. Bind `dropped` with $bindState. Dragging needs a pointer, so give the actor another way to do what a drop does, such as a Menu.',
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
    Panes: {
      props: z.object({
        room: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'Lays its shown children side by side as equal panes when it is wide enough for them (about 40rem), each pane laying out its content for its own width; otherwise it lays them out in one column. Use it for views of one model that the actor reads together, such as a list, a map and a detail. Show only the children that belong to the layout in force. Bind `room` with $bindState: the Panes write whether they are wide enough, and again whenever their width crosses the line, so a spec can lay out the narrow column differently, such as putting a map above the list it marks.',
    },
    Card: {
      props: z.object({
        title: z.string().nullable(),
        icon: z.enum(iconNames).nullable(),
        opens: z.boolean().nullable(),
        selected: z.boolean().nullable(),
        focusOnShow: z.boolean().nullable(),
        focusKey: z.string().nullable(),
        expanded: z.boolean().nullable(),
        dragId: z.string().nullable(),
        emphasis: z.enum(['full', 'reduced', 'faint']).nullable(),
      }),
      slots: ['default', 'attributes', 'suffix', 'actions', 'detail'],
      description:
        "A bounded surface that groups related content. `icon` leads the title, named by meaning, such as the kind of item the card stands for. The `attributes` slot follows the title, for a few of the item's attributes as labelled Badges, laid out in a row; Badges there that are `pressable` stay separate presses. The `suffix` slot sits beside the title, for a short status such as a Badge, or a control that acts on the card. The `actions` slot holds the buttons that act on what the card shows, below its content. With `opens` the card stands for something the actor can open, such as the items behind a summary: its title is a button, pressing anywhere on the card presses it, and it emits `open`. A card that opens needs a `title`. Controls in `suffix` and `actions`, and pressable Badges in `attributes`, stay separate presses; anything else in the card is covered by the press, so put controls in those slots. The `detail` slot holds what the card opens into, such as the item's full readout under its summary, and shows while `expanded` is true: it sits last in the card, set off by a rule, and is not covered by the press, so the actor can read and select its text and use the controls in it, other cards among them. On a card that opens, `expanded` makes the title read as expanded or collapsed rather than pressed; set `selected` with it to set the card apart while it is expanded. `selected` marks the one card among its peers that the actor picked, such as the item another view is showing: the card is set apart, and on a card that opens the title reads as pressed. `focusOnShow` works as on a Button, for the title: set it on the card the actor opened, so that it takes focus when they come back to it. `focusKey` works as on a Button, for the title of a card that opens. With `dragId` the card can be dragged, carrying that id, onto a Stack or Disclosure that is a `dropTarget`; give the actor another way to do what the drop does, such as a Menu in the card's `suffix`. `emphasis` sets how much weight the card carries among its peers: `full` (the default) is the solid surface, `reduced` drops the border to a dashed line and the ground to transparent, and `faint` also dims the text. Use the lower steps for content the system is less sure of, or that matters less, so that the actor can tell from the card alone how far to rely on it; let what the card says fall with it, such as leaving out the attributes.",
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
        "A run of text. `highlight` marks it as changed or notable. With `status` the text is announced to assistive technology when it changes; keep such a Text rendered and empty rather than hidden. `purpose` makes it a short message in place, such as a result beside the control that caused it: it takes the purpose's colour, which replaces `muted`, and is led by its icon. `pending` says the text reports work still under way, such as a check that has not finished: it is led by a busy indicator instead, and takes no purpose. Children render inline after the text. With `inline` it is a run inside the Text it is a child of, not a paragraph of its own: use it to go on with a sentence after an inline control such as a Reference, keeping the space at the start of its `text`. An inline run takes `highlight` and `muted`; `size`, `status`, `purpose` and `pending` belong to the paragraph.",
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
      description:
        'One named part inside Sections: `title` names it, and its children are its content.',
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
        "Disclosure children laid out as the groups of a collection along one axis: `lanes` side by side, one column per group, scrolling sideways when they do not fit, with a closed lane turned to a narrow strip; `sections` stacked down the page, each spreading its cards across the width. The children are the same on either axis, so what they hold and the drop targets on them stay when the axis changes. Each Disclosure holds the group's Cards, laid out by the board, and an empty one keeps room to drop into.",
    },
    BulletList: {
      props: z.object({
        items: z.array(z.string()),
      }),
      description:
        'A list of short pieces of text, read as content. Not interactive: rows that act are a List.',
    },
    DescriptionList: {
      props: z.object({
        items: z.array(
          z.object({ id: z.string().nullable(), label: z.string(), value: z.string() }),
        ),
        draggable: z.boolean().nullable(),
      }),
      description:
        'Labels paired with their values, one pair to a row, read as content: the attributes of one item in its full view, or a spec sheet. For a few attributes on a summary, use labelled Badges instead. With `draggable` each row that has an `id` can be dragged, carrying that id, onto a Stack that is a `dropTarget`.',
    },
    ItemView: {
      props: z.object({
        type: z.enum(entityTypes).nullable(),
        item: z.looseObject({ id: z.string() }).nullable(),
        scope: z.enum(['micro', 'mini', 'mid', 'maxi']),
        shownAttributes: z.union([z.literal('all'), z.array(z.string())]).nullable(),
      }),
      description:
        "One item laid out from its binding, the description of its kind of item that says what each attribute is and how its value reads. `type` names the kind of item and `item` is the item as stored, such as a product held in state; while either is null, as before the actor picks the item a detail shows, nothing renders. `scope` sets how much of it shows: `micro` is its name as an inline token, `mini` a summary: its key figure, such as a price, then its states as Badges and its other attributes as labelled Badges; `mid` adds the description and lists the attributes that tell it apart as labelled rows, and `maxi` lists all of them. `shownAttributes` replaces the scope's set with attribute paths, role names such as `badge` or `spec`, or `all`; read it from state when the actor can change what shows, such as an attribute they surface, and use it to leave out what a view beside this one already shows. Above `micro` the item view shows no title: put it in a Card, Drawer, Dialog or Reference preview that names the item, as the body. An attribute only a component of its own can show, such as a comment thread, is shown by that component, and where the library has none the item view says so.",
    },
    Table: {
      props: z.object({
        label: z.string(),
        columns: z.array(
          z.object({ label: z.string(), align: z.enum(['start', 'end']).nullable() }),
        ),
      }),
      slots: ['default'],
      description:
        "Items as rows and their attributes as columns, so that rows can be compared down a column. `label` names the table for assistive technology. `columns` heads the columns in order; `align: end` sets a column's header on the right, for a column of figures such as prices. Its children are TableRow elements, usually one repeated over a list in state. A table wider than its container scrolls sideways.",
    },
    TableRow: {
      props: z.object({}),
      slots: ['default'],
      description:
        'One item in a Table. Its children are TableCell elements, one for each column, in column order.',
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
        parts: z.array(
          z.union([
            z.string(),
            z.object({
              text: z.string(),
              note: z.string().nullable(),
              link: z.string().nullable(),
            }),
          ]),
        ),
      }),
      slots: ['default'],
      description:
        "One message in Messages. `from` says who sent it: the actor, or the other side (a person or the system). `parts` is its text in order: plain runs as strings, and marked runs as { text, note, link } for a part the actor should notice. A marked run's `note` says why it is marked; it shows when the actor points at or focuses the run, and the run is underlined to say a note is there. A marked run's `link` ties it to the runs in other messages that stand for the same thing, such as a passage in a prompt and its summary in the answer; one link can join several runs. Pointing at or focusing a linked run keeps the runs on its link highlighted and drops the highlight from the other linked runs. With `note` and `link` both null the run is only highlighted. Keep the spaces between runs in the strings. Children render inside the message, after its text: controls the actor answers with in place, such as SelectableTags or a Slider, for a message that is a piece of interface rather than words. A message of controls alone has empty `parts`, and sits on the plain surface rather than in a bubble, so the controls read as interface rather than as text the actor sent.",
    },
    Composer: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
      }),
      slots: ['field', 'actions', 'send'],
      description:
        "Where the actor writes the next message in Messages, or a request on its own: a text field, read by assistive technology as `label`, with the `actions` slot beneath it for plain Buttons that change what the message carries, such as attaching a file. Bind `value` with $bindState. The `field` slot takes the place of the text field, for a message that needs more than plain text, such as a MentionEditor that names items; that field's own label names it, and `label`, `placeholder` and `value` go unused. Give `label` unless `field` holds a field. The `send` slot holds the Button that sends the message, set apart at the end of the actions row.",
    },
    Timeline: {
      props: z.object({
        density: z.enum(['normal', 'compact']).nullable(),
      }),
      slots: ['default'],
      description:
        "Events or steps in the order they happened, each with its own marker on a rail. Its children are TimelineEntry elements in reading order: newest first for a history, oldest first for work as it unfolds. `compact` draws smaller markers, for a dense trace. A Timeline inside a TimelineEntry is that entry's own steps: it drops the rail and reads as part of the entry.",
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
        "One event or step in a Timeline. `title` says what happened. `by` names who did it and leads the title, set apart: a string for a name with nowhere to go, such as the system, or { name, href } to make the name a link to that actor. `time` says when, beneath the entry. `from: actor` sets apart an entry the actor made themselves, such as the request the rest of a trace works on. `pending` marks a step still under way: the title says so, and the entry shows it is busy. Children are the entry's content beneath the title. With `expandable` they sit behind a disclosure that the title opens and closes, for detail the actor asks for, such as why the event happened; `open` says whether it is open. Bind `open` with $bindState, or $bindItem inside a repeat, so the entry keeps its state when the library switches.",
    },
    List: {
      props: z.object({
        borderless: z.boolean().nullable(),
      }),
      slots: ['default'],
      description:
        'A vertical list of ListItem children, on a surface of its own. `borderless` drops the outline and keeps the surface.',
    },
    ListItem: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        description: z.string().nullable(),
        checkbox: z.boolean().nullable(),
        checked: z.boolean().nullable(),
        struck: z.boolean().nullable(),
      }),
      slots: ['default', 'suffix'],
      description:
        'One row in a List, with optional secondary text in `description`. `icon` leads the label, named by meaning, such as the kind of item the row stands for. `checkbox` makes the row a checkbox, and `checked` says whether it is ticked. Bind `checked` with $bindItem inside a repeat, or $bindState, so that ticking the row writes to state; a checkbox row with a plain `checked` is for display: the library may still tick it on a press, but state does not change. `struck` strikes the label through, for a row that is still shown but no longer counts. The `suffix` slot holds trailing controls or indicators.',
    },
    ItemGroup: {
      props: z.object({
        label: z.string().nullable(),
      }),
      slots: ['default'],
      description:
        'A list of Item children, each one item of a collection, set close together as rows. `label` names the list for assistive technology, such as one of several views of the collection.',
    },
    Item: {
      props: z.object({
        title: z.string(),
        description: z.string().nullable(),
        opens: z.boolean().nullable(),
        selected: z.boolean().nullable(),
        focused: z.boolean().nullable(),
        expanded: z.boolean().nullable(),
        focusOnShow: z.boolean().nullable(),
        focusKey: z.string().nullable(),
      }),
      slots: ['titleSuffix', 'attributes', 'suffix', 'detail'],
      description:
        "One item of a collection as a row in an ItemGroup: its `title`, a sentence or two about it in `description`, and in the `attributes` slot a few of its attributes as labelled Badges. The `titleSuffix` slot follows the title text, for a short count or status that belongs to the title, such as a Badge with the number of items it stands for. The `suffix` slot sits at the end of the row, for a short status such as a Badge, or a control that acts on the item. With `opens` the actor can pick the item: its title is a button, pressing anywhere on the row presses it, and it emits `open`; controls in `suffix`, and pressable Badges in `attributes`, stay separate presses. `focusOnShow` and `focusKey` work as on a Card. `selected` marks the one item among its peers that the actor picked, such as the item other views are showing: the row is set apart, and on a row that opens the title reads as pressed. The `detail` slot holds what the row opens into, such as the item's readout under its summary, and shows while `expanded` is true, set off by a rule and not covered by the press; with `expanded` the title reads as expanded or collapsed rather than pressed. The row emits `focus` when the pointer comes over it or its title takes keyboard focus, and `blur` when it leaves, for focus that moves without being staked; `focused` marks the row more lightly than `selected`, such as the item another view has the pointer over.",
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
        "One figure read at a glance, such as a count or an average, set larger than the text around it. `unit` follows the figure, smaller. `verdict` is a one-line reading of what the figure means (Up from 46 last cycle), `detail` the context beneath it. `alert` marks a figure that says something is wrong. Put it in a Card whose `title` names the figure, with a Badge for its trend in the card's `suffix`.",
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
        focusKey: z.string().nullable(),
        focusNext: z.string().nullable(),
      }),
      description:
        'A value applied to something, such as a classification or a filter the actor cannot edit in place (an editable condition is a FilterTag), or a value a trace names, such as a query that was run or a source that was read, shown as a short label. A count or status read in place is a Badge; one the actor presses to reach what it counts is a Tag that opens. `icon` names, by meaning, where the value came from or what kind it is. `pending` marks a value that is still being worked out: the label says so, and the tag shows it is busy. With `opens` the tag stands for something the actor can open, such as a short summary that leads to what it summarises: the tag is a button and emits `open`, and `focusOnShow` works as on a Button. A tag that opens has no remove button. With `removeLabel` the tag carries a button, named by that label, that emits `remove`; `focusNext` works as on a Button, for when removing the tag takes the button away while it has focus, and `focusKey` works as on a Button, for the remove button, or for the tag itself when it opens. Lay several out in a horizontal Stack.',
    },
    Reference: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        preview: z.boolean().nullable(),
        expanded: z.boolean().nullable(),
        focusKey: z.string().nullable(),
      }),
      slots: ['default', 'suffix'],
      description:
        "An item named inline in running text, such as a product a sentence mentions; it sits as a child of a Text, with an inline Text after it for the rest of the sentence. `label` is the item's name. Pointing at the reference or focusing it shows a preview of the item after a short pause, and the preview stays while the pointer moves into it, so that the actor can use the controls there; Tab from the reference moves into an open preview. Leaving both, or Escape, closes it. The preview is headed by `label`, led by `icon` when there is one, named by meaning, such as the kind of item, and the children follow as its body: an ItemView of the item at `mini` scope, so the preview reads from the item's binding like every other view of it. A preview is a glance that closes when the pointer leaves, so keep its body to what reads at a glance: `mini`, or a `shownAttributes` with a few paths, never a whole detail. The `suffix` slot sits beside the heading, for controls that show the item in another way. Bind `preview` with $bindState: the reference writes whether the preview shows, and setting it false closes the preview. Pressing the reference emits `open`, for a fuller view of the item. `expanded` says that view is showing: the reference is marked expanded, and pointing at it shows no preview meanwhile. `focusKey` works as on a Button.",
    },
    Breadcrumbs: {
      props: z.object({
        label: z.string(),
        items: z.array(z.object({ id: z.string(), label: z.string() })),
        current: z.string(),
        note: z.string().nullable(),
        picked: z.string().nullable(),
      }),
      description:
        'Where the current item sits in a hierarchy, as the chain of items above it, read by assistive technology as navigation named `label`. `items` are the items above, outermost first, each a link; `current` names the item itself and ends the chain without a link. `note` follows `current`, in smaller muted text, for a qualification of where the item sits, such as an item that is proposed under its parent rather than part of it. Pressing an item writes its `id` to `picked` (bind it with $bindState), then emits `pick`. The chain stays on one line: in a row it takes the free space its peers leave, and when the items do not fit, the ones between the first and the current fold into a menu that lists them.',
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
        focused: z.string().nullable(),
      }),
      description:
        "Places on a map the actor can pan and zoom, each a pin at its `lat` and `lng`, read by assistive technology as `label`. The map first frames every pin. A pin is named by its `name` and `description`; pressing it, or Enter or Space when it has focus, selects it, marks it apart from the others and shows its name and description beside it. `selected` is the selected place's `id`. Bind it with $bindState: the map writes it when the actor selects a pin, then emits `select`, and setting it moves the map to that place. `focused` is the `id` of a place marked more lightly, for focus that moves without being staked, such as the item another view has the pointer over. Bind it with $bindState: the map writes a place's `id` when the pointer comes over its pin or the pin takes keyboard focus, and null when it leaves; setting it marks the pin and does not move the map.",
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
        focusKey: z.string().nullable(),
        focusNext: z.string().nullable(),
        submit: z.boolean().nullable(),
      }),
      description:
        'A button. `danger` marks an action that destroys something. `icon` names the icon by meaning. With `hideLabel` only the icon shows and the label is read by assistive technology. `disabled` is for an action that is unavailable or already in progress; a button whose input is not yet valid stays enabled and reports what is wrong when pressed. `expanded` marks a button that shows and hides another part of the interface. `initialFocus` makes it take focus when its Dialog opens. `focusOnShow` makes it take focus when it appears because of what the actor did, such as the Back button of a view they just opened; it does not take focus when the demo first renders, or from elsewhere on the page. `focusKey` names the button, for the `focusNext` of another control or the `returnFocus` of a Dialog or Drawer; give two controls the same key only when they are the same control in different rows. A key may hold several names separated by spaces, and answers to each, so a control in a row can share a name with its counterparts in other rows and also carry the id of its item, such as { "$template": "delete ${id}" }; a name, an id among them, holds no spaces. `focusNext` names the `focusKey` of the control that takes focus if this one disappears while it has focus, because a press or a timer hid it or removed what it sits in: the first with that key after where this one was, else the last one before it. Name the control that replaces it (Cancel for an armed Delete) or its counterpart in the next row, which has the same key as this button. Without `focusNext`, or with no match, focus moves to the demo. `submit` makes it the button that submits the Form it sits in. Emits `press`.',
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
      description: `A single-line text field. With \`hideLabel\` the label is read by assistive technology only. \`type\` "email" asks for an email address (and the keyboard for one); it does not check the value, a check does. \`error\` marks the value as wrong and shows the message beneath the field; it is announced when it appears. Set it when the actor submits, not while they type, and say how to fix the value. ${fieldValidation} \`initialFocus\` makes it take focus when its Dialog opens. Bind \`value\` with $bindState.`,
    },
    Textarea: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        value: z.string().nullable(),
      }),
      description:
        'A multi-line text field that grows with its text. Bind `value` with $bindState.',
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
      description: `Choose one value from a short list that does not need to be seen all at once. \`placeholder\` shows while nothing is chosen (an empty value) and cannot be chosen itself. ${fieldValidation} Bind \`value\` with $bindState.`,
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
            options: z.array(
              z.object({
                value: z.string(),
                label: z.string(),
                narrows: z.boolean().nullable(),
                icon: z.enum(iconNames).nullable(),
              }),
            ),
          }),
        ),
        status: z
          .object({
            text: z.string(),
            pending: z.boolean().nullable(),
            purpose: purpose.nullable(),
          })
          .nullable(),
        popup: z.boolean().nullable(),
        icon: z.enum(iconNames).nullable(),
        focusKey: z.string().nullable(),
      }),
      description:
        "A text field with a list of candidates beneath it, which the actor can pick from instead of typing the rest. The list shows `groups` exactly as given, in order, each under its `heading` if it has one, and filters nothing itself: which candidates show for what has been typed is the spec's decision, usually a $computed over the bound value. A group with no options is left out, and with none to show the list stays closed. The list opens when the field takes focus or the actor types, and closes on Escape, when focus leaves, or when a candidate is picked; nothing is highlighted until the actor moves to a candidate with the arrow keys or the pointer, so Enter picks the highlighted candidate and otherwise leaves what was typed. Picking writes the candidate's `value` to `value`, then emits `select`. With `hideLabel` the label is read by assistive technology only. Bind `value` with $bindState. A candidate's `icon` leads its label, named by meaning, such as the icon of the attribute it stands for. A candidate with `narrows` is a kind of value rather than a value, such as an attribute whose values the actor picks from next: picking it writes its `value` to `scope` instead (bind it with $bindState), empties the field and keeps the list open, so the actor goes on within that kind. Backspace in the empty field sets `scope` back to null, and so does closing the list. Which candidates show within a scope is the spec's decision, as before. `status` is a line below the candidates that says what the list cannot, such as that nothing matched or that a request is under way; it is announced when its `text` changes, so keep it given with empty text rather than null while there is nothing to say. `pending` and `purpose` work as on a Text. With `popup` the field is not shown in place: a button opens it in a panel of its own below the button, with focus in the field. `label` names the button, `icon` is what it shows, and with `hideLabel` only the icon shows; without an `icon` the label shows regardless. Picking a candidate that does not narrow, Escape, or a click outside closes the panel and empties the field, and focus goes back to the button. `focusKey` works as on a Button, for that button; without `popup` the field takes no key.",
    },
    SelectableTags: {
      props: z.object({
        label: z.string(),
        hideLabel: z.boolean().nullable(),
        options,
        value: z.array(z.string()).nullable(),
      }),
      description:
        "Choose any number of values from a few short options, each a tag the actor selects and clears, laid out in a row. `label` names the question the options answer; with `hideLabel` it is read by assistive technology only, for when the question is already on screen. Bind `value`, the selected options' values, with $bindState.",
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
        "Fields that are sent together. Pressing Enter in a single-line field, or the Button marked `submit`, emits `submit`; the browser's own validation is off, so bind validateForm (with a `statePath`) to `submit` and read `valid` from there before acting. `label` names the form for assistive technology when the page around it does not.",
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
        'A window over the page that blocks it until closed, for a decision the actor has to make before going on. The `actions` slot holds its buttons. Bind `open` with $bindState; closing the dialog (Escape, the close button) writes false back. `description` is the message the decision turns on, shown first and read out with the title when the dialog opens. `alert` marks a confirmation of something hard to undo: it is announced as an alert and a click outside does not close it. Focus starts on the element marked `initialFocus` (for an alert, the least destructive action, such as Cancel), otherwise on the first control. The `suffix` slot sits beside the title, for controls that change how the dialog shows what it holds. When it closes, focus goes back to the control that had it when the dialog opened; `returnFocus` names the `focusKey` of a control to go to instead, for a dialog opened from inside a window that is gone by the time it closes.',
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
        'A panel over the page next to the element it belongs to, which does not block the page: put it inside that element, such as a Card or an Item, and it opens beside it. `title` heads it and names it for assistive technology; the children are its body. The `suffix` slot sits beside the title, for controls that change how the panel shows what it holds. Bind `open` with $bindState: a click outside the panel or Escape closes it and writes false back. When it opens because of what the actor did, focus moves to its first control; when it closes with focus inside it, focus goes back to the control that had it when it opened.',
    },
    Menu: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        multiple: z.boolean().nullable(),
        align: z.enum(['start', 'end']).nullable(),
        focusKey: z.string().nullable(),
        focusNext: z.string().nullable(),
      }),
      slots: ['default'],
      description:
        "A button that opens a short list of choices, for a setting that is changed now and then rather than kept in view. `label` names the button for assistive technology; `icon` is what it shows, named by meaning. Its children are MenuItem elements, in order. One choice is in force at a time, and the list closes when a choice is made. With `multiple` any number are, each ticked or cleared on its own, and the list stays open while the actor goes through it. Either way it closes on Escape, or when focus leaves it. The list opens below the button, lined up with its start edge; `align: end` lines it up with the end edge instead, for a menu at the end of what it sits in, such as a Card's `suffix`. `focusNext` works as on a Button, for when a choice removes the menu, or what it sits in, while focus is on it or in its list. `focusKey` works as on a Button, for the menu's button.",
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
            focusNext: z.string().nullable().optional(),
          }),
        ),
        pressed: z.unknown().nullable(),
      }),
      description:
        'Short messages over the page that leave by themselves, the newest nearest the actor. A toast without an action stays about 4 seconds; one with `actionLabel` offers that single action and stays at least 8. The timer pauses while the pointer or focus is on a toast. Bind `toasts` with $bindState and add a toast with pushState ({ id: "$id", message, actionLabel }); a toast the actor closes or that times out is removed from the list. Pressing a toast\'s action writes the whole toast to `pressed` (bind with $bindState), emits `action`, and closes it. A toast may carry fields of its own for the action to read, and a `focusNext` naming the `focusKey` of the control that takes focus after its action, such as the item an Undo puts back; without one, focus moves to the demo. Focus that the action moved itself, as into a Drawer it opens, stays there.',
    },
    // A composite: the library draws the whole chip from data a spec can hold.
    FilterTag: {
      props: z.object({
        label: z.string(),
        icon: z.enum(iconNames).nullable(),
        operator: z.string(),
        operators: z.array(z.string()),
        values: z.array(z.string()),
        options: z.array(z.string()),
        glyphs: z
          .array(
            z.object({
              value: z.string(),
              icon: z.enum(iconNames).nullable(),
              avatar: avatar.nullable(),
            }),
          )
          .nullable(),
        removeLabel: z.string().nullable(),
        focusKey: z.string().nullable(),
        focusNext: z.string().nullable(),
        edit: z.unknown().nullable(),
      }),
      description:
        "One condition of a filter, shown as a chip the actor edits in place: `label` names the attribute, led by `icon` when the attribute has one, named by meaning, then come the `operator`, the chosen `values` (the value itself, or how many are chosen), and a button that removes the condition. Pressing the operator opens `operators`, the current one ticked. Pressing the values opens a list the actor can search, with the chosen values first and ticked, then the rest of `options`; picking one adds it or takes it away, and the list closes. `glyphs` gives the values that have one a small picture: an `icon`, named by meaning, such as a status or a label from a fixed list, or an `avatar` for a person. The chip shows the glyphs of up to three chosen values, overlapping, and the list puts each value's glyph before it. Bind `edit` with $bindState: before emitting `change`, the chip writes { kind: operator | add | remove, value } there, and the spec applies it. The remove button, named by `removeLabel` (Clear filter by default), emits `remove`; `focusKey` and `focusNext` work as on a Button, for the remove button. Lay several out in a horizontal Stack.",
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
    // A composite: each library supplies the whole editor.
    MentionEditor: {
      props: z.object({
        label: z.string(),
        placeholder: z.string().nullable(),
        content: z.array(z.array(textPart)),
        query: z.string().nullable(),
        scope: z.string().nullable(),
        candidates: z.array(
          z.object({
            heading: z.string().nullable(),
            options: z.array(
              z.union([
                // Before the plain item, which would match a keyword and drop its fields.
                mentionCandidate.extend({ keyword: z.literal(true), then: z.string().nullable() }),
                mentionCandidate,
                candidate.extend({
                  insert: z.object({
                    before: z.array(textPart),
                    after: z.array(textPart).nullable(),
                    line: z.boolean().nullable(),
                  }),
                }),
                candidate.extend({
                  wrap: z.object({ before: z.array(textPart), after: z.array(textPart) }),
                }),
                candidate.extend({ narrows: z.literal(true) }),
              ]),
            ),
          }),
        ),
        opened: z.string().nullable(),
        notation: z.enum(['prose', 'formula']).nullable(),
        keywords: z.array(mention).nullable(),
        commands: z.boolean().nullable(),
        context: listContext.nullable(),
      }),
      description:
        "A text the actor writes in, read by assistive technology as `label`, that can name items inline as mentions. `content` is its paragraphs, in order, each a list of plain runs (strings) and mentions ({ id, label, type }); a mention shows its `label`. Bind `content` with $bindState: the editor writes it as the actor types. Content can also hold slots ({ slot, label, required, value }), blanks in a template whose wording is already written: each is a field inside the text that shows its `label` until it holds a `value`, and the actor fills it in place. Tab moves through the slots and mentions in reading order, and Enter in a slot goes to the next slot. What the actor writes goes to the slot's `value`. `required` marks a slot the request cannot go without; the editor does not check it, and the actor can delete a slot like any other part of the text, so a spec that needs it checks against the template it started from and says what is missing when the actor sends. To fill or empty every slot at once, set `content`. Typing @ starts a mention: the editor writes what follows the @ to `query` (bind it with $bindState; it is null when no mention is being typed), and shows `candidates` in a list beneath the caret, in order, each group under its `heading`. The list filters nothing itself: which candidates show for the query is the spec's decision, usually a $computed over `query` and `scope`. A candidate is either an item ({ id, label, type, icon }) or a kind of item ({ id, label, narrows: true, icon }); its `icon` leads its label, named by meaning, such as the icon for the kind. The first candidate is highlighted; the arrow keys move the highlight, Enter or Tab picks it, and Escape closes the list and leaves the text. Picking an item puts the mention in place of what was typed. Picking a kind writes its `id` to `scope` (bind it with $bindState) and clears what was typed after the @, so the actor goes on typing within that kind; Backspace with nothing typed sets `scope` back to null, and so does closing the list. Pressing a mention writes its `id` to `opened` (bind it with $bindState), then emits `open`, for a fuller view of the item. With `commands`, typing / (after a space or at the start of a line, or after any character in a formula) opens the same list for what the spec offers to put in or do, and writes what follows the / to `query`. Besides items and keywords, a / list can offer two more kinds of candidate. An insert ({ id, label, icon, insert: { before, after, line } }) puts the parts in `before` in place of what was typed, with the caret after them, and the parts in `after` beyond the caret, such as a closing bracket; parts are those of `content`; `line` starts a new paragraph first. A wrap ({ id, label, icon, wrap: { before, after } }) works only in a formula: it removes what was typed and puts `before` and `after` around the condition there, such as not ( and ). `notation: formula` is for an expression built from mentions, such as a condition over named fields and values: @ starts a mention straight after any character, such as an opening bracket or a comma, and the bracket beside the caret is marked together with the bracket that pairs with it. A formula also has keywords, words of its own vocabulary such as operators and the words that join conditions: in `content` a keyword is { keyword, label, type }, where `keyword` is its id, and it shows its `label`. A keyword comes in two ways. A candidate with `keyword: true` ({ id, label, type, keyword: true, then, icon }) puts a keyword in place of what was typed, followed by the text in `then`, such as an opening bracket. And a word the actor types that matches the `label` of one of `keywords` ({ id, label, type }), in any case, becomes that keyword once the actor types a space, a bracket or a comma after it. Pressing a keyword, or Enter on it, opens the list beneath it with the keywords that can stand in its place, the current keyword highlighted; picking one replaces that keyword and no other, without its `then`. A swap list offers keyword candidates only. While a list is open, the editor writes where it was opened to `context` (bind it with $bindState; it is null when no list is open): `trigger` is @, / or swap; `enclosing` is the `id` of the mention heading the innermost bracket still open there, as a field heads \"Status is none of (\"; `preceding` is the `id` of the mention straight before it, past spaces, as the field before an operator; `condition` is the `id` of the mention heading the condition there, the call it starts from the mention to the bracket that closes it, which the place is inside or just after, and the one a wrap goes around; `keyword` is the `id` of the keyword being swapped. Each is null when there is none, and outside a formula `enclosing`, `preceding` and `condition` are always null. The candidates follow `context`, such as a field's values inside its bracket, its other operators in place of one, or the other joining words in place of AND.",
    },
  },
  // Actions are demo behaviour, not library behaviour: the module beside each
  // spec declares and handles its own (SpecSetup). The key stays, empty,
  // because the registries' prop types are inferred from a catalog that has it.
  actions: {},
});

export type Catalog = typeof catalog;
