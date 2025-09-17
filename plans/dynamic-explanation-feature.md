# Dynamic Explanation Feature Implementation Plan

## Overview
Add a story to BubbleMenu.stories.tsx that demonstrates dynamic explanation functionality where users can select text, click "Explain this" in a bubble menu, and receive AI-generated explanations in a drawer. The feature will support both plain text and reference objects for richer contextual explanations.

## Components to Implement

### 1. New DynamicExplanation Story Component
**Location**: `src/stories/components/BubbleMenu.stories.tsx`

**Features**:
- Text editor with rich content using Tiptap
- Custom bubble menu with "Explain this" button
- Handles text selection events
- Supports references (both plain text and data objects)
- Integrates with drawer for displaying explanations

**Implementation Pattern**:
```typescript
const DynamicExplanationEditor: React.FC = () => {
  // Use editor with Reference extension for rich reference support
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Reference.configure({
        suggestion: createReferenceSuggestion(referenceCategories)
      })
    ],
    content: richContent,
    immediatelyRender: false
  });

  // Use EditorProvider with explanationPlugin
  return (
    <EditorProvider
      editor={editor}
      plugins={[
        formattingPlugin(),
        explanationPlugin({
          enableExplain: true,
          streamingEnabled: true,
          includeReferences: true
        })
      ]}
    >
      <EditorLayout>
        <PluginEditorContent />
        <EditorBubbleMenu />
      </EditorLayout>
    </EditorProvider>
  );
};
```

### 2. Explanation Service
**Location**: `src/services/explanationService.ts`

**Responsibilities**:
- Similar architecture to `textTransformService.ts`
- Handles API calls to `/api/explain` endpoint
- Supports streaming responses for real-time updates
- Accepts both plain text and reference objects in request payload
- Manages abort controllers for cancellable requests
- Returns accumulated explanation content

**Detailed Implementation**:
```typescript
import type { SelectedReference } from '../components/reference/types';

interface ExplanationRequest {
  text: string;
  references?: SelectedReference[];
  context?: string;
}

interface ExplanationStreamChunk {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
}

interface ExplanationCallbacks {
  onChunk?: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

function getExplainApiEndpoint(): string {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    return 'http://localhost:3000/api/explain';
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return `${apiUrl}/api/explain`;
  }
  return '/api/explain';
}

export class ExplanationService {
  private abortController: AbortController | null = null;

  async streamExplanation(
    request: ExplanationRequest,
    callbacks: ExplanationCallbacks = {}
  ): Promise<string> {
    this.cancelStream();
    this.abortController = new AbortController();

    let accumulatedContent = '';

    try {
      const response = await fetch(getExplainApiEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(request),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const data: ExplanationStreamChunk = JSON.parse(jsonStr);

                if (data.type === 'chunk' && data.content) {
                  accumulatedContent += data.content;
                  callbacks.onChunk?.(data.content);
                } else if (data.type === 'complete') {
                  callbacks.onComplete?.();
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Unknown server error');
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return accumulatedContent;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream was cancelled');
        return accumulatedContent;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(errorMessage);
      throw error;
    } finally {
      this.abortController = null;
    }
  }

  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  isStreaming(): boolean {
    return this.abortController !== null;
  }
}

export const explanationService = new ExplanationService();
```

### 3. Server API Endpoint
**Location**: `server/handlers/explanation.ts`

**Implementation**:
- New handler class `ExplanationHandler` following existing patterns
- Route: `POST /api/explain`
- Accepts text and optional reference objects
- Uses OpenAI API to generate contextual explanations
- Implements SSE streaming for real-time response
- Handles both plain text and structured data in references

**Detailed Handler Implementation**:
```typescript
import { Request, Response } from 'express';
import { z } from 'zod';
import { StreamingService } from '../services/streaming.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

// Define Zod schema for validation
const explanationRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  references: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['user', 'document', 'project', 'task', 'file', 'link', 'quote', 'material', 'component', 'product', 'service']),
    metadata: z.record(z.unknown()).optional()
  })).optional(),
  context: z.string().optional()
});

export type ExplanationRequest = z.infer<typeof explanationRequestSchema>;

export class ExplanationHandler {
  static async handleExplain(req: Request, res: Response): Promise<void> {
    logger.debug("Received explanation request:", req.body);

    try {
      // Validate request
      const validatedRequest = explanationRequestSchema.parse(req.body);
      logger.info(`Processing explanation request for text: ${validatedRequest.text.slice(0, 50)}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        await StreamingService.handleExplanationStream(res, validatedRequest, controller.signal);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      logger.error("Error processing explanation request:", error);
      throw AppError.badRequest(error instanceof Error ? error.message : "Invalid request");
    }
  }
}
```

**StreamingService Extension** (`server/services/streaming.ts`):
```typescript
static async handleExplanationStream(
  res: Response,
  request: ExplanationRequest,
  signal?: AbortSignal
): Promise<void> {
  this.setupSSEHeaders(res);

  try {
    const streamGenerator = openaiService.generateExplanationStream(request, signal);

    for await (const chunk of streamGenerator) {
      const content = chunk.text || "";

      if (content) {
        const streamChunk = {
          type: 'chunk',
          content,
          done: false
        };

        res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
      }
    }

    const completionChunk = {
      type: 'complete',
      done: true
    };

    res.write(`data: ${JSON.stringify(completionChunk)}\n\n`);
    res.end();

  } catch (error) {
    logger.error("Error in explanation streaming:", error);

    const errorChunk = {
      type: 'error',
      error: error instanceof Error ? error.message : "Server error",
      done: true
    };

    res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
    res.end();
  }
}
```

**OpenAI Service Extension** (`server/services/openai.ts`):
```typescript
async *generateExplanationStream(
  request: ExplanationRequest,
  signal?: AbortSignal
): AsyncGenerator<{ text: string }> {
  const systemPrompt = `You are an expert explainer. Provide clear, concise explanations for the given text.
  If references are provided, incorporate them into your explanation to provide richer context.`;

  const userPrompt = this.buildExplanationPrompt(request);

  const stream = await this.client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1000
  }, { signal });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield { text: content };
    }
  }
}

private buildExplanationPrompt(request: ExplanationRequest): string {
  let prompt = `Please explain the following text:\n\n"${request.text}"`;

  if (request.references && request.references.length > 0) {
    prompt += '\n\nRelevant references:';
    for (const ref of request.references) {
      prompt += `\n- ${ref.label} (${ref.type})`;
      if (ref.metadata) {
        prompt += `: ${JSON.stringify(ref.metadata)}`;
      }
    }
  }

  if (request.context) {
    prompt += `\n\nAdditional context: ${request.context}`;
  }

  return prompt;
}
```

**Route Registration**: Update `server/routes.ts` to include:
```typescript
import { ExplanationHandler } from './handlers/explanation.js';

// Add to existing routes
app.post('/api/explain', asyncHandler(ExplanationHandler.handleExplain));
```

### 4. Explanation Plugin Implementation
**Location**: `src/components/editor-plugins/explanation/ExplanationPlugin.ts`

**Plugin Architecture**:
```typescript
import { Plugin } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import type { Editor } from '@tiptap/react';
import type { EventBus } from '../../editor/EventBus';
import type { SelectedReference } from '../../reference/types';
import { explanationService } from '../../../services/explanationService';

export interface ExplanationPluginOptions {
  enableExplain?: boolean;
  streamingEnabled?: boolean;
  includeReferences?: boolean;
  onExplanationStart?: (text: string, references?: SelectedReference[]) => void;
  onExplanationComplete?: (explanation: string) => void;
  onExplanationError?: (error: string) => void;
}

export function explanationPlugin(options: ExplanationPluginOptions = {}) {
  const {
    enableExplain = true,
    streamingEnabled = true,
    includeReferences = true
  } = options;

  return {
    name: 'explanation',

    createPlugin: (editor: Editor, eventBus: EventBus) => {
      return new Plugin({
        key: new PluginKey('explanation'),

        view() {
          return {
            update: (view: EditorView) => {
              const { from, to } = view.state.selection;
              const hasSelection = from !== to;
              const selectedText = view.state.doc.textBetween(from, to);

              // Emit selection change event
              eventBus.emit('explanation:selection-changed', {
                hasSelection,
                selectedText,
                range: { from, to }
              });
            }
          };
        }
      });
    },

    onAction: async (action: string, selectedText: string, range: { from: number; to: number }) => {
      if (action === 'explain' && enableExplain) {
        // Collect references if enabled
        const references = includeReferences ?
          await collectReferencesInRange(editor, range) : undefined;

        // Trigger explanation
        options.onExplanationStart?.(selectedText, references);

        try {
          const explanation = await explanationService.streamExplanation(
            { text: selectedText, references },
            {
              onChunk: (chunk) => {
                eventBus.emit('explanation:chunk', { chunk });
              },
              onComplete: () => {
                eventBus.emit('explanation:complete');
              },
              onError: (error) => {
                eventBus.emit('explanation:error', { error });
              }
            }
          );

          options.onExplanationComplete?.(explanation);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          options.onExplanationError?.(errorMessage);
        }
      }
    },

    bubbleMenuComponent: ExplanationBubbleMenu
  };
}

async function collectReferencesInRange(
  editor: Editor,
  range: { from: number; to: number }
): Promise<SelectedReference[]> {
  const references: SelectedReference[] = [];

  editor.state.doc.nodesBetween(range.from, range.to, (node) => {
    if (node.type.name === 'reference') {
      const ref = node.attrs as SelectedReference;
      references.push(ref);
    }
  });

  return references;
}
```

**Bubble Menu Component**:
```typescript
// src/components/editor-plugins/explanation/components/ExplanationBubbleMenu.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';
import { useModalService } from '../../../../hooks/useModalService';
import { ExplanationDrawer } from './ExplanationDrawer';

interface ExplanationBubbleMenuProps {
  options: ExplanationPluginOptions;
  onAction: (action: string, selectedText: string, range: { from: number; to: number }) => Promise<void>;
}

export function ExplanationBubbleMenu({ options, onAction }: ExplanationBubbleMenuProps) {
  const { editor, eventBus } = useEditorContext();
  const { openDrawer } = useModalService();
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    const unsubscribe = eventBus.on('explanation:selection-changed', (payload) => {
      setHasSelection(payload.hasSelection);
      setSelectedText(payload.selectedText);
    });

    return unsubscribe;
  }, [eventBus]);

  useEffect(() => {
    const unsubscribeChunk = eventBus.on('explanation:chunk', ({ chunk }) => {
      setExplanation(prev => prev + chunk);
    });

    const unsubscribeComplete = eventBus.on('explanation:complete', () => {
      setIsExplaining(false);
    });

    const unsubscribeError = eventBus.on('explanation:error', () => {
      setIsExplaining(false);
    });

    return () => {
      unsubscribeChunk();
      unsubscribeComplete();
      unsubscribeError();
    };
  }, [eventBus]);

  const handleExplain = useCallback(async () => {
    if (!hasSelection || !selectedText || isExplaining) return;

    const { from, to } = editor?.state.selection || { from: 0, to: 0 };
    const currentSelectedText = editor ? editor.state.doc.textBetween(from, to) : selectedText;
    const currentRange = { from, to };

    setIsExplaining(true);
    setExplanation('');

    // Open drawer immediately
    openDrawer(
      <ExplanationDrawer
        text={currentSelectedText}
        explanation={explanation}
        isLoading={isExplaining}
      />,
      {
        title: 'Explanation',
        position: 'right',
        size: 'medium',
        closable: true
      }
    );

    // Start explanation
    await onAction('explain', currentSelectedText, currentRange);
  }, [hasSelection, selectedText, isExplaining, onAction, editor, openDrawer, explanation]);

  if (!hasSelection || selectedText.length === 0) {
    return null;
  }

  return (
    <>
      {options.enableExplain && (
        <button
          type="button"
          className="button button--plain"
          onClick={handleExplain}
          disabled={isExplaining}
          title="Explain selected text"
        >
          {isExplaining ? '⏳ Explaining...' : 'Explain this'}
        </button>
      )}
    </>
  );
}
```

### 5. Integration Flow

#### User Interaction:
1. User selects text in the editor
2. Bubble menu appears with "Explain this" button
3. User clicks the button
4. Drawer opens immediately with loading state
5. System captures selected text and any references

#### Processing:
1. Plugin collects selected text and references in range
2. Send request to explanation service with text + references
3. Service streams response from server via SSE
4. Drawer updates in real-time with streamed chunks
5. Include reference information in the explanation

#### UI Components:
- Use existing `useModalService` hook for drawer management
- Leverage `EditorBubbleMenu` slot system for bubble menu integration
- Follow existing patterns from `AIAssistantBubbleMenu`
- Implement `ExplanationDrawer` component with streaming support

### 6. Explanation Drawer Component
**Location**: `src/components/editor-plugins/explanation/components/ExplanationDrawer.tsx`

```typescript
import React from 'react';
import type { SelectedReference } from '../../../reference/types';

interface ExplanationDrawerProps {
  text: string;
  explanation: string;
  isLoading: boolean;
  references?: SelectedReference[];
}

export function ExplanationDrawer({
  text,
  explanation,
  isLoading,
  references
}: ExplanationDrawerProps) {
  return (
    <div className="explanation-drawer">

      // <div className="explanation-drawer__section">
      //   <h3>Selected Text</h3>
      //   <blockquote className="explanation-drawer__quote">
      //     "{text}"
      //   </blockquote>
      // </div>

      {references && references.length > 0 && (
        <div className="explanation-drawer__section">
          <h3>References</h3>
          <ul className="explanation-drawer__references">
            {references.map(ref => (
              <li key={ref.id} className="reference-item">
                <span className="reference-item__type">{ref.type}</span>
                <span className="reference-item__label">{ref.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="explanation-drawer__section">
        // <h3>Explanation</h3>
        {isLoading && !explanation && (
          <div className="explanation-drawer__loading">
            <span className="loading-spinner">⏳</span>
            <span>Generating explanation...</span>
          </div>
        )}
        {explanation && (
          <div className="explanation-drawer__content">
            <p>{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 7. Documentation Update
**Location**: `src/stories/patterns/Explanation.mdx`

Add a new section under "### Dynamic explanation" with:
- Link to the new story: `[Dynamic Explanation Example](./?path=/story/components-bubble-menu--dynamic-explanation)`
- Description of the implementation
- Example usage scenarios

## Implementation Details

### Complete File Structure:
```
src/
├── components/
│   └── editor-plugins/
│       └── explanation/
│           ├── ExplanationPlugin.ts (new)
│           ├── components/
│           │   ├── ExplanationBubbleMenu.tsx (new)
│           │   └── ExplanationDrawer.tsx (new)
│           └── index.ts (new)
├── services/
│   └── explanationService.ts (new)
├── stories/
│   ├── components/
│   │   └── BubbleMenu.stories.tsx (update - add DynamicExplanation story)
│   └── patterns/
│       └── Explanation.mdx (update - add dynamic explanation section)
server/
├── handlers/
│   └── explanation.ts (new)
├── services/
│   ├── streaming.ts (update - add handleExplanationStream)
│   └── openai.ts (update - add generateExplanationStream)
├── schemas.ts (update - export ExplanationRequest type)
└── routes.ts (update - add /api/explain route)
```

### Key Patterns to Follow:
1. **Streaming API**: Use SSE format like `textLensHandler`
2. **Plugin Architecture**: Follow patterns from `ai-assistant` plugin
3. **Drawer Integration**: Use `useModalService` like in `Drawer.stories`
4. **Reference Support**: Include reference handling similar to commenting system
5. **Error Handling**: Implement proper error boundaries and user feedback

### Dependencies:
- Existing: Tiptap, React, Express, OpenAI
- No new dependencies required

## Key Architectural Decisions

### 1. **Plugin-Based Architecture**
- Follow the existing plugin pattern from `ai-assistant` and `commenting` plugins
- Use EventBus for communication between components
- Maintain separation between plugin logic and UI components

### 2. **Streaming Implementation**
- Use Server-Sent Events (SSE) for real-time streaming
- Implement abort controllers for cancellable requests
- Follow the same SSE chunk format as `textLensHandler`

### 3. **Reference Integration**
- Leverage existing `SelectedReference` type from reference system
- Collect references from Tiptap document nodes within selection range
- Include reference metadata in API requests for richer explanations

### 4. **Modal Service Integration**
- Use existing `useModalService` hook for drawer management
- Implement React components with error boundaries
- Follow the drawer DOM creation pattern from modal service

### 5. **State Management**
- Use React hooks for local component state
- Leverage EventBus for cross-component communication
- Maintain streaming state in service singleton

## Implementation Order

### Phase 1: Backend Implementation
1. Create `server/handlers/explanation.ts` with request validation
2. Extend `server/services/streaming.ts` with explanation streaming
3. Extend `server/services/openai.ts` with prompt generation
4. Update `server/routes.ts` to register new endpoint
5. Test API endpoint with curl/Postman

### Phase 2: Frontend Service Layer
1. Create `src/services/explanationService.ts`
2. Implement streaming logic with abort controller
3. Add proper error handling and cleanup
4. Test service in isolation

### Phase 3: Plugin Implementation
1. Create plugin directory structure
2. Implement `ExplanationPlugin.ts` with event handling
3. Create `ExplanationBubbleMenu.tsx` component
4. Create `ExplanationDrawer.tsx` component
5. Wire up plugin exports in `index.ts`

### Phase 4: Story Integration
1. Update `BubbleMenu.stories.tsx` with DynamicExplanation story
2. Test with various content and references
3. Ensure streaming updates work correctly

### Phase 5: Documentation
1. Update `Explanation.mdx` with dynamic explanation section
2. Add usage examples and implementation notes
3. Document API endpoints and request/response formats

## Testing Considerations
- Test with various text selections (short, long, with formatting)
- Verify reference inclusion in explanations
- Test streaming response handling
- Ensure proper cleanup on component unmount
- Verify drawer behavior and accessibility
- Test error scenarios (network failures, timeout, invalid responses)
- Verify abort controller cancellation works correctly
- Test with multiple concurrent explanation requests

## Success Criteria
- [ ] Users can select text and see bubble menu
- [ ] "Explain this" button triggers API call
- [ ] Drawer opens immediately with loading state
- [ ] Explanations stream in real-time to the drawer
- [ ] References are collected and included in explanation context
- [ ] Streaming responses work smoothly without UI freezing
- [ ] Proper error handling with user feedback
- [ ] Component cleanup on unmount prevents memory leaks
- [ ] Story is documented in Explanation.mdx
- [ ] Code follows existing patterns and conventions
- [ ] TypeScript types are properly defined
- [ ] No ESLint or TypeScript errors