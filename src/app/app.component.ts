import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerArrowsRandom, tablerBox, tablerBrandGithub, tablerCoffee } from '@ng-icons/tabler-icons';
import { inject } from '@vercel/analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIconComponent,
    RouterLink,
    RouterLinkActive
  ],
  viewProviders: [provideIcons({ tablerBox, tablerBrandGithub, tablerCoffee, tablerArrowsRandom })],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    inject();
  }
}
