import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tryProgressiveDeepLinkThenWeb } from '../../core/progressive-deep-link';
import { AuthService } from '../../domain/services/auth.service';

/**
 * SPA fallback when `/auth/callback` is served by the Angular app instead of static HTML.
 * Prefer `public/auth/callback.html` (fast path for progressive deep linking).
 */
@Component({
  standalone: true,
  selector: 'app-auth-callback',
  template: `
    <main class="auth-callback">
      <p>Opening the app… If nothing happens, you’ll continue in your browser shortly.</p>
    </main>
  `,
  styles: [
    `
      .auth-callback {
        min-height: 60vh;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 1.5rem;
        opacity: 0.85;
      }
    `,
  ],
})
export class AuthCallbackPage implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Establish the web session immediately; don't wait for the deep-link fallback timer.
    this.completeWebAuth();
    tryProgressiveDeepLinkThenWeb(() => undefined);
  }

  private completeWebAuth(): void {
    this.authService.handleAuthRedirect().subscribe(() => {
      void this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }
}
