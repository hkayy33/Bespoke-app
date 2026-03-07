import { Component, Input, input } from '@angular/core';
import { DuaReciever } from '../../../domain/models/dua-reciever';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dua-result-card',
  imports: [CommonModule],
  templateUrl: './dua-result-card.html',
  styleUrl: './dua-result-card.scss',
})
export class DuaResultCard {
  infoButtonSelected = false;
  copied = false;

  @Input() dua!: DuaReciever 

copyToClipboard(text: string) {
  // Immediately update the UI
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
