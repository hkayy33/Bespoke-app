import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NavBar } from './shared/nav-bar/nav-bar';
import { InputSection } from './components/input-section/input-section';
import { DuaResult } from './components/dua-result/dua-result';
import { AuthPage } from './components/auth-page/auth-page';
import { AuthService } from './domain/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HttpClientModule, NavBar, InputSection, DuaResult, AuthPage],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = signal('bespoke-dua-client');

  constructor(public authService: AuthService) {}

  onMyDuaClicked() {
    if (this.authService.user()) {
      // Scroll to input section
      document.getElementById('input-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.authService.setShowAuthPage(true);
    }
  }

  onAuthClicked() {
    this.authService.setShowAuthPage(true);
  }
}
