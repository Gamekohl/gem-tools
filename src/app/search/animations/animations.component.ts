import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, model, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerCopy } from '@ng-icons/tabler-icons';
import { map, Observable } from 'rxjs';
import { FilterPipe } from '../../pipes/filter.pipe';

@Component({
  selector: 'app-animations',
  standalone: true,
  imports: [AsyncPipe, NgIconComponent, FilterPipe, FormsModule],
  templateUrl: './animations.component.html',
  styleUrl: './animations.component.scss',
  viewProviders: [provideIcons({ tablerCopy })]
})
export class AnimationsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  animationNames$: Observable<string[]>;

  query = model<string>('');

  ngOnInit(): void {
    this.animationNames$ = this.http.get<{ names: string[] }>('http://localhost:4200/assets/animation_names.json').pipe(
      map(({ names }) => names)
    );
  }

  copyAnimationName(name: string): void {
    navigator.clipboard.writeText(name);
  }
}
