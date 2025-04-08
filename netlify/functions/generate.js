import { OpenAI } from "openai";
import { pasteurizerSchema } from "./../../src/stories/patterns/FocusAndContext/types";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async function (event) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': 'http://localhost:6006',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (!event.body) {
    console.error("Error: Request body is undefined");
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing request body" })
    };
  }

  try {
    const body = JSON.parse(event.body);

    if (!body.prompt) {
      console.error("Error: Prompt is missing in request body");
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing 'prompt' in request body" })
      };
    }

    const prompt = body.prompt;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { "role": "system", "content": "You are an expert in industrial equipment and pasteurization systems. Generate a detailed pasteurizer model based on the user's requirements. Return your response as a JSON object." },
        { "role": "user", "content": "make a list of components related to" + prompt }
      ],
      response_format: zodResponseFormat(pasteurizerSchema, "component")
    });

    // Log the response structure to help debug
    console.log("Response structure:", JSON.stringify(response, null, 2));

    // For Chat Completions API, the response is in choices[0].message.content
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: response.choices[0].message.content
      })
    };
  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "OpenAI call failed", details: err.message })
    };
  }
};
