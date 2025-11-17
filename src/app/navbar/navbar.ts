import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { AuthService } from '../auth/service/auth-service';
import { AppHasRole } from '../rbac/directive/app-has-role';
import { Theme } from '../theme/theme';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ButtonModule, CommonModule, AppHasRole, SplitButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    role: 'navigation',
    'aria-label': 'Main',
  },
})
export class Navbar {
  private readonly router = inject(Router);
  readonly theme = inject(Theme);
  private readonly authService = inject(AuthService);

  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
  readonly currentUser = computed(() => this.authService.currentUser());

  readonly userMenuItems = computed<MenuItem[]>(() => [
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.onLogoutClick(),
    },
  ]);

  onLogoutClick(): void {
    this.authService.logout();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
