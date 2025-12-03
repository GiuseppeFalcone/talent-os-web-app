import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
import { Theme } from '../theme/theme';
import { HasRoleDirective } from '../rbac/directive/has-role-directive';
import { AuthService } from '../auth/service/auth-service';
import { TitleCasePipe } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonModule,
    SplitButtonModule,
    HasRoleDirective,
    TitleCasePipe,
    TooltipModule,
  ],
})
export class Navbar {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  readonly theme = inject(Theme);

  readonly isLoggedIn = computed(() => this.auth.isLoggedIn());
  readonly currentUser = computed(() => this.auth.currentUser());

  readonly userMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.navigateToProfile(),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.auth.logout(),
    },
  ]);

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
