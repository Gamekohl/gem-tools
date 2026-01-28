import {TestBed} from '@angular/core/testing';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {mockMarked} from "../../../../testing/libs/marked";

let activeRenderer: any;

jest.mock('marked', () => mockMarked(activeRenderer));

import {TutorialContentService} from './tutorial-content.service';

class DomSanitizerStub {
    bypassSecurityTrustHtml(value: string): SafeHtml {
        return value as unknown as SafeHtml;
    }
}

describe('TutorialContentService', () => {
    let service: TutorialContentService;
    let sanitizer: DomSanitizerStub;

    beforeEach(() => {
        activeRenderer = undefined;

        TestBed.configureTestingModule({
            providers: [
                TutorialContentService,
                {provide: DomSanitizer, useClass: DomSanitizerStub},
            ],
        });

        service = TestBed.inject(TutorialContentService);
        sanitizer = TestBed.inject(DomSanitizer);
    });

    it('returns trusted html via DomSanitizer.bypassSecurityTrustHtml', () => {
        const spy = jest.spyOn(sanitizer, 'bypassSecurityTrustHtml');

        const res = service.renderMarkdown('# Title');

        expect(spy).toHaveBeenCalledTimes(1);
        expect(res.html).toBe(spy.mock.results[0]!.value);
    });

    it('extracts the first H1 as page title (only once)', () => {
        const md = `# First Title
          Text
          # Second Title
          More`;

        const res = service.renderMarkdown(md);

        expect(res.title).toBe('First Title');

        const html = res.html as unknown as string;
        expect(html).toContain('<h1>First Title</h1>');
        expect(html).toContain('<h1>Second Title</h1>');
    });

    it('collects H2 sections with slugified ids and returns <h2 id="...">', () => {
        const md = `## Hello World
          Text
          ## Another Section`;

        const res = service.renderMarkdown(md);

        expect(res.sections).toEqual([
            {id: 'hello-world', title: 'Hello World', level: 2},
            {id: 'another-section', title: 'Another Section', level: 2},
        ]);

        const html = res.html as unknown as string;
        expect(html).toContain('<h2 id="hello-world">Hello World</h2>');
        expect(html).toContain('<h2 id="another-section">Another Section</h2>');
    });

    it('makes duplicate H2 ids unique by appending -2, -3, ...', () => {
        const md = `## Same
          Text
          ## Same
          More
          ## Same`;

        const res = service.renderMarkdown(md);

        expect(res.sections.map((s) => s.id)).toEqual(['same', 'same-2', 'same-3']);

        const html = res.html as unknown as string;
        expect(html).toContain('<h2 id="same">Same</h2>');
        expect(html).toContain('<h2 id="same-2">Same</h2>');
        expect(html).toContain('<h2 id="same-3">Same</h2>');
    });

    it('strips HTML from headings for title/section extraction, but keeps original heading HTML in output', () => {
        const md = `# <em>My</em> <strong>Title</strong>
            ## <span>Intro</span> <code>Code</code>`;

        const res = service.renderMarkdown(md);

        // stripHtml() affects extracted title/sections
        expect(res.title).toBe('My Title');
        expect(res.sections).toEqual([{id: 'intro-code', title: 'Intro Code', level: 2}]);

        // but renderer.heading uses `${text}` for the inner HTML
        const html = res.html as unknown as string;
        expect(html).toContain('<h1><em>My</em> <strong>Title</strong></h1>');
        expect(html).toContain('<h2 id="intro-code"><span>Intro</span> <code>Code</code></h2>');
    });

    it('uses fallback id "section" when slugify results in empty string', () => {
        const md = `## !!!`;

        const res = service.renderMarkdown(md);

        expect(res.sections).toEqual([{id: 'section', title: '!!!', level: 2}]);

        const html = res.html as unknown as string;
        expect(html).toContain('<h2 id="section">!!!</h2>');
    });

    it('slugify behavior: removes brackets/quotes, converts "&" to "and", collapses spaces/dashes', () => {
        const md = `##  Hello  &  World (Test) [x]  `;

        const res = service.renderMarkdown(md);

        expect(res.sections[0]!.id).toBe('hello-and-world-test-x');
    });

    it('blocks raw HTML blocks from markdown completely (renderer.html = "")', () => {
        const md = `
          Before
          
          <div>RAW</div>
          <script>alert("x")</script>
          
          After
          ## Section
        `;

        const res = service.renderMarkdown(md);
        const html = res.html as unknown as string;

        expect(html).toContain('Before');
        expect(html).toContain('After');

        // raw HTML should not appear
        expect(html).not.toContain('<div>');
        expect(html).not.toContain('RAW</div>');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('alert("x")');
    });

    it('allows safe link hrefs and blocks unsafe schemes by replacing with "#"', () => {
        const md = `
          [safe1](https://example.com)
          [safe2](http://example.com)
          [safe3](mailto:test@example.com)
          [safe4](/relative)
          [safe5](./rel)
          [safe6](../up)
          [safe7](#hash)
          
          [bad1](javascript:alert(1))
          [bad2](data:text/html;base64,PHNjcmlwdD4=)
        `;

        const res = service.renderMarkdown(md);
        const html = res.html as unknown as string;

        // Allowed ones preserved
        expect(html).toContain('<a href="https://example.com"');
        expect(html).toContain('<a href="http://example.com"');
        expect(html).toContain('<a href="mailto:test@example.com"');
        expect(html).toContain('<a href="/relative"');
        expect(html).toContain('<a href="./rel"');
        expect(html).toContain('<a href="../up"');
        expect(html).toContain('<a href="#hash"');

        // Blocked ones become "#"
        expect(html).toContain('<a href="#">bad1</a>');
        expect(html).toContain('<a href="#">bad2</a>');
        expect(html).not.toContain('javascript:');
        expect(html).not.toContain('data:text/html');
    });

    it('adds rel+target only for external http/https links', () => {
        const md = `
          [ext](https://example.com)
          [int](/docs)
          [hash](#section)
          [mail](mailto:test@example.com)
        `;

        const res = service.renderMarkdown(md);
        const html = res.html as unknown as string;

        // external
        expect(html).toContain('href="https://example.com" rel="noopener noreferrer" target="_blank"');

        // internal/hash/mailto should not get rel/target
        expect(html).toContain('<a href="/docs">int</a>');
        expect(html).toContain('<a href="#section">hash</a>');
        expect(html).toContain('<a href="mailto:test@example.com">mail</a>');
        expect(html).not.toContain('href="/docs" rel="noopener noreferrer"');
        expect(html).not.toContain('href="#section" rel="noopener noreferrer"');
        expect(html).not.toContain('href="mailto:test@example.com" rel="noopener noreferrer"');
    });

    it('escapes href and title attributes in links', () => {
      // Note: keep the title free of unescaped quotes so the mocked parser can parse it deterministically.
      const res = service.renderMarkdown(
          `[t](https://example.com?x=y&z=<a> "bad title <x> & y")`
      );

      const html = res.html as unknown as string;

      // href escaping: & < >
      expect(html).toContain(
          'href="https://example.com?x=y&amp;z=&lt;a&gt;"'
      );

      // title escaping: & < >
      expect(html).toContain(
          'title="bad title &lt;x&gt; &amp; y"'
    );
  });
});
