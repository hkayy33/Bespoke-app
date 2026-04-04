import { Component, Input, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuaReciever } from '../../../domain/models/dua-reciever';
import { AuthService } from '../../../domain/services/auth.service';
import { DuaService } from '../../../domain/services/dua.service';

@Component({
  standalone: true,
  selector: 'app-dua-result-card',
  imports: [CommonModule],
  templateUrl: './dua-result-card.html',
  styleUrls: ['./dua-result-card.scss'],
})
export class DuaResultCard implements OnInit {
  copied = false;
  showAimModal = signal(false);
  isSaved = signal(false);
  saving = signal(false);

  @Input() dua!: DuaReciever;
  @Input() savedDuaId?: string;

  constructor(
    private authService: AuthService,
    private duaService: DuaService
  ) {}

  ngOnInit() {
    // If savedDuaId is provided, this dua is already saved
    if (this.savedDuaId) {
      this.isSaved.set(true);
    }
  }

  isLoggedIn = computed(() => !!this.authService.user());

  copyToClipboard(text: string) {
    this.copied = true;
    setTimeout(() => {
      this.copied = false;
    }, 1500);

    try {
      navigator.clipboard?.writeText(text);
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  }

  toggleSave() {
    if (!this.isLoggedIn()) {
      this.authService.setShowAuthPage(true);
      return;
    }

    if (this.saving()) return;

    this.saving.set(true);

    if (this.isSaved()) {
      // Unsave
      if (this.savedDuaId) {
        this.duaService.deleteSavedDua(this.savedDuaId).subscribe({
          next: () => {
            this.isSaved.set(false);
            this.saving.set(false);
          },
          error: () => {
            this.saving.set(false);
          }
        });
      }
    } else {
      // Save
      const user = this.authService.user();
      if (user) {
        this.duaService.saveDua({
          userId: user.userId,
          dua: JSON.stringify(this.dua)
        }).subscribe({
          next: (savedDua) => {
            if (savedDua) {
              this.isSaved.set(true);
              this.savedDuaId = savedDua.duaId;
            }
            this.saving.set(false);
          },
          error: () => {
            this.saving.set(false);
          }
        });
      }
    }
  }
}
