import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../domain/services/auth.service';
import { LoginRequest } from '../../domain/models/auth.models';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss'],
})
export class LoginPage {
  email = '';
  password = '';
  successMessage = '';
  errorMessage = '';

  constructor(public authService: AuthService) {}

  login() {
    this.successMessage = '';
    this.errorMessage = '';

    const payload: LoginRequest = {
      email: this.email.trim(),
      password: this.password,
    };

    this.authService.login(payload).subscribe((user) => {
      if (user) {
        this.successMessage = `Welcome back, ${user.username}!`;
        this.email = '';
        this.password = '';
      } else {
        this.errorMessage = this.authService.error() || 'Login failed. Please try again.';
      }
    });
  }
}
