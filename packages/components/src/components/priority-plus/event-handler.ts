type EventCallback = (eventDetail: CustomEvent<unknown>) => void;

interface CallbackRef {
  eventType: string;
  wrappedCallback: EventCallback;
}

function eventTarget() {
  const { port1 } = new MessageChannel();
  return {
    addEventListener: port1.addEventListener.bind(port1),
    dispatchEvent: port1.dispatchEvent.bind(port1),
    removeEventListener: port1.removeEventListener.bind(port1),
  };
}

function createEventHandler() {
  const state = { eventReady: false };
  const eventChannel = eventTarget();
  const eventListeners: Map<EventCallback, CallbackRef> = new Map();

  /**
   * Registers an an event listener for the instance.
   * By default the callback will only be run after the first-load.
   * However this can be overridden by setting 'afterReady' to 'false'.
   */
  function on(eventType: string, cb: EventCallback, afterReady = true) {
    function wrappedCallback(event: CustomEvent<unknown>) {
      if (!afterReady || state.eventReady) cb(event);
    }

    // Store it so we can remove it later
    eventListeners.set(cb, { eventType, wrappedCallback });
    eventChannel.addEventListener(eventType, wrappedCallback as EventListener);

    return this;
  }

  /**
   * Removes an event listener.
   */
  function off(eventType: string, cb: EventCallback) {
    const { wrappedCallback } = eventListeners.get(cb) as CallbackRef;
    eventChannel.removeEventListener(eventType, wrappedCallback as EventListener);

    return this;
  }

  /**
   * Dispatch an event.
   */
  function trigger(event: CustomEvent<unknown>) {
    eventChannel.dispatchEvent(event);
  }

  /**
   * Set if we're ready to fire event callbacks.
   */
  function setEventReady(ready = true) {
    state.eventReady = ready;
  }

  return {
    off,
    on,
    setEventReady,
    trigger,
  };
}

export default createEventHandler;
