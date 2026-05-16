import React from 'react';
import { FloatingMenu } from '@tiptap/react';
import { useEditorContext } from '../EditorProvider';
import type { SlotComponent } from '../types';

interface EditorFloatingMenuProps {
  className?: string;
  options?: Record<string, unknown>;
}

export function EditorFloatingMenu({ className, options }: EditorFloatingMenuProps) {
  const { editor, slots } = useEditorContext();
  const components = slots.getComponents('floating-menu');

  if (components.length === 0) {
    return null;
  }

  return (
    <FloatingMenu 
      editor={editor} 
      className={className}
      options={options}
    >
      <div data-slot="floating-menu">
        {components.map((component: SlotComponent, index: number) => (
          <div key={`${component.pluginId}-${index}`} data-plugin={component.pluginId}>
            {component.render()}
          </div>
        ))}
      </div>
    </FloatingMenu>
  );
}