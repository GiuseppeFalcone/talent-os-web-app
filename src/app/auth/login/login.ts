import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { toSignal } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
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
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  readonly isSubmitting = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly usernameControl = this.loginForm.controls.username;
  readonly passwordControl = this.loginForm.controls.password;

  private readonly usernameValSig = toSignal(this.usernameControl.valueChanges, {
    initialValue: this.usernameControl.value,
  });
  private readonly usernameStatusSig = toSignal(this.usernameControl.statusChanges, {
    initialValue: this.usernameControl.status,
  });
  private readonly passwordValSig = toSignal(this.passwordControl.valueChanges, {
    initialValue: this.passwordControl.value,
  });
  private readonly passwordStatusSig = toSignal(this.passwordControl.statusChanges, {
    initialValue: this.passwordControl.status,
  });

  readonly usernameInvalid = computed(() => {
    this.usernameValSig();
    this.usernameStatusSig();
    return (
      this.usernameControl.invalid && (this.usernameControl.touched || this.usernameControl.dirty)
    );
  });

  readonly passwordInvalid = computed(() => {
    this.passwordValSig();
    this.passwordStatusSig();
    return (
      this.passwordControl.invalid && (this.passwordControl.touched || this.passwordControl.dirty)
    );
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { username, password } = this.loginForm.getRawValue();

    this.authService
      .login(username, password)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Welcome back!',
            detail: 'You have successfully logged in.',
            life: 3000,
          });
          this.router.navigate(['/dashboard']);
        },
        error: (err: HttpErrorResponse) => {
          const errorMsg =
            err.status === 401
              ? 'Invalid credentials. Please try again.'
              : 'An unexpected error occurred. Please try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Login Failed',
            detail: errorMsg,
            life: 5000,
          });
        },
      });
  }
}
