import { Extension } from '@tiptap/core';
import { Placeholder } from '@tiptap/extensions';
import type { Extensions } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import Suggestion from '@tiptap/suggestion';
import type { SuggestionProps } from '@tiptap/suggestion';
import type { VirtualElement } from '../../popup/popup';
import { BasePlugin } from '../core/Plugin';
import { SlashMenu, type SlashMenuHandle, type SlashMenuProps } from './SlashMenu';
import type { SlashCommand } from './types';

export interface SlashCommandsPluginConfig {
  commands?: SlashCommand[];
  /**
   * Shown in the empty block at the caret; `false` leaves placeholders to the
   * host editor. A host that already has a Placeholder keeps its own:
   * usePluginEditor skips this one by name.
   */
  hint?: string | false;
}

export const defaultSlashCommands: SlashCommand[] = [
  {
    id: 'text',
    label: 'Text',
    icon: 'ik:doc-text',
    keywords: ['paragraph'],
    run: (editor, range) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    id: 'heading',
    label: 'Heading',
    icon: 'ik:text-format',
    keywords: ['title', 'h2'],
    run: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run(),
  },
  {
    id: 'bullet-list',
    label: 'Bulleted list',
    icon: 'ik:list',
    keywords: ['unordered'],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    id: 'ordered-list',
    label: 'Numbered list',
    icon: 'ik:view-list',
    keywords: ['ordered'],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    id: 'quote',
    label: 'Quote',
    icon: 'ik:quotation-marks',
    keywords: ['blockquote'],
    run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
];

const matches = (command: SlashCommand, query: string) => {
  const q = query.toLowerCase();
  return [command.label, ...(command.keywords ?? [])].some((word) =>
    word.toLowerCase().includes(q),
  );
};

type Props = SuggestionProps<SlashCommand, SlashCommand>;

const menuProps = (props: Props, anchor: VirtualElement): SlashMenuProps => {
  // One anchor for the menu's life, so the popup keeps it and only re-reads
  // the caret's position; a new object each update would re-anchor it.
  anchor.getBoundingClientRect = () => props.clientRect?.() ?? new DOMRect();
  return { items: props.items, anchor, onSelect: (item) => props.command(item) };
};

/** Typing a slash at the caret opens a menu of commands, filtered by what follows it. */
export class SlashCommandsPlugin extends BasePlugin {
  id = 'slash-commands';
  name = 'Slash Commands Plugin';
  version = '1.0.0';

  capabilities = {
    modifiesContent: true,
    providesUI: true,
  };

  private commands: SlashCommand[] = defaultSlashCommands;
  private hint: string | false = 'Type / for blocks';

  configure(config: unknown): void {
    if (config && typeof config === 'object') {
      const { commands, hint } = config as SlashCommandsPluginConfig;
      this.commands = commands ?? this.commands;
      this.hint = hint ?? this.hint;
    }
  }

  getExtensions(): Extensions {
    const { commands, hint } = this;
    // The hint names the empty block at the caret, so a block made from the
    // menu shows what it is before anything is typed in it.
    const placeholder = hint
      ? [
          Placeholder.configure({
            includeChildren: true,
            placeholder: ({ node }) => (node.type.name === 'heading' ? 'Heading' : hint),
          }),
        ]
      : [];
    return [
      ...placeholder,
      Extension.create({
        name: 'slashCommands',
        addProseMirrorPlugins() {
          return [
            Suggestion<SlashCommand, SlashCommand>({
              editor: this.editor,
              pluginKey: new PluginKey('slashCommands'),
              char: '/',
              // Only on a line holding nothing but the slash and its query:
              // the commands change the type of the whole block.
              allow: ({ state, range }) =>
                state.doc.resolve(range.from).parent.textContent ===
                state.doc.textBetween(range.from, range.to),
              items: ({ query }) => commands.filter((command) => matches(command, query)),
              command: ({ editor, range, props }) => props.run(editor, range),
              render: () => {
                let renderer: ReactRenderer<SlashMenuHandle, SlashMenuProps> | null = null;
                const anchor: VirtualElement = { getBoundingClientRect: () => new DOMRect() };
                return {
                  onStart: (props) => {
                    renderer = new ReactRenderer(SlashMenu, {
                      props: menuProps(props, anchor),
                      editor: props.editor,
                    });
                  },
                  onUpdate: (props) => renderer?.updateProps(menuProps(props, anchor)),
                  // Escape is Suggestion's own: it exits, and onExit tears down.
                  onKeyDown: ({ event }) => renderer?.ref?.onKeyDown(event) ?? false,
                  onExit: () => {
                    renderer?.destroy();
                    renderer = null;
                  },
                };
              },
            }),
          ];
        },
      }),
    ];
  }
}

export function slashCommandsPlugin(config?: SlashCommandsPluginConfig): SlashCommandsPlugin {
  const plugin = new SlashCommandsPlugin();
  if (config) {
    plugin.configure(config);
  }
  return plugin;
}
