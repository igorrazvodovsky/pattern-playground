import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { Extension, Node as TiptapNode } from '@tiptap/core';
import type { Node as PmNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { autoUpdate, computePosition, flip, offset } from '@floating-ui/dom';
import { useEditor, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Mention from '@tiptap/extension-mention';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import { useBoundProp, type ComponentContext } from '@json-render/react';
import type { z } from 'zod';
import type { Catalog, iconNames, listContext } from '../catalog';

// A MentionEditor's behaviour on Tiptap, shared by the registries so that only
// the markup differs.
//
// Marks and blocks other than paragraphs are switched off, because the content
// is written back to state as plain runs, mentions, keywords and slots, and
// anything else would be lost on the way.

export type MentionPart = { id: string; label: string; type: string };
export type SlotPart = { slot: string; label: string; required: boolean | null; value: string };
/** A word of a formula's own vocabulary, such as an operator, held as one part. */
export type KeywordPart = { keyword: string; label: string; type: string };
export type Paragraph = (string | MentionPart | SlotPart | KeywordPart)[];
type CandidateIcon = (typeof iconNames)[number] | null;
export type KindCandidate = { id: string; label: string; narrows: true; icon?: CandidateIcon };
export type KeywordCandidate = MentionPart & {
  keyword: true;
  then?: string | null;
  icon?: CandidateIcon;
};
type Part = Paragraph[number];
/** Puts parts in place of what was typed, the caret between `before` and `after`. */
export type InsertCandidate = {
  id: string;
  label: string;
  icon?: CandidateIcon;
  insert: { before: Part[]; after?: Part[] | null; line?: boolean | null };
};
/** Puts parts around the condition at the caret, in a formula. */
export type WrapCandidate = {
  id: string;
  label: string;
  icon?: CandidateIcon;
  wrap: { before: Part[]; after: Part[] };
};
export type MentionCandidate =
  | (MentionPart & { icon?: CandidateIcon })
  | KindCandidate
  | KeywordCandidate
  | InsertCandidate
  | WrapCandidate;
type Pickable = Exclude<MentionCandidate, KindCandidate>;
export type MentionGroup = { heading: string | null; options: MentionCandidate[] };

export const isKind = (candidate: MentionCandidate): candidate is KindCandidate =>
  'narrows' in candidate;
export const isKeywordCandidate = (candidate: MentionCandidate): candidate is KeywordCandidate =>
  'keyword' in candidate;
const isInsert = (candidate: MentionCandidate): candidate is InsertCandidate =>
  'insert' in candidate;
const isWrap = (candidate: MentionCandidate): candidate is WrapCandidate => 'wrap' in candidate;
export const isSlot = (part: Paragraph[number]): part is SlotPart =>
  typeof part !== 'string' && 'slot' in part;
const isKeyword = (part: Paragraph[number]): part is KeywordPart =>
  typeof part !== 'string' && 'keyword' in part;

export type ListContext = z.infer<typeof listContext>;

const toNodes = (parts: Part[]): JSONContent[] =>
  parts
    .filter((part) => typeof part !== 'string' || part.length > 0)
    .map((part) =>
      typeof part === 'string'
        ? { type: 'text', text: part }
        : isKeyword(part)
          ? { type: 'keyword', attrs: { id: part.keyword, label: part.label, type: part.type } }
          : isSlot(part)
            ? {
                type: 'slot',
                attrs: {
                  slot: part.slot,
                  label: part.label,
                  required: part.required,
                  value: part.value,
                },
              }
            : { type: 'mention', attrs: { id: part.id, label: part.label, type: part.type } },
    );

const toDoc = (paragraphs: Paragraph[]): JSONContent => ({
  type: 'doc',
  content: paragraphs.map((parts) => {
    const content = toNodes(parts);
    return content.length > 0 ? { type: 'paragraph', content } : { type: 'paragraph' };
  }),
});

const fromDoc = (doc: JSONContent): Paragraph[] =>
  (doc.content ?? []).map((paragraph) => {
    const parts: Paragraph = [];
    for (const node of paragraph.content ?? []) {
      if (node.type === 'mention') {
        const { id, label, type } = node.attrs ?? {};
        parts.push({ id: String(id), label: String(label), type: String(type) });
      } else if (node.type === 'keyword') {
        const { id, label, type } = node.attrs ?? {};
        parts.push({ keyword: String(id), label: String(label), type: String(type) });
      } else if (node.type === 'slot') {
        const { slot, label, required, value } = node.attrs ?? {};
        parts.push({
          slot: String(slot),
          label: String(label),
          required: required === null || required === undefined ? null : Boolean(required),
          value: String(value ?? ''),
        });
      } else if (node.type === 'text') {
        const last = parts.at(-1);
        if (typeof last === 'string') parts[parts.length - 1] = last + (node.text ?? '');
        else parts.push(node.text ?? '');
      }
    }
    return parts;
  });

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// A formula reads brackets and mentions as one run across its paragraphs.
// Mentions are atoms, so a bracket inside a label never counts.
type Token = { pos: number; bracket: '(' | ')' } | { pos: number; mention: string };

// A document never changes once made, so each is read once however many
// times a keystroke asks: by the bracket marks, the list's context and a wrap.
const read = new WeakMap<PmNode, Token[]>();

const tokens = (doc: PmNode): Token[] => {
  const cached = read.get(doc);
  if (cached) return cached;
  const found: Token[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name === 'mention') found.push({ pos, mention: String(node.attrs.id) });
    else if (node.isText) {
      // By UTF-16 unit, as positions count, so an emoji before a bracket
      // does not shift it.
      const text = node.text ?? '';
      for (let offset = 0; offset < text.length; offset++) {
        const char = text[offset];
        if (char === '(' || char === ')') found.push({ pos: pos + offset, bracket: char });
      }
    }
  });
  read.set(doc, found);
  return found;
};

// The bracket beside the caret, before it or else after it, and its partner.
const bracketPair = (state: EditorState): [number, number] | null => {
  const { empty, from } = state.selection;
  if (!empty) return null;
  const brackets = tokens(state.doc).filter((token) => 'bracket' in token);
  const at = brackets.findIndex((token) => token.pos === from - 1);
  const index = at >= 0 ? at : brackets.findIndex((token) => token.pos === from);
  if (index < 0) return null;
  const opens = brackets[index].bracket === '(';
  const step = opens ? 1 : -1;
  let depth = 0;
  for (let i = index; i >= 0 && i < brackets.length; i += step) {
    depth += brackets[i].bracket === '(' ? step : -step;
    if (depth === 0) return [brackets[index].pos, brackets[i].pos];
  }
  return null;
};

// The brackets before a place, read in one pass: the mention heading each
// bracket still open there (the last mention after the bracket before, or
// none), and the call that closed last, from its mention to its bracket.
type Head = { id: string; pos: number };

const bracketsBefore = (doc: PmNode, at: number) => {
  const open: (Head | null)[] = [];
  let last: Head | null = null;
  let closed: { id: string; from: number; to: number } | null = null;
  for (const token of tokens(doc)) {
    if (token.pos >= at) break;
    if ('mention' in token) last = { id: token.mention, pos: token.pos };
    else {
      if (token.bracket === '(') open.push(last);
      else {
        const head = open.pop();
        closed = head ? { id: head.id, from: head.pos, to: token.pos + 1 } : null;
      }
      last = null;
    }
  }
  return { open, closed };
};

// The mention that heads the innermost bracket still open at the caret, as
// Status heads "Status is none of (".
const enclosingMention = (doc: PmNode, at: number): string | null =>
  bracketsBefore(doc, at).open.at(-1)?.id ?? null;

// The condition at a place: the call a mention heads, from the mention to the
// bracket that closes it, as "Status is (Done)". It is the innermost call
// the place is inside, or else one that ends just before it, past spaces.
const conditionAt = (doc: PmNode, at: number) => {
  const { open, closed } = bracketsBefore(doc, at);
  const inside = open.findLast((head) => head !== null);
  if (inside) {
    let depth = 0;
    for (const token of tokens(doc)) {
      if (!('bracket' in token) || token.pos < inside.pos) continue;
      depth += token.bracket === '(' ? 1 : -1;
      if (depth === 0) return { id: inside.id, from: inside.pos, to: token.pos + 1 };
    }
    return null;
  }
  // Spaces only: a condition on the line before is not the one at a new line.
  if (closed && /^[^\S\n]*$/.test(doc.textBetween(closed.to, at, '\n', '\ufffc'))) return closed;
  return null;
};

// The mention straight before a place, past spaces between them, as Status
// is before "is none of".
const precedingMention = (doc: PmNode, at: number): string | null => {
  let before = doc.resolve(at).nodeBefore;
  if (before?.isText) {
    if (before.text?.trim() !== '') return null;
    before = doc.resolve(at - before.nodeSize).nodeBefore;
  }
  return before?.type.name === 'mention' ? String(before.attrs.id) : null;
};

// Where a list opens. Outside a formula there are no brackets or conditions to read.
const contextAt = (
  doc: PmNode,
  at: number,
  trigger: ListContext['trigger'],
  keyword: string | null,
  formula: boolean,
): ListContext => ({
  trigger,
  enclosing: formula ? enclosingMention(doc, at) : null,
  preceding: formula ? precedingMention(doc, at) : null,
  condition: formula ? (conditionAt(doc, at)?.id ?? null) : null,
  keyword,
});

export const asKeyword = (part: MentionPart): KeywordPart => ({
  keyword: part.id,
  label: part.label,
  type: part.type,
});

type Options = {
  label: string;
  placeholder: string;
  /** A formula takes a mention straight after any character, and matches brackets. */
  notation?: 'prose' | 'formula';
  setContext?: (context: ListContext | null) => void;
  /** Whether typing / opens the list, for what the spec offers to insert or do. */
  commands?: boolean;
  /** Words a formula turns into keywords when the actor finishes typing one. */
  keywords?: MentionPart[];
  /** A class for every keyword, or one chosen by the keyword's id. */
  keywordClass?: string | ((keyword: string) => string);
  bracketClass?: string;
  content: Paragraph[];
  setContent: (content: Paragraph[]) => void;
  setQuery: (query: string | null) => void;
  scope: string | null;
  setScope: (scope: string | null) => void;
  groups: MentionGroup[];
  onOpen: (mention: MentionPart) => void;
  editorClass: string;
  mentionClass: string;
  slotClass?: string;
  filledSlotClass?: string;
  slotInputClass?: string;
  listHostClass: string;
  /** A library whose styles are scoped places the list's host inside the scope. */
  portal: () => HTMLElement;
};

// The props every library binds the same way, so each registry adds only its
// own classes and markup.
export function useMentionEditorProps({
  props,
  bindings,
  emit,
}: Pick<ComponentContext<Catalog, 'MentionEditor'>, 'props' | 'bindings' | 'emit'>) {
  const [content, setContent] = useBoundProp(props.content, bindings?.content);
  const [, setQuery] = useBoundProp(props.query, bindings?.query);
  const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
  const [, setOpened] = useBoundProp(props.opened, bindings?.opened);
  const [, setContext] = useBoundProp(props.context, bindings?.context);
  return {
    label: props.label,
    notation: props.notation ?? 'prose',
    setContext,
    keywords: props.keywords ?? [],
    commands: props.commands ?? false,
    placeholder: props.placeholder ?? '',
    content: content ?? [],
    setContent,
    setQuery,
    scope: scope ?? null,
    setScope,
    groups: props.candidates,
    onOpen: (mention: MentionPart) => {
      setOpened(mention.id);
      emit('open');
    },
  } satisfies Partial<Options>;
}

export function useMentionEditor(options: Options) {
  const listId = useId();
  const [host] = useState(() =>
    Object.assign(document.createElement('div'), { className: options.listHostClass }),
  );
  // One list at a time: a mention or keyword being typed, or a keyword being
  // swapped, in which case `anchor` is the keyword the list opened from.
  const [active, setActive] = useState<{
    trigger: ListContext['trigger'];
    query: string;
    pick: (option: Pickable) => void;
    clear: () => void;
    anchor?: HTMLElement;
  } | null>(null);
  const [wanted, setHighlighted] = useState('');
  const formula = options.notation === 'formula';

  const groups = options.groups.filter((group) => group.options.length > 0);
  const flat = groups.flatMap((group) => group.options);
  const highlighted = flat.some((option) => option.id === wanted) ? wanted : (flat[0]?.id ?? '');
  const open = active !== null && groups.length > 0;
  const optionId = (option: MentionCandidate) => `${listId}-${option.id}`;

  const pick = (option: MentionCandidate) => {
    if (isKind(option)) {
      options.setScope(option.id);
      active?.clear();
    } else {
      active?.pick(option);
    }
    setHighlighted('');
  };

  const context = useRef<ListContext | null>(null);
  const setContext = (next: ListContext | null) => {
    if (same(next, context.current)) return;
    context.current = next;
    live.current.options.setContext?.(next);
  };

  // The editor is created once, so its callbacks read the latest render here.
  const live = useRef({ options, active, flat, highlighted, open, pick });
  live.current = { options, active, flat, highlighted, open, pick };

  const closeSwap = () => {
    setActive(null);
    setHighlighted('');
    setContext(null);
  };

  const keyDown = ({ event }: SuggestionKeyDownProps) => {
    // Goes no further, so a dialog or pane around the demo stays open.
    if (event.key === 'Escape') {
      event.stopPropagation();
      return true;
    }
    return navigate(event);
  };

  const navigate = (event: KeyboardEvent) => {
    const { options, active, flat, highlighted, open, pick } = live.current;
    if (event.key === 'Backspace' && options.scope && active?.query === '') {
      options.setScope(null);
      setHighlighted('');
      return true;
    }
    if (!open || flat.length === 0) return false;
    const index = flat.findIndex((option) => option.id === highlighted);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setHighlighted(flat[(index + step + flat.length) % flat.length].id);
      return true;
    }
    if (event.key === 'Enter' || event.key === 'Tab') {
      pick(flat[Math.max(index, 0)]);
      return true;
    }
    return false;
  };

  const createMention = () =>
    Mention.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          type: {
            default: null,
            // Not data-type: Mention marks its own nodes with that, and reads
            // back only spans that carry it, so a copied mention would paste
            // as text.
            parseHTML: (element) => element.getAttribute('data-mention-type'),
            renderHTML: (attributes) =>
              attributes.type ? { 'data-mention-type': attributes.type } : {},
          },
        };
      },
      addNodeView() {
        return ({ node }) => {
          const mention = {
            id: String(node.attrs.id),
            label: String(node.attrs.label),
            type: String(node.attrs.type),
          };
          // A span rather than a button, so that a long name wraps with the line.
          const dom = Object.assign(document.createElement('span'), {
            className: live.current.options.mentionClass,
            textContent: mention.label,
            contentEditable: 'false',
            tabIndex: 0,
          });
          dom.setAttribute('role', 'button');
          dom.setAttribute('aria-haspopup', 'dialog');
          dom.addEventListener('click', () => live.current.options.onOpen(mention));
          dom.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            live.current.options.onOpen(mention);
          });
          return {
            dom,
            stopEvent: (event) => dom.contains(event.target as Node),
            ignoreMutation: () => true,
          };
        };
      },
    });

  const createSlot = () =>
    TiptapNode.create({
      name: 'slot',
      group: 'inline',
      inline: true,
      atom: true,
      selectable: false,
      // Not data-slot: shadcn marks its own parts with that, and copied
      // shadcn markup would paste as empty slots.
      addAttributes: () => ({
        slot: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-template-slot') ?? '',
          renderHTML: (attributes) => ({ 'data-template-slot': attributes.slot }),
        },
        label: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-label') ?? '',
          renderHTML: (attributes) => ({ 'data-label': attributes.label }),
        },
        required: {
          default: null,
          parseHTML: (element) => {
            const required = element.getAttribute('data-required');
            return required === null ? null : required === 'true';
          },
          renderHTML: (attributes) =>
            attributes.required === null ? {} : { 'data-required': String(attributes.required) },
        },
        value: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-value') ?? '',
          renderHTML: (attributes) => ({ 'data-value': attributes.value }),
        },
      }),
      parseHTML: () => [{ tag: 'span[data-template-slot]' }],
      renderHTML: ({ node, HTMLAttributes }) => [
        'span',
        HTMLAttributes,
        String(node.attrs.value || node.attrs.label),
      ],
      renderText: ({ node }) => String(node.attrs.value),
      addNodeView:
        () =>
        ({ node, editor, getPos }) => {
          const {
            slotClass = '',
            filledSlotClass = '',
            slotInputClass = '',
          } = live.current.options;
          const dom = Object.assign(document.createElement('span'), {
            className: slotClass,
            contentEditable: 'false',
          });
          const input = Object.assign(document.createElement('input'), {
            type: 'text',
            className: slotInputClass,
            placeholder: String(node.attrs.label),
            required: Boolean(node.attrs.required),
          });
          input.setAttribute('aria-label', String(node.attrs.label));
          dom.append(input);
          const show = (value: string) => {
            if (input.value !== value) input.value = value;
            input.size = Math.max((value || input.placeholder).length, 2);
            for (const name of filledSlotClass.split(' ').filter(Boolean))
              dom.classList.toggle(name, value.length > 0);
          };
          show(String(node.attrs.value));

          input.addEventListener('input', () => {
            const pos = getPos();
            if (pos === undefined) return;
            editor.view.dispatch(editor.view.state.tr.setNodeAttribute(pos, 'value', input.value));
          });
          const leave = () => {
            const pos = getPos();
            if (pos !== undefined)
              editor
                .chain()
                .focus()
                .setTextSelection(pos + 1)
                .run();
          };
          input.addEventListener('keydown', (event) => {
            // Enter and Escape confirm or cancel an IME candidate while composing.
            // Safari can deliver the confirming Enter after compositionend, so
            // isComposing is already false; keyCode 229 still marks it.
            if (event.isComposing || event.keyCode === 229) return;
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              leave();
            } else if (event.key === 'Enter') {
              event.preventDefault();
              const inputs = [
                ...editor.view.dom.querySelectorAll<HTMLInputElement>('[data-slot-input]'),
              ];
              const next = inputs[inputs.indexOf(input) + 1];
              if (next) next.focus();
              else leave();
            }
          });
          input.dataset.slotInput = '';

          return {
            dom,
            update: (updated) => {
              if (updated.type.name !== 'slot') return false;
              const { slot, label, required } = node.attrs;
              if (
                updated.attrs.slot !== slot ||
                updated.attrs.label !== label ||
                updated.attrs.required !== required
              ) {
                return false;
              }
              show(String(updated.attrs.value));
              return true;
            },
            stopEvent: (event) => dom.contains(event.target as Node),
            ignoreMutation: () => true,
          };
        },
    });

  const createKeyword = () =>
    TiptapNode.create({
      name: 'keyword',
      group: 'inline',
      inline: true,
      atom: true,
      selectable: false,
      addAttributes: () => ({
        id: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-keyword') ?? '',
          renderHTML: (attributes) => ({ 'data-keyword': attributes.id }),
        },
        label: {
          default: '',
          parseHTML: (element) => element.textContent ?? '',
          renderHTML: () => ({}),
        },
        type: {
          default: '',
          parseHTML: (element) => element.getAttribute('data-keyword-type') ?? '',
          renderHTML: (attributes) => ({ 'data-keyword-type': attributes.type }),
        },
      }),
      parseHTML: () => [{ tag: 'span[data-keyword]' }],
      renderHTML: ({ node, HTMLAttributes }) => ['span', HTMLAttributes, String(node.attrs.label)],
      renderText: ({ node }) => String(node.attrs.label),
      addNodeView:
        () =>
        ({ node, editor, getPos }) => {
          const id = String(node.attrs.id);
          const { keywordClass } = live.current.options;
          const dom = Object.assign(document.createElement('span'), {
            className: typeof keywordClass === 'function' ? keywordClass(id) : (keywordClass ?? ''),
            textContent: String(node.attrs.label),
            contentEditable: 'false',
            tabIndex: 0,
          });
          // A combobox, so the option highlighted in its list is announced.
          dom.setAttribute('role', 'combobox');
          dom.setAttribute('aria-label', String(node.attrs.label));
          dom.setAttribute('aria-haspopup', 'listbox');
          dom.setAttribute('aria-expanded', 'false');

          // The list offers what can stand in the keyword's place, and picking
          // one replaces this keyword and no other with the same id.
          const swap = () => {
            const pos = getPos();
            if (pos === undefined) return;
            // Moving the caret off a mention being typed ends its list, so the
            // two lists never share the host.
            if (live.current.active && !live.current.active.anchor)
              editor.commands.setTextSelection(pos + 1);
            setContext(contextAt(editor.state.doc, pos, 'swap', id, true));
            setHighlighted(id);
            setActive({
              trigger: 'swap',
              query: '',
              anchor: dom,
              clear: () => {},
              pick: (option) => {
                const at = getPos();
                closeSwap();
                if (at === undefined || !isKeywordCandidate(option)) return;
                editor
                  .chain()
                  .focus()
                  .insertContentAt({ from: at, to: at + 1 }, toNodes([asKeyword(option)]))
                  .setTextSelection(at + 1)
                  .run();
              },
            });
          };
          const isOpen = () => live.current.active?.anchor === dom;

          dom.addEventListener('click', () => (isOpen() ? closeSwap() : swap()));
          // Tabbing away closes the list; pressing an option keeps focus here.
          dom.addEventListener('blur', () => {
            if (isOpen()) closeSwap();
          });
          dom.addEventListener('keydown', (event) => {
            if (!isOpen()) {
              if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return;
              event.preventDefault();
              swap();
              return;
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              closeSwap();
            } else if (navigate(event)) {
              event.preventDefault();
            }
          });
          return {
            dom,
            stopEvent: (event) => dom.contains(event.target as Node),
            ignoreMutation: () => true,
            destroy: () => {
              if (isOpen()) closeSwap();
            },
          };
        },
    });

  // A word the formula knows becomes its keyword once the actor types what
  // ends it: a space, a bracket or a comma. The longest wording wins, and it
  // may take in keywords already made from its first words, so "is not"
  // becomes one operator after "is" became one on its own.
  const createWords = () =>
    Extension.create({
      name: 'keywordWords',
      addProseMirrorPlugins: () => [
        new Plugin({
          key: new PluginKey('keywordWords'),
          props: {
            handleTextInput: (view, from, to, text) => {
              if (!/^[\s(),]$/.test(text)) return false;
              // Words typed after @ or / are the list's query.
              if (live.current.active && !live.current.active.anchor) return false;
              const $from = view.state.doc.resolve(from);
              // The line up to the caret, keywords read as their labels. Each
              // character keeps where it starts, or null inside a label.
              let before = '';
              const starts: (number | null)[] = [];
              let typed = false;
              $from.parent.forEach((node, offset) => {
                const pos = $from.start() + offset;
                if (pos >= from) return;
                const label = node.isText
                  ? (node.text ?? '').slice(0, from - pos)
                  : node.type.name === 'keyword'
                    ? String(node.attrs.label)
                    : '\ufffc';
                before += label;
                // By UTF-16 unit, as `before` and positions count.
                for (let i = 0; i < label.length; i++)
                  starts.push(node.isText ? pos + i : i === 0 ? pos : null);
                typed = node.isText;
              });
              if (!typed) return false;
              const lower = before.toLocaleLowerCase();
              const found = [...(live.current.options.keywords ?? [])]
                .sort((a, b) => b.label.length - a.label.length)
                .find((keyword) => {
                  const start = before.length - keyword.label.length;
                  return (
                    start >= 0 &&
                    starts[start] !== null &&
                    lower.endsWith(keyword.label.toLocaleLowerCase()) &&
                    !/[\p{L}\p{N}_@/]/u.test(before[start - 1] ?? '')
                  );
                });
              if (!found) return false;
              const start = starts[before.length - found.label.length]!;
              const { schema } = view.state;
              view.dispatch(
                view.state.tr.replaceWith(start, to, [
                  schema.nodeFromJSON(toNodes([asKeyword(found)])[0]),
                  schema.text(text),
                ]),
              );
              return true;
            },
          },
        }),
      ],
    });

  const createBrackets = () =>
    Extension.create({
      name: 'brackets',
      addProseMirrorPlugins: () => [
        new Plugin({
          key: new PluginKey('brackets'),
          props: {
            decorations: (state) => {
              const pair = bracketPair(state);
              const className = live.current.options.bracketClass;
              if (!pair || !className) return null;
              return DecorationSet.create(
                state.doc,
                pair.map((pos) => Decoration.inline(pos, pos + 1, { class: className })),
              );
            },
          },
        }),
      ],
    });

  const insertion = (option: MentionPart | KeywordCandidate): JSONContent[] =>
    toNodes(isKeywordCandidate(option) ? [asKeyword(option), option.then ?? ''] : [option]);

  // Replaces what was typed, from the trigger on, with the picked candidate.
  const apply = (editor: Editor, range: { from: number; to: number }, option: Pickable) => {
    if (isWrap(option)) {
      // Found before what was typed goes, so nothing is lost when there is
      // no condition to wrap.
      const found = conditionAt(editor.state.doc, range.from);
      if (!found) return;
      const typed = range.to - range.from;
      const to = found.to > range.from ? found.to - typed : found.to;
      editor.chain().focus().deleteRange(range).run();
      // The caret goes after the wrapped condition, past both new parts.
      const size = editor.state.doc.content.size;
      editor
        .chain()
        .insertContentAt(to, toNodes(option.wrap.after))
        .insertContentAt(found.from, toNodes(option.wrap.before))
        .run();
      editor
        .chain()
        .setTextSelection(to + editor.state.doc.content.size - size)
        .run();
      return;
    }
    if (isInsert(option)) {
      const { before, after, line } = option.insert;
      const chain = editor.chain().focus().deleteRange(range);
      (line ? chain.splitBlock() : chain).insertContent(toNodes(before)).run();
      const caret = editor.state.selection.from;
      if (after?.length)
        editor.chain().insertContentAt(caret, toNodes(after)).setTextSelection(caret).run();
      return;
    }
    editor.chain().focus().insertContentAt(range, insertion(option)).run();
  };

  // @ names an item; / inserts or does what the spec offers.
  const suggest = (char: '@' | '/') => ({
    char,
    // In a formula a mention follows a bracket or a comma as often as a space.
    allowedPrefixes: formula ? null : [' '],
    items: () => [],
    render: () => {
      let unmount: (() => void) | undefined;
      const follow = (props: SuggestionProps) => {
        live.current.options.setQuery(props.query);
        setContext(contextAt(props.editor.state.doc, props.range.from, char, null, formula));
        setActive({
          trigger: char,
          query: props.query,
          // Prose keeps Mention's own insertion, with a space after the mention.
          pick: (option) => {
            const plain = !isKeywordCandidate(option) && !isInsert(option) && !isWrap(option);
            if (!formula && plain) return props.command(option);
            apply(props.editor, props.range, option);
          },
          clear: () => {
            if (props.range.to <= props.range.from + 1) return;
            props.editor
              .chain()
              .focus()
              .deleteRange({ from: props.range.from + 1, to: props.range.to })
              .run();
          },
        });
      };
      return {
        onStart: (props: SuggestionProps) => {
          follow(props);
          live.current.options.portal().append(host);
          unmount = props.mount(host);
        },
        onUpdate: follow,
        onKeyDown: keyDown,
        onExit: () => {
          unmount?.();
          unmount = undefined;
          live.current.options.setQuery(null);
          live.current.options.setScope(null);
          // A keyword's list may have opened as this one ended.
          if (live.current.active?.anchor) return;
          host.remove();
          setActive(null);
          setHighlighted('');
          setContext(null);
        },
      };
    },
  });

  // So that state arriving back is not taken for a change from elsewhere.
  const written = useRef<Paragraph[] | null>(null);

  const [extensions] = useState(() => [
    StarterKit.configure({
      blockquote: false,
      bold: false,
      bulletList: false,
      code: false,
      codeBlock: false,
      dropcursor: false,
      gapcursor: false,
      hardBreak: false,
      heading: false,
      horizontalRule: false,
      italic: false,
      link: false,
      listItem: false,
      listKeymap: false,
      orderedList: false,
      strike: false,
      trailingNode: false,
      underline: false,
    }),
    Placeholder.configure({ placeholder: options.placeholder }),
    createSlot(),
    ...(formula ? [createBrackets()] : []),
    createKeyword(),
    ...(formula ? [createWords()] : []),
    createMention().configure({
      renderText: ({ node }) => String(node.attrs.label),
      suggestions: [suggest('@'), ...(options.commands ? [suggest('/')] : [])],
    }),
  ]);

  const editor = useEditor({
    immediatelyRender: true,
    extensions,
    content: toDoc(options.content),
    editorProps: {
      attributes: {
        'role': 'textbox',
        'aria-multiline': 'true',
        'aria-label': options.label,
        'aria-autocomplete': 'list',
        'class': options.editorClass,
      },
    },
    onUpdate: ({ editor }) => {
      const content = fromDoc(editor.getJSON());
      written.current = content;
      live.current.options.setContent(content);
    },
  });

  // A component shown again after suspending sees the editor Tiptap destroyed
  // while it was hidden, for one effect pass before the new one arrives.
  useEffect(() => {
    if (editor.isDestroyed) return;
    if (same(options.content, written.current)) return;
    if (same(options.content, fromDoc(editor.getJSON()))) return;
    editor.commands.setContent(toDoc(options.content), { emitUpdate: false });
  }, [editor, options.content]);

  // The editable region exists once EditorContent has mounted the view, which
  // can be after this component's first effects.
  const [dom, setDom] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const mounted = () => setDom('dom' in editor.view ? editor.view.dom : null);
    mounted();
    editor.on('mount', mounted);
    return () => {
      editor.off('mount', mounted);
    };
  }, [editor]);

  useEffect(() => {
    host.hidden = !open;
  }, [host, open]);

  // A swapped keyword keeps focus while its list is open, so it carries the
  // list's attributes in place of the editor.
  const anchor = active?.anchor ?? null;
  useEffect(() => {
    const owner = anchor ?? dom;
    if (!owner) return;
    if (open) owner.setAttribute('aria-controls', listId);
    else owner.removeAttribute('aria-controls');
    if (open && highlighted)
      owner.setAttribute('aria-activedescendant', `${listId}-${highlighted}`);
    else owner.removeAttribute('aria-activedescendant');
    anchor?.setAttribute('aria-expanded', String(open));
    return () => {
      owner.removeAttribute('aria-controls');
      owner.removeAttribute('aria-activedescendant');
      anchor?.setAttribute('aria-expanded', 'false');
    };
  }, [anchor, dom, open, highlighted, listId]);

  useEffect(() => {
    if (!anchor) return;
    live.current.options.portal().append(host);
    Object.assign(host.style, { width: 'max-content' });
    const place = () =>
      computePosition(anchor, host, {
        placement: 'bottom-start',
        middleware: [offset(4), flip()],
      }).then(({ x, y, strategy }) =>
        Object.assign(host.style, { position: strategy, left: `${x}px`, top: `${y}px` }),
      );
    const stop = autoUpdate(anchor, host, place);
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!host.contains(target) && !anchor.contains(target)) closeSwap();
    };
    document.addEventListener('pointerdown', outside, true);
    return () => {
      stop();
      document.removeEventListener('pointerdown', outside, true);
      host.style.width = '';
      // A click that closed this list may have started a mention's list.
      if (!live.current.active || live.current.active.anchor) host.remove();
    };
    // closeSwap only sets state, so it need not re-run the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, host]);

  // A keyword with nothing to swap for, such as "not", opens no list.
  useEffect(() => {
    if (anchor && !open) closeSwap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, open]);

  useEffect(() => {
    if (open && highlighted)
      document.getElementById(`${listId}-${highlighted}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, highlighted, listId]);

  useEffect(
    () => () => {
      host.remove();
      live.current.options.setQuery(null);
      live.current.options.setScope(null);
    },
    [host],
  );

  return {
    editor: editor as Editor,
    open,
    groups,
    host,
    list: { 'id': listId, 'role': 'listbox', 'aria-label': options.label },
    option: (option: MentionCandidate) => ({
      'id': optionId(option),
      'role': 'option',
      'aria-selected': option.id === highlighted,
      // Otherwise pressing the list takes focus from the editor and ends the mention.
      'onMouseDown': (event: MouseEvent) => event.preventDefault(),
      'onPointerMove': () => setHighlighted(option.id),
      'onClick': () => pick(option),
    }),
  };
}
