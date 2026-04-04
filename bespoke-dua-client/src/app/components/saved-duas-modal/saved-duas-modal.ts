import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuaResultCard } from '../dua-result/dua-result-card/dua-result-card';
import { DuaService } from '../../domain/services/dua.service';
import { AuthService } from '../../domain/services/auth.service';
import { DuaReciever } from '../../domain/models/dua-reciever';

@Component({
  standalone: true,
  selector: 'app-saved-duas-modal',
  imports: [CommonModule, DuaResultCard],
  templateUrl: './saved-duas-modal.html',
  styleUrls: ['./saved-duas-modal.scss'],
})
export class SavedDuasModal implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  constructor(
    public duaService: DuaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadSavedDuas();
  }

  ngOnDestroy() {
    this.duaService.clearSavedDuas();
  }

  loadSavedDuas() {
    const user = this.authService.user();
    if (user) {
      this.duaService.getSavedDuas(user.userId).subscribe();
    }
  }

  parseDua(duaJson: string): DuaReciever {
    try {
      return JSON.parse(duaJson);
    } catch {
      return {
        duaText: duaJson,
        explanations: []
      };
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  closeModal() {
    this.close.emit();
  }
}