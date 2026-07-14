import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../domain/services/auth.service';
import { LoginRequest } from '../../domain/models/auth.models';
import { isSupabaseConfigured } from '../../core/supabase.client';

type LoginView = 'login' | 'forgot' | 'reset-sent' | 'set-password';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  if (password && confirm && password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
})
export class LoginPage implements OnDestroy {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);

  private sub = new Subscription();

  readonly supabaseAuth = isSupabaseConfigured();
  view = signal<LoginView>('login');
  successMessage = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  resetPasswordForm = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: passwordsMatch }
  );

  constructor() {
    if (this.authService.passwordRecoveryPending()) {
      this.view.set('set-password');
    }

    this.sub.add(
      this.form.valueChanges.subscribe(() => {
        this.authService.clearError();
        this.successMessage = '';
      })
    );

    this.sub.add(
      this.forgotForm.valueChanges.subscribe(() => {
        this.authService.clearError();
        this.successMessage = '';
      })
    );

    this.sub.add(
      this.resetPasswordForm.valueChanges.subscribe(() => {
        this.authService.clearError();
        this.successMessage = '';
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  showFieldError(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  emailError(): string | null {
    const c = this.form.controls.email;
    if (!this.showFieldError(c)) return null;
    if (c.errors?.['required']) return 'Email is required.';
    if (c.errors?.['email']) return 'Enter a valid email address.';
    return null;
  }

  passwordError(): string | null {
    const c = this.form.controls.password;
    if (!this.showFieldError(c)) return null;
    if (c.errors?.['required']) return 'Password is required.';
    if (c.errors?.['minlength']) {
      const min = c.errors['minlength'].requiredLength;
      return `Password must be at least ${min} characters.`;
    }
    return null;
  }

  forgotEmailError(): string | null {
    const c = this.forgotForm.controls.email;
    if (!this.showFieldError(c)) return null;
    if (c.errors?.['required']) return 'Email is required.';
    if (c.errors?.['email']) return 'Enter a valid email address.';
    return null;
  }

  newPasswordError(): string | null {
    const c = this.resetPasswordForm.controls.password;
    if (!this.showFieldError(c)) return null;
    if (c.errors?.['required']) return 'Password is required.';
    if (c.errors?.['minlength']) {
      const min = c.errors['minlength'].requiredLength;
      return `Password must be at least ${min} characters.`;
    }
    return null;
  }

  confirmPasswordError(): string | null {
    const c = this.resetPasswordForm.controls.confirmPassword;
    if (!this.showFieldError(c)) return null;
    if (c.errors?.['required']) return 'Please confirm your password.';
    if (
      this.resetPasswordForm.errors?.['passwordMismatch'] &&
      (c.dirty || c.touched)
    ) {
      return 'Passwords do not match.';
    }
    return null;
  }

  serverErrorText(): string | null {
    return this.authService.error();
  }

  showForgotPassword(): void {
    this.successMessage = '';
    this.authService.clearError();
    const email = this.form.controls.email.value.trim();
    if (email) {
      this.forgotForm.patchValue({ email });
    }
    this.view.set('forgot');
  }

  backToLogin(): void {
    this.successMessage = '';
    this.authService.clearError();
    this.view.set('login');
  }

  cancelPasswordReset(): void {
    this.authService.clearPasswordRecovery();
    this.resetPasswordForm.reset();
    this.backToLogin();
  }

  login(): void {
    this.successMessage = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: LoginRequest = {
      email: raw.email.trim(),
      password: raw.password,
    };

    this.authService.login(payload).subscribe((user) => {
      if (user) {
        this.successMessage = `Welcome back, ${user.username}!`;
        this.form.reset();
      }
    });
  }

  sendResetEmail(): void {
    this.successMessage = '';
    this.forgotForm.markAllAsTouched();

    if (this.forgotForm.invalid) {
      return;
    }

    const email = this.forgotForm.getRawValue().email.trim();
    this.authService.requestPasswordReset(email).subscribe((sent) => {
      if (sent) {
        this.view.set('reset-sent');
      }
    });
  }

  saveNewPassword(): void {
    this.successMessage = '';
    this.resetPasswordForm.markAllAsTouched();

    if (this.resetPasswordForm.invalid) {
      return;
    }

    const password = this.resetPasswordForm.getRawValue().password;
    this.authService.completePasswordReset(password).subscribe((user) => {
      if (user) {
        this.successMessage = `Password updated. Welcome back, ${user.username}!`;
        this.resetPasswordForm.reset();
        this.view.set('login');
      }
    });
  }
}
