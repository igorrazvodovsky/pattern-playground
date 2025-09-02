import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { useEditorContext } from '../EditorProvider';
import type { SlotComponent } from '../types';

interface EditorBubbleMenuProps {
  className?: string;
  tippyOptions?: Record<string, unknown>;
}

export function EditorBubbleMenu({ className, tippyOptions }: EditorBubbleMenuProps) {
  const { editor, slots } = useEditorContext();
  const components = slots.getComponents('bubble-menu');


  if (components.length === 0) {
    return null;
  }

  return (
    <BubbleMenu
      editor={editor}
      className={className}
      tippyOptions={tippyOptions}
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