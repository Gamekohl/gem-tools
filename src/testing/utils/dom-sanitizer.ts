import {SafeHtml} from "@angular/platform-browser";

export class MockDomSanitizer {
    bypassSecurityTrustHtml(value: string): SafeHtml {
        return value as unknown as SafeHtml;
    }
}