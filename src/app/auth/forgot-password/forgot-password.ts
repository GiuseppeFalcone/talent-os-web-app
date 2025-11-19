import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../service/auth-service';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

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
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal(false);

  readonly forgotPasswordForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, passwordMatchValidator]],
  });

  readonly usernameControl = this.forgotPasswordForm.controls.username;
  readonly newPasswordControl = this.forgotPasswordForm.controls.newPassword;
  readonly confirmPasswordControl = this.forgotPasswordForm.controls.confirmPassword;

  private readonly usernameValSig = toSignal(this.usernameControl.valueChanges, {
    initialValue: this.usernameControl.value,
  });
  private readonly usernameStatusSig = toSignal(this.usernameControl.statusChanges, {
    initialValue: this.usernameControl.status,
  });
  private readonly newPasswordValSig = toSignal(this.newPasswordControl.valueChanges, {
    initialValue: this.newPasswordControl.value,
  });
  private readonly newPasswordStatusSig = toSignal(this.newPasswordControl.statusChanges, {
    initialValue: this.newPasswordControl.status,
  });
  private readonly confirmPasswordValSig = toSignal(this.confirmPasswordControl.valueChanges, {
    initialValue: this.confirmPasswordControl.value,
  });
  private readonly confirmPasswordStatusSig = toSignal(this.confirmPasswordControl.statusChanges, {
    initialValue: this.confirmPasswordControl.status,
  });

  readonly usernameInvalid = computed(() => {
    this.usernameValSig();
    this.usernameStatusSig();
    return (
      this.usernameControl.invalid && (this.usernameControl.touched || this.usernameControl.dirty)
    );
  });

  readonly newPasswordInvalid = computed(() => {
    this.newPasswordValSig();
    this.newPasswordStatusSig();
    return (
      this.newPasswordControl.invalid &&
      (this.newPasswordControl.touched || this.newPasswordControl.dirty)
    );
  });

  readonly confirmPasswordInvalid = computed(() => {
    this.confirmPasswordValSig();
    this.confirmPasswordStatusSig();
    return (
      this.confirmPasswordControl.invalid &&
      (this.confirmPasswordControl.touched || this.confirmPasswordControl.dirty)
    );
  });

  constructor() {
    this.newPasswordControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.confirmPasswordControl.updateValueAndValidity());
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid || this.isSubmitting()) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { username, newPassword } = this.forgotPasswordForm.getRawValue();

    this.authService
      .resetPassword(username, newPassword)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Password Reset Successful',
            detail: 'Your password has been reset. Redirecting to login...',
            life: 3000,
          });
          this.forgotPasswordForm.reset();
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err: HttpErrorResponse) => {
          const errorMsg =
            err.status === 404
              ? 'Username not found. Please check and try again.'
              : 'An unexpected error occurred. Please try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Reset Failed',
            detail: errorMsg,
            life: 5000,
          });
        },
      });
  }
}
