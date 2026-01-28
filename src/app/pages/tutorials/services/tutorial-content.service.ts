import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

export type TutorialSection = { id: string; title: string; level: 2 };

export type RenderedTutorial = {
  html: SafeHtml;
  sections: TutorialSection[];
  title?: string;
};

@Injectable({ providedIn: 'root' })
export class TutorialContentService {
  constructor(private sanitizer: DomSanitizer) {}

  renderMarkdown(md: string): RenderedTutorial {
    const sections: TutorialSection[] = [];
    let pageTitle: string | undefined;

    const usedIds = new Map<string, number>();
    const uniqueId = (base: string) => {
      const count = usedIds.get(base) ?? 0;
      usedIds.set(base, count + 1);
      return count === 0 ? base : `${base}-${count + 1}`;
    };

    const stripHtml = (input: string) => input.replace(/<[^>]*>/g, '').trim();

    const renderer = new marked.Renderer();

    // 1) Raw HTML aus Markdown komplett blocken
    renderer.html = () => '';

    // 2) Links absichern (kein javascript:)
    renderer.link = ({ href, title, text }) => {
      const safeHref = (href ?? '').trim();

      // Allow: http(s), mailto, relative, hash
      const isSafe =
          safeHref.startsWith('#') ||
          safeHref.startsWith('/') ||
          safeHref.startsWith('./') ||
          safeHref.startsWith('../') ||
          safeHref.startsWith('http://') ||
          safeHref.startsWith('https://') ||
          safeHref.startsWith('mailto:');

      const finalHref = isSafe ? safeHref : '#';

      const t = title ? ` title="${this.escapeHtmlAttr(title)}"` : '';
      // rel+target für externe Links
      const isExternal = finalHref.startsWith('http://') || finalHref.startsWith('https://');
      const rel = isExternal ? ' rel="noopener noreferrer"' : '';
      const target = isExternal ? ' target="_blank"' : '';

      return `<a href="${this.escapeHtmlAttr(finalHref)}"${t}${rel}${target}>${text}</a>`;
    };

    renderer.heading = ({ text, depth }) => {
      const cleanText = stripHtml(text);

      if (depth === 1 && !pageTitle) pageTitle = cleanText;

      if (depth === 2) {
        const base = this.slugify(cleanText) || 'section';
        const id = uniqueId(base);
        sections.push({ id, title: cleanText, level: 2 });
        return `<h2 id="${id}">${text}</h2>`;
      }

      return `<h${depth}>${text}</h${depth}>`;
    };

    marked.setOptions({
      gfm: true,
      breaks: false,
      renderer,
    });

    const rawHtml = marked.parse(md) as string;

    const trusted = this.sanitizer.bypassSecurityTrustHtml(rawHtml);

    return { html: trusted, sections, title: pageTitle };
  }

  private slugify = (s: string) =>
      s
          .toLowerCase()
          .trim()
          .replace(/[`"'(){}\[\]]/g, '')
          .replace(/&/g, ' and ')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');

  private escapeHtmlAttr(s: string): string {
    return s
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
  }
}
