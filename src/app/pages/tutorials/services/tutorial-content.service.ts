import {Injectable} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {marked} from 'marked';
import {youtubeExtension} from "../../../utils/marked-extensions";
import {linkIcon} from "./content/icons";

export type TutorialSubSection = { id: string; title: string; level: 3 };

export type TutorialSection = {
  id: string;
  title: string;
  level: 2;
  children: TutorialSubSection[];
};

export type RenderedTutorial = {
  html: SafeHtml;
  outline: TutorialSection[];
  sections: Array<{ id: string; title: string; level: 2 | 3 }>;
  title?: string;
};

@Injectable({ providedIn: 'root' })
export class TutorialContentService {
  constructor(private sanitizer: DomSanitizer) {}

  renderMarkdown(md: string, assetDir?: string): RenderedTutorial {
    marked.use(youtubeExtension);

    const outline: TutorialSection[] = [];
    const flat: Array<{ id: string; title: string; level: 2 | 3 }> = [];
    let currentH2: TutorialSection | null = null;

    let pageTitle: string | undefined;

    const usedIds = new Map<string, number>();
    const uniqueId = (base: string) => {
      const count = usedIds.get(base) ?? 0;
      usedIds.set(base, count + 1);
      return count === 0 ? base : `${base}-${count + 1}`;
    };

    const stripHtml = (input: string) => input.replace(/<[^>]*>/g, '').trim();

    const renderer = new marked.Renderer();
    renderer.html = () => '';

    if (assetDir) {
      const toAbs = (url: string) => {
        if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('/')) return url;

        return `${assetDir}/${url.replace(/^\.\//, '')}`;
      };

      renderer.image = ({ href, title, text }) => {
        const src = toAbs(href ?? '');
        const safeTitle = title ? ` title="${this.escapeHtmlAttr(title)}"` : '';
        const alt = this.escapeHtmlAttr(text ?? '');

        return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async"${safeTitle}>`;
      };
    }

    renderer.link = ({ href, title, text }) => {
      const safeHref = (href ?? '').trim();

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
      const isExternal = finalHref.startsWith('http://') || finalHref.startsWith('https://');
      const rel = isExternal ? ' rel="noopener noreferrer"' : '';
      //const target = isExternal ? ' target="_blank"' : '';

      return `<a href="${this.escapeHtmlAttr(finalHref)}"${t}${rel}>🔗 ${text}</a>`;
    };

    renderer.heading = ({ text, depth }) => {
      const cleanText = stripHtml(text);

      if (depth === 1 && !pageTitle) pageTitle = cleanText;

      if (depth === 2) {
        const base = this.slugify(cleanText) || 'section';
        const id = uniqueId(base);

        currentH2 = { id, title: cleanText, level: 2, children: [] };
        outline.push(currentH2);

        flat.push({ id, title: cleanText, level: 2 });

        return `
            <h2 id="${id}" class="group relative flex items-center gap-2">
                ${text}
                <div class="flex-1 opacity-0 group-hover:opacity-50 transition-opacity">
                    ${linkIcon}
                </div>
            </h2>`;
      }

      if (depth === 3) {
        const base = this.slugify(cleanText) || 'sub-section';
        const id = uniqueId(base);

        if (currentH2) {
          currentH2.children.push({ id, title: cleanText, level: 3 });
          flat.push({ id, title: cleanText, level: 3 });
        } else {
          flat.push({ id, title: cleanText, level: 3 });
        }

        return `
            <h3 id="${id}" class="group relative flex items-center gap-2">
                ${text}
                <div class="flex-1 opacity-0 group-hover:opacity-50 transition-opacity">
                    ${linkIcon}
                </div>
            </h3>`;
      }

      return `<h${depth}>${text}</h${depth}>`;
    };

    marked.setOptions({ gfm: true, breaks: false, renderer });

    const rawHtml = marked.parse(md) as string;
    const trusted = this.sanitizer.bypassSecurityTrustHtml(rawHtml);

    return {
      html: trusted,
      outline,
      sections: flat,
      title: pageTitle,
    };
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
