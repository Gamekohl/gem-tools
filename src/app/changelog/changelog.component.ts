import {DatePipe, NgClass} from "@angular/common";
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {CHANGELOG, ChangelogEntry} from "../../content/changelog/changelog.data";

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.scss',
    imports: [
        DatePipe,
        NgClass
    ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangelogComponent {
  readonly changelog = CHANGELOG;

  selectedEntry = signal<ChangelogEntry>(this.changelog[0]);

  selectEntry(entry: ChangelogEntry): void {
    this.selectedEntry.set(entry);
  }
}
