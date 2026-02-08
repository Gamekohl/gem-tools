import {MockIntersectionObserver} from '@testing/utils/intersection-observer';

export function installBrowserMocks() {
    // IntersectionObserver
    (global as any).IntersectionObserver = MockIntersectionObserver as any;

    // Window
    (window as any).scrollTo = jest.fn();

    // Clipboard
    Object.defineProperty(window.navigator, 'clipboard', {
        value: { writeText: jest.fn() }
    });

    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
        writable: true,
        value: jest.fn(),
    });

    // Console
    console.warn = jest.fn();

    const originalConsoleError = console.error;
    console.error = function (...data) {
        if (
            typeof data[0]?.toString === 'function' &&
            data[0].toString().includes('Error: Could not parse CSS stylesheet')
        ) return;
        originalConsoleError(...data);
    };

    // matchMedia
    if (!window.matchMedia) {
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
    }
}