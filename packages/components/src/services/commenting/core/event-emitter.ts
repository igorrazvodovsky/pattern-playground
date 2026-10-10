// `Events` maps each event name to the payload its handlers receive.
export type EventHandler<T> = (data: T) => void;

type StoredHandler = EventHandler<never>;

export class EventEmitter<Events extends object> {
  private events: Map<keyof Events, Set<StoredHandler>> = new Map();

  on<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(handler as StoredHandler);

    return () => {
      this.off(event, handler);
    };
  }

  off<K extends keyof Events>(event: K, handler: EventHandler<Events[K]>): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler as StoredHandler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          (handler as EventHandler<Events[K]>)(data);
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error);
        }
      });
    }
  }
}
