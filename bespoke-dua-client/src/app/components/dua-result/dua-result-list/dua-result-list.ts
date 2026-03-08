import { Component } from '@angular/core';
import { DuaResultCard } from '../dua-result-card/dua-result-card';
import { DuaService } from '../../../domain/services/dua.service';
import { CommonModule } from '@angular/common';
import { DuaReciever } from '../../../domain/models/dua-reciever';

@Component({
  selector: 'app-dua-result-list',
  imports: [DuaResultCard, CommonModule],
  templateUrl: './dua-result-list.html',
  styleUrl: './dua-result-list.scss',
})
export class DuaResultList {
  // duas : DuaReciever[] = []
  constructor(protected duaService: DuaService) {}

  // ngOnInit(): void{
  //   this.duas=[{
  //     duaText: 'testing',
  //     name: 'testtest',
  //     explanation:'helo'
  //   }]
  // }
}
