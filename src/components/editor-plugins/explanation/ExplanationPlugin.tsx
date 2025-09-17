import React from 'react';
import { BasePlugin } from '../core/Plugin';
import type { PluginCapabilities, EditorContext, SlotRegistry } from '../../editor/types';
import type { SelectedReference } from '../../reference/types';
import { explanationService, type ExplanationCallbacks } from '../../../services/explanationService';
import { ExplanationBubbleMenu } from './components/ExplanationBubbleMenu';
import type { Extension } from '@tiptap/core';

export interface ExplanationPluginOptions {
  enableExplain?: boolean;
  streamingEnabled?: boolean;
  includeReferences?: boolean;
}

export class ExplanationPlugin extends BasePlugin {
  public readonly id = 'explanation';
  public readonly name = 'Explanation Plugin';
  public readonly version = '1.0.0';
  public readonly capabilities: PluginCapabilities = {
    requiresSelection: true,
    modifiesContent: false,
    providesUI: true,
    requiresNetwork: true,
    supportsStreaming: true,
  };

  private options: ExplanationPluginOptions;
  private isExplaining = false;

  constructor(options: ExplanationPluginOptions = {}) {
    super();
    this.options = {
      enableExplain: true,
      streamingEnabled: true,
      includeReferences: true,
      ...options,
    };
  }

  onInstall(context: EditorContext): void {
    super.onInstall(context);

    // Subscribe to selection events to update UI state
    context.eventBus.on('selection:change', (payload) => {
      const hasSelection = payload.from !== payload.to;
      context.eventBus.emit('explanation:selection-changed', {
        hasSelection,
        selectedText: payload.content,
        range: { from: payload.from, to: payload.to }
      });
    });
  }

  onActivate(context: EditorContext): void {
    super.onActivate(context);
    this.registerUI(context.slots);
  }

  registerUI(slots: SlotRegistry): void {
    // Register bubble menu component
    slots.register('bubble-menu', {
      pluginId: this.id,
      render: () => (
        <ExplanationBubbleMenu
          options={this.options}
          onExplain={this.handleExplain.bind(this)}
          isExplaining={this.isExplaining}
        />
      ),
    }, {
      priority: 70,
      condition: () => this.isActive,
    });
  }

  getExtensions(): Extension[] {
    // Explanation plugin doesn't need custom Tiptap extensions
    return [];
  }

  private async handleExplain(selectedText: string, range: { from: number; to: number }): Promise<void> {
    if (!this.context?.editor || !selectedText.trim() || this.isExplaining) return;

    this.isExplaining = true;

    try {
      // Collect references if enabled
      const references = this.options.includeReferences ?
        await this.collectReferencesInRange(range) : undefined;

      // Emit explanation start event
      this.emit('explanation:started', {
        text: selectedText,
        references,
        range
      });

      const callbacks: ExplanationCallbacks = {
        onChunk: (content: string) => {
          this.emit('explanation:chunk', { content });
        },
        onComplete: () => {
          this.isExplaining = false;
          this.emit('explanation:complete', {});
        },
        onError: (error: string) => {
          this.isExplaining = false;
          this.emit('explanation:error', { error });
        }
      };

      // Stream explanation
      await explanationService.streamExplanation({
        text: selectedText,
        references
      }, callbacks);

    } catch (error) {
      this.isExplaining = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emit('explanation:error', { error: errorMessage });
      console.error('Explanation failed:', error);
    }
  }

  private async collectReferencesInRange(range: { from: number; to: number }): Promise<SelectedReference[]> {
    if (!this.context?.editor) return [];

    const references: SelectedReference[] = [];
    const { editor } = this.context;

    // Search for reference nodes within the selection range
    editor.state.doc.nodesBetween(range.from, range.to, (node) => {
      if (node.type.name === 'reference' && node.attrs) {
        try {
          // Extract reference data from node attributes
          const ref: SelectedReference = {
            id: node.attrs.id || `ref-${Date.now()}`,
            label: node.attrs.label || node.attrs.name || 'Unknown Reference',
            type: node.attrs.type || 'document',
            metadata: node.attrs.metadata || {}
          };
          references.push(ref);
        } catch (error) {
          console.warn('Failed to extract reference from node:', error);
        }
      }
    });

    return references;
  }

  public cancelExplanation(): void {
    if (this.isExplaining) {
      explanationService.cancelStream();
      this.isExplaining = false;
      this.emit('explanation:cancelled', {});
    }
  }

  public isStreamingExplanation(): boolean {
    return this.isExplaining;
  }

  onDeactivate(): void {
    this.cancelExplanation();
    super.onDeactivate();
  }

  onDestroy(): void {
    this.cancelExplanation();
    super.onDestroy();
  }
}

// Add explanation events to the event payload type (will be merged with existing events)
declare module '../../editor/types' {
  interface EventPayload {
    'explanation:selection-changed': { hasSelection: boolean; selectedText: string; range: { from: number; to: number } };
    'explanation:started': { text: string; references?: SelectedReference[]; range: { from: number; to: number } };
    'explanation:chunk': { content: string };
    'explanation:complete': Record<string, never>;
    'explanation:error': { error: string };
    'explanation:cancelled': Record<string, never>;
  }
}

// Factory function for easier usage
export function explanationPlugin(options?: ExplanationPluginOptions): ExplanationPlugin {
  return new ExplanationPlugin(options);
}