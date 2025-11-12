import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../service/theme/theme';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
    role: 'navigation',
    'aria-label': 'Main',
  },
})
export class NavbarComponent {
  private router = inject(Router);
  readonly theme = inject(ThemeService);

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
