import { OpenAI } from 'openai';
import config from '../config.js';
import logger from '../logger.js';
import {
  JuiceProductionModel,
  TextLensRequest,
  ExplanationRequest,
  TimelineGrouping,
  TimelineGroupingRequest,
  jsonSchema
} from '../schemas.js';
import { PromptTemplateBuilder, PROMPT_CONFIGS } from './promptTemplates.js';

type JsonPrimitive = string | number | boolean | null;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

export interface OpenAIServiceConfig {
  apiKey: string;
  model: string;
}

export interface AISuggestionRequest {
  prompt: string;
  context: {
    type: 'filters' | 'commands' | 'navigation' | 'actions' | string;
    availableOptions: Record<string, (string | number | boolean)[]>;
    metadata?: Record<string, JsonValue>;
  };
}

export interface AISuggestionData {
  suggestions: Array<{
    id: string;
    label: string;
    value: string | number | boolean;
    confidence: number;
    metadata?: Record<string, JsonValue>;
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
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo'
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
    const { type, availableOptions } = context;

    const systemPrompt = this.createSystemPrompt(type, availableOptions);

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

  /**
   * Group a run of dated records into named episodes, and those into phases.
   * The point of asking a model rather than the calendar is that the chunks
   * follow what happened — a fire and its aftermath, a scale-up — and each one
   * gets a sentence that explains it instead of counting it.
   */
  async groupTimeline(
    request: TimelineGroupingRequest,
    signal?: AbortSignal
  ): Promise<TimelineGrouping> {
    const { records, subject } = request;

    /* Episodes are named by where they *start*, not by listing their members:
       the records are contiguous and in order, so a boundary is enough, and
       the reply stays short enough that a long timeline can't run the response
       into the token ceiling and lose its tail. */
    const systemPrompt = [
      'You segment a chronological record into a three-level hierarchy for a',
      'zoomable timeline. Return JSON of the shape',
      '{"phases":[{"title","summary",',
      '"episodes":[{"title","summary","startId"}]}]}.',
      'Every level is the same kind of thing at a different grain: a stretch',
      'of the record, named, and said in one sentence. A phase covers a',
      'chapter of the run; an episode covers a handful of records. Do not',
      'summarise the whole run: the reader can see its whole extent already,',
      'and a sentence that covers everything says nothing.',
      'Rules:',
      '- An episode runs from its startId until the next episode begins, so',
      '  give boundaries only; never list the records an episode contains.',
      '- The first episode of the first phase must start at the first record.',
      '- startIds must increase strictly down the whole reply, across phases',
      '  as well as within them: a later episode never starts at an earlier',
      '  record than the one before it.',
      '- Give 6 to 10 episodes in all, grouped into 3 or 4 phases, and spread',
      '  them evenly. An episode covers between 2 and 5 records: it is opened',
      '  into its records as rows, so a longer one overruns the frame and a',
      '  one-record episode is a name for something that already has one.',
      '- Segment by what happened, not by the calendar: a run of related',
      '  events belongs together even if it straddles a month boundary.',
      '- A title is at most five words and names the episode, not its dates.',
      '- A summary is one sentence saying what happened and why it mattered.',
      '  Never restate the count or the total — the interface shows those.',
      '- A coarser summary is a synthesis, not a repetition: a phase must say',
      '  something its episodes do not already say one by one. The reader sees',
      '  a stretch at exactly one grain at a time, so a sentence that only',
      '  echoes the grain below it tells them nothing.',
      '- Use plain past-tense prose. No markdown, no bullet points.'
    ].join('\n');

    const lines = records
      .map((record) => {
        const amount = record.amount === undefined ? '' : ` (${record.amount})`;
        const category = record.category ? ` [${record.category}]` : '';
        return `${record.id} ${record.date}${category} ${record.label}${amount}`;
      })
      .join('\n');

    const response = await this.client.chat.completions.create({
      /* The fast model, not the configured default: this call sits in front of
         a view the reader is waiting on, and segmenting a list they can
         already see is not work the larger model does better. */
      model: config.openai.fastModel,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `${subject ? `${subject}\n\n` : ''}${lines}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1200,
      response_format: { type: 'json_object' }
    }, { signal });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    logger.info(`OpenAI timeline grouping received for ${records.length} records`);
    return JSON.parse(content) as TimelineGrouping;
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
    availableOptions: Record<string, (string | number | boolean)[]>
  ): string {
    const config = PROMPT_CONFIGS[type];
    return PromptTemplateBuilder.buildSystemPrompt(type, availableOptions, config);
  }

  private parseAndTransformResponse(
    content: string,
    type: string,
    availableOptions: Record<string, (string | number | boolean)[]>
  ): AISuggestionData {
    try {
      const parsedContent = JSON.parse(content);

      if (!parsedContent.suggestions || !Array.isArray(parsedContent.suggestions)) {
        throw new Error("Invalid response structure: missing suggestions array");
      }

      const transformedSuggestions = parsedContent.suggestions.map((suggestion: unknown, index: number) => {
        const suggestionRecord = suggestion as Record<string, unknown>;
        return {
          id: suggestionRecord.id || `${type}-${Date.now()}-${index}`,
          label: suggestionRecord.label || suggestionRecord.value || `Suggestion ${index + 1}`,
          value: suggestionRecord.value,
          confidence: Math.min(100, Math.max(0, (suggestionRecord.confidence as number) || 70)),
          metadata: suggestionRecord.metadata || {}
        };
      });

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
    availableOptions: Record<string, (string | number | boolean)[]>
  ): AISuggestionData {
    const suggestions: AISuggestionData['suggestions'] = [];

    Object.entries(availableOptions).forEach(([category, options], categoryIndex) => {
      options.slice(0, 2).forEach((option, optionIndex) => {
        suggestions.push({
          id: `fallback-${type}-${categoryIndex}-${optionIndex}`,
          label: String(option),
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

  async *generateExplanationStream(
    request: ExplanationRequest,
    signal?: AbortSignal
  ): AsyncGenerator<StreamChunk> {
    const systemPrompt = `You are an expert explainer. Provide clear, concise explanations for the given text.
If references are provided, incorporate them into your explanation to provide richer context.`;

    const userPrompt = this.buildExplanationPrompt(request);

    try {
      const stream = await this.client.chat.completions.create({
        model: config.openai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      }, { signal });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield { text: content };
        }
      }
    } catch (error) {
      logger.error("Error in explanation streaming:", error);
      throw error;
    }
  }

  private buildExplanationPrompt(request: ExplanationRequest): string {
    let prompt = `Please explain the following text:\n\n"${request.text}"`;

    if (request.references && request.references.length > 0) {
      prompt += '\n\nRelevant references:';
      for (const ref of request.references) {
        prompt += `\n- ${ref.label} (${ref.type})`;
        if (ref.metadata) {
          prompt += `: ${JSON.stringify(ref.metadata)}`;
        }
      }
    }

    if (request.context) {
      prompt += `\n\nAdditional context: ${request.context}`;
    }

    return prompt;
  }
}

export const openaiService = new OpenAIService();