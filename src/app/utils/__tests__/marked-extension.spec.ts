import {youtubeExtension} from "../marked-extensions";

describe("youtubeExtension", () => {
    const ext = (youtubeExtension as any).extensions[0];

    test("start() finds the marker", () => {
        expect(ext.start("abc @[youtube](x)\n")).toBe(4);
        expect(ext.start("@[youtube](x)\n")).toBe(0);
        expect(ext.start("no marker")).toBe(-1);
    });

    test("tokenizer returns a token for youtu.be URL", () => {
        const src = "@[youtube](https://youtu.be/dQw4w9WgXcQ)\n";
        const tok = ext.tokenizer(src);

        expect(tok).toBeTruthy();
        expect(tok.type).toBe("youtube");
        expect(tok.raw).toBe(src);
        expect(tok.videoId).toBe("dQw4w9WgXcQ");
    });

    test("tokenizer returns a token for youtube.com watch URL", () => {
        const tok = ext.tokenizer(
            "@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n"
        );
        expect(tok.videoId).toBe("dQw4w9WgXcQ");
    });

    test("tokenizer supports m.youtube.com watch URL", () => {
        const tok = ext.tokenizer(
            "@[youtube](https://m.youtube.com/watch?v=dQw4w9WgXcQ)\n"
        );
        expect(tok.videoId).toBe("dQw4w9WgXcQ");
    });

    test("tokenizer supports /embed/ URL", () => {
        const tok = ext.tokenizer(
            "@[youtube](https://www.youtube.com/embed/dQw4w9WgXcQ)\n"
        );
        expect(tok.videoId).toBe("dQw4w9WgXcQ");
    });

    test("tokenizer supports /shorts/ URL", () => {
        const tok = ext.tokenizer(
            "@[youtube](https://www.youtube.com/shorts/dQw4w9WgXcQ)\n"
        );
        expect(tok.videoId).toBe("dQw4w9WgXcQ");
    });

    test("tokenizer accepts raw IDs (10/11/12 chars per regex)", () => {
        expect(ext.tokenizer("@[youtube](aBcdEF_123)\n")?.videoId).toBe("aBcdEF_123"); // 10
        expect(ext.tokenizer("@[youtube](dQw4w9WgXcQ)\n")?.videoId).toBe("dQw4w9WgXcQ"); // 11
        expect(ext.tokenizer("@[youtube](aBcdEF_12345)\n")?.videoId).toBe("aBcdEF_12345"); // 12
    });

    test("tokenizer trims whitespace in the URL", () => {
        const tok = ext.tokenizer(
            "@[youtube](   https://youtu.be/dQw4w9WgXcQ   )\n"
        );
        expect(tok.videoId).toBe("dQw4w9WgXcQ");
    });

    test("tokenizer rejects invalid IDs", () => {
        const tok = ext.tokenizer("@[youtube](https://youtu.be/not-valid)\n");
        expect(tok).toBeUndefined();
    });

    test("tokenizer rejects non-YouTube hosts", () => {
        const tok = ext.tokenizer(
            "@[youtube](https://example.com/watch?v=dQw4w9WgXcQ)\n"
        );
        expect(tok).toBeUndefined();
    });

    test("tokenizer only matches @[youtube](...) and rejects other tags", () => {
        // Wrong tag -> rejected even if URL is otherwise fine
        expect(ext.tokenizer("@[vimeo](https://youtu.be/dQw4w9WgXcQ)\n")).toBeUndefined();

        const tok = ext.tokenizer("@[youtube](abcDEF_1234)\n");
        expect(tok).toEqual(
            expect.objectContaining({
                type: "youtube",
                videoId: "abcDEF_1234",
            })
        );
    });

    test("tokenizer requires newline or EOF after the directive", () => {
        // valid EOF
        expect(ext.tokenizer("@[youtube](https://youtu.be/dQw4w9WgXcQ)")?.videoId).toBe(
            "dQw4w9WgXcQ"
        );

        // invalid: extra text on same line (your regex enforces \s*(?:\n|$))
        expect(
            ext.tokenizer("@[youtube](https://youtu.be/dQw4w9WgXcQ) trailing\n")
        ).toBeUndefined();
    });

    test("renderer outputs the expected embed HTML", () => {
        const html = ext.renderer({videoId: "dQw4w9WgXcQ"});

        expect(html).toContain('class="yt-embed"');
        expect(html).toContain("<iframe");
        expect(html).toContain(
            'src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"'
        );
        expect(html).toContain('title="YouTube video"');
        expect(html).toContain("allowfullscreen");
    });
});
