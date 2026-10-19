import { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import { useEditor, type Editor, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Mention from '@tiptap/extension-mention';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';

// A MentionEditor's behaviour on Tiptap, shared by the registries so that only
// the markup differs: the editor and its content as data, the list of
// candidates under the caret while the actor types after @, and the mentions
// as buttons inside the text. A candidate can stand for a kind of item rather
// than an item: picking it narrows the list to that kind, and Backspace with
// nothing typed widens it again. Tiptap is headless, as Leaflet is under the
// maps; each library draws the field, the mentions and the list.
//
// The editor holds paragraphs and mentions only. Marks and other blocks are
// switched off, because the content is written back to state as plain runs
// and mentions, and anything else would be lost on the way.

export type MentionPart = { id: string; label: string; type: string };
export type Paragraph = (string | MentionPart)[];
/** A candidate that narrows the list to one kind of item instead of naming an item. */
export type KindCandidate = { id: string; label: string; narrows: true };
export type MentionCandidate = MentionPart | KindCandidate;
export type MentionGroup = { heading: string | null; options: MentionCandidate[] };

export const isKind = (candidate: MentionCandidate): candidate is KindCandidate => 'narrows' in candidate;

const toDoc = (paragraphs: Paragraph[]): JSONContent => ({
  type: 'doc',
  content: paragraphs.map(parts => {
    const content = parts
      .filter(part => typeof part !== 'string' || part.length > 0)
      .map(part =>
        typeof part === 'string'
          ? { type: 'text', text: part }
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
  /** The kind the list is narrowed to, if any. */
  scope: string | null;
  setScope: (scope: string | null) => void;
  groups: MentionGroup[];
  /** Called when the actor presses a mention. */
  onOpen: (mention: MentionPart) => void;
  /** Classes on the editable region and on each mention. */
  editorClass: string;
  mentionClass: string;
  /** Classes on the element the list is positioned in. */
  listHostClass: string;
  /** Where the list's host is placed: a library whose styles are scoped places it inside the scope. */
  portal: () => HTMLElement;
};

export function useMentionEditor(options: Options) {
  const listId = useId();
  const [host] = useState(() => Object.assign(document.createElement('div'), { className: options.listHostClass }));
  // Set while the actor is typing after @: what they typed, the command that
  // inserts a mention in place of it, and one that clears it but keeps the @.
  const [active, setActive] = useState<{
    query: string;
    command: (mention: MentionPart) => void;
    clear: () => void;
  } | null>(null);
  const [wanted, setHighlighted] = useState('');

  const groups = options.groups.filter(group => group.options.length > 0);
  const flat = groups.flatMap(group => group.options);
  // The first candidate is highlighted until the actor moves, so Enter picks it.
  const highlighted = flat.some(option => option.id === wanted) ? wanted : (flat[0]?.id ?? '');
  const open = active !== null && groups.length > 0;
  const optionId = (option: MentionCandidate) => `${listId}-${option.id}`;

  // A kind narrows the list and starts the query over within it.
  const pick = (option: MentionCandidate) => {
    if (isKind(option)) {
      options.setScope(option.id);
      active?.clear();
    } else {
      active?.command(option);
    }
    setHighlighted('');
  };

  // The editor is created once; its callbacks read the latest render here.
  const live = useRef({ options, active, flat, highlighted, open, pick });
  live.current = { options, active, flat, highlighted, open, pick };

  const keyDown = ({ event }: SuggestionKeyDownProps) => {
    // Tiptap closes the list on Escape. The key goes no further, so a dialog
    // or pane around the demo stays open.
    if (event.key === 'Escape') {
      event.stopPropagation();
      return true;
    }
    const { options, active, flat, highlighted, open, pick } = live.current;
    // With nothing typed, Backspace widens a narrowed list before it deletes the @.
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

  // A mention is a button inside the text. Its events are its own, so that
  // pressing it opens the item rather than selecting the node.
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
          // A span rather than a button, so that a long name wraps with the
          // line like the text around it.
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

  // What the editor last wrote to state, so that state arriving back is not
  // taken for a change from elsewhere.
  const written = useRef<Paragraph[] | null>(null);

  // Built once: the editor is created once, and its callbacks read `live`.
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

  // Content set from outside the editor replaces what it holds.
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

  // The host stays positioned under the caret while a mention is being typed;
  // with no candidates to show, it is hidden rather than left as an empty box.
  useEffect(() => {
    host.hidden = !open;
  }, [host, open]);

  // The list is read through the editor, where focus stays.
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

  // A library switch unmounts the editor mid-mention: the typed text stays in
  // the content, and the list closes with the editor.
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
      // Pressing the list would take focus from the editor and end the mention.
      onMouseDown: (event: MouseEvent) => event.preventDefault(),
      onPointerMove: () => setHighlighted(option.id),
      onClick: () => pick(option),
    }),
  };
}
