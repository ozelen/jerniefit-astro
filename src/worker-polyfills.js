// Worker-specific polyfills for Cloudflare Workers
// This file is specifically for the Workers runtime environment

// React polyfills for Cloudflare Workers
if (typeof globalThis.ReactSharedInternals === 'undefined') {
  globalThis.ReactSharedInternals = {
    ReactCurrentDispatcher: {
      current: null
    }
  };
}

// CommonJS module polyfill for React
if (typeof globalThis.module === 'undefined') {
  globalThis.module = {
    exports: {}
  };
}

if (typeof globalThis.exports === 'undefined') {
  globalThis.exports = globalThis.module.exports;
}

if (typeof globalThis.require === 'undefined') {
  globalThis.require = (id) => {
    // For React modules, we need to handle them specially
    if (id === 'react') {
      return globalThis.React;
    }
    if (id === 'react-dom') {
      return globalThis.ReactDOM;
    }
    // Simple require polyfill - in a real implementation you'd need proper module resolution
    throw new Error(`require('${id}') is not supported in this environment`);
  };
}

// Process polyfill
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'development'
    }
  };
}

// MessageChannel polyfill for React 19 and react-hook-form
if (typeof globalThis.MessageChannel === 'undefined') {
  class MessageChannelPolyfill {
    constructor() {
      this.port1 = new MessagePortPolyfill();
      this.port2 = new MessagePortPolyfill();
    }
  }

  class MessagePortPolyfill {
    constructor() {
      this.listeners = [];
    }

    postMessage(data) {
      // In Workers, we can't actually send messages between ports
      // This is just a stub to prevent errors
      setTimeout(() => {
        this.listeners.forEach(listener => {
          listener({ data });
        });
      }, 0);
    }

    addEventListener(type, listener) {
      if (type === 'message') {
        this.listeners.push(listener);
      }
    }

    removeEventListener(type, listener) {
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

  globalThis.MessageChannel = MessageChannelPolyfill;
  globalThis.MessagePort = MessagePortPolyfill;
}

// Additional polyfills for React 19 compatibility
if (typeof globalThis.setImmediate === 'undefined') {
  globalThis.setImmediate = (callback, ...args) => {
    return setTimeout(callback, 0, ...args);
  };
}

if (typeof globalThis.clearImmediate === 'undefined') {
  globalThis.clearImmediate = (id) => {
    clearTimeout(id);
  };
}

// BroadcastChannel polyfill
if (typeof globalThis.BroadcastChannel === 'undefined') {
  class BroadcastChannelPolyfill {
    constructor(name) {
      this.name = name;
      this.listeners = [];
    }

    postMessage(data) {
      // In Workers, we can't actually broadcast messages
      // This is just a stub to prevent errors
      setTimeout(() => {
        this.listeners.forEach(listener => {
          listener({ data });
        });
      }, 0);
    }

    addEventListener(type, listener) {
      if (type === 'message') {
        this.listeners.push(listener);
      }
    }

    removeEventListener(type, listener) {
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

  globalThis.BroadcastChannel = BroadcastChannelPolyfill;
}

// AbortController polyfill
if (typeof globalThis.AbortController === 'undefined') {
  class AbortControllerPolyfill {
    constructor() {
      this.signal = new AbortSignalPolyfill();
    }

    abort() {
      this.signal.aborted = true;
      this.signal.dispatchEvent(new Event('abort'));
    }
  }

  class AbortSignalPolyfill extends EventTarget {
    constructor() {
      super();
      this.aborted = false;
    }
  }

  globalThis.AbortController = AbortControllerPolyfill;
  globalThis.AbortSignal = AbortSignalPolyfill;
}
