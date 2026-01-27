import {ElementRef} from "@angular/core";

export function makeAnchor() {
    const el = document.createElement('div');
    document.body.appendChild(el);
    return new ElementRef<HTMLElement>(el);
}