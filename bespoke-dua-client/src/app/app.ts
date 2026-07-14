import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './shared/nav-bar/nav-bar';
import { Footer } from './shared/footer/footer';
import { AuthService } from './domain/services/auth.service';
import { isSupabaseConfigured } from './core/supabase.client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NavBar, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('bespoke-dua-client');

  constructor(protected authService: AuthService) {}

  ngOnInit(): void {
    if (isSupabaseConfigured()) {
      const onCallbackRoute =
        typeof window !== 'undefined' && window.location.pathname.endsWith('/auth/callback');
      if (!onCallbackRoute) {
        this.authService.handleAuthRedirect().subscribe();
      }
      return;
    }

    if (this.authService.user()) {
      this.authService.validateStoredSession().subscribe();
    }
  }
}
