import {DatePipe} from "@angular/common";
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterLink} from "@angular/router";
import {CHANGELOG, ChangelogEntry} from "../../content/changelog/changelog.data";

@Component({
  selector: 'app-changelog',
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.scss',
  imports: [
    RouterLink,
    DatePipe
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
