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
interface FilterGenerationRequest {
  prompt: string;
  availableFilters: string[];
  availableValues: Record<string, string[]>;
}

interface FilterGenerationResponse {
  suggestedFilters: Array<{
    type: string;
    operator: string;
    value: string[];
  }>;
  explanation: string;
  confidence: number;
  unmatchedCriteria?: string[];
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

  // New filter generation endpoint
  app.post('/api/generate-filters', async (req: Request, res: Response): Promise<void> => {
    logger.debug("Received filter generation request:", req.body);

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

    const { prompt, availableFilters, availableValues }: FilterGenerationRequest = req.body;
    logger.info(`Processing filter generation prompt: "${prompt}"`);

    try {
      await handleFilterGenerationResponse(req, res, prompt, availableFilters, availableValues);
    } catch (error) {
      logger.error("Error processing filter generation request:", error);
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
 * Handle filter generation response
 */
async function handleFilterGenerationResponse(
  _req: Request,
  res: Response,
  prompt: string,
  _availableFilters: string[],
  availableValues: Record<string, string[]>
): Promise<void> {
  try {
    const systemPrompt = `You are a filter generation assistant for a task management system. Your job is to convert natural language queries into structured filter objects.

Available filter types and their possible values:
${Object.entries(availableValues).map(([type, values]) => `- ${type}: ${values.join(', ')}`).join('\n')}

Rules:
1. Return valid JSON only
2. Use exact case-sensitive values from the lists above
3. Choose appropriate operators: "is", "is not", "is any of", "include", "do not include", "before", "after"
4. Provide confidence score (0-100)
5. List any unmatched criteria

Response format:
{
  "suggestedFilters": [
    {
      "type": "Status",
      "operator": "is",
      "value": ["Todo"]
    }
  ],
  "explanation": "Applied filter for todo items",
  "confidence": 85,
  "unmatchedCriteria": []
}`;

    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Convert this filtering request into structured filters: "${prompt}"`
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    logger.info("OpenAI filter generation response received");

    if (!response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error("Invalid OpenAI response format");
    }

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON response
    let parsedContent: FilterGenerationResponse;
    try {
      // Extract JSON from response (handle code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || [null, content];
      const jsonString = jsonMatch[1] || content;

      parsedContent = JSON.parse(jsonString) as FilterGenerationResponse;

      // Validate the response structure
      if (!parsedContent.suggestedFilters || !Array.isArray(parsedContent.suggestedFilters)) {
        throw new Error("Invalid response structure: missing suggestedFilters array");
      }

      logger.debug("Successfully parsed filter generation response");
    } catch (parseError) {
      logger.error("Failed to parse OpenAI filter response:", parseError);
      throw new Error("Failed to parse AI response");
    }

    res.status(200).json({
      success: true,
      data: parsedContent,
      error: null
    } as ApiResponse<FilterGenerationResponse>);

  } catch (error) {
    logger.error("Error in filter generation response:", error);
    throw error;
  }
}
