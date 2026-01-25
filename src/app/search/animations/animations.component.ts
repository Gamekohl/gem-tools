import {Clipboard} from "@angular/cdk/clipboard";
import {AsyncPipe} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {Component, inject, model, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {tablerCopy} from '@ng-icons/tabler-icons';
import {map, Observable} from 'rxjs';
import {FilterPipe} from '../../pipes/filter.pipe';

@Component({
    selector: 'app-animations',
    imports: [AsyncPipe, NgIconComponent, FilterPipe, FormsModule],
    templateUrl: './animations.component.html',
    styleUrl: './animations.component.scss',
    viewProviders: [provideIcons({tablerCopy})]
})
export class AnimationsComponent implements OnInit {
    private readonly clipboard = inject(Clipboard);
    private readonly snackbar = inject(MatSnackBar);
    private readonly http = inject(HttpClient);

    animationNames$: Observable<string[]>;

    query = model<string>('');

    ngOnInit(): void {
        this.animationNames$ = this.http.get<{ names: string[] }>('assets/animation_names.json').pipe(
            map(({names}) => names)
        );
    }

    copyAnimationName(name: string): void {
        this.clipboard.copy(name);

        this.snackbar.open(`"${name}" copied to clipboard`, '', {duration: 2000});
    }
}
