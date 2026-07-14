import { supabaseConfig } from './supabase-config';

/**
 * Local development: use same-origin `/api` so `ng serve` can proxy to the .NET API
 * (see `proxy.conf.json` — matches API PORT default http://localhost:8080).
 */
export const environment = {
  production: false,
  apiUrl: '/api',
  duaUrl: '/api/Dua',
  /** App Store product URL from App Store Connect → Marketing. */
  appStoreUrl: 'https://apps.apple.com/gb/app/bespokedua/id6761731591',
  /** Supabase email confirmation redirect (must match Authentication → Redirect URLs). */
  authRedirectUrl: 'http://localhost:4200/auth/callback',
  /** iOS custom URL scheme for progressive deep linking after email verification. */
  iosAuthRedirectUrl: 'myapp://auth/callback',
  ...supabaseConfig,
};
