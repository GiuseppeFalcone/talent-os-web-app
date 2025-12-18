import { Routes } from '@angular/router';
import { authGuard } from './auth/guard/auth-guard';
import { UserRoleEnum } from './enumeration/user-role-enum';

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
    path: 'unauthorized',
    loadComponent: () => import('./unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
  },
  {
    path: 'cv',
    loadComponent: () => import('./your-cv/your-cv').then((m) => m.YourCv),
    canActivate: [authGuard],
    data: {
      roles: [
        UserRoleEnum.ADMIN,
        UserRoleEnum.MANAGER,
        UserRoleEnum.EMPLOYEE,
        UserRoleEnum.SUPERADMIN,
      ],
    },
  },
  {
    path: 'cv/:userId',
    loadComponent: () => import('./your-cv/your-cv').then((m) => m.YourCv),
    canActivate: [authGuard],
    data: {
      roles: [
        UserRoleEnum.ADMIN,
        UserRoleEnum.MANAGER,
        UserRoleEnum.EMPLOYEE,
        UserRoleEnum.SUPERADMIN,
      ],
    },
  },
  {
    path: 'domains',
    loadComponent: () => import('./manage-domain/manage-domain').then((m) => m.ManageDomain),
    canActivate: [authGuard],
    data: { roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN] },
  },
  {
    path: 'employees',
    loadComponent: () => import('./your-employee/your-employee').then((m) => m.YourEmployee),
    canActivate: [authGuard],
    data: { roles: [UserRoleEnum.MANAGER] },
  },
  {
    path: 'manage-users',
    loadComponent: () => import('./manage-user/manage-user').then((m) => m.ManageUser),
    canActivate: [authGuard],
    data: { roles: [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN] },
  },
  {
    path: '',
    loadComponent: () => import('./homepage/homepage').then((m) => m.Homepage),
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound),
  },
];
