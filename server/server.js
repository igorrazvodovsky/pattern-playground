const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { z } = require('zod');
const { OpenAI } = require('openai');
const { zodResponseFormat } = require('openai/helpers/zod');

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Define schemas (same as in the Netlify function)
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
  relationshipType: z.string(),
  relationshipDescription: z.string(),
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

// Middleware
app.use(bodyParser.json());

// Configure CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    // For storybook development and production environments
    const allowedOrigins = [
      'http://localhost:6006', // Storybook
      'http://localhost:3000', // Development
      // Add your production domains here
    ];

    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Generation endpoint - replaces the Netlify function
app.post('/api/generate', async (req, res) => {
  console.log("Received request body:", req.body);

  // Validate request
  if (!req.body || !req.body.prompt) {
    console.error("Error: Prompt is missing in request body");
    return res.status(400).json({
      success: false,
      data: null,
      error: "Missing 'prompt' in request body"
    });
  }

  const prompt = req.body.prompt;
  console.log("Processing prompt:", prompt);

  // Check if client requested streaming response
  const shouldStream = req.headers.accept && req.headers.accept.includes('text/event-stream');
  console.log("Streaming requested:", shouldStream);

  try {
    if (shouldStream) {
      // Set headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      // Initialize for accumulating content
      let accumulatedData = { model: [] };
      let jsonBuffer = "";

      // Call OpenAI API with streaming enabled
      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            "role": "system",
            "content": "You are an expert in industrial equipment and pasteurization systems. Generate a detailed pasteurizer model based on the user's requirements. Return your response as a JSON object with model array that contains components. Generate each component one by one for streaming purposes."
          },
          {
            "role": "user",
            "content": "Make a list of components related to " + prompt
          }
        ],
        response_format: zodResponseFormat(pasteurizerSchema, "component"),
        stream: true
      });

      // Process each chunk from OpenAI
      for await (const chunk of stream) {
        // Extract content delta
        const content = chunk.choices[0]?.delta?.content || "";
        if (!content) continue;

        // Accumulate the JSON string
        jsonBuffer += content;

        try {
          // Try to parse the accumulated JSON string
          const parsedJson = JSON.parse(jsonBuffer);

          // If parsing succeeded, update our accumulated data
          if (parsedJson && parsedJson.model && Array.isArray(parsedJson.model)) {
            // Find new components that weren't in the previous accumulated data
            const newComponents = parsedJson.model.filter(component =>
              !accumulatedData.model.some(existing =>
                existing.id === component.id ||
                existing.component_name === component.component_name
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
                })}\n\n`;

                res.write(componentEvent);

                // Add a slight delay to simulate more granular streaming
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            }
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

      res.write(finalEvent);
      res.end();
    } else {
      // Non-streaming response
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

      res.status(200).json({
        success: true,
        data: parsedContent,
        error: null
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: error.message || "Server error"
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});