import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { PpDropdown } from '../../../components/dropdown/dropdown';
import { PpList } from '../../../components/list/list';
import { PpListItem } from '../../../components/list-item/list-item';

// Mock data for users
const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' },
  { id: '4', name: 'David' },
  { id: '5', name: 'Eve' },
];

export const mentionSuggestion = {
  items: ({ query }: { query: string }) => {
    return users.filter(user => user.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
  },

  render: () => {
    let component: ReactRenderer<unknown, any>;
    let popup: any; // tippy instance

    return {
      onStart: (props: any) => {
        // Create a pp-dropdown element
        const dropdown = document.createElement('pp-dropdown') as PpDropdown & { viewMode: string, show: () => void, hide: () => void, setContent: (content: HTMLElement) => void };
        dropdown.placement = 'bottom-start';
        dropdown.stayOpenOnSelect = true; // Keep it open to allow further interaction if needed

        // Create a pp-list element
        const list = document.createElement('pp-list') as PpList;

        // Append list to dropdown
        dropdown.appendChild(list);
        document.body.appendChild(dropdown); // Append to body to ensure it's on top

        component = new ReactRenderer(
          ({ items, command }: { items: {id: string, name: string}[], command: (attrs: any) => void }) => {
            // Clear previous items
            while (list.firstChild) {
              list.removeChild(list.firstChild);
            }

            if (!items || items.length === 0) {
              dropdown.hide(); // Hide dropdown if no items
              return null;
            }

            items.forEach(item => {
              const listItem = document.createElement('pp-list-item') as PpListItem & { value: string, textContent: string, addEventListener: (event: string, callback: () => void) => void };
              listItem.value = item.id;
              listItem.textContent = item.name;
              listItem.addEventListener('click', () => {
                command({ id: item.id, label: item.name });
                dropdown.hide();
              });
              list.appendChild(listItem);
            });

            // Ensure the dropdown is shown after items are populated
            if (items.length > 0 && !dropdown.open) {
                 dropdown.show();
            }
            return null; // No direct React rendering needed here, we manage DOM manually
          },
          {
            editor: props.editor,
            props: {}, // initial props
          }
        );

        component.updateProps({ items: props.items, command: props.command });


        if (!props.clientRect) {
          return;
        }

        popup = tippy(document.body, { // Attach tippy to a dummy element
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: dropdown,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
          arrow: false,
        });

        // Ensure tippy positions the dropdown correctly
         if (popup && popup.length > 0) {
           popup[0].show();
         } else if (popup) {
           popup.show();
         }
      },

      onUpdate(props: any) {
        component.updateProps({ items: props.items, command: props.command });

        if (!props.clientRect) {
          return;
        }

        popup.setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup.hide();
          return true;
        }
        // @ts-ignore
        return component.ref?.onKeyDown(props);
      },

      onExit() {
        if (popup && popup.length > 0) {
          popup[0].destroy();
        } else if (popup) {
          popup.destroy();
        }
        if (component) {
           component.destroy();
        }
        // Clean up the dropdown from the DOM
        const dropdownInstance = document.querySelector('pp-dropdown');
        if (dropdownInstance) {
            dropdownInstance.remove();
        }
      },
    };
  },
};
