import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    // Usiamo il lazy loading come da istruzioni
    loadComponent: () => import('./login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    // Aggiungiamo la nuova rotta con lazy loading
    loadComponent: () =>
      import('./forgot-password/forgot-password').then((m) => m.ForgotPasswordComponent),
  },
];
