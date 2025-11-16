import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { roleGuard } from './auth/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((c) => c.LoginComponent),
  },

  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./home/home.component').then((c) => c.HomeComponent),
  },

  /* Users : uniquement admin */
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
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
        (m) => m.PLANNING_ROUTES
      ),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import(
        './features/planning/pages/planning-calendar/planning-calendar.component'
      ).then((c) => c.PlanningCalendarComponent),
  },

  // Liste des cours (admin + prof)
  {
    path: 'cours',
    canActivate: [roleGuard],
    data: { roles: ['admin', 'prof'] },
    loadComponent: () =>
      import(
        './features/planning/pages/course-list/course-list.component'
      ).then((c) => c.CourseListComponent),
  },
  {
    path: 'cours/mine',
    canActivate: [roleGuard],
    data: { roles: ['adherent'] },
    loadComponent: () =>
      import('./features/planning/classes/classes.component').then(
        (c) => c.ClassesComponent
      ),
  },

  // Création
  {
    path: 'cours/new',
    canActivate: [roleGuard],
    data: { roles: ['admin', 'prof'] },
    loadComponent: () =>
      import(
        './features/planning/pages/course-form/course-form.component'
      ).then((c) => c.CourseFormComponent),
  },

  // Edition
  {
    path: 'cours/:id/edit',
    canActivate: [roleGuard],
    data: { roles: ['admin', 'prof'] },
    loadComponent: () =>
      import(
        './features/planning/pages/course-form/course-form.component'
      ).then((c) => c.CourseFormComponent),
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
