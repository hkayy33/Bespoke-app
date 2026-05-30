import { supabaseConfig } from './supabase-config';

/**
 * Local development: use same-origin `/api` so `ng serve` can proxy to the .NET API
 * (see `proxy.conf.json` — matches API PORT default http://localhost:8080).
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  duaUrl: '/api/Dua',
  /** Supabase email confirmation redirect (must match Authentication → Redirect URLs). */
  authRedirectUrl: 'http://localhost:4200/auth/callback',
  /** iOS custom URL scheme for progressive deep linking after email verification. */
  iosAuthRedirectUrl: 'myapp://auth/callback',
  ...supabaseConfig,
};
