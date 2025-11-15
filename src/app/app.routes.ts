import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

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

  /* Users : uniquement admin */
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./features/users/users.routes').then(m => m.USERS_ROUTES),
  },

  /* Planning :
     - admin → tous les cours
     - prof → ses cours
     - adherent → ses cours inscrits
  */
  {
    path: 'planning',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'prof', 'adherent'] },
    loadChildren: () =>
      import('./features/planning/planning.routes').then(
        m => m.PLANNING_ROUTES
      ),
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
