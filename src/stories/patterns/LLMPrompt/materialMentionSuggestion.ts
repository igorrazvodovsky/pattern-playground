import { ReactRenderer } from '@tiptap/react';
import { PpPopup } from '../../../components/popup/popup';
import { PpList } from '../../../components/list/list';
import { PpListItem } from '../../../components/list-item/list-item';

// Mock data for reference materials
const materials = [
  { id: 'doc-1', name: 'Project Requirements', type: 'document', icon: 'ph:file-text' },
  { id: 'doc-2', name: 'API Documentation', type: 'document', icon: 'ph:file-text' },
  { id: 'doc-3', name: 'Design System Guide', type: 'document', icon: 'ph:file-text' },
  { id: 'img-1', name: 'Wireframe v2.png', type: 'image', icon: 'ph:image' },
  { id: 'img-2', name: 'User Flow Diagram', type: 'image', icon: 'ph:image' },
  { id: 'code-1', name: 'UserService.ts', type: 'code', icon: 'ph:code' },
  { id: 'code-2', name: 'auth.config.js', type: 'code', icon: 'ph:code' },
  { id: 'url-1', name: 'Competitor Analysis', type: 'url', icon: 'ph:link' },
  { id: 'url-2', name: 'Style Guide Reference', type: 'url', icon: 'ph:link' },
  { id: 'chat-1', name: 'Previous conversation about login', type: 'conversation', icon: 'ph:chat-circle' },
  { id: 'data-1', name: 'User Analytics Q4', type: 'data', icon: 'ph:chart-bar' },
  { id: 'data-2', name: 'Performance Metrics', type: 'data', icon: 'ph:chart-bar' },
];

export const materialMentionSuggestion = {
  items: ({ query }: { query: string }) => {
    return materials.filter(material =>
      material.name.toLowerCase().includes(query.toLowerCase()) ||
      material.type.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  },

  render: () => {
    let component: ReactRenderer<unknown, any>;
    let popup: PpPopup;
    let list: PpList;
    let virtualElement: { getBoundingClientRect: () => DOMRect };

    return {
      onStart: (props: any) => {
        // Create a virtual element for positioning based on the client rect
        virtualElement = {
          getBoundingClientRect: () => props.clientRect?.() ?? new DOMRect()
        };

        // Create a pp-popup element
        popup = document.createElement('pp-popup') as PpPopup;
        popup.placement = 'bottom-start';
        popup.strategy = 'fixed';
        popup.flip = true;
        popup.shift = true;
        popup.distance = 8;
        popup.anchor = virtualElement;
        popup.setAttribute('data-mention', 'true');
        popup.setAttribute('data-mention-type', 'material');

        // Create a pp-list element
        list = document.createElement('pp-list') as PpList;

        // Append list to popup
        popup.appendChild(list);

        // Append popup to body
        document.body.appendChild(popup);

        component = new ReactRenderer(
          ({ items, command }: { items: typeof materials, command: (attrs: any) => void }) => {
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

              // Add content directly to the list item root
              listItem.className = 'material-mention-item';
              listItem.innerHTML = `
                <iconify-icon icon="${item.icon}" slot="prefix"></iconify-icon>
                <div class="material-mention-item__name">${item.name}</div>
              `;
              listItem.addEventListener('click', () => {
                command({
                  id: item.id,
                  label: item.name,
                  type: item.type,
                  icon: item.icon
                });
                popup.active = false;
              });
              list.appendChild(listItem);
            });

            // Show the popup after items are populated
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

      onUpdate(props: { items: typeof materials; command: (attrs: { id: string; label: string; type: string; icon: string }) => void; clientRect?: (() => DOMRect) | null }) {
        component.updateProps({ items: props.items, command: props.command });

        if (props.clientRect) {
          virtualElement.getBoundingClientRect = () => props.clientRect?.() ?? new DOMRect();
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

        if (popup && popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
      },
    };
  },
};