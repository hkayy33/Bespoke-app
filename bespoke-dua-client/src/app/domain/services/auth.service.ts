import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser, LoginRequest, RegisterRequest, LoginResponse } from '../models/auth.models';

const STORAGE_KEY = 'bespoke-dua-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<AuthUser | null>(this.loadStoredUser());
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private showAuthPageSignal = signal(false);
  private showPlanModalSignal = signal(false);

  user = computed(() => this.userSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  showAuthPage = computed(() => this.showAuthPageSignal());
  showPlanModal = computed(() => this.showPlanModalSignal());

  private authUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  private loadStoredUser(): AuthUser | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }

  private saveStoredUser(user: AuthUser | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  login(dto: LoginRequest) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<LoginResponse>(`${this.authUrl}/login`, dto).pipe(
      map((response) => response.user),
      tap((user) => {
        if (user) {
          this.userSignal.set(user);
          this.saveStoredUser(user);
          this.showAuthPageSignal.set(false);
        }
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || error?.message || 'Login failed.');
        return of(null);
      })
    );
  }

  register(dto: RegisterRequest) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AuthUser>(`${this.authUrl}/register`, dto).pipe(
      tap((user) => {
        if (user) {
          this.userSignal.set(user);
          this.saveStoredUser(user);
          this.showAuthPageSignal.set(false);
        }
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || error?.message || 'Registration failed.');
        return of(null);
      })
    );
  }

  logout() {
    this.userSignal.set(null);
    this.saveStoredUser(null);
    this.showAuthPageSignal.set(false);
  }

  setShowAuthPage(show: boolean) {
    this.showAuthPageSignal.set(show);
  }

  setShowPlanModal(show: boolean): void {
    this.showPlanModalSignal.set(show);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  deleteAccount() {
    const user = this.userSignal();
    if (!user) {
      return of(false);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${user.userId}`,
    });

    return this.http.delete<void>(`${this.authUrl}/account`, { headers }).pipe(
      map(() => true),
      tap(() => {
        this.logout();
      }),
      catchError((error) => {
        this.errorSignal.set(error?.error?.message || error?.message || 'Failed to delete account.');
        return of(false);
      })
    );
  }
}
