import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';// import environment
import { map, tap, catchError, of } from 'rxjs';
import { DuaSender } from '../models/dua-sender';
import { DuaReciever } from '../models/dua-reciever';

@Injectable({ providedIn: 'root' })
export class DuaService {
  private baseUrl = environment.apiUrl; // use environment variable

  constructor(private http: HttpClient) {}

  private duasSignal = signal<DuaReciever[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  duas = computed(() => this.duasSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());

  generateDuas(inputtedDua: DuaSender) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<{ duas: Array<{ dua: string; name: string; explanation: string }> }>(
        `${this.baseUrl}/generate`,
        { text: inputtedDua.inputtedDuaText }
      )
      .pipe(
        map((res) =>
          res.duas.map(
            (d): DuaReciever => ({
              duaText: d.dua,
              name: d.name,
              explanation: d.explanation,
            })
          )
        ),
        tap((duas) => {
          this.duasSignal.set(duas);
          this.loadingSignal.set(false);
        }),
        catchError((err) => {
          this.loadingSignal.set(false);
          this.errorSignal.set(err?.error?.message || err?.message || 'Failed to generate duas');
          return of([]);
        })
      );
  }
}