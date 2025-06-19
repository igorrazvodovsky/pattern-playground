import { OpenAI } from 'openai';
import { Request, Response, Application } from 'express';
import logger from './logger.js';
import config from './config.js';
import { juiceProductionSchema, jsonSchema, JuiceProductionModel, ModelItem } from './schemas.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

// TypeScript interfaces for OpenAI API
interface OpenAIResponseChunk {
  text?: string;
  // Add other possible properties here
}

/**
 * Response interface for API responses
 */
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Stream event interface for SSE responses
 */
interface StreamEvent {
  newComponent?: ModelItem;
  accumulated?: string;
  error?: string;
  done: boolean;
}



// New generic interfaces
interface AISuggestionRequest {
  prompt: string;
  context: {
    type: 'filters' | 'commands' | 'navigation' | 'actions' | string;
    availableOptions: Record<string, any[]>;
    metadata?: Record<string, any>;
  };
}

interface AISuggestionData {
  suggestions: Array<{
    id: string;
    label: string;
    value: any;
    confidence: number;
    metadata?: Record<string, any>;
  }>;
  explanation: string;
  confidence: number;
  unmatchedCriteria?: string[];
}

interface AISuggestionResponse {
  success: boolean;
  data: AISuggestionData | null;
  error: string | null;
}

/**
 * Configure and apply routes to Express app
 * @param app - Express application
 */
export const setupRoutes = (app: Application): void => {
  // Generation endpoint
  app.post('/api/generate', async (req: Request, res: Response): Promise<void> => {
    logger.debug("Received request body:", req.body);

    // Validate request
    if (!req.body || !req.body.prompt) {
      logger.error("Error: Prompt is missing in request body");
      res.status(400).json({
        success: false,
        data: null,
        error: "Missing 'prompt' in request body"
      });
      return;
    }

    const prompt: string = req.body.prompt;
    logger.info(`Processing prompt: "${prompt}"`);

    // Check if client requested streaming response
    const shouldStream: boolean = !!(req.headers.accept && req.headers.accept.includes('text/event-stream'));
    logger.debug(`Streaming requested: ${shouldStream}`);

    try {
      if (shouldStream) {
        await handleStreamingResponse(req, res, prompt);
      } else {
        await handleStandardResponse(req, res, prompt);
      }
    } catch (error) {
      logger.error("Error processing request:", error);
      res.status(500).json({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Server error"
      });
    }
  });

  // New generic suggestions endpoint
  app.post('/api/generate-suggestions', async (req: Request, res: Response): Promise<void> => {
    logger.debug("Received AI suggestion request:", req.body);

    // Validate request
    if (!req.body || !req.body.prompt) {
      logger.error("Error: Prompt is missing in request body");
      res.status(400).json({
        success: false,
        data: null,
        error: "Missing 'prompt' in request body"
      });
      return;
    }

    if (!req.body.context || !req.body.context.type || !req.body.context.availableOptions) {
      logger.error("Error: Context is missing or incomplete in request body");
      res.status(400).json({
        success: false,
        data: null,
        error: "Missing or incomplete 'context' in request body"
      });
      return;
    }

    const { prompt, context }: AISuggestionRequest = req.body;
    logger.info(`Processing ${context.type} suggestion prompt: "${prompt}"`);

    try {
      await handleGenericSuggestionResponse(req, res, prompt, context);
    } catch (error) {
      logger.error("Error processing suggestion request:", error);
      res.status(500).json({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : "Server error"
      });
    }
  });


};

/**
 * Handle streaming response to client
 * @param _req - Express request (unused)
 * @param res - Express response
 * @param prompt - User prompt
 */
async function handleStreamingResponse(_req: Request, res: Response, prompt: string): Promise<void> {
  // Set headers for SSE
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Initialize for accumulating content
  const accumulatedData: JuiceProductionModel = { model: [] };
  let jsonBuffer = "";

  try {
    // Call OpenAI API with streaming enabled
    const stream = await openai.responses.create({
      model: config.openai.model,
      instructions: "You are an expert in industrial equipment and juice production systems. Paint a picture of the juice production based on the user's requirements. Return your response as a JSON object with model array that contains components. Don't include the component you were prompted with or its parent components.Generate each component one by one for streaming purposes.",
      input: "Make a list of components related to components at the end of this hierarchy:" + prompt,
      text: {
        format: {
          type: "json_schema",
          name: "json_schema",
          schema: jsonSchema
        }
      },
      tools: [
        {
          "type": "file_search",
          "vector_store_ids": [
            "vs_681898d1e6e08191b2fcee9dab2faf8e"
          ]
        }
      ],
      stream: true
    });

    // Process each chunk from OpenAI
    for await (const chunk of stream) {
      // Extract content delta
      const chunkData = chunk as unknown as OpenAIResponseChunk;
      const content = chunkData.text || "";
      if (!content) continue;

      // Accumulate the JSON string
      jsonBuffer += content;

      try {
        // Try to parse the accumulated JSON string
        const parsedJson = JSON.parse(jsonBuffer) as JuiceProductionModel;

        // If parsing succeeded, update our accumulated data
        if (parsedJson && parsedJson.model && Array.isArray(parsedJson.model)) {
          // Find new components that weren't in the previous accumulated data
          const newComponents = parsedJson.model.filter((component: ModelItem) =>
            !accumulatedData.model.some((existing: ModelItem) =>
              existing.id === component.id ||
              (existing.component_name !== undefined &&
                component.component_name !== undefined &&
                existing.component_name === component.component_name)
            )
          );

          // If there are new components, send them individually
          if (newComponents.length > 0) {
            for (const newComponent of newComponents) {
              // Add the new component to accumulated data
              accumulatedData.model.push(newComponent);

              // Send event with just this new component
              const componentEvent = `data: ${JSON.stringify({
                newComponent: newComponent,
                accumulated: JSON.stringify(accumulatedData),
                done: false
              } as StreamEvent)}\n\n`;

              res.write(componentEvent);

              // Add a slight delay to simulate more granular streaming
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
        }
      } catch {
        // Parsing failed, continue accumulating until we have valid JSON
        logger.debug("JSON parsing failed, continuing to accumulate chunks");
      }
    }

    // Send final event with complete accumulated data
    const finalEvent = `data: ${JSON.stringify({
      accumulated: JSON.stringify(accumulatedData),
      done: true
    } as StreamEvent)}\n\n`;

    res.write(finalEvent);
    res.end();
  } catch (error) {
    logger.error("Error in streaming response:", error);

    // Send error event
    const errorEvent = `data: ${JSON.stringify({
      error: error instanceof Error ? error.message : "Server error",
      done: true
    } as StreamEvent)}\n\n`;

    res.write(errorEvent);
    res.end();
  }
}

/**
 * Handle standard (non-streaming) response to client
 * @param _req - Express request (unused)
 * @param res - Express response
 * @param prompt - User prompt
 */
async function handleStandardResponse(_req: Request, res: Response, prompt: string): Promise<void> {
  try {
    const response = await openai.responses.create({
      model: config.openai.model,
      instructions: "You are an expert in industrial equipment and juice production systems. Generate a detailed juice production model based on the user's requirements. Return your response as a JSON object.",
      input: "Make a list of components related to " + prompt,
      text: {
        format: {
          type: "json_schema",
          name: "json_schema",
          schema: jsonSchema
        }
      },
      tools: [
        {
          "type": "file_search",
          "vector_store_ids": [
            "vs_681898d1e6e08191b2fcee9dab2faf8e"
          ]
        }
      ],
      stream: false
    });

    logger.info("OpenAI response received");

    // Check for valid response
    if (!response || !response.text) {
      throw new Error("Invalid OpenAI response format");
    }

    // The response.text might already be an object or a string
    let parsedContent: JuiceProductionModel;

    try {
      // Check if response.text is a string or an object
      if (typeof response.text === 'string') {
        try {
          parsedContent = JSON.parse(response.text) as JuiceProductionModel;
        } catch (parseError) {
          logger.error("Failed to parse OpenAI response as JSON:", parseError);
          throw new Error("Failed to parse OpenAI response as JSON");
        }
      } else {
        // If it's already an object, use it directly
        parsedContent = response.text as unknown as JuiceProductionModel;
      }

      // Validate the response against our schema
      try {
        juiceProductionSchema.parse(parsedContent);
        logger.debug("Successfully validated OpenAI response");
      } catch (validationError) {
        logger.error("Failed to validate OpenAI response against schema:", validationError);

        // If validation fails but we have a valid object, return it anyway
        // This is more lenient and allows the API to work even if the schema changes
        if (parsedContent && typeof parsedContent === 'object') {
          logger.warn("Returning unvalidated response object");
          res.status(200).json({
            success: true,
            data: parsedContent,
            error: null
          } as ApiResponse<JuiceProductionModel>);
          return;
        }

        throw new Error("Failed to validate OpenAI response against schema");
      }
    } catch (error) {
      logger.error("Error processing OpenAI response:", error);
      throw new Error("Failed to process OpenAI response");
    }

    res.status(200).json({
      success: true,
      data: parsedContent,
      error: null
    } as ApiResponse<JuiceProductionModel>);
  } catch (error) {
    logger.error("Error in standard response:", error);
    throw error;
  }
}

/**
 * Handle generic suggestion response
 */
async function handleGenericSuggestionResponse(
  _req: Request,
  res: Response,
  prompt: string,
  context: AISuggestionRequest['context']
): Promise<void> {
  try {
    const suggestionData = await generateGenericSuggestions(prompt, context);

    res.status(200).json({
      success: true,
      data: suggestionData,
      error: null
    } as AISuggestionResponse);

  } catch (error) {
    logger.error("Error in generic suggestion response:", error);
    throw error;
  }
}

/**
 * Generate generic suggestions based on context type
 */
async function generateGenericSuggestions(
  prompt: string,
  context: AISuggestionRequest['context']
): Promise<AISuggestionData> {
  const { type, availableOptions, metadata } = context;

  // Create context-specific system prompt
  const systemPrompt = createSystemPrompt(type, availableOptions, metadata);

  const response = await openai.chat.completions.create({
    model: config.openai.model,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `Generate ${type} suggestions for: "${prompt}"`
      }
    ],
    temperature: 0.1,
    max_tokens: 1000
  });

  logger.info(`OpenAI ${type} suggestion response received`);

  if (!response.choices || !response.choices[0] || !response.choices[0].message) {
    throw new Error("Invalid OpenAI response format");
  }

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  // Parse and transform the response based on context type
  return parseAndTransformResponse(content, type, availableOptions);
}

/**
 * Create context-specific system prompt
 */
function createSystemPrompt(
  type: string,
  availableOptions: Record<string, any[]>,
  metadata?: Record<string, any>
): string {
  const optionsText = Object.entries(availableOptions)
    .map(([key, values]) => `- ${key}: ${values.join(', ')}`)
    .join('\n');

  switch (type) {
    case 'filters':
      return `You are a filter generation assistant for a task management system. Your job is to convert natural language queries into structured filter objects.

Available filter types and their possible values:
${optionsText}

Rules:
1. Return valid JSON only
2. Use exact case-sensitive values from the lists above
3. Choose appropriate operators: "is", "is not", "is any of", "include", "do not include", "before", "after"
4. Provide confidence score (0-100)
5. List any unmatched criteria

Response format:
{
  "suggestions": [
    {
      "id": "filter-1",
      "label": "Status is Todo",
      "value": ["Todo"],
      "confidence": 85,
      "metadata": {
        "type": "Status",
        "operator": "is",
        "value": ["Todo"]
      }
    }
  ],
  "explanation": "Applied filter for todo items",
  "confidence": 85,
  "unmatchedCriteria": []
}`;

    case 'commands':
      return `You are a command generation assistant. Your job is to suggest relevant commands and actions based on user input.

Available command categories and actions:
${optionsText}

Rules:
1. Return valid JSON only
2. Use exact action names from the lists above
3. Provide confidence score (0-100)
4. Focus on action-oriented suggestions
5. List any unmatched criteria

Response format:
{
  "suggestions": [
    {
      "id": "cmd-1",
      "label": "New Meeting",
      "value": "New Meeting",
      "confidence": 90,
      "metadata": {
        "category": "Create",
        "action": "New Meeting"
      }
    }
  ],
  "explanation": "Suggested actions for scheduling",
  "confidence": 90,
  "unmatchedCriteria": []
}`;

    case 'navigation':
      return `You are a navigation assistant. Your job is to suggest relevant pages and destinations based on user input.

Available navigation options:
${optionsText}

Rules:
1. Return valid JSON only
2. Use exact page/section names from the lists above
3. Provide confidence score (0-100)
4. Focus on navigation destinations
5. List any unmatched criteria

Response format:
{
  "suggestions": [
    {
      "id": "nav-1",
      "label": "Dashboard",
      "value": "Dashboard",
      "confidence": 95,
      "metadata": {
        "type": "page",
        "destination": "Dashboard"
      }
    }
  ],
  "explanation": "Navigation suggestions for dashboard access",
  "confidence": 95,
  "unmatchedCriteria": []
}`;

    default:
      return `You are an AI assistant. Your job is to suggest relevant items based on user input.

Available options:
${optionsText}

Rules:
1. Return valid JSON only
2. Use exact values from the lists above when possible
3. Provide confidence score (0-100)
4. List any unmatched criteria

Response format:
{
  "suggestions": [
    {
      "id": "suggestion-1",
      "label": "Suggested Item",
      "value": "item-value",
      "confidence": 80,
      "metadata": {}
    }
  ],
  "explanation": "AI generated suggestions",
  "confidence": 80,
  "unmatchedCriteria": []
}`;
  }
}

/**
 * Parse and transform OpenAI response based on context type
 */
function parseAndTransformResponse(
  content: string,
  type: string,
  availableOptions: Record<string, any[]>
): AISuggestionData {
  try {
    // Extract JSON from response (handle code blocks)
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || [null, content];
    const jsonString = jsonMatch[1] || content;

    const parsedContent = JSON.parse(jsonString);

    // Validate the response structure
    if (!parsedContent.suggestions || !Array.isArray(parsedContent.suggestions)) {
      throw new Error("Invalid response structure: missing suggestions array");
    }

    // Ensure each suggestion has required fields and generate IDs if missing
    const transformedSuggestions = parsedContent.suggestions.map((suggestion: any, index: number) => ({
      id: suggestion.id || `${type}-${Date.now()}-${index}`,
      label: suggestion.label || suggestion.value || `Suggestion ${index + 1}`,
      value: suggestion.value,
      confidence: Math.min(100, Math.max(0, suggestion.confidence || 70)),
      metadata: suggestion.metadata || {}
    }));

    return {
      suggestions: transformedSuggestions,
      explanation: parsedContent.explanation || `AI generated ${type} suggestions`,
      confidence: Math.min(100, Math.max(0, parsedContent.confidence || 70)),
      unmatchedCriteria: parsedContent.unmatchedCriteria || []
    };

  } catch (parseError) {
    logger.error("Failed to parse OpenAI response:", parseError);

    // Fallback: generate basic suggestions from available options
    return generateFallbackSuggestions(type, availableOptions);
  }
}

/**
 * Generate fallback suggestions when AI parsing fails
 */
function generateFallbackSuggestions(
  type: string,
  availableOptions: Record<string, any[]>
): AISuggestionData {
  const suggestions: AISuggestionData['suggestions'] = [];

  // Take first few options from each category as fallback
  Object.entries(availableOptions).forEach(([category, options], categoryIndex) => {
    options.slice(0, 2).forEach((option, optionIndex) => {
      suggestions.push({
        id: `fallback-${type}-${categoryIndex}-${optionIndex}`,
        label: option,
        value: option,
        confidence: 50,
        metadata: { category, fallback: true }
      });
    });
  });

  return {
    suggestions: suggestions.slice(0, 5), // Limit to 5 fallback suggestions
    explanation: `Fallback ${type} suggestions (AI service unavailable)`,
    confidence: 50,
    unmatchedCriteria: []
  };
}
