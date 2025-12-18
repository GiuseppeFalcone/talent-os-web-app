import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { TitleCasePipe, NgClass, CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AuthService } from '../auth/service/auth-service';
import { ManageUserService } from '../manage-user/service/manage-user-service';
import { UserLightDto } from '../dashboard/model/user-light-dto';
import { Credential } from '../auth/model/credential';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  catchError,
  map,
} from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HasRoleDirective } from '../rbac/directive/has-role-directive';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;

  const newPassword = parent.get('newPassword');
  const confirmPassword = control;

  if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    DialogModule,
    PasswordModule,
    FloatLabelModule,
    TitleCasePipe,
    HasRoleDirective,
  ],
  templateUrl: './profile.html',
})
export class Profile implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(ManageUserService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly isSaving = signal(false);
  readonly currentUser = signal<UserLightDto | null>(null);
  readonly isEditMode = signal(false);

  readonly passwordDialogVisible = signal(false);

  private usernameCheckSub?: Subscription;

  readonly profileForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, passwordMatchValidator]],
  });

  constructor() {
    this.passwordForm.controls.newPassword.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.passwordForm.controls.confirmPassword.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.setupUsernameCheck();
  }

  ngOnDestroy(): void {
    this.usernameCheckSub?.unsubscribe();
  }

  toggleEditMode(): void {
    this.isEditMode.update((v) => !v);
    if (this.isEditMode()) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadUserProfile();
    }
  }

  private loadUserProfile(): void {
    const user = this.authService.currentUser();

    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Not logged in',
      });
      return;
    }

    this.currentUser.set(user);
    this.profileForm.disable();

    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    });
  }

  private setupUsernameCheck(): void {
    const usernameControl = this.profileForm.controls.username;

    this.usernameCheckSub = usernameControl.valueChanges
      .pipe(
        filter(() => this.isEditMode()),
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((value: string) => {
          if (!value || value.length < 3) {
            return of(null);
          }

          const current = this.currentUser();
          if (current && value === current.username) {
            return of(null);
          }

          return this.userService
            .getUsers({
              page: 1,
              pageSize: 1,
              matchUsername: value,
            })
            .pipe(
              map(() => null),
              catchError((err: HttpErrorResponse) => {
                if (err.status === 409) {
                  return of({ notUnique: true });
                }
                return of(null);
              })
            );
        })
      )
      .subscribe((result) => {
        if (result && result.notUnique) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Username is already taken',
          });
          usernameControl.setErrors({ notUnique: true });
        } else {
          if (usernameControl.hasError('notUnique')) {
            const errors = { ...usernameControl.errors };
            delete errors['notUnique'];
            usernameControl.setErrors(Object.keys(errors).length ? errors : null);
          }
        }
      });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || !this.currentUser()) return;

    this.isSaving.set(true);
    const formValues = this.profileForm.getRawValue();
    const originalUser = this.currentUser()!;

    const updatedUser: Partial<UserLightDto> = {
      userId: originalUser.userId,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      username: formValues.username,
      role: originalUser.role,
      email: formValues.email,
      refreshToken: originalUser.refreshToken,
    };

    this.userService.patchUser(originalUser.userId, updatedUser).subscribe({
      next: (result) => {
        this.currentUser.set(result as unknown as UserLightDto);

        this.messageService.add({
          severity: 'success',
          summary: 'Profile Updated',
          detail: 'Your details have been saved successfully.',
        });
        this.isSaving.set(false);
        this.toggleEditMode();
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Update Failed',
          detail: err.error?.message || 'Could not update profile.',
        });
      },
    });
  }

  openChangePasswordDialog(): void {
    this.passwordForm.reset();
    this.passwordDialogVisible.set(true);
  }

  savePassword(): void {
    if (this.passwordForm.invalid || !this.currentUser()) return;

    const { newPassword } = this.passwordForm.getRawValue();

    const credential: Credential = {
      username: this.currentUser()!.username,
      password: newPassword,
    };

    this.userService.resetPassword(credential).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Password changed successfully.',
        });
        this.passwordDialogVisible.set(false);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to change password.',
        });
      },
    });
  }
}
