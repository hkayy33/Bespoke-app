import { Component, signal } from '@angular/core';
import { NavBar } from './shared/nav-bar/nav-bar';
import { InputSection } from './components/input-section/input-section';
import { DuaResult } from './components/dua-result/dua-result';
import { AuthPage } from './components/auth-page/auth-page';
import { SavedDuasModal } from './components/saved-duas-modal/saved-duas-modal';
import { AuthService } from './domain/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [NavBar, InputSection, DuaResult, AuthPage, SavedDuasModal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('bespoke-dua-client');
  protected readonly showSavedDuasModal = signal(false);

  constructor(protected authService: AuthService) {}

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

  closeSavedDuasModal(): void {
    this.showSavedDuasModal.set(false);
  }
}
