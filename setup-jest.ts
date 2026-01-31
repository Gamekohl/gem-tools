import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { installBrowserMocks } from '@testing/mocks/browser';

beforeAll(() => installBrowserMocks());

afterEach(() => jest.clearAllMocks());

setupZoneTestEnv();