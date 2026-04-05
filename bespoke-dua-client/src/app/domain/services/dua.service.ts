import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError, of } from 'rxjs';
import { DuaSender } from '../models/dua-sender';
import { DuaReciever } from '../models/dua-reciever';
import { SavedDua, CreateSavedDua } from '../models/saved-dua.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DuaService {
  private baseUrl = environment.duaUrl;
  private savedDuasUrl = `${environment.apiUrl}/SavedDuas`;

  constructor(private http: HttpClient) {}

  private duasSignal = signal<DuaReciever[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private savedDuasSignal = signal<SavedDua[]>([]);
  private savedDuasLoadingSignal = signal(false);

  duas = computed(() => this.duasSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  savedDuas = computed(() => this.savedDuasSignal());
  savedDuasLoading = computed(() => this.savedDuasLoadingSignal());

  clearDuas() {
    this.duasSignal.set([]);
    this.errorSignal.set(null);
  }

  generateDuas(inputtedDua: DuaSender) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http
      .post<{
        duas: Array<{
          dua: string;
          explanations: Array<{ name: string; explanation: string }>;
        }>;
      }>(`${this.baseUrl}/generate`, {
        text: inputtedDua.inputtedDuaText,
        ...(inputtedDua.userId != null ? { userId: inputtedDua.userId } : {}),
      })
      .pipe(
          map((res) =>
          res.duas.map(
            (d): DuaReciever => ({
              duaText: d.dua,
              explanations: d.explanations ?? [],
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

  // Saved Duas methods
  getSavedDuas(userId: number) {
    this.savedDuasLoadingSignal.set(true);
    return this.http.get<SavedDua[]>(`${this.savedDuasUrl}/user/${userId}`).pipe(
      tap((savedDuas) => {
        // Sort by createdAt descending (latest first)
        const sorted = savedDuas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.savedDuasSignal.set(sorted);
        this.savedDuasLoadingSignal.set(false);
      }),
      catchError((err) => {
        this.savedDuasLoadingSignal.set(false);
        console.error('Failed to load saved duas:', err);
        return of([]);
      })
    );
  }

  saveDua(createDto: CreateSavedDua) {
    return this.http.post<SavedDua>(this.savedDuasUrl, createDto).pipe(
      tap((savedDua) => {
        // Add to the beginning of the list
        const current = this.savedDuasSignal();
        this.savedDuasSignal.set([savedDua, ...current]);
      }),
      catchError((err) => {
        console.error('Failed to save dua:', err);
        return of(null);
      })
    );
  }

  deleteSavedDua(duaId: string) {
    return this.http.delete(`${this.savedDuasUrl}/${duaId}`).pipe(
      tap(() => {
        // Remove from the list
        const current = this.savedDuasSignal();
        const filtered = current.filter(d => d.duaId !== duaId);
        this.savedDuasSignal.set(filtered);
      }),
      catchError((err) => {
        console.error('Failed to delete saved dua:', err);
        return of(null);
      })
    );
  }

  clearSavedDuas() {
    this.savedDuasSignal.set([]);
  }
}