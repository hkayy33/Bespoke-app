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

  @Input() dua!: DuaReciever 

}
