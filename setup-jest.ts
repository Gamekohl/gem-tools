import {setupZoneTestEnv} from 'jest-preset-angular/setup-env/zone';

Object.defineProperty(window.navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  }
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,              // default: no reduced motion
    media: query,
    onchange: null,
    addListener: jest.fn(),      // deprecated
    removeListener: jest.fn(),   // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  writable: true,
  value: jest.fn(),
});

Object.defineProperty(window, 'scrollTo', jest.fn());

const originalConsoleError = console.error;

console.warn = jest.fn();

console.error = function (...data) {
  if (
    typeof data[0]?.toString === 'function' && 
    data[0].toString().includes('Error: Could not parse CSS stylesheet')
  ) return;
  originalConsoleError(...data);
};

setupZoneTestEnv();