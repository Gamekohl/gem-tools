import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerEyeSearch } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIconComponent,
    RouterLink,
    RouterLinkActive
  ],
  viewProviders: [provideIcons({ tablerEyeSearch })],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
