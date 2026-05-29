import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthError } from '@supabase/supabase-js';
import { catchError, from, map, Observable, of, switchMap, tap } from 'rxjs';
import { getSupabaseClient, isSupabaseConfigured } from '../../core/supabase.client';
import { environment } from '../../../environments/environment';
import {
  AuthMode,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '../models/auth.models';

const STORAGE_KEY = 'bespoke-dua-user';
const AUTH_MODE_KEY = 'bespoke-auth-mode';
const PENDING_USERNAME_KEY = 'bespoke-pending-username';
const PENDING_EMAIL_KEY = 'bespoke-pending-verification-email';

export type RegisterResult =
  | { status: 'signed_in'; user: AuthUser }
  | { status: 'awaiting_verification'; email: string }
  | { status: 'failed' };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<AuthUser | null>(this.loadStoredUser());
  private authModeSignal = signal<AuthMode | null>(this.loadAuthMode());
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);
  private showAuthPageSignal = signal(false);
  private showPlanModalSignal = signal(false);
  private pendingVerificationEmailSignal = signal<string | null>(this.loadPendingVerificationEmail());

  user = computed(() => this.userSignal());
  awaitingEmailVerification = computed(() => this.pendingVerificationEmailSignal() !== null);
  pendingVerificationEmail = computed(() => this.pendingVerificationEmailSignal());
  loading = computed(() => this.loadingSignal());
  error = computed(() => this.errorSignal());
  showAuthPage = computed(() => this.showAuthPageSignal());
  showPlanModal = computed(() => this.showPlanModalSignal());

  private authUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {
    if (!isSupabaseConfigured()) {
      return;
    }

    getSupabaseClient().auth.onAuthStateChange((event, session) => {
      if (this.authModeSignal() === 'legacy') {
        return;
      }

      if (
        (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
        session?.user?.email_confirmed_at
      ) {
        void this.completeSupabaseSignIn();
      }

      if (event === 'SIGNED_OUT') {
        this.userSignal.set(null);
        this.saveStoredUser(null);
        this.setAuthMode(null);
      }
    });
  }

  /** Call on app load and after email verification redirect (hash tokens in URL). */
  handleAuthRedirect(): Observable<AuthUser | null> {
    if (!isSupabaseConfigured()) {
      return of(null);
    }

    return from(getSupabaseClient().auth.getSession()).pipe(
      switchMap(({ data }) => {
        if (!data.session?.user?.email_confirmed_at) {
          return of(null);
        }

        return from(this.completeSupabaseSignIn());
      })
    );
  }

  async getAccessToken(): Promise<string | null> {
    const mode = this.resolveAuthMode();
    if (mode === 'legacy') {
      const user = this.userSignal();
      return user ? String(user.userId) : null;
    }

    if (!isSupabaseConfigured()) {
      return null;
    }

    const { data } = await getSupabaseClient().auth.getSession();
    return data.session?.access_token ?? null;
  }

  login(dto: LoginRequest) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    if (!isSupabaseConfigured()) {
      return this.legacyLogin(dto);
    }

    return from(
      getSupabaseClient().auth.signInWithPassword({
        email: dto.email,
        password: dto.password,
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (!error && data.user) {
          if (!data.user.email_confirmed_at) {
            void getSupabaseClient().auth.signOut();
            return this.fail(
              'Please verify your email before signing in. Check your inbox for the confirmation link.'
            );
          }

          this.setAuthMode('supabase');
          return this.syncAppProfile().pipe(map((user) => user));
        }

        if (error && this.shouldTryLegacyLogin(error)) {
          return this.legacyLogin(dto);
        }

        return this.fail(this.mapAuthError(error!));
      }),
      catchError((error: unknown) =>
        this.fail(error instanceof Error ? error.message : 'Login failed.')
      )
    );
  }

  register(dto: RegisterRequest): Observable<RegisterResult> {
    if (!isSupabaseConfigured()) {
      return this.legacyRegister(dto);
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    localStorage.setItem(PENDING_USERNAME_KEY, dto.username.trim());

    const email = dto.email.trim();

    return from(
      getSupabaseClient().auth.signUp({
        email,
        password: dto.password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          return this.failRegister(this.mapAuthError(error));
        }

        if (data.session && data.user?.email_confirmed_at) {
          this.setAuthMode('supabase');
          return this.syncAppProfile().pipe(
            map((user) =>
              user ? { status: 'signed_in' as const, user } : { status: 'failed' as const }
            )
          );
        }

        this.enterEmailVerificationStage(email);
        this.loadingSignal.set(false);
        return of({ status: 'awaiting_verification' as const, email });
      }),
      catchError((error: unknown) =>
        this.failRegister(error instanceof Error ? error.message : 'Registration failed.')
      )
    );
  }

  resendVerificationEmail(): Observable<boolean> {
    const email = this.pendingVerificationEmailSignal();
    if (!email || !isSupabaseConfigured()) {
      return of(false);
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return from(
      getSupabaseClient().auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      })
    ).pipe(
      map(() => true),
      tap(() => this.loadingSignal.set(false)),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.message || 'Could not resend verification email.');
        return of(false);
      })
    );
  }

  clearEmailVerificationStage(): void {
    this.pendingVerificationEmailSignal.set(null);
    localStorage.removeItem(PENDING_EMAIL_KEY);
  }

  logout() {
    const mode = this.resolveAuthMode();
    const clear = () => {
      this.userSignal.set(null);
      this.saveStoredUser(null);
      this.setAuthMode(null);
      this.showAuthPageSignal.set(false);
    };

    if (mode === 'supabase' && isSupabaseConfigured()) {
      return from(getSupabaseClient().auth.signOut()).pipe(tap(clear), map(() => undefined));
    }

    return of(undefined).pipe(tap(clear));
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

  validateStoredSession() {
    const mode = this.resolveAuthMode();

    if (mode === 'legacy') {
      if (!this.userSignal()) {
        return of(false);
      }

      return this.http.get<AuthUser>(`${this.authUrl}/me`).pipe(
        tap((freshUser) => {
          this.userSignal.set(freshUser);
          this.saveStoredUser(freshUser);
        }),
        map(() => true),
        catchError(() => {
          this.clearLocalSession();
          return of(false);
        })
      );
    }

    if (!isSupabaseConfigured()) {
      this.clearLocalSession();
      return of(false);
    }

    return from(getSupabaseClient().auth.getSession()).pipe(
      switchMap(({ data }) => {
        if (!data.session?.user?.email_confirmed_at) {
          this.clearLocalSession();
          return of(false);
        }

        this.setAuthMode('supabase');

        return this.http.get<AuthUser>(`${this.authUrl}/me`).pipe(
          tap((freshUser) => {
            this.userSignal.set(freshUser);
            this.saveStoredUser(freshUser);
          }),
          map(() => true),
          catchError(() =>
            this.syncAppProfile({ signOutOnFailure: false }).pipe(
              map((user) => !!user),
              catchError(() => {
                this.clearLocalSession();
                return of(false);
              })
            )
          )
        );
      })
    );
  }

  deleteAccount() {
    if (!this.userSignal()) {
      return of(false);
    }

    return this.http.delete<void>(`${this.authUrl}/account`).pipe(
      switchMap(() => this.logout()),
      map(() => true),
      catchError((error) => {
        this.errorSignal.set(error?.error?.message || error?.message || 'Failed to delete account.');
        return of(false);
      })
    );
  }

  private enterEmailVerificationStage(email: string): void {
    this.pendingVerificationEmailSignal.set(email);
    localStorage.setItem(PENDING_EMAIL_KEY, email);
  }

  private legacyRegister(dto: RegisterRequest): Observable<RegisterResult> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AuthUser>(`${this.authUrl}/register`, dto).pipe(
      map((user) => {
        if (user) {
          this.setAuthMode('legacy');
          this.userSignal.set(user);
          this.saveStoredUser(user);
          this.showAuthPageSignal.set(false);
          return { status: 'signed_in' as const, user };
        }
        return { status: 'failed' as const };
      }),
      tap(() => this.loadingSignal.set(false)),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || error?.message || 'Registration failed.');
        return of({ status: 'failed' as const });
      })
    );
  }

  private legacyLogin(dto: LoginRequest): Observable<AuthUser | null> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, dto).pipe(
      map((response) => response.user),
      tap((user) => {
        if (user) {
          this.setAuthMode('legacy');
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

  private async completeSupabaseSignIn(): Promise<AuthUser | null> {
    this.setAuthMode('supabase');
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const user = await new Promise<AuthUser | null>((resolve) => {
      this.syncAppProfile({ signOutOnFailure: false }).subscribe((result) => resolve(result));
    });

    if (user) {
      this.clearEmailVerificationStage();
      this.showAuthPageSignal.set(false);
    }

    return user;
  }

  private syncAppProfile(options?: { signOutOnFailure?: boolean }): Observable<AuthUser | null> {
    const signOutOnFailure = options?.signOutOnFailure ?? true;
    const username = localStorage.getItem(PENDING_USERNAME_KEY) ?? undefined;

    return this.http.post<AuthUser>(`${this.authUrl}/sync`, { username }).pipe(
      tap((user) => {
        if (user) {
          localStorage.removeItem(PENDING_USERNAME_KEY);
          this.clearEmailVerificationStage();
          this.userSignal.set(user);
          this.saveStoredUser(user);
          this.showAuthPageSignal.set(false);
        }
        this.loadingSignal.set(false);
      }),
      catchError((error) => {
        this.loadingSignal.set(false);
        this.errorSignal.set(error?.error?.message || error?.message || 'Failed to sync profile.');
        if (signOutOnFailure && isSupabaseConfigured()) {
          void getSupabaseClient().auth.signOut();
        }
        return of(null);
      })
    );
  }

  private shouldTryLegacyLogin(error: AuthError): boolean {
    const message = (error.message ?? '').toLowerCase();
    if (message.includes('email not confirmed')) {
      return false;
    }

    return (
      message.includes('invalid login credentials') ||
      message.includes('invalid email or password') ||
      message.includes('user not found')
    );
  }

  private resolveAuthMode(): AuthMode | null {
    const mode = this.authModeSignal();
    if (mode) {
      return mode;
    }

    if (this.userSignal()) {
      return 'legacy';
    }

    return null;
  }

  private fail(message: string): Observable<null> {
    this.loadingSignal.set(false);
    this.errorSignal.set(message);
    return of(null);
  }

  private failRegister(message: string): Observable<RegisterResult> {
    this.loadingSignal.set(false);
    this.errorSignal.set(message);
    return of({ status: 'failed' });
  }

  private loadPendingVerificationEmail(): string | null {
    return localStorage.getItem(PENDING_EMAIL_KEY);
  }

  private mapAuthError(error: AuthError): string {
    const message = error.message ?? 'Authentication failed.';
    if (message.toLowerCase().includes('email not confirmed')) {
      return 'Please verify your email before signing in. Check your inbox for the confirmation link.';
    }
    return message;
  }

  private clearLocalSession() {
    this.userSignal.set(null);
    this.saveStoredUser(null);
    this.setAuthMode(null);
    if (isSupabaseConfigured()) {
      void getSupabaseClient().auth.signOut();
    }
  }

  private setAuthMode(mode: AuthMode | null) {
    this.authModeSignal.set(mode);
    if (mode) {
      localStorage.setItem(AUTH_MODE_KEY, mode);
    } else {
      localStorage.removeItem(AUTH_MODE_KEY);
    }
  }

  private loadAuthMode(): AuthMode | null {
    const stored = localStorage.getItem(AUTH_MODE_KEY);
    if (stored === 'legacy' || stored === 'supabase') {
      return stored;
    }

    return this.loadStoredUser() ? 'legacy' : null;
  }

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
}
