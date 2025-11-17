import { TitleCasePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { AuthService } from '../auth/service/auth-service';
import { UserRoleEnum } from '../enumeration/user-role-enum';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  UserRoleEnum = UserRoleEnum;
  readonly authService = inject(AuthService);

  readonly currentUser = computed(() => this.authService.currentUser());
}
