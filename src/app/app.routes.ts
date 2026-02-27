import {Routes} from '@angular/router';
import {tutorialResolver} from './pages/tutorials/tutorial/tutorial.resolver';

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
        loadComponent: () => import('./pages/tutorials/tutorial/tutorial.component').then(m => m.TutorialComponent),
        path: 'tutorials/:id',
        resolve: {
            tutorial: tutorialResolver
        },
    },
    {
        loadComponent: () => import('./pages/tutorials/tutorial-not-found/tutorial-not-found.component').then(m => m.TutorialNotFoundComponent),
        path: 'tutorial-not-found',
    },
    {
        path: '**',
        redirectTo: 'resources'
    }
];
