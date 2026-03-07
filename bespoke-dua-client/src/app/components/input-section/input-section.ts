import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-section',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-section.html',
  styleUrl: './input-section.scss',
})
export class InputSection {
  input = '';

  submitDua(value : string){
    this.input = value;
    console.log(this.input);
    this.input = '';
  }

}
