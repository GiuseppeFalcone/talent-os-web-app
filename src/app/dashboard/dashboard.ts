import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../auth/service/auth-service';
import { UserRoleEnum } from '../enumeration/user-role-enum';
import { HasRoleDirective } from '../rbac/directive/has-role-directive';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, TitleCasePipe, RouterLink, ButtonModule, HasRoleDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  UserRoleEnum = UserRoleEnum;
  readonly authService = inject(AuthService);

  readonly currentUser = computed(() => this.authService.currentUser());
}
