import { Component } from '@angular/core';
import { DuaResultCard } from '../dua-result-card/dua-result-card';
import { DuaReciever } from '../../../domain/models/dua-reciever';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dua-result-list',
  imports: [DuaResultCard, CommonModule],
  templateUrl: './dua-result-list.html',
  styleUrl: './dua-result-list.scss',
})
export class DuaResultList {
  duas : DuaReciever[] = [];

  ngOnInit() : void{
      this.duas = [
        {
        duaText : "Ya Razzaq, grant me abundant halal provision and bless my wealth",
        explanation : "Ya Razzaq means..."
        },
        {
        duaText : "Ya Wahhab, bless me with proviosion and open doors of oppportunity for me",
        explanation : "Ya Wahhab means..."
        },
        {
        duaText : "Ya Mughni, enrich me from your bounty and remove my financial difficulties",
        explanation : "Ya Mughni means..."
        }
    ]

  }


  
}
