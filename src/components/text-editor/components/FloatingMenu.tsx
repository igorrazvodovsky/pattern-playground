import React from 'react';
import { FloatingMenu as TiptapFloatingMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import type { FloatingMenuConfig } from '../types';

interface FloatingMenuProps {
  editor: Editor;
  config: FloatingMenuConfig;
  pluginKey?: string;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  editor,
  config,
  pluginKey = 'floatingMenu',
}) => {
  const { actions, shouldShow, className = '' } = config;

  const defaultShouldShow = ({ state }: { state: any }) => {
    const { $anchor } = state.selection;
    const isEmptyTextBlock = $anchor.parent.textContent === '';
    const isAtStart = $anchor.pos === 1;
    return isEmptyTextBlock || isAtStart;
  };

  // Group actions by group property
  const groupedActions = actions.reduce((groups, action) => {
    const group = action.group || 'default';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(action);
    return groups;
  }, {} as Record<string, typeof actions>);

  return (
    <TiptapFloatingMenu
      editor={editor}
      pluginKey={pluginKey}
      shouldShow={shouldShow || defaultShouldShow}
    >
      <div className={`floating-menu ${className}`}>
        {Object.entries(groupedActions).map(([groupName, groupActions]) => (
          <div key={groupName} className="floating-menu__section">
            {groupActions.map((action) => (
              <button
                key={action.id}
                className="button button--small button--plain"
                is="pp-button"
                onClick={() => action.handler(editor)}
                title={action.tooltip || action.label}
              >
                <iconify-icon className="icon" icon={action.icon}></iconify-icon>
                {action.label && (
                  <span className="inclusively-hidden">{action.label}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </TiptapFloatingMenu>
  );
};

// Predefined actions for floating menu
export const createHeadingAction = (level: 1 | 2 | 3 | 4 | 5 | 6) => ({
  id: `heading-${level}`,
  label: `Heading ${level}`,
  icon: `ph:text-h-${level === 1 ? 'one' : level === 2 ? 'two' : level === 3 ? 'three' : level === 4 ? 'four' : level === 5 ? 'five' : 'six'}`,
  tooltip: `Heading ${level}`,
  group: 'headings',
  handler: (editor: Editor) => {
    editor.chain().focus().toggleHeading({ level }).run();
  },
});

export const createBulletListAction = () => ({
  id: 'bullet-list',
  label: 'Bullet List',
  icon: 'ph:list-bullets',
  tooltip: 'Bullet List',
  group: 'lists',
  handler: (editor: Editor) => {
    editor.chain().focus().toggleBulletList().run();
  },
});

export const createOrderedListAction = () => ({
  id: 'ordered-list',
  label: 'Numbered List',
  icon: 'ph:list-numbers',
  tooltip: 'Numbered List',
  group: 'lists',
  handler: (editor: Editor) => {
    editor.chain().focus().toggleOrderedList().run();
  },
});

export const createCodeBlockAction = () => ({
  id: 'code-block',
  label: 'Code Block',
  icon: 'ph:code',
  tooltip: 'Code Block',
  group: 'blocks',
  handler: (editor: Editor) => {
    editor.chain().focus().toggleCodeBlock().run();
  },
});

export const createBlockquoteAction = () => ({
  id: 'blockquote',
  label: 'Quote',
  icon: 'ph:quotes',
  tooltip: 'Quote',
  group: 'blocks',
  handler: (editor: Editor) => {
    editor.chain().focus().toggleBlockquote().run();
  },
});

export const createHorizontalRuleAction = () => ({
  id: 'horizontal-rule',
  label: 'Horizontal Rule',
  icon: 'ph:line-horizontal',
  tooltip: 'Horizontal Rule',
  group: 'blocks',
  handler: (editor: Editor) => {
    editor.chain().focus().setHorizontalRule().run();
  },
});

// Predefined floating menu configurations
export const FLOATING_MENU_PRESETS = {
  basic: {
    actions: [
      createHeadingAction(1),
      createHeadingAction(2),
      createHeadingAction(3),
      createBulletListAction(),
      createOrderedListAction(),
    ],
  },
  
  full: {
    actions: [
      createHeadingAction(1),
      createHeadingAction(2),
      createHeadingAction(3),
      createBulletListAction(),
      createOrderedListAction(),
      createCodeBlockAction(),
      createBlockquoteAction(),
      createHorizontalRuleAction(),
    ],
  },
  
  simple: {
    actions: [
      createHeadingAction(1),
      createHeadingAction(2),
      createBulletListAction(),
    ],
  },
  
  writing: {
    actions: [
      createHeadingAction(1),
      createHeadingAction(2),
      createHeadingAction(3),
      createBlockquoteAction(),
    ],
  },
};