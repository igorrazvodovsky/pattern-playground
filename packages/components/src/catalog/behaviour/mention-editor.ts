import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { Node as TiptapNode } from '@tiptap/core';
import { useEditor, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Mention from '@tiptap/extension-mention';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import type { iconNames } from '../catalog';

// A MentionEditor's behaviour on Tiptap, shared by the registries so that only
// the markup differs.
//
// Marks and blocks other than paragraphs are switched off, because the content
// is written back to state as plain runs, mentions and slots, and anything
// else would be lost on the way.

export type MentionPart = { id: string; label: string; type: string };
export type SlotPart = { slot: string; label: string; required: boolean | null; value: string };
export type Paragraph = (string | MentionPart | SlotPart)[];
type CandidateIcon = (typeof iconNames)[number] | null;
export type KindCandidate = { id: string; label: string; narrows: true; icon?: CandidateIcon };
export type MentionCandidate = (MentionPart & { icon?: CandidateIcon }) | KindCandidate;
export type MentionGroup = { heading: string | null; options: MentionCandidate[] };

export const isKind = (candidate: MentionCandidate): candidate is KindCandidate => 'narrows' in candidate;
export const isSlot = (part: Paragraph[number]): part is SlotPart => typeof part !== 'string' && 'slot' in part;

const toDoc = (paragraphs: Paragraph[]): JSONContent => ({
  type: 'doc',
  content: paragraphs.map(parts => {
    const content = parts
      .filter(part => typeof part !== 'string' || part.length > 0)
      .map(part =>
        typeof part === 'string'
          ? { type: 'text', text: part }
          : isSlot(part)
            ? { type: 'slot', attrs: { slot: part.slot, label: part.label, required: part.required, value: part.value } }
            : { type: 'mention', attrs: { id: part.id, label: part.label, type: part.type } },
      );
    return content.length > 0 ? { type: 'paragraph', content } : { type: 'paragraph' };
  }),
});

const fromDoc = (doc: JSONContent): Paragraph[] =>
  (doc.content ?? []).map(paragraph => {
    const parts: Paragraph = [];
    for (const node of paragraph.content ?? []) {
      if (node.type === 'mention') {
        const { id, label, type } = node.attrs ?? {};
        parts.push({ id: String(id), label: String(label), type: String(type) });
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

type Options = {
  label: string;
  placeholder: string;
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

export function useMentionEditor(options: Options) {
  const listId = useId();
  const [host] = useState(() => Object.assign(document.createElement('div'), { className: options.listHostClass }));
  const [active, setActive] = useState<{
    query: string;
    command: (mention: MentionPart) => void;
    clear: () => void;
  } | null>(null);
  const [wanted, setHighlighted] = useState('');

  const groups = options.groups.filter(group => group.options.length > 0);
  const flat = groups.flatMap(group => group.options);
  const highlighted = flat.some(option => option.id === wanted) ? wanted : (flat[0]?.id ?? '');
  const open = active !== null && groups.length > 0;
  const optionId = (option: MentionCandidate) => `${listId}-${option.id}`;

  const pick = (option: MentionCandidate) => {
    if (isKind(option)) {
      options.setScope(option.id);
      active?.clear();
    } else {
      active?.command(option);
    }
    setHighlighted('');
  };

  // The editor is created once, so its callbacks read the latest render here.
  const live = useRef({ options, active, flat, highlighted, open, pick });
  live.current = { options, active, flat, highlighted, open, pick };

  const keyDown = ({ event }: SuggestionKeyDownProps) => {
    // Goes no further, so a dialog or pane around the demo stays open.
    if (event.key === 'Escape') {
      event.stopPropagation();
      return true;
    }
    const { options, active, flat, highlighted, open, pick } = live.current;
    if (event.key === 'Backspace' && options.scope && active?.query === '') {
      options.setScope(null);
      setHighlighted('');
      return true;
    }
    if (!open || flat.length === 0) return false;
    const index = flat.findIndex(option => option.id === highlighted);
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
            parseHTML: element => element.getAttribute('data-mention-type'),
            renderHTML: attributes => (attributes.type ? { 'data-mention-type': attributes.type } : {}),
          },
        };
      },
      addNodeView() {
        return ({ node }) => {
          const mention = { id: String(node.attrs.id), label: String(node.attrs.label), type: String(node.attrs.type) };
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
          dom.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            live.current.options.onOpen(mention);
          });
          return { dom, stopEvent: event => dom.contains(event.target as Node), ignoreMutation: () => true };
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
          parseHTML: element => element.getAttribute('data-template-slot') ?? '',
          renderHTML: attributes => ({ 'data-template-slot': attributes.slot }),
        },
        label: {
          default: '',
          parseHTML: element => element.getAttribute('data-label') ?? '',
          renderHTML: attributes => ({ 'data-label': attributes.label }),
        },
        required: {
          default: null,
          parseHTML: element => {
            const required = element.getAttribute('data-required');
            return required === null ? null : required === 'true';
          },
          renderHTML: attributes => (attributes.required === null ? {} : { 'data-required': String(attributes.required) }),
        },
        value: {
          default: '',
          parseHTML: element => element.getAttribute('data-value') ?? '',
          renderHTML: attributes => ({ 'data-value': attributes.value }),
        },
      }),
      parseHTML: () => [{ tag: 'span[data-template-slot]' }],
      renderHTML: ({ node, HTMLAttributes }) => ['span', HTMLAttributes, String(node.attrs.value || node.attrs.label)],
      renderText: ({ node }) => String(node.attrs.value),
      addNodeView: () => ({ node, editor, getPos }) => {
        const { slotClass = '', filledSlotClass = '', slotInputClass = '' } = live.current.options;
        const dom = Object.assign(document.createElement('span'), { className: slotClass, contentEditable: 'false' });
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
          for (const name of filledSlotClass.split(' ').filter(Boolean)) dom.classList.toggle(name, value.length > 0);
        };
        show(String(node.attrs.value));

        input.addEventListener('input', () => {
          const pos = getPos();
          if (pos === undefined) return;
          editor.view.dispatch(editor.view.state.tr.setNodeAttribute(pos, 'value', input.value));
        });
        const leave = () => {
          const pos = getPos();
          if (pos !== undefined) editor.chain().focus().setTextSelection(pos + 1).run();
        };
        input.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            leave();
          } else if (event.key === 'Enter' && !event.isComposing) {
            event.preventDefault();
            const inputs = [...editor.view.dom.querySelectorAll<HTMLInputElement>('[data-slot-input]')];
            const next = inputs[inputs.indexOf(input) + 1];
            if (next) next.focus();
            else leave();
          }
        });
        input.dataset.slotInput = '';

        return {
          dom,
          update: updated => {
            if (updated.type.name !== 'slot') return false;
            const { slot, label, required } = node.attrs;
            if (updated.attrs.slot !== slot || updated.attrs.label !== label || updated.attrs.required !== required) {
              return false;
            }
            show(String(updated.attrs.value));
            return true;
          },
          stopEvent: event => dom.contains(event.target as Node),
          ignoreMutation: () => true,
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
    createMention().configure({
      renderText: ({ node }) => String(node.attrs.label),
      suggestion: {
        char: '@',
        items: () => [],
        render: () => {
          let unmount: (() => void) | undefined;
          const follow = (props: SuggestionProps) => {
            live.current.options.setQuery(props.query);
            setActive({
              query: props.query,
              command: mention => props.command(mention),
              clear: () => {
                if (props.range.to <= props.range.from + 1) return;
                props.editor.chain().focus().deleteRange({ from: props.range.from + 1, to: props.range.to }).run();
              },
            });
          };
          return {
            onStart: props => {
              follow(props);
              live.current.options.portal().append(host);
              unmount = props.mount(host);
            },
            onUpdate: follow,
            onKeyDown: keyDown,
            onExit: () => {
              unmount?.();
              unmount = undefined;
              host.remove();
              setActive(null);
              setHighlighted('');
              live.current.options.setQuery(null);
              live.current.options.setScope(null);
            },
          };
        },
      },
    }),
  ]);

  const editor = useEditor({
    immediatelyRender: true,
    extensions,
    content: toDoc(options.content),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': options.label,
        'aria-autocomplete': 'list',
        class: options.editorClass,
      },
    },
    onUpdate: ({ editor }) => {
      const content = fromDoc(editor.getJSON());
      written.current = content;
      live.current.options.setContent(content);
    },
  });

  useEffect(() => {
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

  useEffect(() => {
    if (!dom) return;
    if (open) dom.setAttribute('aria-controls', listId);
    else dom.removeAttribute('aria-controls');
    if (open && highlighted) dom.setAttribute('aria-activedescendant', `${listId}-${highlighted}`);
    else dom.removeAttribute('aria-activedescendant');
  }, [dom, open, highlighted, listId]);

  useEffect(() => {
    if (open && highlighted) document.getElementById(`${listId}-${highlighted}`)?.scrollIntoView({ block: 'nearest' });
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
    list: { id: listId, role: 'listbox', 'aria-label': options.label },
    option: (option: MentionCandidate) => ({
      id: optionId(option),
      role: 'option',
      'aria-selected': option.id === highlighted,
      // Otherwise pressing the list takes focus from the editor and ends the mention.
      onMouseDown: (event: MouseEvent) => event.preventDefault(),
      onPointerMove: () => setHighlighted(option.id),
      onClick: () => pick(option),
    }),
  };
}
