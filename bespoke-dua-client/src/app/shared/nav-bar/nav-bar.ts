import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../domain/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterLink],
  templateUrl: './nav-bar.html',
  styleUrls: ['./nav-bar.scss'],
})
export class NavBar {
  @Output() myDuaClicked = new EventEmitter<void>();
  @Output() authClicked = new EventEmitter<void>();
  @Output() accountClicked = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  toggleDropdown() {
    this.accountClicked.emit();
  }

  handleMyDuaClick() {
    this.myDuaClicked.emit();
  }

  showAuthPage() {
    this.authClicked.emit();
  }
}
