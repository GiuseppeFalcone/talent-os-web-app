import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../auth/service/auth-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, RouterLink],
  templateUrl: './homepage.html',
})
export class Homepage {
  private readonly authService = inject(AuthService);

  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());
}
