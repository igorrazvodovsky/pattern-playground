import { OpenAI } from 'openai';
import { Request, Response, Application } from 'express';
import logger from './logger.js';
import config from './config.js';
import { pasteurizerSchema, jsonSchema, PasteurizerModel, ModelItem } from './schemas.js';

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
  const accumulatedData: PasteurizerModel = { model: [] };
  let jsonBuffer = "";

  try {
    // Call OpenAI API with streaming enabled
    const stream = await openai.responses.create({
      model: config.openai.model,
      instructions: "You are an expert in industrial equipment and pasteurization systems. Generate a detailed pasteurizer model based on the user's requirements. Return your response as a JSON object with model array that contains components. Generate each component one by one for streaming purposes.",
      input: "Make a list of components related to " + prompt,
      text: {
        format: {
          type: "json_schema",
          name: "json_schema",
          schema: jsonSchema
        }
      },
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
        const parsedJson = JSON.parse(jsonBuffer) as PasteurizerModel;

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
      instructions: "You are an expert in industrial equipment and pasteurization systems. Generate a detailed pasteurizer model based on the user's requirements. Return your response as a JSON object.",
      input: "Make a list of components related to " + prompt,
      text: {
        format: {
          type: "json_schema",
          name: "json_schema",
          schema: jsonSchema
        }
      },
      stream: false
    });

    logger.info("OpenAI response received");

    // Check for valid response
    if (!response || !response.text) {
      throw new Error("Invalid OpenAI response format");
    }

    // The response.text might already be an object or a string
    let parsedContent: PasteurizerModel;

    try {
      // Check if response.text is a string or an object
      if (typeof response.text === 'string') {
        try {
          parsedContent = JSON.parse(response.text) as PasteurizerModel;
        } catch (parseError) {
          logger.error("Failed to parse OpenAI response as JSON:", parseError);
          throw new Error("Failed to parse OpenAI response as JSON");
        }
      } else {
        // If it's already an object, use it directly
        parsedContent = response.text as unknown as PasteurizerModel;
      }

      // Validate the response against our schema
      try {
        pasteurizerSchema.parse(parsedContent);
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
          } as ApiResponse<PasteurizerModel>);
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
    } as ApiResponse<PasteurizerModel>);
  } catch (error) {
    logger.error("Error in standard response:", error);
    throw error;
  }
}
