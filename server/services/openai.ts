import { OpenAI } from 'openai';
import config from '../config.js';
import logger from '../logger.js';
import { JuiceProductionModel, TextLensRequest, jsonSchema } from '../schemas.js';
import { PromptTemplateBuilder, PROMPT_CONFIGS } from './promptTemplates.js';

export interface OpenAIServiceConfig {
  apiKey: string;
  model: string;
}

export interface AISuggestionRequest {
  prompt: string;
  context: {
    type: 'filters' | 'commands' | 'navigation' | 'actions' | string;
    availableOptions: Record<string, any[]>;
    metadata?: Record<string, any>;
  };
}

export interface AISuggestionData {
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

export interface StreamChunk {
  text?: string;
}

export class OpenAIService {
  private client: OpenAI;

  constructor(config?: OpenAIServiceConfig) {
    const serviceConfig = config || {
      apiKey: process.env.OPENAI_API_KEY!,
      model: process.env.OPENAI_MODEL || 'gpt-4.1'
    };

    this.client = new OpenAI({
      apiKey: serviceConfig.apiKey
    });
  }

  async generateJuiceProduction(prompt: string, signal?: AbortSignal): Promise<JuiceProductionModel> {
    try {
      const response = await this.client.responses.create({
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
      }, signal ? { signal } : {});

      logger.info("OpenAI response received");

      if (!response || !response.text) {
        throw new Error("Invalid OpenAI response format");
      }

      let parsedContent: JuiceProductionModel;

      try {
        parsedContent = (typeof response.text === 'string')
          ? JSON.parse(response.text) as JuiceProductionModel
          : response.text as unknown as JuiceProductionModel;

        return parsedContent;
      } catch (error) {
        logger.error("Error processing OpenAI response:", error);
        throw new Error("Failed to process OpenAI response");
      }
    } catch (error) {
      logger.error("Error in juice production generation:", error);
      throw error;
    }
  }

  async *generateJuiceProductionStream(prompt: string, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    try {
      const stream = await this.client.responses.create({
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
      }, signal ? { signal } : {});

      for await (const chunk of stream) {
        const chunkData = chunk as unknown as StreamChunk;
        const content = chunkData.text || "";
        if (content) {
          yield { text: content };
        }
      }
    } catch (error) {
      logger.error("Error in streaming juice production generation:", error);
      throw error;
    }
  }

  async generateSuggestions(
    prompt: string,
    context: AISuggestionRequest['context'],
    signal?: AbortSignal
  ): Promise<AISuggestionData> {
    const { type, availableOptions, metadata } = context;

    const systemPrompt = this.createSystemPrompt(type, availableOptions, metadata);

    const response = await this.client.chat.completions.create({
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
      max_tokens: 1000,
      response_format: { type: "json_object" }
    }, { signal });

    logger.info(`OpenAI ${type} suggestion response received`);

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    return this.parseAndTransformResponse(content, type, availableOptions);
  }

  async *generateTextLensStream(request: TextLensRequest, signal?: AbortSignal): AsyncGenerator<StreamChunk> {
    const zoomPrompt = this.createZoomPrompt(request);

    try {
      const stream = await this.client.responses.create({
        model: config.openai.model,
        instructions: "You are a text transformation specialist. Provide direct text transformations without introductions, acknowledgments, or explanations. Begin immediately with the transformed content.",
        input: zoomPrompt,
        stream: true
      }, signal ? { signal } : {});

      for await (const chunk of stream) {
        const chunkData = chunk as unknown as StreamChunk;
        const content = chunkData.text || "";
        if (content) {
          yield { text: content };
        }
      }
    } catch (error) {
      logger.error("Error in text lens streaming:", error);
      throw error;
    }
  }

  private createSystemPrompt(
    type: string,
    availableOptions: Record<string, any[]>,
    _metadata?: Record<string, any>
  ): string {
    const config = PROMPT_CONFIGS[type];
    return PromptTemplateBuilder.buildSystemPrompt(type, availableOptions, config);
  }

  private parseAndTransformResponse(
    content: string,
    type: string,
    availableOptions: Record<string, any[]>
  ): AISuggestionData {
    try {
      const parsedContent = JSON.parse(content);

      if (!parsedContent.suggestions || !Array.isArray(parsedContent.suggestions)) {
        throw new Error("Invalid response structure: missing suggestions array");
      }

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
      return this.generateFallbackSuggestions(type, availableOptions);
    }
  }

  private generateFallbackSuggestions(
    type: string,
    availableOptions: Record<string, any[]>
  ): AISuggestionData {
    const suggestions: AISuggestionData['suggestions'] = [];

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
      suggestions: suggestions.slice(0, 5),
      explanation: `Fallback ${type} suggestions (AI service unavailable)`,
      confidence: 50,
      unmatchedCriteria: []
    };
  }

  private createZoomPrompt(request: TextLensRequest): string {
    const { text, context, direction } = request;

    let prompt: string;

    if (direction === 'in') {
      prompt = `Expand this text by adding relevant detail, context, or specificity. Keep the same meaning but make it more elaborate:\n\n"${text}"\n\nExpanded version:`;
    } else {
      prompt = `Condense this text while preserving its essential meaning. Make it more concise and direct:\n\n"${text}"\n\nCondensed version:`;
    }

    if (context) {
      prompt += `\n\nSurrounding context: ${context}`;
    }

    prompt += `\n\nOutput only the transformed text without any preamble, explanation, or meta-commentary.`;

    return prompt;
  }
}

export const openaiService = new OpenAIService();