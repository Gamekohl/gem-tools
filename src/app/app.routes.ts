import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'resources',
        loadComponent: () => import('./pages/resources/resources.component').then(m => m.ResourcesComponent),
        title: 'Editor Objects - GEM-Tools'
    },
    {
        path: 'animations',
        loadComponent: () => import('./pages/animations/animations.component').then(m => m.AnimationsComponent),
        title: 'Animations - GEM-Tools'
    },
    {
        path: 'changelog',
        loadComponent: () => import('./pages/changelog/changelog.component').then(m => m.ChangelogComponent),
        title: 'Changelog - GEM-Tools'
    },
    {
        path: 'maps',
        loadComponent: () => import('./pages/maps/maps.component').then(m => m.MapsComponent),
        title: 'Maps - GEM-Tools'
    },
    {
        path: 'tutorials',
        loadComponent: () => import('./pages/tutorials/tutorials.component').then(m => m.TutorialsComponent),
        title: 'Tutorials - GEM-Tools'
    },
    {
        path: 'tutorials/:id',
        loadComponent: () => import('./pages/tutorials/tutorial/tutorial.component').then(m => m.TutorialComponent),
    },
    {
        path: '**',
        redirectTo: 'resources'
    }
];
