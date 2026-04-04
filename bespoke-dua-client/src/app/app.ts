import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NavBar } from './shared/nav-bar/nav-bar';
import { InputSection } from './components/input-section/input-section';
import { DuaResult } from './components/dua-result/dua-result';
import { AuthPage } from './components/auth-page/auth-page';
import { SavedDuasModal } from './components/saved-duas-modal/saved-duas-modal';
import { AuthService } from './domain/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HttpClientModule, NavBar, InputSection, DuaResult, AuthPage, SavedDuasModal],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('bespoke-dua-client');
  showSavedDuasModal = signal(false);

  constructor(public authService: AuthService) {}

  onMyDuaClicked() {
    if (this.authService.user()) {
      this.showSavedDuasModal.set(true);
    } else {
      this.authService.setShowAuthPage(true);
    }
  }

  onAuthClicked() {
    this.authService.setShowAuthPage(true);
  }

  closeSavedDuasModal() {
    this.showSavedDuasModal.set(false);
  }
}
