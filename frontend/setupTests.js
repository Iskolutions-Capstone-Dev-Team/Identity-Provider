import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
    const store = new Map();
    const mockStorage = {
      getItem: (key) => store.get(String(key)) ?? null,
      setItem: (key, val) => store.set(String(key), String(val)),
      removeItem: (key) => store.delete(String(key)),
      clear: () => store.clear(),
      key: (i) => Array.from(store.keys())[i] ?? null,
      get length() { return store.size; },
    };
    Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true, writable: true });
  }

  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  if (!window.IntersectionObserver) {
    class MockIntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      takeRecords() { return []; }
      unobserve() {}
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
    global.IntersectionObserver = MockIntersectionObserver;
  }

  if (!window.ResizeObserver) {
    class MockResizeObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      unobserve() {}
    }
    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: MockResizeObserver,
    });
    global.ResizeObserver = MockResizeObserver;
  }
}
