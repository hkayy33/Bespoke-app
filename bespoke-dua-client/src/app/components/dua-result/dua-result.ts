import { Component } from '@angular/core';
import { DuaResultList } from './dua-result-list/dua-result-list';
import { DuaReciever } from '../../domain/models/dua-reciever';

@Component({
  standalone: true,
  selector: 'app-dua-result',
  imports: [DuaResultList],
  templateUrl: './dua-result.html',
  styleUrls: ['./dua-result.scss'],
})
export class DuaResult {

}
