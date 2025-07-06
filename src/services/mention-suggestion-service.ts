import { ReactRenderer } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { PpPopup } from '../components/popup/popup';
import { PpList } from '../components/list/list';
import { PpListItem } from '../components/list-item/list-item';

export interface MentionItem {
  id: string;
  name: string;
  [key: string]: any;
}

export interface MentionSuggestionConfig<T extends MentionItem> {
  items: ({ query }: { query: string }) => T[];
  renderItem: (item: T, listItem: PpListItem) => void;
  onCommand: (item: T) => { id: string; label: string; [key: string]: any };
  mentionType?: string;
  ariaLabel?: string;
  enableKeyboardNavigation?: boolean;
}

export function createMentionSuggestion<T extends MentionItem>(config: MentionSuggestionConfig<T>) {
  return {
    items: config.items,

    render: () => {
      let component: ReactRenderer;
      let popup: PpPopup;
      let list: PpList;
      let virtualElement: { getBoundingClientRect: () => DOMRect };
      let selectedIndex = 0;

      return {
        onStart: (props: { items: T[]; command: (attrs: any) => void; clientRect?: (() => DOMRect | null) | null; editor: Editor }) => {
          virtualElement = {
            getBoundingClientRect: () => props.clientRect?.() ?? new DOMRect()
          };

          popup = document.createElement('pp-popup') as PpPopup;
          popup.placement = 'bottom-start';
          popup.strategy = 'fixed';
          popup.flip = true;
          popup.shift = true;
          popup.distance = 8;
          popup.anchor = virtualElement;
          popup.setAttribute('data-mention', 'true');
          
          if (config.mentionType) {
            popup.setAttribute('data-mention-type', config.mentionType);
          }
          
          if (config.enableKeyboardNavigation) {
            popup.setAttribute('role', 'listbox');
            popup.setAttribute('aria-label', config.ariaLabel || 'Mention suggestions');
          }

          list = document.createElement('pp-list') as PpList;
          if (config.enableKeyboardNavigation) {
            list.setAttribute('role', 'listbox');
          }

          popup.appendChild(list);
          document.body.appendChild(popup);

          component = new ReactRenderer(
            ({ items, command }: { items: T[], command: (attrs: any) => void }) => {
              while (list.firstChild) {
                list.removeChild(list.firstChild);
              }

              if (!items || items.length === 0) {
                popup.active = false;
                return null;
              }

              items.forEach((item, index) => {
                const listItem = document.createElement('pp-list-item') as PpListItem;
                listItem.value = item.id;
                
                if (config.enableKeyboardNavigation) {
                  listItem.setAttribute('role', 'option');
                  listItem.setAttribute('aria-selected', index === selectedIndex ? 'true' : 'false');
                }

                config.renderItem(item, listItem);

                listItem.addEventListener('click', () => {
                  command(config.onCommand(item));
                  popup.active = false;
                });

                if (config.enableKeyboardNavigation) {
                  listItem.addEventListener('mouseenter', () => {
                    selectedIndex = index;
                    updateSelection();
                  });
                }

                list.appendChild(listItem);
              });

              if (items.length > 0) {
                popup.active = true;
              }
              return null;
            },
            {
              editor: props.editor,
              props: {},
            }
          );

          component.updateProps({ items: props.items, command: props.command });
        },

        onUpdate(props: { items: T[]; command: (attrs: any) => void; clientRect?: (() => DOMRect | null) | null }) {
          component.updateProps({ items: props.items, command: props.command });

          if (props.clientRect) {
            virtualElement.getBoundingClientRect = () => props.clientRect?.() ?? new DOMRect();
            popup.reposition();
          }
        },

        onKeyDown(props: { event: KeyboardEvent }): boolean {
          const { event } = props;

          if (event.key === 'Escape') {
            popup.active = false;
            return true;
          }

          if (config.enableKeyboardNavigation) {
            if (event.key === 'ArrowUp') {
              selectedIndex = Math.max(0, selectedIndex - 1);
              updateSelection();
              return true;
            }

            if (event.key === 'ArrowDown') {
              const items = list.children;
              selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
              updateSelection();
              return true;
            }

            if (event.key === 'Enter') {
              const selectedItem = list.children[selectedIndex] as PpListItem;
              if (selectedItem) {
                selectedItem.click();
                return true;
              }
            }
          }

          return false;
        },

        onExit() {
          popup.active = false;
          component?.destroy();

          if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
          }
        },
      };

      function updateSelection() {
        const items = list.children;
        for (let i = 0; i < items.length; i++) {
          const item = items[i] as PpListItem;
          item.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
          item.classList.toggle('selected', i === selectedIndex);
        }
      }
    },
  };
}