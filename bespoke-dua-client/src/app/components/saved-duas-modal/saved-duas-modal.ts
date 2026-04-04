import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuaService } from '../../domain/services/dua.service';
import { AuthService } from '../../domain/services/auth.service';
import { DuaResultCard } from '../dua-result/dua-result-card/dua-result-card';
import { DuaReciever } from '../../domain/models/dua-reciever';

@Component({
  standalone: true,
  selector: 'app-saved-duas-modal',
  imports: [CommonModule, DuaResultCard],
  templateUrl: './saved-duas-modal.html',
  styleUrl: './saved-duas-modal.scss',
})
export class SavedDuasModal implements OnInit {
  @Output() close = new EventEmitter<void>();

  protected duaService = inject(DuaService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const user = this.authService.user();
    if (user) {
      this.duaService.getSavedDuas(user.userId).subscribe();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  parseDua(json: string): DuaReciever {
    try {
      return JSON.parse(json) as DuaReciever;
    } catch {
      return { duaText: json, explanations: [] };
    }
  }
}
