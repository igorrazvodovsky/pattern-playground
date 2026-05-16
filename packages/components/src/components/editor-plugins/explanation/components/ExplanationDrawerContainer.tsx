import React, { useState, useEffect } from 'react';
import { ExplanationDrawer } from './ExplanationDrawer';
import type { SelectedReference } from '../../../reference/types';
import type { EventBus } from '../../../editor/types';

interface ExplanationDrawerContainerProps {
  initialText: string;
  initialReferences: SelectedReference[];
  eventBus: EventBus;
}

function isStartedPayload(payload: unknown): payload is { text: string; references?: SelectedReference[]; range: { from: number; to: number } } {
  return typeof payload === 'object' && payload !== null &&
    'text' in payload && typeof (payload as Record<string, unknown>).text === 'string' &&
    'range' in payload && typeof (payload as Record<string, unknown>).range === 'object';
}

function isChunkPayload(payload: unknown): payload is { content: string } {
  return typeof payload === 'object' && payload !== null &&
    'content' in payload && typeof (payload as Record<string, unknown>).content === 'string';
}

export function ExplanationDrawerContainer({
  initialText,
  initialReferences,
  eventBus
}: ExplanationDrawerContainerProps) {
  const [text, setText] = useState(initialText);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [references, setReferences] = useState<SelectedReference[]>(initialReferences);

  useEffect(() => {
    const unsubscribeStarted = eventBus.on('explanation:started', (payload: unknown) => {
      if (!isStartedPayload(payload)) {
        console.warn('Invalid started payload received');
        return;
      }
      setText(payload.text);
      setExplanation('');
      setReferences(payload.references || []);
      setIsLoading(true);
      setError(undefined);
    });

    const unsubscribeChunk = eventBus.on('explanation:chunk', (payload: unknown) => {
      if (!isChunkPayload(payload)) {
        console.warn('Invalid chunk payload received');
        return;
      }
      setExplanation(prev => prev + payload.content);
    });

    const unsubscribeComplete = eventBus.on('explanation:complete', () => {
      setIsLoading(false);
    });

    const unsubscribeError = eventBus.on('explanation:error', (payload: unknown) => {
      const errorPayload = payload as { error: string };
      setIsLoading(false);
      setError(errorPayload.error);
    });

    const unsubscribeCancelled = eventBus.on('explanation:cancelled', () => {
      setIsLoading(false);
    });

    return () => {
      unsubscribeStarted();
      unsubscribeChunk();
      unsubscribeComplete();
      unsubscribeError();
      unsubscribeCancelled();
    };
  }, [eventBus]);

  return (
    <ExplanationDrawer
      text={text}
      explanation={explanation}
      isLoading={isLoading}
      error={error}
      references={references}
    />
  );
}