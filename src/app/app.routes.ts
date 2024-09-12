import { Routes } from '@angular/router';
import { AnimationsComponent } from './search/animations/animations.component';

export const routes: Routes = [
    {
        path: 'search/animations',
        component: AnimationsComponent
    },
    {
        path: '**',
        redirectTo: 'search/animations'
    }
];
