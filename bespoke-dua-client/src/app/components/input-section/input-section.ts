import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DuaService } from '../../domain/services/dua.service';
import { AuthService } from '../../domain/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-input-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-section.html',
  styleUrls: ['./input-section.scss'],
})
export class InputSection {
  constructor(protected duaService: DuaService, private authService: AuthService) {}
  text = '';
  showAimModal = signal(false);
  emptyInputMessage = false;

  submitDua(value: string) {
    if (!this.authService.user()) {
      this.authService.setShowAuthPage(true);
      return;
    }

    const trimmed = value?.trim();

    if (!trimmed) {
      this.emptyInputMessage = true;
      return;
    }

    this.emptyInputMessage = false;

    this.duaService.clearDuas();

    const user = this.authService.user()!;
    this.duaService.generateDuas({ inputtedDuaText: trimmed, userId: user.userId })
      .subscribe(() => {
        this.text = '';
      });
  }
}
