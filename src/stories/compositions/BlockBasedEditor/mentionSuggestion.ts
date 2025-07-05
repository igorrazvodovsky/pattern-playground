import { ReactRenderer } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { PpPopup } from '../../../components/popup/popup';
import { PpList } from '../../../components/list/list';
import { PpListItem } from '../../../components/list-item/list-item';
import users from './mockUsers.json' with { type: 'json' };

export const mentionSuggestion = {
  items: ({ query }: { query: string }) => {
    return users.filter(user => user.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer;
    let popup: PpPopup;
    let list: PpList;
    let virtualElement: { getBoundingClientRect: () => DOMRect };

    return {
      onStart: (props: { items: { id: string, name: string }[]; command: (attrs: { id: string; label: string }) => void; clientRect?: (() => DOMRect | null) | null; editor: Editor }) => {
        // Create a virtual element for positioning based on the client rect
        virtualElement = {
          getBoundingClientRect: () => props.clientRect?.() || new DOMRect()
        };

        // Create a pp-popup element
        popup = document.createElement('pp-popup') as PpPopup;
        popup.placement = 'bottom-start';
        popup.strategy = 'fixed';
        popup.flip = true;
        popup.shift = true;
        popup.distance = 8;
        popup.anchor = virtualElement;
        popup.setAttribute('data-mention', 'true'); // Add data attribute for styling

        // Create a pp-list element
        list = document.createElement('pp-list') as PpList;

        // Append list to popup
        popup.appendChild(list);

        // Append popup to body
        document.body.appendChild(popup);

        component = new ReactRenderer(
          ({ items, command }: { items: { id: string, name: string }[], command: (attrs: { id: string; label: string }) => void }) => {
            // Clear previous items
            while (list.firstChild) {
              list.removeChild(list.firstChild);
            }

            if (!items || items.length === 0) {
              popup.active = false;
              return null;
            }

            items.forEach(item => {
              const listItem = document.createElement('pp-list-item') as PpListItem;
              listItem.value = item.id;
              listItem.textContent = item.name;
              listItem.addEventListener('click', () => {
                command({ id: item.id, label: item.name });
                popup.active = false;
              });
              list.appendChild(listItem);
            });

            // Show the popup after items are populated
            if (items.length > 0) {
              popup.active = true;
            }
            return null; // No direct React rendering needed here, we manage DOM manually
          },
          {
            editor: props.editor,
            props: {}, // initial props
          }
        );

        component.updateProps({ items: props.items, command: props.command });
      },

      onUpdate(props: { items: { id: string, name: string }[]; command: (attrs: { id: string; label: string }) => void; clientRect?: (() => DOMRect | null) | null }) {
        component.updateProps({ items: props.items, command: props.command });

        if (props.clientRect) {
          virtualElement.getBoundingClientRect = () => props.clientRect?.() || new DOMRect();
          popup.reposition();
        }
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        if (props.event.key === 'Escape') {
          popup.active = false;
          return true;
        }
        // @ts-expect-error - component.ref type is not properly typed
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup.active = false;
        component?.destroy();

        // Clean up the popup from the DOM
        if (popup && popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      },
    };
  },
};
