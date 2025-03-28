const isStorybook = window.location.port === "6006";

/**
 * Calls the OpenAI API with the given prompt
 * @param {string} prompt - The prompt to send to OpenAI
 * @returns {Promise<string>} The response from OpenAI
 */
export async function callOpenAI(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    console.error("Invalid prompt:", prompt);
    throw new Error("Prompt must be a non-empty string");
  }

  const endpoint = isStorybook
    ? "http://localhost:8888/.netlify/functions/generate"
    : "/.netlify/functions/generate";

  console.log("Using endpoint:", endpoint);
  console.log("Sending prompt:", prompt);

  try {
    const payload = JSON.stringify({ prompt });
    console.log("Request payload:", payload);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: payload
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Network or parsing error:", error);
    throw error;
  }
}