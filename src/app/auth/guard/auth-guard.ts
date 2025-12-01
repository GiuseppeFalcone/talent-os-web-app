import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth-service';
import { UserRoleEnum } from '../../enumeration/user-role-enum';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  const requiredRoles = route.data['roles'] as UserRoleEnum[];
  const userRole = authService.currentUser()?.role;

  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    return router.navigate(['/unauthorized'], { replaceUrl: true });
  }

  return true;
};
