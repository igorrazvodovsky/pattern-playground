import { Response } from 'express';
import logger from '../logger.js';
import { TextLensStreamChunk, ExplanationRequest, ExplanationStreamChunk } from '../schemas.js';
import { openaiService } from './openai.js';

export class StreamingService {
  static setupSSEHeaders(res: Response): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
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

  static async handleExplanationStream(
    res: Response,
    request: ExplanationRequest,
    signal?: AbortSignal
  ): Promise<void> {
    this.setupSSEHeaders(res);

    try {
      const streamGenerator = openaiService.generateExplanationStream(request, signal);

      for await (const chunk of streamGenerator) {
        const content = chunk.text || "";

        if (content) {
          const streamChunk: ExplanationStreamChunk = {
            type: 'chunk',
            content,
            done: false
          };

          res.write(`data: ${JSON.stringify(streamChunk)}\n\n`);
        }
      }

      const completionChunk: ExplanationStreamChunk = {
        type: 'complete',
        done: true
      };

      res.write(`data: ${JSON.stringify(completionChunk)}\n\n`);
      res.end();

    } catch (error) {
      logger.error("Error in explanation streaming:", error);

      const errorChunk: ExplanationStreamChunk = {
        type: 'error',
        error: error instanceof Error ? error.message : "Server error",
        done: true
      };

      res.write(`data: ${JSON.stringify(errorChunk)}\n\n`);
      res.end();
    }
  }
}