import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'resources',
        loadComponent: () => import('./search/resources/resources.component').then(m => m.ResourcesComponent)
    },
    {
        path: 'animations',
        loadComponent: () => import('./search/animations/animations.component').then(m => m.AnimationsComponent)
    },
    {
        path: 'changelog',
        loadComponent: () => import('./changelog/changelog.component').then(m => m.ChangelogComponent)
    },
    {
        path: 'maps',
        loadComponent: () => import('./maps/maps.component').then(m => m.MapsComponent)
    },
    {
        path: '**',
        redirectTo: 'resources'
    }
];
