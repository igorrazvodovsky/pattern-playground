import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { computePosition, flip, offset, shift, autoUpdate } from '@floating-ui/dom';
import type { VirtualElement } from '@floating-ui/dom';
import type { SuggestionProps } from '@tiptap/suggestion';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ReferencePicker } from './ReferencePicker';
import { ItemInteraction, ContentAdapterProvider } from '../item-view';
import { referenceContentAdapter } from './ReferenceContentAdapter';
import type { ReferenceCategory, SelectedReference, ReferenceType } from './types';

// WeakMap for private component data storage
const privateComponentData = new WeakMap<HTMLDivElement, {
  abortController: AbortController;
  virtualElement: VirtualElement | null;
}>();

// Reference Picker Popup Component
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
  
  // Auto-detect single category mode with modern array methods
  const isSingleCategory = data.length === 1;
  const [mode, setMode] = useState<'global' | 'contextual'>(isSingleCategory ? 'contextual' : 'global');
  const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory | null>(
    isSingleCategory ? data.at(0) ?? null : null
  );
  
  const floatingRef = useRef<HTMLDivElement>(null);

  // Modern AbortController for cleanup
  const abortController = useMemo(() => new AbortController(), []);

  // Update position using floating-ui with AbortController signal
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

  // Set up floating-ui auto-update with AbortController
  useEffect(() => {
    if (!open || !anchor || !floatingRef.current) {
      return;
    }

    // Store private data in WeakMap
    if (floatingRef.current) {
      privateComponentData.set(floatingRef.current, {
        abortController,
        virtualElement: anchor
      });
    }

    // Initial position
    updatePosition();

    // Auto-update position when anchor or floating element changes
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

  // Handle category selection
  const handleCategorySelect = useCallback((category: ReferenceCategory) => {
    setSelectedCategory(category);
    setMode('contextual');
  }, []);

  // Handle back to global mode
  const handleBack = useCallback(() => {
    if (!isSingleCategory) {
      setSelectedCategory(null);
      setMode('global');
    }
  }, [isSingleCategory]);

  // Cleanup on unmount with AbortController
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
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 'var(--layer-dropdown)',
        minWidth: '320px',
        maxWidth: '480px',
        maxHeight: '400px',
        boxShadow: 'var(--shadow-m)',
        borderRadius: 'var(--radius-m)',
        overflow: 'hidden',
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

/**
 * TipTap Reference Extension
 * Provides inline search with floating-ui positioning and item view integration
 */
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
      // Create wrapper element with modern DOM methods
      const wrapper = document.createElement('span');
      wrapper.className = 'reference-mention reference';
      wrapper.setAttribute('data-reference-type', node.attrs.type ?? '');
      if (node.attrs.metadata) {
        wrapper.setAttribute('data-metadata', JSON.stringify(node.attrs.metadata));
      }

      // Create reference data for item view with structured clone
      const referenceData: SelectedReference = {
        id: node.attrs.id,
        label: node.attrs.label,
        type: node.attrs.type as ReferenceType,
        metadata: node.attrs.metadata ? structuredClone(node.attrs.metadata) : undefined,
      };

      // Create React component with item view integration
      const ReferenceComponent = () => (
        <ContentAdapterProvider adapters={[referenceContentAdapter]}>
          <ItemInteraction 
            item={referenceData}
            contentType="reference"
            enableEscalation={true}
          >
            <span className="reference-mention__content">
              {node.attrs.label ?? node.attrs.id}
            </span>
          </ItemInteraction>
        </ContentAdapterProvider>
      );

      // Render React component into wrapper
      const renderer = new ReactRenderer(ReferenceComponent, {
        editor,
      });

      // Append the React component to our wrapper
      wrapper.appendChild(renderer.element);

      return {
        dom: wrapper,
        destroy() {
          renderer.destroy();
        },
      };
    };
  },
});

// Type for TipTap command function
interface ReferenceCommandAttrs {
  id: string;
  label: string;
  type: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create reference suggestion configuration for TipTap
 */
export function createReferenceSuggestion(
  data: ReferenceCategory[],
  onReferenceSelect?: (reference: SelectedReference) => void
) {
  return {
    items: () => {
      // Return empty array since filtering happens in our picker
      return [];
    },
    render: () => {
      let component: ReactRenderer;
      let virtualElement: VirtualElement | null = null;

      return {
        onStart: (props: SuggestionProps<unknown, ReferenceCommandAttrs>) => {
          // Create virtual element for floating-ui positioning
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
            // Update virtual element bounds
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