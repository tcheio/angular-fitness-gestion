import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES),
  },
  {
    path: 'planning',
    loadChildren: () =>
      import('./features/planning/planning.routes').then(
        m => m.PLANNING_ROUTES
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
