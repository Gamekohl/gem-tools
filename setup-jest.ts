import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

Object.defineProperty(window.navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
  }
});

const originalConsoleError = console.error;

console.error = function (...data) {
  if (
    typeof data[0]?.toString === 'function' && 
    data[0].toString().includes('Error: Could not parse CSS stylesheet')
  ) return;
  originalConsoleError(...data);
};

setupZoneTestEnv();