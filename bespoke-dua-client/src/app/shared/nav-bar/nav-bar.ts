import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../domain/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-nav-bar',
  imports: [CommonModule],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.scss'],
})
export class NavBar {
  dropdownOpen = signal(false);
  @Output() myDuaClicked = new EventEmitter<void>();
  @Output() authClicked = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  toggleDropdown() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  logout() {
    this.authService.logout();
    this.dropdownOpen.set(false);
  }

  handleMyDuaClick() {
    this.myDuaClicked.emit();
  }

  showAuthPage() {
    this.authClicked.emit();
  }
}
