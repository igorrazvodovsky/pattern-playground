import { BasePlugin } from '../core/Plugin';
import type { SlotRegistry, EventBus } from '../../editor/types';
import type { Extension } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import Highlight from '@tiptap/extension-highlight';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import FormattingToolbar from './components/FormattingToolbar';
import FormattingBubbleMenu from './components/FormattingBubbleMenu';

export interface FormattingPluginConfig {
  toolbar?: boolean;
  bubbleMenu?: boolean;
  headingLevels?: Array<1 | 2 | 3 | 4 | 5 | 6>;
}

export class FormattingPlugin extends BasePlugin {
  id = 'formatting';
  name = 'Formatting Plugin';
  version = '1.0.0';
  
  capabilities = {
    modifiesContent: true,
    providesUI: true,
  };

  private config: FormattingPluginConfig = {
    toolbar: true,
    bubbleMenu: true,
    headingLevels: [1, 2, 3],
  };

  configure(config: unknown): void {
    if (config && typeof config === 'object') {
      this.config = { ...this.config, ...config };
    }
  }

  getExtensions(): Extension[] {
    return [
      Bold,
      Italic,
      Strike,
      Highlight,
      Heading.configure({
        levels: this.config.headingLevels,
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
    ];
  }

  registerUI(slots: SlotRegistry): void {
    if (this.config.toolbar) {
      slots.register('toolbar', {
        pluginId: this.id,
        render: () => FormattingToolbar({ editor: this.context?.editor }),
      });
    }

    if (this.config.bubbleMenu) {
      slots.register('bubble-menu', {
        pluginId: this.id,
        render: () => FormattingBubbleMenu({ editor: this.context?.editor }),
        condition: () => {
          if (!this.context?.editor) return false;
          const { selection } = this.context.editor.state;
          return !selection.empty;
        },
      });
    }
  }

  subscribeToEvents(eventBus: EventBus): void {
    eventBus.on('command:execute', ({ command, params }) => {
      if (!this.context?.editor) return;

      switch (command) {
        case 'formatting:bold':
          this.context.editor.chain().focus().toggleBold().run();
          break;
        case 'formatting:italic':
          this.context.editor.chain().focus().toggleItalic().run();
          break;
        case 'formatting:strike':
          this.context.editor.chain().focus().toggleStrike().run();
          break;
        case 'formatting:highlight':
          this.context.editor.chain().focus().toggleHighlight().run();
          break;
        case 'formatting:heading':
          if (typeof params === 'object' && params && 'level' in params) {
            const level = (params as any).level;
            this.context.editor.chain().focus().toggleHeading({ level }).run();
          }
          break;
        case 'formatting:bullet-list':
          this.context.editor.chain().focus().toggleBulletList().run();
          break;
        case 'formatting:ordered-list':
          this.context.editor.chain().focus().toggleOrderedList().run();
          break;
        case 'formatting:blockquote':
          this.context.editor.chain().focus().toggleBlockquote().run();
          break;
      }
    });
  }
}

export function formattingPlugin(config?: FormattingPluginConfig): FormattingPlugin {
  const plugin = new FormattingPlugin();
  if (config) {
    plugin.configure(config);
  }
  return plugin;
}