import { Component } from '@angular/core';
import { DuaResultCard } from '../dua-result-card/dua-result-card';
import { DuaService } from '../../../domain/services/dua.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-dua-result-list',
  imports: [DuaResultCard, CommonModule],
  templateUrl: './dua-result-list.html',
  styleUrls: ['./dua-result-list.scss'],
})
export class DuaResultList {
  constructor(protected duaService: DuaService) {}

  // ngOnInit(): void{
  //   this.duas=[{
  //     duaText: 'testing',
  //     name: 'testtest',
  //     explanation:'helo'
  //   }]
  // }

  clearList(): void {
    this.duaService.clearDuas();
  }
}
