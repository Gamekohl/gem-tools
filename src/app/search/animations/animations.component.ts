import {Clipboard} from "@angular/cdk/clipboard";
import {isPlatformBrowser} from "@angular/common";
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    inject,
    model,
    PLATFORM_ID,
    signal
} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {tablerCopy, tablerX} from '@ng-icons/tabler-icons';
import {FilterPipe} from '../../pipes/filter.pipe';
import {animationNamesData} from "./data/animationNames";

@Component({
    selector: 'app-animations',
    imports: [NgIconComponent, FilterPipe, FormsModule, ReactiveFormsModule],
    templateUrl: './animations.component.html',
    styleUrl: './animations.component.scss',
    viewProviders: [provideIcons({tablerCopy, tablerX})],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationsComponent {
    private readonly clipboard = inject(Clipboard);
    private readonly snackbar = inject(MatSnackBar);
    private readonly cdr = inject(ChangeDetectorRef);

    query = model<string>('');

    animationNames = signal<string[]>(animationNamesData.names);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

    copyAnimationName(name: string): void {
        if(!isPlatformBrowser(this.platformId))
            return;

        this.clipboard.copy(name);

        this.snackbar.open(`"${name}" copied to clipboard`, '', {duration: 2000});
    }
}
