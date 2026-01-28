import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export type SeoOpenGraphType = 'website' | 'article';

export interface SeoConfig {
  siteName: string;
  defaultTitle: string;
  titleSeparator?: string;
  defaultDescription: string;
  defaultRobots?: string;
  defaultOgImage?: string;
  baseUrl?: string;
  twitterSite?: string;
}

export interface SeoPage {
  title?: string;
  titleTemplate?: 'page-site' | 'raw';
  description?: string;
  keywords?: string[] | string;

  noindex?: boolean;
  nofollow?: boolean;
  robots?: string;

  canonicalUrl?: string;
  url?: string;

  ogType?: SeoOpenGraphType;
  image?: string;

  locale?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly doc = inject(DOCUMENT);

  private activeCanonical?: HTMLLinkElement | null;
  private activeJsonLd?: HTMLScriptElement | null;

  private config: SeoConfig = {
    siteName: 'GEM-Tools',
    defaultTitle: 'GEM-Tools',
    titleSeparator: ' – ',
    defaultDescription: 'Tools, Tutorials und Ressourcen rund um den GEM Editor.',
    defaultRobots: 'index,follow',
    defaultOgImage: undefined,
    baseUrl: undefined,
    twitterSite: undefined
  };

  setConfig(cfg: Partial<SeoConfig>) {
    this.config = { ...this.config, ...cfg };
  }

  apply(page: SeoPage) {
    const cfg = this.config;

    const fullTitle = this.buildTitle(page);
    const description = this.normalizeDescription(page.description ?? cfg.defaultDescription);
    const robots = this.buildRobots(page);

    const url = page.url ?? this.deriveAbsoluteUrl();
    const canonical = page.canonicalUrl ?? url;
    const ogType: SeoOpenGraphType = page.ogType ?? 'website';
    const image = page.image ?? cfg.defaultOgImage;
    const locale = 'en_EN';

    // Title
    this.title.setTitle(fullTitle);

    // Basic meta
    this.setName('description', description);
    this.setName('robots', robots);

    if (page.keywords) {
      const kw = Array.isArray(page.keywords) ? page.keywords.join(', ') : page.keywords;
      this.setName('keywords', kw);
    } else {
      this.removeName('keywords');
    }

    // Canonical
    this.setCanonical(canonical);

    // Open Graph
    this.setProperty('og:site_name', cfg.siteName);
    this.setProperty('og:title', fullTitle);
    this.setProperty('og:description', description);
    this.setProperty('og:type', ogType);
    this.setProperty('og:url', url);
    this.setProperty('og:locale', locale);
    if (image) this.setProperty('og:image', image); else this.removeProperty('og:image');

    // Twitter
    this.setName('twitter:card', image ? 'summary_large_image' : 'summary');
    this.setName('twitter:title', fullTitle);
    this.setName('twitter:description', description);
    if (image) this.setName('twitter:image', image); else this.removeName('twitter:image');
    if (cfg.twitterSite) this.setName('twitter:site', cfg.twitterSite); else this.removeName('twitter:site');
  }

  /**
   * Inject JSON-LD (Schema.org)
   */
  setJsonLd(schema: unknown) {
    this.removeJsonLd();

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    this.doc.head.appendChild(script);
    this.activeJsonLd = script;
  }

  removeJsonLd() {
    if (this.activeJsonLd?.parentNode) {
      this.activeJsonLd.parentNode.removeChild(this.activeJsonLd);
    }
    this.activeJsonLd = null;
  }

  private buildTitle(page: SeoPage): string {
    const cfg = this.config;
    const tpl = page.titleTemplate ?? 'page-site';

    const raw = (page.title ?? cfg.defaultTitle).trim();
    if (tpl === 'raw') return raw;

    // page-site
    if (!page.title || raw === cfg.siteName || raw === cfg.defaultTitle) {
      return cfg.defaultTitle;
    }
    return `${raw}${cfg.titleSeparator ?? ' – '}${cfg.siteName}`;
  }

  private buildRobots(page: SeoPage): string {
    if (page.robots) return page.robots;

    const index = page.noindex ? 'noindex' : 'index';
    const follow = page.nofollow ? 'nofollow' : 'follow';

    // Default is index,follow; still respect explicit flags
    return `${index},${follow}`;
  }

  private normalizeDescription(desc: string): string {
    const collapsed = desc.replace(/\s+/g, ' ').trim();
    if (collapsed.length <= 160) return collapsed;
    return collapsed.slice(0, 157).trimEnd() + '…';
  }

  private deriveAbsoluteUrl(): string {
    // Prefer config.baseUrl if provided, otherwise use document location
    const loc = this.doc.location;
    const base = this.config.baseUrl?.replace(/\/+$/, '');
    if (base) return base + loc.pathname + loc.search;

    // If no baseUrl, best-effort: origin + path
    return loc.origin + loc.pathname + loc.search;
  }

  private setCanonical(url: string) {
    const href = url.trim();
    if (!href) return;

    // Remove old canonical we created
    if (this.activeCanonical?.parentNode) {
      this.activeCanonical.parentNode.removeChild(this.activeCanonical);
      this.activeCanonical = null;
    }

    // Try to reuse existing canonical if present
    const existing = this.doc.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const link = existing ?? this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', href);

    if (!existing) this.doc.head.appendChild(link);
    this.activeCanonical = link;
  }

  private setName(name: string, content: string) {
    this.meta.updateTag({ name, content }, `name='${name}'`);
  }

  private removeName(name: string) {
    this.meta.removeTag(`name='${name}'`);
  }

  private setProperty(property: string, content: string) {
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }

  private removeProperty(property: string) {
    this.meta.removeTag(`property='${property}'`);
  }
}
