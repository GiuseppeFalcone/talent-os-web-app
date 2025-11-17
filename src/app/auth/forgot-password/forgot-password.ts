import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../service/auth-service';

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
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    PasswordModule,
    ToastModule,
    CommonModule,
  ],
  templateUrl: './forgot-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService],
  host: {
    class: 'block',
  },
})
export class Forgotpassword {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly forgotPasswordForm = this.fb.group({
    username: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, passwordMatchValidator]],
  });

  // Getter for easy access to form controls in the template
  get f() {
    return this.forgotPasswordForm.controls;
  }

  // REMOVED: formStatus, usernameInvalid, newPasswordInvalid, confirmPasswordInvalid

  constructor() {
    // This logic is correct and necessary to re-validate confirmPassword
    // when newPassword changes.
    this.f.newPassword.valueChanges.subscribe(() => {
      this.f.confirmPassword.updateValueAndValidity();
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.authService
      .resetPassword(this.f.username.value as string, this.f.newPassword.value as string)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Password reset successfully! Redirecting to login...',
            life: 3000,
          });
          this.forgotPasswordForm.reset();
          setTimeout(() => this.router.navigate(['/login']), 3000);
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
