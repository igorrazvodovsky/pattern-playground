import { OpenAI } from "openai";

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
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: response.choices[0].message.content })
    };
  } catch (err) {
    console.error("OpenAI error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "OpenAI call failed" })
    };
  }
};