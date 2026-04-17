import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './shared/nav-bar/nav-bar';
import { AuthService } from './domain/services/auth.service';

/** Bump suffix (e.g. v2) when you want the modal to show again for everyone. */
const WHATS_NEW_STORAGE_KEY = 'bespoke-dua-whats-new-v1';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavBar, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('bespoke-dua-client');
  protected readonly showSavedDuasModal = signal(false);
  protected readonly showWhatsNewModal = signal(false);

  constructor(protected authService: AuthService) {
    if (typeof localStorage !== 'undefined' && !localStorage.getItem(WHATS_NEW_STORAGE_KEY)) {
      this.showWhatsNewModal.set(true);
    }
  }

  dismissWhatsNew(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(WHATS_NEW_STORAGE_KEY, '1');
    }
    this.showWhatsNewModal.set(false);
  }

  onMyDuaClicked(): void {
    if (!this.authService.user()) {
      this.authService.setShowAuthPage(true);
      return;
    }
    this.showSavedDuasModal.set(true);
  }

  closeSavedDuasModal(): void {
    this.showSavedDuasModal.set(false);
  }
}
