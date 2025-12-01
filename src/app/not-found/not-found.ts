import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  imports: [ButtonModule, RouterLink],
  templateUrl: './not-found.html',
})
export class NotFound {
  private location = inject(Location);
  private router = inject(Router);

  goBack(): void {
    if (
      (window.history.state && window.history.state.navigationId > 1) ||
      window.history.length > 1
    ) {
      this.location.back();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
