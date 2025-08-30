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
import { quoteAdapter, quoteToBaseItem } from '../item-view/adapters/QuoteAdapter';
import type { ReferenceCategory, SelectedReference, ReferenceType } from './types';
import type { QuoteObject } from '../../services/commenting/core/quote-pointer';
import { resolveReferenceData } from '../../stories/data';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    reference: {
      /**
       * Convert selected text to quote reference
       */
      convertSelectionToQuoteReference: (quoteData: {
        id: string;
        label: string;
        metadata?: Record<string, unknown>
      }) => ReturnType;

      /**
       * Create quote reference at current position
       */
      createQuoteReference: (attrs: {
        id: string;
        label: string;
        type: string;
        metadata?: Record<string, unknown>
      }) => ReturnType;
    };
  }
}

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

  addCommands() {
    return {
      ...this.parent?.(),

      // Convert selected text to quote reference
      convertSelectionToQuoteReference: (quoteData: { id: string; label: string; metadata?: Record<string, unknown> }) => ({ commands, state }) => {
        const { from, to } = state.selection;
        if (from === to) return false;

        return commands.insertContentAt(
          { from, to },
          {
            type: 'reference',
            attrs: {
              id: quoteData.id,
              label: quoteData.label,
              type: 'quote',
              metadata: quoteData.metadata
            }
          }
        );
      },

      // Create quote reference at current position
      createQuoteReference: (attrs: { id: string; label: string; type: string; metadata?: Record<string, unknown> }) => ({ commands }) => {
        return commands.insertContent({
          type: 'reference',
          attrs
        });
      }
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
      const classes = ['reference-mention', 'reference'];

      // Add type-specific classes
      if (node.attrs.type === 'quote') {
        classes.push('reference-mention--quote');
      }

      wrapper.className = classes.join(' ');
      wrapper.setAttribute('data-reference-type', node.attrs.type ?? '');
      wrapper.setAttribute('data-reference-id', node.attrs.id ?? '');
      if (node.attrs.metadata) {
        wrapper.setAttribute('data-metadata', JSON.stringify(node.attrs.metadata));
      }

      // Try to resolve full reference data dynamically
      const resolvedData = resolveReferenceData(node.attrs.id, node.attrs.type);
      
      const referenceData: SelectedReference = resolvedData ? {
        id: resolvedData.id,
        label: resolvedData.name,
        type: resolvedData.type as ReferenceType,
        metadata: resolvedData.metadata,
      } : {
        // Fallback to node attributes if resolution fails
        id: node.attrs.id,
        label: node.attrs.label,
        type: node.attrs.type as ReferenceType,
        metadata: node.attrs.metadata ? structuredClone(node.attrs.metadata) : undefined,
      };

      // For quote references, use the quote adapter with the quote object
      if (node.attrs.type === 'quote' && resolvedData) {
        console.log('Reference.tsx - Creating quote reference component for:', {
          id: node.attrs.id,
          type: node.attrs.type,
          label: node.attrs.label,
          resolvedData
        });
        try {
          const quoteData = resolvedData as unknown as QuoteObject;
          const quoteItem = quoteToBaseItem(quoteData);
          console.log('Reference.tsx - Created quoteItem:', quoteItem);
          const ReferenceComponent = () => (
            <ContentAdapterProvider adapters={[quoteAdapter]}>
              <ItemInteraction
                item={quoteItem}
                contentType="quote"
                enableEscalation={true}
              >
                {node.attrs.label ?? node.attrs.id}
              </ItemInteraction>
            </ContentAdapterProvider>
          );

          const renderer = new ReactRenderer(ReferenceComponent, {
            editor,
          });

          wrapper.appendChild(renderer.element);

          return {
            dom: wrapper,
            destroy() {
              renderer.destroy();
            },
          };
        } catch (error) {
          console.error('Error creating quote reference component:', error);
          // Fall through to regular reference handling
        }
      }

      // For non-quote references, use the standard reference adapter
      const ReferenceComponent = () => (
        <ContentAdapterProvider adapters={[referenceContentAdapter]}>
          <ItemInteraction
            item={referenceData}
            contentType="reference"
            enableEscalation={true}
          >
              {node.attrs.label ?? node.attrs.id}

          </ItemInteraction>
        </ContentAdapterProvider>
      );

      const renderer = new ReactRenderer(ReferenceComponent, {
        editor,
      });

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