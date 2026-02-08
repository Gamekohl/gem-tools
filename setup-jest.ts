import {installBrowserMocks} from '@testing/mocks/browser';
import {setupZoneTestEnv} from 'jest-preset-angular/setup-env/zone';

beforeAll(() => installBrowserMocks());

afterEach(() => jest.clearAllMocks());

setupZoneTestEnv();