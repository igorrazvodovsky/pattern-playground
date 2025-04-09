import { z } from "zod";
import { OpenAI } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

// Define the schema directly in the function file to avoid import issues
// Schema for each attribute in the "attributes" array
const attributeSchema = z.object({
  name: z.string(),
  label: z.string(),
  value: z.string(),
  unit: z.string().nullable()
});

// Schema for the actions in the "possibleActions" array
const actionSchema = z.object({
  actionName: z.string(),
  actionDescription: z.string()
});

// Schema for related objects
const relatedObjectSchema = z.object({
  referenceId: z.string(),
  relationshipType: z.string(),
  relationshipDescription: z.string()
});

// Schema for a single item in the flattened model.
const modelItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  label: z.string(),
  description: z.string(),
  path: z.array(z.string()),
  parentId: z.string().nullable(),
  childrenIds: z.array(z.string()),
  relationshipType: z.string().nullable(),
  relationshipDescription: z.string().nullable(),
  attributes: z.array(attributeSchema),
  rulesAndConstraints: z.array(z.string()),
  possibleActions: z.array(actionSchema),
  relatedObjects: z.array(relatedObjectSchema)
});

// Schema for the entire JSON file
const pasteurizerSchema = z.object({
  model: z.array(modelItemSchema)
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async function (event) {
  console.log("Received request with headers:", event.headers);

  // Extract origin for CORS
  const origin = event.headers.origin || event.headers.Origin || 'http://localhost:6006';
  console.log("Request origin:", origin);

  // Set CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin, // Explicitly use the requesting origin
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400' // 24 hours
  };

  // Add SSE headers for streaming responses
  const sseHeaders = {
    ...corsHeaders,
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  };

  console.log("Using CORS headers:", corsHeaders);

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log("Handling OPTIONS preflight request");
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (!event.body) {
    console.error("Error: Request body is undefined");
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing request body" })
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("Received request body:", body);

    if (!body.prompt) {
      console.error("Error: Prompt is missing in request body");
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Missing 'prompt' in request body" })
      };
    }

    const prompt = body.prompt;
    console.log("Processing prompt:", prompt);

    // Check if client requested streaming response
    const shouldStream = event.headers.accept && event.headers.accept.includes('text/event-stream');
    console.log("Streaming requested:", shouldStream);

    try {
      if (shouldStream) {
        // Handle streaming response
        return streamingResponse(prompt, sseHeaders);
      } else {
        // Handle non-streaming response (original implementation)
        return nonStreamingResponse(prompt, corsHeaders);
      }
    } catch (error) {
      console.error("OpenAI error:", error);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          data: null,
          error: error.message || "OpenAI call failed"
        })
      };
    }
  } catch (err) {
    console.error("General error:", err);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        data: null,
        error: err.message || "Server error"
      })
    };
  }
};

// Handle streaming response using OpenAI's streaming API
async function streamingResponse(prompt, headers) {
  // Initialize for accumulating content
  let accumulatedData = { model: [] };

  // Define response body function for Netlify streaming
  const responseBody = new ReadableStream({
    async start(controller) {
      try {
        // Call OpenAI API with streaming enabled
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              "role": "system",
              "content": "You are an expert in industrial equipment and pasteurization systems. Generate a detailed pasteurizer model based on the user's requirements. Return your response as a JSON object with model array that contains components."
            },
            {
              "role": "user",
              "content": "Make a list of components related to " + prompt
            }
          ],
          response_format: { type: "json_object" }, // We'll validate manually since we're streaming
          stream: true
        });

        let jsonBuffer = "";

        // Process each chunk from OpenAI
        for await (const chunk of stream) {
          // Extract content delta
          const content = chunk.choices[0]?.delta?.content || "";
          if (!content) continue;

          // Accumulate the JSON string
          jsonBuffer += content;

          try {
            // Try to parse the accumulated JSON string
            // This might fail until we have a complete, valid JSON
            const parsedJson = JSON.parse(jsonBuffer);

            // If parsing succeeded, update our accumulated data
            if (parsedJson && parsedJson.model && Array.isArray(parsedJson.model)) {
              // Update accumulated data
              accumulatedData = parsedJson;

              // Send event to client with current accumulated data
              const dataEvent = `data: ${JSON.stringify({
                accumulated: JSON.stringify({ model: parsedJson.model }),
                done: false
              })}\n\n`;

              controller.enqueue(new TextEncoder().encode(dataEvent));
            }
          } catch {
            // Parsing failed, continue accumulating until we have valid JSON
          }
        }

        // Send final event with complete accumulated data
        const finalEvent = `data: ${JSON.stringify({
          accumulated: JSON.stringify(accumulatedData),
          done: true
        })}\n\n`;

        controller.enqueue(new TextEncoder().encode(finalEvent));
        controller.close();
      } catch (error) {
        console.error("Streaming error:", error);

        // Send error event
        const errorEvent = `data: ${JSON.stringify({
          error: error.message || "Streaming error",
          done: true
        })}\n\n`;

        controller.enqueue(new TextEncoder().encode(errorEvent));
        controller.close();
      }
    }
  });

  return {
    statusCode: 200,
    headers,
    body: responseBody
  };
}

// Handle non-streaming response (original implementation)
async function nonStreamingResponse(prompt, headers) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        "role": "system",
        "content": "You are an expert in industrial equipment and pasteurization systems. Generate a detailed pasteurizer model based on the user's requirements. Return your response as a JSON object."
      },
      {
        "role": "user",
        "content": "Make a list of components related to " + prompt
      }
    ],
    response_format: zodResponseFormat(pasteurizerSchema, "component"),
    stream: false
  });

  console.log("OpenAI response received");

  if (!response.choices || !response.choices[0] || !response.choices[0].message) {
    throw new Error("Invalid OpenAI response format");
  }

  const content = response.choices[0].message.content;
  let parsedContent;

  try {
    parsedContent = JSON.parse(content);
    console.log("Successfully parsed OpenAI response");
  } catch (e) {
    console.error("Failed to parse OpenAI response:", e);
    throw new Error("Failed to parse OpenAI response");
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      data: parsedContent,
      error: null
    })
  };
}
