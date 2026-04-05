import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../domain/services/auth.service';
import { RegisterRequest } from '../../domain/models/auth.models';

/** Letters, numbers, underscore, hyphen; must start with letter or number. */
const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,98}$/;

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
})
export class RegisterPage implements OnDestroy {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);

  private sub = new Subscription();

  successMessage = '';

  form = this.fb.nonNullable.group({
    username: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(100), Validators.pattern(USERNAME_PATTERN)],
    ],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.sub.add(
      this.form.valueChanges.subscribe(() => {
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

  usernameError(): string | null {
    const c = this.form.controls.username;
    if (!this.showFieldError(c)) return null;
    if (c.errors?.['required']) return 'Username is required.';
    if (c.errors?.['minlength']) {
      const min = c.errors['minlength'].requiredLength;
      return `Username must be at least ${min} characters.`;
    }
    if (c.errors?.['maxlength']) {
      const max = c.errors['maxlength'].requiredLength;
      return `Username must be at most ${max} characters.`;
    }
    if (c.errors?.['pattern']) {
      return 'Use letters, numbers, underscores, or hyphens (cannot start with a hyphen).';
    }
    return null;
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

  serverErrorText(): string | null {
    return this.authService.error();
  }

  register(): void {
    this.successMessage = '';
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const raw = this.form.getRawValue();
    const payload: RegisterRequest = {
      username: raw.username.trim(),
      email: raw.email.trim(),
      password: raw.password,
    };

    this.authService.register(payload).subscribe((user) => {
      if (user) {
        this.successMessage = `Welcome, ${user.username}! Your account is ready.`;
        this.form.reset();
      }
    });
  }
}
