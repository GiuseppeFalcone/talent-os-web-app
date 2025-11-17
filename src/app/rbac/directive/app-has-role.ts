import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { AuthService } from '../../auth/service/auth-service';
import { UserRoleEnum } from '../../enumeration/user-role-enum';

type RoleToken = UserRoleEnum | keyof typeof UserRoleEnum | string;

@Directive({
  selector: '[appHasRole]',
})
export class AppHasRole {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authService = inject(AuthService);

  private mapRole = (raw: RoleToken | null | undefined): UserRoleEnum | null => {
    if (raw == null) return null;
    if (typeof raw === 'number') return raw as UserRoleEnum;
    const key = raw.toString().trim().toUpperCase();
    const mapped = (UserRoleEnum as any)[key];
    return typeof mapped === 'number' ? (mapped as UserRoleEnum) : null;
  };

  private readonly currentRole = computed<UserRoleEnum | null>(() =>
    this.mapRole(this.authService.currentUser()?.role as RoleToken)
  );

  readonly rolesInput = input<RoleToken | RoleToken[] | null>(null, {
    alias: 'appHasRole',
  });

  private readonly roles = computed<UserRoleEnum[]>(() => {
    const value = this.rolesInput();
    if (value == null) return [];
    const items = Array.isArray(value) ? value : [value];
    return items.map((r) => this.mapRole(r)).filter((r): r is UserRoleEnum => r != null);
  });

  private readonly isAuthorized = computed(() => {
    const role = this.currentRole();
    return role != null && this.roles().includes(role);
  });

  private readonly hasView = signal(false);

  private readonly syncView = effect(() => {
    const allowed = this.isAuthorized();
    if (allowed && !this.hasView()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView.set(true);
    } else if (!allowed && this.hasView()) {
      this.viewContainer.clear();
      this.hasView.set(false);
    }
  });
}
