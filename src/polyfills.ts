// Polyfills for Cloudflare Workers environment
// This file provides browser APIs that are not available in Workers runtime

// React polyfills for Cloudflare Workers
if (typeof globalThis.ReactSharedInternals === 'undefined') {
  (globalThis as any).ReactSharedInternals = {
    ReactCurrentDispatcher: {
      current: null
    }
  };
}

// CommonJS module polyfill for React
if (typeof globalThis.module === 'undefined') {
  (globalThis as any).module = {
    exports: {}
  };
}

if (typeof globalThis.exports === 'undefined') {
  (globalThis as any).exports = (globalThis as any).module.exports;
}

if (typeof globalThis.require === 'undefined') {
  (globalThis as any).require = (id: string) => {
    // For React modules, we need to handle them specially
    if (id === 'react') {
      return (globalThis as any).React;
    }
    if (id === 'react-dom') {
      return (globalThis as any).ReactDOM;
    }
    // Simple require polyfill - in a real implementation you'd need proper module resolution
    throw new Error(`require('${id}') is not supported in this environment`);
  };
}

// Process polyfill
if (typeof globalThis.process === 'undefined') {
  (globalThis as any).process = {
    env: {
      NODE_ENV: 'development'
    }
  };
}

// MessageChannel polyfill for React 19 and react-hook-form
if (typeof globalThis.MessageChannel === 'undefined') {
  class MessageChannelPolyfill {
    port1: MessagePortPolyfill;
    port2: MessagePortPolyfill;

    constructor() {
      const channel = this;
      this.port1 = new MessagePortPolyfill(channel);
      this.port2 = new MessagePortPolyfill(channel);
    }
  }

  class MessagePortPolyfill {
    private channel: MessageChannelPolyfill;
    private listeners: Array<(event: MessageEvent) => void> = [];

    constructor(channel: MessageChannelPolyfill) {
      this.channel = channel;
    }

    postMessage(data: any) {
      // In Workers, we can't actually send messages between ports
      // This is just a stub to prevent errors
      setTimeout(() => {
        this.listeners.forEach(listener => {
          listener({ data } as MessageEvent);
        });
      }, 0);
    }

    addEventListener(type: string, listener: (event: MessageEvent) => void) {
      if (type === 'message') {
        this.listeners.push(listener);
      }
    }

    removeEventListener(type: string, listener: (event: MessageEvent) => void) {
      if (type === 'message') {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    }

    start() {
      // No-op in Workers
    }

    close() {
      this.listeners = [];
    }
  }

  (globalThis as any).MessageChannel = MessageChannelPolyfill;
  (globalThis as any).MessagePort = MessagePortPolyfill;
}

// Additional polyfills for React 19 compatibility
if (typeof globalThis.setImmediate === 'undefined') {
  (globalThis as any).setImmediate = (callback: Function, ...args: any[]) => {
    return setTimeout(callback, 0, ...args);
  };
}

if (typeof globalThis.clearImmediate === 'undefined') {
  (globalThis as any).clearImmediate = (id: number) => {
    clearTimeout(id);
  };
}

// BroadcastChannel polyfill (if needed)
if (typeof globalThis.BroadcastChannel === 'undefined') {
  class BroadcastChannelPolyfill {
    private name: string;
    private listeners: Array<(event: MessageEvent) => void> = [];

    constructor(name: string) {
      this.name = name;
    }

    postMessage(data: any) {
      // In Workers, we can't actually broadcast messages
      // This is just a stub to prevent errors
      setTimeout(() => {
        this.listeners.forEach(listener => {
          listener({ data } as MessageEvent);
        });
      }, 0);
    }

    addEventListener(type: string, listener: (event: MessageEvent) => void) {
      if (type === 'message') {
        this.listeners.push(listener);
      }
    }

    removeEventListener(type: string, listener: (event: MessageEvent) => void) {
      if (type === 'message') {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    }

    close() {
      this.listeners = [];
    }
  }

  (globalThis as any).BroadcastChannel = BroadcastChannelPolyfill;
}

// AbortController polyfill (if needed)
if (typeof globalThis.AbortController === 'undefined') {
  class AbortControllerPolyfill {
    signal: AbortSignalPolyfill;

    constructor() {
      this.signal = new AbortSignalPolyfill();
    }

    abort() {
      this.signal.aborted = true;
      this.signal.dispatchEvent(new Event('abort'));
    }
  }

  class AbortSignalPolyfill extends EventTarget {
    aborted = false;

    constructor() {
      super();
    }
  }

  (globalThis as any).AbortController = AbortControllerPolyfill;
  (globalThis as any).AbortSignal = AbortSignalPolyfill;
}
