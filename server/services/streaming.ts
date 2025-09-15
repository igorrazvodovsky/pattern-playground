import { Response } from 'express';
import logger from '../logger.js';
import { JuiceProductionModel, ModelItem, TextLensStreamChunk } from '../schemas.js';
import { openaiService } from './openai.js';

export interface StreamEvent {
  newComponent?: ModelItem;
  accumulated?: string;
  error?: string;
  done: boolean;
}

export class StreamingService {
  static setupSSEHeaders(res: Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  }

  static async handleJuiceProductionStream(
    res: Response,
    prompt: string,
    signal?: AbortSignal
  ): Promise<void> {
    this.setupSSEHeaders(res);

    const accumulatedData: JuiceProductionModel = { model: [] };
    let jsonBuffer = "";

    try {
      const streamGenerator = openaiService.generateJuiceProductionStream(prompt, signal);

      for await (const chunk of streamGenerator) {
        const content = chunk.text || "";
        if (!content) continue;

        jsonBuffer += content;

        try {
          const parsedJson = JSON.parse(jsonBuffer) as JuiceProductionModel;

          if (parsedJson && parsedJson.model && Array.isArray(parsedJson.model)) {
            const newComponents = parsedJson.model.filter((component: ModelItem) =>
              !accumulatedData.model.some((existing: ModelItem) =>
                existing.id === component.id ||
                existing.component_name === component.component_name
              )
            );

            if (newComponents.length > 0) {
              for (const newComponent of newComponents) {
                accumulatedData.model.push(newComponent);

                const componentEvent = `data: ${JSON.stringify({
                  newComponent: newComponent,
                  accumulated: JSON.stringify(accumulatedData),
                  done: false
                } as StreamEvent)}\n\n`;

                res.write(componentEvent);

                await new Promise(resolve => setTimeout(resolve, 300));
              }
            }
          }
        } catch {
          logger.debug("JSON parsing failed, continuing to accumulate chunks");
        }
      }

      const finalEvent = `data: ${JSON.stringify({
        accumulated: JSON.stringify(accumulatedData),
        done: true
      } as StreamEvent)}\n\n`;

      res.write(finalEvent);
      res.end();
    } catch (error) {
      logger.error("Error in streaming response:", error);

      const errorEvent = `data: ${JSON.stringify({
        error: error instanceof Error ? error.message : "Server error",
        done: true
      } as StreamEvent)}\n\n`;

      res.write(errorEvent);
      res.end();
    }
  }

  static async handleTextLensStream(
    res: Response,
    request: unknown,
    signal?: AbortSignal
  ): Promise<void> {
    this.setupSSEHeaders(res);

    try {
      const streamGenerator = openaiService.generateTextLensStream(request as import('../schemas.js').TextLensRequest, signal);

      for await (const chunk of streamGenerator) {
        const content = chunk.text || "";

        if (content) {
          const streamChunk: TextLensStreamChunk = {
            type: 'chunk',
            content,
            done: false
          };

          res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
        }
      }

      const completionChunk: TextLensStreamChunk = {
        type: 'complete',
        done: true
      };

      res.write(`data: ${JSON.stringify(completionChunk)}\n\n`);
      res.end();

    } catch (error) {
      logger.error("Error in text lens streaming:", error);

      const errorChunk: TextLensStreamChunk = {
        type: 'error',
        error: error instanceof Error ? error.message : "Server error",
        done: true
      };

      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
      res.end();
    }
  }
}