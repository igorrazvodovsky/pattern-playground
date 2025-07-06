import { ReactRenderer } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { PpPopup } from '../../../components/popup/popup';
import { PpList } from '../../../components/list/list';
import { PpListItem } from '../../../components/list-item/list-item';
import rawMaterials from './mockMaterials.json' with { type: 'json' };

// Transform raw JSON data to include Date objects
const materials = rawMaterials.map(item => ({
  ...item,
  lastModified: new Date(item.lastModified)
}));

const filterMaterials = (query: string) => {
  if (!query) return materials.slice(0, 8);

  const lowerQuery = query.toLowerCase();

  return materials
    .map(material => {
      let score = 0;

      // Name matching (highest priority)
      if (material.name.toLowerCase().includes(lowerQuery)) {
        score += material.name.toLowerCase().startsWith(lowerQuery) ? 100 : 50;
      }

      // Type matching
      if (material.type.toLowerCase().includes(lowerQuery)) {
        score += 30;
      }

      // Description matching
      if (material.description?.toLowerCase().includes(lowerQuery)) {
        score += 20;
      }

      // Tags matching
      if (material.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        score += 15;
      }

      return { material, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ material }) => material)
    .slice(0, 8);
};

export const materialMentionSuggestion = {
  items: ({ query }: { query: string }) => filterMaterials(query),

  render: () => {
    let component: ReactRenderer;
    let popup: PpPopup;
    let list: PpList;
    let virtualElement: { getBoundingClientRect: () => DOMRect };
    let selectedIndex = 0;

    return {
      onStart: (props: { items: typeof materials; command: (attrs: { id: string; label: string; type: string; icon: string }) => void; clientRect?: (() => DOMRect | null) | null; editor: Editor }) => {
        // Create a virtual element for positioning based on the client rect
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
        popup.setAttribute('data-mention-type', 'material');
        popup.setAttribute('role', 'listbox');
        popup.setAttribute('aria-label', 'Material suggestions');

        // Create enhanced list with accessibility
        list = document.createElement('pp-list') as PpList;
        list.setAttribute('role', 'listbox');

        // Append list to popup
        popup.appendChild(list);

        // Append popup to body
        document.body.appendChild(popup);

        component = new ReactRenderer(
          ({ items, command }: { items: typeof materials, command: (attrs: { id: string; label: string; type: string; icon: string }) => void }) => {
            // Clear previous items
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
              listItem.className = 'material-mention-item';
              listItem.setAttribute('role', 'option');
              listItem.setAttribute('aria-selected', index === selectedIndex ? 'true' : 'false');

              // Enhanced content with description and metadata
              listItem.innerHTML = `
                <iconify-icon icon="${item.icon}" slot="prefix"></iconify-icon>
                <div class="material-mention-item__content">
                  <div class="material-mention-item__name">${item.name}</div>
                  ${item.description ? `<div class="material-mention-item__description">${item.description}</div>` : ''}
                  <div class="material-mention-item__meta">
                    <span class="material-mention-item__type">${item.type}</span>
                    ${item.lastModified ? `<span class="material-mention-item__date">${item.lastModified.toLocaleDateString()}</span>` : ''}
                  </div>
                </div>
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

              listItem.addEventListener('mouseenter', () => {
                selectedIndex = index;
                const items = list.children;
                for (let i = 0; i < items.length; i++) {
                  const item = items[i] as PpListItem;
                  item.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
                  item.classList.toggle('selected', i === selectedIndex);
                }
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

      onUpdate(props: { items: typeof materials; command: (attrs: { id: string; label: string; type: string; icon: string }) => void; clientRect?: (() => DOMRect | null) | null }) {
        component.updateProps({ items: props.items, command: props.command });

        if (props.clientRect) {
          virtualElement.getBoundingClientRect = () => props.clientRect?.() ?? new DOMRect();
          popup.reposition();
        }
      },

      // Helper function to update selection state
      updateSelection() {
        const items = list.children;
        for (let i = 0; i < items.length; i++) {
          const item = items[i] as PpListItem;
          item.setAttribute('aria-selected', i === selectedIndex ? 'true' : 'false');
          item.classList.toggle('selected', i === selectedIndex);
        }
      },

      onKeyDown(props: { event: KeyboardEvent }): boolean {
        const { event } = props;

        if (event.key === 'Escape') {
          popup.active = false;
          return true;
        }

        if (event.key === 'ArrowUp') {
          selectedIndex = Math.max(0, selectedIndex - 1);
          this.updateSelection();
          return true;
        }

        if (event.key === 'ArrowDown') {
          const items = list.children;
          selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
          this.updateSelection();
          return true;
        }

        if (event.key === 'Enter') {
          const selectedItem = list.children[selectedIndex] as PpListItem;
          if (selectedItem) {
            selectedItem.click();
            return true;
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
  },
};