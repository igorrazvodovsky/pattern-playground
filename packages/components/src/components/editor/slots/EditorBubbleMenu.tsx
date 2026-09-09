import { useEffect, useReducer } from 'react';
import { BubbleMenu } from '@tiptap/react/menus'
import { useEditorContext } from '../EditorProvider';
import type { SlotComponent } from '../types';

interface EditorBubbleMenuProps {
  className?: string;
  options?: Record<string, unknown>;
}

export function EditorBubbleMenu({ className, options }: EditorBubbleMenuProps) {
  const { editor, slots } = useEditorContext();

  // Slot conditions are evaluated at render time, and several plugins gate
  // their bubble-menu entry on a non-empty selection. Nothing else re-renders
  // this component when the selection moves, so it has to listen itself.
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    editor.on('selectionUpdate', rerender);
    return () => {
      editor.off('selectionUpdate', rerender);
    };
  }, [editor]);

  // Mount on the unfiltered count, not the condition-filtered one: Tiptap's
  // BubbleMenu decides when to show itself, and it never fires if the element
  // is mounted only once a selection already exists.
  if (slots.getSlotComponentCount('bubble-menu') === 0) {
    return null;
  }

  const components = slots.getComponents('bubble-menu');

  return (
    <BubbleMenu
      editor={editor}
      className={className}
      options={options}
    >
      <div className="bubble-menu inline-flow" data-slot="bubble-menu">
        {components.map((component: SlotComponent, index: number) => (
          <div key={`${component.pluginId}-${index}`} data-plugin={component.pluginId}>
            {component.render()}
          </div>
        ))}
      </div>
    </BubbleMenu>
  );
}
