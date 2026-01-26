import {NgOptimizedImage} from "@angular/common";
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {tablerArrowsRandom, tablerBox, tablerBrandGithub, tablerCoffee, tablerPhotoEdit} from '@ng-icons/tabler-icons';
import {inject} from '@vercel/analytics';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NgIconComponent,
    RouterLink,
    RouterLinkActive,
    NgOptimizedImage
  ],
  viewProviders: [provideIcons({ tablerBox, tablerBrandGithub, tablerCoffee, tablerArrowsRandom, tablerPhotoEdit })],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    inject();
  }
}
