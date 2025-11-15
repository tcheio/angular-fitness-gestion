import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(c => c.LoginComponent),
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./home/home.component').then(c => c.HomeComponent),
  },

  {
    path: 'users',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES),
  },

  {
    path: 'planning',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/planning/planning.routes').then(
        m => m.PLANNING_ROUTES
      ),
  },

  // Au lancement → redirection vers /login
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
