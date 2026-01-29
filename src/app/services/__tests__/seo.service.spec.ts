import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SeoService } from '../seo.service';

type Tag = HTMLMetaElement;

function getMetaByName(doc: Document, name: string): Tag | null {
  return doc.head.querySelector(`meta[name="${name}"]`);
}
function getMetaByProperty(doc: Document, property: string): Tag | null {
  return doc.head.querySelector(`meta[property="${property}"]`);
}
function getCanonical(doc: Document): HTMLLinkElement | null {
  return doc.head.querySelector(`link[rel="canonical"]`);
}

describe('SeoService', () => {
  let service: SeoService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService],
    });

    service = TestBed.inject(SeoService);
    doc = TestBed.inject(DOCUMENT);

    const toRemove = Array.from(doc.head.querySelectorAll('meta, link[rel="canonical"], script[type="application/ld+json"]'));
    toRemove.forEach(n => n.remove());
  });

  it('apply() sets document title and basic meta tags (description, robots)', () => {
    service.apply({
      title: 'Tutorials',
      description: 'Some description',
      url: 'https://example.com/tutorials',
      canonicalUrl: 'https://example.com/tutorials',
      ogType: 'website',
      image: '',
    });

    expect(doc.title).toBe('Tutorials – GEM-Tools');

    expect(getMetaByName(doc, 'description')?.getAttribute('content')).toBe('Some description');
    expect(getMetaByName(doc, 'robots')?.getAttribute('content')).toBe('index,follow');

    expect(getMetaByName(doc, 'keywords')).toBeNull();
  });

  it('apply() supports raw title template', () => {
    service.apply({
      title: 'Just Raw',
      titleTemplate: 'raw',
      description: 'd',
      url: 'https://example.com/x',
      canonicalUrl: 'https://example.com/x',
    });

    expect(doc.title).toBe('Just Raw');
    expect(getMetaByProperty(doc, 'og:title')?.getAttribute('content')).toBe('Just Raw');
  });

  it('buildTitle: if title is missing or equals site/default title, uses defaultTitle', () => {
    service.apply({
      description: 'd',
      url: 'https://example.com/x',
      canonicalUrl: 'https://example.com/x',
    });
    expect(doc.title).toBe('GEM-Tools');

    service.apply({
      title: 'GEM-Tools',
      description: 'd',
      url: 'https://example.com/y',
      canonicalUrl: 'https://example.com/y',
    });
    expect(doc.title).toBe('GEM-Tools');
  });

  it('apply() sets keywords when provided (array or string)', () => {
    service.apply({
      title: 'K',
      description: 'd',
      keywords: ['a', 'b', 'c'],
      url: 'https://example.com/x',
      canonicalUrl: 'https://example.com/x',
    });
    expect(getMetaByName(doc, 'keywords')?.getAttribute('content')).toBe('a, b, c');

    service.apply({
      title: 'K2',
      description: 'd',
      keywords: 'x, y',
      url: 'https://example.com/y',
      canonicalUrl: 'https://example.com/y',
    });
    expect(getMetaByName(doc, 'keywords')?.getAttribute('content')).toBe('x, y');
  });

  it('robots: uses explicit robots if provided', () => {
    service.apply({
      title: 'R',
      description: 'd',
      robots: 'noindex,nofollow',
      url: 'https://example.com/x',
      canonicalUrl: 'https://example.com/x',
    });

    expect(getMetaByName(doc, 'robots')?.getAttribute('content')).toBe('noindex,nofollow');
  });

  it('robots: noindex/nofollow flags are respected', () => {
    service.apply({
      title: 'R2',
      description: 'd',
      noindex: true,
      nofollow: true,
      url: 'https://example.com/x',
      canonicalUrl: 'https://example.com/x',
    });

    expect(getMetaByName(doc, 'robots')?.getAttribute('content')).toBe('noindex,nofollow');
  });

  it('normalizeDescription collapses whitespace and truncates >160 chars to 157 + ellipsis', () => {
    const long = `A   lot     of   whitespace.\n\n` + 'x'.repeat(200);

    service.apply({
      title: 'D',
      description: long,
      url: 'https://example.com/x',
      canonicalUrl: 'https://example.com/x',
    });

    const desc = getMetaByName(doc, 'description')?.getAttribute('content') ?? '';
    expect(desc.includes('\n')).toBe(false);
    expect(desc.includes('  ')).toBe(false);
    expect(desc.length).toBeLessThanOrEqual(160);
    expect(desc.endsWith('…')).toBe(true);
  });

  it('canonical: creates canonical link and updates it on subsequent apply()', () => {
    service.apply({
      title: 'C1',
      description: 'd',
      canonicalUrl: 'https://example.com/a',
      url: 'https://example.com/a',
    });

    const c1 = getCanonical(doc);
    expect(c1).not.toBeNull();
    expect(c1!.getAttribute('href')).toBe('https://example.com/a');

    service.apply({
      title: 'C2',
      description: 'd',
      canonicalUrl: 'https://example.com/b',
      url: 'https://example.com/b',
    });

    const c2 = getCanonical(doc);
    expect(c2).not.toBeNull();
    expect(c2!.getAttribute('href')).toBe('https://example.com/b');

    expect(doc.head.querySelectorAll(`link[rel="canonical"]`).length).toBe(1);
  });

  it('canonical: reuses an existing canonical element if present', () => {
    const existing = doc.createElement('link');
    existing.setAttribute('rel', 'canonical');
    existing.setAttribute('href', 'https://old.example.com');
    doc.head.appendChild(existing);

    service.apply({
      title: 'C',
      description: 'd',
      canonicalUrl: 'https://example.com/new',
      url: 'https://example.com/new',
    });

    const c = getCanonical(doc)!;
    expect(c).toBe(existing);
    expect(c.getAttribute('href')).toBe('https://example.com/new');
  });

  it('OpenGraph and Twitter tags: sets og:image and twitter:image when image present; removes them when absent', () => {
    service.apply({
      title: 'Img',
      description: 'd',
      image: 'https://example.com/img.png',
      url: 'https://example.com/x',
      canonicalUrl: 'https://example.com/x',
      ogType: 'article',
    });

    expect(getMetaByProperty(doc, 'og:image')?.getAttribute('content')).toBe('https://example.com/img.png');
    expect(getMetaByName(doc, 'twitter:image')?.getAttribute('content')).toBe('https://example.com/img.png');
    expect(getMetaByName(doc, 'twitter:card')?.getAttribute('content')).toBe('summary_large_image');
    expect(getMetaByProperty(doc, 'og:type')?.getAttribute('content')).toBe('article');

    service.apply({
      title: 'NoImg',
      description: 'd2',
      image: '',
      url: 'https://example.com/y',
      canonicalUrl: 'https://example.com/y',
    });

    expect(getMetaByProperty(doc, 'og:image')).toBeNull();
    expect(getMetaByName(doc, 'twitter:image')).toBeNull();
    expect(getMetaByName(doc, 'twitter:card')?.getAttribute('content')).toBe('summary');
  });

  it('setConfig affects siteName/titleSeparator/baseUrl/twitterSite', () => {
    service.setConfig({
      siteName: 'MySite',
      titleSeparator: ' | ',
      baseUrl: 'https://mysite.test/',
      twitterSite: '@mysite',
    });

    service.apply({
      title: 'Page',
      description: 'd',
      // omit url/canonicalUrl => deriveAbsoluteUrl() should use baseUrl + location path
    });

    expect(doc.title).toBe('Page | MySite');
    expect(getMetaByProperty(doc, 'og:site_name')?.getAttribute('content')).toBe('MySite');
    expect(getMetaByName(doc, 'twitter:site')?.getAttribute('content')).toBe('@mysite');
  });

  it('setJsonLd inserts script and removeJsonLd removes it', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'Thing', name: 'X' };

    service.setJsonLd(schema);

    const script = doc.head.querySelector(`script[type="application/ld+json"]`) as HTMLScriptElement | null;
    expect(script).not.toBeNull();
    expect(script!.text).toBe(JSON.stringify(schema));

    service.removeJsonLd();
    expect(doc.head.querySelector(`script[type="application/ld+json"]`)).toBeNull();
  });
});
