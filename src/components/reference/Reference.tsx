import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { computePosition, flip, offset, shift, autoUpdate } from '@floating-ui/dom';
import type { VirtualElement } from '@floating-ui/dom';
import type { SuggestionProps } from '@tiptap/suggestion';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ReferencePicker } from './ReferencePicker';
import '../item-view'; // Import Web Components
import './reference-adapter'; // Import reference adapter
import type { ReferenceCategory, SelectedReference, ReferenceType } from './types';

const privateComponentData = new WeakMap<HTMLDivElement, {
  abortController: AbortController;
  virtualElement: VirtualElement | null;
}>();

interface ReferencePickerPopupProps {
  data: ReferenceCategory[];
  open: boolean;
  anchor: VirtualElement | null;
  query: string;
  onSelect: (reference: SelectedReference) => void;
  onClose: () => void;
  onQueryUpdate?: (query: string) => void;
  placement?: 'bottom-start' | 'top-start' | 'bottom' | 'top';
}

const ReferencePickerPopup: React.FC<ReferencePickerPopupProps> = ({
  data,
  open,
  anchor,
  query,
  onSelect,
  onClose,
  placement = 'bottom-start'
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const isSingleCategory = data.length === 1;
  const [mode, setMode] = useState<'global' | 'contextual'>(isSingleCategory ? 'contextual' : 'global');
  const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory | null>(
    isSingleCategory ? data.at(0) ?? null : null
  );

  const floatingRef = useRef<HTMLDivElement>(null);

  const abortController = useMemo(() => new AbortController(), []);

  const updatePosition = useCallback(async () => {
    if (!anchor || !floatingRef.current || abortController.signal.aborted) return;

    try {
      const { x, y } = await computePosition(anchor, floatingRef.current, {
        placement,
        middleware: [
          offset(8), // 8px gap from anchor
          flip(), // Flip to opposite side if no space
          shift({ padding: 8 }), // Shift within viewport with padding
        ],
      });

      if (!abortController.signal.aborted) {
        setPosition({ x, y });
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        console.warn('Position update failed:', error);
      }
    }
  }, [anchor, placement, abortController.signal]);

  useEffect(() => {
    if (!open || !anchor || !floatingRef.current) {
      return;
    }

    if (floatingRef.current) {
      privateComponentData.set(floatingRef.current, {
        abortController,
        virtualElement: anchor
      });
    }

    updatePosition();
    const cleanup = autoUpdate(
      anchor,
      floatingRef.current,
      updatePosition
    );

    return () => {
      cleanup();
      abortController.abort();
    };
  }, [open, anchor, updatePosition, abortController]);

  const handleCategorySelect = useCallback((category: ReferenceCategory) => {
    setSelectedCategory(category);
    setMode('contextual');
  }, []);

  const handleBack = useCallback(() => {
    if (!isSingleCategory) {
      setSelectedCategory(null);
      setMode('global');
    }
  }, [isSingleCategory]);

  useEffect(() => {
    return () => {
      abortController.abort();
      if (floatingRef.current) {
        privateComponentData.delete(floatingRef.current);
      }
    };
  }, [abortController]);

  if (!open || !anchor) {
    return null;
  }

  return createPortal(
    <div
      ref={floatingRef}
      className="reference-picker-popup"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <ReferencePicker
        data={data}
        query={query}
        onSelect={onSelect}
        onClose={onClose}
        open={open}
        mode={mode}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onBack={handleBack}
      />
    </div>,
    document.body
  );
};

export const Reference = Mention.extend({
  name: 'reference',

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'reference-mention reference',
      },
      renderText({ node }) {
        return `${node.attrs.label ?? node.attrs.id}`;
      },
      renderHTML({ node }) {
        return `${node.attrs.label ?? node.attrs.id}`;
      },
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: null,
        parseHTML: element => element.getAttribute('data-reference-type'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {};
          }
          return {
            'data-reference-type': attributes.type,
          };
        },
      },
      metadata: {
        default: null,
        parseHTML: element => {
          const metadata = element.getAttribute('data-metadata');
          return metadata ? structuredClone(JSON.parse(metadata)) : null;
        },
        renderHTML: attributes => {
          if (!attributes.metadata) {
            return {};
          }
          return {
            'data-metadata': JSON.stringify(attributes.metadata),
          };
        },
      },
    };
  },

  addNodeView() {
    return ({ node, editor }) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'reference-mention reference';
      wrapper.setAttribute('data-reference-type', node.attrs.type ?? '');
      if (node.attrs.metadata) {
        wrapper.setAttribute('data-metadata', JSON.stringify(node.attrs.metadata));
      }

      const referenceData: SelectedReference = {
        id: node.attrs.id,
        label: node.attrs.label,
        type: node.attrs.type as ReferenceType,
        metadata: node.attrs.metadata ? structuredClone(node.attrs.metadata) : undefined,
      };

      // Create Web Component instead of React component
      const itemInteraction = document.createElement('pp-item-interaction');
      itemInteraction.setAttribute('content-type', 'reference');
      itemInteraction.setAttribute('enable-escalation', 'true');
      itemInteraction.setAttribute('item-data', JSON.stringify(referenceData));
      
      const contentSpan = document.createElement('span');
      contentSpan.className = 'reference-mention__content';
      contentSpan.textContent = node.attrs.label ?? node.attrs.id;
      itemInteraction.appendChild(contentSpan);

      wrapper.appendChild(itemInteraction);

      return {
        dom: wrapper,
        destroy() {
          // Clean up Web Component if needed
          if (wrapper.contains(itemInteraction)) {
            wrapper.removeChild(itemInteraction);
          }
        },
      };
    };
  },
});

interface ReferenceCommandAttrs {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

export function createReferenceSuggestion(
  data: ReferenceCategory[],
  onReferenceSelect?: (reference: SelectedReference) => void
) {
  return {
    items: () => {
      return [];
    },
    render: () => {
      let component: ReactRenderer;
      let virtualElement: VirtualElement | null = null;

      return {
        onStart: (props: SuggestionProps<unknown, ReferenceCommandAttrs>) => {
          virtualElement = {
            getBoundingClientRect: props.clientRect || (() => new DOMRect(0, 0, 0, 0)),
          };

          component = new ReactRenderer(ReferencePickerPopup, {
            props: {
              data,
              open: true,
              anchor: virtualElement,
              query: props.query,
              onSelect: (reference: SelectedReference) => {
                onReferenceSelect?.(reference);
                props.command({
                  id: reference.id,
                  label: reference.label,
                  type: reference.type,
                  metadata: reference.metadata,
                });
              },
              onClose: () => {
                // Close handled by suggestion plugin
              },
              placement: 'bottom-start',
            },
            editor: props.editor,
          });
        },

        onUpdate: (props: SuggestionProps<unknown, ReferenceCommandAttrs>) => {
          if (virtualElement) {
            virtualElement.getBoundingClientRect = props.clientRect || (() => new DOMRect(0, 0, 0, 0));
          }

          component.updateProps({
            data,
            anchor: virtualElement,
            query: props.query, // Pass the current query from TipTap
            onSelect: (reference: SelectedReference) => {
              onReferenceSelect?.(reference);
              props.command({
                id: reference.id,
                label: reference.label,
                type: reference.type,
                metadata: reference.metadata,
              });
            },
          });
        },

        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === 'Escape') {
            component.destroy();
            return true;
          }
          return false;
        },

        onExit: () => {
          component.destroy();
        },
      };
    },
  };
}