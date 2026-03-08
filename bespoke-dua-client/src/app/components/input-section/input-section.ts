import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DuaService } from '../../domain/services/dua.service';

@Component({
  selector: 'app-input-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-section.html',
  styleUrl: './input-section.scss',
})
export class InputSection {
  constructor(protected duaService: DuaService) {}
  text = '';
  showAimModal = signal(false);

  submitDua(value: string) {
    const trimmed = value?.trim();
    if (!trimmed) return;

    this.duaService.generateDuas({ inputtedDuaText: trimmed }).subscribe(() => {
      this.text = '';
    });
  }
}
