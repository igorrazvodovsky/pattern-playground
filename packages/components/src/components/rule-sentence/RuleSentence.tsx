import { Node, mergeAttributes } from '@tiptap/core';
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useMemo, useRef } from 'react';
import '../../jsx-types';

// A rule shown as one sentence. The fixed words are text; every part the
// actor may change is an inline slot that opens a list of what can go there.
// The sentence is derived from the caller's rule model on every render and is
// never typed into, so it can only say things the system can run.

export interface RuleSlotOption {
  value: string;
  label: string;
}

export interface RuleSlot {
  id: string;
  /** `choice` picks a value, `add` appends a new clause, `remove` deletes one. */
  kind: 'choice' | 'add' | 'remove';
  /** Accessible name of the control, e.g. "Change who it is from". */
  name: string;
  /** Wording shown in the sentence. Ignored for `remove`. */
  label?: string;
  options?: RuleSlotOption[];
  /** Current values of a `choice`. */
  value?: string[];
  /** A `choice` that holds several values at once. */
  multiple?: boolean;
}

/** Fixed words, or a slot. */
export type RulePart = string | RuleSlot;

export interface RuleSentenceHandlers {
  onChange?: (slotId: string, value: string[]) => void;
  onAdd?: (slotId: string, value: string) => void;
  onRemove?: (slotId: string) => void;
}

interface RuleSlotNodeOptions {
  getHandlers: () => RuleSentenceHandlers;
}

const ChoiceSlot = ({ slot, handlers }: { slot: RuleSlot; handlers: RuleSentenceHandlers }) => {
  const dropdownRef = useRef<HTMLElement & { hide: () => void }>(null);
  const listRef = useRef<HTMLElement>(null);
  const current = useMemo(() => slot.value ?? [], [slot.value]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const handleSelect = (event: Event) => {
      const value = (event as CustomEvent<{ item: HTMLElement }>).detail.item.dataset.value;
      if (value === undefined) return;
      if (slot.kind === 'add') {
        handlers.onAdd?.(slot.id, value);
        dropdownRef.current?.hide();
      } else if (slot.multiple) {
        const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
        // A slot never goes empty: the sentence would stop being a sentence.
        if (next.length > 0) handlers.onChange?.(slot.id, next);
      } else {
        handlers.onChange?.(slot.id, [value]);
        dropdownRef.current?.hide();
      }
    };
    list.addEventListener('pp-select', handleSelect);
    return () => list.removeEventListener('pp-select', handleSelect);
  }, [slot, current, handlers]);

  const itemType = slot.kind === 'add' ? undefined : slot.multiple ? 'checkbox' : 'radio';

  return (
    <pp-dropdown ref={dropdownRef} placement="bottom-start" stay-open-on-select={slot.multiple || undefined}>
      <button
        type="button"
        data-slot="trigger"
        className={`rule-slot rule-slot--${slot.kind}`}
        aria-label={slot.kind === 'add' ? slot.name : `${slot.name}: ${slot.label}`}
      >
        {slot.kind === 'add' ? (
          <iconify-icon icon="ph:plus" aria-hidden="true"></iconify-icon>
        ) : (
          slot.label
        )}
      </button>
      <pp-popup>
        <pp-list ref={listRef}>
          {slot.options?.map(option => (
            <pp-list-item
              key={option.value}
              data-value={option.value}
              type={itemType}
              checked={itemType ? current.includes(option.value) : undefined}
            >
              {option.label}
            </pp-list-item>
          ))}
        </pp-list>
      </pp-popup>
    </pp-dropdown>
  );
};

const RuleSlotView = ({ node, extension }: NodeViewProps) => {
  const slot = node.attrs.slot as RuleSlot;
  const handlers = (extension.options as RuleSlotNodeOptions).getHandlers();

  return (
    <NodeViewWrapper as="span" className="rule-sentence__slot">
      {slot.kind === 'remove' ? (
        <button
          type="button"
          className="rule-slot rule-slot--remove"
          aria-label={slot.name}
          title={slot.name}
          onClick={() => handlers.onRemove?.(slot.id)}
        >
          <iconify-icon icon="ph:x" aria-hidden="true"></iconify-icon>
        </button>
      ) : (
        <ChoiceSlot slot={slot} handlers={handlers} />
      )}
    </NodeViewWrapper>
  );
};

export const RuleSlotNode = Node.create<RuleSlotNodeOptions>({
  name: 'ruleSlot',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addOptions() {
    return { getHandlers: () => ({}) };
  },

  addAttributes() {
    return { slot: { default: null, rendered: false } };
  },

  parseHTML() {
    return [{ tag: 'span[data-rule-slot]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes({ 'data-rule-slot': '' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RuleSlotView, { as: 'span' });
  },
});

const toDoc = (parts: RulePart[]) => ({
  type: 'doc',
  content: [{
    type: 'paragraph',
    content: parts
      .filter(part => part !== '')
      .map((part, i, all) => typeof part === 'string'
        // A word joiner keeps punctuation on the same line as the slot before it.
        ? { type: 'text', text: typeof all[i - 1] === 'object' && /^[,.;:]/.test(part) ? `\u2060${part}` : part }
        : { type: 'ruleSlot', attrs: { slot: part } }),
  }],
});

export interface RuleSentenceProps extends RuleSentenceHandlers {
  parts: RulePart[];
  /** Accessible name for the whole rule. */
  label: string;
}

export function RuleSentence({ parts, label, onChange, onAdd, onRemove }: RuleSentenceProps) {
  const handlers = useRef<RuleSentenceHandlers>({});
  handlers.current = { onChange, onAdd, onRemove };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ undoRedo: false, dropcursor: false, gapcursor: false, trailingNode: false }),
      RuleSlotNode.configure({
        getHandlers: () => ({
          onChange: (id, value) => handlers.current.onChange?.(id, value),
          onAdd: (id, value) => handlers.current.onAdd?.(id, value),
          onRemove: id => handlers.current.onRemove?.(id),
        }),
      }),
    ],
    content: toDoc(parts),
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: { role: 'group', 'aria-label': label, class: 'rule-sentence__text' },
    },
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) editor.commands.setContent(toDoc(parts), { emitUpdate: false });
  }, [editor, parts]);

  return <EditorContent editor={editor} className="rule-sentence" />;
}
