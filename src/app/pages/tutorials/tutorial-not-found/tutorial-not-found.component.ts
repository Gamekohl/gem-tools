import {Component} from '@angular/core';
import {RouterLink} from "@angular/router";
import {NgIcon, provideIcons} from "@ng-icons/core";
import {tablerArrowLeft, tablerGitPullRequest, tablerInfoCircle} from "@ng-icons/tabler-icons";

@Component({
    selector: 'app-tutorial-not-found',
    imports: [
        NgIcon,
        RouterLink
    ],
    template: `
        <main class="mx-auto max-w-6xl">
            <div
                    class="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-white/5 p-6 sm:p-8 shadow-sm">
                <div class="flex flex-col gap-6">
                    <div class="flex items-start justify-between gap-4">
                        <div class="min-w-0">
                            <h1 class="text-xl sm:text-2xl font-semibold text-black dark:text-white"
                                data-testid="title">
                                Tutorial not found
                            </h1>
                            <p class="mt-2 text-sm sm:text-base text-black/50 dark:text-white/50">
                                This tutorial doesn't exist yet or it was an incorrect link. You can start contributing
                                to
                                provide this tutorial.
                            </p>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <div class="flex items-center gap-2 text-sm">
                            <ng-icon name="tablerInfoCircle"></ng-icon>
                            <span
                                    class="text-black! dark:text-white/75!"><b>It's easy:</b> Contributions are done through Markdown.</span>
                        </div>

                        <div class="flex flex-col sm:flex-row gap-2">
                            <a
                                    [routerLink]="['/tutorials']"
                                    class="inline-flex items-center justify-center rounded-xl gap-2 px-4 py-2 text-sm font-medium border border-slate-200/70 dark:border-white/10
                     hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                <ng-icon name="tablerArrowLeft"></ng-icon>
                                Back to tutorials
                            </a>

                            <a
                                    class="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold
                     bg-black text-white! dark:bg-white dark:text-black! hover:opacity-90 transition-opacity"
                                    href="https://github.com/Gamekohl/gem-tools"
                                    rel="noopener noreferrer"
                                    target="_blank">
                                <ng-icon class="dark:text-black!" name="tablerGitPullRequest"></ng-icon>
                                Contribute
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    `,
    viewProviders: [
        provideIcons({tablerInfoCircle, tablerArrowLeft, tablerGitPullRequest})
    ]
})
export class TutorialNotFoundComponent {
}
