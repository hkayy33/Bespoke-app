import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DuaReciever } from '../../../domain/models/dua-reciever';

@Component({
  standalone: true,
  selector: 'app-dua-result-card',
  imports: [CommonModule],
  templateUrl: './dua-result-card.html',
  styleUrls: ['./dua-result-card.scss'],
})
export class DuaResultCard {
  copied = false;
  showAimModal = signal(false);

  @Input() dua!: DuaReciever;

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
}
