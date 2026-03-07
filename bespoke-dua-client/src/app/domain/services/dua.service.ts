// src/app/core/services/tutor.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class DuaService {
  constructor(private http: HttpClient) {}

  baseUrl = '/api/dua';
  

}
