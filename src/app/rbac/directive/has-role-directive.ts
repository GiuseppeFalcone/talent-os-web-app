import { Directive, input, inject, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { AuthService } from '../../auth/service/auth-service';

@Directive({
  selector: '[appHasRole]',
})
export class HasRoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly auth = inject(AuthService);

  readonly appHasRole = input.required<string[]>();

  constructor() {
    effect(() => {
      const requiredRoles = this.appHasRole();
      const userRole = this.auth.currentUser()?.role ?? 'guest';

      const hasAccess = requiredRoles.some((role) => role === userRole);

      if (hasAccess) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    });
  }
}
