const isStorybook = window.location.port === "6006";

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

  // Use local mock data for Storybook during development
  if (isStorybook) {
    console.log("Using local mock implementation for Storybook");
    return mockOpenAICall(prompt, { stream, onChunk });
  }

  const endpoint = "/.netlify/functions/generate";

  console.log("Using endpoint:", endpoint);
  console.log("Sending prompt:", prompt);
  console.log("Streaming mode:", stream);

  try {
    const payload = JSON.stringify({ prompt });
    console.log("Request payload:", payload);

    // For Storybook local development, we need these specific CORS settings
    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": stream ? "text/event-stream" : "application/json"
      },
      mode: 'cors',
      credentials: 'same-origin',
      body: payload
    };

    console.log("Fetch options:", fetchOptions);

    const response = await fetch(endpoint, fetchOptions);

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries([...response.headers.entries()]));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);

      // Special handling for CORS errors
      if (response.status === 0 || (response.status === 500 && errorText.includes("CORS"))) {
        // If we detect a potential CORS issue with the streaming API, try fallback to mock data
        console.warn("Possible CORS issue detected - falling back to mock data");

        return mockOpenAICall(prompt, { stream, onChunk });
      }

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

        // If streaming fails, try to get the response as JSON
        try {
          const data = await response.clone().json();
          console.log("Fallback JSON response after streaming error:", data);
          if (onChunk) {
            const jsonStr = JSON.stringify(data);
            onChunk(jsonStr, true);
          }
          return data;
        } catch (err) {
          console.warn("Failed to get fallback JSON after streaming error:", err);
          throw error;
        }
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
 * Mock implementation of OpenAI API call for local development
 * @param {string} prompt - The prompt to send
 * @param {Object} options - Options (stream, onChunk)
 * @returns {Promise<Object>} Mock response
 */
async function mockOpenAICall(prompt, options = {}) {
  console.log("Using mock OpenAI implementation for prompt:", prompt);
  const { stream = false, onChunk = null } = options;

  // Generate mock components based on the prompt
  const mockData = generateMockDataForPrompt(prompt);

  if (stream && onChunk) {
    // Simulate streaming by sending chunks with delays
    console.log("Simulating streaming response");

    // Send components one by one with delays
    const componentsCount = mockData.model.length;

    for (let i = 0; i < componentsCount; i++) {
      // Each chunk has all previous components
      const partialModel = {
        model: mockData.model.slice(0, i + 1)
      };

      // Use setTimeout to simulate network delay
      await new Promise(resolve => {
        setTimeout(() => {
          console.log(`Sending mock chunk ${i + 1}/${componentsCount}`);
          onChunk(JSON.stringify(partialModel), i === componentsCount - 1);
          resolve();
        }, 800); // Delay between components
      });
    }

    return mockData;
  } else {
    // Non-streaming mode
    if (onChunk) {
      onChunk(JSON.stringify(mockData), true);
    }
    return mockData;
  }
}

/**
 * Generate mock data based on the prompt
 * @param {string} prompt - The search prompt
 * @returns {Object} - Mock data with components related to the prompt
 */
function generateMockDataForPrompt(prompt) {
  // Create base components that will always be included
  const baseComponents = [
    {
      id: "component-1",
      type: "Component",
      name: "Mock Component",
      description: `This is a mock component related to "${prompt}".`,
    }
  ];

  // Add more specific components based on the prompt
  let specificComponents = [];

  if (prompt.toLowerCase().includes("heat exchanger")) {
    specificComponents = [
      {
        id: "heat-exchanger-1",
        type: "HeatExchanger",
        name: "Plate Heat Exchanger",
        description: "Efficient heat transfer device using metal plates to transfer heat between two fluids.",
        attributes: [
          { name: "material", label: "Material", value: "Stainless Steel", unit: null },
          { name: "max_temp", label: "Maximum Temperature", value: "180", unit: "°C" }
        ]
      },
      {
        id: "heat-exchanger-2",
        type: "HeatExchanger",
        name: "Shell and Tube Heat Exchanger",
        description: "Heat exchanger design with tubes inside a shell, allowing heat transfer between fluids.",
        attributes: [
          { name: "material", label: "Material", value: "Carbon Steel", unit: null },
          { name: "max_temp", label: "Maximum Temperature", value: "250", unit: "°C" }
        ]
      },
      {
        id: "pump-1",
        type: "Pump",
        name: "Circulation Pump",
        description: "Circulates fluid through the heat exchanger system.",
        attributes: [
          { name: "flow_rate", label: "Flow Rate", value: "500", unit: "L/min" }
        ]
      }
    ];
  } else if (prompt.toLowerCase().includes("pasteurizer")) {
    specificComponents = [
      {
        id: "pasteurizer-1",
        type: "Pasteurizer",
        name: "HTST Pasteurizer",
        description: "High-Temperature Short-Time pasteurizer for liquid food products.",
        attributes: [
          { name: "capacity", label: "Capacity", value: "5000", unit: "L/hr" }
        ]
      },
      {
        id: "pasteurizer-2",
        type: "Pasteurizer",
        name: "UHT Processing Unit",
        description: "Ultra-High Temperature processing unit for extended shelf life products.",
        attributes: [
          { name: "temp", label: "Processing Temperature", value: "135", unit: "°C" }
        ]
      }
    ];
  } else {
    // Generic components for any other prompt
    specificComponents = [
      {
        id: "generic-1",
        type: "GenericComponent",
        name: `${prompt} Processing Unit`,
        description: `Main processing unit for ${prompt} applications.`,
        attributes: [
          { name: "capacity", label: "Capacity", value: "1000", unit: "kg/hr" }
        ]
      },
      {
        id: "generic-2",
        type: "GenericComponent",
        name: `${prompt} Controller`,
        description: `Electronic control system for ${prompt} processes.`,
        attributes: [
          { name: "interface", label: "Interface", value: "Touchscreen", unit: null }
        ]
      }
    ];
  }

  // Return the combined components
  return {
    model: [...baseComponents, ...specificComponents]
  };
}
