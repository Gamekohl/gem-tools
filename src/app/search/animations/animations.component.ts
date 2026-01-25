import {Clipboard} from "@angular/cdk/clipboard";
import {httpResource} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, inject, model} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {tablerCopy} from '@ng-icons/tabler-icons';
import {FilterPipe} from '../../pipes/filter.pipe';

@Component({
    selector: 'app-animations',
    imports: [NgIconComponent, FilterPipe, FormsModule],
    templateUrl: './animations.component.html',
    styleUrl: './animations.component.scss',
    viewProviders: [provideIcons({tablerCopy})],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnimationsComponent {
    private readonly clipboard = inject(Clipboard);
    private readonly snackbar = inject(MatSnackBar);

    animationNames = httpResource<{ names: string[] }>(() => 'assets/animation_names.json');

    query = model<string>('');

    copyAnimationName(name: string): void {
        this.clipboard.copy(name);

        this.snackbar.open(`"${name}" copied to clipboard`, '', {duration: 2000});
    }
}
