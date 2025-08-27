import React from 'react';
import { BasePlugin } from '../core/Plugin';
import type { PluginCapabilities, EditorContext } from '../../editor/types';
import { Reference, createReferenceSuggestion } from '../../reference';
import type { ReferenceCategory, SelectedReference } from '../../reference/types';
import { ReferencesBubbleMenu } from './components/ReferencesBubbleMenu';
import { ReferencesToolbar } from './components/ReferencesToolbar';
import type { Extension } from '@tiptap/core';

export interface ReferencesPluginOptions {
  data: ReferenceCategory[];
  onReferenceSelect?: (reference: SelectedReference) => void;
  enableQuoteReferences?: boolean;
  enableAtMentions?: boolean;
}

export class ReferencesPlugin extends BasePlugin {
  public readonly id = 'references';
  public readonly name = 'References Plugin';
  public readonly version = '1.0.0';
  public readonly capabilities: PluginCapabilities = {
    requiresSelection: false,
    modifiesContent: true,
    providesUI: true,
    requiresNetwork: false,
    supportsStreaming: false,
  };

  private options: ReferencesPluginOptions;

  constructor(options: ReferencesPluginOptions) {
    super();
    this.options = {
      enableQuoteReferences: true,
      enableAtMentions: true,
      ...options,
    };
  }

  onInstall(context: EditorContext): void {
    super.onInstall(context);
    
    // Subscribe to selection events for quote references
    if (this.options.enableQuoteReferences) {
      context.eventBus.on('selection:change', (payload) => {
        const hasSelection = payload.from !== payload.to;
        context.eventBus.emit('references:selection-changed', { 
          hasSelection, 
          selectedText: payload.content,
          range: { from: payload.from, to: payload.to }
        });
      });
    }
  }

  onActivate(context: EditorContext): void {
    super.onActivate(context);
    this.registerUI(context.slots);
  }

  registerUI(slots: any): void {
    // Register bubble menu component
    slots.register('bubble-menu', {
      pluginId: this.id,
      render: () => (
        <ReferencesBubbleMenu 
          data={this.options.data}
          onReferenceSelect={this.options.onReferenceSelect}
          enableQuoteReferences={this.options.enableQuoteReferences}
        />
      ),
      priority: 70,
      condition: () => this.isActive,
    });

    // Register toolbar component
    if (this.options.enableAtMentions) {
      slots.register('toolbar', {
        pluginId: this.id,
        render: () => (
          <ReferencesToolbar 
            data={this.options.data}
            onReferenceSelect={this.options.onReferenceSelect}
          />
        ),
        priority: 60,
        condition: () => this.isActive,
      });
    }
  }

  getExtensions(): Extension[] {
    const extensions: Extension[] = [];

    if (this.options.enableAtMentions) {
      extensions.push(
        Reference.configure({
          HTMLAttributes: {
            class: 'reference-mention reference',
          },
          suggestion: createReferenceSuggestion(
            this.options.data, 
            this.options.onReferenceSelect
          ),
        })
      );
    }

    return extensions;
  }

  // Plugin-specific methods
  public updateData(data: ReferenceCategory[]): void {
    this.options.data = data;
    // Emit event to update UI components
    this.context?.eventBus.emit('references:data-updated', { data });
  }

  public addReference(reference: SelectedReference): void {
    if (!this.context?.editor) return;
    
    this.context.editor.commands.createQuoteReference({
      id: reference.id,
      label: reference.label,
      type: reference.type,
      metadata: reference.metadata,
    });
  }

  public convertSelectionToQuote(selectedText: string): void {
    if (!this.context?.editor) return;
    
    const quoteId = `quote-${Date.now()}`;
    const quoteData = {
      id: quoteId,
      label: selectedText.slice(0, 50) + (selectedText.length > 50 ? '...' : ''),
      metadata: {
        sourceText: selectedText,
        createdAt: new Date().toISOString(),
        type: 'quote'
      }
    };

    this.context.editor.commands.convertSelectionToQuoteReference(quoteData);
    this.options.onReferenceSelect?.({
      id: quoteId,
      label: quoteData.label,
      type: 'quote',
      metadata: quoteData.metadata
    });
  }
}

// Factory function for easier usage
export function referencesPlugin(options: ReferencesPluginOptions): ReferencesPlugin {
  return new ReferencesPlugin(options);
}