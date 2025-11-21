import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./auth/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'cv',
    loadComponent: () => import('./your-cv/your-cv').then((m) => m.YourCv),
  },
  {
    path: 'cv/:userId',
    loadComponent: () => import('./your-cv/your-cv').then((m) => m.YourCv),
  },
  {
    path: 'domains',
    loadComponent: () => import('./manage-domain/manage-domain').then((m) => m.ManageDomain),
  },
];
