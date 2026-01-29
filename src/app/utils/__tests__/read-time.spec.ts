import {estimateReadTimeFromMarkdown} from "../read-time";

describe('estimateReadTimeFromMarkdown', () => {
    it('returns minMinutes=1 for empty markdown', () => {
        const res = estimateReadTimeFromMarkdown('');
        expect(res).toEqual({ minutes: 1, words: 0, images: 0, codeBlocks: 0 });
    });

    it('counts words from plain text', () => {
        const res = estimateReadTimeFromMarkdown('one two three four five');
        expect(res.words).toBe(5);
        expect(res.images).toBe(0);
        expect(res.codeBlocks).toBe(0);
        expect(res.minutes).toBe(1);
    });

    it('strips markdown syntax and collapses whitespace', () => {
        const md = `
            # Title
            
            > Quote line
            
            This is **bold** and _italic_ and \`code\`.
        `;
        const res = estimateReadTimeFromMarkdown(md);
        expect(res.words).toBe(11);
        expect(res.images).toBe(0);
        expect(res.codeBlocks).toBe(0);
    });

    it('counts images outside code blocks and removes them from word count', () => {
        const md = `
            Intro text here.
            
            ![alt](img.png)
            After image text.
        `;
        const res = estimateReadTimeFromMarkdown(md);
        expect(res.images).toBe(1);
        expect(res.codeBlocks).toBe(0);

        expect(res.words).toBe(7);
    });

    it('does not count images inside fenced code blocks', () => {
        const md = `
            Before.
            
            \`\`\`ts
            const x = 1;
            // ![alt](img.png)
            \`\`\`
            
            After.
        `;
        const res = estimateReadTimeFromMarkdown(md);
        expect(res.codeBlocks).toBe(1);
        expect(res.images).toBe(0);

        expect(res.words).toBe(2);
    });

    it('counts fenced code blocks (```...```), including multiple blocks', () => {
        const md = `
            Text
            \`\`\`
            code
            \`\`\`
            
            More
            \`\`\`js
            console.log(1)
            \`\`\`
        `;
        const res = estimateReadTimeFromMarkdown(md);
        expect(res.codeBlocks).toBe(2);
    });

    it('treats markdown links as their visible text for word count', () => {
        const md = `Read the [Angular docs](https://angular.dev) please.`;
        const res = estimateReadTimeFromMarkdown(md);
        expect(res.words).toBe(5);
    });

    it('strips HTML tags from the word count', () => {
        const md = `Hello <strong>world</strong> <em>again</em>.`;
        const res = estimateReadTimeFromMarkdown(md);
        expect(res.words).toBe(6);
    });

    it('computes minutes using defaults: wordsPerMinute=200, secondsPerImage=12, secondsPerCodeBlock=20', () => {
        const twoHundredWords = Array.from({ length: 200 }, () => 'w').join(' ');
        const md = `${twoHundredWords}\n\n![a](b.png)\n\n\`\`\`\ncode\n\`\`\``;

        const res = estimateReadTimeFromMarkdown(md);

        expect(res.words).toBe(201);
        expect(res.images).toBe(1);
        expect(res.codeBlocks).toBe(1);

        expect(res.minutes).toBe(2);
    });

    it('respects custom config values', () => {
        const md =
            `${Array.from({ length: 120 }, () => 'w').join(' ')}\n` +
            `![a](a.png)\n![b](b.png)\n` +
            '```js\nconsole.log(1)\n```';

        const res = estimateReadTimeFromMarkdown(md, {
            wordsPerMinute: 60,
            secondsPerImage: 5,
            secondsPerCodeBlock: 30,
            minMinutes: 1,
        });

        expect(res.words).toBe(122);
        expect(res.images).toBe(2);
        expect(res.codeBlocks).toBe(1);
        expect(res.minutes).toBe(3);
    });

    it('enforces minMinutes when computed minutes would be 0', () => {
        const res = estimateReadTimeFromMarkdown('tiny', { minMinutes: 5 });
        expect(res.words).toBe(1);
        expect(res.minutes).toBe(5);
    });

    it('handles markdown containing only symbols and whitespace', () => {
        const res = estimateReadTimeFromMarkdown('### *** ~~ -- ` `   ');
        expect(res.words).toBe(0);
        expect(res.images).toBe(0);
        expect(res.codeBlocks).toBe(0);
        expect(res.minutes).toBe(1);
    });
});
