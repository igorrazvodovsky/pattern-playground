import { BasePlugin } from '../core/Plugin';
import type { PluginCapabilities, EditorContext, SlotRegistry, EventBus } from '../../editor/types';
import {
  textTransformService,
  type TextLensCallbacks,
} from '../../../services/text-transform-service';
import { AIAssistantBubbleMenu } from './components/AIAssistantBubbleMenu';
import { AIAssistantToolbar } from './components/AIAssistantToolbar';
import type { Extension } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';

/** A quick-action instruction offered in the bubble menu: the selected text is
    revised as the instruction says and the revision replaces it in the document. */
export interface RevisionPreset {
  id: string;
  label: string;
  instruction: string;
}

export interface AIAssistantPluginOptions {
  enableSummarize?: boolean;
  enableZoomIn?: boolean;
  enableZoomOut?: boolean;
  streamingEnabled?: boolean;
  zoomIntensity?: number;
  revisions?: RevisionPreset[];
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
      enableSummarize: true,
      enableZoomIn: true,
      enableZoomOut: true,
      streamingEnabled: true,
      zoomIntensity: 25,
      ...options,
    };
  }

  async onInstall(context: EditorContext): Promise<void> {
    await super.onInstall(context);

    // Subscribe to selection events
    context.eventBus.on('selection:change', (payload) => {
      const hasSelection = payload.from !== payload.to;
      context.eventBus.emit('ai-assistant:selection-changed', {
        hasSelection,
        selectedText: payload.content,
        range: { from: payload.from, to: payload.to },
      });
    });
  }

  onActivate(context: EditorContext): void {
    super.onActivate(context);
    this.registerUI(context.slots);
  }

  registerUI(slots: SlotRegistry): void {
    // Register bubble menu component
    slots.register(
      'bubble-menu',
      {
        pluginId: this.id,
        render: () => (
          <AIAssistantBubbleMenu options={this.options} onAction={this.handleAIAction.bind(this)} />
        ),
      },
      {
        priority: 80,
        condition: () => this.isActive,
      },
    );

    // Register toolbar component
    slots.register(
      'toolbar',
      {
        pluginId: this.id,
        render: () => (
          <AIAssistantToolbar options={this.options} onAction={this.handleAIAction.bind(this)} />
        ),
      },
      {
        priority: 50,
        condition: () => this.isActive,
      },
    );
  }

  subscribeToEvents(eventBus: EventBus): void {
    // Clean up existing event listeners to prevent duplicates
    this.eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.eventUnsubscribers = [];

    // Listen to selection changes and emit AI assistant specific events
    const selectionUnsubscribe = eventBus.on(
      'selection:change',
      (payload: { from: number; to: number; content: string }) => {
        const hasSelection = payload.content.trim().length > 0;

        eventBus.emit('ai-assistant:selection-changed', {
          hasSelection,
          selectedText: payload.content,
          range: { from: payload.from, to: payload.to },
        });
      },
    );
    this.eventUnsubscribers.push(selectionUnsubscribe);

    // Handle streaming chunks for real-time updates
    const chunkUnsubscribe = eventBus.on(
      'ai-assistant:chunk-received',
      (payload: { action: string; content: string; range: { from: number; to: number } }) => {
        if (this.options.streamingEnabled && this.context?.editor) {
          try {
            // The first chunk replaces the selection; each later chunk replaces
            // what the earlier chunks inserted with the reply so far.
            const range = this.streamingRange ?? payload.range;
            this.streamingContent += payload.content;
            const to = this.replaceText(range, this.streamingContent);
            this.streamingRange = { from: range.from, to };
          } catch (error) {
            console.error('Error in streaming chunk handler:', error);
            // Reset streaming state on error
            this.streamingContent = '';
            this.streamingRange = null;
          }
        }
      },
    );
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
    this.eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
    this.eventUnsubscribers = [];
    // Reset streaming state
    this.streamingContent = '';
    this.streamingRange = null;
    super.onDeactivate();
  }

  onDestroy(): void {
    this.eventUnsubscribers.forEach((unsubscribe) => unsubscribe());
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
  private async handleAIAction(
    action: string,
    selectedText: string,
    range: { from: number; to: number },
  ): Promise<void> {
    // The menus show a processing state until one of these two events arrives,
    // so every way out of this method sends exactly one of them.
    let settled = false;
    const complete = () => {
      if (settled) return;
      settled = true;
      this.context?.eventBus.emit('ai-assistant:action-complete', { action });
    };
    const fail = (error: string) => {
      if (settled) return;
      settled = true;
      this.context?.eventBus.emit('ai-assistant:action-error', { action, error });
    };

    if (!this.context?.editor || !selectedText) {
      fail('Nothing is selected');
      return;
    }

    // Reset streaming state for new action
    this.streamingContent = '';
    this.streamingRange = null;

    const callbacks: TextLensCallbacks = {
      onChunk: (content: string) => {
        // Emit chunk event for real-time updates
        this.context?.eventBus.emit('ai-assistant:chunk-received', {
          action,
          content,
          range,
        });
      },
      // Completion is reported after the reply has been placed in the document.
      onError: fail,
    };

    try {
      let result = '';

      switch (action) {
        case 'summarize':
          result = await this.summarizeText(selectedText, callbacks);
          break;
        case 'zoom-in':
          result = await this.zoomInText(selectedText, callbacks);
          break;
        case 'zoom-out':
          result = await this.zoomOutText(selectedText, callbacks);
          break;
        default: {
          const preset = this.options.revisions?.find((r) => `revise:${r.id}` === action);
          if (!preset) {
            console.warn('Unknown AI action:', action);
            fail(`Unknown action: ${action}`);
            return;
          }
          result = await textTransformService.revise(selectedText, preset.instruction, callbacks);
        }
      }

      // An empty reply (a failed or cancelled request) leaves the selection as it was.
      if (result.trim()) {
        const inserted = this.options.streamingEnabled
          ? this.streamingRange
          : { from: range.from, to: this.replaceText(range, result) };
        if (inserted) this.context.editor.chain().focus().setTextSelection(inserted).run();
      }
      complete();
    } catch (error) {
      console.error(`AI Assistant ${action} failed:`, error);
      fail(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      this.streamingContent = '';
      this.streamingRange = null;
    }
  }

  /**
   * Replace a range with the model's reply and return where the reply ends.
   * The reply is plain text: blank lines separate paragraphs, and nothing in
   * it is parsed as markup. The reply goes in as an open slice, so its first
   * and last paragraphs join the text before and after the range: revising
   * part of a paragraph keeps it one paragraph.
   */
  private replaceText(range: { from: number; to: number }, text: string): number {
    const { state, view } = this.context!.editor;
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((block) => block.replace(/\s*\n\s*/g, ' ').trim())
      .filter(Boolean)
      .map((block) => state.schema.nodes.paragraph.create(null, state.schema.text(block)));
    const slice = paragraphs.length ? new Slice(Fragment.from(paragraphs), 1, 1) : Slice.empty;

    const tr = state.tr.replace(range.from, range.to, slice);
    const end = tr.mapping.map(range.to);
    view.dispatch(tr);
    return end;
  }

  private async summarizeText(text: string, callbacks: TextLensCallbacks): Promise<string> {
    return textTransformService.zoomOut(text, 75, callbacks);
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
