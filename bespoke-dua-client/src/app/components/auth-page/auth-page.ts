import { Component, ViewChild, signal } from '@angular/core';
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

  @ViewChild(RegisterPage) private registerPage?: RegisterPage;

  constructor(public authService: AuthService) {
    if (this.authService.awaitingEmailVerification()) {
      this.activeTab.set('register');
    }

    if (this.authService.passwordRecoveryPending()) {
      this.activeTab.set('login');
    }
  }

  showAuthToggle(): boolean {
    if (this.authService.passwordRecoveryPending()) {
      return false;
    }

    return !(this.activeTab() === 'register' && this.authService.awaitingEmailVerification());
  }

  selectTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    if (tab === 'login') {
      this.authService.clearError();
    }
  }

  editRegistrationFromVerify(): void {
    this.registerPage?.editRegistration();
  }

  closeModal() {
    this.authService.setShowAuthPage(false);
  }
}
