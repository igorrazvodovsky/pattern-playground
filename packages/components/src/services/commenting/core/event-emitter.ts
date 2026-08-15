// The emitter is untyped on the wire: each caller declares the payload shape it
// expects for the event name it subscribes to.
export type EventHandler<T = unknown> = (data: T) => void;

type StoredHandler = EventHandler<never>;

export class EventEmitter {
  private events: Map<string, Set<StoredHandler>> = new Map();
  
  on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(handler as StoredHandler);
    
    // Return unsubscribe function
    return () => {
      this.off(event, handler);
    };
  }
  
  off<T = unknown>(event: string, handler: EventHandler<T>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler as StoredHandler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }
  
  emit(event: string, data?: unknown): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          (handler as EventHandler<unknown>)(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }
  
  once<T = unknown>(event: string, handler: EventHandler<T>): () => void {
    const wrappedHandler = (data: T) => {
      handler(data);
      this.off(event, wrappedHandler);
    };
    
    return this.on(event, wrappedHandler);
  }
  
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
  
  listenerCount(event: string): number {
    const handlers = this.events.get(event);
    return handlers ? handlers.size : 0;
  }
}