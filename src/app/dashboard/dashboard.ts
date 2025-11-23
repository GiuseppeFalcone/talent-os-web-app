import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../auth/service/auth-service';
import { UserRoleEnum } from '../enumeration/user-role-enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, TitleCasePipe, RouterLink, ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  UserRoleEnum = UserRoleEnum;
  readonly authService = inject(AuthService);

  readonly currentUser = computed(() => this.authService.currentUser());

  readonly isManager = computed(() => this.currentUser()?.role === UserRoleEnum.MANAGER);
  readonly isAdmin = computed(() =>
    [UserRoleEnum.ADMIN, UserRoleEnum.SUPERADMIN].includes(this.currentUser()?.role as UserRoleEnum)
  );
}
