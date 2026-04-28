import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './shared/nav-bar/nav-bar';
import { Footer } from './shared/footer/footer';
import { AuthPage } from './components/auth-page/auth-page';
import { SavedDuasModal } from './components/saved-duas-modal/saved-duas-modal';
import { UserProfileModal } from './components/user-profile-modal/user-profile-modal';
import { PlanModal } from './components/plan-modal/plan-modal';
import { AuthService } from './domain/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavBar, RouterOutlet, Footer, AuthPage, SavedDuasModal, UserProfileModal, PlanModal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('bespoke-dua-client');
  protected readonly showSavedDuasModal = signal(false);
  protected readonly showUserProfileModal = signal(false);

  constructor(protected authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.user()) {
      this.authService.validateStoredSession().subscribe();
    }
  }

  onMyDuaClicked(): void {
    if (!this.authService.user()) {
      this.authService.setShowAuthPage(true);
      return;
    }
    this.showSavedDuasModal.set(true);
  }

  onAuthClicked(): void {
    this.authService.setShowAuthPage(true);
  }

  onAccountClicked(): void {
    this.showUserProfileModal.set(true);
  }

  closeSavedDuasModal(): void {
    this.showSavedDuasModal.set(false);
  }

  closeUserProfileModal(): void {
    this.showUserProfileModal.set(false);
  }

  closePlanModal(): void {
    this.authService.setShowPlanModal(false);
  }
}
