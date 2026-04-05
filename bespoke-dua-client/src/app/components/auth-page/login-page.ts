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
import { LoginRequest } from '../../domain/models/auth.models';

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

  successMessage = '';

  form = this.fb.nonNullable.group({
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
}
