import type { SeoService } from '../../app/services/seo.service';

export function createSeoServiceMock(): Pick<SeoService, 'apply' | 'setJsonLd' | 'removeJsonLd'> {
  return {
    apply: jest.fn(),
    setJsonLd: jest.fn(),
    removeJsonLd: jest.fn(),
  };
}
