/**
 * Calls the OpenAI API with the given prompt
 * @param {string} prompt - The prompt to send to OpenAI
 * @param {Object} options - Additional options
 * @param {boolean} options.stream - Whether to stream the response
 * @param {Function} options.onChunk - Callback for each chunk when streaming
 * @returns {Promise<string>} The response from OpenAI
 */
export async function callOpenAI(prompt, options = {}) {
  if (!prompt || typeof prompt !== 'string') {
    console.error("Invalid prompt:", prompt);
    throw new Error("Prompt must be a non-empty string");
  }

  const { stream = false, onChunk = null } = options;

  // Use Express backend endpoint
  const endpoint = getApiEndpoint();
  console.log("Using API endpoint:", endpoint);
  console.log("Sending prompt:", prompt);
  console.log("Streaming mode:", stream);

  try {
    const payload = JSON.stringify({ prompt });
    console.log("Request payload:", payload);

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": stream ? "text/event-stream" : "application/json"
      },
      mode: 'cors',
      credentials: 'include',
      body: payload
    };

    console.log("Fetch options:", fetchOptions);

    const response = await fetch(endpoint, fetchOptions);

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }

    // Handle streaming response
    if (stream && onChunk && response.body) {
      try {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        let chunksReceived = false;

        // Process the stream
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          chunksReceived = true;
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          console.log("Raw chunk:", chunk);

          // First, check if the chunk is a direct JSON response rather than SSE format
          if (chunk.trim().startsWith('{') && !chunk.includes('data: ')) {
            try {
              console.log("Detected direct JSON response instead of SSE format");
              const jsonData = JSON.parse(chunk);
              console.log("Parsed direct JSON response:", jsonData);

              // Update the accumulated content
              accumulatedContent = chunk;

              // Call the callback with the complete content
              onChunk(accumulatedContent, true);

              // We're done processing since we got the full response
              return accumulatedContent;
            } catch (e) {
              console.warn("Failed to parse direct JSON response:", e);
            }
          }

          // Process SSE format (data: {...}\n\n)
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.substring(6));
                console.log("Parsed event data:", eventData);

                if (eventData.error) {
                  console.error("Stream error:", eventData.error);
                  throw new Error(eventData.error);
                }

                if (eventData.done) {
                  // Final accumulated content
                  accumulatedContent = eventData.accumulated;
                  console.log("Stream complete, final content:", accumulatedContent);
                  onChunk(accumulatedContent, true);
                  break;
                }

                if (eventData.accumulated) {
                  // Update accumulated content
                  accumulatedContent = eventData.accumulated;
                  console.log("Updated accumulated content:", accumulatedContent);
                  // Call the callback with the current accumulated content
                  onChunk(accumulatedContent, false);
                }
              } catch (e) {
                console.warn("Error parsing SSE data:", e, line);
              }
            }
          }
        }

        // If we completed the stream but didn't receive any chunks,
        // we should try to handle it as a non-streaming response
        if (!chunksReceived) {
          console.log("No chunks received in stream, falling back to JSON response");
          try {
            const data = await response.clone().json();
            console.log("Fallback JSON response:", data);
            if (onChunk) {
              const jsonStr = JSON.stringify(data);
              onChunk(jsonStr, true);
            }
            return data;
          } catch (err) {
            console.warn("Failed to parse fallback response as JSON:", err);
            return accumulatedContent;
          }
        }

        return accumulatedContent;
      } catch (error) {
        console.error("Error processing stream:", error);
        throw error;
      }
    }

    // Handle regular JSON response (non-streaming)
    try {
      const data = await response.json();
      console.log("Regular JSON response:", data);

      if (stream && onChunk) {
        // Call the onChunk function with the non-streaming response
        // to maintain consistent behavior even without streaming
        const jsonStr = JSON.stringify(data.data);
        onChunk(jsonStr, true);
        return jsonStr;
      }

      return data.data || data;
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw error;
    }
  } catch (error) {
    console.error("Network or parsing error:", error);
    throw error;
  }
}

/**
 * Get the appropriate API endpoint based on environment
 * @returns {string} API endpoint URL
 */
function getApiEndpoint() {
  // Development environment
  if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
    return 'http://localhost:3000/api/generate';
  }

  // Production environment - adjust as needed
  return '/api/generate';
}
