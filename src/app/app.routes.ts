import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'resources',
        loadComponent: () => import('./pages/resources/resources.component').then(m => m.ResourcesComponent),
        title: 'GEM-Tools: Resources'
    },
    {
        path: 'animations',
        loadComponent: () => import('./pages/animations/animations.component').then(m => m.AnimationsComponent),
        title: 'GEM-Tools: Animations'
    },
    {
        path: 'changelog',
        loadComponent: () => import('./pages/changelog/changelog.component').then(m => m.ChangelogComponent),
        title: 'GEM-Tools: Changelog'
    },
    {
        path: 'maps',
        loadComponent: () => import('./pages/maps/maps.component').then(m => m.MapsComponent),
        title: 'GEM-Tools: Maps'
    },
    {
        path: 'tutorials',
        loadComponent: () => import('./pages/tutorials/tutorials.component').then(m => m.TutorialsComponent),
        title: 'GEM-Tools: Tutorials'
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
