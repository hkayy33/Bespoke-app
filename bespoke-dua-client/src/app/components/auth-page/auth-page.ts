import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginPage } from './login-page';
import { RegisterPage } from './register-page';
import { AuthService } from '../../domain/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-auth-page',
  imports: [CommonModule, LoginPage, RegisterPage],
  templateUrl: './auth-page.html',
  styleUrls: ['./auth-page.scss'],
})
export class AuthPage {
  activeTab = signal<'login' | 'register'>('login');

  constructor(public authService: AuthService) {}

  selectTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
  }

  closeModal() {
    this.authService.setShowAuthPage(false);
  }
}
