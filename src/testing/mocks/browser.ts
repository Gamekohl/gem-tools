import { MockIntersectionObserver } from '@testing/utils/intersection-observer';

export function installBrowserMocks() {
    // IntersectionObserver
    (global as any).IntersectionObserver = MockIntersectionObserver as any;

    // Window
    (window as any).scrollTo = jest.fn();

    // Clipboard
    Object.defineProperty(window.navigator, 'clipboard', {
        value: { writeText: jest.fn() }
    });

    // Console
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
        (window as any).matchMedia = () => ({
            matches: false,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        });
    }
}