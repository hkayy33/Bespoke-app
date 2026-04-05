import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuaReciever } from '../../../domain/models/dua-reciever';
import { DuaService } from '../../../domain/services/dua.service';
import { AuthService } from '../../../domain/services/auth.service';

@Component({
  selector: 'app-dua-result-card',
  imports: [CommonModule],
  templateUrl: './dua-result-card.html',
  styleUrl: './dua-result-card.scss',
})
export class DuaResultCard {
  private duaService = inject(DuaService);
  private authService = inject(AuthService);

  copied = false;
  showAimModal = signal(false);

  /** Set when this card is showing an item from the saved list (already persisted). */
  @Input() savedDuaId: string | null = null;

  @Input({ required: true }) dua!: DuaReciever;

  private savedIdAfterPost = signal<string | null>(null);

  isSaved(): boolean {
    return !!this.savedDuaId || !!this.savedIdAfterPost();
  }

  copyToClipboard(text: string): void {
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

  toggleSave(): void {
    if (!this.authService.user()) {
      this.authService.setShowAuthPage(true);
      return;
    }

    const user = this.authService.user()!;
    const persistedId = this.savedDuaId ?? this.savedIdAfterPost();

    if (persistedId) {
      this.duaService.deleteSavedDua(persistedId).subscribe(() => {
        if (!this.savedDuaId) {
          this.savedIdAfterPost.set(null);
        }
      });
      return;
    }

    const payload = JSON.stringify({
      duaText: this.dua.duaText,
      explanations: this.dua.explanations,
    });

    this.duaService.saveDua({ userId: user.userId, dua: payload }).subscribe((saved) => {
      if (saved?.duaId) {
        this.savedIdAfterPost.set(saved.duaId);
      }
    });
  }
}
