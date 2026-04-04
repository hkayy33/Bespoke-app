import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../domain/services/auth.service';
import { RegisterRequest } from '../../domain/models/auth.models';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './register-page.html',
  styleUrls: ['./register-page.scss'],
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  successMessage = '';
  errorMessage = '';

  constructor(public authService: AuthService) {}

  register() {
    this.successMessage = '';
    this.errorMessage = '';

    const payload: RegisterRequest = {
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password,
    };

    this.authService.register(payload).subscribe((user) => {
      if (user) {
        this.successMessage = `Welcome, ${user.username}! Your account is ready.`;
        this.username = '';
        this.email = '';
        this.password = '';
      } else {
        this.errorMessage = this.authService.error() || 'Registration failed. Please try again.';
      }
    });
  }
}
