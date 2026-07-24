/* eslint-disable @typescript-eslint/no-explicit-any -- Tiptap extension types require any; see plans/tech-debt-tracker.md */
import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { computePosition, flip, offset, shift, autoUpdate } from '@floating-ui/dom';
import type { VirtualElement } from '@floating-ui/dom';
import type { SuggestionProps } from '@tiptap/suggestion';
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { ReferencePicker } from './ReferencePicker';
import { ItemInteraction, ContentAdapterProvider } from '../item-view';
import type { ContentAdapter } from '../item-view';
import { referenceContentAdapter } from './ReferenceContentAdapter';
import { quoteAdapter, quoteToBaseItem } from '../item-view/adapters/QuoteAdapter';
import { productAdapter, productToItemObject } from '../item-view/adapters/ProductAdapter';
import type { ReferenceCategory, SelectedReference, ReferenceType } from './types';
import type { QuoteObject } from '../../services/commenting/core/quote-pointer';
import type { Product } from '@shared/data/types';
import { resolveReferenceData, products } from '@shared/data';

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
    } catch {
      if (!abortController.signal.aborted) {
        // Position update failed - floating UI will handle fallback
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
    const floatingElement = floatingRef.current;
    return () => {
      abortController.abort();
      if (floatingElement) {
        privateComponentData.delete(floatingElement);
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
      ...(this as any).parent?.(),
      HTMLAttributes: {
        class: 'reference-mention reference',
      },
      renderText({ node }: any) {
        return `${node.attrs.label ?? node.attrs.id}`;
      },
      renderHTML({ node }: any) {
        return `${node.attrs.label ?? node.attrs.id}`;
      },
    };
  },

  addCommands() {
    return {
      ...(this as any).parent?.(),

      // Convert selected text to quote reference
      convertSelectionToQuoteReference: (quoteData: { id: string; label: string; metadata?: Record<string, unknown> }) => ({ commands, state }: any) => {
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
      createQuoteReference: (attrs: { id: string; label: string; type: string; metadata?: Record<string, unknown> }) => ({ commands }: any) => {
        return commands.insertContent({
          type: 'reference',
          attrs
        });
      }
    };
  },

  addAttributes() {
    return {
      ...(this as any).parent?.(),
      type: {
        default: null,
        parseHTML: (element: any) => element.getAttribute('data-reference-type'),
        renderHTML: (attributes: any) => {
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
        parseHTML: (element: any) => {
          const metadata = element.getAttribute('data-metadata');
          return metadata ? structuredClone(JSON.parse(metadata)) : null;
        },
        renderHTML: (attributes: any) => {
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
    return ({ node, editor, getPos }: any) => {
      const wrapper = document.createElement('span');
      wrapper.contentEditable = 'false';

      // Helper function to update wrapper classes based on text selection
      const updateWrapperClasses = (isInTextSelection: boolean) => {
        const classes = ['reference-mention', 'reference'];

        // Add type-specific classes
        if (node.attrs.type === 'quote') {
          classes.push('reference-mention--quote');
        }

        // Add selected state class when in text selection
        if (isInTextSelection) {
          classes.push('reference-mention--selected');
        }

        wrapper.className = classes.join(' ');
      };

      // Check if reference is within text selection range
      const checkIfInSelection = () => {
        if (typeof getPos !== 'function') return false;

        const pos = getPos();
        const { from, to } = editor.state.selection;
        const nodeEnd = pos + node.nodeSize;

        // Check if the reference is within the selection range
        return (from <= pos && to >= nodeEnd) || (from > pos && from < nodeEnd) || (to > pos && to < nodeEnd);
      };

      // Initial setup
      updateWrapperClasses(checkIfInSelection());
      wrapper.setAttribute('data-reference-type', node.attrs.type ?? '');
      wrapper.setAttribute('data-reference-id', node.attrs.id ?? '');
      if (node.attrs.metadata) {
        wrapper.setAttribute('data-metadata', JSON.stringify(node.attrs.metadata));
      }

      // Listen to selection changes in the editor
      const handleSelectionUpdate = () => {
        const isInSelection = checkIfInSelection();
        updateWrapperClasses(isInSelection);
      };

      // Subscribe to editor updates
      editor.on('selectionUpdate', handleSelectionUpdate);

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

      // Entity-type routing: a reference to an entity whose type has a
      // dedicated item-view adapter escalates through that adapter — a product
      // mention opens the product's own ladder, a quote its quote view — so
      // the entity renders the same from a mention as from any other host.
      // Types without one (user, document, project…) fall back to the generic
      // reference views.
      const dedicated = ((): { adapter: ContentAdapter; contentType: string; item: unknown } | null => {
        if (!resolvedData) return null;
        try {
          switch (node.attrs.type) {
            case 'quote':
              return {
                adapter: quoteAdapter as ContentAdapter,
                contentType: 'quote',
                item: quoteToBaseItem(resolvedData as unknown as QuoteObject),
              };
            case 'product': {
              // Looked up raw rather than through `resolvedData`, which
              // flattens metadata for the picker; the adapter wants the record.
              const product = (products as unknown as Product[]).find(
                (candidate) => candidate.id === node.attrs.id
              );
              return product
                ? {
                    adapter: productAdapter as ContentAdapter,
                    contentType: 'product',
                    item: productToItemObject(product),
                  }
                : null;
            }
            default:
              return null;
          }
        } catch {
          // A malformed entity falls back to the generic reference views.
          return null;
        }
      })();

      const ReferenceComponent = () => (
        <ContentAdapterProvider adapters={[(dedicated?.adapter ?? referenceContentAdapter) as any]}>
          <ItemInteraction
            item={(dedicated?.item ?? referenceData) as any}
            contentType={dedicated?.contentType ?? 'reference'}
            enableEscalation={true}
          >
            {node.attrs.label ?? node.attrs.id}
          </ItemInteraction>
        </ContentAdapterProvider>
      );

      let renderer: ReactRenderer;

      // Defer ReactRenderer creation to avoid flushSync warnings
      setTimeout(() => {
        renderer = new ReactRenderer(ReferenceComponent, {
          editor,
        });
        wrapper.appendChild(renderer.element);
      }, 0);

      return {
        dom: wrapper,
        destroy() {
          editor.off('selectionUpdate', handleSelectionUpdate);
          if (renderer) {
            renderer.destroy();
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
            getBoundingClientRect: () => {
              const rect = props.clientRect ? props.clientRect() : null;
              return rect || { x: 0, y: 0, width: 0, height: 0, bottom: 0, top: 0, left: 0, right: 0 };
            },
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
            virtualElement.getBoundingClientRect = () => {
              const rect = props.clientRect ? props.clientRect() : null;
              return rect || { x: 0, y: 0, width: 0, height: 0, bottom: 0, top: 0, left: 0, right: 0 };
            };
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