import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'search/resources',
        loadComponent: () => import('./search/resources/resources.component').then(m => m.ResourcesComponent)
    },
    {
        path: 'search/animations',
        loadComponent: () => import('./search/animations/animations.component').then(m => m.AnimationsComponent)
    },
    {
        path: 'changelog',
        loadComponent: () => import('./changelog/changelog.component').then(m => m.ChangelogComponent)
    },
    {
        path: '**',
        redirectTo: 'search/resources'
    }
];
