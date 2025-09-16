import React from 'react';
import { BasePlugin } from '../core/Plugin';
import type { PluginCapabilities, EditorContext } from '../../editor/types';
import { textTransformService, type TextLensCallbacks } from '../../../services/textTransformService';
import { AIAssistantBubbleMenu } from './components/AIAssistantBubbleMenu';
import { AIAssistantToolbar } from './components/AIAssistantToolbar';
import type { Extension } from '@tiptap/core';

interface UISlots {
  register: (slotName: string, config: {
    pluginId: string;
    render: () => React.ReactNode;
    condition?: () => boolean;
  }) => void;
}

interface EventBus {
  on: (event: string, handler: (...args: unknown[]) => void) => () => void;
  emit: (event: string, ...args: unknown[]) => void;
}

export interface AIAssistantPluginOptions {
  enableExplain?: boolean;
  enableSummarize?: boolean;
  enableZoomIn?: boolean;
  enableZoomOut?: boolean;
  streamingEnabled?: boolean;
  zoomIntensity?: number;
}

export class AIAssistantPlugin extends BasePlugin {
  public readonly id = 'ai-assistant';
  public readonly name = 'AI Assistant Plugin';
  public readonly version = '1.0.0';
  public readonly capabilities: PluginCapabilities = {
    requiresSelection: true,
    modifiesContent: true,
    providesUI: true,
    requiresNetwork: true,
    supportsStreaming: true,
  };

  private options: AIAssistantPluginOptions;
  private eventUnsubscribers: (() => void)[] = [];
  private streamingContent: string = '';
  private streamingRange: { from: number; to: number } | null = null;

  constructor(options: AIAssistantPluginOptions = {}) {
    super();
    this.options = {
      enableExplain: true,
      enableSummarize: true,
      enableZoomIn: true,
      enableZoomOut: true,
      streamingEnabled: true,
      zoomIntensity: 25,
      ...options,
    };
  }

  onInstall(context: EditorContext): void {
    super.onInstall(context);

    // Subscribe to selection events
    context.eventBus.on('selection:change', (payload) => {
      const hasSelection = payload.from !== payload.to;
      context.eventBus.emit('ai-assistant:selection-changed', {
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

  registerUI(slots: UISlots): void {
    // Register bubble menu component
    slots.register('bubble-menu', {
      pluginId: this.id,
      render: () => (
        <AIAssistantBubbleMenu
          options={this.options}
          onAction={this.handleAIAction.bind(this)}
        />
      ),
      priority: 80,
      condition: () => this.isActive,
    });

    // Register toolbar component
    slots.register('toolbar', {
      pluginId: this.id,
      render: () => (
        <AIAssistantToolbar
          options={this.options}
          onAction={this.handleAIAction.bind(this)}
        />
      ),
      priority: 50,
      condition: () => this.isActive,
    });
  }

  subscribeToEvents(eventBus: EventBus): void {

    // Clean up existing event listeners to prevent duplicates
    this.eventUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.eventUnsubscribers = [];

    // Listen to selection changes and emit AI assistant specific events
    const selectionUnsubscribe = eventBus.on('selection:change', (payload: { from: number; to: number; content: string }) => {
      const hasSelection = payload.content.trim().length > 0;

      eventBus.emit('ai-assistant:selection-changed', {
        hasSelection,
        selectedText: payload.content,
        range: { from: payload.from, to: payload.to }
      });
    });
    this.eventUnsubscribers.push(selectionUnsubscribe);

    // Handle streaming chunks for real-time updates
    const chunkUnsubscribe = eventBus.on('ai-assistant:chunk-received', (payload: { action: string; content: string; range: { from: number; to: number } }) => {
      if (this.options.streamingEnabled && this.context?.editor) {
        const editor = this.context.editor;

        try {
          // Initialize streaming state if this is the first chunk
          if (this.streamingRange === null) {
            // Store original selection for first replacement
            this.streamingRange = { from: payload.range.from, to: payload.range.to };
            this.streamingContent = payload.content;


            // First chunk: replace the original selection
            editor.chain()
              .focus()
              .setTextSelection({ from: this.streamingRange.from, to: this.streamingRange.to })
              .insertContent(this.streamingContent)
              .run();
          } else {
            // Accumulate content for subsequent chunks
            this.streamingContent += payload.content;


            // For subsequent chunks: replace whatever is currently selected with the accumulated content
            editor.chain()
              .focus()
              .insertContent(this.streamingContent)
              .run();
          }
        } catch (error) {
          console.error('Error in streaming chunk handler:', error);
          // Reset streaming state on error
          this.streamingContent = '';
          this.streamingRange = null;
        }
      }
    });
    this.eventUnsubscribers.push(chunkUnsubscribe);

    // Handle action completion to reset streaming state
    const completeUnsubscribe = eventBus.on('ai-assistant:action-complete', () => {
      this.streamingContent = '';
      this.streamingRange = null;
    });
    this.eventUnsubscribers.push(completeUnsubscribe);

    // Handle action errors to reset streaming state
    const errorUnsubscribe = eventBus.on('ai-assistant:action-error', () => {
      this.streamingContent = '';
      this.streamingRange = null;
    });
    this.eventUnsubscribers.push(errorUnsubscribe);
  }

  onDeactivate(): void {
    this.eventUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.eventUnsubscribers = [];
    // Reset streaming state
    this.streamingContent = '';
    this.streamingRange = null;
    super.onDeactivate();
  }

  onDestroy(): void {
    this.eventUnsubscribers.forEach(unsubscribe => unsubscribe());
    this.eventUnsubscribers = [];
    // Reset streaming state
    this.streamingContent = '';
    this.streamingRange = null;
    super.onDestroy();
  }

  getExtensions(): Extension[] {
    // AI Assistant doesn't need custom Tiptap extensions
    return [];
  }

  // AI Assistant specific methods
  private async handleAIAction(action: string, selectedText: string, range: { from: number; to: number }): Promise<void> {
    if (!this.context?.editor || !selectedText) return;

    // Reset streaming state for new action
    this.streamingContent = '';
    this.streamingRange = null;

    const callbacks: TextLensCallbacks = {
      onChunk: (content: string) => {
        // Emit chunk event for real-time updates
        this.context?.eventBus.emit('ai-assistant:chunk-received', {
          action,
          content,
          range
        });
      },
      onComplete: () => {
        this.context?.eventBus.emit('ai-assistant:action-complete', { action });
      },
      onError: (error: string) => {
        this.context?.eventBus.emit('ai-assistant:action-error', { action, error });
      }
    };

    try {
      let result = '';

      switch (action) {
        case 'explain':
          result = await this.explainText(selectedText, callbacks);
          break;
        case 'summarize':
          result = await this.summarizeText(selectedText, callbacks);
          break;
        case 'zoom-in':
          result = await this.zoomInText(selectedText, callbacks);
          break;
        case 'zoom-out':
          result = await this.zoomOutText(selectedText, callbacks);
          break;
        default:
          console.warn('Unknown AI action:', action);
          return;
      }

      // Replace selected text with AI result if streaming is not enabled
      if (!this.options.streamingEnabled && result) {
        // Use the same reliable chain approach as the working version
        const success = this.context.editor.chain()
          .focus()
          .deleteRange({ from: range.from, to: range.to })
          .insertContent(result)
          .run();

        if (success) {
          // Select the newly inserted text
          const newTo = range.from + result.length;

          setTimeout(() => {
            if (this.context?.editor) {
              this.context.editor.commands.setTextSelection({ from: range.from, to: newTo });
            }
          }, 10);
        } else {
          console.warn('Failed to insert AI result in non-streaming mode');
        }
      }
    } catch (error) {
      console.error(`AI Assistant ${action} failed:`, error);
    }
  }

  private async explainText(text: string, callbacks: TextLensCallbacks): Promise<string> {
    // For explain, we use zoom out to get broader context
    return textTransformService.zoomOut(text, 50, callbacks, 'Explain this text in detail');
  }

  private async summarizeText(text: string, callbacks: TextLensCallbacks): Promise<string> {
    // For summarize, we use zoom in to condense
    return textTransformService.zoomIn(text, 75, callbacks, 'Create a concise summary');
  }

  private async zoomInText(text: string, callbacks: TextLensCallbacks): Promise<string> {
    return textTransformService.zoomIn(text, this.options.zoomIntensity || 25, callbacks);
  }

  private async zoomOutText(text: string, callbacks: TextLensCallbacks): Promise<string> {
    return textTransformService.zoomOut(text, this.options.zoomIntensity || 25, callbacks);
  }

  public cancelCurrentOperation(): void {
    textTransformService.cancelStream();
  }

  public isStreaming(): boolean {
    return textTransformService.isStreaming();
  }
}

// Factory function for easier usage
export function aiAssistantPlugin(options?: AIAssistantPluginOptions): AIAssistantPlugin {
  return new AIAssistantPlugin(options);
}