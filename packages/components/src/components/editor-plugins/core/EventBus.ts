import type { EventBus as IEventBus, EventPayload, EventPriority } from '../../editor/types';

type EventListener<T = unknown> = {
  handler: (payload: T) => void;
  priority: number;
  once: boolean;
  abortController?: AbortController;
};

type Interceptor<T = unknown> = (payload: T) => T | null;

// Circular buffer for event history - ES2020 compatible
class CircularBuffer<T> {
  private buffer: T[];
  private size: number;
  private index = 0;
  private count = 0;

  constructor(size: number) {
    this.buffer = new Array(size);
    this.size = size;
  }

  push(item: T): void {
    this.buffer[this.index] = item;
    this.index = (this.index + 1) % this.size;
    this.count = Math.min(this.count + 1, this.size);
  }

  // Find last matching item
  findLast(predicate: (item: T) => boolean): T | undefined {
    for (let i = 0; i < this.count; i++) {
      const idx = (this.index - 1 - i + this.size) % this.size;
      if (predicate(this.buffer[idx])) {
        return this.buffer[idx];
      }
    }
    return undefined;
  }

  toArray(): readonly T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const idx = (this.index - this.count + i + this.size) % this.size;
      result.push(this.buffer[idx]);
    }
    return result;
  }
}

interface QueuedEvent {
  event: string;
  payload: unknown;
  priority: EventPriority;
  timestamp: number;
}

export class EventBus implements IEventBus {
  // Private fields - ES2020 compatible
  private listeners = new Map<string, Set<EventListener>>();
  private interceptors = new Map<string, Interceptor[]>();
  private eventHistory = new CircularBuffer<QueuedEvent>(100); // Bounded history
  private processing = false;
  
  // WeakMap for automatic cleanup of plugin references
  private pluginListeners = new WeakMap<object, Set<() => void>>();

  // Event priorities as const assertion
  static readonly PRIORITIES = {
    high: 100,
    normal: 50,
    low: 10
  } as const;

  emit<T extends keyof EventPayload>(
    event: T,
    payload: EventPayload[T],
    {
      priority = 'normal',
      cancelable = false
    }: {
      priority?: EventPriority;
      cancelable?: boolean;
    } = {}
  ): boolean {
    let processedPayload: EventPayload[T] | null = payload;

    // Record event in history with timestamp
    this.eventHistory.push({
      event: event as string,
      payload,
      priority,
      timestamp: Date.now()
    });

    // Apply interceptors with modern optional chaining
    const eventInterceptors = this.interceptors.get(event as string);
    if (eventInterceptors?.length) {
      for (const interceptor of eventInterceptors) {
        processedPayload = interceptor(processedPayload) as EventPayload[T] | null;
        if (processedPayload === null && cancelable) {
          return false;
        }
      }
    }

    if (processedPayload === null) {
      return false;
    }

    const eventListeners = this.listeners.get(event as string);
    if (!eventListeners?.size) {
      return true;
    }

    // Sort listeners for priority (ES2020 compatible)
    const sortedListeners = Array.from(eventListeners).sort(
      (a, b) => b.priority - a.priority
    );

    // Use some() for early termination and modern iteration
    for (const listener of sortedListeners) {
      try {
        // Check if listener was aborted
        if (listener.abortController?.signal.aborted) {
          eventListeners.delete(listener);
          continue;
        }

        listener.handler(processedPayload);
        
        if (listener.once) {
          eventListeners.delete(listener);
        }
      } catch (error) {
        console.error(`Error in event handler for ${String(event)}:`, error);
      }
    }

    return true;
  }

  on<T extends keyof EventPayload>(
    event: T,
    handler: (payload: EventPayload[T]) => void,
    {
      priority = 50,
      once = false,
      signal
    }: {
      priority?: number;
      once?: boolean;
      signal?: AbortSignal;
    } = {}
  ): () => void {
    // Create abort controller if signal provided
    const abortController = signal ? undefined : new AbortController();
    const effectiveSignal = signal ?? abortController?.signal;

    const listener: EventListener = {
      handler: handler as (payload: unknown) => void,
      priority,
      once,
      abortController
    };

    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }

    this.listeners.get(event as string)!.add(listener);

    // Modern cleanup with AbortController
    const cleanup = () => {
      const eventListeners = this.listeners.get(event as string);
      eventListeners?.delete(listener);
      abortController?.abort();
    };

    // Auto-cleanup when aborted
    effectiveSignal?.addEventListener('abort', cleanup, { once: true });

    return cleanup;
  }

  intercept<T extends keyof EventPayload>(
    event: T,
    interceptor: (payload: EventPayload[T]) => EventPayload[T] | null
  ): void {
    if (!this.interceptors.has(event as string)) {
      this.interceptors.set(event as string, []);
    }

    this.interceptors.get(event as string)!.push(
      interceptor as Interceptor
    );
  }

  clear(): void {
    // Use modern iteration with optional chaining
    for (const listeners of this.listeners.values()) {
      for (const listener of listeners) {
        listener.abortController?.abort();
      }
    }
    
    this.listeners.clear();
    this.interceptors.clear();
  }

  getListenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size ?? 0;
    }
    
    // Use reduce with modern syntax for total count
    return Array.from(this.listeners.values()).reduce((total, listeners) => total + listeners.size, 0);
  }

  // Modern utility methods
  getEventHistory(): readonly QueuedEvent[] {
    return this.eventHistory.toArray();
  }

  getRecentEvents(count: number = 10): readonly QueuedEvent[] {
    return this.eventHistory.toArray().slice(-count);
  }

  findLastEvent(predicate: (event: QueuedEvent) => boolean): QueuedEvent | undefined {
    return this.eventHistory.findLast(predicate);
  }

  // Plugin-aware listener management
  onWithPlugin<T extends keyof EventPayload>(
    plugin: object,
    event: T,
    handler: (payload: EventPayload[T]) => void,
    options?: Parameters<EventBus['on']>[2]
  ): () => void {
    const cleanup = this.on(event, handler, options);
    
    // Track cleanup functions per plugin
    if (!this.pluginListeners.has(plugin)) {
      this.pluginListeners.set(plugin, new Set());
    }
    
    this.pluginListeners.get(plugin)!.add(cleanup);
    
    return cleanup;
  }

  clearPluginListeners(plugin: object): void {
    const cleanupFunctions = this.pluginListeners.get(plugin);
    if (cleanupFunctions) {
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
      cleanupFunctions.clear();
    }
  }

  // Performance monitoring
  getMetrics(): {
    totalListeners: number;
    eventsProcessed: number;
    activeInterceptors: number;
  } {
    return {
      totalListeners: this.getListenerCount(),
      eventsProcessed: this.eventHistory.toArray().length,
      activeInterceptors: Array.from(this.interceptors.values()).reduce((sum, arr) => sum + arr.length, 0)
    };
  }
}