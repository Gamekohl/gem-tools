import { Routes } from '@angular/router';
import { AnimationsComponent } from './search/animations/animations.component';
import { ResourcesComponent } from './search/resources/resources.component';

export const routes: Routes = [
    {
        path: 'search/resources',
        component: ResourcesComponent
    },
    {
        path: 'search/animations',
        component: AnimationsComponent
    },
    {
        path: '**',
        redirectTo: 'search/resources'
    }
];
